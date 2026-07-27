# Motor Narrativo — FORJA

Pure TypeScript narrative engine implementing ESPEC v2.6. Zero external dependencies (D-033).

## Features

- Deterministic resolution (RF-036): `state + inputs + seed → result`
- Band selection: Espinha > Arco > Cor
- Kill-switch support (M-03): never disables Espinha or `st_cor_fallback`
- Safety-net (M-04): always falls back to `st_cor_fallback` when the eligible pool is empty
- Cor bag (ESPEC §6.1/§3.1): draw-without-replacement per storylet; on exhaustion, refills
  excluding the K most-recently-drawn (`K = min(3×ritmo_placeholder, floor(0.4×pool))`),
  reinserted only at the following refill (`src/selector/bag.ts`)
- Espinha/Arco tie-break (DI-007): seeded RNG choice over the eligible pool
- Simulator with 3 policies (constante, erratico, intermitente)

## Usage

```typescript
import { resolve, simulate } from '@forja/motor-narrativo';

const result = resolve(catalog, state, inputs, seed);
console.log(result.texto);

const report = simulate(catalog, seed, 50, 'constante');
console.log(report.razao_vistos_escritos); // esperado 0.15-0.3 em catálogo sintético 20 storylets
```

## Tests

```bash
pnpm test               # tudo
pnpm test:unit          # tests/unit
pnpm test:integration   # tests/integration (M-01 a M-09)
pnpm test:simulator     # tests/simulator
pnpm test:coverage      # cobertura
pnpm test:mutation      # Stryker
```

## Invariantes (M-XX)

- M-01: Trégua → apenas Cor
- M-02: Reencontro → subclasse ausencia
- M-03: Kill-switch nunca desativa Espinha/fallback
- M-04: Safety-net → st_cor_fallback
- M-05: Determinismo (mesma seed → mesmo resultado)
- M-06: Pressão → apenas closures
- M-07: Ponto de escolha 2-3 opções (não implementado nesta fase — UI)
- M-08: Sessão secundária → apenas Cor
- M-09: Fila K sobre elegíveis, não total
