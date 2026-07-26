-- =============================================================================
-- FORJA — entitlement_origens e entitlements
-- =============================================================================
-- RF-111 exige que `origem` seja extensível sem migração de dados existentes.
-- Um enum do Postgres cumpriria isso tecnicamente (ALTER TYPE ... ADD VALUE
-- não reescreve linhas), mas essa operação tem restrições de transação chatas
-- na prática. Uma tabela de referência resolve o mesmo requisito com um INSERT
-- simples e dá integridade referencial de verdade.

create table public.entitlement_origens (
  id          text primary key,
  descricao   text not null
);

insert into public.entitlement_origens (id, descricao) values
  ('app_store',    'Recibo validado via App Store Server API'),
  ('play_store',   'Recibo validado via Google Play Developer API'),
  ('stripe',       'Pagamento processado via Stripe (web)'),
  ('promocional',  'Concedido manualmente pelo autor, sem transação de loja');

alter table public.entitlement_origens enable row level security;

create policy "entitlement_origens: leitura pública para autenticados"
  on public.entitlement_origens for select
  to authenticated
  using (true);

-- -----------------------------------------------------------------------------
-- entitlements: direito de acesso, modelado conforme D-029/RF-110 como
-- {pacote, origem, validoAte?}.
-- -----------------------------------------------------------------------------
create table public.entitlements (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references auth.users (id) on delete cascade,
  pacote                text not null,                              -- SKU do pacote de campanha
  origem                text not null references public.entitlement_origens (id),
  status                entitlement_status not null default 'ativo',
  valido_ate            timestamptz,                                 -- nulo = perpétuo (RF-110)
  transacao_externa_id  text,                                        -- id do recibo/transação na loja/Stripe
  criado_em             timestamptz not null default now(),
  atualizado_em         timestamptz not null default now(),

  constraint entitlements_transacao_unica
    unique (origem, transacao_externa_id)
);

comment on table public.entitlements is
  'Direito de acesso {pacote, origem, validoAte} (D-029). Escrito apenas por processos com service_role, após validar o recibo junto à loja/Stripe (ADR-0005).';
comment on column public.entitlements.valido_ate is
  'Nulo = acesso perpétuo. Compra única no MVP (D-026); campo existe desde já para não exigir migração se assinatura for introduzida depois.';

create index idx_entitlements_user_id
  on public.entitlements (user_id);

create index idx_entitlements_pacote
  on public.entitlements (pacote);

create trigger trg_entitlements_atualizado_em
  before update on public.entitlements
  for each row execute function public.tg_set_atualizado_em();

alter table public.entitlements enable row level security;

create policy "entitlements: usuário lê os próprios direitos de acesso"
  on public.entitlements for select
  to authenticated
  using (user_id = auth.uid());

-- Sem política de insert/update/delete para authenticated: só o service_role
-- (usado pela API, após validar o recibo) pode conceder ou alterar
-- entitlement. Um cliente comprometido não pode se autoconceder um pacote
-- pago escrevendo direto na tabela — reforçado em
-- 20260726121100_grants_defesa_em_profundidade.sql.
