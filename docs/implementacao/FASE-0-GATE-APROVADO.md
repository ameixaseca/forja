# Fase 0: Gate Aprovado

**Data:** 2026-07-26  
**Aprovado por:** Luiz Paulo  
**Status:** ✅ Completo — Fase 1 desbloqueada

---

## Decisões Tomadas

Fase 0 resolveu 6 questões bloqueantes documentadas como DI-006 a DI-011:

### DI-006: Pausa Longa Unificada em 14 Dias

- **Problema:** RF-048 (21 dias) vs RF-007A (14 dias) inconsistente
- **Resolução:** Unificado em 14 dias (2 semanas) para Trégua Recuperação e janela Marco
- **Impacto:** Simplifica implementação e comunicação usuário

### DI-007: Tie-breaker Determinístico via RNG Seeded

- **Problema:** ESPEC §6.1 não especificava desempate entre storylets
- **Resolução:** RNG seeded (Mulberry32) para empates, preserva RF-036 (motor puro)
- **Impacto:** Testes reproduzíveis, sem viés alfabético

### DI-008: Cooldown Marco Inicia Após Declaração

- **Problema:** RF-043 não especificava quando cooldown inicia
- **Resolução:** Cooldown inicia imediatamente após declaração
- **Impacto:** Previne exploit, simplifica lógica domínio

### DI-009: 6 Camadas Compartilhamento

- **Problema:** RF-063 não listava camadas configuráveis
- **Resolução:** 6 camadas (Storylet always-on, Atributos, PSE off-padrão, Histórico, Juramento, Modalidade)
- **Impacto:** Privacidade configurável, atende RC-001 (LGPD)

### DI-010: Gênero Neutro + Template Placeholders

- **Problema:** RF-124 exigia gênero por entidade, mas não especificava aplicação
- **Resolução:** Prosa neutro por padrão, placeholders `{adj:M/F/N}` quando inevitável
- **Impacto:** Evita duplicar storylets, template engine < 50 linhas

### DI-011: `in.reencontro` Ativa ≥10 Dias

- **Problema:** ESPEC §6.2 "10 dias ou mais" ambíguo
- **Resolução:** `>=10` (inclui dia 10 exato)
- **Impacto:** Consistência linguística, beneficia jogador

---

## Itens Adiados (Não-Bloqueantes)

Questões secundárias postergadas para fases posteriores:

### LAC-07: Campos Modalidade

- **Natureza:** Decisão de UX/campos de registro
- **Fase:** Fase 6 (Mobile MVP)
- **Issue:** #TBD (criar)
- **Justificativa:** Não bloqueia motor/domínio/verificador

### ESPEC-01: Pesos Uniforme vs Ponderado

- **Natureza:** Esclarecimento menor (pesos de storylet)
- **Fase:** Fase 2 (Motor Narrativo)
- **Issue:** Não requer issue, código esclarece
- **Justificativa:** Padrão é uniforme (peso=1) salvo exceções explícitas

### ESPEC-03: Orçamento Complicações

- **Natureza:** Métrica de catálogo (quantas complicações por capítulo)
- **Fase:** Fase 4 (Verificação)
- **Issue:** #TBD (criar)
- **Justificativa:** Simulador validará empiricamente

### ESPEC-04: Fixtures Teste Negativo

- **Natureza:** Casos de teste patológicos
- **Fase:** Fase 4 (Verificação)
- **Issue:** #TBD (criar)
- **Justificativa:** Suíte de motor define casos, depois criar fixtures

---

## Bloqueantes Resolvidos

Fase 0 eliminou 7 inconsistências/lacunas críticas:

- ✅ **DEF-02:** Tie-breaker ordenação → DI-007 (RNG seeded)
- ✅ **DEF-03:** Cooldown Marco timing → DI-008 (após declaração)
- ✅ **DEF-04:** 21 vs 14 dias → DI-006 (unificado 14 dias)
- ✅ **INCONS-01:** RF-048 vs RF-007A → DI-006 (14 dias)
- ✅ **LAC-04:** Camadas compartilhamento → DI-009 (6 camadas)
- ✅ **LAC-06:** Gênero gramatical → DI-010 (neutro + placeholders)
- ✅ **ESPEC-02:** `in.reencontro` threshold → DI-011 (≥10 dias)

---

## Validação de Consistência

### PRD vs ESPEC vs ADRs

Auditoria cruzada entre documentos:

| Validação                           | Status | Notas                                          |
| ----------------------------------- | ------ | ---------------------------------------------- |
| RF-XXX cobertos por DI-006 a DI-011 | ✅     | Todas referências explícitas                   |
| D-XXX (decisões PRD) não conflitam  | ✅     | D-033, D-036, D-038, D-042 verificados         |
| ADR-0001 a ADR-0014 não conflitam   | ✅     | Monorepo, event sourcing, RN Web OK            |
| RN-XXX não bloqueados               | ✅     | RN-007 (PSE K=60% DI-002), RN-027 (sem LLM) OK |
| RC-XXX (LGPD) respeitados           | ✅     | RC-001 atendido por DI-009 (PSE off-padrão)    |

### Dependências de Fase

Decisões DI-006 a DI-011 desbloqueiam:

- **Fase 1 (Setup):** DI-005 (Turborepo) já aceita, F1 pode começar
- **Fase 2 (Motor):** DI-007 (RNG), DI-010 (template engine), DI-011 (elegibilidade)
- **Fase 3 (Domínio):** DI-006 (14 dias), DI-008 (cooldown)
- **Fase 6 (Mobile):** DI-009 (6 camadas compartilhamento)

---

## Critérios de Aceite Fase 0

Checklist de saída conforme `01-FASE-0-RECONCILIACAO.md`:

- [x] DI-006 a DI-011 registrados em `DECISOES-IMPLEMENTACAO.md`
- [x] Gate aprovado criado (`FASE-0-GATE-APROVADO.md`)
- [x] Itens não-bloqueantes identificados (4 issues pendentes)
- [x] Nenhuma inconsistência bloqueante PRD/ESPEC/ADRs
- [x] Todas decisões com alternativas, justificativa, consequências

---

## Issues GitHub a Criar

4 issues para rastrear itens não-bloqueantes:

### Issue 1: LAC-07 — Campos Modalidade

```
**Título:** [Fase 6] Definir campos registro por modalidade
**Labels:** `fase-6`, `ux`, `não-bloqueante`
**Milestone:** M6
**Descrição:**
RF-050 a RF-057 requerem adaptar campos de registro à modalidade.
Decisão de quais campos mostrar/esconder por tipo (carga, distância, etc.).
**Bloqueado por:** Nenhum
**Fase:** 6 (Mobile MVP)
```

### Issue 2: ESPEC-03 — Orçamento Complicações

```
**Título:** [Fase 4] Definir orçamento complicações por capítulo
**Labels:** `fase-4`, `verificação`, `catálogo`
**Milestone:** M4
**Descrição:**
Quantas complicações simultâneas abertas por capítulo?
ESPEC não define limiar. Simulador deve validar empiricamente.
**Bloqueado por:** Nenhum
**Fase:** 4 (Verificação)
```

### Issue 3: ESPEC-04 — Fixtures Teste Negativo

```
**Título:** [Fase 4] Criar fixtures teste negativo
**Labels:** `fase-4`, `testes`, `catálogo`
**Milestone:** M4
**Descrição:**
13 fixtures patológicos para validar tratamento de erro:
- Storylet sem banda, sem desfecho, ciclos órfãos, etc.
**Bloqueado por:** Suíte motor (Fase 2)
**Fase:** 4 (Verificação)
```

### Issue 4: ESPEC-01 — Esclarecimento Pesos

```
**Título:** [Fase 2] Documentar pesos storylet padrão
**Labels:** `fase-2`, `motor`, `documentação`
**Milestone:** M2
**Descrição:**
ESPEC menciona pesos, mas não define padrão.
Código deve assumir peso=1 uniforme salvo exceções explícitas.
**Bloqueado por:** Nenhum
**Fase:** 2 (Motor Narrativo)
```

---

## Próximo Passo

**Fase 1 (Setup Monorepo) desbloqueada.**

Executar conforme `02-FASE-1-SETUP.md`:

1. Inicializar workspace Turborepo + pnpm
2. Criar packages config (typescript, eslint)
3. Criar placeholders `motor-narrativo`, `dominio`
4. Configurar CI GitHub Actions
5. Validar gate M1 antes de Fase 2

**Estimativa Fase 1:** 1.5 semanas  
**Próximo gate:** M1 (Fundações Operacionais)

---

**Aprovação final:** Fase 0 completa, documentação consistente, decisões rastreáveis.  
**Tag de commit:** `fase-0-completa`  
**Data de aprovação:** 2026-07-26
