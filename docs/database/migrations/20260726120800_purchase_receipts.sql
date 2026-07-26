-- =============================================================================
-- FORJA — purchase_receipts (trilha de auditoria financeira)
-- =============================================================================
-- Guarda o recibo bruto de cada tentativa de compra, para auditoria e
-- reprocessamento. Tabela de acesso exclusivamente administrativo — nenhum
-- papel de cliente (authenticated/anon) tem qualquer política aqui.
--
-- user_id usa ON DELETE SET NULL, não CASCADE: registro de transação
-- financeira tem obrigação legal de retenção (LGPD art. 16, I — cumprimento
-- de obrigação legal ou regulatória) que precede o direito de exclusão
-- (RF-092) especificamente para esta categoria de dado. A exclusão de conta
-- apaga o vínculo identificável; o registro contábil permanece.

create table public.purchase_receipts (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users (id) on delete set null,
  origem                text not null references public.entitlement_origens (id),
  payload_bruto         jsonb not null,
  status_verificacao    receipt_verification_status not null default 'pendente',
  verificado_em         timestamptz,
  entitlement_id        uuid references public.entitlements (id),
  criado_em             timestamptz not null default now()
);

comment on table public.purchase_receipts is
  'Recibo bruto de compra, para auditoria/reprocessamento. Acesso só via service_role. user_id preservado como NULL após exclusão de conta por obrigação legal de retenção (LGPD art. 16, I).';

create index idx_purchase_receipts_user_id
  on public.purchase_receipts (user_id);

create index idx_purchase_receipts_entitlement_id
  on public.purchase_receipts (entitlement_id);

alter table public.purchase_receipts enable row level security;

-- Nenhuma política criada de propósito: RLS habilitada + zero políticas =
-- nenhuma linha visível ou gravável por authenticated/anon, em nenhum
-- comando. Só service_role (que ignora RLS por padrão no Postgres) acessa
-- esta tabela.
