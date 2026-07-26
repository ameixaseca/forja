-- =============================================================================
-- FORJA — deletion_requests (direito de exclusão, RF-092) + expurgo agendado
-- =============================================================================
-- user_id é armazenado SEM foreign key para auth.users, de propósito: este
-- registro precisa sobreviver à exclusão da própria conta, como prova de
-- que a solicitação foi atendida dentro do prazo (conformidade). Uma FK com
-- CASCADE apagaria a prova de conformidade junto com a conta; uma FK sem
-- CASCADE bloquearia a exclusão da conta por violação de integridade.

create table public.deletion_requests (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null,
  solicitado_em             timestamptz not null default now(),
  expurgo_agendado_para     timestamptz not null default (now() + interval '15 days'),
  status                    deletion_status not null default 'pendente',
  concluido_em              timestamptz
);

comment on table public.deletion_requests is
  'Solicitação de exclusão definitiva de conta e dados (RF-092, prazo de 15 dias). user_id sem FK: o registro deve sobreviver à exclusão da conta como prova de conformidade.';

-- Impede duas solicitações pendentes simultâneas do mesmo usuário.
create unique index idx_deletion_requests_uma_pendente
  on public.deletion_requests (user_id)
  where status = 'pendente';

create index idx_deletion_requests_expurgo_agendado
  on public.deletion_requests (expurgo_agendado_para)
  where status = 'pendente';

alter table public.deletion_requests enable row level security;

create policy "deletion_requests: usuário lê as próprias solicitações"
  on public.deletion_requests for select
  to authenticated
  using (user_id = auth.uid());

create policy "deletion_requests: usuário solicita a própria exclusão"
  on public.deletion_requests for insert
  to authenticated
  with check (user_id = auth.uid());

-- Sem política de update/delete para authenticated: a transição para
-- 'concluido' é feita só pela rotina de expurgo abaixo (security definer).

-- -----------------------------------------------------------------------------
-- Expurgo definitivo agendado (RF-092)
-- -----------------------------------------------------------------------------
create or replace function public.expurgar_contas_pendentes()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  registro record;
begin
  for registro in
    select id, user_id
    from public.deletion_requests
    where status = 'pendente'
      and expurgo_agendado_para <= now()
  loop
    -- Marca a solicitação como concluída ANTES de apagar a conta: como
    -- deletion_requests.user_id não tem FK/CASCADE, este UPDATE sobrevive
    -- ao DELETE seguinte e permanece como prova de conformidade.
    update public.deletion_requests
      set status = 'concluido', concluido_em = now()
      where id = registro.id;

    -- Apaga a conta em auth.users. ON DELETE CASCADE remove em efeito
    -- dominó: profiles, campaign_instances, diary_events, consent_events e
    -- entitlements do usuário. purchase_receipts NÃO é apagada — apenas
    -- perde o vínculo (user_id vira NULL), por retenção legal.
    delete from auth.users where id = registro.user_id;
  end loop;
end;
$$;

comment on function public.expurgar_contas_pendentes() is
  'Executa o expurgo definitivo (RF-092) de contas cujo prazo de 15 dias expirou. Agendada via pg_cron, roda com privilégio elevado (security definer).';

-- Roda diariamente às 03:00 UTC. Em Supabase hospedado, confirme que a
-- extensão pg_cron está habilitada (Dashboard → Database → Extensions) antes
-- de aplicar esta migração em produção.
select cron.schedule(
  'forja-expurgo-lgpd-diario',
  '0 3 * * *',
  $$select public.expurgar_contas_pendentes();$$
);
