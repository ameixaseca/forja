-- =============================================================================
-- FORJA — campaign_instances
-- =============================================================================
-- Uma instância por "partida" de campanha do usuário (RF-032 permite múltiplas
-- campanhas coexistindo com estado independente; um usuário também pode
-- reiniciar a mesma campanha, D-020, então NÃO há unicidade forçada em
-- (user_id, campanha_codinome)).

create table public.campaign_instances (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  campanha_codinome     text not null references public.campanhas (codinome),
  status                campaign_status not null default 'ativa',
  app_version_inicial   text not null,

  -- Cache opcional e não autoritativo da ficha corrente, recomputável a
  -- qualquer momento por replay de diary_events pelo pacote `dominio`
  -- (client-side, RF-035/036). Existe só para a UI evitar reprocessar todo o
  -- histórico a cada abertura de tela — ver ADR-0002.
  ultimo_snapshot       jsonb,
  ultimo_snapshot_seq   bigint,

  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now()
);

comment on table public.campaign_instances is
  'Uma linha por partida de campanha do usuário. Estado autoritativo vive em diary_events; ultimo_snapshot é cache.';
comment on column public.campaign_instances.ultimo_snapshot is
  'Cache não autoritativo da ficha. Nunca usar como fonte de verdade — sempre recomputável via replay (ADR-0002).';

create index idx_campaign_instances_user_id
  on public.campaign_instances (user_id);

create index idx_campaign_instances_status
  on public.campaign_instances (status)
  where status = 'ativa';

create trigger trg_campaign_instances_atualizado_em
  before update on public.campaign_instances
  for each row execute function public.tg_set_atualizado_em();

alter table public.campaign_instances enable row level security;

create policy "campaign_instances: usuário lê as próprias instâncias"
  on public.campaign_instances for select
  to authenticated
  using (user_id = auth.uid());

create policy "campaign_instances: usuário cria a própria instância"
  on public.campaign_instances for insert
  to authenticated
  with check (user_id = auth.uid());

create policy "campaign_instances: usuário atualiza a própria instância"
  on public.campaign_instances for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
