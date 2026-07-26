-- =============================================================================
-- FORJA — consent_events (log de consentimento, append-only)
-- =============================================================================
-- RC-001 exige consentimento específico, destacado e granular por finalidade,
-- com registros separados para (a) processamento local e (b) backup em nuvem.
-- Modelado como log de eventos — nunca UPDATE — para servir como trilha de
-- auditoria de conformidade: o histórico de concessão/revogação é o próprio
-- ativo, não só o estado atual.

create table public.consent_events (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users (id) on delete cascade,
  tipo              consent_tipo not null,
  acao              consent_acao not null,
  politica_versao   text not null,
  ocorrido_em       timestamptz not null default now()
);

comment on table public.consent_events is
  'Log append-only de concessão/revogação de consentimento (RC-001). O estado atual é a view consentimento_atual.';

create index idx_consent_events_user_tipo
  on public.consent_events (user_id, tipo, ocorrido_em desc);

alter table public.consent_events enable row level security;

create policy "consent_events: usuário lê o próprio histórico"
  on public.consent_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "consent_events: usuário registra o próprio consentimento"
  on public.consent_events for insert
  to authenticated
  with check (user_id = auth.uid());

-- Sem política de update/delete: o log de consentimento é imutável por
-- desenho — revogar é inserir um novo evento com acao = 'revogado', nunca
-- apagar o que foi concedido no passado.

-- security_invoker garante que a view respeita a RLS de quem a consulta,
-- não do dono da view — requisito de PostgreSQL 15+ (padrão em projetos
-- Supabase recentes).
create view public.consentimento_atual
  with (security_invoker = on) as
select distinct on (user_id, tipo)
  user_id, tipo, acao, politica_versao, ocorrido_em
from public.consent_events
order by user_id, tipo, ocorrido_em desc;

comment on view public.consentimento_atual is
  'Conveniência: último evento de consentimento por (usuário, tipo), sem o cliente precisar fazer o distinct on sozinho.';
