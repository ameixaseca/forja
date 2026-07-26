-- =============================================================================
-- FORJA — storylet_kill_switch (fonte administrativa, NÃO é o caminho de execução)
-- =============================================================================
-- RF-038/039/039A exigem que a consulta de storylets desativados pelo cliente
-- aconteça sem identificador de usuário, sem parâmetro de consulta e sem
-- telemetria, servida por infraestrutura estática sem retenção de log/IP
-- (RC-009). Por isso o cliente NUNCA consulta esta tabela diretamente — ela é
-- só a fonte de verdade administrativa; um processo de release exporta o
-- conteúdo desta tabela para um arquivo JSON estático publicado no CDN
-- (ver ADR-0004). Nenhum papel de cliente tem qualquer acesso aqui.

create table public.storylet_kill_switch (
  storylet_id     text primary key,
  motivo          text,
  desativado_em   timestamptz not null default now(),
  desativado_por  text not null   -- identificador do autor/dev, nunca do usuário final
);

comment on table public.storylet_kill_switch is
  'Fonte administrativa do kill-switch (RF-034/D-034). Exportada para arquivo estático no CDN por um processo de release — nunca consultada em runtime pelo app (ADR-0004).';

alter table public.storylet_kill_switch enable row level security;

-- Nenhuma política criada de propósito: acesso só via service_role, usado
-- exclusivamente pelo processo/script de exportação para o CDN.
