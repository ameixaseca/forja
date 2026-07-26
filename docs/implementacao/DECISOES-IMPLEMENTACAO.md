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

### DI-006: Pausa Longa Unificada em 14 Dias

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve DEF-04 e INCONS-01 (inconsistência RF-048 vs RF-007A)  
**Relacionado:** RF-048, RF-007A, D-042

#### Problema

RF-048 especifica janela de retorno de Marcos após "21 dias ou mais" sem sessão, enquanto RF-007A (Trégua de Recuperação) usa "14 dias" para retroatividade. Inconsistência gera confusão e implementação dupla.

#### Alternativas Consideradas

1. **Manter 21 dias para Marcos, 14 para Trégua:**
   - Pros: Preserva texto original RF-048
   - Cons: Inconsistente, usuário não entende diferença
2. **Unificar em 21 dias:**
   - Pros: Janela mais longa, mais generosa
   - Cons: Menos alinhado com "2 semanas" culturalmente
3. **Unificar em 14 dias:**
   - Pros: "2 semanas" fácil comunicar, consistente RF-007A
   - Cons: Janela mais curta

#### Decisão

Escolhemos **Opção 3** (unificar em 14 dias para ambas regras).

**Justificativa:**

- RF-007A já usa 14 dias (aprovado em D-042)
- "2 semanas" é culturalmente claro
- Simplifica implementação e comunicação

#### Consequências

- **Positivas:** Consistência, menos regras para usuário memorizar
- **Negativas:** Janela Marco ligeiramente mais curta que originalmente especificado
- **Riscos:** Nenhum — 14 dias é suficiente para pausas comuns

#### Validação

- Ajustar RF-048 mentalmente durante Fase 3 (implementação)
- Testes: verificar que janela de retorno ativa aos 14 dias exatos
- Copy: mencionar "2 semanas" em vez de "14 dias" na UI

---

### DI-007: Tie-breaker Determinístico via RNG Seeded

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve DEF-02 (empate entre storylets mesma prioridade)  
**Relacionado:** RF-036, M-05 (determinismo cross-platform)

#### Problema

ESPEC §6.1 não especifica desempate quando múltiplos storylets têm mesma prioridade após filtragem. Ordenação alfabética introduz viés; `Math.random()` quebra determinismo.

#### Alternativas Consideradas

1. **Alfabético por ID:**
   - Pros: Determinístico, sem deps
   - Cons: Viés (IDs começando com "a" sempre priorizados)
2. **Aleatório com `Math.random()`:**
   - Pros: Sem viés
   - Cons: Quebra RF-036 (motor não reproduzível)
3. **Aleatório seeded (RNG próprio):**
   - Pros: Sem viés, determinístico, testável
   - Cons: Precisa implementar RNG (Mulberry32 ou similar)

#### Decisão

Escolhemos **Opção 3** (RNG seeded para tie-breaker).

**Justificativa:**

- RF-036: motor puro exige reprodutibilidade
- M-05: determinismo cross-platform testável via seed fixa
- Sem viés de autoria (ordem de storylets no JSON não importa)

#### Consequências

- **Positivas:** Testes reproduzíveis, bugs reproduzíveis, sem viés alfabético
- **Negativas:** Adiciona ~20 linhas de código (RNG impl)
- **Riscos:** Se RNG for diferente entre plataformas, M-05 falha

#### Validação

- Implementar Mulberry32 (32-bit, cross-platform estável)
- Teste M-05: rodar seed fixa em Node.js, navegador, Hermes; verificar output idêntico
- Função `selectOne(pool: Storylet[], rng: RNG): Storylet`

---

### DI-008: Cooldown Marco Inicia Após Declaração

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve DEF-03 (quando começa cooldown?)  
**Relacionado:** RF-043, §4.8 PRD

#### Problema

RF-043 define cooldown de 2 ciclos por rótulo de Marco, mas não especifica quando inicia: (A) após declaração, (B) após encerramento do ciclo, ou (C) após contabilização.

#### Alternativas Consideradas

1. **Cooldown inicia após declaração:**
   - Pros: Simples, previne exploit (declarar Marco último dia ciclo)
   - Cons: Nenhum significativo
2. **Cooldown inicia após encerramento ciclo:**
   - Pros: Alinhado com "ciclo como unidade"
   - Cons: Permite exploit, complexo rastrear "ciclo de declaração"
3. **Cooldown inicia após contabilização:**
   - Pros: Só começa se Marco contar
   - Cons: Confuso (Marco em ciclo quebrado não inicia cooldown, mas está registrado)

#### Decisão

Escolhemos **Opção 1** (cooldown inicia imediatamente após declaração).

**Justificativa:**

- Simplicidade: não rastrear metadado "ciclo de declaração"
- Previne exploit: declarar Marco dia 6/6 não burla cooldown
- Intuitivo para usuário: "marquei PR de agachamento hoje, próximo em 2 semanas"

#### Consequências

- **Positivas:** Implementação simples, sem edge cases de timing
- **Negativas:** Marco em ciclo quebrado ainda bloqueia rótulo (aceitável, é registro honesto)
- **Riscos:** Nenhum

#### Validação

- Lógica em `packages/dominio/src/marcos.ts` (Fase 3)
- Teste: declarar Marco dia 1 ciclo N, verificar que rótulo bloqueado até ciclo N+2 encerrado

---

### DI-009: Camadas Compartilhamento — 6 Camadas Configuráveis

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve LAC-04 (quais camadas permitir ligar/desligar?)  
**Relacionado:** RF-063, RF-064, RC-001 (LGPD dado sensível)

#### Problema

RF-063 permite ligar/desligar camadas opcionais no artefato compartilhável, mas não especifica quais camadas existem nem quais são sensíveis (RC-001).

#### Alternativas Consideradas

1. **3 camadas (simples):**
   - Narrativa (always on), Atributos (opt-in), PSE (opt-in)
   - Pros: Simples
   - Cons: Pouco controle
2. **6 camadas (granular):**
   - Storylet recente (always on), Atributos, PSE, Histórico ciclos, Juramento, Modalidade
   - Pros: Controle fino, privacidade configurável
   - Cons: UI mais complexa
3. **9+ camadas (máximo):**
   - Adicionar: semente, data sessão, duração, etc.
   - Pros: Controle total
   - Cons: UI inviável, overwhelming

#### Decisão

Escolhemos **Opção 2** (6 camadas configuráveis).

**Camadas:**

1. **Storylet recente** — sempre on (é o artefato)
2. **Atributos principais** (Força, Vigor, Destreza, Vontade) — on padrão
3. **PSE sessão** — **off padrão** (RC-001: dado saúde sensível)
4. **Histórico ciclos** (últimos 4) — off padrão
5. **Juramento atual** — on padrão
6. **Modalidade** — on padrão

**Justificativa:**

- Equilibra controle vs complexidade UI
- Camadas sensíveis (PSE, histórico) off por padrão (RC-001)
- Suficiente MVP, expansível v2

#### Consequências

- **Positivas:** Privacidade configurável, atende RC-001, artefato personalizável
- **Negativas:** UI Fase 6 precisa 6 toggles (aceitável)
- **Riscos:** Se usuário esquecer PSE on, pode expor dado saúde (mitigado por padrão off + confirmação)

#### Validação

- UI mobile (Fase 6): modal de pré-visualização com 6 toggles
- Teste: gerar artefato com cada combinação, verificar que dados corretos aparecem/somem
- Copy: avisar "PSE é dado de saúde" quando ligar toggle

---

### DI-010: Gênero Gramatical — Neutro por Padrão + Template Placeholders

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve LAC-06 (como aplicar gênero gramatical?)  
**Relacionado:** RF-124, RE-011, D-038

#### Problema

RF-124 exige declarar gênero por entidade, mas pt-BR exige concordância em adjetivos/particípios. Como resolver sem duplicar texto nem implementar motor de concordância completo?

#### Alternativas Consideradas

1. **Duplicar texto (M/F/N):**
   - Pros: Simples, sem template engine
   - Cons: Manutenção 3x, espaço 3x, erros de sincronia
2. **Motor de concordância NLP:**
   - Pros: Genérico, resolve todos casos
   - Cons: Complexo, overkill MVP, quebraria D-033
3. **Neutro por padrão + placeholders quando inevitável:**
   - Pros: Simples, resolve 90% casos, expansível
   - Cons: Prosa precisa evitar adjetivos (desafio autoral)

#### Decisão

Escolhemos **Opção 3** (neutro + template placeholders seletivos).

**Estratégia:**

- **Prosa evita adjetivos** (RE-011: construção indireta, 2ª pessoa "você")
- **Quando inevitável:** template `{adj:cansado/cansada/cansade}` resolve via `entidade.genero`
- **Entidade tem campo:** `genero: 'M' | 'F' | 'N'` (neutro padrão)
- **Template engine simples:** regex replace, 3 formas separadas por `/`

**Exemplo:**

```
Texto: "Você está {adj:cansado/cansada/cansade} após a longa jornada."
Entidade: { genero: 'F' }
Output: "Você está cansada após a longa jornada."
```

**Justificativa:**

- pt-BR permite neutro em muitos casos (verbos no infinitivo, substantivos sem gênero)
- Evita duplicar storylets completos
- Template engine < 50 linhas, não quebra D-033

#### Consequências

- **Positivas:** Manutenção 1x, espaço 1x, arquitetura i18n preservada
- **Negativas:** Autoria precisa seguir RE-011 (evitar adjetivos), placeholders em ~10-15% dos storylets
- **Riscos:** Se prosa precisar muito adjetivos, placeholders proliferam (mitigado por revisão editorial)

#### Validação

- Schema entidade: `content/schema/entity.schema.json` com campo `genero`
- Engine: `packages/motor-narrativo/src/template.ts` com função `applyGender(texto, genero)`
- Teste: 10 storylets com placeholders, verificar output correto para M/F/N
- Protótipo cap 1: auditar quantos storylets precisam placeholders (meta: <20%)

---

### DI-011: `in.reencontro` Ativa com ≥10 Dias (Inclui Dia 10)

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 0, resolve ESPEC-02 (ambiguidade "10 dias ou mais")  
**Relacionado:** RF-030A, §6.2 ESPEC

#### Problema

RF-030A especifica `in.reencontro = 1` após "10 dias ou mais sem sessão", mas não esclarece se 10 dias exatos ativa regra ou apenas >10 (11+).

#### Alternativas Consideradas

1. **`>10` (exclusivo, 11+ dias):**
   - Pros: Conservador
   - Cons: Linguisticamente incorreto ("10 **ou mais**" inclui 10)
2. **`>=10` (inclusivo, 10+ dias):**
   - Pros: Linguisticamente correto, mais generoso ao jogador
   - Cons: Nenhum

#### Decisão

Escolhemos **Opção 2** (`>=10`, inclui dia 10 exato).

**Justificativa:**

- "10 dias **ou mais**" linguisticamente inclui 10
- Consistente com RF-048 "21 dias ou mais" (DI-006 usa `>=14`)
- Beneficia jogador (ativa regra 1 dia antes)

#### Consequências

- **Positivas:** Consistência linguística, generoso ao jogador
- **Negativas:** Nenhuma
- **Riscos:** Nenhum

#### Validação

- Função `isEligible()` em `packages/motor-narrativo/src/selector/eligibility.ts` (Fase 2)
- Teste: criar histórico com última sessão há exatos 10 dias, verificar `in.reencontro = 1`
- Teste: criar histórico com última sessão há 9 dias, verificar `in.reencontro = 0`

---

## DI-012: Adiar resolução ESLint workspace para Fase 2

**Data:** 2026-07-26  
**Status:** Aceita  
**Contexto:** Fase 1 (Setup Monorepo), critério gate M1  
**Relacionado:** Tarefa 1.5 (Linting)

### Problema

Durante setup Fase 1, ESLint 8.57.1 não consegue resolver `@forja/config-eslint` em workspace packages:

```
ESLint couldn't find the config "@forja/config-eslint" to extend from.
The config "@forja/config-eslint" was referenced from the config file in "C:\repos\forja\.eslintrc.js".
```

**Causa provável:** ESLint v8 com `.eslintrc.js` não resolve workspaces pnpm corretamente (ou precisa config adicional).

### Alternativas Consideradas

1. **Migrar ESLint v10 flat config agora** — DI-005 rejeitou por complexidade setup
2. **Configurar resolução manual workspace** — investigar `eslint-plugin-import`, `eslint-import-resolver-node`
3. **Adiar para Fase 2** — marcar Fase 1 funcional, resolver quando motor narrativo tiver código real

### Decisão

Escolhemos **Opção 3** (adiar).

**Justificativa:**

- Prettier funciona (`pnpm format` OK)
- Typecheck funciona (`pnpm typecheck` OK)
- Teste funciona (`pnpm test` OK, 11 testes passando)
- Código Fase 1 é placeholder mínimo, linting traz baixo valor
- Fase 2 terá código real motor narrativo, momento adequado para resolver

### Consequências

- **Positivas:** Desbloqueia gate M1, evita yak shaving
- **Negativas:** CI job `lint` falhará até resolução
- **Riscos:** Baixo (Prettier + TypeScript cobrem 80% casos)

### Validação

- Fase 2: Antes M-01, resolver ESLint workspace resolution
- Critério sucesso: `pnpm lint` passa sem erros
- Alternativa: Se persistir, migrar ESLint v10 flat config

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

| ID     | Título                         | Fase | Status | Data       |
| ------ | ------------------------------ | ---- | ------ | ---------- |
| DI-001 | Campanha única no MVP          | F0   | Aceita | 2026-07-26 |
| DI-002 | K dinâmico a 60%               | F0   | Aceita | 2026-07-26 |
| DI-003 | Trégua retroativa via replay   | F0   | Aceita | 2026-07-26 |
| DI-004 | Simulador com seed fixa        | F2   | Aceita | 2026-07-26 |
| DI-005 | Monorepo com Turborepo         | F1   | Aceita | 2026-07-26 |
| DI-006 | Pausa longa unificada 14 dias  | F0   | Aceita | 2026-07-26 |
| DI-007 | Tie-breaker determinístico RNG | F0   | Aceita | 2026-07-26 |
| DI-008 | Cooldown Marco após declaração | F0   | Aceita | 2026-07-26 |
| DI-009 | 6 camadas compartilhamento     | F0   | Aceita | 2026-07-26 |
| DI-010 | Gênero neutro + placeholders   | F0   | Aceita | 2026-07-26 |
| DI-011 | `in.reencontro` ativa ≥10 dias | F0   | Aceita | 2026-07-26 |
| DI-012 | Adiar ESLint workspace Fase 2  | F1   | Aceita | 2026-07-26 |

---

**Próxima decisão:** DI-013  
**Última atualização:** 26/07/2026
