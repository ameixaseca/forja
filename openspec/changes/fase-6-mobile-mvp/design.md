## Context

`apps/mobile` é o primeiro app cliente do monorepo. Já existem, prontos e sem I/O (D-033): `@forja/motor-narrativo` (`resolve(catalog, state, inputs, seed): ResolutionResult`, puro), `@forja/dominio` (`calcularFicha(eventos: DiaryEvent[]): Ficha`, puro), `@forja/schema` (Zod, contratos de `apps/api`). `apps/api` expõe só `POST /entitlements/validate` e `GET /data-export` (ADR-0011) — não expõe `/sync`.

O schema real de `diary_events` (`docs/database/migrations/20260726120600_diary_events.sql`) exige, por linha: `campaign_instance_id` (uuid, FK), `user_id`, `tipo` (texto livre), `payload` (jsonb), `payload_cifrado` (bool), `device_id`, `idempotency_key` (uuid, único por `campaign_instance_id`), `app_version`, `ocorrido_em` (timestamptz). RLS permite `authenticated` fazer `select`/`insert` filtrado por `user_id = auth.uid()`; não há `update`/`delete` — log é append-only mesmo no cliente. `campaign_instances.ultimo_snapshot` é cache opcional, nunca fonte de verdade (ADR-0002).

`DiaryEvent` do pacote `dominio` (`{ id, tipo, ocorridoEm, payload }`) é o formato **lógico** consumido por `calcularFicha`; não tem `campaign_instance_id`/`device_id`/`idempotency_key`/`app_version` — esses são metadados de transporte/persistência, não de domínio. O app mobile precisa de um formato de storage próprio (linha SQLite) que é um superset do `DiaryEvent` de domínio, mapeado para o formato de domínio antes de chamar `calcularFicha`.

## Goals / Non-Goals

**Goals:**
- App Expo rodando 100% offline (D-008): criar juramento, registrar sessão, ver resolução, ver ficha, sem rede.
- Sincronização de `diary_events`/`consent_events` direta contra Supabase via SDK (RLS, `auth.uid()`) — sem endpoint custom, conforme ADR-0011.
- Fluxo completo integrando `resolve()` + `calcularFicha()` sem reescrever regra de negócio no app (D-033).
- 7 telas MVP navegáveis via Expo Router.

**Non-Goals:**
- Nenhum `SyncModule`/`/sync` em `apps/api` (proibido por ADR-0011).
- Nenhuma lógica de resolução de conflito multi-device sofisticada — MVP usa append-only (todo evento é novo, nunca há conflito de escrita porque não há update/delete); "sync" é só push de eventos locais não enviados + pull de eventos novos do servidor.
- Nenhuma persistência de ficha como estado mutável — ficha é sempre `calcularFicha(eventos)`, recalculada em memória (ADR-0002, D-033).
- Sem testes E2E Detox nesta fase (fora do orçamento da tarefa; ficam registrados como débito futuro se necessário).
- Sem criptografia de campo (`payload_cifrado`) nesta fase — sempre `false`; RF-011 fica para mudança futura.

## Decisions

### D1: Sync via Supabase SDK direto, não via `apps/api`
`docs/implementacao/07-FASE-6-MOBILE.md` (`SyncService` com `fetch('.../sync')`) está desatualizado em relação a ADR-0011, que é fonte de verdade superior (PRD → **ADR** → C4 → DB). Implementação usa `@supabase/supabase-js`: `insert` em lote para push, `select ... .gt('id', last_seen_id)` para pull, ambos sob o JWT de sessão do usuário (RLS aplica o filtro por `user_id`).
**Alternativa descartada:** manter `/sync` na API — violaria ADR-0011 e duplicaria autorização (Prisma + RLS).

### D2: Formato de storage SQLite é superset do `DiaryEvent` de domínio
Tabela local `diary_events` guarda todas as colunas exigidas pelo schema do servidor (`campaign_instance_id`, `device_id`, `idempotency_key`, `app_version`, `ocorrido_em`, `payload`, `synced_at`) mais `id_local` (uuid, PK local) e `server_id` (bigint nullable, preenchido após sync). Uma função `toDominioEvent(row)` mapeia para `{ id, tipo, ocorridoEm, payload }` antes de passar para `calcularFicha`.
**Alternativa descartada:** guardar só o formato de domínio — perderia idempotência/rastreabilidade exigida pelo schema do servidor no momento do push.

### D3: `idempotency_key` gerada no client, na criação do evento
Toda gravação local já gera o `idempotency_key` (uuid v4) que será enviado no push — evita duplicata em reenvio após falha de rede (constraint `diary_events_idempotencia_unica` no servidor faz o dedupe final).

### D4: `campaign_instances` criada no primeiro juramento, uma linha ativa por vez no MVP
RF-032 permite múltiplas campanhas, mas o MVP (7 telas) só expõe uma campanha ativa por vez — criação de `campaign_instances` acontece via Supabase SDK (`insert`, RLS) no fluxo de Juramento, não pré-provisionada.

### D5: Motor/domínio chamados só na camada de hooks (`useResolution`, `useFicha`), nunca direto nas telas
Mantém D-033: telas não importam `@forja/motor-narrativo`/`@forja/dominio` diretamente além de tipos; toda chamada passa por um hook fino em `src/hooks/`, testável sem renderizar UI.

### D6: Catálogo embarcado no binário (D-036)
`content/campanhas/espinha/catalog.json` (ou path real do catálogo já existente em `content/`) é importado estaticamente no bundle — sem fetch de rede, sem YAML/classes.

## Risks / Trade-offs

- [Risco] `expo-sqlite` API síncrona vs. assíncrona varia por versão do SDK Expo → Mitigação: fixar versão do Expo SDK usada no `pnpm add`, encapsular toda a API em `src/storage/` para isolar troca futura.
- [Risco] Sync push em lote pode exceder payload/limite de linhas do Supabase em uso prolongado offline → Mitigação: push em chunks (ex. 50 eventos por request), teste de integração cobre esse caso.
- [Risco] `idempotency_key` gerada localmente mas rede cai antes da resposta confirmar → Mitigação: reenviar é seguro (constraint única do servidor descarta duplicata); marcar `synced_at` só após confirmação de sucesso do `insert`.
- [Trade-off] Sem Detox E2E nesta fase — cobertura via testes de integração (hooks + storage + mock do Supabase client) e testes unitários dos hooks, não da UI renderizada.

## Migration Plan

1. Scaffold `apps/mobile` (Expo + TS), sem tocar em `packages/*` nem `apps/api`.
2. Storage local (SQLite) + mapeamento para `DiaryEvent` de domínio.
3. `SyncService` (Supabase SDK) — push/pull.
4. Hooks de integração (`useResolution`, `useFicha`) sobre motor/domínio.
5. 7 telas + navegação Expo Router.
6. Testes de integração cobrindo: storage↔domínio, sync↔RLS (contra Supabase local do `docker-compose`/CLI já usado por `apps/api`), fluxo completo Juramento→Sessão→Resolução.
Rollback: `apps/mobile` é aditivo, não altera schema nem outros packages — reverter é remover o diretório/branch, sem impacto em `apps/api`/DB.

## Open Questions

- Autenticação (login/magic link) do Supabase Auth no client Expo: fluxo completo de auth (tela de login) está fora do escopo literal das "7 telas" do doc de fase, mas é pré-requisito técnico para `auth.uid()` funcionar. Assumido como parte de `ConfigScreen`/bootstrap inicial, implementação mínima (magic link via `supabase.auth.signInWithOtp`) — não uma tela dedicada nova além das 7 listadas.
