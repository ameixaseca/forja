# Cronograma — FORJA MVP

**Versão:** 1.0  
**Data:** 26/07/2026  
**Modelo:** Híbrido paralelo (core + UI mockada → integração)

---

## 1. Visão Geral

```mermaid
gantt
    title Cronograma FORJA MVP (16 semanas implementação + 3 validação)
    dateFormat YYYY-MM-DD

    section Reconciliação
    Fase 0: Decisões bloqueantes           :crit, f0, 2026-08-01, 3d

    section Fundações
    Fase 1: Setup monorepo + DB             :f1, after f0, 7d

    section Core (Track 1)
    Fase 2: Motor narrativo                 :crit, f2, after f1, 10d
    Fase 3: Domínio (event sourcing)        :f3, after f2, 5d
    Fase 4: Verificação (simulador)         :f4, after f2, 5d

    section Backend
    Fase 5: API + sync                      :f5, after f3, 7d

    section Frontend (Track 2)
    Fase 6: Mobile MVP                      :crit, f6, after f3, 12d
    Fase 7: Web app                         :f7, after f6, 5d

    section Qualidade
    Fase 8: Suíte BDD                       :f8, after f3, 7d
    Fase 9: CI/CD + infra                   :f9, after f8, 5d

    section Validação Externa
    Fase 10: Testes bloqueantes             :milestone, crit, f10, after f6, 14d
    Decisão GO/NO-GO                        :milestone, crit, decisao, after f10, 1d
```

---

## 2. Fases Detalhadas

### Fase 0: Reconciliação ⛔ BLOQUEANTE

| **Atributo**     | **Valor**                        |
| ---------------- | -------------------------------- |
| **Duração**      | 2-3 dias                         |
| **Esforço**      | 8-16 horas                       |
| **Complexidade** | Média                            |
| **Risco**        | Alto (bloqueia tudo)             |
| **Dependências** | Nenhuma                          |
| **Entrega**      | ESPEC v2.7, decisões registradas |

**Objetivo:** Resolver 5 defeitos (DEF-01 a DEF-05) e 11 lacunas (LAC-01 a LAC-11) da ESPEC v2.6.

**Critérios de aceite:**

- [ ] LAC-01 resolvida: decisão sobre múltiplas campanhas simultâneas
- [ ] DEF-01 resolvida: K dinâmico definido e documentado
- [ ] LAC-02 resolvida: Trégua de Recuperação retroativa especificada
- [ ] Todas decisões registradas em `docs/prd/decisoes.md`
- [ ] ESPEC v2.7 publicada
- [ ] Modelo de dados final definido

**Bloqueio:** Nenhum código até M0 completo.

---

### Fase 1: Fundações

| **Atributo**     | **Valor**                      |
| ---------------- | ------------------------------ |
| **Duração**      | 1.5 semanas (7 dias úteis)     |
| **Esforço**      | 20-30 horas                    |
| **Complexidade** | Baixa                          |
| **Risco**        | Baixo                          |
| **Dependências** | Fase 0 completa                |
| **Entrega**      | Monorepo buildando, DB rodando |

**Objetivo:** Setup de monorepo (pnpm + Turborepo), database (Supabase local), schemas compartilhados (Zod).

**Critérios de aceite:**

- [ ] `pnpm dev`, `pnpm build`, `pnpm test` funcionando
- [ ] Supabase local + 12 migrações aplicadas
- [ ] Package `@forja/schema` com tipos TypeScript
- [ ] CI básico (lint + typecheck) rodando

**Estimativa detalhada:**

- Setup monorepo: 4-6h
- Database + seed: 2-3h
- Package `schema`: 3-4h
- CI básico: 2-3h
- Documentação: 2h

---

### Fase 2: Motor Narrativo

| **Atributo**     | **Valor**                               |
| ---------------- | --------------------------------------- |
| **Duração**      | 2 semanas (10 dias úteis)               |
| **Esforço**      | 40-50 horas                             |
| **Complexidade** | Alta                                    |
| **Risco**        | Alto (core do sistema)                  |
| **Dependências** | Fase 1 completa                         |
| **Entrega**      | Seletor de storylet, testes M-01 a M-09 |

**Objetivo:** Implementar motor narrativo puro (sem UI, sem DB) com testes de invariantes.

**Critérios de aceite:**

- [ ] Modelo de estado (qualidades com namespaces)
- [ ] Avaliador de predicados (árvore `todos`/`qualquer`/`nenhum`)
- [ ] RNG determinístico cross-platform (Hermes vs V8)
- [ ] Seletor de storylet (supressão, filtragem, estratificação, sorteio)
- [ ] Testes M-01 a M-09 passando (100%)
- [ ] 3 catálogos sintéticos para testes

**Estimativa detalhada:**

- Modelo de estado: 6-8h
- Avaliador de predicados: 4-5h
- RNG determinístico: 3-4h
- Seletor de storylet: 12-16h
- Testes M-01 a M-09: 10-12h
- Documentação: 3h

**Caminho crítico:** Esta fase é bloqueante para Fases 3, 4, 6, 7, 8.

---

### Fase 3: Regras de Domínio

| **Atributo**     | **Valor**                         |
| ---------------- | --------------------------------- |
| **Duração**      | 1 semana (5 dias úteis)           |
| **Esforço**      | 20-25 horas                       |
| **Complexidade** | Média-Alta                        |
| **Risco**        | Médio                             |
| **Dependências** | Fase 2 completa                   |
| **Entrega**      | Event sourcing, projeção de ficha |

**Objetivo:** Implementar event sourcing para diário, cálculo de ficha, Vontade, Fôlego, Marcos.

**Critérios de aceite:**

- [ ] `calcularFicha(eventos[])` → ficha completa
- [ ] Vontade: +1 aos 2 ciclos, +2 aos 6, +3 aos 14
- [ ] Fôlego: teto 2/ciclo, máx 4 acumulado
- [ ] Marcos: 3 → +1 atributo, cooldown 2 ciclos
- [ ] Features BDD 01-05 passando

**Estimativa detalhada:**

- Event sourcing básico: 6-8h
- Cálculo de Vontade: 2-3h
- Cálculo de Fôlego: 3-4h
- Sistema de Marcos: 4-5h
- Features BDD 01-05: 5-6h

---

### Fase 4: Verificação

| **Atributo**     | **Valor**                          |
| ---------------- | ---------------------------------- |
| **Duração**      | 1 semana (5 dias úteis)            |
| **Esforço**      | 18-24 horas                        |
| **Complexidade** | Média                              |
| **Risco**        | Baixo                              |
| **Dependências** | Fase 2 completa (paralela com F3)  |
| **Entrega**      | `verificar.py` evoluído, simulador |

**Objetivo:** Portar/evoluir scripts Python de verificação, implementar simulador em TS.

**Critérios de aceite:**

- [ ] `verificar.py` roda em CI
- [ ] Testes T-01 a T-21 (estáticos) passando
- [ ] Simulador: 5 políticas × M=50 resoluções
- [ ] Relatório: vistos/escritos, nunca vistos, distribuição
- [ ] Fixtures negativas (13 catálogos quebrados)

**Estimativa detalhada:**

- Evolução `verificar.py`: 8-10h
- Simulador TS: 12-16h
- Fixtures negativas: 3-4h

**Paralelização:** Pode rodar em paralelo com Fase 3.

---

### Fase 5: API Backend

| **Atributo**     | **Valor**                     |
| ---------------- | ----------------------------- |
| **Duração**      | 1.5 semanas (7 dias úteis)    |
| **Esforço**      | 28-36 horas                   |
| **Complexidade** | Média                         |
| **Risco**        | Médio                         |
| **Dependências** | Fase 1 (DB), Fase 3 (schemas) |
| **Entrega**      | NestJS API com sync funcional |

**Objetivo:** API com autenticação, sync de eventos, entitlements, LGPD.

**Critérios de aceite:**

- [ ] Módulos: auth, sync, entitlements, lgpd, consent
- [ ] Endpoint `/sync` funcional (push/pull eventos)
- [ ] RLS validado (user só vê próprio dado)
- [ ] Zod validation via pipe
- [ ] Deploy em Fly.io staging
- [ ] Testes de integração com Supabase local

**Estimativa detalhada:**

- Setup NestJS: 6-8h
- Módulo sync: 8-10h
- Módulo entitlements: 4-6h
- Módulo LGPD: 3-4h
- Testes integração: 4-6h
- Deploy staging: 3-4h

---

### Fase 6: Mobile MVP

| **Atributo**     | **Valor**                                      |
| ---------------- | ---------------------------------------------- |
| **Duração**      | 2.5 semanas (12 dias úteis)                    |
| **Esforço**      | 50-60 horas                                    |
| **Complexidade** | Alta                                           |
| **Risco**        | Alto (deliverable principal)                   |
| **Dependências** | Fase 2 (motor), Fase 3 (domínio), Fase 5 (API) |
| **Entrega**      | App Expo funcional offline + sync              |

**Objetivo:** App mobile completo com fluxo Juramento → Sessão → Resolução → Ficha.

**Critérios de aceite:**

- [ ] Roda em simulador iOS + Android
- [ ] 7 telas principais implementadas
- [ ] Funciona 100% offline
- [ ] Sync multi-device
- [ ] SQLite local com eventos
- [ ] Integração motor ↔ UI
- [ ] Navegação (Expo Router)
- [ ] Tema + componentes básicos

**Estimativa detalhada:**

- Setup Expo: 4-6h
- Telas MVP (7): 20-24h
- SQLite + sync: 8-10h
- Integração motor: 8-10h
- Navegação + tema: 6-8h
- Testes E2E básicos: 4-6h

**Caminho crítico:** Esta fase é bloqueante para Fase 10 (testes bloqueantes).

---

### Fase 7: Web App

| **Atributo**     | **Valor**                       |
| ---------------- | ------------------------------- |
| **Duração**      | 1 semana (5 dias úteis)         |
| **Esforço**      | 20-28 horas                     |
| **Complexidade** | Média (90% reaproveitado)       |
| **Risco**        | Baixo                           |
| **Dependências** | Fase 6 completa                 |
| **Entrega**      | Next.js app com paridade mobile |

**Objetivo:** Web app com React Native Web, mesma jogabilidade.

**Critérios de aceite:**

- [ ] Setup Next.js + RN Web
- [ ] 90% componentes reaproveitados
- [ ] Navegação adaptada (Next router)
- [ ] Autenticação (cookie vs SecureStore)
- [ ] Responsivo (desktop = 2 colunas)
- [ ] Deploy Vercel staging

**Estimativa detalhada:**

- Setup Next.js + RN Web: 6-8h
- Adaptação navegação: 4-6h
- Adaptação autenticação: 3-4h
- Layout responsivo: 4-6h
- Deploy staging: 3-4h

---

### Fase 8: Suíte BDD

| **Atributo**     | **Valor**                     |
| ---------------- | ----------------------------- |
| **Duração**      | 1.5 semanas (7 dias úteis)    |
| **Esforço**      | 30-40 horas                   |
| **Complexidade** | Média-Alta                    |
| **Risco**        | Médio                         |
| **Dependências** | Fase 3 (domínio)              |
| **Entrega**      | 315 cenários Gherkin passando |

**Objetivo:** Executor Gherkin (Cucumber.js ou Vitest), implementar 14 features.

**Critérios de aceite:**

- [ ] Infraestrutura Gherkin rodando
- [ ] 14 features implementadas
- [ ] 315 cenários passando
- [ ] Coverage 100% requisitos RF/RN/RE/RC

**Estimativa detalhada:**

- Setup Gherkin: 8-10h
- Implementar steps (14 features): 16-20h
- Fixtures e helpers: 4-6h
- Debugar falhas: 4-6h

**Paralelização:** Pode começar após Fase 3, em paralelo com Fase 5/6.

---

### Fase 9: CI/CD + Infra

| **Atributo**     | **Valor**                            |
| ---------------- | ------------------------------------ |
| **Duração**      | 1 semana (5 dias úteis)              |
| **Esforço**      | 16-24 horas                          |
| **Complexidade** | Baixa-Média                          |
| **Risco**        | Baixo                                |
| **Dependências** | Fase 8 (suítes completas)            |
| **Entrega**      | Pipeline completo staging + produção |

**Objetivo:** GitHub Actions com workflows completos, deploy automatizado.

**Critérios de aceite:**

- [ ] `ci.yml`: lint + typecheck + test
- [ ] `conteudo.yml`: verificar.py + simulador
- [ ] `banco-de-dados.yml`: dry-run + deploy
- [ ] `deploy-web.yml`, `deploy-api.yml`
- [ ] `mobile-release.yml` (manual)
- [ ] `kill-switch-export.yml` (manual)
- [ ] Ambientes GitHub configurados
- [ ] Secrets configurados

**Estimativa detalhada:**

- Workflows (6): 8-12h
- Configuração ambientes: 4-6h
- Testes de pipeline: 4-6h

---

### Fase 10: Testes Bloqueantes

| **Atributo**     | **Valor**                        |
| ---------------- | -------------------------------- |
| **Duração**      | 2-3 semanas                      |
| **Esforço**      | 12h setup + aguardar feedback    |
| **Complexidade** | Baixa (execução), Alta (decisão) |
| **Risco**        | Alto (GO/NO-GO)                  |
| **Dependências** | Fase 6 (mobile funcional)        |
| **Entrega**      | Decisão de produto               |

**Objetivo:** Executar testes de validação externa (§14 PRD).

**Critérios de aceite:**

#### Teste de Leitura (§14.1)

- [ ] Gerar 20 resoluções com protótipo cap 1
- [ ] Extrair texto corrido
- [ ] Recrutar 3 leitores frios
- [ ] Coletar resumos
- [ ] Avaliar: 2+ de 3 resumem corretamente?

#### Teste do Card (§14.2)

- [ ] Gerar 5 variações de artefato
- [ ] Postar em r/Solo_Roleplaying
- [ ] Monitorar por 7 dias
- [ ] Contar: ≥1 em 5 pergunta "que app é esse?"

**Decisão GO/NO-GO:**

- ✅ **GO:** Ambos passam → completar cap 1, preparar release
- ⚠️ **REESCREVER:** Leitura falha → retrabalhar narrativa
- ❌ **REPENSAR:** Card falha → canal de aquisição quebrado

---

## 3. Tabela Consolidada

| Fase   | Nome               | Duração | Esforço      | Complexidade | Risco | Dependências     |
| ------ | ------------------ | ------- | ------------ | ------------ | ----- | ---------------- |
| **0**  | Reconciliação      | 3 dias  | 8-16h        | Média        | Alto  | —                |
| **1**  | Fundações          | 1.5 sem | 20-30h       | Baixa        | Baixo | F0               |
| **2**  | Motor Narrativo    | 2 sem   | 40-50h       | Alta         | Alto  | F1               |
| **3**  | Domínio            | 1 sem   | 20-25h       | Média-Alta   | Médio | F2               |
| **4**  | Verificação        | 1 sem   | 18-24h       | Média        | Baixo | F2 (paralela F3) |
| **5**  | API                | 1.5 sem | 28-36h       | Média        | Médio | F1, F3           |
| **6**  | Mobile             | 2.5 sem | 50-60h       | Alta         | Alto  | F2, F3, F5       |
| **7**  | Web                | 1 sem   | 20-28h       | Média        | Baixo | F6               |
| **8**  | BDD                | 1.5 sem | 30-40h       | Média-Alta   | Médio | F3               |
| **9**  | CI/CD              | 1 sem   | 16-24h       | Baixa-Média  | Baixo | F8               |
| **10** | Testes Bloqueantes | 2-3 sem | 12h + espera | Baixa/Alta   | Alto  | F6               |

**Total:** ~16 semanas de implementação + 3 semanas de validação externa = **~4 meses**.

---

## 4. Caminho Crítico

Sequência de fases que não pode atrasar sem impactar prazo final:

```
F0 → F1 → F2 → F3 → F6 → F10
```

**Fases no caminho crítico:**

- Fase 0: Reconciliação (bloqueante)
- Fase 1: Fundações (fundação técnica)
- Fase 2: Motor Narrativo (core do sistema)
- Fase 3: Domínio (lógica de negócio)
- Fase 6: Mobile MVP (deliverable principal)
- Fase 10: Testes Bloqueantes (decisão GO/NO-GO)

**Fases paralelizáveis:**

- Fase 4 (Verificação) pode rodar com Fase 3
- Fase 5 (API) pode rodar com Fase 6 (mobile offline-first)
- Fase 8 (BDD) pode começar após Fase 3

---

## 5. Marcos e Gates

### M0: Reconciliação Completa ⛔

**Data estimada:** Dia 3  
**Gate:** Nenhum código até completar

**Critérios:**

- [ ] 16 decisões documentadas (5 DEF + 11 LAC)
- [ ] ESPEC v2.7 publicada
- [ ] Modelo de dados final

---

### M1: Fundações Operacionais

**Data estimada:** Semana 2  
**Gate:** Pode iniciar implementação de lógica

**Critérios:**

- [ ] `pnpm dev` funciona
- [ ] Supabase rodando
- [ ] Schemas Zod publicados

---

### M2: Motor Validado

**Data estimada:** Semana 4  
**Gate:** Pode integrar com UI

**Critérios:**

- [ ] Testes M-01 a M-09: 100%
- [ ] Determinismo validado cross-platform
- [ ] 3 catálogos sintéticos funcionando

---

### M3: Domínio Funcional

**Data estimada:** Semana 5  
**Gate:** Pode implementar UI real

**Critérios:**

- [ ] Event sourcing funcional
- [ ] Features BDD 01-05: 100%
- [ ] Projeção de ficha validada

---

### M4: Verificação Automatizada

**Data estimada:** Semana 5 (paralela M3)  
**Gate:** Pode validar conteúdo em CI

**Critérios:**

- [ ] Simulador: 5 políticas × M=50
- [ ] Testes T-01 a T-21: 100%
- [ ] Fixtures negativas: 13/13

---

### M5: API em Staging

**Data estimada:** Semana 7  
**Gate:** Pode habilitar sync em apps

**Critérios:**

- [ ] `/sync` funcional
- [ ] RLS validado
- [ ] Deploy Fly.io staging

---

### M6: App Móvel Funcional ⭐

**Data estimada:** Semana 10  
**Gate:** Pode executar testes bloqueantes

**Critérios:**

- [ ] Fluxo completo funcional
- [ ] Funciona 100% offline
- [ ] Sync multi-device

---

### M7: Paridade Web

**Data estimada:** Semana 11  
**Gate:** Produto multi-plataforma

**Critérios:**

- [ ] Web app funcional
- [ ] 90% componentes compartilhados
- [ ] Deploy Vercel staging

---

### M8: Cobertura BDD Completa

**Data estimada:** Semana 12  
**Gate:** Qualidade garantida

**Critérios:**

- [ ] 315 cenários: 100%
- [ ] 100% requisitos cobertos

---

### M9: Pipeline Produção

**Data estimada:** Semana 13  
**Gate:** Pronto para release

**Critérios:**

- [ ] CI/CD completo
- [ ] Staging auto-deploy
- [ ] Produção com gate manual

---

### M10: Validação Externa ⛔ DECISÃO GO/NO-GO

**Data estimada:** Semana 16  
**Gate:** Decisão de produto

**Critérios:**

- [ ] Teste leitura: 2+ de 3 resumem
- [ ] Teste card: ≥1 em 5 pergunta

**Resultado:**

- ✅ GO → completar cap 1, release
- ⚠️ REESCREVER → iterar narrativa
- ❌ REPENSAR → pivotar posicionamento

---

## 6. Pontos de Decisão

### Decisão 1: Após Fase 0

**Pergunta:** Decisões de reconciliação alteraram arquitetura?

**Se sim:**

- Revisar ADRs afetados
- Atualizar C4 diagrams
- Recalibrar estimativas Fases 2-3

**Se não:**

- Prosseguir conforme planejado

---

### Decisão 2: Após M3 (Domínio Funcional)

**Pergunta:** Event sourcing está performando adequadamente?

**Se não:**

- Adicionar cache de projeção (view materializada)
- Reavaliar estratégia de sync

**Se sim:**

- Prosseguir para Fase 6

---

### Decisão 3: Durante Fase 6 (Mobile MVP)

**Pergunta:** Simulador iOS/Android está disponível?

**Se não:**

- Usar dispositivo físico
- Ou adiar testes para dispositivo real

**Se sim:**

- Desenvolver normalmente

---

### Decisão 4: Após M10 (Testes Bloqueantes)

**Pergunta:** Ambos testes passaram?

#### Cenário A: Ambos passam ✅

- **Ação:** Completar cap 1 (escrever 12 storylets)
- **Próximo:** Preparar release v1.0

#### Cenário B: Leitura falha, card passa ⚠️

- **Problema:** Narrativa não forma história coerente
- **Ação:** Reescrever protótipo (manter estrutura de motor)
- **Custo:** 2-3 semanas
- **Retest:** Rodar teste de leitura novamente

#### Cenário C: Leitura passa, card falha ❌

- **Problema:** Artefato não gera curiosidade
- **Ação:** Repensar posicionamento/marketing
- **Alternativa:** Lançar sem investir em marketing viral

#### Cenário D: Ambos falham ❌❌

- **Problema:** Produto não valida
- **Ação:** Pivotar ou encerrar

---

## 7. Riscos de Cronograma

### Risco 1: Fase 0 se estende

**Probabilidade:** Média  
**Impacto:** Alto (bloqueia tudo)  
**Mitigação:**

- Timebox: máximo 5 dias
- Se não resolver tudo, priorizar LAC-01 e DEF-01
- Deixar lacunas menores para depois

---

### Risco 2: Motor mais complexo que estimado (F2)

**Probabilidade:** Média  
**Impacto:** Alto (caminho crítico)  
**Mitigação:**

- Começar com catálogos sintéticos minimalistas
- Iterar complexidade gradualmente
- Paralelizar Fase 4 (verificação) para validar cedo

---

### Risco 3: Sync multi-device problemático (F5/F6)

**Probabilidade:** Média  
**Impacto:** Médio  
**Mitigação:**

- MVP funciona offline-only
- Sync é enhancement, não bloqueante
- Adiar para v1.1 se necessário

---

### Risco 4: Testes bloqueantes não recrutam leitores

**Probabilidade:** Baixa  
**Impacto:** Alto  
**Mitigação:**

- Começar recrutamento 2 semanas antes de M6
- Ter plano B: pagar por leitores (Upwork, Fiverr)

---

### Risco 5: Scope creep (sem pressa = tentação de adicionar)

**Probabilidade:** Alta  
**Impacto:** Médio-Alto  
**Mitigação:**

- D-031 (campanha compilada) limita escopo naturalmente
- Manter lista de "v1.1" para ideias fora de escopo
- Revisar marcos semanalmente

---

## 8. Checkpoints Semanais

| Semana | Fase    | Checkpoint             | Ação se atrasado              |
| ------ | ------- | ---------------------- | ----------------------------- |
| 1      | F0 + F1 | M0 + M1 completos      | Timebox Fase 0                |
| 2-3    | F2      | Motor 50% implementado | Reduzir testes, iterar depois |
| 4      | F2      | M2 completo            | Não avançar até M2            |
| 5      | F3 + F4 | M3 + M4 completos      | Paralelizar se possível       |
| 6-7    | F5      | API funcional          | Sync é enhancement            |
| 8-10   | F6      | Mobile 75%             | Priorizar fluxo core          |
| 10     | F6      | M6 completo            | Gate antes de F10             |
| 11     | F7      | Web funcional          | Pode adiar para v1.1          |
| 12     | F8      | BDD 50%                | Priorizar features críticas   |
| 13     | F9      | CI/CD básico           | Deploy manual é ok            |
| 14-16  | F10     | Feedback externo       | Não pode acelerar             |

---

## 9. Ajustes de Cronograma

### Quando revisar:

- Após conclusão de cada marco
- Se atraso >3 dias em fase crítica
- Se decisão de Fase 0 alterar arquitetura

### Como ajustar:

1. Identificar fases não-críticas
2. Mover recursos para caminho crítico
3. Considerar MVP reduzido (ex: só mobile, adiar web)
4. Nunca comprometer qualidade dos testes

### Sinais de alerta:

- ⚠️ Fase 2 passa de 3 semanas → risco alto
- ⚠️ M6 não alcançado em semana 11 → F10 ameaçado
- ⚠️ Testes M-XX ou T-XX sendo ignorados → dívida técnica

---

**Última atualização:** 26/07/2026  
**Próxima revisão:** Após conclusão de M0
