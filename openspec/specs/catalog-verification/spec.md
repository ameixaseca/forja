## Purpose

Static validation of storylet catalogs against ESPEC v2.6 §7.2 (the subset of T-01–T-21 that is checkable without running the simulator) plus schema-sanity checks the catalog format itself requires. Runs in CI as the only editorial gate for `content/` (ADR-0010).

## Requirements

### Requirement: Static catalog verifier CLI
The system SHALL provide a Python CLI at `tooling/verificador/verificar.py` that accepts a catalog path argument and exits with code 1 if any rule fails, printing each error, or exits 0 with a success message if all rules pass.

#### Scenario: Valid catalog passes
- **WHEN** `verificar.py` runs against a catalog satisfying all implemented rules
- **THEN** it prints a success message and exits with code 0

#### Scenario: Invalid catalog fails with details
- **WHEN** `verificar.py` runs against a catalog violating one or more rules
- **THEN** it prints one error line per violation, identifying the failing rule, and exits with code 1

### Requirement: ESPEC §7.2 static rule coverage
The verifier SHALL implement one isolated rule module per rule ID under `tooling/verificador/regras/`, covering the ESPEC v2.6 §7.2 rules classified as `estático` (not requiring simulation): T-01 (unique IDs), T-02 (no effect writes `in.`/`sys.`/`cap.`), T-03 (valid operators and value types), T-04 (predicate depth ≤ 3), T-05 (fallback variant present), T-07 (recognition minimum: ≥1 Espinha storylet plus `st_cor_fallback`), T-08 (every read quality has a writer or is a system quality), T-14 (ASCII lowercase quality names), T-18 (Cor neutral layer ≥ 60%), T-19 (`arco.tom` domain ≤ 4 values), and T-21 (every complication has ≥2 closures, ≥1 without an attribute condition).

T-06 (entity references) and T-17 (Cor pool size vs. the runtime `K` constant) are out of scope: the catalog schema (`packages/motor-narrativo/src/types.ts`) declares no separate entity list to validate against, and T-17 depends on a runtime-computed constant and reachability analysis, not static inspection. T-09 through T-13, T-15, T-16, T-20, T-22 and beyond are simulation-based, retired, or motor-level and belong to `narrative-simulation-cli` or motor-narrativo's own test suite, not this static verifier.

#### Scenario: Each rule is independently invocable
- **WHEN** a rule module's `verificar(catalog)` method is called directly with a catalog dict
- **THEN** it returns a `Resultado` with `sucesso` and a list of `erros`, without depending on any other rule module's execution

### Requirement: Schema-sanity rules beyond ESPEC §7.2
The verifier SHALL also check catalog structural validity not covered by named ESPEC rules, since the catalog has no separate JSON-schema validation step: valid `banda` (SCH-01), valid `subclasse` (SCH-02), sequential declared chapters (SCH-03), non-empty catalog (SCH-04), well-formed variants — non-empty `texto`, `efeitos` is an object (SCH-05), and no circular read/write dependency between qualities (SCH-06).

#### Scenario: Structural defect reported distinctly from ESPEC rules
- **WHEN** a catalog has an invalid `banda` value
- **THEN** the verifier reports it under rule SCH-01, not under a T-xx rule id

### Requirement: Negative fixtures prove rule coverage
The system SHALL provide 13 catalog fixtures under `tooling/fixtures/negativos/`, each violating exactly one rule (duplicate ID, broken reference, invalid band, invalid subclass, chapter gap, missing Espinha, missing fallback, malformed predicate, variant without text, invalid effect value, circular quality dependency, empty catalog, malformed JSON), and a test suite that asserts the verifier reports the expected rule ID for each fixture.

#### Scenario: Fixture triggers its specific rule
- **WHEN** the verifier runs against `tooling/fixtures/negativos/01-id-duplicado.json`
- **THEN** the reported error identifies rule T-01 and no other rule fails spuriously

#### Scenario: Empty-catalog fixture is an accepted exception
- **WHEN** the verifier runs against `tooling/fixtures/negativos/12-vazio.json`
- **THEN** SCH-04 (empty catalog) is among the reported errors, even though other rules such as T-07 also necessarily fail on an empty catalog

### Requirement: CI runs the verifier on content or engine changes
The verification workflow SHALL invoke `python tooling/verificador/verificar.py` against the campaign catalog whenever a pull request touches `content/**`, `packages/motor-narrativo/**`, or `tooling/verificador/**`, and SHALL block the merge if it exits non-zero (ADR-0010: verification is the only editorial gate).

#### Scenario: PR touching content triggers verification
- **WHEN** a pull request modifies a file under `content/`
- **THEN** the `Validação de conteúdo` workflow runs `tooling/verificador/verificar.py` and fails the check if the catalog is invalid
