## Why

`packages/motor-narrativo`, `packages/dominio`, `packages/schema` e `apps/api` (entitlements/LGPD/health) estão implementados, mas não existe nenhum app consumidor — o produto não pode ser jogado. Fase 6 do cronograma (`docs/implementacao/CRONOGRAMA.md`) é o item crítico bloqueante: `apps/mobile` é o deliverable principal do MVP e pré-requisito para Fase 7 (Web, reaproveita 90% dos componentes) e Fase 10 (testes bloqueantes GO/NO-GO).

## What Changes

- Cria `apps/mobile` (Expo + React Native + TypeScript, Expo Router) com fluxo completo Juramento → Sessão → Resolução → Ficha, offline-first (D-008).
- Storage local via `expo-sqlite`: `diary_events` como log append-only, espelhando o schema de `docs/database/migrations/` — mesma fonte de verdade do server (ADR-0002), não um cache paralelo.
- Sincronização do diário via **Supabase SDK direto** (`auth.uid()`/RLS), **não** via endpoint custom em `apps/api` — corrige o pseudocódigo desatualizado de `docs/implementacao/07-FASE-6-MOBILE.md` (que assumia `POST /sync`) para seguir **ADR-0011**, que é fonte de verdade superior e explicitamente proíbe `SyncModule` na API: diário e consentimento sincronizam direto contra Postgres via PostgREST/Realtime.
- Integração com `@forja/motor-narrativo` (`resolve()`) e `@forja/dominio` (`calcularFicha()`, `calcularVontade()`, `calcularFolego()`) para resolver sessões e projetar a ficha a partir do log de eventos local — sem duplicar regra de negócio no app.
- `apps/api` é consumido apenas para os dois fluxos que exigem `service_role`: validação de recibo de compra (`POST /entitlements/validate`) e exportação LGPD (`GET /data-export`) — conforme ADR-0011.
- 7 telas MVP: Home (dashboard ficha), Juramento (criar), Sessão (registrar → resolve), Resolução (exibir resultado), Histórico (diário), Compartilhar (artefato), Config (sync manual, LGPD, logout).
- **BREAKING**: nenhuma (primeiro app cliente do monorepo).

## Capabilities

### New Capabilities

- `mobile-offline-diary`: armazenamento local (SQLite) do diário de eventos, projeção de ficha 100% offline, sincronização direta com Supabase (RLS, sem API custom) quando há rede.
- `mobile-session-flow`: fluxo de juramento → registro de sessão → resolução via `resolve()` do motor narrativo, com ficha recalculada a partir do log de eventos (não persistida como estado mutável).
- `mobile-app-shell`: navegação (Expo Router), 7 telas MVP, integração com `apps/api` para entitlements e exportação LGPD.

### Modified Capabilities

_(nenhuma — capabilities existentes de `apps/api` não mudam; este app é um novo consumidor)_

## Impact

- Novo diretório `apps/mobile/` (Expo, React Native, TypeScript).
- Novas dependências: `expo`, `expo-router`, `expo-sqlite`, `@supabase/supabase-js`, `react-native-reanimated`, `react-native-gesture-handler`.
- Consome `@forja/motor-narrativo`, `@forja/dominio`, `@forja/schema` (workspace, sem novas mudanças nesses pacotes — D-033 preservado, app nunca reescreve regra de domínio).
- Consome `apps/api`: `POST /entitlements/validate`, `GET /data-export` (contratos já existentes, sem mudança).
- Não altera `docs/database/migrations/` — usa tabelas e RLS já existentes (`diary_events`, `consent_events`) conforme ADR-0011/migração de GRANTs.
- Corrige/substitui a orientação de `docs/implementacao/07-FASE-6-MOBILE.md` quanto a `SyncService` (doc assumia API custom; implementação segue ADR-0011).
