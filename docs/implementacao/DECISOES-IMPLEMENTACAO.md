# Decisões de Implementação — FORJA

**Formato:** ADR-style (Architecture Decision Record)  
**Uso:** Log vivo de decisões tomadas durante implementação  
**Atualização:** Sempre que houver escolha arquitetural/técnica não coberta por ADR existente

---

## Como Usar Este Documento

### Quando Registrar Decisão

Registre quando:
- Resolver lacuna ESPEC (LAC-XX) ou defeito (DEF-XX)
- Escolher entre 2+ alternativas técnicas com trade-offs
- Decidir escopo/priorização que afeta cronograma
- Fazer escolha que pode precisar revisão futura

NÃO registre:
- Implementações triviais sem alternativa
- Decisões já cobertas por ADRs oficiais
- Bugs/fixes sem impacto arquitetural

### Formato de Entrada

```markdown
## DI-NNN: Título da Decisão

**Data:** YYYY-MM-DD  
**Status:** Proposta | Aceita | Supersedida | Rejeitada  
**Contexto:** Fase X, relacionado a [RF-XXX, LAC-XX, etc.]  
**Supersede:** DI-XXX (se aplicável)

### Problema
Descrever situação que exige decisão.

### Alternativas Consideradas
1. **Opção A:** descrição + trade-offs
2. **Opção B:** descrição + trade-offs

### Decisão
Escolhemos **Opção X** porque [justificativa].

### Consequências
- Positivas: ...
- Negativas: ...
- Riscos: ...

### Validação
Como verificar se decisão foi correta: [testes, métricas, etc.]
```

---

## Decisões Registradas

### DI-001: Campanha Única no MVP

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve LAC-01 (múltiplas campanhas vs única)  
**Relacionado:** D-040 (PRD), RF-032

#### Problema
PRD menciona "múltiplas campanhas" (RF-032), mas MVP precisa validar produto antes de criar segunda campanha. LAC-01 questiona se motor deve suportar multi-campanha desde v1.0.

#### Alternativas Consideradas
1. **Motor multi-campanha desde v1.0:**
   - Pros: Arquitetura completa, não precisa refatorar depois
   - Cons: Complexidade (seleção de campanha, migração, entitlements), atrasa F2
2. **Motor single-campaign, refatorar em v2:**
   - Pros: Simples, rápido, suficiente para validação
   - Cons: Refactor quando adicionar segunda campanha

#### Decisão
Escolhemos **Opção 2** (motor single-campaign no MVP).

**Justificativa (D-040):**
- MVP precisa validar mecânicas + narrativa antes de produzir mais conteúdo
- Testes bloqueantes (M10) determinam GO/NO-GO; segunda campanha depende de sucesso
- Arquitetura suporta multi-campanha (estado separado, versioning), mas código simplificado

#### Consequências
- **Positivas:** F2 (Motor) mais rápida, menos testes, menos edge cases
- **Negativas:** Refactor em v2 quando adicionar segunda campanha (estimativa: 1 sprint)
- **Riscos:** Se v2 exigir multi-campanha e refactor for complexo, pode atrasar

#### Validação
- Código em `packages/motor-narrativo` não referencia "múltiplas campanhas"
- Schema `campaign_instances` tem `campaign_id`, mas app só usa valor fixo
- Quando implementar v2: migration + UI de seleção

---

### DI-002: K Dinâmico a 60% do Teto

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve DEF-01 (qual valor de K?)  
**Relacionado:** RN-007 (PSE influencia banda de rolagem)

#### Problema
ESPEC §4.7 define banda de rolagem via PSE, mas não especifica percentual de influência. DEF-01 questiona: quanto PSE afeta banda?

#### Alternativas Consideradas
1. **K = 50% do teto:** PSE mediano altera banda em ±1 nível
   - Pros: Sensível, PSE tem impacto claro
   - Cons: Pode ser volátil, banda flutua muito
2. **K = 75% do teto:** PSE precisa ser extremo para mudar banda
   - Pros: Estável, menos flutuação
   - Cons: PSE vira cosmético, pouco impacto
3. **K = 60% do teto:** meio-termo
   - Pros: Sensível sem ser volátil
   - Cons: Valor arbitrário, precisa validar com simulador

#### Decisão
Escolhemos **Opção 3** (K = 60% do teto da modalidade).

**Justificativa (D-043):**
- PSE 7 (muito bom) em teto 10 → K=6 → banda muda 1 nível
- PSE 3 (péssimo) em teto 10 → K=6 → banda cai 2-3 níveis
- Simulador validará se impacto é adequado

#### Consequências
- **Positivas:** PSE tem impacto perceptível, mas não domina progressão
- **Negativas:** Valor pode precisar ajuste após simulador (M-07 a M-09)
- **Riscos:** Se banda flutuar demais, narrativa fica confusa

#### Validação
- Simulador: medir distribuição de bandas com PSE fixo vs aleatório
- Métrica: PSE deveria explicar ~30-40% da variação de banda (não <10% nem >60%)
- Se validação falhar: considerar K=50% ou K=75%, rodar simulador novamente

---

### DI-003: Trégua de Recuperação Retroativa via Replay

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve LAC-02 (como calcular retroatividade?)  
**Relacionado:** RF-007A, ADR-0002 (event sourcing)

#### Problema
RF-007A permite Trégua de Recuperação retroativa (14 dias). Como recalcular progressão? LAC-02 questiona se deve ser por snapshot ou replay.

#### Alternativas Consideradas
1. **Recalc por snapshot:**
   - Pros: Rápido, não precisa replay completo
   - Cons: Snapshot pode estar incorreto, não garante consistência
2. **Recalc via replay de eventos:**
   - Pros: Fonte única de verdade, consistência garantida
   - Cons: Mais lento (mas aceitável para operação rara)
3. **Hybrid:** snapshot + validação pontual
   - Pros: Rápido e seguro
   - Cons: Complexo, duplica lógica

#### Decisão
Escolhemos **Opção 2** (replay completo de `diary_events`).

**Justificativa (D-042):**
- ADR-0002: log é fonte, snapshot é cache
- Trégua de Recuperação é rara (<1x/mês esperado), performance aceitável
- Garante correção (se snapshot divergir, replay corrige)

#### Consequências
- **Positivas:** Consistência garantida, sem edge cases de snapshot desatualizado
- **Negativas:** Replay pode levar 1-2s em dispositivos antigos (aceitável)
- **Riscos:** Se replay tiver bug, recalc retroativo propaga erro

#### Validação
- Testes: criar 20 eventos, aplicar Trégua Retroativa dia 10, verificar banda recalculada
- Comparar: replay vs snapshot; devem convergir
- Se divergir: apagar snapshot, forçar replay (RF-034)

---

### DI-004: Simulador com Seed Fixa Obrigatória

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 2, relacionado a RF-100 a RF-103  
**Relacionado:** RF-036 (motor puro), M-01 a M-09 (testes de simulador)

#### Problema
Simulador precisa ser determinístico para reproduzir bugs. Como garantir?

#### Alternativas Consideradas
1. **Seed fixa hardcoded:**
   - Pros: Simples, sempre reproduz
   - Cons: Não testa variação, pode esconder bugs raros
2. **Seed aleatória com log:**
   - Pros: Testa variação, reproduz via log
   - Cons: Testes flaky se não logar seed
3. **Seed fixa em testes, aleatória em exploração manual:**
   - Pros: Testes estáveis, exploração livre
   - Cons: Precisa 2 modos

#### Decisão
Escolhemos **Opção 3** (seed fixa em CI, aleatória opcional com log).

**Justificativa:**
- RF-036: motor é função pura, mesma seed = mesmo resultado
- Testes M-01 a M-09 usam seed fixa (`42`, `12345`, etc.)
- CLI do simulador aceita `--seed` opcional; se omitido, usa aleatória + loga

#### Consequências
- **Positivas:** Testes reproduzíveis, bugs reproduzíveis
- **Negativas:** Seed fixa pode mascarar bugs em outras seeds (mitigado por rodar M=50)
- **Riscos:** Se motor não for puro, testes falham intermitentemente

#### Validação
- Lint rule: proibir `Math.random()`, `Date.now()` em `packages/motor-narrativo/`
- Testes: rodar mesma seed 3x, verificar output idêntico
- Property-based test: rodar 100 seeds aleatórias, verificar invariantes

---

### DI-005: Monorepo com Turborepo + pnpm

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 1, relacionado a ADR-0001  
**Relacionado:** F1 (setup), Stack Técnico

#### Problema
Compartilhar código entre mobile/web/API. Monorepo vs multi-repo?

#### Alternativas Consideradas
1. **Multi-repo:** packages separados, publicar no npm privado
   - Pros: Isolamento forte, deploy independente
   - Cons: Sincronizar versões, duplicar deps
2. **Monorepo sem tool:** workspaces do pnpm apenas
   - Pros: Simples, sem overhead
   - Cons: Sem cache, builds lentos
3. **Monorepo com Turborepo:**
   - Pros: Cache inteligente, pipelines declarativos
   - Cons: Overhead inicial (configuração)

#### Decisão
Escolhemos **Opção 3** (monorepo com Turborepo + pnpm workspaces).

**Justificativa (ADR-0001):**
- Compartilhar `motor-narrativo` e `dominio` entre todos apps
- Cache de Turborepo economiza ~70% de tempo em CI
- Pipelines declarativos (`turbo.json`) garantem ordem de build

#### Consequências
- **Positivas:** Refactor em `dominio` propaga automaticamente, DX consistente
- **Negativas:** Setup inicial mais complexo (~1 dia em F1)
- **Riscos:** R-020 (overhead); mitigado por documentação em `docs/setup/`

#### Validação
- `pnpm install` funciona na raiz
- `pnpm build` roda packages em ordem correta
- Cache hit rate >50% em CI após primeira build

---

## Template para Próximas Decisões

(Copie este bloco ao adicionar nova decisão)

```markdown
### DI-NNN: Título

**Data:** YYYY-MM-DD  
**Status:** Proposta  
**Contexto:** Fase X, relacionado a [...]

#### Problema
...

#### Alternativas Consideradas
1. **Opção A:** ...
2. **Opção B:** ...

#### Decisão
Escolhemos **Opção X** porque ...

#### Consequências
- **Positivas:** ...
- **Negativas:** ...
- **Riscos:** ...

#### Validação
...
```

---

## Índice de Decisões

| ID | Título | Fase | Status | Data |
|----|--------|------|--------|------|
| DI-001 | Campanha única no MVP | F0 | Aceita | 2026-07-26 |
| DI-002 | K dinâmico a 60% | F0 | Aceita | 2026-07-26 |
| DI-003 | Trégua retroativa via replay | F0 | Aceita | 2026-07-26 |
| DI-004 | Simulador com seed fixa | F2 | Aceita | 2026-07-26 |
| DI-005 | Monorepo com Turborepo | F1 | Aceita | 2026-07-26 |

---

**Próxima decisão:** DI-006  
**Última atualização:** 26/07/2026
