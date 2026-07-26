-- =============================================================================
-- FORJA — funções utilitárias compartilhadas por várias tabelas
-- =============================================================================

create or replace function public.tg_set_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

comment on function public.tg_set_atualizado_em() is
  'Trigger genérica: mantém a coluna atualizado_em em now() a cada UPDATE.';
