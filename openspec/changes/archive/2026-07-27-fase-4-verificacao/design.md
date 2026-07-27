## Context

Fase 2 (`packages/motor-narrativo`) already exports a pure `simulator/` module (index.ts, policies.ts) used internally for testing the resolution engine. Fase 4 wraps this in a standalone CLI so content authors can run simulations against real catalogs without writing test code. Separately, `docs/prd/verificar.py` is a prototype static verifier that needs to graduate into a maintained, rule-per-file tool under `tooling/`. Both tools are build-time/CI tooling, not runtime code — they sit outside `packages/` and `apps/` and are explicitly allowed to depend on Node/Python I/O (D-033's purity constraint applies to `motor-narrativo`/`dominio`, not to tooling that consumes them).

## Goals / Non-Goals

**Goals:**
- Static verifier (Python) that fails CI on any of 21 catalog defect classes (T-01–T-21), each rule isolated in its own file for testability.
- Simulator CLI (TypeScript) that reuses `@forja/motor-narrativo`'s simulator without duplicating resolution logic, and reports the vistos/escritos ratio against the PRD's 15%-30% target band.
- 13 negative fixtures, each triggering exactly one rule violation, used as the verifier's own test suite.
- CI wiring so `content/` or `motor-narrativo` changes automatically re-run the verifier (ADR-0010).

**Non-Goals:**
- No changes to `packages/motor-narrativo` or `packages/dominio` internals — the simulator CLI only imports the existing public export.
- No authoring UI for storylets — verification is CLI-only per "verification is the only editorial review."
- Rules T-22 onward (if any exist beyond T-21) and simulator policies beyond the 5 named ones are out of scope for this phase.

## Decisions

- **Verifier language stays Python**: the existing prototype (`docs/prd/verificar.py`) and `cobertura.py` are already Python; keeping the evolved verifier in Python avoids a rewrite and matches the CI tooling story in ADR-0010. Rejected alternative: port to TS to unify tooling language — rejected because it would discard the working prototype's rule logic for no functional gain.
- **One rule = one file** (`regras/t01_ids_unicos.py`, etc.): matches the Fase 4 doc's directory layout and keeps each of the 21 rules independently testable against its own fixture.
- **Simulator imports `@forja/motor-narrativo` as a package dependency** rather than reimplementing resolution: enforces D-033 (motor-narrativo has no reverse dependency on tooling) and guarantees the CLI simulates exactly what the shipped engine does.
- **Fixtures are JSON, not code-generated**: 13 static broken catalogs under `tooling/fixtures/negativos/`, matching D-036 (storylets are JSON, not classes) even for negative test data.
- **CI hook**: `docs/ci-cd/.github/workflows/conteudo.yml` already exists and targets `content/` + `packages/motor-narrativo/**` changes, but points at the old paths (`docs/prd/verificar.py`) and an unimplemented `pnpm --filter @forja/motor-narrativo run simular` script with a different CLI surface (`--catalogo`/`--min-travessias`/`--saida`) than the Fase-4 doc's `tooling/simulador` (`--catalog`/`--runs`/`--policy`). Decision (confirmed with user): update `conteudo.yml` to match the `tooling/` layout — call `python tooling/verificador/verificar.py`, add `tooling/verificador` to the `paths:` trigger list, and invoke the simulator via `pnpm --filter tooling-simulador run simulate -- --catalog <path> --runs <n> --policy <name>` (or equivalent) instead of the old `motor-narrativo run simular` script. `docs/prd/verificar.py` is superseded, not kept in parallel.

## Risks / Trade-offs

- [Risk] Simulator policies (`erratico`, `pessimo`, etc.) are already implemented in `motor-narrativo/src/simulator/policies.ts` for internal tests but may not be exported publicly → Mitigation: check `packages/motor-narrativo/src/index.ts` exports before wiring the CLI; extend the public export surface only if missing (flag as a boundary change if so, since it touches `motor-narrativo`'s public API).
- [Risk] 21 rules is a lot of surface for one phase → Mitigation: implement and test incrementally, rule-by-rule, each with its own fixture-backed test, per tasks.md ordering.
- [Risk] No real catalog exists yet in `content/campanhas/espinha/` to validate the 15%-30% ratio against → Mitigation: use a synthetic test catalog (already implied by Fase 4 doc's "catálogo sintético" gate criterion) checked into `tooling/fixtures/` or `tooling/simulador/tests/`.

## Migration Plan

No production migration — this is net-new tooling. Rollout is additive: land `tooling/`, wire CI, tag `fase-4-completa`. No rollback concerns beyond reverting the CI step if it produces false positives against the real catalog once one exists.

## Open Questions

- Is there an existing synthetic test catalog fixture from Fase 2, or does one need to be authored for the simulator's ratio-check gate? (Resolve during task 3 by checking `packages/motor-narrativo/tests/simulator/` fixtures before authoring a new one.)
