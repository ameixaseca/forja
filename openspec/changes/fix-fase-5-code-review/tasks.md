## 1. Validação de identidade do app nos receipt validators

- [x] 1.1 `PlayStoreReceiptValidator`: rejeitar (`{ valid: false }`) se `packageName` do recibo != `PLAY_STORE_PACKAGE_NAME`, antes de chamar a API do Google
- [x] 1.2 `AppStoreReceiptValidator`: adicionar `bundle_id` à interface de resposta, rejeitar se `receipt.bundle_id` != `APP_STORE_BUNDLE_ID`
- [x] 1.3 Testes unitários: recibo com identidade correta (passa), recibo de outro app (rejeitado sem gravar entitlement)
- [x] 1.4 Atualizar `entitlements.service.spec.ts`/e2e se necessário para cobrir o novo caminho de rejeição (e2e cobre auth+throttle; validators cobertos por unit tests próprios)
- [x] 1.5 Documentar `PLAY_STORE_PACKAGE_NAME`/`APP_STORE_BUNDLE_ID` no `docker-compose.yml` (valores dummy) e checklist de deploy

## 2. Rate limiting em /entitlements/validate

- [x] 2.1 Adicionar `@nestjs/throttler` como dependência de `apps/api`
- [x] 2.2 Configurar `ThrottlerModule` no `EntitlementsModule` (ttl 60s, limit 5); guard aplicado via `@UseGuards(ThrottlerGuard)` no `EntitlementsController`, não `APP_GUARD` (esse token é sempre global no Nest, afetaria `/health`/`/data-export`)
- [x] 2.3 Teste e2e: exceder limite retorna 429 e não chama validators externos

## 3. Bump Node 20 → 22

- [x] 3.1 Confirmar `apps/api/Dockerfile` em `node:22-alpine` (já ajustado)
- [x] 3.2 `.github/workflows/ci.yml`: `node-version: 22`
- [x] 3.3 `.github/workflows/mutation-tests.yml`: `node-version: 22`
- [x] 3.4 Grep por menções a "Node 20" em docs/README relevantes e atualizar (`docs/implementacao/STACK-TECNICO.md` atualizado; docs históricos de fase não alterados — são registros datados, não referência viva)

## 4. Correção da rota no smoke test de deploy

- [x] 4.1 `docs/ci-cd/.github/workflows/deploy-api.yml`: trocar `/saude` por `/health` (staging e produção)

## 5. Verificação

- [x] 5.1 `pnpm --filter @forja/api lint`
- [x] 5.2 `pnpm --filter @forja/api typecheck`
- [x] 5.3 `pnpm --filter @forja/api test`
- [x] 5.4 `pnpm --filter @forja/api test:e2e`
- [x] 5.5 `pnpm --filter @forja/api test:mutation` (entitlements.service.ts e lgpd.service.ts em 100%)
- [x] 5.6 Rebuild Docker + smoke test manual (`/health` 503 esperado com credenciais dummy; boot limpo em Node 22, confirmando o fix do crash em Node 20; 429 validado via e2e — rajada manual sem JWT real não exercita o throttler pois o AuthGuard corta antes)
