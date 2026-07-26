# Fase 8: Suíte BDD — FORJA

**Duração:** 1.5 semanas  
**Dependências:** Fase 3 (domínio)  
**Objetivo:** 315 cenários Gherkin passando

---

## AI Agent Context

**Artefatos entrada:**
- `docs/testes/rastreabilidade/features/*.feature` (14 features)
- `@forja/motor-narrativo`, `@forja/dominio`

**Artefatos saída:**
```
packages/bdd/
├── features/                 # Copiado de docs/testes/
│   ├── 01-juramento.feature
│   ├── 02-sessao.feature
│   └── ... (14 features)
├── step-definitions/
│   ├── juramento.steps.ts
│   ├── sessao.steps.ts
│   └── ... (14 arquivos)
├── support/
│   ├── world.ts              # Context compartilhado
│   └── fixtures.ts
└── vitest.config.ts
```

**Comandos verificação:**
```bash
cd packages/bdd
pnpm test              # Roda 315 cenários
pnpm test:coverage     # Coverage requisitos
```

---

## Tarefas

### Tarefa 8.1: Setup Vitest + Gherkin
**Agente:** `bash`
```bash
mkdir -p packages/bdd
cd packages/bdd
pnpm init
pnpm add -D vitest @cucumber/cucumber
```
**Config:** `vitest.config.ts`
```typescript
export default {
  test: {
    include: ['features/**/*.feature'],
  },
};
```
**Verificação:** `pnpm test` roda (vazio ainda).

---

### Tarefa 8.2: Copiar Features
**Agente:** `bash`
```bash
cp -r ../../docs/testes/rastreabilidade/features ./
```
**Verificação:** 14 arquivos `.feature` copiados.

---

### Tarefa 8.3: Step Definitions
**Agente:** `write`
**Exemplo:** `step-definitions/juramento.steps.ts`
```typescript
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'vitest';

Given('usuário sem juramento ativo', function () {
  this.world.ficha = { juramento: null };
});

When('criar juramento {int} dias/semana', function (dias: number) {
  this.world.ficha.juramento = {
    dias_por_semana: dias,
    data_inicio: '2026-01-01',
    data_fim: '2026-12-31',
  };
});

Then('juramento criado com sucesso', function () {
  expect(this.world.ficha.juramento).toBeDefined();
});
```
**Repetir:** 14 features × ~20 steps cada = 280 steps
**Verificação:** Cenários passam.

---

### Tarefa 8.4: World Context
**Agente:** `write`
**Arquivo:** `support/world.ts`
```typescript
export class World {
  ficha: Ficha;
  eventos: DiaryEvent[] = [];
  catalog: Catalog;
  
  constructor() {
    this.ficha = fichaInicial();
    this.catalog = catalogoSintetico();
  }
  
  registrarEvento(evento: DiaryEvent) {
    this.eventos.push(evento);
    this.ficha = calcularFicha(this.eventos);
  }
}
```
**Verificação:** Steps compartilham estado.

---

### Tarefa 8.5: Executar Suíte
**Agente:** `bash`
```bash
pnpm test
```
**Meta:** 315/315 cenários passando
**Verificação:** Output mostra 100% verde.

---

## Critérios Gate

- [ ] 14 features implementadas
- [ ] 315 cenários passando
- [ ] Coverage 100% requisitos RF/RN/RE/RC
- [ ] CI roda suíte automaticamente
- [ ] Tag `fase-8-completa`

**Próxima fase:** Fase 9 (CI/CD) — 1 semana
