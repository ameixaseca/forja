## ADDED Requirements

### Requirement: Static catalog verifier CLI
The system SHALL provide a Python CLI at `tooling/verificador/verificar.py` that accepts a catalog path argument and exits with code 1 if any rule fails, printing each error, or exits 0 with a success message if all rules pass.

#### Scenario: Valid catalog passes
- **WHEN** `verificar.py` runs against a catalog satisfying all T-01–T-21 rules
- **THEN** it prints a success message and exits with code 0

#### Scenario: Invalid catalog fails with details
- **WHEN** `verificar.py` runs against a catalog violating one or more rules
- **THEN** it prints one error line per violation, identifying the failing rule, and exits with code 1

### Requirement: Rule T-01 through T-21 coverage
The verifier SHALL implement one isolated rule module per rule ID (T-01 through T-21) under `tooling/verificador/regras/`, covering: unique storylet IDs, valid cross-references (qualities/entities exist), well-formed predicates (valid operators), sequential chapters, valid subclasses (`ausencia`, `marco`, `sessao`, `null`), valid bands (`Espinha`, `Arco`, `Cor`), recognition minimums (at least one Espinha storylet plus `st_cor_fallback`), and the remaining ESPEC §7.2 properties (T-08 through T-21).

#### Scenario: Each rule is independently invocable
- **WHEN** a rule module's `verificar(catalog)` method is called directly with a catalog dict
- **THEN** it returns a `Resultado` with `sucesso` and a list of `erros`, without depending on any other rule module's execution

### Requirement: Negative fixtures prove rule coverage
The system SHALL provide 13 catalog fixtures under `tooling/fixtures/negativos/`, each violating exactly one rule (duplicate ID, broken reference, invalid band, invalid subclass, chapter gap, missing Espinha, missing fallback, malformed predicate, variant without text, invalid effect reference, circular predicate reference, empty catalog, malformed JSON), and a test suite that asserts the verifier reports the expected rule ID for each fixture.

#### Scenario: Fixture triggers its specific rule
- **WHEN** the verifier runs against `tooling/fixtures/negativos/01-id-duplicado.json`
- **THEN** the reported error identifies rule T-01 and no other rule fails spuriously

### Requirement: CI runs the verifier on content or engine changes
The verification workflow SHALL invoke `python tooling/verificador/verificar.py` against the campaign catalog whenever a pull request touches `content/**`, `packages/motor-narrativo/**`, or `tooling/verificador/**`, and SHALL block the merge if it exits non-zero (ADR-0010: verification is the only editorial gate).

#### Scenario: PR touching content triggers verification
- **WHEN** a pull request modifies a file under `content/`
- **THEN** the `Validação de conteúdo` workflow runs `tooling/verificador/verificar.py` and fails the check if the catalog is invalid
