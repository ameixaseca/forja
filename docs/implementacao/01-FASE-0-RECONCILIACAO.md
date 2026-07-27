# Fase 0: Reconciliação — FORJA

**Duração:** 2 semanas  
**Gate:** Bloqueante — Fase 1 bloqueada até 100% resolvido  
**Objetivo:** Resolver lacunas/defeitos, documentar decisões

---

## AI Agent Context

**Artefatos de entrada:**

- `docs/prd/PRD-Forja-v0_14.md` — requisitos funcionais RF-XXX, regras RN-XXX, decisões D-XXX
- `docs/prd/ESPEC-Sistema-Narrativo-v2_6.md` — specs narrativas, métricas M-XX, testes T-XX
- `docs/adr/0001-*.md` a `docs/adr/0014-*.md` — decisões arquiteturais
- `docs/implementacao/DECISOES-IMPLEMENTACAO.md` — decisões DI-001 a DI-005 existentes

**Artefatos de saída esperados:**

- `docs/implementacao/DECISOES-IMPLEMENTACAO.md` — novas decisões DI-006 a DI-011
- `docs/implementacao/FASE-0-GATE-APROVADO.md` — doc de aprovação
- Issues GitHub para decisões postergadas (LAC-07, ESPEC-03, ESPEC-04)

**Dependências externas:** Nenhuma — trabalho puramente documental.

---

## 1. Contexto

### 1.1 Situação

PRD v0.14 + ESPEC v2.6 completos. Decisões DEC-005 a DEC-037 travadas. Lacunas conhecidas (PRD §15.2-15.3) parcialmente resolvidas.

### 1.2 Escopo

Verificar decisões DEC-XXX cobrem lacunas PRD §15.2. Identificar decisões implícitas. Validar consistência PRD/ESPEC/ADRs. Resolver questões bloqueantes.

### 1.3 Risco

**R-032 (crítico):** Lacunas não resolvidas bloqueiam Fase 1-2.

---

## 2. Inventário Pré-processado

### 2.1 Lacunas (PRD §15.2)

**✅ Resolvidas (8/11):**

- LAC-01: Campanha única no MVP (DI-001)
- LAC-02: Replay vs snapshot (DI-003)
- LAC-03: Fôlego teto 4 (D-044)
- LAC-05: Wearable adiar v2 (D-003)
- LAC-08: PSE K=60% (RN-007, DI-002)
- LAC-09: Cooldown por rótulo (RF-043)
- LAC-10: Assinatura adiar (D-026)
- LAC-11: Kill-switch campanha inteira (ADR-0004)

**⚠️ Bloqueantes (3/11):**

- **LAC-04:** Camadas compartilhamento — requer DI-009
- **LAC-06:** Gênero gramatical — requer DI-010
- **DEF-02:** Tie-breaker ordenação — requer DI-007 (determinismo M-05)
- **DEF-03:** Cooldown Marco início — requer DI-008
- **DEF-04:** 21 dias vs 14 dias — requer DI-006 (INCONS-01)

**📍 Não-bloqueantes (3/11):**

- LAC-07: Campos modalidade (baixa prioridade)
- ESPEC-01: Pesos uniforme (esclarecimento menor)
- ESPEC-02: `in.reencontro` >=10 vs >10 — requer DI-011

---

## 3. Decisões Bloqueantes (DI-006 a DI-011)

### DI-006: Pausa Longa Unificada

**Problema:** RF-048 (21 dias) vs RF-007A (14 dias) inconsistente.

**Decisão:** 14 dias para ambas regras (Trégua + Marcos).

**Justificativa:**

- RF-007A já usa 14 dias (Trégua Recuperação)
- Consistência com "2 semanas" (fácil comunicar)
- Resolve INCONS-01

**Impacto:** Ajustar RF-048 mentalmente durante implementação.

---

### DI-007: Tie-breaker Determinístico

**Problema:** ESPEC §6.1 não especifica desempate entre storylets mesma prioridade.

**Decisão:** Aleatório seeded (RNG com seed).

**Justificativa:**

- RF-036 (motor puro, seed garante reprodutibilidade)
- Sem viés alfabético
- Testável via M-05 (determinismo cross-platform)

**Impacto:** Função `selectOne(pool, rng)` usa `rng.choice()`.

---

### DI-008: Cooldown Marco Inicia Após Declaração

**Problema:** RF-043 (cooldown 2 ciclos) — quando começa?

**Decisão:** Cooldown inicia após declaração, não após encerramento ciclo.

**Justificativa:**

- Simplicidade (não rastrear "ciclo de declaração")
- Previne exploit (declarar Marco último dia ciclo)
- Alinhado intuição usuário

**Impacto:** Lógica em `packages/dominio` (Fase 3).

---

### DI-009: Camadas Compartilhamento (6 Camadas)

**Problema:** RF-063 (ligar/desligar camadas) — quais camadas?

**Decisão:** 6 camadas:

1. Storylet recente (sempre on)
2. Atributos principais (on padrão)
3. PSE sessão (off padrão — RC-001 dado saúde)
4. Histórico ciclos (off padrão)
5. Juramento atual (on padrão)
6. Modalidade (on padrão)

**Justificativa:**

- Equilibra controle vs complexidade UI
- Camadas sensíveis opcionais (PSE, histórico)
- Suficiente MVP, expansível v2

**Impacto:** UI em apps/mobile (Fase 5+).

---

### DI-010: Gênero Gramatical — Neutro + Placeholders

**Problema:** RF-124 (gênero por entidade) — como aplicar texto?

**Decisão:** Neutro por padrão + placeholders quando inevitável.

**Estratégia:**

- Prosa evita adjetivos (estilo indireto, "você", 2ª pessoa)
- Quando inevitável: template `{adj:cansado}` resolve via `entidade.genero`
- Entidade tem `genero: 'M' | 'F' | 'N'`

**Justificativa:**

- pt-BR permite neutro em muitos casos
- Evita duplicar texto (manutenção 2x)
- Template engine simples

**Impacto:** Schema entidade em `content/schema/`, engine em `motor-narrativo` (Fase 2).

---

### DI-011: `in.reencontro` Inclui Dia 10

**Problema:** ESPEC §6.2 "10 dias ou mais" ambíguo.

**Decisão:** `>=10` (inclui dia 10 exato).

**Justificativa:**

- "10 dias **ou mais**" linguisticamente inclui 10
- Consistente RF-048 "21 dias ou mais"
- Mais generoso (beneficia jogador)

**Impacto:** Função `isEligible()` em `selector/eligibility.ts` (Fase 2).

---

## 4. Tarefas AI Agent

### Tarefa 1: Criar DI-006 a DI-011

**Agente:** `task` (general)
**Input:** Decisões acima + `docs/implementacao/DECISOES-IMPLEMENTACAO.md` existente
**Ação:** Adicionar DI-006 a DI-011 em formato existente do arquivo
**Output:** Arquivo atualizado
**Verificação:** Grep por `DI-006` a `DI-011` retorna 6 entradas

### Tarefa 2: Criar Gate Aprovado

**Agente:** `write`
**Input:** Template §6 (abaixo)
**Ação:** Criar `docs/implementacao/FASE-0-GATE-APROVADO.md`
**Output:** Arquivo com data, decisões tomadas, itens adiados, bloqueantes resolvidos
**Verificação:** Arquivo existe, menciona DI-006 a DI-011

### Tarefa 3: Criar Issues GitHub

**Agente:** `bash` (gh CLI)
**Input:** Itens não-bloqueantes (LAC-07, ESPEC-01, ESPEC-03, ESPEC-04)
**Ação:** `gh issue create` para cada, label `fase-posterior`
**Output:** 4 issues criadas
**Verificação:** `gh issue list --label fase-posterior` retorna 4 issues

---

## 5. Gate Template

```markdown
# Fase 0: Gate Aprovado

**Data:** YYYY-MM-DD  
**Aprovado por:** [nome]

## Decisões Tomadas

- DI-006: 14 dias pausa longa
- DI-007: Ordenação seed em empate
- DI-008: Cooldown inicia após declaração
- DI-009: 6 camadas compartilhamento
- DI-010: Neutro + placeholders gênero
- DI-011: `in.reencontro` ativa `>=10` dias

## Itens Adiados

- LAC-07 (campos modalidade) → Fase 3, issue #TBD
- ESPEC-01 (pesos uniforme) → Fase 2 esclarece código
- ESPEC-03 (orçamento complicações) → Fase 4, issue #TBD
- ESPEC-04 (fixtures teste) → Fase 4, issue #TBD

## Bloqueantes Resolvidos

- ✅ DEF-02: Tie-breaker seeded (DI-007)
- ✅ DEF-03: Cooldown após declaração (DI-008)
- ✅ DEF-04: Unificado 14 dias (DI-006)
- ✅ INCONS-01: RF-048 ajustado 14 dias (DI-006)
- ✅ LAC-04: 6 camadas definidas (DI-009)
- ✅ LAC-06: Estratégia gênero (DI-010)
- ✅ ESPEC-02: `>=10` dias (DI-011)

## Próximo Passo

Iniciar Fase 1 (Setup Monorepo).
```

---

## 6. Checklist Saída

- [ ] DI-006 a DI-011 em `docs/implementacao/DECISOES-IMPLEMENTACAO.md`
- [ ] `docs/implementacao/FASE-0-GATE-APROVADO.md` criado
- [ ] Issues GitHub para LAC-07, ESPEC-03, ESPEC-04
- [ ] Nenhuma inconsistência bloqueante PRD/ESPEC/ADRs
- [ ] Commit tag `fase-0-completa`

**Próxima fase:** Fase 1 (Setup Monorepo) — 1 semana
