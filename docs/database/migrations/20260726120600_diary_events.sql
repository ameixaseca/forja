-- =============================================================================
-- FORJA — diary_events (event store; núcleo do sistema)
-- =============================================================================
-- Log append-only do diário. O estado da ficha (atributos, Fôlego, Vontade)
-- é sempre uma projeção recalculada a partir destes eventos pelo pacote
-- `dominio` — esta tabela nunca é reescrita, só cresce (ADR-0002).
--
-- `id` é bigint identity: dá a ordem canônica de replay por inserção no
-- servidor. `ocorrido_em` é o horário declarado pelo cliente e é o que as
-- regras de negócio (ciclo, ciclo quebrado, RF-033) efetivamente usam —
-- os dois têm propósitos diferentes e não devem ser confundidos.

create table public.diary_events (
  id                    bigint generated always as identity primary key,
  campaign_instance_id  uuid not null references public.campaign_instances (id) on delete cascade,

  -- Desnormalizado deliberadamente: evita join dentro da política de RLS
  -- (uma política com join em tabela grande degrada performance de leitura
  -- e de INSERT em volume — ver ADR-0012). Validado contra o dono real da
  -- campaign_instance pela trigger abaixo.
  user_id               uuid not null references auth.users (id) on delete cascade,

  -- Tipo do evento (ex.: 'juramento_declarado', 'sessao_registrada',
  -- 'resolucao_gerada', 'marco_declarado', 'tregua_declarada'...). Mantido
  -- como texto livre, sem enum: o contrato real é validado pelo schema Zod
  -- compartilhado (ADR-0009) na borda da aplicação, e um novo tipo de evento
  -- de jogo não deveria depender de uma migração de schema no banco.
  tipo                  text not null,

  payload               jsonb not null,

  -- Sinaliza que campos sensíveis dentro do payload (ex.: notas livres,
  -- RF-011) já chegaram cifrados no nível de campo pelo cliente, reforçando
  -- a criptografia de disco do provedor (ADR-0006).
  payload_cifrado       boolean not null default false,

  device_id             text not null,
  idempotency_key       uuid not null,
  app_version           text not null,     -- RF-033: rastreabilidade de correções
  ocorrido_em           timestamptz not null,
  recebido_em           timestamptz not null default now(),

  constraint diary_events_idempotencia_unica
    unique (campaign_instance_id, idempotency_key)
);

comment on table public.diary_events is
  'Event store do diário. Append-only: sem política de UPDATE/DELETE para authenticated (ver abaixo).';
comment on column public.diary_events.id is
  'Ordem canônica de replay (ordem de chegada no servidor). Não confundir com ocorrido_em, usado nas regras de negócio de ciclo.';

-- Replay ordenado por campanha.
create index idx_diary_events_campanha_ordem
  on public.diary_events (campaign_instance_id, id);

-- Suporte direto à política de RLS (evita seq scan em tabela que só cresce).
create index idx_diary_events_user_id
  on public.diary_events (user_id);

-- Consultas e métricas por janela de tempo (§10 do PRD).
create index idx_diary_events_ocorrido_em
  on public.diary_events (ocorrido_em);

-- Suporte a filtros por tipo de evento sem varrer o payload inteiro.
create index idx_diary_events_tipo
  on public.diary_events (tipo);

-- -----------------------------------------------------------------------------
-- Integridade: campaign_instance_id precisa pertencer a user_id.
-- Redundante com a RLS por desenho — se algum dia um processo com privilégio
-- elevado (service_role) inserir diretamente, esta trigger ainda protege a
-- integridade referencial de posse.
-- -----------------------------------------------------------------------------
create or replace function public.tg_diary_events_valida_propriedade()
returns trigger
language plpgsql
as $$
begin
  if not exists (
    select 1
    from public.campaign_instances ci
    where ci.id = new.campaign_instance_id
      and ci.user_id = new.user_id
  ) then
    raise exception
      'campaign_instance_id % não pertence ao user_id %',
      new.campaign_instance_id, new.user_id;
  end if;
  return new;
end;
$$;

create trigger trg_diary_events_valida_propriedade
  before insert on public.diary_events
  for each row execute function public.tg_diary_events_valida_propriedade();

alter table public.diary_events enable row level security;

create policy "diary_events: usuário lê os próprios eventos"
  on public.diary_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "diary_events: usuário grava os próprios eventos"
  on public.diary_events for insert
  to authenticated
  with check (user_id = auth.uid());

-- Deliberadamente sem política de UPDATE nem DELETE para authenticated:
-- o log é imutável. Sem política = comando bloqueado por padrão no RLS,
-- mesmo que o papel tenha GRANT de tabela (reforçado em
-- 20260726121100_grants_defesa_em_profundidade.sql).
