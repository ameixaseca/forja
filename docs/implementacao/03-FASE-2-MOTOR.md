# Fase 2: Motor Narrativo — FORJA

**Duração:** 3 semanas  
**Dependências:** Fase 1 (monorepo funcional)  
**Objetivo:** Implementar motor narrativo ESPEC v2.6, testes M-01 a M-09

---

## AI Agent Context

**Fonte verdade:**

- `docs/prd/ESPEC-Sistema-Narrativo-v2_6.md` (algoritmo §6, tipos §2-3, testes M-01 a M-09)
- RF-036 (motor função pura: state + inputs + seed → result)
- D-033 (zero deps React/Node/platform)
- DI-007 (tie-breaker seeded)
- DI-011 (`in.reencontro` >=10 dias)

**Artefatos entrada:**

- `packages/motor-narrativo/` placeholder (Fase 1)

**Artefatos saída esperados:**

```
packages/motor-narrativo/
├── src/
│   ├── index.ts               # API pública
│   ├── types.ts               # State, Inputs, Storylet, etc.
│   ├── resolve.ts             # Função principal
│   ├── rng.ts                 # SeededRNG (Mulberry32)
│   ├── selector/
│   │   ├── predicate.ts       # Avaliar predicados
│   │   ├── eligibility.ts     # Filtro elegibilidade
│   │   ├── bands.ts           # Espinha > Arco > Cor
│   │   ├── exclusion.ts       # Fila K (60%)
│   │   └── tiebreaker.ts      # DI-007 seeded
│   ├── safety-net.ts          # M-04 fallback
│   └── simulator/
│       ├── index.ts           # simulate()
│       └── policies.ts        # 5 políticas
├── tests/
│   ├── unit/
│   │   ├── rng.test.ts
│   │   ├── predicate.test.ts
│   │   ├── eligibility.test.ts
│   │   └── exclusion.test.ts
│   ├── integration/
│   │   ├── M-01.test.ts       # Trégua → Cor
│   │   ├── M-02.test.ts       # Reencontro → ausencia
│   │   ├── M-03.test.ts       # Kill-switch não Espinha
│   │   ├── M-04.test.ts       # Safety-net fallback
│   │   ├── M-05.test.ts       # Determinismo cross-platform
│   │   ├── M-06.test.ts       # Pressão → closures
│   │   ├── M-07.test.ts       # Ponto escolha 2-3 opções
│   │   ├── M-08.test.ts       # Sessão secundária → Cor
│   │   └── M-09.test.ts       # K sobre elegíveis
│   ├── simulator/
│   │   └── policies.test.ts
│   └── fixtures/
│       ├── minimal-catalog.json
│       ├── espinha-only.json
│       ├── arco-closures.json
│       └── cor-ausencia.json
└── README.md
```

**Comandos verificação:**

```bash
cd packages/motor-narrativo
pnpm test:unit          # Unit tests
pnpm test:integration   # M-01 a M-09 (100%)
pnpm test:simulator     # Razão 0.15-0.3
pnpm test:coverage      # >=80%
```

**Dependências externas:** Zero (D-033). Apenas devDeps: typescript, vitest.

---

## 1. Tipos Principais (types.ts)

Referência §3 versão anterior (linhas 108-200). Agent deve implementar:

- `State` com `qualities: Record<string, number | boolean>`
- `Inputs` com rolagem, atributo, vontade, ciclo_cumprido, tregua, reencontro, sessao_secundaria
- `Band` = 'Espinha' | 'Arco' | 'Cor'
- `Subclass` = 'ausencia' | 'marco' | 'sessao' | null
- `Predicate` com qual, op, valor, e?, ou?
- `Variant` com quando?, texto, efeitos
- `Storylet` com id, banda, subclasse, capitulo?, requer?, variantes
- `Catalog` com storylets[]
- `ResolutionResult` com storylet, variant, texto, efeitos, newState

---

## 2. Implementação Core (Semana 1)

### Tarefa 2.1: RNG Seeded

**Agente:** `write`
**Arquivo:** `src/rng.ts`
**Implementação:** Mulberry32 algorithm (§4.1.1 versão anterior)
**Métodos:** `next(): number`, `nextInt(min, max): number`, `choice<T>(arr: T[]): T`
**Teste:** `tests/unit/rng.test.ts` — determinismo (seed 42 gera seq idêntica 2x)
**Verificação:** `pnpm test tests/unit/rng.test.ts` passa

---

### Tarefa 2.2: Predicados

**Agente:** `write`
**Arquivo:** `src/selector/predicate.ts`
**Função:** `evaluatePredicate(pred: Predicate | undefined, state: State): boolean`
**Implementação:** §4.1.2 versão anterior (operadores ==, !=, >, <, >=, <=, e, ou)
**Teste:** `tests/unit/predicate.test.ts` — operadores + nested e/ou
**Verificação:** Passa

---

### Tarefa 2.3: Elegibilidade

**Agente:** `write`
**Arquivo:** `src/selector/eligibility.ts`
**Funções:**

- `isEligible(st, state, inputs, killSwitch): boolean`
- `filterEligible(storylets[], state, inputs, killSwitch): Storylet[]`
  **Regras:**
- M-03: Kill-switch NÃO desativa Espinha nem st_cor_fallback
- Capítulo match `state.qualities['cap.atual']`
- Predicado `requer` satisfeito
- `sys.visto.{id}` = 0 ou undefined (exceto Espinha/fallback)
  **Teste:** `tests/unit/eligibility.test.ts`
  **Verificação:** Passa

---

### Tarefa 2.4: Bandas

**Agente:** `write`
**Arquivo:** `src/selector/bands.ts`
**Função:** `selectBand(catalog, state, inputs, killSwitch): { band: Band, pool: Storylet[] }`
**Lógica:**

- M-01: `if (inputs.tregua) → banda Cor`
- M-08: `if (inputs.sessao_secundaria) → banda Cor`
- Senão: Espinha > Arco > Cor (primeira não-vazia)
- M-06: Se Arco + `state.qualities['cap.estagio'] === 'pressao'` → filtrar só closures (id contém 'closure')
  **Teste:** `tests/integration/M-01.test.ts`, `M-06.test.ts`, `M-08.test.ts`
  **Verificação:** Passa

---

### Tarefa 2.5: Exclusão (Fila K)

**Agente:** `write`
**Arquivo:** `src/selector/exclusion.ts`
**Funções:**

- `calculateK(state): number` — retorna `floor(teto_modalidade * 0.6)` (DI-002). Placeholder: teto=10 → K=6
- `applyExclusion(pool, state): Storylet[]` — M-09: K aplicado sobre pool elegível
  - Se pool.length <= K → retorna pool intacto
  - Senão: ordena por `sys.visto.{id}` decrescente, remove top K
- `selectOne(pool, rng): Storylet` — DI-007: `rng.choice(pool)`
  **Teste:** `tests/integration/M-09.test.ts`
  **Verificação:** Passa

---

## 3. Função resolve() (Semana 2)

### Tarefa 2.6: resolve()

**Agente:** `write`
**Arquivo:** `src/resolve.ts`
**Assinatura:**

```typescript
export function resolve(
  catalog: Catalog,
  state: State,
  inputs: Inputs,
  seed: number,
  killSwitch: string[] = []
): ResolutionResult;
```

**Passos (§5.1.1 versão anterior):**

1. `const rng = new SeededRNG(seed)`
2. `const { band, pool } = selectBand(catalog.storylets, state, inputs, killSwitch)`
3. `let finalPool = pool; if (band === 'Cor') finalPool = applyExclusion(pool, state)`
4. M-04: `if (finalPool.length === 0) return applySafetyNet(catalog, state, inputs, seed)`
5. M-02: `if (inputs.reencontro) { const ausencia = finalPool.filter(st => st.subclasse === 'ausencia'); if (ausencia.length > 0) finalPool = ausencia }`
6. `const selected = selectOne(finalPool, rng)`
7. `const variant = selectVariant(selected.variantes, state, rng)`
8. `const newState = applyEffects(state, variant.efeitos, selected.id)`
9. `return { storylet, variant, texto, efeitos, newState }`

**Funções auxiliares:**

- `selectVariant(variants, state, rng): Variant` — filtra elegíveis por `quando`, fallback primeira sem `quando`, tie-break com rng
- `applyEffects(state, effects, storyletId): State` — aplica effects, incrementa `sys.visto.{id}`, `sys.resolucoes`, `cap.resolucoes` (ESPEC §5)

**Teste:** `tests/integration/M-02.test.ts`
**Verificação:** Passa

---

### Tarefa 2.7: Safety-net

**Agente:** `write`
**Arquivo:** `src/safety-net.ts`
**Função:** `applySafetyNet(catalog, state, inputs, seed): ResolutionResult`
**Lógica:** Busca `st_cor_fallback` no catalog, retorna primeira variante, aplica reconhecimento (§5.1.2)
**Teste:** `tests/integration/M-04.test.ts` — quando pool vazio, retorna fallback
**Verificação:** Passa

---

## 4. Simulador (Semana 2)

### Tarefa 2.8: Políticas

**Agente:** `write`
**Arquivo:** `src/simulator/policies.ts`
**Implementar 3 políticas (§5.2.1 versão anterior):**

- `ConstantePolicy`: rolagem=8, atributos=1, vontade=1, cumprido=true
- `ErraticoPolicy`: random rolagem 2-15, atributos 0-5, cumprido 60% chance
- `IntermitentePolicy`: trégua cada 3 ciclos, reencontro cada 4 ciclos
  **Interface:** `PolicyGenerator` com `nextInputs(ciclo, resolucao): Inputs`
  **Verificação:** `tests/simulator/policies.test.ts`

---

### Tarefa 2.9: Simulador

**Agente:** `write`
**Arquivo:** `src/simulator/index.ts`
**Função:** `simulate(catalog, seed, n, policy): SimulationReport`
**Lógica:** Loop n resoluções, incrementa seed cada vez, coleta IDs vistos, calcula razão vistos/escritos (§5.2.2)
**Report:** `{ resolutions, vistos, nunca_vistos, razao_vistos_escritos }`
**Teste:** Com catálogo 20 storylets, n=50, razão 0.15-0.3 esperado
**Verificação:** Passa

---

## 5. Testes M-01 a M-09 (Semana 3)

### Tarefa 2.10: Fixtures Sintéticos

**Agente:** `write`
**Arquivos:**

- `tests/fixtures/minimal-catalog.json` (§6.1.1 versão anterior)
  - st_espinha_abertura_cap1 (Espinha, cap 1)
  - st_cor_fallback (Cor, cap null)
  - st_cor_ausencia_1 (Cor, subclasse ausencia)
- `tests/fixtures/arco-closures.json`
  - st_arco_complicacao_1 (Arco, id sem 'closure')
  - st_arco_closure_1 (Arco, id contém 'closure')
- `tests/fixtures/espinha-only.json`
  - 5 storylets Espinha cap 1-5
    **Verificação:** JSON válido, parse sem erros

---

### Tarefa 2.11: Testes Integração M-01 a M-09

**Agente:** `write`
**Arquivos:** `tests/integration/M-01.test.ts` a `M-09.test.ts`
**M-01:** `inputs.tregua = true` → `result.storylet.banda === 'Cor'`
**M-02:** `inputs.reencontro = true` + fixture com ausencia → seleciona ausencia
**M-03:** killSwitch inclui Espinha ID → Espinha ainda selecionada; killSwitch inclui st_cor_fallback → fallback ainda usado
**M-04:** Pool vazio → retorna st_cor_fallback
**M-05:** Seed 42 em 2 runs → sequência idêntica (cross-platform: assumir Node.js Math.imul consistente)
**M-06:** `state.qualities['cap.estagio'] = 'pressao'` → apenas closures elegíveis
**M-07:** (Não implementado Fase 2 — ponto escolha é UI. Skip ou placeholder assertion.)
**M-08:** `inputs.sessao_secundaria = true` → banda Cor
**M-09:** Pool 10 storylets, K=6 → após exclusão <= 4 storylets
**Verificação:** `pnpm test:integration` 100% verde

---

## 6. Documentação e Polimento (Semana 3)

### Tarefa 2.12: README

**Agente:** `write`
**Arquivo:** `packages/motor-narrativo/README.md`
**Conteúdo (§6.2.1 versão anterior):**

- Features (determinismo, bandas, kill-switch, safety-net, simulador)
- Usage exemplo
- Scripts teste
- Invariantes M-01 a M-09
  **Verificação:** README existe, menciona M-XX

---

### Tarefa 2.13: Scripts package.json

**Agente:** `edit`
**Arquivo:** `packages/motor-narrativo/package.json`
**Adicionar scripts (§6.2.2):**

```json
"test:unit": "vitest run tests/unit",
"test:integration": "vitest run tests/integration",
"test:simulator": "vitest run tests/simulator",
"test:coverage": "vitest run --coverage"
```

**Verificação:** `pnpm test:unit` roda apenas unit

---

## 7. Critérios Gate

- [ ] Testes M-01 a M-09 100% verde
- [ ] Simulador 3+ políticas funcional
- [ ] Razão vistos/escritos 0.15-0.3 em catálogo sintético 20 storylets, n=50
- [ ] Determinismo validado (M-05)
- [ ] Coverage >=80%
- [ ] CI passando
- [ ] Zero deps externas (D-033)
- [ ] README completo
- [ ] Tag `fase-2-completa`

---

## 8. Checklist Saída

- [ ] `@forja/motor-narrativo` funcional
- [ ] Testes M-01 a M-09 (100%)
- [ ] Simulador 3 políticas
- [ ] Coverage >=80%
- [ ] Zero deps
- [ ] README
- [ ] Tag `fase-2-completa`

**Próxima fase:** Fase 3 (Domínio) — 2 semanas

```
packages/motor-narrativo/
├── src/
│   ├── index.ts                  # API pública
│   ├── types.ts                  # Types principais
│   ├── resolve.ts                # Função principal resolve()
│   ├── selector/
│   │   ├── index.ts              # Lógica de seleção §6
│   │   ├── eligibility.ts        # Filtro de elegibilidade
│   │   ├── bands.ts              # Espinha > Arco > Cor
│   │   ├── exclusion.ts          # Fila K (DEF-01: K=60%)
│   │   └── tiebreaker.ts         # Ordenação em empate (DI-007)
│   ├── effects.ts                # Aplicar efeitos
│   ├── recognition.ts            # sys.visto, ent.conhecido
│   ├── kill-switch.ts            # M-03: nunca desativa Espinha
│   ├── safety-net.ts             # M-04: fallback Cor
│   ├── simulator/
│   │   ├── index.ts              # Simular(seed, n, politica)
│   │   ├── policies.ts           # 5 políticas
│   │   └── reporter.ts           # Razão vistos/escritos, histograma
│   └── rng.ts                    # RNG seeded (determinismo)
├── tests/
│   ├── unit/
│   │   ├── resolve.test.ts
│   │   ├── eligibility.test.ts
│   │   ├── exclusion.test.ts
│   │   └── rng.test.ts
│   ├── integration/
│   │   ├── M-01.test.ts          # Trégua → apenas Cor
│   │   ├── M-02.test.ts          # Reencontro → subclasse ausencia
│   │   ├── M-03.test.ts          # Kill-switch não desativa Espinha
│   │   ├── M-04.test.ts          # Safety-net → st_cor_fallback
│   │   ├── M-05.test.ts          # Determinismo cross-platform
│   │   ├── M-06.test.ts          # Pressão → apenas closures
│   │   ├── M-07.test.ts          # Ponto de escolha 2-3 opções
│   │   ├── M-08.test.ts          # Sessão secundária → apenas Cor
│   │   └── M-09.test.ts          # Fila K sobre elegíveis, não total
│   ├── simulator/
│   │   ├── simulator.test.ts
│   │   └── policies.test.ts
│   └── fixtures/
│       ├── minimal-catalog.json  # Catálogo sintético mínimo
│       ├── espinha-only.json     # Só storylets Espinha
│       ├── arco-closures.json    # Complicações + closures
│       └── cor-ausencia.json     # Subclasse ausencia
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

### 2.2 API Pública

```typescript
// src/index.ts
export { resolve, type ResolutionResult } from './resolve';
export { simulate, type SimulationReport } from './simulator';
export type { State, Inputs, Storylet, Variant, Catalog, Band, Subclass, Policy } from './types';
```

---

## 3. Tipos Principais

### 3.1 `src/types.ts`

```typescript
/**
 * Estado do mundo (ESPEC §2)
 */
export interface State {
  qualities: Record<string, number | boolean>;
}

/**
 * Entradas da resolução (ESPEC §2.2)
 */
export interface Inputs {
  rolagem: number; // 2d6 + Vontade (2..15)
  atributo: {
    forca: number; // 0..5
    vigor: number;
    destreza: number;
  };
  vontade: number; // 0..3
  ciclo_cumprido: boolean;
  tregua: boolean;
  reencontro: boolean;
  sessao_secundaria: boolean;
}

/**
 * Banda (ESPEC §3)
 */
export type Band = 'Espinha' | 'Arco' | 'Cor';

/**
 * Subclasse (ESPEC §3.3)
 */
export type Subclass = 'ausencia' | 'marco' | 'sessao' | null;

/**
 * Predicado (ESPEC §3.1)
 */
export interface Predicate {
  qual: string;
  op: '==' | '!=' | '>' | '<' | '>=' | '<=';
  valor: number | boolean;
  e?: Predicate;
  ou?: Predicate;
}

/**
 * Variante de storylet (ESPEC §3.1)
 */
export interface Variant {
  quando?: Predicate; // Condição para esta variante
  texto: string; // Referência a recurso de texto
  efeitos: Record<string, number | boolean>; // Efeitos aplicados
}

/**
 * Storylet (ESPEC §3)
 */
export interface Storylet {
  id: string;
  banda: Band;
  subclasse: Subclass;
  capitulo?: number; // null = elegível em qualquer capítulo
  requer?: Predicate; // Pré-requisito de elegibilidade
  variantes: Variant[];
}

/**
 * Catálogo (lista de storylets)
 */
export interface Catalog {
  storylets: Storylet[];
}

/**
 * Resultado de resolução
 */
export interface ResolutionResult {
  storylet: Storylet;
  variant: Variant;
  texto: string;
  efeitos: Record<string, number | boolean>;
  newState: State; // Estado após aplicar efeitos
}

/**
 * Política de simulação (ESPEC §7.1)
 */
export type Policy = 'constante' | 'erratico' | 'especialista' | 'pessimo' | 'intermitente';
```

---

## 4. Implementação: Semana 1

### 4.1 Dia 1-2: RNG e Predicados

**4.1.1 `src/rng.ts`**

```typescript
/**
 * RNG seeded para determinismo (RF-036, M-05)
 * Implementação: Mulberry32 (simple, fast, deterministic)
 */
export class SeededRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0; // Ensure unsigned 32-bit
  }

  /**
   * Retorna float [0, 1)
   */
  next(): number {
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Retorna int [min, max] (inclusive)
   */
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Escolhe elemento aleatório de array
   */
  choice<T>(arr: T[]): T {
    return arr[Math.floor(this.next() * arr.length)];
  }
}
```

**Testes (tests/unit/rng.test.ts):**

```typescript
import { describe, it, expect } from 'vitest';
import { SeededRNG } from '../../src/rng';

describe('SeededRNG', () => {
  it('should be deterministic', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(42);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).toEqual(seq2);
  });

  it('should produce different sequences for different seeds', () => {
    const rng1 = new SeededRNG(42);
    const rng2 = new SeededRNG(43);

    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());

    expect(seq1).not.toEqual(seq2);
  });

  it('should choose from array deterministically', () => {
    const rng1 = new SeededRNG(100);
    const rng2 = new SeededRNG(100);
    const arr = ['a', 'b', 'c', 'd'];

    const choices1 = Array.from({ length: 20 }, () => rng1.choice(arr));
    const choices2 = Array.from({ length: 20 }, () => rng2.choice(arr));

    expect(choices1).toEqual(choices2);
  });
});
```

**4.1.2 `src/selector/predicate.ts`**

```typescript
import { Predicate, State } from '../types';

/**
 * Avalia predicado contra estado (ESPEC §3.1)
 */
export function evaluatePredicate(pred: Predicate | undefined, state: State): boolean {
  if (!pred) return true;

  const value = state.qualities[pred.qual];
  let result: boolean;

  switch (pred.op) {
    case '==':
      result = value === pred.valor;
      break;
    case '!=':
      result = value !== pred.valor;
      break;
    case '>':
      result = (value as number) > (pred.valor as number);
      break;
    case '<':
      result = (value as number) < (pred.valor as number);
      break;
    case '>=':
      result = (value as number) >= (pred.valor as number);
      break;
    case '<=':
      result = (value as number) <= (pred.valor as number);
      break;
  }

  if (pred.e) {
    result = result && evaluatePredicate(pred.e, state);
  }

  if (pred.ou) {
    result = result || evaluatePredicate(pred.ou, state);
  }

  return result;
}
```

**Checklist Dia 1-2:**

- [ ] `rng.ts` implementado
- [ ] Testes de determinismo (M-05 parcial)
- [ ] `predicate.ts` implementado
- [ ] Testes de predicados (e/ou, operadores)

---

### 4.2 Dia 3-4: Elegibilidade e Bandas

**4.2.1 `src/selector/eligibility.ts`**

```typescript
import { Storylet, State, Inputs } from '../types';
import { evaluatePredicate } from './predicate';

/**
 * Verifica se storylet é elegível (ESPEC §6.1)
 */
export function isEligible(
  storylet: Storylet,
  state: State,
  inputs: Inputs,
  killSwitch: string[]
): boolean {
  // M-03: Kill-switch nunca desativa Espinha ou fallback
  if (storylet.banda !== 'Espinha' && storylet.id !== 'st_cor_fallback') {
    if (killSwitch.includes(storylet.id)) {
      return false;
    }
  }

  // Capítulo
  const capAtual = state.qualities['cap.atual'] as number;
  if (storylet.capitulo !== undefined && storylet.capitulo !== null) {
    if (storylet.capitulo !== capAtual) {
      return false;
    }
  }

  // Predicado `Requer`
  if (!evaluatePredicate(storylet.requer, state)) {
    return false;
  }

  // sys.visto (reconhecimento)
  const vistoKey = `sys.visto.${storylet.id}`;
  const visto = state.qualities[vistoKey] as number | undefined;
  if (visto && visto > 0) {
    // Storylet já visto, não elegível (ESPEC §5)
    // Exceto se for Espinha ou fallback
    if (storylet.banda === 'Espinha' || storylet.id === 'st_cor_fallback') {
      return true; // Sempre elegível
    }
    return false;
  }

  return true;
}

/**
 * Filtra storylets elegíveis
 */
export function filterEligible(
  storylets: Storylet[],
  state: State,
  inputs: Inputs,
  killSwitch: string[]
): Storylet[] {
  return storylets.filter((st) => isEligible(st, state, inputs, killSwitch));
}
```

**4.2.2 `src/selector/bands.ts`**

```typescript
import { Storylet, State, Inputs, Band } from '../types';
import { filterEligible } from './eligibility';

/**
 * Seleciona banda (ESPEC §6: Espinha > Arco > Cor)
 */
export function selectBand(
  catalog: Storylet[],
  state: State,
  inputs: Inputs,
  killSwitch: string[]
): { band: Band; pool: Storylet[] } {
  // M-01: Trégua → apenas Cor
  if (inputs.tregua) {
    const poolCor = filterByBand(catalog, 'Cor', state, inputs, killSwitch);
    return { band: 'Cor', pool: poolCor };
  }

  // M-08: Sessão secundária → apenas Cor
  if (inputs.sessao_secundaria) {
    const poolCor = filterByBand(catalog, 'Cor', state, inputs, killSwitch);
    return { band: 'Cor', pool: poolCor };
  }

  // Ordem: Espinha > Arco > Cor
  const poolEspinha = filterByBand(catalog, 'Espinha', state, inputs, killSwitch);
  if (poolEspinha.length > 0) {
    return { band: 'Espinha', pool: poolEspinha };
  }

  const poolArco = filterByBand(catalog, 'Arco', state, inputs, killSwitch);
  if (poolArco.length > 0) {
    // M-06: Se cap.estagio == 'pressao', apenas closures
    const estagio = state.qualities['cap.estagio'] as string | undefined;
    if (estagio === 'pressao') {
      const closures = poolArco.filter((st) => st.id.includes('closure')); // Simplificação: id contém 'closure'
      if (closures.length > 0) {
        return { band: 'Arco', pool: closures };
      }
    }
    return { band: 'Arco', pool: poolArco };
  }

  const poolCor = filterByBand(catalog, 'Cor', state, inputs, killSwitch);
  return { band: 'Cor', pool: poolCor };
}

function filterByBand(
  catalog: Storylet[],
  band: Band,
  state: State,
  inputs: Inputs,
  killSwitch: string[]
): Storylet[] {
  const byBand = catalog.filter((st) => st.banda === band);
  return filterEligible(byBand, state, inputs, killSwitch);
}
```

**Checklist Dia 3-4:**

- [ ] `eligibility.ts` implementado
- [ ] `bands.ts` implementado
- [ ] Testes M-01, M-08 (trégua/sessão secundária → apenas Cor)
- [ ] Teste M-06 (pressão → closures)

---

### 4.3 Dia 5: Exclusão e Tie-breaker

**4.3.1 `src/selector/exclusion.ts`**

```typescript
import { Storylet, State } from '../types';
import { SeededRNG } from '../rng';

/**
 * Calcula K (DI-002: 60% do teto da modalidade)
 * Simplificação: assumir teto 10 → K=6
 */
function calculateK(state: State): number {
  // TODO: Quando implementar modalidades (Fase 3), buscar teto de state
  const teto = 10; // Default
  return Math.floor(teto * 0.6);
}

/**
 * Fila de exclusão (ESPEC §6.1, M-09)
 * Remove K storylets mais recentemente vistos
 */
export function applyExclusion(pool: Storylet[], state: State): Storylet[] {
  const K = calculateK(state);

  // M-09: K aplicado sobre pool elegível, não sobre total da banda
  if (pool.length <= K) {
    return pool; // Não há o que excluir
  }

  // Ordenar por sys.visto (mais recente = maior)
  const withSeen = pool.map((st) => ({
    storylet: st,
    seen: (state.qualities[`sys.visto.${st.id}`] as number) || 0,
  }));

  withSeen.sort((a, b) => b.seen - a.seen); // Decrescente

  // Remover top K
  const excluded = withSeen.slice(K);
  return excluded.map((item) => item.storylet);
}

/**
 * Tie-breaker (DI-007): aleatório com seed
 */
export function selectOne(pool: Storylet[], rng: SeededRNG): Storylet {
  return rng.choice(pool);
}
```

**Checklist Dia 5:**

- [ ] `exclusion.ts` implementado
- [ ] Teste M-09 (K sobre elegíveis)
- [ ] Teste de tie-breaker determinístico

---

## 5. Implementação: Semana 2

### 5.1 Dia 6-7: Função `resolve()`

**5.1.1 `src/resolve.ts`**

```typescript
import { State, Inputs, Catalog, ResolutionResult, Variant } from './types';
import { SeededRNG } from './rng';
import { selectBand } from './selector/bands';
import { applyExclusion, selectOne } from './selector/exclusion';
import { evaluatePredicate } from './selector/predicate';
import { applySafetyNet } from './safety-net';

/**
 * Função principal: resolve (RF-036 — função pura)
 */
export function resolve(
  catalog: Catalog,
  state: State,
  inputs: Inputs,
  seed: number,
  killSwitch: string[] = []
): ResolutionResult {
  const rng = new SeededRNG(seed);

  // 1. Selecionar banda
  const { band, pool } = selectBand(catalog.storylets, state, inputs, killSwitch);

  // 2. Aplicar exclusão (fila K)
  let finalPool = pool;
  if (band === 'Cor') {
    finalPool = applyExclusion(pool, state);
  }

  // 3. Safety-net (M-04)
  if (finalPool.length === 0) {
    return applySafetyNet(catalog, state, inputs, seed);
  }

  // M-02: Reencontro → subclasse ausencia
  if (inputs.reencontro) {
    const ausencia = finalPool.filter((st) => st.subclasse === 'ausencia');
    if (ausencia.length > 0) {
      finalPool = ausencia;
    }
  }

  // 4. Selecionar storylet
  const selected = selectOne(finalPool, rng);

  // 5. Selecionar variante
  const variant = selectVariant(selected.variantes, state, rng);

  // 6. Aplicar efeitos
  const newState = applyEffects(state, variant.efeitos, selected.id);

  return {
    storylet: selected,
    variant,
    texto: variant.texto,
    efeitos: variant.efeitos,
    newState,
  };
}

/**
 * Selecionar variante (ESPEC §3.1)
 */
function selectVariant(variants: Variant[], state: State, rng: SeededRNG): Variant {
  const eligible = variants.filter((v) => evaluatePredicate(v.quando, state));

  if (eligible.length === 0) {
    // Fallback: primeira variante sem `quando`
    const fallback = variants.find((v) => !v.quando);
    if (!fallback) {
      throw new Error('No eligible variant and no fallback variant');
    }
    return fallback;
  }

  return rng.choice(eligible);
}

/**
 * Aplicar efeitos (ESPEC §3.1)
 */
function applyEffects(
  state: State,
  effects: Record<string, number | boolean>,
  storyletId: string
): State {
  const newQualities = { ...state.qualities };

  // Aplicar efeitos
  for (const [key, value] of Object.entries(effects)) {
    newQualities[key] = value;
  }

  // Reconhecimento (ESPEC §5)
  const vistoKey = `sys.visto.${storyletId}`;
  const currentVisto = (newQualities[vistoKey] as number) || 0;
  newQualities[vistoKey] = currentVisto + 1;

  // sys.resolucoes
  const resolucoes = (newQualities['sys.resolucoes'] as number) || 0;
  newQualities['sys.resolucoes'] = resolucoes + 1;

  // cap.resolucoes
  const capResolucoes = (newQualities['cap.resolucoes'] as number) || 0;
  newQualities['cap.resolucoes'] = capResolucoes + 1;

  return { qualities: newQualities };
}
```

**5.1.2 `src/safety-net.ts`**

```typescript
import { Catalog, State, Inputs, ResolutionResult } from './types';
import { resolve } from './resolve';

/**
 * Rede de segurança (M-04): devolve st_cor_fallback
 */
export function applySafetyNet(
  catalog: Catalog,
  state: State,
  inputs: Inputs,
  seed: number
): ResolutionResult {
  const fallback = catalog.storylets.find((st) => st.id === 'st_cor_fallback');

  if (!fallback) {
    throw new Error('st_cor_fallback not found in catalog (required by M-04)');
  }

  // Forçar elegibilidade do fallback
  const variant = fallback.variantes[0];
  const newState = { qualities: { ...state.qualities } };

  // Reconhecimento
  const vistoKey = `sys.visto.${fallback.id}`;
  const currentVisto = (newState.qualities[vistoKey] as number) || 0;
  newState.qualities[vistoKey] = currentVisto + 1;

  newState.qualities['sys.resolucoes'] =
    ((newState.qualities['sys.resolucoes'] as number) || 0) + 1;
  newState.qualities['cap.resolucoes'] =
    ((newState.qualities['cap.resolucoes'] as number) || 0) + 1;

  return {
    storylet: fallback,
    variant,
    texto: variant.texto,
    efeitos: variant.efeitos,
    newState,
  };
}
```

**Checklist Dia 6-7:**

- [ ] `resolve.ts` completo
- [ ] `safety-net.ts` implementado
- [ ] Testes M-02 (reencontro → ausencia)
- [ ] Teste M-04 (safety-net → fallback)

---

### 5.2 Dia 8-10: Simulador

**5.2.1 `src/simulator/policies.ts`**

```typescript
import { Inputs } from '../types';

/**
 * Políticas de simulação (ESPEC §7.1)
 */
export interface PolicyGenerator {
  nextInputs(ciclo: number, resolucao: number): Inputs;
}

export class ConstantePolicy implements PolicyGenerator {
  nextInputs(ciclo: number, resolucao: number): Inputs {
    return {
      rolagem: 8, // Mediana (2d6 + 1)
      atributo: { forca: 1, vigor: 1, destreza: 1 }, // Crescendo devagar
      vontade: 1,
      ciclo_cumprido: true,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class ErraticoPolicy implements PolicyGenerator {
  private rng: any; // TODO: usar SeededRNG

  nextInputs(ciclo: number, resolucao: number): Inputs {
    const cumprido = Math.random() > 0.4; // 60% cumprido
    return {
      rolagem: Math.floor(Math.random() * 14) + 2, // 2..15
      atributo: {
        forca: Math.floor(Math.random() * 6),
        vigor: Math.floor(Math.random() * 6),
        destreza: Math.floor(Math.random() * 6),
      },
      vontade: Math.floor(Math.random() * 4),
      ciclo_cumprido: cumprido,
      tregua: false,
      reencontro: false,
      sessao_secundaria: false,
    };
  }
}

export class IntermitentePolicy implements PolicyGenerator {
  nextInputs(ciclo: number, resolucao: number): Inputs {
    const tregua = ciclo % 3 === 0; // Trégua a cada 3 ciclos
    const reencontro = resolucao === 0 && ciclo > 0 && ciclo % 4 === 0; // Reencontro a cada 4 ciclos
    return {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: !tregua,
      tregua,
      reencontro,
      sessao_secundaria: false,
    };
  }
}

// TODO: Implementar EspecialistaPolicy, PessimoPolicy
```

**5.2.2 `src/simulator/index.ts`**

```typescript
import { Catalog, State, Policy, ResolutionResult } from '../types';
import { resolve } from '../resolve';
import { ConstantePolicy, ErraticoPolicy, IntermitentePolicy } from './policies';

export interface SimulationReport {
  resolutions: ResolutionResult[];
  vistos: string[]; // IDs vistos
  nunca_vistos: string[]; // IDs nunca vistos
  razao_vistos_escritos: number;
}

/**
 * Simulador (ESPEC §7.1, RF-100)
 */
export function simulate(
  catalog: Catalog,
  seed: number,
  n: number,
  policy: Policy
): SimulationReport {
  const policyGen = createPolicyGenerator(policy);

  let state: State = {
    qualities: {
      'cap.atual': 1,
      'cap.resolucoes': 0,
      'cap.estagio': 'exploração',
      'sys.resolucoes': 0,
    },
  };

  const resolutions: ResolutionResult[] = [];
  let currentSeed = seed;

  for (let i = 0; i < n; i++) {
    const ciclo = Math.floor(i / 4); // Assumir 4 resoluções/ciclo
    const inputs = policyGen.nextInputs(ciclo, i);

    const result = resolve(catalog, state, inputs, currentSeed);
    resolutions.push(result);

    state = result.newState;
    currentSeed++; // Incrementar seed a cada resolução
  }

  // Calcular métricas
  const vistos = resolutions.map((r) => r.storylet.id);
  const uniqueVistos = Array.from(new Set(vistos));
  const todosIds = catalog.storylets.map((st) => st.id);
  const nunca_vistos = todosIds.filter((id) => !uniqueVistos.includes(id));

  const razao = uniqueVistos.length / todosIds.length;

  return {
    resolutions,
    vistos: uniqueVistos,
    nunca_vistos,
    razao_vistos_escritos: razao,
  };
}

function createPolicyGenerator(policy: Policy) {
  switch (policy) {
    case 'constante':
      return new ConstantePolicy();
    case 'erratico':
      return new ErraticoPolicy();
    case 'intermitente':
      return new IntermitentePolicy();
    default:
      throw new Error(`Policy ${policy} not implemented`);
  }
}
```

**Checklist Dia 8-10:**

- [ ] 3 políticas implementadas (constante, errático, intermitente)
- [ ] Simulador funcional
- [ ] Relatório com razão vistos/escritos
- [ ] Testes de simulador (M=50)

---

## 6. Implementação: Semana 3

### 6.1 Dia 11-13: Testes M-01 a M-09

Criar fixtures sintéticos e testes de integração.

**6.1.1 Fixture: `tests/fixtures/minimal-catalog.json`**

```json
{
  "storylets": [
    {
      "id": "st_espinha_abertura_cap1",
      "banda": "Espinha",
      "subclasse": null,
      "capitulo": 1,
      "variantes": [
        {
          "texto": "texto.espinha.abertura.cap1",
          "efeitos": { "cap.aberto": true }
        }
      ]
    },
    {
      "id": "st_cor_fallback",
      "banda": "Cor",
      "subclasse": null,
      "capitulo": null,
      "variantes": [
        {
          "texto": "texto.cor.fallback",
          "efeitos": {}
        }
      ]
    },
    {
      "id": "st_cor_ausencia_1",
      "banda": "Cor",
      "subclasse": "ausencia",
      "capitulo": null,
      "variantes": [
        {
          "texto": "texto.cor.ausencia.1",
          "efeitos": {}
        }
      ]
    }
  ]
}
```

**6.1.2 Teste M-01: `tests/integration/M-01.test.ts`**

```typescript
import { describe, it, expect } from 'vitest';
import { resolve } from '../../src/resolve';
import minimalCatalog from '../fixtures/minimal-catalog.json';

describe('M-01: Trégua → apenas Cor', () => {
  it('should only consult Cor band when in.tregua == true', () => {
    const state = {
      qualities: {
        'cap.atual': 1,
        'cap.resolucoes': 0,
        'sys.resolucoes': 0,
      },
    };

    const inputs = {
      rolagem: 8,
      atributo: { forca: 1, vigor: 1, destreza: 1 },
      vontade: 1,
      ciclo_cumprido: false,
      tregua: true, // Trégua ativa
      reencontro: false,
      sessao_secundaria: false,
    };

    const result = resolve(minimalCatalog as any, state, inputs, 42);

    // Resultado deve ser de banda Cor
    expect(result.storylet.banda).toBe('Cor');
  });
});
```

**6.1.3 Teste M-03: `tests/integration/M-03.test.ts`**

```typescript
describe('M-03: Kill-switch não desativa Espinha nem fallback', () => {
  it('should ignore kill-switch for Espinha storylets', () => {
    const catalog = {
      storylets: [
        {
          id: 'st_espinha_abertura_cap1',
          banda: 'Espinha' as const,
          subclasse: null,
          capitulo: 1,
          variantes: [{ texto: 'texto.espinha', efeitos: {} }],
        },
      ],
    };

    const state = { qualities: { 'cap.atual': 1 } };
    const inputs = { /* ... */ tregua: false, reencontro: false, sessao_secundaria: false };
    const killSwitch = ['st_espinha_abertura_cap1']; // Tentando desativar Espinha

    const result = resolve(catalog, state, inputs, 42, killSwitch);

    // Espinha deve ser selecionada mesmo estando no kill-switch
    expect(result.storylet.id).toBe('st_espinha_abertura_cap1');
  });

  it('should ignore kill-switch for st_cor_fallback', () => {
    const catalog = {
      storylets: [
        {
          id: 'st_cor_fallback',
          banda: 'Cor' as const,
          subclasse: null,
          capitulo: null,
          variantes: [{ texto: 'texto.fallback', efeitos: {} }],
        },
      ],
    };

    const state = { qualities: { 'cap.atual': 1 } };
    const inputs = { /* ... */ tregua: false, reencontro: false, sessao_secundaria: false };
    const killSwitch = ['st_cor_fallback'];

    const result = resolve(catalog, state, inputs, 42, killSwitch);

    expect(result.storylet.id).toBe('st_cor_fallback');
  });
});
```

**Checklist Dia 11-13:**

- [ ] Testes M-01 a M-09 implementados
- [ ] Fixtures sintéticos criados
- [ ] 100% dos testes M-XX passando

---

### 6.2 Dia 14-15: Documentação e Polimento

**6.2.1 Criar `packages/motor-narrativo/README.md`**

````markdown
# Motor Narrativo — FORJA

Pure TypeScript narrative engine implementing ESPEC v2.6.

## Features

- Deterministic resolution (RF-036): same seed → same output
- Band selection: Espinha > Arco > Cor
- Kill-switch support (M-03): never disables Espinha or fallback
- Safety-net (M-04): always has st_cor_fallback
- Simulator with 5 policies (RF-100-103)

## Usage

\`\`\`typescript
import { resolve, simulate } from '@forja/motor-narrativo';

const result = resolve(catalog, state, inputs, seed);
console.log(result.texto); // Texto da resolução

const report = simulate(catalog, seed, 50, 'constante');
console.log(report.razao_vistos_escritos); // 0.15-0.3 esperado
\`\`\`

## Tests

- Unit tests: `pnpm test:unit`
- Integration tests (M-01 to M-09): `pnpm test:integration`
- Simulator tests: `pnpm test:simulator`

## Invariantes (M-XX)

- M-01: Trégua → apenas Cor
- M-02: Reencontro → subclasse ausencia
- M-03: Kill-switch nunca desativa Espinha/fallback
- M-04: Safety-net → st_cor_fallback
- M-05: Determinismo cross-platform
- M-06: Pressão → apenas closures
- M-07: Ponto de escolha 2-3 opções
- M-08: Sessão secundária → apenas Cor
- M-09: Fila K sobre elegíveis, não total
  \`\`\`

**6.2.2 Atualizar `package.json` com scripts de teste**

```json
{
  "scripts": {
    "test": "vitest run",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:simulator": "vitest run tests/simulator",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```
````

**Checklist Dia 14-15:**

- [ ] README.md completo
- [ ] Scripts de teste organizados
- [ ] Coverage >80% (unit + integration)
- [ ] Documentação de API (JSDoc completo)

---

## 7. Critérios de Gate

Fase 2 aprovada quando:

- [ ] Todos testes M-01 a M-09 passando (100%)
- [ ] Simulador funcional com 3+ políticas
- [ ] Razão vistos/escritos entre 0.15-0.3 em catálogo sintético
- [ ] Determinismo validado (M-05): mesma seed em Windows/Linux/Mac
- [ ] Coverage ≥80%
- [ ] CI passando (lint, typecheck, test)
- [ ] Zero dependências externas (pure TS, D-033)
- [ ] README.md completo
- [ ] Commit com tag `fase-2-completa`

---

## 8. Riscos e Mitigações

| Risco                         | Mitigação                                        |
| ----------------------------- | ------------------------------------------------ |
| **R-011: Motor impuro**       | Lint rule: proibir `Date.now()`, `Math.random()` |
| **R-002: Deadlock narrativo** | M-04 garante fallback sempre elegível            |
| **Testes flaky**              | Seeds fixas, zero I/O, mocks de RNG              |

---

## 9. Checklist de Saída

- [ ] `@forja/motor-narrativo` funcional
- [ ] Testes M-01 a M-09 (100%)
- [ ] Simulador com 3 políticas
- [ ] Coverage ≥80%
- [ ] Zero deps externas
- [ ] README.md
- [ ] Tag `fase-2-completa`

---

**Próxima fase:** Fase 3 (Domínio)  
**Duração estimada:** 2 semanas
