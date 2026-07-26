# Fase 0: Reconciliação — FORJA

**Duração:** 2 semanas (Semana 1-2)  
**Gate:** Bloqueante absoluto — Fase 1 não começa até 100% resolvido  
**Objetivo:** Resolver lacunas/defeitos pendentes em PRD + ESPEC; documentar decisões

---

## 1. Contexto

### 1.1 Situação Atual
- PRD v0.14 + ESPEC v2.6 completos
- ESPEC declara "sem questões abertas" (linha 10)
- Decisões DEC-005 a DEC-021, DEC-033, DEC-036, DEC-037 já travadas
- Várias resolvem lacunas (ex: DEC-010 = reconhecimento por alcançabilidade)

### 1.2 O Que Precisa Reconciliar
1. **Verificar se decisões DEC-XXX cobrem todas lacunas PRD §15.2**
2. **Identificar decisões implícitas não documentadas em DI-XXX**
3. **Validar consistência entre PRD, ESPEC, ADRs**
4. **Resolver questões de implementação não cobertas por specs**

### 1.3 Risco Principal
**R-032 (crítico):** Lacunas não resolvidas bloqueiam Fase 1-2.

---

## 2. Escopo da Fase

### 2.1 Entradas
- [x] PRD v0.14 (`docs/prd/PRD-Forja-v0_14.md`)
- [x] ESPEC v2.6 (`docs/prd/ESPEC-Sistema-Narrativo-v2_6.md`)
- [x] ADRs 0001-0014 (`docs/adr/`)
- [x] Decisões travadas D-001 a D-045 (PRD §4)
- [x] Decisões ESPEC DEC-005 a DEC-037

### 2.2 Saídas
- [ ] Lista de 16 lacunas/defeitos com status (resolvido/pendente/N/A)
- [ ] Novas entradas em `DECISOES-IMPLEMENTACAO.md` (DI-006+)
- [ ] Issues GitHub para decisões que exigem investigação
- [ ] Atualização de ADRs se necessário (improvável)
- [ ] Gate aprovado: documento `FASE-0-GATE-APROVADO.md`

---

## 3. Inventário de Lacunas e Defeitos

### 3.1 Lacunas Mencionadas no PRD §15.2

PRD §15.2 lista lacunas conhecidas. Verificar status:

| ID | Descrição | Status | Resolução |
|----|-----------|--------|-----------|
| **LAC-01** | Múltiplas campanhas vs única no MVP | ✅ Resolvida | DI-001 (campanha única) |
| **LAC-02** | Trégua retroativa: snapshot vs replay | ✅ Resolvida | DI-003 (replay) |
| **LAC-03** | Limite de Fôlego acumulado | ✅ Resolvida | D-044 (teto 4) |
| **LAC-04** | Compartilhamento: quais camadas opcionais | ⚠️ Investigar | RF-063, RF-064 |
| **LAC-05** | Wearable: quais dados capturar | ✅ N/A | D-003 (adiar v2) |
| **LAC-06** | I18n: como lidar com gênero gramatical | ⚠️ Investigar | RF-124 |
| **LAC-07** | Modalidade: campos específicos (ex: distância) | ⚠️ Implementar | RF-056 (baixa prioridade) |
| **LAC-08** | PSE: deve influenciar progressão? | ✅ Resolvida | RN-007 + DI-002 (K=60%) |
| **LAC-09** | Marco: cooldown por atributo vs por rótulo | ✅ Resolvida | RF-043 (por rótulo) |
| **LAC-10** | Assinatura: modelo de cobrança | ✅ N/A | D-026 (adiar) |
| **LAC-11** | Kill-switch: granularidade (campanha vs storylet) | ✅ Resolvida | ADR-0004 (campanha inteira) |

**Pendentes (3):**
- LAC-04: Definir camadas de compartilhamento (ex: storylet recente, atributos, PSE histórico)
- LAC-06: Estratégia de gênero gramatical (templates, variantes, ou aceitar neutro)
- LAC-07: Campos específicos de modalidade (baixa prioridade, pode simplificar no MVP)

---

### 3.2 Defeitos Mencionados no PRD §15.3

| ID | Descrição | Status | Resolução |
|----|-----------|--------|-----------|
| **DEF-01** | Valor de K (influência de PSE) não especificado | ✅ Resolvida | DI-002 (K=60%) |
| **DEF-02** | Algoritmo de ordenação em caso de empate | ⚠️ Implementar | ESPEC §6.1 menciona, precisa detalhar |
| **DEF-03** | Cooldown de Marco: início quando? (após declaração ou após ciclo encerrar) | ⚠️ Investigar | RF-043 menciona "2 ciclos", mas quando conta? |
| **DEF-04** | Pausa longa: 21 dias ou 14 dias? | ⚠️ Resolver | RF-048 (21 dias) vs RF-007A (14 dias retroativo) |
| **DEF-05** | Snapshot vs replay: quando recalcular? | ✅ Resolvida | ADR-0002 + DI-003 |

**Pendentes (3):**
- DEF-02: Ordenação em empate (determinismo exige regra clara)
- DEF-03: Cooldown de Marco (início imediato ou após encerramento de ciclo?)
- DEF-04: Inconsistência entre 21 dias (RF-048) e 14 dias (RF-007A)

---

### 3.3 Lacunas ESPEC (Implícitas)

ESPEC v2.6 declara "sem questões abertas", mas leitura cuidadosa revela:

| Item | Descrição | Status | Ação |
|------|-----------|--------|------|
| **ESPEC-01** | ESPEC §6.1: "sorteio ponderado uniforme" — pesos iguais? | ⚠️ Esclarecer | Verificar se todos elegíveis têm peso 1 |
| **ESPEC-02** | ESPEC §6.2: `in.reencontro` — "10 dias ou mais" inclui exato 10? | ⚠️ Esclarecer | Definir `>=10` ou `>10` |
| **ESPEC-03** | ESPEC §3.5: Complicações — quantas por capítulo? | ⚠️ Investigar | Orçamento de comp. por capítulo? |
| **ESPEC-04** | ESPEC §7.3: Fixtures de teste — onde ficam? | ⚠️ Implementar | Criar `testes/fixtures/negativos/` |

**Pendentes (4):** Todas exigem esclarecimento ou decisão de implementação.

---

### 3.4 Inconsistências Entre Documentos

| Item | Conflito | Resolução |
|------|----------|-----------|
| **INCONS-01** | PRD RF-048 (21 dias) vs RF-007A (14 dias) | Resolver via DI-006 |
| **INCONS-02** | ADR-0001 menciona Turborepo, mas sem `turbo.json` no repo | Fase 1 criará |
| **INCONS-03** | ADR-0010 menciona CI com Python scripts, mas paths hardcoded `/home/claude` | Ajustar paths em F4 |

**Pendentes (3):** Todas resolvíveis em fases posteriores, exceto INCONS-01 (bloqueante).

---

## 4. Plano de Reconciliação

### 4.1 Semana 1: Auditoria

**Dia 1-2:**
- [ ] Ler PRD §15 completo, mapear todas lacunas/defeitos
- [ ] Ler ESPEC v2.6 completo, identificar ambiguidades
- [ ] Ler todos ADRs (0001-0014), verificar consistência com PRD/ESPEC
- [ ] Compilar lista de 20+ itens pendentes

**Dia 3-4:**
- [ ] Classificar cada item: resolvido | decisão-rápida | investigação | N/A
- [ ] Criar issues GitHub para itens que exigem investigação (ex: DEF-02, ESPEC-03)
- [ ] Documentar decisões rápidas em `DECISOES-IMPLEMENTACAO.md` (DI-006+)

**Dia 5:**
- [ ] Checkpoint: apresentar lista completa ao "cliente" (auto-revisão ou colega)
- [ ] Ajustar prioridades (bloquante vs pode-adiar)

---

### 4.2 Semana 2: Resolução

**Dia 6-8:**
- [ ] Resolver itens bloqueantes (DEF-02, DEF-03, DEF-04, INCONS-01)
- [ ] Tomar decisões de design quando necessário (ex: gênero gramatical)
- [ ] Atualizar `DECISOES-IMPLEMENTACAO.md` com DI-006 a DI-015 (estimativa)

**Dia 9-10:**
- [ ] Resolver itens não-bloqueantes mas importantes (LAC-04, LAC-06, ESPEC-02)
- [ ] Adiar itens de baixa prioridade para fases posteriores (LAC-07, ESPEC-03)
- [ ] Atualizar `ESCOPO-MVP.md` se decisões alterarem escopo

**Dia 11-12:**
- [ ] Validação cruzada: PRD vs ESPEC vs ADRs vs DI-XXX
- [ ] Gerar `FASE-0-GATE-APROVADO.md` com lista de decisões + status
- [ ] Criar issues GitHub para todas decisões pendentes (sprint backlog Fase 1+)

**Gate:** Aprovar Fase 0 quando 100% de itens bloqueantes resolvidos.

---

## 5. Decisões a Tomar (Antecipadas)

### 5.1 DI-006: Pausa Longa — 14 ou 21 Dias?

**Problema:** RF-048 (Marcos não contam após 21 dias) vs RF-007A (Trégua Recuperação retroativa 14 dias).

**Alternativas:**
1. **21 dias para ambos:** Unifica regra, mais generoso
2. **14 dias para ambos:** Mais restritivo, consistente com "2 semanas"
3. **Regras separadas:** 14 dias para Trégua, 21 para Marcos (complexo)

**Recomendação:** Opção 2 (14 dias). Justificativa:
- RF-007A já usa 14 dias (Trégua Recuperação)
- Consistência facilita comunicação
- 14 dias = 2 semanas (fácil lembrar)

---

### 5.2 DI-007: Ordenação em Empate

**Problema:** ESPEC §6.1 não especifica tie-breaker se múltiplos storylets têm prioridade idêntica.

**Alternativas:**
1. **Aleatório com seed:** Usar RNG seeded
2. **Ordem alfabética por ID:** Determinístico, mas favorece storylets com IDs menores
3. **Ordem de declaração no catálogo:** Depende de ordem de arquivo (frágil)

**Recomendação:** Opção 1 (aleatório seeded). Justificativa:
- RF-036: motor puro, seed garante reprodutibilidade
- Evita viés (alfabético favorece IDs específicos)
- Simulador pode testar distribuição justa

---

### 5.3 DI-008: Cooldown de Marco — Quando Começa?

**Problema:** RF-043 (cooldown 2 ciclos por rótulo) — inicia após declaração ou após encerramento de ciclo?

**Alternativas:**
1. **Após declaração:** Marco declarado dia 1 de ciclo N → cooldown começa imediatamente
2. **Após encerramento:** Marco declarado dia 1 de ciclo N → cooldown começa quando N encerra

**Recomendação:** Opção 1 (após declaração). Justificativa:
- Simplicidade: não precisa rastrear "ciclo de declaração"
- Evita exploits (declarar Marco no último dia de ciclo)
- Alinhado com intuição: "já declarei, agora espero"

---

### 5.4 DI-009: Camadas de Compartilhamento

**Problema:** RF-063 (ligar/desligar camadas) — quais camadas existem?

**Alternativas:**
1. **Minimal (3 camadas):** Storylet recente | Atributos | Ficha completa
2. **Completo (6 camadas):** Storylet | Atributos | PSE | Histórico | Juramento | Modalidade
3. **Granular (10+ camadas):** Tudo separado

**Recomendação:** Opção 2 (completo, 6 camadas). Justificativa:
- Equilibra controle do usuário vs complexidade de UI
- Camadas sensíveis (PSE, histórico) opcionais por padrão (RF-064)
- Suficiente para MVP, expansível em v2

**Camadas propostas:**
1. **Storylet recente** (sempre on)
2. **Atributos principais** (on por padrão)
3. **PSE da sessão** (off por padrão — RC-001, dado de saúde)
4. **Histórico de ciclos** (off por padrão)
5. **Juramento atual** (on por padrão)
6. **Modalidade** (on por padrão)

---

### 5.5 DI-010: Gênero Gramatical

**Problema:** RF-124 (declarar gênero por entidade) — como aplicar em texto?

**Alternativas:**
1. **Templates com placeholders:** `{entidade} estava {cansado|cansada}` (complexo)
2. **Variantes completas:** Escrever parágrafos duplicados para M/F (trabalhoso)
3. **Neutro por padrão:** Reescrever prosa para evitar gênero (ideal, mas difícil em pt-BR)

**Recomendação:** Opção 3 + Opção 1 quando inevitável. Justificativa:
- pt-BR permite neutro em muitos casos ("você", "a pessoa", verbos em 2ª pessoa)
- Quando inevitável (ex: adjetivos), usar placeholders simples
- Evita duplicar texto (manutenção 2x)

**Implementação:**
- Entidade tem `genero: 'M' | 'F' | 'N'`
- Template engine suporta `{adj:cansado}` → resolve baseado em gênero do sujeito
- Maioria da prosa evita adjetivos (estilo indireto)

---

### 5.6 DI-011: `in.reencontro` — Inclui Exato 10 Dias?

**Problema:** ESPEC §6.2 diz "10 dias ou mais" — ambíguo se dia 10 conta.

**Alternativas:**
1. **`>=10` (inclui):** Reencontro ativa em exato 10 dias
2. **`>10` (exclui):** Só ativa em 11+ dias

**Recomendação:** Opção 1 (`>=10`). Justificativa:
- "10 dias **ou mais**" linguisticamente inclui 10
- Consistente com outras regras (ex: RF-048 "21 dias ou mais")
- Mais generoso (beneficia jogador)

---

## 6. Critérios de Gate

Fase 0 aprovada quando:

- [ ] 100% de itens bloqueantes resolvidos (DEF-02, DEF-03, DEF-04, INCONS-01)
- [ ] Decisões DI-006 a DI-011 documentadas em `DECISOES-IMPLEMENTACAO.md`
- [ ] Issues GitHub criadas para decisões adiadas (LAC-07, ESPEC-03)
- [ ] Nenhuma inconsistência crítica entre PRD/ESPEC/ADRs
- [ ] Documento `FASE-0-GATE-APROVADO.md` gerado com assinatura

**Template de gate:**

```markdown
# Fase 0: Gate Aprovado

**Data:** YYYY-MM-DD  
**Aprovado por:** [nome]

## Decisões Tomadas
- DI-006: 14 dias para pausa longa
- DI-007: Ordenação por seed em empate
- DI-008: Cooldown inicia após declaração
- DI-009: 6 camadas de compartilhamento
- DI-010: Neutro + placeholders para gênero
- DI-011: `in.reencontro` ativa em `>=10` dias

## Itens Adiados
- LAC-07 (campos específicos de modalidade) → Fase 3
- ESPEC-03 (orçamento de complicações) → Fase 4
- ESPEC-04 (fixtures de teste) → Fase 4

## Bloqueantes Resolvidos
- ✅ DEF-02: Tie-breaker definido (seed)
- ✅ DEF-03: Cooldown definido (após declaração)
- ✅ DEF-04: Unificado em 14 dias
- ✅ INCONS-01: RF-048 ajustado para 14 dias

## Próximo Passo
Iniciar Fase 1 (Setup de Monorepo).
```

---

## 7. Riscos Específicos da Fase

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| **Descobrir lacunas não mapeadas** | Alta (50%) | Timebox: 2 semanas hard limit; priorizar bloqueantes |
| **Decisões exigem consenso externo** | Média (30%) | Solo dev: tomar decisão documentada, revisar em v1.1 |
| **Estouro de prazo (>2 semanas)** | Alta (50%) | Gate: adiar decisões não-bloqueantes para fases posteriores |

**Plano B:** Se Fase 0 exceder 2 semanas, aceitar decisões "good enough" e revisar em retrospectiva pós-F4.

---

## 8. Checklist de Saída

Antes de marcar Fase 0 como completa:

- [ ] Auditoria de PRD §15 completa
- [ ] Auditoria de ESPEC v2.6 completa
- [ ] Auditoria de ADRs 0001-0014 completa
- [ ] Lista de 20+ itens compilada
- [ ] 6+ decisões documentadas (DI-006 a DI-011)
- [ ] Issues GitHub criadas para sprint backlog
- [ ] `FASE-0-GATE-APROVADO.md` gerado
- [ ] `DECISOES-IMPLEMENTACAO.md` atualizado
- [ ] `ESCOPO-MVP.md` atualizado (se necessário)
- [ ] Commit com tag `fase-0-completa`

---

**Próxima fase:** Fase 1 (Setup de Monorepo)  
**Duração estimada Fase 1:** 1 semana
