## Why

O code review da Fase 5 (`apps/api`) encontrou 4 problemas: um bug de segurança que permite forjar entitlements com recibo de app alheio, um bug de runtime que impede a API de subir em Node 20 (o que o CI e o Dockerfile atualmente usam), uma rota errada no smoke test do workflow de deploy, e ausência de rate limiting num endpoint que chama APIs pagas de terceiros. Nenhum é uma nova feature — são correções sobre trabalho já arquivado (Fase 5) antes de prosseguir para o deploy staging (tasks 7.x, ainda pendente).

## What Changes

- **BREAKING** (infra): bump de Node 20 → Node 22 no `apps/api/Dockerfile` (já ajustado localmente) e nos workflows `.github/workflows/ci.yml` e `.github/workflows/mutation-tests.yml`, porque `@supabase/supabase-js` exige `WebSocket` nativo (Node 22+) e a API não inicializa em Node 20.
- `PlayStoreReceiptValidator` e `AppStoreReceiptValidator` passam a validar a identidade do app (`packageName`/`bundle_id`) contra um valor esperado configurado via env var, rejeitando recibos de qualquer outro app antes de conceder entitlement.
- `docs/ci-cd/.github/workflows/deploy-api.yml`: smoke test corrigido de `GET /saude` para `GET /health`.
- `POST /entitlements/validate` ganha rate limiting via `@nestjs/throttler` com um limite conservador por usuário autenticado.

## Capabilities

### New Capabilities
(nenhuma)

### Modified Capabilities
- `api-entitlements`: validação de recibo passa a exigir correspondência de identidade do app (packageName/bundle_id) antes de conceder entitlement; endpoint `POST /entitlements/validate` passa a ter rate limiting.

## Impact

- `apps/api/src/modules/entitlements/validators/play-store-receipt-validator.ts`
- `apps/api/src/modules/entitlements/validators/app-store-receipt-validator.ts`
- `apps/api/src/modules/entitlements/entitlements.module.ts` (throttler)
- `apps/api/Dockerfile` (já em Node 22)
- `.github/workflows/ci.yml`, `.github/workflows/mutation-tests.yml` (Node 22)
- `docs/ci-cd/.github/workflows/deploy-api.yml` (rota `/health`)
- Nova env var exigida: `PLAY_STORE_PACKAGE_NAME` (e reaproveita `APP_STORE_SHARED_SECRET`'s vizinho de bundle id — ver design.md)
- Nova dependência: `@nestjs/throttler`
