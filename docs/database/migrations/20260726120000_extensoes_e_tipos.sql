-- =============================================================================
-- FORJA — extensões e tipos enumerados
-- =============================================================================
-- pgcrypto: gen_random_uuid() para chaves primárias UUID.
create extension if not exists "pgcrypto";

-- pg_cron: agenda o expurgo definitivo de conta (RF-092, LGPD).
-- No Supabase hospedado, se esta linha falhar por permissão, habilite a extensão
-- em Dashboard → Database → Extensions → pg_cron antes de reaplicar a migração.
create extension if not exists "pg_cron";

-- -----------------------------------------------------------------------------
-- Tipos enumerados: usados só para domínios fechados e estáveis pelo próprio
-- PRD (RC-001, D-029/status de campanha, RF-092). Domínios que o PRD declara
-- explicitamente extensíveis sem migração (ex.: origem de compra, RF-111) usam
-- tabela de referência em vez de enum — ver 20260726120700.
-- -----------------------------------------------------------------------------

create type consent_tipo as enum (
  'processamento_local',  -- funcionamento local da ficha e do diário (RC-001, a)
  'backup_nuvem'           -- backup em nuvem (RC-001, b)
);

create type consent_acao as enum ('concedido', 'revogado');

create type campaign_status as enum ('ativa', 'concluida', 'abandonada');

create type entitlement_status as enum ('ativo', 'revogado', 'reembolsado');

create type deletion_status as enum ('pendente', 'concluido');

create type receipt_verification_status as enum ('pendente', 'verificado', 'falhou');
