# Contexto e Premissas — FORJA

**Documento:** Visão executiva da implementação  
**Versão:** 1.0  
**Data:** 26/07/2026

---

## 1. Visão do Produto

**FORJA** é aplicativo de acompanhamento de treino estruturado como RPG solo de mesa. O usuário registra sessões de treino, e cada sessão dispara uma resolução narrativa que avança uma campanha procedural.

### 1.1 Tese Central (PRD §1.1)

Apps de fitness falham em retenção porque a recompensa é abstrata. Apps "gamificados" falham porque o jogo é verniz. **FORJA aposta que ficção autoral cria motivo para abrir o app amanhã que barra de XP não cria.**

### 1.2 Anti-Tese (PRD §1.2)

Se a narrativa for percebida como aleatória e sem consequência, colapsa para "Habitica com tema de fantasia" em 4–6 semanas.

### 1.3 Defesa Contra a Anti-Tese

- **D-023:** Arquitetura de storylet (não combinatória de tabelas)
- **RF-023:** Estado persistente com reconhecimento explícito de retornos
- **T-07 (ESPEC):** Regra de reconhecimento validada por análise de alcançabilidade
- **Teste bloqueante §14.1:** 3 leitores resumem história a partir de 20 resoluções

---

## 2. Estado Atual do Projeto

### 2.1 O Que Existe

| Artefato                 | Status                                  | Localização                                        |
| ------------------------ | --------------------------------------- | -------------------------------------------------- |
| **PRD v0.14**            | ✅ Fechado                              | `docs/prd/PRD-Forja-v0_14.md`                      |
| **ESPEC v2.6**           | ⚠️ 5 defeitos + 11 lacunas              | `docs/prd/ESPEC-Sistema-Narrativo-v2_6.md`         |
| **Protótipo Cap 1 v0.2** | ✅ 14 storylets (meta: 26)              | `docs/prd/PROTOTIPO-Campanha-A-Longa-Seca-v0_2.md` |
| **ADRs 0001-0010**       | ✅ Decisões arquiteturais               | `docs/adr/*.md`                                    |
| **C4 Diagrams**          | ✅ Contexto + Contêineres + Componentes | `docs/c4/*.md`                                     |
| **Database Schema**      | ✅ 12 migrações PostgreSQL              | `docs/database/migrations/*.sql`                   |
| **BDD Features**         | ✅ 14 features, 315 cenários            | `docs/testes/rastreabilidade/features/*.feature`   |
| **Plano de Testes**      | ✅ Estratégia de 6 camadas              | `docs/testes/PLANO-DE-TESTES-BDD.md`               |
| **CI/CD Workflows**      | ✅ YAMLs prontos                        | `docs/ci-cd/.github/workflows/*.yml`               |
| **Código de produção**   | ❌ Zero linhas                          | —                                                  |

### 2.2 O Que Falta

1. **Resolver Fase 0 (BLOQUEANTE):** 5 defeitos (DEF-01 a DEF-05) + 11 lacunas (LAC-01 a LAC-11)
2. **Escrever 12 storylets restantes** do capítulo 1 (~26 total)
3. **Implementar todo o sistema** (motor → domínio → API → apps)
4. **Executar testes bloqueantes** (§14 PRD)

---

## 3. Restrições Operacionais

### 3.1 Projeto Autofinanciado (D-028)

- **Consequência:** Sem obrigação perante investidores, mas também sem validação forçada por terceiros
- **Risco:** R-002 (escopo incompatível com dev solo)
- **Mitigação:**
  - Campanha compilada (D-031) reduz escopo drasticamente
  - Testes bloqueantes (§14) são portão de decisão GO/NO-GO
  - Cronograma não tem pressa — qualidade > velocidade

### 3.2 Desenvolvimento Solo com IA (sua resposta #7)

- **Modelo de trabalho:** 1 desenvolvedor + agentes de IA
- **Disponibilidade:** Sem pressa de conclusão
- **Implicação:** Planejamento precisa ser auto-explicativo
- **Documentação:** Cada fase tem prompts sugeridos para IA

### 3.3 Offline-First (D-008)

- **Justificativa:** Academia tem sinal ruim
- **Implicação técnica:**
  - SQLite local obrigatório
  - Sync eventual, não síncrono
  - Event sourcing (ADR-0002) como padrão de sincronização

### 3.4 Single-Player (D-001)

- **Consequência positiva:** Sem antifraude, moderação, massa crítica
- **Consequência negativa:** Compartilhamento é laço viral único (D-014, D-015)

### 3.5 Sem LLM em Runtime (D-002)

- **Justificativa:** Preserva offline, custo marginal zero, determinismo
- **IA pode ser usada:** Ferramenta de apoio à autoria (D-022), não em produção
- **Teste crítico:** RN-027 — nenhuma chamada a modelo durante uso do app

---

## 4. Decisões Arquiteturais Críticas

### 4.1 Monorepo com Pacote Compartilhado (ADR-0001)

**Estrutura:**

```
forja/
├── packages/
│   ├── motor-narrativo/   # Pure TS, NO deps UI/Node/platform
│   ├── dominio/            # Pure TS, regras de negócio
│   ├── schema/             # Zod schemas compartilhados
│   └── db-types/           # Types gerados do Supabase
├── apps/
│   ├── api/                # NestJS + Fastify
│   ├── mobile/             # Expo + React Native
│   └── web/                # Next.js + React Native Web
├── content/
│   └── a-longa-seca/       # JSON do catálogo
└── tooling/
    ├── verificador/        # Python evoluído
    └── simulador/          # TS: simula M resoluções
```

**Por que?**

- Motor narrativo compartilhado garante determinismo (RF-036)
- Mobile e web jogam campanha idêntica
- Simulador roda contra mesmo código de produção

**Consequência:** Turborepo para builds incrementais, disciplina de versionamento interno.

### 4.2 Event Sourcing para Diário (ADR-0002)

**Estado da ficha = projeção de `diary_events[]`**

**Vantagens:**

- Elimina conflito de sincronização (não há "merge" de estado)
- Auditoria grátis
- Replay recalcula ficha após mudança de regras
- Troca de dispositivo = replay do log

**Desvantagens:**

- Nunca escrever estado mutável diretamente (exige disciplina)
- Queries de "ficha atual" precisam de cache/view materializada

**Implicação na Fase 3:** Implementar projeção antes de qualquer UI.

### 4.3 Campanhas Compiladas (D-031)

**Decisão:** Cada campanha nova é um release do app.

**Antes (revertida):**

- Motor genérico
- Pacote remoto atualizável
- Servidor de catálogo

**Depois (atual):**

- Campanha codificada em JSON embutido no binário
- Sem servidor de jogo
- Escopo de engenharia reduzido em 40%

**Custo:** Nova campanha = novo release (semanas de review nas lojas).

**Mitigação:** Kill-switch (ADR-0004) permite desativar storylet quebrado sem release.

### 4.4 React Native Web (ADR-0008)

**Decisão:** Mobile e web compartilham componentes de UI.

**Tecnologias:**

- Mobile: Expo + React Native
- Web: Next.js + React Native Web

**Reaproveitamento:** ~90% de componentes, ~70% de navegação.

**Divergências permitidas:**

- Navegação (Expo Router vs Next Router)
- Autenticação (SecureStore vs cookie)
- Layout responsivo

### 4.5 Zod como Contrato Compartilhado (ADR-0009)

**Package `@forja/schema`:**

```typescript
export const DiaryEventSchema = z.object({...});
export const SyncResponseSchema = z.object({...});
export const EntitlementSchema = z.object({...});
```

**Usado por:**

- API (validação de entrada via NestJS pipe)
- Cliente (validação de saída antes de enviar)

**Benefício:** Mudança de schema quebra build dos dois lados imediatamente.

### 4.6 PostgreSQL com RLS (ADR-0006)

**Supabase gerenciado:**

- Row Level Security é barreira real (não a aplicação)
- Políticas explícitas por comando (SELECT/INSERT/UPDATE/DELETE)
- Sem política = bloqueado por padrão

**O que Postgres NÃO guarda:**

- Storylets, qualidades, entidades (vivem no app, D-036)
- Ficha (recalculada de eventos, ADR-0002)

**O que guarda:**

- `diary_events` (append-only)
- `campaign_instances` (snapshot é cache)
- `entitlements` (compras)
- `profiles`, `consent_events`, `deletion_requests` (LGPD)

---

## 5. Escopo do MVP

### 5.1 O Que Entra no MVP

Baseado em decisões travadas do PRD:

| Funcionalidade          | Requisitos               | Decisão                             |
| ----------------------- | ------------------------ | ----------------------------------- |
| **Core de jogo**        | RF-001 a RF-009          | ✅ Obrigatório                      |
| **Registro de sessão**  | RF-010 a RF-017          | ✅ < 20s, offline-first             |
| **Motor narrativo**     | RF-020 a RF-030A         | ✅ Função pura, determinístico      |
| **Simulador**           | RF-100 a RF-103          | ✅ D-032: única defesa              |
| **Marcos de Superação** | RF-040 a RF-049          | ✅ Cooldown, teto                   |
| **Compartilhamento**    | RF-060 a RF-070          | ✅ Artefato local, semente          |
| **Autenticação**        | Magic link Supabase      | ✅ Opcional (RF-090)                |
| **Sync multi-device**   | RF-015                   | ✅ Quando há conta + conexão        |
| **Kill-switch**         | RF-038, RF-039, ADR-0004 | ✅ CDN isolado                      |
| **i18n (arquitetura)**  | RF-120 a RF-126, D-040   | ✅ Estrutura, pt-BR preenchido      |
| **LGPD**                | RC-001 a RC-009          | ✅ Brasil apenas (D-039)            |
| **Direito de acesso**   | RF-110 a RF-113, D-029   | ✅ Estrutura pronta, sem assinatura |

### 5.2 O Que Fica Fora do MVP

| Funcionalidade            | Decisão | Quando                             |
| ------------------------- | ------- | ---------------------------------- |
| **Wearable**              | D-003   | v2                                 |
| **Assinatura recorrente** | D-026   | Estrutura pronta, não implementada |
| **Conteúdo traduzido**    | D-037   | Pós-validação                      |
| **Múltiplos mercados**    | D-039   | Pós-Brasil                         |
| **Segunda campanha**      | D-041   | Depende dos testes bloqueantes     |

Mais detalhes: [ESCOPO-MVP.md](ESCOPO-MVP.md)

---

## 6. Estratégia de Testes

### 6.1 Pirâmide Invertida (6 camadas)

Projeto tem camada extra porque narrativa = conteúdo testável:

| Camada          | Testa                                | Custo         | Frequência           |
| --------------- | ------------------------------------ | ------------- | -------------------- |
| **Motor**       | Invariantes M-01 a M-09              | milissegundos | todo commit          |
| **Domínio**     | Regras de negócio (ciclos, Marcos)   | milissegundos | todo commit          |
| **Catálogo**    | Propriedades de conteúdo T-01 a T-34 | segundos      | commit (M=50)        |
| **Integração**  | Network, DB, OS                      | segundos      | commit + pre-release |
| **Transversal** | Copy, ética, i18n                    | segundos      | todo commit          |
| **Manual**      | Leitura, reação ao card              | horas         | milestone            |

**Insight crítico:** Camada de motor é mais valiosa E mais barata. Se existir apenas uma, deve ser esta.

### 6.2 Testes Bloqueantes (§14 PRD)

Duas validações externas obrigatórias antes de escalar:

#### Teste de Leitura (§14.1)

1. Gerar 20 resoluções com protótipo cap 1
2. Extrair texto corrido (sem mecânica)
3. Entregar a 3 leitores frios
4. Pedir resumo da história

**Critério de parada (§11.2):**

- Se **nenhum dos 3** resumir: problema narrativo crítico → reescrever
- Se 2+ resumirem: prosseguir

#### Teste do Card (§14.2)

1. Gerar 5 variações de artefato compartilhável
2. Postar em r/Solo_Roleplaying (público anglófono)
3. Contar quantos perguntam "que app é esse?"

**Critério:** Se <1 em 5, canal de aquisição não existe → repensar posicionamento.

### 6.3 Suítes Automatizadas

- **Motor:** Testes unitários, catálogos sintéticos (M-01 a M-09)
- **Domínio:** Testes de propriedade (Vontade, Fôlego, Marcos)
- **Catálogo:** `verificar.py` + simulador (T-01 a T-34)
- **BDD:** 315 cenários Gherkin em pt-BR
- **Integração:** Supabase local, fake HTTP, clock injetado

---

## 7. Riscos Principais

### 7.1 Riscos Críticos (Alta probabilidade × Alto impacto)

| ID        | Risco                              | Mitigação                                                  | Status                    |
| --------- | ---------------------------------- | ---------------------------------------------------------- | ------------------------- |
| **R-001** | Narrativa percebida como aleatória | Regra de reconhecimento (§5 ESPEC), T-07, teste de leitura | Mitigado pela arquitetura |
| **R-002** | Escopo incompatível com dev solo   | D-031 (campanha compilada), testes bloqueantes             | Mitigado por decisão      |
| **R-026** | ~260 storylets é muito conteúdo    | D-041 (4 caps, não 6), simulador valida alcançabilidade    | Reduzido 22%              |

### 7.2 Riscos Técnicos

| ID         | Risco                                                     | Mitigação                        |
| ---------- | --------------------------------------------------------- | -------------------------------- |
| **DEF-01** | K=20 incompatível com 4 ciclos/cap                        | Fase 0: decidir K dinâmico       |
| **LAC-01** | Modelo de dados depende de decisão de múltiplas campanhas | Fase 0: resolver antes de código |
| **M-05**   | Determinismo cross-platform (Hermes vs V8)                | RNG próprio, teste automatizado  |

Detalhes: [RISCOS-E-MITIGACOES.md](RISCOS-E-MITIGACOES.md)

---

## 8. Abordagem de Implementação

### 8.1 Estratégia: Híbrido Paralelo

**Track 1: Core (motor + domínio + verificador)**

- Fundação sólida
- 100% testado desde linha 1
- Sem UI, mas funcional

**Track 2: UI Mockada (mobile/web com dados fake)**

- Demo visual cedo
- Valida fluxo de usuário
- Refatorado quando Track 1 pronto

**Semana 4: Integração**

- Trocar dados fake por motor real
- Validar end-to-end

**Vantagens:**

- ✅ Demo cedo
- ✅ Fundação testada
- ✅ Feedback rápido de UX

**Desvantagens:**

- ⚠️ Requer disciplina de interface
- ⚠️ Possível refactor na integração

### 8.2 Ordem de Fases

1. **Fase 0 (BLOQUEANTE):** Resolver defeitos/lacunas → ESPEC v2.7
2. **Fase 1:** Setup monorepo, database, schemas
3. **Fases 2-4 (Track 1):** Motor, domínio, verificador
4. **Fase 5:** API backend
5. **Fases 6-7 (Track 2):** Mobile + Web
6. **Fases 8-9:** BDD + CI/CD
7. **Fase 10:** Testes bloqueantes → DECISÃO GO/NO-GO

---

## 9. Critérios de Sucesso

### 9.1 MVP Tecnicamente Completo

- [ ] 315 cenários BDD passando
- [ ] Testes M-01 a M-09 (motor) passando
- [ ] Testes T-01 a T-34 (catálogo) passando
- [ ] Simulador gera 50 resoluções com 5 políticas
- [ ] App mobile funcional offline
- [ ] Sync multi-device funcional
- [ ] Deploy staging funcionando
- [ ] RN-029: Release não publicável sem suítes passando

### 9.2 MVP Validado Externamente

- [ ] **Teste de leitura:** 2+ de 3 leitores resumem história
- [ ] **Teste do card:** ≥1 em 5 pergunta "que app é esse?"

### 9.3 Decisão GO/NO-GO

Se ambos testes passarem:

- ✅ **GO:** Completar capítulo 1 (escrever 12 storylets restantes), preparar release

Se teste de leitura falhar:

- ❌ **NO-GO TEMPORÁRIO:** Reescrever protótipo, rodar teste novamente

Se teste do card falhar:

- ⚠️ **REPENSAR:** Artefato não gera curiosidade → canal de aquisição quebrado

---

## 10. Premissas de Trabalho

### 10.1 Com Agentes de IA

**Como usar:**

- Geração de boilerplate (schemas, tipos, migrations)
- Escrita de testes unitários
- Revisão de decisões técnicas

**Armadilhas a evitar:**

1. IA inventa requisitos → sempre referenciar PRD/ESPEC explicitamente
2. IA ignora restrições → listar D-001, D-033, D-036 no prompt
3. IA gera código genérico → pedir para seguir ADRs específicos

**Validação obrigatória:**

- Código gerado deve passar testes existentes
- Decisões devem ser registradas em DECISOES-IMPLEMENTACAO.md
- Conformidade com STACK-TECNICO.md

### 10.2 Sem Pressa

**Implicação positiva:**

- Qualidade > velocidade
- Tempo para refatorar
- Testes bloqueantes não são pressionados

**Implicação negativa:**

- Risco de scope creep (mitigado por D-031)
- Risco de never-finish (mitigado por marcos)

### 10.3 Desenvolvimento Solo

**Vantagens:**

- Sem overhead de comunicação
- Decisões rápidas
- Visão coerente

**Desvantagens:**

- Sem code review externo (mitigado por testes)
- Sem par programming (mitigado por IA)
- Risco de viés (mitigado por testes bloqueantes externos)

---

## 11. Próximos Passos Imediatos

### Passo 1: Ler Documentação de Planejamento

- [ ] Este documento (00-CONTEXTO-E-PREMISSAS.md)
- [ ] [CRONOGRAMA.md](CRONOGRAMA.md)
- [ ] [STACK-TECNICO.md](STACK-TECNICO.md)
- [ ] [ESCOPO-MVP.md](ESCOPO-MVP.md)

### Passo 2: Começar Fase 0

- [ ] Ler [01-FASE-0-RECONCILIACAO.md](01-FASE-0-RECONCILIACAO.md)
- [ ] Resolver LAC-01 (múltiplas campanhas)
- [ ] Resolver DEF-01 (K dinâmico)
- [ ] Resolver LAC-02 (Trégua retroativa)
- [ ] Registrar decisões em DECISOES-IMPLEMENTACAO.md
- [ ] Atualizar ESPEC → v2.7

### Passo 3: Validar Marcos

- [ ] M0 completo antes de avançar para Fase 1

---

**Documento vivo.** Atualizar conforme decisões de implementação.

**Última revisão:** 26/07/2026  
**Próxima revisão:** Após conclusão de Fase 0
