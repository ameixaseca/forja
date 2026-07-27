## Context

`apps/api` não existe ainda. Migrações (Fase 1) e domínio (Fase 3) estão prontos. Esta mudança segue ADR-0011 (escopo reduzido: sem `SyncModule`/`ConsentModule`, corrigido em `docs/c4/03-componentes-api.md` nesta mesma sessão). O único motivo real para a API existir é código que precisa de `service_role` (bypassa RLS) ou lógica de servidor: validar recibo de compra externo (ADR-0005) e ler `purchase_receipts` (zero acesso de cliente, por desenho) para o export LGPD.

## Goals / Non-Goals

**Goals:**

- `apps/api` com `EntitlementsModule`, `LgpdModule` (só export), `HealthModule`.
- `packages/schema`: pacote Zod compartilhado (ADR-0009), consumido pela API via pipe de validação.
- Autenticação: `AuthGuard` valida o JWT do Supabase Auth (JWKS público do projeto Supabase) — a API nunca emite/rotaciona token próprio.
- Escrita em `entitlements`/`purchase_receipts` e leitura de `purchase_receipts` só via cliente `service_role` do Supabase (`@supabase/supabase-js` com a service role key, nunca exposta ao cliente final).
- Três camadas de teste por funcionalidade (unit, integration/e2e, mutation em `packages/schema` e qualquer lógica de domínio nova) — CLAUDE.md.
- Deploy staging em Fly.io.

**Non-Goals:**

- `SyncModule`/`ConsentModule` — diário e consentimento continuam via Supabase SDK direto no cliente (ADR-0011).
- `POST /deletion-request` — RLS já permite insert direto do cliente; fora de escopo.
- Prisma como camada de repositório — não há necessidade de ORM para 2-3 queries com `service_role`; usar `@supabase/supabase-js` diretamente evita uma segunda fonte de verdade de schema (Prisma schema divergindo das migrações SQL já existentes).
- Assinatura recorrente / billing complexo (D-026, RF-113 fora do MVP).

## Decisions

1. **Sem Prisma.** A API usa `@supabase/supabase-js` (cliente `service_role`) diretamente para as poucas queries necessárias, em vez de introduzir Prisma como em C4 original. Motivo: Prisma exigiria manter um segundo schema (`schema.prisma`) sincronizado manualmente com as migrações SQL já existentes (fonte de verdade única, `docs/database/migrations/`) — duplicação de schema sem benefício, dado o volume pequeno de queries desta API (ADR-0011 já reduziu o escopo pelo mesmo motivo de orçamento de engenharia, R-002).
2. **`packages/schema` novo pacote.** ADR-0009 já previa este pacote; ele não existe ainda no monorepo (só `packages/dominio`, `packages/motor-narrativo`, `packages/config-*`). Criado nesta mudança com os schemas Zod de `EntitlementValidateRequest`/`Response` e `DataExportResponse`. Consumido via `nestjs-zod` nos pipes.
3. **AuthGuard por JWKS, não por sessão própria.** A API valida o JWT emitido pelo Supabase Auth usando a chave pública (JWKS) do projeto Supabase — sem chamar de volta o Supabase Auth a cada requisição, sem estado de sessão na API.
4. **`service_role` isolado num único provider.** Um `SupabaseServiceRoleClient` injetável, único ponto do código com acesso à service role key (via env var, nunca logada). `EntitlementsModule` e `LgpdModule` dependem dele; nenhum outro módulo tem acesso.
5. **Validação de recibo:** `EntitlementsModule` chama a API oficial da loja (App Store Server API / Google Play Developer API) ou Stripe conforme `platform`/`origem` do request; grava primeiro em `purchase_receipts` (auditoria, `status_verificacao`), depois em `entitlements` se válido — nunca o inverso, para não conceder acesso sem trilha de auditoria correspondente.
6. **Export LGPD:** uma única query paralela (`Promise.all`) por tabela (`diary_events`, `consent_events`, `profiles`, `entitlements` filtrados por `user_id = auth.uid()` do guard; `purchase_receipts` filtrado por `user_id` via `service_role`), serializado como um único JSON. Sem paginação no MVP — volume por usuário é pequeno (RE não especifica limite; revisar se volume real justificar streaming).

## Risks / Trade-offs

- [Risco] Chave `service_role` vazar via log/erro → Mitigação: nunca logar o client Supabase inteiro; usar variável de ambiente só em runtime, nunca em código; lint/review adicional em qualquer `console.log`/exception handler que toque o provider.
- [Risco] Validação de recibo falsa (recibo forjado aceito) → Mitigação: sempre validar contra a API oficial da loja antes de gravar `entitlements`; nunca confiar em campo enviado pelo cliente sem verificação externa (D-029/ADR-0005 já exigem isso).
- [Trade-off] Sem Prisma = queries manuais com `@supabase/supabase-js`, menos type-safety automática que um schema Prisma gerado → mitigado por `packages/schema` (Zod) tipando entrada/saída da API; os tipos de linha do Postgres continuam manuais (aceitável dado o volume pequeno de tabelas tocadas).
- [Trade-off] Export sem paginação pode ficar lento se `diary_events` crescer muito por usuário → aceitável no MVP (escala de "algumas centenas de usuários", §11.2); revisar se necessário.

## Migration Plan

1. Criar `packages/schema` (Zod schemas + testes unitários).
2. Criar `apps/api` (NestJS + Fastify adapter), módulos `health` → `entitlements` → `lgpd`, cada um com unit + integration (e2e) + mutation tests antes de avançar para o próximo.
3. Configurar env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, JWKS URL) — nunca commitadas.
4. Deploy staging Fly.io, validar `/health`.
5. Sem rollback de dados: API é stateless: nenhum dado é migrado, só código novo. Rollback = reverter deploy.

## Open Questions

- Export LGPD deve incluir `campaign_instances`/snapshot (cache, não fonte de verdade)? Proposta: não — `diary_events` já é a fonte de verdade completa; incluir o snapshot seria redundante e poderia confundir o usuário com dois formatos do "mesmo" dado. Revisar com o autor antes de fechar a spec se houver expectativa diferente.
- Rate limiting em `/entitlements/validate` (chamada cara/externa) — parâmetros exatos (janela, limite) não definidos no PRD; usar um default conservador (`@nestjs/throttler`) e ajustar depois se necessário.
