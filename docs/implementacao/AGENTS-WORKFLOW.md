# Agents Workflow — FORJA

**Propósito:** Mapear skills/agents para fases implementação, otimizando tokens e contexto.

---

## Estrutura Docs Otimizada

Cada fase (`docs/implementacao/*-FASE-*.md`) segue padrão:

```markdown
## AI Agent Context

**Artefatos entrada:**  # O que ler antes
**Artefatos saída:**     # Estrutura esperada
**Comandos verificação:** # Como validar
**Dependências externas:** # Requisitos sistema

## Tarefas

### Tarefa X.Y: Nome
**Agente:** tool/skill recomendado
**Arquivo:** path/to/file.ext
**Função/Ação:** código/comando específico
**Verificação:** comando ou assertion
```

**Ganho:** Agent recebe contexto direto, sem extrair de prosa pedagógica.

---

## Fase 0: Reconciliação

**Doc:** `01-FASE-0-RECONCILIACAO.md`  
**Duração:** 2 semanas  
**Tipo:** Documental (sem código)

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **0.1** Criar DI-006 a DI-011 | `task` (general) | Decisões §3 doc + `DECISOES-IMPLEMENTACAO.md` | Arquivo atualizado com DI-006-011 | `grep "DI-006" docs/implementacao/DECISOES-IMPLEMENTACAO.md` |
| **0.2** Criar gate aprovado | `write` | Template §5 doc | `FASE-0-GATE-APROVADO.md` | File exists |
| **0.3** Criar issues GitHub | `bash` (gh CLI) | Itens LAC-07, ESPEC-01/03/04 | 4 issues label `fase-posterior` | `gh issue list --label fase-posterior` |

**Verificação final:**
```bash
grep -c "DI-0" docs/implementacao/DECISOES-IMPLEMENTACAO.md  # >=11
test -f docs/implementacao/FASE-0-GATE-APROVADO.md
gh issue list --label fase-posterior | wc -l  # >=4
```

---

## Fase 1: Setup Monorepo

**Doc:** `02-FASE-1-SETUP.md`  
**Duração:** 1 semana  
**Tipo:** Setup infraestrutura

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **1.1** Workspace root | `bash` | — | `pnpm-workspace.yaml`, `turbo.json`, root `package.json` | `pnpm list turbo` |
| **1.2** Config packages | `write` | Config templates doc §3.2 | `packages/config-typescript/`, `packages/config-eslint/` | `pnpm build --filter=@forja/config-*` |
| **1.3** Motor placeholder | `write` | Types doc §3.3 | `packages/motor-narrativo/src/index.ts` + tests | `cd packages/motor-narrativo && pnpm test` |
| **1.4** Domínio placeholder | `write` | Types doc §3.4 | `packages/dominio/src/index.ts` + tests | `cd packages/dominio && pnpm test` |
| **1.5** Linting | `write` | Config doc §3.5 | `.prettierrc`, `.eslintrc.js` | `pnpm lint && pnpm format:check` |
| **1.6** CI | `write` | Workflow doc §3.5.4 | `.github/workflows/ci.yml` | Push → Actions verde |

**Verificação final:**
```bash
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test
```

---

## Fase 2: Motor Narrativo

**Doc:** `03-FASE-2-MOTOR.md`  
**Duração:** 3 semanas  
**Tipo:** Core logic puro

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **2.1** RNG seeded | `write` | Algoritmo Mulberry32 doc §2 | `src/rng.ts` + test | `pnpm test tests/unit/rng.test.ts` |
| **2.2** Predicados | `write` | Spec doc §2 | `src/selector/predicate.ts` + test | `pnpm test tests/unit/predicate.test.ts` |
| **2.3** Elegibilidade | `write` | Regras M-03 doc §2 | `src/selector/eligibility.ts` + test | `pnpm test tests/unit/eligibility.test.ts` |
| **2.4** Bandas | `write` | Lógica M-01, M-06, M-08 doc §2 | `src/selector/bands.ts` + tests | `pnpm test tests/integration/M-01.test.ts` |
| **2.5** Exclusão | `write` | Fila K, DI-007 doc §2 | `src/selector/exclusion.ts` + test M-09 | `pnpm test tests/integration/M-09.test.ts` |
| **2.6** resolve() | `write` | Passos doc §3 | `src/resolve.ts` + test M-02 | `pnpm test tests/integration/M-02.test.ts` |
| **2.7** Safety-net | `write` | Lógica M-04 doc §3 | `src/safety-net.ts` + test | `pnpm test tests/integration/M-04.test.ts` |
| **2.8** Políticas | `write` | 3 políticas doc §4 | `src/simulator/policies.ts` + test | `pnpm test tests/simulator/policies.test.ts` |
| **2.9** Simulador | `write` | Função simulate doc §4 | `src/simulator/index.ts` + test | `pnpm simulate --catalog test.json --runs 50 --policy constante` |
| **2.10** Fixtures | `write` | JSON templates doc §5 | `tests/fixtures/*.json` | JSON parse sem erros |
| **2.11** Testes M-01 a M-09 | `write` | Specs doc §5 | `tests/integration/M-*.test.ts` | `pnpm test:integration` 100% verde |
| **2.12** README | `write` | Template doc §6 | `README.md` | File exists, menciona M-XX |
| **2.13** Scripts | `edit` | Scripts doc §6 | `package.json` | `pnpm test:unit` roda apenas unit |

**Verificação final:**
```bash
cd packages/motor-narrativo
pnpm test:integration  # M-01 a M-09 100%
pnpm test:simulator    # Razão 0.15-0.3
pnpm test:coverage     # >=80%
```

---

## Fase 3: Domínio

**Doc:** `04-FASE-3-DOMINIO.md`  
**Duração:** 1 semana  
**Tipo:** Event sourcing + regras

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **3.1** Types | `write` | Types doc §1 | `src/types.ts` | TSC compila |
| **3.2** Projector | `write` | Função doc §1 | `src/event-sourcing/projector.ts` + test | `pnpm test tests/unit/projector.test.ts` |
| **3.3** Vontade | `write` | RN-004 doc §2 | `src/vontade.ts` + test | `pnpm test tests/unit/vontade.test.ts` |
| **3.4** Fôlego | `write` | RN-011, RN-012 doc §2 | `src/folego.ts` + test | `pnpm test tests/unit/folego.test.ts` |
| **3.5** Marcos | `write` | RF-043, DI-008 doc §2 | `src/marcos.ts` + test | `pnpm test tests/unit/marcos.test.ts` |
| **3.6** Ciclo/Juramento | `write` | RN-001, RN-002, RF-004 doc §2 | `src/ciclo.ts`, `src/juramento.ts` + tests | `pnpm test tests/unit/ciclo.test.ts` |

**Verificação final:**
```bash
cd packages/dominio
pnpm test              # 100%
pnpm test:coverage     # >=90%
```

---

## Fase 4: Verificação

**Doc:** `05-FASE-4-VERIFICACAO.md`  
**Duração:** 1 semana  
**Tipo:** Tooling Python + TS

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **4.1** Setup verificador | `bash` + `write` | CLI template doc §1 | `tooling/verificador/verificar.py` | `python verificar.py --help` |
| **4.2** Regras T-01 a T-21 | `write` | Specs doc §1 | `tooling/verificador/regras/*.py` | `pytest` passa |
| **4.3** CLI simulador | `bash` + `write` | Template doc §2 | `tooling/simulador/src/index.ts` | `pnpm simulate --catalog test.json --runs 50 --policy constante` |
| **4.4** Reporter | `write` | Relatório doc §2 | `tooling/simulador/src/reporter.ts` | Relatório exibe razão |
| **4.5** Fixtures negativas | `write` | 13 catálogos doc §3 | `tooling/fixtures/negativos/*.json` | `verificar.py` detecta erros |

**Verificação final:**
```bash
python tooling/verificador/verificar.py content/campanhas/espinha/  # ✅
cd tooling/simulador && pnpm simulate --catalog ../../content/test.json --runs 50 --policy constante  # Razão 15%-30%
```

---

## Fase 5: API Backend

**Doc:** `06-FASE-5-API.md`  
**Duração:** 1.5 semanas  
**Tipo:** NestJS service

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **5.1** Setup NestJS | `bash` | — | `apps/api/` scaffold | `cd apps/api && pnpm dev` |
| **5.2** Módulo sync | `write` | Endpoint spec doc §2 | `src/modules/sync/` | `pnpm test:e2e tests/e2e/sync.e2e.test.ts` |
| **5.3** Módulo entitlements | `write` | Endpoint spec doc §3 | `src/modules/entitlements/` | Mock Apple/Google API passa |
| **5.4** Módulo LGPD | `write` | Endpoints spec doc §4 | `src/modules/lgpd/` | `pnpm test:e2e tests/e2e/lgpd.e2e.test.ts` |
| **5.5** Deploy staging | `bash` | Fly.io commands doc §5 | Deploy Fly.io | `curl https://forja-api-staging.fly.dev/health` → 200 |

**Verificação final:**
```bash
cd apps/api
pnpm test:e2e          # Sync, entitlements, LGPD passam
curl https://forja-api-staging.fly.dev/health  # 200
```

---

## Fase 6: Mobile MVP

**Doc:** `07-FASE-6-MOBILE.md`  
**Duração:** 2.5 semanas  
**Tipo:** Expo app

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **6.1** Setup Expo | `bash` | — | `apps/mobile/` scaffold | `cd apps/mobile && pnpm ios` |
| **6.2** SQLite local | `write` | Schema doc §2 | `src/storage/sqlite.ts` | Insere evento, query retorna |
| **6.3** SyncService | `write` | Lógica doc §3 | `src/sync/SyncService.ts` | Mock fetch, sync insere eventos |
| **6.4** Telas MVP | `write` | 7 telas doc §4 | `src/screens/*.tsx` | Navegação funciona |
| **6.5** Integração motor | `write` | Hook doc §5 | `src/hooks/useResolution.ts` | Sessão → evento → ficha atualizada |

**Verificação final:**
```bash
cd apps/mobile
pnpm ios               # Roda simulador
# Fluxo manual: criar juramento → registrar sessão → ver resolução
```

---

## Fase 7: Web App

**Doc:** `08-FASE-7-WEB.md`  
**Duração:** 1 semana  
**Tipo:** Next.js + RN Web

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **7.1** Setup Next + RN Web | `bash` | Config doc §1 | `apps/web/` scaffold | `cd apps/web && pnpm dev` |
| **7.2** Reaproveitar componentes | `bash` | — | `packages/ui-primitives/` | Componentes renderizam web |
| **7.3** Navegação | `write` | Layout doc §3 | `app/layout.tsx` | Navegação Next Router |
| **7.4** Responsivo | `write` | CSS doc §4 | `src/styles/responsive.css` | Desktop 2-col layout |
| **7.5** Deploy | `bash` | Vercel commands doc §5 | Deploy Vercel | `https://forja.vercel.app` funcional |

**Verificação final:**
```bash
cd apps/web
pnpm build             # Build produção sem erros
open https://forja.vercel.app  # Staging funcional
```

---

## Fase 8: Suíte BDD

**Doc:** `09-FASE-8-BDD.md`  
**Duração:** 1.5 semanas  
**Tipo:** Cucumber/Gherkin

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **8.1** Setup Vitest + Gherkin | `bash` | — | `packages/bdd/` scaffold | `cd packages/bdd && pnpm test` |
| **8.2** Copiar features | `bash` | `docs/testes/rastreabilidade/features/` | `features/*.feature` | 14 arquivos copiados |
| **8.3** Step definitions | `write` | Exemplo doc §3 | `step-definitions/*.steps.ts` | Cenários passam |
| **8.4** World context | `write` | Template doc §4 | `support/world.ts` | Steps compartilham estado |
| **8.5** Executar suíte | `bash` | — | — | `pnpm test` → 315/315 verde |

**Verificação final:**
```bash
cd packages/bdd
pnpm test              # 315/315 cenários passando
```

---

## Fase 9: CI/CD

**Doc:** `10-FASE-9-CICD.md`  
**Duração:** 1 semana  
**Tipo:** GitHub Actions

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **9.1** Workflow CI | `write` | Template doc §1 | `.github/workflows/ci.yml` | Push → Actions verde |
| **9.2** Workflow conteúdo | `write` | Template doc §2 | `.github/workflows/conteudo.yml` | Mudança `content/` → workflow |
| **9.3** Deploy web | `write` | Template doc §3 | `.github/workflows/deploy-web.yml` | Push `main` → Vercel deploy |
| **9.4** Mobile release | `write` | Template doc §4 | `.github/workflows/mobile-release.yml` | Manual trigger → EAS Build |
| **9.5** Environments | GitHub UI | — | Staging/prod environments | Secrets configurados |

**Verificação final:**
```bash
git push origin main   # CI passa, deploy staging funcional
gh workflow run mobile-release.yml --field platform=ios  # Manual trigger funciona
```

---

## Fase 10: Testes Bloqueantes

**Doc:** `11-FASE-10-TESTES-BLOQUEANTES.md`  
**Duração:** 2 semanas  
**Tipo:** Validação humana (não automatizável)

### Agentes Recomendados

| Tarefa | Agente | Input | Output | Comando |
|--------|--------|-------|--------|---------|
| **10.1** Gerar resoluções | `bash` | Simulador | `texto-corrido.txt` (20 parágrafos) | `node scripts/extract-text.js relatorio.json` |
| **10.2-10.7** Resto | **Humano** | — | Documentos validação | Manual |

**Verificação final:**
- Teste leitura: 2+ de 3 leitores resumem → **PASS**
- Teste card: ≥1 em 5 posts gera curiosidade → **PASS**
- **Decisão GO/NO-GO registrada**

---

## Fluxo Recomendado por Skill

### `openspec-propose`
**Quando usar:** Explorar mudanças grandes (ex: adicionar nova feature pós-MVP).  
**Fases:** Pós-Fase 10 (expansões futuras).

### `openspec-apply-change`
**Quando usar:** Implementar tasks de change proposto.  
**Fases:** Qualquer, quando há OpenSpec change ativo.

### `openspec-explore`
**Quando usar:** Investigar problema não mapeado (ex: deadlock narrativo em teste).  
**Fases:** Fase 0 (reconciliação), Fase 10 (validação).

### `task` (explore agent)
**Quando usar:** Buscar código/docs em codebase (ex: "onde está lógica Fôlego?").  
**Fases:** Todas (quando precisa contexto cross-package).

### `task` (general agent)
**Quando usar:** Tarefas multi-step complexas (ex: criar DI-006 a DI-011).  
**Fases:** Fase 0 (decisões), Fase 4 (fixtures negativas), Fase 8 (step definitions).

### `write`
**Quando usar:** Criar arquivo novo direto (sem edição).  
**Fases:** Fase 1-9 (maioria das tarefas).

### `edit`
**Quando usar:** Modificar arquivo existente (ex: adicionar script package.json).  
**Fases:** Fase 2 (scripts), Fase 6 (config).

### `bash`
**Quando usar:** Comandos shell (pnpm, git, gh, fly).  
**Fases:** Todas (setup, deploy, CI).

### `read`
**Quando usar:** Ler arquivo antes de editar/implementar.  
**Fases:** Sempre antes de `edit` ou quando precisa verificar spec.

### `grep`
**Quando usar:** Buscar padrão em código (ex: "onde K é calculado?").  
**Fases:** Debugging, verificação cross-refs.

---

## Prompts Sugeridos por Fase

### Fase 0
```
Você é especialista em reconciliação de specs. Leia:
- docs/prd/PRD-Forja-v0_14.md §15.2-15.3
- docs/prd/ESPEC-Sistema-Narrativo-v2_6.md
- docs/implementacao/01-FASE-0-RECONCILIACAO.md

Crie decisões DI-006 a DI-011 em DECISOES-IMPLEMENTACAO.md seguindo formato existente.
Verificar: grep "DI-006" docs/implementacao/DECISOES-IMPLEMENTACAO.md
```

### Fase 1
```
Setup monorepo Turborepo + pnpm conforme:
- docs/implementacao/02-FASE-1-SETUP.md
- ADR-0001 (monorepo structure)

Executar tarefas 1.1 a 1.6 sequencialmente.
Verificar: pnpm build && pnpm lint && pnpm test
```

### Fase 2
```
Implementar motor narrativo puro conforme:
- docs/prd/ESPEC-Sistema-Narrativo-v2_6.md §6 (algoritmo)
- docs/implementacao/03-FASE-2-MOTOR.md
- RF-036 (função pura), D-033 (zero deps)

Executar tarefas 2.1 a 2.13 sequencialmente.
Verificar: pnpm test:integration (M-01 a M-09 100%)
```

### Fase 6
```
Criar app Expo offline-first conforme:
- docs/implementacao/07-FASE-6-MOBILE.md
- ADR-0002 (event sourcing)
- D-008 (offline-first)

Executar tarefas 6.1 a 6.5.
Verificar: Fluxo manual (criar juramento → sessão → resolução)
```

---

## Anti-patterns (Evitar)

❌ **Prompt genérico:** "Crie um motor narrativo"  
✅ **Prompt específico:** "Implementar tarefa 2.1 (RNG seeded) conforme doc §2 usando Mulberry32"

❌ **Alucinação de requisitos:** Agent inventa features  
✅ **Referência explícita:** "Conforme RF-036 e DI-007, tie-breaker é seeded"

❌ **Ignorar restrições:** Agent adiciona deps npm  
✅ **Restrição explícita:** "D-033: zero deps externas, pure TS apenas"

❌ **Código genérico:** Boilerplate sem testes  
✅ **Test-driven:** "Criar src/rng.ts + tests/unit/rng.test.ts, verificar: pnpm test"

---

## Métricas de Sucesso

| Fase | Métrica Gate | Comando Verificação |
|------|--------------|---------------------|
| **0** | DI-006 a DI-011 documentadas | `grep -c "DI-0" DECISOES-IMPLEMENTACAO.md` → ≥11 |
| **1** | Monorepo builda | `pnpm build && pnpm lint && pnpm test` → 0 erros |
| **2** | M-01 a M-09 100% | `cd packages/motor-narrativo && pnpm test:integration` → 9/9 verde |
| **3** | Event sourcing funcional | `cd packages/dominio && pnpm test:coverage` → ≥90% |
| **4** | Verificador + simulador | `python verificar.py content/` → ✅, simulador razão 15%-30% |
| **5** | API e2e passa | `cd apps/api && pnpm test:e2e` → 100% verde |
| **6** | Mobile offline funciona | Fluxo manual iOS/Android simulador |
| **7** | Web deploy staging | `curl https://forja.vercel.app` → 200 |
| **8** | BDD 315 cenários | `cd packages/bdd && pnpm test` → 315/315 verde |
| **9** | CI verde | Push `main` → Actions 100% verde |
| **10** | Validação externa | Teste leitura + card passam → GO |

---

## Resumo

**Total fases:** 10 (0 a 10)  
**Total tarefas:** ~80 (média 8/fase)  
**Duração estimada:** 16 semanas implementação + 2 validação  
**Token economizado vs docs originais:** ~60% (contexto direto vs narrativa)

**Uso:** Cada fase tem "AI Agent Context" no topo → copiar/colar em prompt → agent executa tarefas numeradas sequencialmente → verificar comandos → gate antes próxima fase.
