# Fase 3: Domínio — FORJA

**Duração:** 1 semana  
**Dependências:** Fase 2 (motor narrativo)  
**Objetivo:** Event sourcing, projeção ficha, Vontade, Fôlego, Marcos

---

## AI Agent Context

**Fonte verdade:**

- PRD RN-001 a RN-039 (regras negócio)
- ADR-0002 (event sourcing ficha)
- RF-040 a RF-049 (Marcos)
- RF-050 a RF-059 (Fôlego)
- RF-005 a RF-008 (Vontade)

**Artefatos entrada:**

- `packages/dominio/` placeholder (Fase 1)
- `docs/database/migrations/` schema `diary_events`

**Artefatos saída esperados:**

```
packages/dominio/
├── src/
│   ├── index.ts              # API pública
│   ├── types.ts              # DiaryEvent, Ficha, Ciclo, Juramento
│   ├── event-sourcing/
│   │   ├── projector.ts      # calcularFicha(eventos[])
│   │   └── reducers.ts       # Reducers por tipo evento
│   ├── vontade.ts            # RN-004: +1 @ 2 ciclos, +2 @ 6, +3 @ 14
│   ├── folego.ts             # RN-011: teto 2/ciclo, max 4
│   ├── marcos.ts             # RF-040-049: 3 → +1 atributo, cooldown
│   ├── ciclo.ts              # RN-001: progressão = treinados/jurados
│   └── juramento.ts          # RF-004: 1-6 dias/semana
├── tests/
│   ├── unit/
│   │   ├── vontade.test.ts
│   │   ├── folego.test.ts
│   │   ├── marcos.test.ts
│   │   └── projector.test.ts
│   └── fixtures/
│       └── event-logs.json   # Logs sintéticos
└── README.md
```

**Comandos verificação:**

```bash
cd packages/dominio
pnpm test              # Unit tests
pnpm test:coverage     # >=90%
```

**Dependências externas:** Zero (pure TS). DevDeps: typescript, vitest.

---

## 1. Event Sourcing Core

### Tarefa 3.1: Types

**Agente:** `write`
**Arquivo:** `src/types.ts`
**Types:**

```typescript
export type DiaryEventType =
  | 'sessao_registrada'
  | 'ciclo_encerrado'
  | 'marco_declarado'
  | 'folego_consumido'
  | 'juramento_criado';

export interface DiaryEvent {
  id: string;
  user_id: string;
  tipo: DiaryEventType;
  timestamp: string; // ISO8601
  payload: Record<string, any>;
}

export interface Ficha {
  atributos: { forca: number; vigor: number; destreza: number };
  vontade: number;
  folego: number;
  ciclo_atual: number;
  ciclos_cumpridos: number;
  juramento: Juramento | null;
  marcos_disponiveis: number;
  cooldown_marcos: Record<string, number>; // rotulo → ciclo_fim
}

export interface Juramento {
  dias_por_semana: number; // 1-6 (RF-004)
  data_inicio: string;
  data_fim: string;
}

export interface Ciclo {
  numero: number;
  juramento: Juramento;
  dias_treinados: number;
  dias_jurados: number;
  cumprido: boolean;
}
```

**Verificação:** Compila sem erros.

---

### Tarefa 3.2: Projector

**Agente:** `write`
**Arquivo:** `src/event-sourcing/projector.ts`
**Função:**

```typescript
export function calcularFicha(eventos: DiaryEvent[]): Ficha {
  let ficha: Ficha = fichaInicial();

  for (const evento of eventos) {
    ficha = applyEvent(ficha, evento);
  }

  return ficha;
}

function fichaInicial(): Ficha {
  return {
    atributos: { forca: 0, vigor: 0, destreza: 0 },
    vontade: 0,
    folego: 0,
    ciclo_atual: 0,
    ciclos_cumpridos: 0,
    juramento: null,
    marcos_disponiveis: 0,
    cooldown_marcos: {},
  };
}

function applyEvent(ficha: Ficha, evento: DiaryEvent): Ficha {
  switch (evento.tipo) {
    case 'sessao_registrada':
      return applySessionRegistrada(ficha, evento);
    case 'ciclo_encerrado':
      return applyCicloEncerrado(ficha, evento);
    case 'marco_declarado':
      return applyMarcoDeclarado(ficha, evento);
    case 'folego_consumido':
      return applyFolegoConsumido(ficha, evento);
    case 'juramento_criado':
      return applyJuramentoCriado(ficha, evento);
    default:
      return ficha;
  }
}
```

**Reducers:** Implementar em `src/event-sourcing/reducers.ts`
**Teste:** `tests/unit/projector.test.ts` — replay 10 eventos, verificar ficha final
**Verificação:** Passa.

---

## 2. Regras Específicas

### Tarefa 3.3: Vontade

**Agente:** `write`
**Arquivo:** `src/vontade.ts`
**Função:**

```typescript
export function calcularVontade(ciclos_cumpridos: number): number {
  // RN-004: +1 @ 2 ciclos, +2 @ 6, +3 @ 14
  if (ciclos_cumpridos >= 14) return 3;
  if (ciclos_cumpridos >= 6) return 2;
  if (ciclos_cumpridos >= 2) return 1;
  return 0;
}
```

**Teste:** `tests/unit/vontade.test.ts` — valores 0, 2, 6, 14, 20 → 0, 1, 2, 3, 3
**Verificação:** Passa.

---

### Tarefa 3.4: Fôlego

**Agente:** `write`
**Arquivo:** `src/folego.ts`
**Funções:**

```typescript
// RN-011: Teto 2 por ciclo, max 4 acumulado
export function calcularFolegoDisponivelCiclo(
  folego_atual: number,
  folego_ganho_ciclo: number
): number {
  const novo = Math.min(folego_atual + folego_ganho_ciclo, 4); // Max 4
  return novo;
}

// RN-012: Ciclo cumprido → +1 Fôlego (até teto 2/ciclo)
export function folegoGanhoCiclo(ciclo_cumprido: boolean): number {
  return ciclo_cumprido ? 1 : 0; // Simplificado; +2 se superação (Fase futura)
}
```

**Teste:** `tests/unit/folego.test.ts` — acúmulo 4 ciclos, max 4, consumo decrementa
**Verificação:** Passa.

---

### Tarefa 3.5: Marcos

**Agente:** `write`
**Arquivo:** `src/marcos.ts`
**Funções:**

```typescript
// RF-043: Cooldown 2 ciclos por rótulo (DI-008: após declaração)
export function podeDeclarerMarco(
  rotulo: string,
  ciclo_atual: number,
  cooldown_marcos: Record<string, number>
): boolean {
  const fim_cooldown = cooldown_marcos[rotulo];
  if (!fim_cooldown) return true;
  return ciclo_atual > fim_cooldown;
}

// RF-041: 3 Marcos → +1 atributo
export function calcularMarcosDisponiveis(total_marcos: number): number {
  return Math.floor(total_marcos / 3);
}

// DI-008: Cooldown inicia após declaração
export function aplicarCooldown(
  rotulo: string,
  ciclo_atual: number,
  cooldown_marcos: Record<string, number>
): Record<string, number> {
  return {
    ...cooldown_marcos,
    [rotulo]: ciclo_atual + 2, // Cooldown 2 ciclos
  };
}
```

**Teste:** `tests/unit/marcos.test.ts` — declarar Marco ciclo 1, cooldown até ciclo 3
**Verificação:** Passa.

---

### Tarefa 3.6: Ciclo e Juramento

**Agente:** `write`
**Arquivos:** `src/ciclo.ts`, `src/juramento.ts`
**Funções:**

```typescript
// RN-001: Progressão = dias_treinados / dias_jurados
export function calcularProgressao(ciclo: Ciclo): number {
  if (ciclo.dias_jurados === 0) return 0;
  return ciclo.dias_treinados / ciclo.dias_jurados;
}

// RN-002: Ciclo cumprido se progressão >= 1.0
export function ciclo_cumprido(ciclo: Ciclo): boolean {
  return calcularProgressao(ciclo) >= 1.0;
}

// RF-004: Juramento 1-6 dias/semana
export function validarJuramento(dias_por_semana: number): boolean {
  return dias_por_semana >= 1 && dias_por_semana <= 6;
}
```

**Teste:** `tests/unit/ciclo.test.ts` — 3/3 cumprido, 2/3 não cumprido
**Verificação:** Passa.

---

## 3. Critérios Gate

- [ ] `calcularFicha(eventos[])` funcional
- [ ] Vontade: testes com 0, 2, 6, 14 ciclos passam
- [ ] Fôlego: max 4, teto 2/ciclo validado
- [ ] Marcos: cooldown 2 ciclos, 3 → +1 atributo
- [ ] Progressão ciclo: 3/3 cumprido, 2/3 não
- [ ] Coverage >=90%
- [ ] CI passando
- [ ] Zero deps externas
- [ ] Tag `fase-3-completa`

---

## 4. Checklist Saída

- [ ] `@forja/dominio` funcional
- [ ] Event sourcing completo
- [ ] Testes unit 100%
- [ ] Coverage >=90%
- [ ] README
- [ ] Tag `fase-3-completa`

**Próxima fase:** Fase 4 (Verificação) — 1 semana (paralela com F3)
