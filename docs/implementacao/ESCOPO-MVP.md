# Escopo do MVP — FORJA

**Versão:** 1.0  
**Data:** 26/07/2026  
**Fonte:** PRD v0.14 + decisões travadas (D-001 a D-045)

---

## 1. Definição de MVP

**MVP = Mínimo Produto Validável:**

- Funcional end-to-end (Juramento → Sessão → Resolução → Ficha)
- Campanha completa jogável (capítulo 1 com 26 storylets)
- Offline-first (D-008)
- Mobile (iOS + Android) + Web
- Qualidade garantida por suítes automatizadas
- **GATE:** Testes bloqueantes §14 PRD (leitura + card)

**MVP NÃO É:**

- Segunda campanha (depende de validação)
- Conteúdo traduzido (D-037 — arquitetura sim, conteúdo não)
- Múltiplos mercados (D-039 — Brasil apenas)
- Assinatura (D-026 — estrutura pronta, não implementada)

---

## 2. Requisitos Funcionais no MVP

### 2.1 Core de Jogo ✅

| RF          | Descrição                                                      | Prioridade  |
| ----------- | -------------------------------------------------------------- | ----------- |
| **RF-001**  | Criar personagem (nome, arquétipo, origem)                     | Alta        |
| **RF-002**  | Atributos derivados de histórico (não manual)                  | Alta        |
| **RF-003**  | Sem distribuição manual de pontos                              | Alta        |
| **RF-004**  | Declarar Juramento (1-6 dias)                                  | **Crítica** |
| **RF-005**  | Bloquear alteração de Juramento durante ciclo                  | Alta        |
| **RF-006**  | Declarar deload (1 a cada 4 ciclos)                            | Média       |
| **RF-007**  | Declarar Ciclo de Trégua (crédito, reserva)                    | Alta        |
| **RF-007A** | Declarar Trégua de Recuperação (sem custo, retroativa 14 dias) | Alta        |
| **RF-008**  | Encerrar ciclo automaticamente, apresentar Fechamento          | Alta        |
| **RF-009**  | Fechamento sem linguagem de julgamento                         | Alta        |

---

### 2.2 Registro de Sessão ✅

| RF         | Descrição                                              | Prioridade  |
| ---------- | ------------------------------------------------------ | ----------- |
| **RF-010** | Registrar sessão em <20s (tipo, duração, PSE opcional) | **Crítica** |
| **RF-011** | Notas livres no diário                                 | Baixa       |
| **RF-012** | Registro retroativo até 48h                            | Média       |
| **RF-013** | Máximo 2 sessões/dia                                   | Média       |
| **RF-014** | Funcionar 100% offline                                 | **Crítica** |
| **RF-015** | Sincronizar quando há conexão + conta                  | Alta        |
| **RF-016** | Não capturar exercícios individuais                    | Alta        |
| **RF-017** | Sem duração mínima de sessão (D-045)                   | Alta        |

---

### 2.3 Motor de Storylets ✅

| RF          | Descrição                                                     | Prioridade  |
| ----------- | ------------------------------------------------------------- | ----------- |
| **RF-020**  | Executar Rolagem de Resolução após sessão                     | **Crítica** |
| **RF-021**  | Selecionar storylet (algoritmo ESPEC §6.1)                    | **Crítica** |
| **RF-022**  | Aplicar efeitos antes de compor texto                         | **Crítica** |
| **RF-023**  | Estado persistente, reconhecimento explícito                  | **Crítica** |
| **RF-024**  | Apresentar 2-3 opções em pontos de escolha                    | Alta        |
| **RF-025**  | Sempre ter storylet elegível (fallback)                       | **Crítica** |
| **RF-026**  | Registrar resolução no diário                                 | Alta        |
| **RF-027**  | Exportar diário (JSON + Markdown)                             | Média       |
| **RF-028**  | Marcos de capítulo com ≥2 escolhas                            | Alta        |
| **RF-029**  | Disparar Marco (teto 4 ciclos)                                | Alta        |
| **RF-030A** | Fornecer `in.tregua`, `in.reencontro`, `in.sessao_secundaria` | Alta        |

---

### 2.4 Pipeline de Conteúdo ✅

| RF          | Descrição                                          | Prioridade  |
| ----------- | -------------------------------------------------- | ----------- |
| **RF-030**  | Compilar narrativa no app (D-031)                  | **Crítica** |
| **RF-031**  | Sem criação/edição/importação por usuário          | Alta        |
| **RF-032**  | Suportar múltiplas campanhas (estado independente) | Média       |
| **RF-033**  | Registrar versão do app em cada entrada            | Média       |
| **RF-034**  | Atualização não corrompe campanha                  | Alta        |
| **RF-035**  | Subsistema narrativo desacoplado (D-033)           | **Crítica** |
| **RF-036**  | Resolução = função pura                            | **Crítica** |
| **RF-037**  | Catálogo = JSON embutido (D-036)                   | **Crítica** |
| **RF-038**  | Buscar kill-switch na inicialização                | Alta        |
| **RF-039**  | Busca kill-switch sem identificador                | Alta        |
| **RF-039A** | Limitar busca 1x/24h + jitter 6h                   | Alta        |
| **RF-039B** | Ignorar desativação de Espinha                     | Alta        |

---

### 2.5 Simulador e Testes ✅

| RF         | Descrição                                                              | Prioridade  |
| ---------- | ---------------------------------------------------------------------- | ----------- |
| **RF-100** | Simulador de travessia (N resoluções, seed fixa)                       | **Crítica** |
| **RF-101** | 5 políticas (constante, errático, especialista, péssimo, intermitente) | **Crítica** |
| **RF-102** | Reportar vistos/escritos, nunca vistos, distribuição                   | **Crítica** |
| **RF-103** | Suítes de motor + catálogo em CI                                       | **Crítica** |

**Justificativa (D-032):** Sem publicação incremental, suítes são única defesa antes de produção.

---

### 2.6 Internacionalização (Arquitetura) ✅

| RF         | Descrição                                                    | Prioridade  |
| ---------- | ------------------------------------------------------------ | ----------- |
| **RF-120** | Estrutura i18n (pt-BR preenchido, `en`/`es` estrutura vazia) | Alta        |
| **RF-121** | Selecionar idioma (ajuste dispositivo + manual)              | Média       |
| **RF-122** | Estado de campanha agnóstico de idioma                       | Alta        |
| **RF-123** | Não embutir prosa no catálogo (D-038)                        | **Crítica** |
| **RF-124** | Declarar gênero por entidade                                 | Média       |
| **RF-125** | Formatação número/plural/data na apresentação                | Baixa       |
| **RF-126** | Nomes próprios invariantes entre idiomas                     | Média       |

**Conteúdo traduzido:** Fora do MVP (D-037). Só arquitetura entra.

---

### 2.7 Direito de Acesso ✅

| RF         | Descrição                                      | Prioridade |
| ---------- | ---------------------------------------------- | ---------- |
| **RF-110** | Modelar `{pacote, origem, validoAte?}` (D-029) | Alta       |
| **RF-111** | `origem` extensível sem migração               | Média      |
| **RF-112** | Avaliar direito localmente (offline)           | Alta       |
| **RF-113** | Sem cobrança recorrente no MVP (D-026)         | Alta       |

**Monetização:** Estrutura pronta, mas não implementada no MVP.

---

### 2.8 Superação (Marcos) ✅

| RF         | Descrição                                      | Prioridade |
| ---------- | ---------------------------------------------- | ---------- |
| **RF-040** | Declarar Marco vinculado a bloco               | Alta       |
| **RF-041** | Todos eixos com igual destaque                 | Alta       |
| **RF-042** | Limitar 2 Marcos/ciclo                         | Alta       |
| **RF-043** | Cooldown 2 ciclos por rótulo                   | Alta       |
| **RF-044** | Registrar (sem contabilizar) Marcos excedentes | Média      |
| **RF-045** | Rótulo livre com autocompletar do histórico    | Baixa      |
| **RF-046** | Não inferir Marcos automaticamente             | Alta       |
| **RF-047** | Identificar discrepância, oferecer Marco       | Média      |
| **RF-048** | Não contabilizar Marcos após 21 dias pausa     | Média      |
| **RF-049** | 3 Marcos → +1 atributo (teto 5)                | Alta       |

---

### 2.9 Modalidades ✅

| RF         | Descrição                                | Prioridade |
| ---------- | ---------------------------------------- | ---------- |
| **RF-050** | Suportar qualquer modalidade (D-013)     | Alta       |
| **RF-051** | Criar modalidade (atributo alvo + eixos) | Alta       |
| **RF-052** | Compor sessão com múltiplos blocos       | Média      |
| **RF-053** | Sessão composta = 1 dia Juramento        | Alta       |
| **RF-054** | Vincular Marco a bloco + atributo        | Alta       |
| **RF-055** | Trocar modalidade sem perder progresso   | Alta       |
| **RF-056** | Adaptar campos à modalidade              | Baixa      |
| **RF-057** | Editar modalidade retroativamente        | Baixa      |

---

### 2.10 Compartilhamento ✅

| RF         | Descrição                                 | Prioridade |
| ---------- | ----------------------------------------- | ---------- |
| **RF-060** | Gerar artefato para eventos §4.11         | Alta       |
| **RF-061** | Gerar no dispositivo (D-016)              | Alta       |
| **RF-062** | Pré-visualização integral                 | Alta       |
| **RF-063** | Ligar/desligar camadas individualmente    | Média      |
| **RF-064** | Camadas opcionais desligadas por padrão   | Alta       |
| **RF-065** | Folha de compartilhamento nativa do SO    | Alta       |
| **RF-066** | Sem permissões sociais                    | Alta       |
| **RF-067** | Embutir semente de campanha (D-020)       | Alta       |
| **RF-068** | Salvar localmente sem compartilhar        | Média      |
| **RF-069** | Não condicionar progressão a compartilhar | Alta       |
| **RF-070** | Limitar 1 sugestão/evento                 | Baixa      |

---

### 2.11 Fôlego e Descanso ✅

| RF         | Descrição                                 | Prioridade |
| ---------- | ----------------------------------------- | ---------- |
| **RF-080** | 1 Fôlego/dia descanso em ciclo cumprido   | Alta       |
| **RF-081** | Marco de capítulo exige 2 Fôlego          | Alta       |
| **RF-082** | Dobrar teto em deload                     | Alta       |
| **RF-083** | Não beneficiar treino acima do Juramento  | Alta       |
| **RF-084** | Teto 2/ciclo, máximo 4 acumulados (D-044) | Alta       |

---

### 2.12 Dados e Privacidade (LGPD) ✅

| RF         | Descrição                                               | Prioridade  |
| ---------- | ------------------------------------------------------- | ----------- |
| **RF-090** | Uso completo sem conta                                  | Alta        |
| **RF-091** | Exportação integral de dados                            | **Crítica** |
| **RF-092** | Exclusão de conta em até 15 dias                        | **Crítica** |
| **RF-093** | Consentimento específico + destacado para dado de saúde | **Crítica** |

---

## 3. Regras de Negócio no MVP

Todas as RN-001 a RN-039 entram no MVP. Destaques:

| RN         | Regra                                                        | Impacto           |
| ---------- | ------------------------------------------------------------ | ----------------- |
| **RN-001** | Progressão = `dias_treinados / dias_jurados`                 | Core              |
| **RN-005** | Vontade modifica rolagem; outros atributos = pré-requisito   | Core              |
| **RN-027** | Sem LLM em runtime (D-002)                                   | Teste obrigatório |
| **RN-029** | Release sem suítes passando não é publicável                 | Gate crítico      |
| **RN-031** | Trégua/Recuperação: apenas banda Cor, reencontro obrigatório | Core              |

---

## 4. Ética de Design no MVP

Todas as RE-001 a RE-011 entram no MVP. Destaques:

| RE         | Regra                                                    | Validação         |
| ---------- | -------------------------------------------------------- | ----------------- |
| **RE-001** | Sem loot box, moeda premium                              | Code review       |
| **RE-002** | Sem notificação noturna/culpa                            | Config push       |
| **RE-005** | Aviso profissional de educação física                    | Onboarding        |
| **RE-006** | Relatar padrão sem instruir (limiar 40%, max 1/4 ciclos) | Lógica de domínio |
| **RE-009** | Sem imperativo/futuro em redação de exercício            | Revisão de copy   |
| **RE-010** | Revisão de conteúdo sensível                             | Checklist release |

---

## 5. Conformidade (LGPD) no MVP

Todas as RC-001 a RC-009 entram no MVP:

| RC         | Regra                                                  | Entregável          |
| ---------- | ------------------------------------------------------ | ------------------- |
| **RC-001** | Consentimento específico + destacado (art. 11, I LGPD) | Tela onboarding     |
| **RC-002** | Não coletar motivo de Trégua de Recuperação            | Schema validation   |
| **RC-003** | Sem compartilhamento com terceiros                     | Sem SDKs            |
| **RC-004** | Dados no dispositivo por padrão                        | Offline-first       |
| **RC-005** | RLS no Postgres                                        | Migrations          |
| **RC-006** | Criptografia de campo (notas livres)                   | Client-side         |
| **RC-007** | Exclusão em 15 dias (art. 18, VI LGPD)                 | `deletion_requests` |
| **RC-008** | Portabilidade (art. 18, V LGPD)                        | RF-091              |
| **RC-009** | Kill-switch sem log de usuário (ADR-0004)              | CDN isolado         |

---

## 6. Fora do MVP (Pós-v1.0)

### 6.1 Adiados por Decisão Explícita

| Feature                   | Decisão | Quando                    |
| ------------------------- | ------- | ------------------------- |
| **Wearable**              | D-003   | v2 (após validação)       |
| **Assinatura recorrente** | D-026   | Quando houver demanda     |
| **Conteúdo traduzido**    | D-037   | Após validação pt-BR      |
| **Múltiplos mercados**    | D-039   | Após validação Brasil     |
| **Segunda campanha**      | D-041   | Depende de M10 (GO/NO-GO) |

### 6.2 Reduzidos de Escopo

| Feature                 | Original         | MVP                 | Pós-MVP             |
| ----------------------- | ---------------- | ------------------- | ------------------- |
| **Idiomas**             | 3 (pt, en, es)   | Apenas pt-BR        | en, es em v1.1+     |
| **Campanhas gratuitas** | 6 capítulos      | 4 capítulos (D-041) | Expandir se validar |
| **E2E tests**           | Detox/Playwright | Manual              | Automatizar v1.1    |

### 6.3 Não Implementados (Complexidade vs Valor)

- Push notifications avançadas (local é suficiente)
- Social features (feed, amigos, chat)
- Leaderboards, rankings
- Conquistas (achievements)
- Personalização de avatar
- Modo escuro (pode entrar se trivial)

---

## 7. Matriz de Priorização

### 7.1 Críticos (Bloqueantes)

Sem estes, MVP não funciona:

- RF-004, RF-010, RF-014, RF-020, RF-021, RF-022, RF-023, RF-025
- RF-030, RF-035, RF-036, RF-037
- RF-100, RF-101, RF-102, RF-103
- RN-029 (suítes passando)
- M10 (testes bloqueantes)

### 7.2 Altos (Qualidade)

Comprometem experiência, mas não impedem uso:

- RF-015 (sync), RF-091 (exportação), RF-092 (exclusão)
- Todas RE (ética), todas RC (LGPD)
- Testes M-01 a M-09, T-01 a T-34

### 7.3 Médios (Enhancement)

Melhoram produto, mas podem ser simplificados:

- RF-011 (notas livres), RF-027 (export Markdown)
- RF-047 (sugestão de Marco por discrepância)
- Compartilhamento completo (pode ser versão básica)

### 7.4 Baixos (Nice to Have)

Podem ser adiados sem impacto:

- RF-045 (autocompletar), RF-056 (adaptar campos)
- Modo escuro, animações, onboarding elaborado

---

## 8. Critérios de Conclusão do MVP

### 8.1 Técnicos

- [ ] 315 cenários BDD passando (100%)
- [ ] Testes M-01 a M-09 passando (100%)
- [ ] Testes T-01 a T-34 passando (100%)
- [ ] Simulador: 5 políticas × M=50 sem falhas
- [ ] App mobile funcional offline
- [ ] Sync multi-device funcional
- [ ] Deploy staging (API + Web + Mobile TestFlight/Internal Testing)
- [ ] RN-029 satisfeito (suítes em CI, release bloqueado se falhar)

### 8.2 Conteúdo

- [ ] Capítulo 1 completo (26 storylets, 4 capítulos adiados)
- [ ] Protótipo passa por `verificar.py` (T-01 a T-21)
- [ ] Simulador: razão vistos/escritos entre 0.15-0.3
- [ ] Toda complicação tem ≥2 closures (T-21)

### 8.3 Validação Externa (M10)

- [ ] **Teste de leitura (§14.1):** 2+ de 3 leitores resumem história
- [ ] **Teste do card (§14.2):** ≥1 em 5 pergunta "que app é esse?"

### 8.4 Conformidade

- [ ] Parecer jurídico LGPD (RC-001 a RC-009)
- [ ] Revisão prof. educação física (RE-005, RE-006, RF-048)
- [ ] Política de privacidade publicada
- [ ] Termos de uso publicados

---

## 9. Decisão GO/NO-GO

Após M10 (semana 16):

### Cenário GO ✅

Ambos testes passam → **Completar capítulo 1**, preparar release v1.0.

### Cenário REESCREVER ⚠️

Leitura falha → **Retrabalhar narrativa** (manter motor), rodar teste novamente.

### Cenário REPENSAR ❌

Card falha → **Canal de aquisição quebrado**. Opções:

- Lançar sem investir em viral
- Pivotar posicionamento
- Encerrar

---

## 10. Escopo vs Cronograma

**MVP técnico:** 16 semanas (Fases 0-9)  
**MVP validado:** +3 semanas (Fase 10)  
**Total:** ~4 meses

**Se atrasar:** Priorizar caminho crítico (F0 → F1 → F2 → F3 → F6 → F10). Adiar:

- Fase 7 (Web) → pode ser v1.1
- Fase 5 parcial (sync) → MVP funciona offline-only
- Features não-críticas (compartilhamento completo, notas livres)

**Não negociável:**

- Fase 0 (reconciliação)
- Fase 2 (motor) com testes M-XX
- Fase 4 (verificador) com testes T-XX
- Fase 10 (testes bloqueantes)

---

**Última atualização:** 26/07/2026  
**Próxima revisão:** Após M10 (decisão GO/NO-GO)
