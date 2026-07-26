# Documentação de Implementação — FORJA

**Status:** 🔴 **Fase 0: Reconciliação** — Iniciando  
**Última atualização:** 26/07/2026

---

## 📊 Status Atual das Fases

| Fase | Nome | Status | Estimativa | Milestone |
|------|------|--------|------------|-----------|
| **0** | **Reconciliação** | 🔴 Bloqueante | 2-3 dias | M0 |
| 1 | Fundações | ⚪ Aguardando | 1.5 semanas | M1 |
| 2 | Motor Narrativo | ⚪ Aguardando | 2 semanas | M2 |
| 3 | Regras de Domínio | ⚪ Aguardando | 1 semana | M3 |
| 4 | Verificação | ⚪ Aguardando | 1 semana | M4 |
| 5 | API Backend | ⚪ Aguardando | 1.5 semanas | M5 |
| 6 | Mobile MVP | ⚪ Aguardando | 2.5 semanas | M6 |
| 7 | Web App | ⚪ Aguardando | 1 semana | M7 |
| 8 | Suíte BDD | ⚪ Aguardando | 1.5 semanas | M8 |
| 9 | CI/CD + Infra | ⚪ Aguardando | 1 semana | M9 |
| 10 | Testes Bloqueantes | ⚪ Aguardando | 2-3 semanas | M10 |

**Legenda:** 🔴 Em andamento | 🟡 Parcial | 🟢 Completo | ⚪ Não iniciado

---

## 🚀 Navegação Rápida

### 📋 Documentos de Planejamento

- [**Contexto e Premissas**](00-CONTEXTO-E-PREMISSAS.md) — Visão executiva, restrições, decisões arquiteturais
- [**Cronograma**](CRONOGRAMA.md) — Gantt visual, dependências, caminho crítico
- [**Stack Técnico**](STACK-TECNICO.md) — Ferramentas, frameworks, justificativas
- [**Escopo do MVP**](ESCOPO-MVP.md) — Requisitos funcionais incluídos vs adiados
- [**Riscos e Mitigações**](RISCOS-E-MITIGACOES.md) — Matriz de riscos, planos de contingência
- [**Decisões de Implementação**](DECISOES-IMPLEMENTACAO.md) — Log de decisões técnicas (living document)

### 🏗️ Fases de Implementação

#### Fase 0: Reconciliação (BLOQUEANTE)
- [**01-FASE-0-RECONCILIACAO.md**](01-FASE-0-RECONCILIACAO.md)
- **Objetivo:** Resolver 5 defeitos (DEF-01 a DEF-05) e 11 lacunas (LAC-01 a LAC-11) da ESPEC v2.6
- **Entrega:** Decisões registradas, ESPEC v2.7 publicada
- **Gate:** Nenhum código até completar esta fase

#### Fase 1: Fundações
- [**02-FASE-1-FUNDACOES.md**](02-FASE-1-FUNDACOES.md)
- **Objetivo:** Monorepo + database + schemas compartilhados
- **Entrega:** `pnpm dev`, `pnpm build`, `pnpm test` funcionando

#### Fase 2: Motor Narrativo
- [**03-FASE-2-MOTOR-NARRATIVO.md**](03-FASE-2-MOTOR-NARRATIVO.md)
- **Objetivo:** Seletor de storylet, avaliador de predicados, RNG determinístico
- **Entrega:** Testes M-01 a M-09 passando

#### Fase 3: Regras de Domínio
- [**04-FASE-3-REGRAS-DOMINIO.md**](04-FASE-3-REGRAS-DOMINIO.md)
- **Objetivo:** Event sourcing, projeção de ficha, ciclos, Marcos
- **Entrega:** Features BDD 01-05 passando

#### Fase 4: Verificação
- [**05-FASE-4-VERIFICACAO.md**](05-FASE-4-VERIFICACAO.md)
- **Objetivo:** Evolução de `verificar.py`, simulador
- **Entrega:** Testes T-01 a T-21 + simulador com 5 políticas

#### Fase 5: API Backend
- [**06-FASE-5-API-BACKEND.md**](06-FASE-5-API-BACKEND.md)
- **Objetivo:** NestJS + Fastify, sync, auth, entitlements, LGPD
- **Entrega:** API staging deployada, sync funcional

#### Fase 6: Mobile MVP
- [**07-FASE-6-MOBILE-MVP.md**](07-FASE-6-MOBILE-MVP.md)
- **Objetivo:** Expo app com fluxo completo offline
- **Entrega:** App funcional em simulador iOS + Android

#### Fase 7: Web App
- [**08-FASE-7-WEB-APP.md**](08-FASE-7-WEB-APP.md)
- **Objetivo:** Next.js + React Native Web
- **Entrega:** Web app com paridade mobile

#### Fase 8: Suíte BDD
- [**09-FASE-8-SUITE-BDD.md**](09-FASE-8-SUITE-BDD.md)
- **Objetivo:** Executor Gherkin, 315 cenários
- **Entrega:** 100% features passando

#### Fase 9: CI/CD + Infra
- [**10-FASE-9-CI-CD-INFRA.md**](10-FASE-9-CI-CD-INFRA.md)
- **Objetivo:** GitHub Actions, deploy staging/produção
- **Entrega:** Pipeline completo funcionando

#### Fase 10: Testes Bloqueantes
- [**11-FASE-10-TESTES-BLOQUEANTES.md**](11-FASE-10-TESTES-BLOQUEANTES.md)
- **Objetivo:** Teste de leitura (§14.1 PRD) + teste do card (§14.2 PRD)
- **Entrega:** Decisão GO/NO-GO

---

## 🎯 Marcos de Validação (Gates)

### M0: Reconciliação Completa ✋ BLOQUEANTE
- [ ] DEF-01 a DEF-05 resolvidos e documentados
- [ ] LAC-01 a LAC-11 resolvidos e documentados
- [ ] ESPEC v2.7 publicada
- [ ] `docs/prd/decisoes.md` atualizado

### M1: Fundações Operacionais
- [ ] Monorepo buildando
- [ ] Supabase local + 12 migrações aplicadas
- [ ] Package `@forja/schema` com Zod schemas

### M2: Motor Validado
- [ ] Seletor de storylet implementado
- [ ] Testes M-01 a M-09 passando (invariantes de motor)
- [ ] RNG determinístico validado cross-platform

### M3: Domínio Funcional
- [ ] Event sourcing funcionando
- [ ] Projeção de ficha a partir de eventos
- [ ] Features BDD 01-05 passando

### M4: Verificação Automatizada
- [ ] `verificar.py` rodando em CI
- [ ] Simulador gera 50 resoluções com 5 políticas
- [ ] Testes T-01 a T-21 passando

### M5: API em Staging
- [ ] Endpoint `/sync` funcional
- [ ] RLS validado
- [ ] Deploy em Fly.io staging

### M6: App Móvel Funcional
- [ ] Fluxo completo: Juramento → Sessão → Resolução → Ficha
- [ ] Funciona 100% offline
- [ ] Sync multi-device

### M7: Paridade Web
- [ ] Web app com mesmo fluxo do mobile
- [ ] Deploy em Vercel staging

### M8: Cobertura BDD Completa
- [ ] 315 cenários passando
- [ ] 100% requisitos cobertos

### M9: Pipeline Produção
- [ ] CI/CD completo
- [ ] Staging auto-deploy
- [ ] Produção com gate manual

### M10: Validação Externa ✋ DECISÃO GO/NO-GO
- [ ] Teste de leitura: 2+ de 3 leitores resumem história corretamente
- [ ] Teste do card: ≥1 em 5 pergunta "que app é esse?"
- [ ] **DECISÃO:** Prosseguir para campanha completa ou pivotar

---

## 📖 Como Usar Esta Documentação

### Para começar a implementar
1. Leia [Contexto e Premissas](00-CONTEXTO-E-PREMISSAS.md)
2. Trabalhe [Fase 0: Reconciliação](01-FASE-0-RECONCILIACAO.md) **primeiro**
3. Registre toda decisão técnica em [Log de Decisões](DECISOES-IMPLEMENTACAO.md)
4. Avance para Fase 1 somente após M0 completo

### Para implementar uma fase
1. Abra o documento da fase (ex: `03-FASE-2-MOTOR-NARRATIVO.md`)
2. Verifique pré-requisitos
3. Siga checklist de deliverables
4. Marque critérios de aceite conforme completa
5. Valide marco antes de avançar

### Para entender o cronograma
- [Cronograma](CRONOGRAMA.md) — Gantt visual com dependências

### Para escolher tecnologias
- [Stack Técnico](STACK-TECNICO.md) — Justificativas baseadas em ADRs

### Para avaliar riscos
- [Riscos e Mitigações](RISCOS-E-MITIGACOES.md) — Matriz de probabilidade × impacto

### Para integrar com GitHub
- Crie issues usando templates em `.github/ISSUE_TEMPLATE/`
- Use labels: `fase-X`, `bloqueante`, `motor`, `api`, etc.
- Associe a milestones: M0-M10

---

## 🔗 Referências Externas

### Documentos do Projeto
- [PRD FORJA v0.14](../prd/PRD-Forja-v0_14.md) — Requisitos de produto
- [ESPEC Sistema Narrativo v2.6](../prd/ESPEC-Sistema-Narrativo-v2_6.md) — Especificação técnica
- [Protótipo Cap 1 v0.2](../prd/PROTOTIPO-Campanha-A-Longa-Seca-v0_2.md) — Catálogo de referência
- [ADRs](../adr/) — Decisões arquiteturais
- [C4 Diagrams](../c4/) — Arquitetura visual
- [Database Schema](../database/) — Migrações Supabase

### Planos de Teste
- [Plano de Testes BDD](../testes/PLANO-DE-TESTES-BDD.md)
- [Features Gherkin](../testes/rastreabilidade/features/)
- [Scripts de Verificação](../prd/verificar.py)

---

## 🤖 Trabalhando com Agentes de IA

### Prompts Efetivos por Fase
Cada documento de fase contém seção "Prompts Sugeridos" com exemplos para:
- Geração de código boilerplate
- Escrita de testes
- Revisão de decisões

### Armadilhas Comuns
1. **IA inventa requisitos:** Sempre referencie PRD/ESPEC explicitamente
2. **IA ignora restrições:** Liste D-001, D-033, D-036 no prompt
3. **IA gera código genérico:** Peça para seguir ADRs específicos

### Validação de Output
- Código gerado deve passar testes existentes
- Decisões técnicas devem ser registradas em DECISOES-IMPLEMENTACAO.md
- Consulte STACK-TECNICO.md para conformidade de ferramentas

---

## 📝 Convenções

### Commits
- `feat(motor): implementa seletor de storylet (M-01 a M-03)`
- `fix(dominio): corrige cálculo de Vontade no ciclo 14`
- `docs(fase-2): atualiza checklist de deliverables`
- `test(bdd): adiciona feature 07-motor-selecao`

### Branches
- `main` — produção
- `staging` — ambiente de staging
- `feat/fase-X-nome` — features por fase
- `fix/issue-NNN` — correções

### Pull Requests
- Título: `[Fase X] Nome do deliverable`
- Associar a milestone correspondente
- Marcar checklist de critérios de aceite

---

## 📞 Suporte e Dúvidas

### Durante Implementação
- Consulte documento da fase atual
- Valide contra PRD (requisitos RF/RN/RE/RC)
- Verifique conformidade com ADRs

### Decisões Técnicas Não Documentadas
1. Analise se bloqueia implementação
2. Se sim: registre em DECISOES-IMPLEMENTACAO.md
3. Se impacta arquitetura: crie novo ADR

### Quando Encontrar Defeito na Especificação
1. Verifique se já está em DEF-01 a DEF-05 ou LAC-01 a LAC-11
2. Se novo: documente em issue com label `defeito-spec`
3. Não avance até resolver (pode invalidar trabalho futuro)

---

**Última revisão:** 26/07/2026  
**Autor:** Luiz Paulo  
**Versão da documentação:** 1.0
