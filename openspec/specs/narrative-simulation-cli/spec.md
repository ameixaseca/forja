## Purpose

CLI tool that runs the `@forja/motor-narrativo` simulator against a real catalog under configurable policies and reports coverage/ratio metrics, per ESPEC v2.6 §7.1. Runs in CI alongside `catalog-verification`.

## Requirements

### Requirement: Simulator CLI wraps the motor-narrativo simulate function
The system SHALL provide a TypeScript CLI under `tooling/simulador/` that loads a JSON catalog, invokes `simulate` imported from `@forja/motor-narrativo`, and prints a console report, without reimplementing any resolution logic.

#### Scenario: CLI runs a simulation
- **WHEN** the CLI is invoked with `--catalog <path> --runs <n> --policy <name>`
- **THEN** it parses the catalog JSON, calls `@forja/motor-narrativo`'s `simulate(catalog, seed, runs, policy)`, and prints resolutions count, seen count, never-seen count, and the vistos/escritos ratio

### Requirement: Five selectable policies
The CLI SHALL accept `constante`, `erratico`, `especialista`, `pessimo`, or `intermitente` as valid values for `--policy`, matching the policies implemented in `packages/motor-narrativo/src/simulator/policies.ts`.

#### Scenario: Invalid policy name rejected
- **WHEN** the CLI is invoked with a `--policy` value not in the 5 valid names
- **THEN** it exits with a non-zero code and an error message before attempting simulation

### Requirement: Ratio band warning
The console report SHALL flag when the vistos/escritos ratio falls outside the 15%-30% target band defined by the PRD, and SHALL confirm success when within band.

#### Scenario: Ratio outside expected band
- **WHEN** a simulation run produces a vistos/escritos ratio below 15% or above 30%
- **THEN** the console report prints a warning highlighting the out-of-band ratio

#### Scenario: Ratio within expected band
- **WHEN** a simulation run produces a vistos/escritos ratio between 15% and 30% inclusive
- **THEN** the console report prints a success confirmation

### Requirement: Optional HTML report output
The CLI SHALL support an `--output <path>` flag that, when provided, writes an HTML report including the ratio and the list of never-seen storylet IDs, in addition to the console output.

#### Scenario: HTML report requested
- **WHEN** the CLI is invoked with `--output report.html`
- **THEN** an HTML file is written to that path containing the ratio and never-seen storylet list

### Requirement: CI runs the simulator on engine or content changes
The verification workflow SHALL invoke the simulator CLI against the campaign catalog with a minimum run count whenever a pull request touches `content/**` or `packages/motor-narrativo/**`, publishing the resulting report as a build artifact.

#### Scenario: PR touching motor-narrativo triggers simulation
- **WHEN** a pull request modifies a file under `packages/motor-narrativo/`
- **THEN** the `Validação de conteúdo` workflow runs the simulator CLI and uploads its report as a CI artifact
