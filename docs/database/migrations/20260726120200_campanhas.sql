-- =============================================================================
-- FORJA — campanhas (índice leve; NÃO é o catálogo de storylets)
-- =============================================================================
-- O conteúdo narrativo (storylets, qualidades, entidades) permanece embutido
-- no binário do cliente por decisão de produto (D-036, D-031). Esta tabela só
-- referencia quais campanhas existem, para dar integridade referencial a
-- campaign_instances e a entitlements — nunca é lida pelo motor narrativo.

create table public.campanhas (
  codinome    text primary key,           -- ex.: 'a-longa-seca'
  titulo      text not null,
  gratuita    boolean not null default false,
  lancada_em  date,
  criado_em   timestamptz not null default now()
);

comment on table public.campanhas is
  'Índice administrativo de campanhas existentes. O conteúdo em si (storylets) fica no app, nunca aqui (D-036).';

alter table public.campanhas enable row level security;

-- Toda campanha listada aqui já foi publicada (é um release do app, D-031),
-- então é seguro que qualquer usuário autenticado leia este índice.
create policy "campanhas: leitura pública para autenticados"
  on public.campanhas for select
  to authenticated
  using (true);
