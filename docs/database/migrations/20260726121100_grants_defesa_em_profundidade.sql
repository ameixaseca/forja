-- =============================================================================
-- FORJA — grants explícitos (defesa em profundidade além do RLS)
-- =============================================================================
-- No Supabase, os papéis `anon` e `authenticated` recebem GRANT amplo por
-- padrão sobre o schema public, e a RLS já é, por si só, suficiente para
-- bloquear qualquer linha sem política correspondente. Os REVOKE/GRANT
-- abaixo não são estritamente necessários para a segurança funcionar — são
-- uma segunda camada explícita e auditável, para que a intenção de acesso
-- de cada tabela fique legível no schema, não só implícita na ausência de
-- uma política.

-- anon nunca deveria tocar dado de usuário: enquanto não há conta, o app usa
-- só armazenamento local (RF-090); uma vez autenticado, o Supabase promove
-- a sessão para o papel `authenticated`.
revoke all on all tables in schema public from anon;

-- diary_events: append-only de verdade, também no nível de GRANT.
revoke update, delete on public.diary_events from authenticated;
grant select, insert on public.diary_events to authenticated;

-- consent_events: log imutável, também no nível de GRANT.
revoke update, delete on public.consent_events from authenticated;
grant select, insert on public.consent_events to authenticated;

-- deletion_requests: usuário só abre solicitação e consulta status; a
-- transição de estado é feita pela rotina de expurgo (security definer).
revoke update, delete on public.deletion_requests from authenticated;
grant select, insert on public.deletion_requests to authenticated;

-- entitlements: só leitura para o cliente. Concessão/alteração é
-- responsabilidade exclusiva do backend, após validar o recibo (ADR-0005).
revoke insert, update, delete on public.entitlements from authenticated;
grant select on public.entitlements to authenticated;

-- purchase_receipts e storylet_kill_switch: zero acesso de cliente, em
-- qualquer comando. Auditoria e administração de conteúdo, respectivamente.
revoke all on public.purchase_receipts from authenticated;
revoke all on public.storylet_kill_switch from authenticated;
