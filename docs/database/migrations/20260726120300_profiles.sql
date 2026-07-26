-- =============================================================================
-- FORJA — profiles (1:1 com auth.users)
-- =============================================================================
-- Conta é opcional (RF-090): esta linha só existe para quem optou por criar
-- conta. Não armazena data de nascimento — minimização de dado (RC-020 resolve
-- a questão de menor elevando o piso para 18 anos por política de produto, não
-- por verificação de idade; logo não há necessidade de coletar nascimento).

create table public.profiles (
  id                            uuid primary key references auth.users (id) on delete cascade,
  faixa_etaria_confirmada_em    timestamptz not null default now(),
  idioma                        text not null default 'pt-BR',
  criado_em                     timestamptz not null default now(),
  atualizado_em                 timestamptz not null default now()
);

comment on table public.profiles is
  'Perfil de aplicação do usuário. Existe só para quem criou conta (RF-090 permite uso completo sem conta).';
comment on column public.profiles.faixa_etaria_confirmada_em is
  'Timestamp da autodeclaração de maioridade (RC-020). Deliberadamente não guardamos data de nascimento.';

create trigger trg_profiles_atualizado_em
  before update on public.profiles
  for each row execute function public.tg_set_atualizado_em();

alter table public.profiles enable row level security;

create policy "profiles: usuário lê o próprio perfil"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "profiles: usuário cria o próprio perfil"
  on public.profiles for insert
  to authenticated
  with check (id = auth.uid());

create policy "profiles: usuário atualiza o próprio perfil"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Sem política de delete: a exclusão de perfil acontece só via exclusão de
-- conta (auth.users), que cascateia para cá — nunca por exclusão direta do
-- usuário sobre esta tabela isoladamente (ver deletion_requests).
