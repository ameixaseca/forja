# Agent Instructions — FORJA

Terse like caveman. Technical substance exact. Only fluff die. Drop: articles, filler (just/really/basically), pleasantries, hedging. Fragments OK. Short synonyms. Code unchanged. Pattern: [thing] [action] [reason]. [next step]. ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift. Code/commits/PRs: normal. Off: "stop caveman" / "normal mode".

## Project state

**No code yet.** Repo = docs + specs only. OpenSpec workflow active. Changes go through: propose → apply → archive.

## Architecture source of truth

Trust order: PRD (`docs/prd/PRD-Forja-v0_14.md`) → ADRs (`docs/adr/`) → C4 diagrams (`docs/c4/`) → DB schema (`docs/database/`).

**Monorepo structure (planned):**

- `packages/motor-narrativo` — pure TypeScript narrative engine, no React/Node/platform deps (ADR-0001, D-033)
- `packages/dominio` — domain rules, same constraints
- `apps/mobile` — React Native
- `apps/web` — React Native Web (ADR-0008)
- `apps/api` — NestJS over Fastify (ADR-0003)
- `content/` — storylet JSON catalog, embedded in binaries (D-036)

**Key constraints from PRD:**

- D-001: Single-player, no multiplayer
- D-002: No LLM in runtime
- D-008: Offline-first
- D-031: Campaigns are compiled; each campaign = new release
- D-033: Narrative subsystem never imports from UI/training/character modules
- D-036: Storylets as JSON embedded in binary, not YAML, not classes

## Content verification

**Python scripts are part of the build, not runtime:**

- `docs/prd/verificar.py` — validates prototype against ESPEC rules and cross-references
- `docs/testes/cobertura.py` — checks BDD feature coverage against requirements
- Both run in CI when `content/` or `packages/motor-narrativo/` change (ADR-0010)
- Paths hardcoded to `/home/claude` or `/mnt/user-data/uploads` — adjust when running locally

**Verification is the only editorial review.** No manual approval gate for storylet catalog (ci-cd/README.md).

## Database

PostgreSQL via Supabase. Schema in `docs/database/migrations/`, numbered by timestamp, order-dependent.

**What Postgres DOES NOT store:**

- Storylet content, qualities, entities (lives in app binary per D-036)
- Character sheet (recalculated client-side from `diary_events` log per ADR-0002)

**What it stores:**

- `diary_events` — append-only event log, source of truth for progression
- `campaign_instances` — user's campaign state (snapshot is cache only)
- `entitlements` — purchase validation, written by `service_role` only
- `profiles`, `consent_events`, `deletion_requests` — account/LGPD
- `storylet_kill_switch` — admin source only, never read in runtime (ADR-0004)

**Two access paths, same RLS barrier:**

- Direct via Supabase SDK (diary sync, consent, instances) — uses `auth.uid()`
- Via NestJS API (receipt validation only) — uses `service_role`, bypasses RLS

## CI/CD (planned workflows in `docs/ci-cd/.github/workflows/`)

Commands when code exists:

```bash
# Lint, typecheck, test (Turborepo detects affected packages)
pnpm lint
pnpm typecheck
pnpm test

# Content verification (run before any storylet change)
python docs/prd/verificar.py
python docs/testes/cobertura.py

# Database dry-run (Supabase CLI)
supabase link --project-ref <ref>
supabase db push --dry-run
```

**Mobile release:** Never automatic. Tag `mobile-v*` or manual trigger → EAS Build → manual gate before store submission (ADR-0014, D-031).

**Kill-switch:** Manual workflow only, publishes to CDN outside API perimeter (ADR-0004).

## Testing requirement

Every added functionality must include:

- Unit tests
- Integration tests
- Mutation tests

No feature considered complete without these three test layers.

## OpenSpec workflow

Skills available: `openspec-propose`, `openspec-apply-change`, `openspec-explore`, `openspec-archive-change`, `openspec-sync-specs`.

Changes live in `openspec/changes/`, specs in `openspec/specs/` (currently empty).

When implementing from OpenSpec tasks, verify against:

- D-033 (narrative subsystem isolation)
- D-036 (JSON catalog format)
- RF-036 (narrative engine must be pure function: state + inputs + seed → result)

## Requirements inventory

PRD uses: RF (functional), RN (business rules), RE (non-functional), RC (compliance).
ESPEC uses: T (test cases), M (metrics).

**Deliberate gaps** (not testable via automation):

- RF-030, RF-035, RF-036 — architecture, covered by code structure
- RC-033, RC-034 — authorship process
- RC-041, RC-042, RC-043 — dormant until i18n expansion

## Language

PRD/ESPEC/ADRs in pt-BR. Code/comments/commits should follow repo conventions once established. MVP launches Brazil-only (D-039, D-037).
