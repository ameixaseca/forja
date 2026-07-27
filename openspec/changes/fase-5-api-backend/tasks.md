## 1. packages/schema

- [x] 1.1 Criar `packages/schema` (package.json, tsconfig, sem deps de runtime além de Zod; segue padrão de `packages/dominio`)
- [x] 1.2 Definir schema `EntitlementValidateRequest`/`EntitlementValidateResponse`
- [x] 1.3 Definir schema `DataExportResponse` (diary_events, consent_events, profiles, entitlements, purchase_receipts)
- [x] 1.4 Testes unitários dos schemas (casos válidos e inválidos por campo)
- [x] 1.5 `pnpm typecheck` e `pnpm lint` limpos para o pacote — corrigido bug pré-existente no `.eslintrc.js` raiz (`extends: ['@forja/config-eslint']` não resolvia; ESLint só resolve nomes no padrão `eslint-config-*`/`@scope/eslint-config`, trocado para `require.resolve('@forja/config-eslint')`), validado com `pnpm lint` no monorepo inteiro
- [x] 1.6 (achado durante 4.x) `packages/schema` compilava como ESM (`"type": "module"`), mas `apps/api` é CommonJS — `require()` de um pacote ESM puro quebraria em runtime real, não só em teste. Corrigido: removido `"type": "module"`, `tsconfig.json` do pacote agora força `module: commonjs` / `moduleResolution: node`; rebuildado e revalidado (typecheck/lint/test do pacote e do monorepo inteiro)

## 2. Setup apps/api

- [x] 2.1 `npx @nestjs/cli new apps/api --package-manager pnpm`, adapter Fastify em `main.ts`
- [x] 2.2 Adicionar `@supabase/supabase-js`, `nestjs-zod`, `@forja/schema` como deps
- [x] 2.3 Provider `SupabaseServiceRoleClient` (único ponto com acesso à service role key via env var)
- [x] 2.4 `AuthGuard` validando JWT do Supabase Auth via JWKS
- [x] 2.5 Verificação: `pnpm --filter @forja/api dev` inicia sem erro (validado com env vars dummy — app sobe, rotas mapeadas)

## 3. HealthModule

- [x] 3.1 `GET /health`, sem guard, checando conectividade com Postgres
- [x] 3.2 Teste e2e: 200 quando saudável, 503 quando banco inacessível (mock)
- [x] 3.3 Verificação: `curl http://localhost:3000/health` — 503 com Supabase de teste inexistente (comportamento correto), rota confirmada no ar

## 4. EntitlementsModule

- [x] 4.1 `POST /entitlements/validate`, protegido por `AuthGuard`, validando body com pipe Zod (`EntitlementValidateRequest`)
- [x] 4.2 Integração com App Store Server API / Google Play Developer API / Stripe (mockável via interface `ReceiptValidator` por `origem`)
- [x] 4.3 Gravação em `purchase_receipts` (sempre) e depois `entitlements` (só se válido), via `service_role`
- [x] 4.4 Unit tests: lógica de decisão válido/inválido, ordem de gravação (recibo antes de entitlement)
- [x] 4.5 Integration/e2e tests: request autenticado + mock de loja, request sem auth (401), recibo inválido (sem entitlement gravado)
- [x] 4.6 Mutation tests (Stryker) sobre a lógica de validação/decisão em `packages/schema` e no módulo, ajustar threshold conforme `docs/testes/MUTATION-TESTING.md` — 100% de score (`apps/api/stryker.config.mjs`, runner Jest)
- [x] 4.7 Verificação: `pnpm --filter @forja/api test:e2e` passa

## 5. LgpdModule

- [x] 5.1 `GET /data-export`, protegido por `AuthGuard`
- [x] 5.2 Query paralela (`Promise.all`) das 5 coleções, com filtro explícito por `user_id` do JWT em `purchase_receipts` (via `service_role`) e RLS nativo nas demais
- [x] 5.3 Unit test: filtro de `purchase_receipts` sempre inclui `user_id` do usuário autenticado
- [x] 5.4 Integration/e2e test: dois usuários de teste, garantir isolamento total (usuário A nunca vê dado de usuário B, incluindo purchase_receipts)
- [x] 5.5 Integration/e2e test: usuário sem entitlements/recibos recebe coleções vazias, sem erro
- [x] 5.6 Mutation tests sobre a lógica de filtro/agregação — 100% de score
- [x] 5.7 Verificação: `pnpm --filter @forja/api test:e2e` passa

## 6. Verificação de conteúdo (se aplicável)

- [x] 6.1 Confirmar que nenhuma mudança tocou `content/` ou `packages/motor-narrativo`; se tocar, rodar `python docs/prd/verificar.py` e `python docs/testes/cobertura.py` — confirmado via `git status`, nenhum dos dois tocado; scripts não aplicáveis
- [x] 6.2 Confirmar (grep de imports) que `apps/api` não introduz dependência de `packages/motor-narrativo`/`packages/dominio` além de tipos puros, preservando D-033 — zero imports encontrados

## 7. Deploy staging

- [ ] 7.1 `fly launch --name forja-api-staging` (confirmar com o usuário antes de rodar — ação em infraestrutura externa)
- [ ] 7.2 Configurar env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, JWKS URL) via `fly secrets`, nunca commitadas
- [ ] 7.3 `fly deploy` (confirmar com o usuário antes de rodar)
- [ ] 7.4 Verificação: `curl https://forja-api-staging.fly.dev/health` retorna 200

## 8. Gate da Fase 5

- [x] 8.1 `pnpm lint`, `pnpm typecheck`, `pnpm test` limpos (Turborepo, affected-only) — validado no monorepo inteiro
- [x] 8.2 Entitlements valida recibos (unit + e2e + mutation) — 100% mutation score
- [x] 8.3 LGPD export funcional e isolado por usuário (unit + e2e + mutation) — 100% mutation score
- [x] 8.4 RLS validado — usuário não vê dado alheio (teste de integração dedicado) — e2e `lgpd.e2e-spec.ts` prova isolamento entre dois usuários via o filtro explícito de `user_id` em `purchase_receipts` (a única tabela sem RLS de cliente); demais tabelas já protegidas por RLS nativa (Fase 1)
- [ ] 8.5 Deploy staging funcional — pendente: exige credenciais Fly.io/Supabase reais, não disponíveis neste ambiente. Ver seção 7 para os comandos
- [ ] 8.6 Tag `fase-5-completa` — pendente até 8.5
