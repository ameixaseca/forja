## Why

O projeto tem migrações de banco (Fase 1) e domínio (Fase 3) prontos, mas nenhum servidor. Três fluxos não podem ser resolvidos só por RLS/Supabase direto: validação de recibo de compra multiplataforma (ADR-0005, exige chamar App Store/Play/Stripe e escrever com `service_role`), exportação/exclusão LGPD (RF-091/092, exige agregar e expurgar dados que o próprio usuário não deveria poder disparar por escrita direta), e healthcheck de deploy. `apps/api` precisa existir para desbloquear a Fase 6 (Mobile), que depende de validar compras e oferecer exportação/exclusão de conta.

## What Changes

- Cria `apps/api` (NestJS sobre Fastify, ADR-0003) com escopo restrito por ADR-0011: **sem** `SyncModule` nem `ConsentModule` — diário e consentimento continuam sincronizando direto via Supabase SDK no cliente, fora desta mudança.
- `EntitlementsModule`: endpoint `POST /entitlements/validate`, valida recibo (App Store/Play/Stripe) e grava em `entitlements`/`purchase_receipts` via `service_role` (único escritor permitido pelos GRANTs).
- `LgpdModule`: **só** `GET /data-export` (exporta `diary_events`/`consent_events`/`profiles`/`entitlements` do usuário autenticado, mais o histórico de `purchase_receipts` — esta última só legível via `service_role`, é o motivo concreto de precisar de API em vez de query direta do cliente). **Sem** endpoint de deletion-request: `deletion_requests` já tem política RLS de INSERT para `authenticated` (`user_id = auth.uid()`), então o cliente abre a solicitação direto via Supabase SDK; o expurgo em si já roda como rotina `security definer` agendada por `pg_cron` (`expurgar_contas_pendentes()`), sem necessidade de código de API.
- `HealthModule`: `GET /health`.
- `AuthGuard` compartilhado: valida JWT do Supabase Auth (JWKS) — a API não emite/rotaciona JWT próprio.
- `packages/schema`: novo pacote Zod compartilhado cliente↔API (ADR-0009), com os schemas de payload de entitlements e LGPD usados pelos pipes de validação da API. Ainda não existe no monorepo — criado como parte desta mudança.
- Deploy staging (Fly.io) do `apps/api`.
- **BREAKING**: nenhuma (não há release anterior da API).

## Capabilities

### New Capabilities

- `api-entitlements`: validação de recibo de compra multiplataforma e materialização de `{pacote, origem, validoAte}` via `service_role`.
- `api-lgpd`: exportação integral de dados do usuário e abertura de solicitação de exclusão de conta.
- `api-health`: healthcheck do deploy.

### Modified Capabilities

_(nenhuma — `catalog-verification` e `narrative-simulation-cli` não são afetadas por esta mudança)_

## Impact

- Novo diretório `apps/api/` (NestJS, Fastify, `@supabase/supabase-js` com `service_role`).
- Novo pacote `packages/schema/` (Zod), consumido por `apps/api` e futuramente por `apps/mobile`/`apps/web`.
- `docs/c4/03-componentes-api.md` já corrigido nesta sessão (ADR-0011) para remover `SyncModule`/`ConsentModule` do diagrama.
- Sem mudança em `packages/motor-narrativo`/`packages/dominio` (permanecem puros, sem I/O, D-033/RF-036 preservados — a API não importa desses pacotes para além de tipos, se necessário).
- Sem mudança em migrações — `apps/api` só usa tabelas já existentes (`entitlements`, `purchase_receipts`, `deletion_requests`, `diary_events`, `consent_events`, `profiles`) via `service_role`, sem novas colunas/tabelas.
