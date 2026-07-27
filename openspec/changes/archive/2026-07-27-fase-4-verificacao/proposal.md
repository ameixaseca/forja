## Why

FORJA's storylet catalog has no automated editorial gate today (ADR-0010: verification IS the only review). Fase 2 (motor-narrativo) and Fase 3 (dominio) are done, but there is still no static verifier to catch malformed storylets before they reach `content/`, and no simulator to validate that a catalog actually produces the intended play experience (razão vistos/escritos 15%-30%). Fase 4 closes this gap so future content changes can be validated in CI instead of manually.

## What Changes

- Add `tooling/verificador/` — Python CLI (`verificar.py`) that validates a storylet catalog against rules T-01 through T-21 (ESPEC §7.2): unique IDs, valid references, well-formed predicates, sequential chapters, valid subclasses/bands, recognition requirements, etc.
- Add `tooling/simulador/` — TypeScript CLI that reuses `@forja/motor-narrativo`'s existing `simulator/` module to run N resolutions under 5 policies (constante, erratico, especialista, pessimo, intermitente) and report seen/never-seen storylet ratios.
- Add `tooling/fixtures/negativos/` — 13 deliberately broken catalog fixtures (T-01 through T-13), one per rule violation, used to prove the verifier actually catches each error class.
- Wire `verificar.py` into CI so it runs automatically when `content/` or `packages/motor-narrativo/` change (ADR-0010).

## Capabilities

### New Capabilities
- `catalog-verification`: static validation of storylet catalogs (Python CLI, rules T-01–T-21, negative fixtures proving each rule fires)
- `narrative-simulation-cli`: CLI tool that runs the motor-narrativo simulator against a catalog under configurable policies and reports coverage/ratio metrics

### Modified Capabilities
(none — `openspec/specs/` is currently empty; Fases 2/3 predate this OpenSpec workflow)

## Impact

- New directory `tooling/` (verificador, simulador, fixtures) — no changes to `packages/motor-narrativo` or `packages/dominio` source, only consumption of `@forja/motor-narrativo`'s public simulator export.
- CI: new/updated workflow step running `python tooling/verificador/verificar.py` (per ADR-0010, D-036 gate).
- External deps added: Python (click, rich, pytest) for verificador; Node (commander, chalk, vitest) for simulador — both offline, no runtime/network dependency (respects D-002, D-008).
- No DB, API, or mobile/web impact.
