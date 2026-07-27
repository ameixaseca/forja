# Domínio — FORJA

Pure TypeScript business rules for progression: Juramento, Ciclo, Fôlego, Vontade,
Marcos, and event sourcing of the character sheet (`Ficha`). Zero external
dependencies (D-033).

## Features

- Ciclo progression as a pure ratio of `diasTreinados / diasJurados` (RN-001, RN-002)
- Trégua and Trégua de Recuperação exclude a ciclo from "cumprido" (RN-038, RF-007A)
- Fôlego: teto de 2 por ciclo, acúmulo máximo de 4, dobrado em deload (D-044, RF-080, RF-082)
- Vontade: curva 0/+1/+2/+3 aos 2/6/14 ciclos cumpridos (RN-005, PRD §4.4)
- Marcos: cooldown de 2 ciclos por rótulo iniciado na declaração (RF-043, DI-008), teto
  de 2 contabilizados por ciclo (RF-042), conversão de 3 Marcos em +1 atributo com teto
  5 (RF-049)
- `calcularFicha(eventos)`: projeta a `Ficha` inteira a partir do log de `diary_events`
  (ADR-0002) — a ficha nunca é uma fonte de verdade própria, sempre um replay

## Usage

```typescript
import { calcularFicha, type DiaryEvent } from '@forja/dominio';

const ficha = calcularFicha(eventos as DiaryEvent[]);
console.log(ficha.vontade, ficha.folego, ficha.atributos);
```

## Tests

```bash
pnpm test              # unit + integration (vitest)
pnpm test:mutation     # Stryker — score ≥80% exigido (break em 60%)
```

## Escopo não coberto nesta fase

- RF-047 (sugestão de Marco por discrepância no histórico) e RF-048 (janela de 21 dias
  sem sessão invalidando contabilização) dependem de contexto histórico fora do escopo
  de um projector puro por replay linear — ficam para uma fase de refinamento com acesso
  ao histórico completo de sessões.
