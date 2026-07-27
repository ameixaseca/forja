## Context

Code review pós-Fase-5 (`apps/api`) rodou o app de fato em container Docker e achou 4 problemas reais, não apenas leitura estática de código:

1. `PlayStoreReceiptValidator`/`AppStoreReceiptValidator` confiam em `packageName`/`productId` enviados pelo cliente sem checar se pertencem ao app FORJA — um recibo de qualquer outro app publicado pelo mesmo desenvolvedor (ou até de terceiros) passa a validação e vira `entitlement`.
2. `@supabase/supabase-js` (resolvido em `2.110.9` pelo range `^2.45.4`) usa `RealtimeClient`, que no construtor exige o global `WebSocket` nativo — só existe a partir do Node 22. Em Node 20 (`node:20-alpine`, e é o que `.github/workflows/ci.yml`/`mutation-tests.yml` pinam) o processo lança exceção não capturada na inicialização de `SupabaseServiceRoleClient` e o container morre antes de bindar a porta. Confirmado rodando o container.
3. `docs/ci-cd/.github/workflows/deploy-api.yml` (ainda não copiado para `.github/workflows/`, mas é o único registro do smoke test pretendido) testa `/saude`; a rota real é `/health`.
4. `POST /entitlements/validate` chama três APIs pagas de terceiros (Apple, Google, Stripe) por request autenticado, sem nenhum limite local — ficou como pergunta aberta em `design.md` da Fase 5 e nunca foi implementado.

## Goals / Non-Goals

**Goals:**
- Fechar os 4 achados sem introduzir escopo novo (sem `SyncModule`/`ConsentModule`, sem tocar LGPD, sem novo endpoint).
- Manter D-033/RF-036 intactos — nenhuma das mudanças toca `packages/motor-narrativo`/`packages/dominio`.
- Manter o isolamento de `service_role` num único provider (ADR-0011) — sem mudança de superfície de acesso.

**Non-Goals:**
- Revisar/trocar a versão do `@supabase/supabase-js` em si (o bug é de runtime Node, não da lib) — bump de Node resolve sem downgrade de dependência.
- Rate limiting distribuído (Redis) — o MVP roda uma única instância por enquanto; `@nestjs/throttler` em memória é suficiente.
- Validar assinatura criptográfica completa do recibo Apple (server-to-server notifications, `App Store Server Library`) — fora de escopo desta correção pontual; aqui só fechamos a checagem de identidade do app que faltava.

## Decisions

1. **Validação de identidade do app via env var de valor esperado, comparada no validator.**
   - Play Store: nova env var `PLAY_STORE_PACKAGE_NAME`; `PlayStoreReceiptValidator.validate` rejeita (`{ valid: false }`) se `parseReceipt(receipt).packageName !== process.env.PLAY_STORE_PACKAGE_NAME`, antes de qualquer chamada à API do Google.
   - App Store: a resposta de `verifyReceipt` já inclui `receipt.bundle_id` (campo hoje não tipado/lido). Adiciona-se `bundle_id` à interface `AppStoreVerifyReceiptResponse`, nova env var `APP_STORE_BUNDLE_ID`, e o validator rejeita se `result.receipt?.bundle_id !== process.env.APP_STORE_BUNDLE_ID`.
   - Stripe fica de fora: `checkout/sessions/{id}` é escopado à própria conta Stripe do FORJA via `STRIPE_SECRET_KEY` — não há identidade de "app" para outra parte forjar (a chave secreta já é a fronteira de confiança).
   - Alternativa descartada: hardcode do valor esperado no código-fonte. Rejeitada porque staging/produção usam bundle ids diferentes (`com.forja.app.staging` vs `com.forja.app`), e env var já é o padrão do resto do módulo (`APP_STORE_SHARED_SECRET` etc.).

2. **Bump para Node 22 em vez de pin de versão antiga do `@supabase/supabase-js`.**
   - Downgrade da lib fixaria o sintoma mas divergiria de patches de segurança futuros do SDK oficial da Supabase, e o repo já não tem `engines`/`.nvmrc` fixando Node 20 como requisito de produto — é só o valor usado até agora nos workflows.
   - Aplica-se em três lugares: `apps/api/Dockerfile` (`node:20-alpine` → `node:22-alpine`, já feito nesta sessão), `.github/workflows/ci.yml` e `.github/workflows/mutation-tests.yml` (`node-version: 20` → `22`).

3. **Correção de rota é textual, sem lógica nova.** `docs/ci-cd/.github/workflows/deploy-api.yml`: `curl -fsS https://.../saude` → `.../health` (duas ocorrências, staging e produção).

4. **`@nestjs/throttler` global no `EntitlementsModule`, limite conservador por padrão do pacote (`ttl`/`limit` fixos no código, sem nova env var).**
   - `ThrottlerModule.forRoot([{ ttl: 60_000, limit: 5 }])` importado em `EntitlementsModule`, guard aplicado via `APP_GUARD` escopado ao módulo (não global no `AppModule`, para não afetar `/health`/`/data-export`).
   - 5 requests/minuto por IP é conservador o bastante para uso legítimo (poucas compras por sessão) e barato de ajustar depois sem migração de dado.
   - Alternativa descartada: limitar por `userId` do JWT em vez de IP. Rejeitada por agora — exigiria um `ThrottlerGuard` customizado; o guard default do pacote já cobre o caso de abuso (rajada de um único cliente) que motivou o achado, e por IP é suficiente para o volume do MVP (dezenas de usuários).

## Risks / Trade-offs

- [Risco] Env vars novas (`PLAY_STORE_PACKAGE_NAME`, `APP_STORE_BUNDLE_ID`) não configuradas em staging/produção quebrariam validação de recibo silenciosamente (sempre `valid: false`) → Mitigação: seguir o padrão já existente (`SupabaseServiceRoleClient` lança erro na ausência de env obrigatória) seria excessivo aqui pois quebraria o boot inteiro da API por causa de um único validator; em vez disso, validators continuam funcionando para as outras plataformas e só a checagem daquele validator falha-fechado (rejeita) se a env var não estiver setada — documentar no `apps/api/README.md`/checklist de deploy.
- [Trade-off] Throttler em memória não sobrevive a múltiplas instâncias/reinícios → aceitável no MVP (uma instância Fly.io); revisar se escalar horizontalmente.
- [Risco] Bump de Node 22 é uma mudança de ambiente, não só de código — precisa ser refletida em qualquer doc/README que mencione Node 20 → checar `apps/api/README.md` e `docs/` por menções.

## Migration Plan

1. Implementar checagem de identidade nos dois validators + testes unitários (recibo de app correto vs. app errado).
2. Adicionar `@nestjs/throttler`, configurar módulo, testar 429 após exceder limite.
3. Bump Node 20→22 em `apps/api/Dockerfile` (já feito), `.github/workflows/ci.yml`, `.github/workflows/mutation-tests.yml`.
4. Corrigir rota em `docs/ci-cd/.github/workflows/deploy-api.yml`.
5. Rodar `pnpm --filter @forja/api lint/typecheck/test/test:mutation`; rebuild Docker; smoke test manual como no review anterior.
6. Sem rollback de dado — mudança é só código/config; rollback = reverter commit/imagem.

## Open Questions

- Rate limit por `userId` autenticado (em vez de IP) fica como follow-up se abuso real for observado — não bloqueia esta correção.
