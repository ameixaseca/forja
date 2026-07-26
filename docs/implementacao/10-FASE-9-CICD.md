# Fase 9: CI/CD + Infra — FORJA

**Duração:** 1 semana  
**Dependências:** Fase 8 (suítes completas)  
**Objetivo:** Workflows GitHub Actions completos

---

## AI Agent Context

**Artefatos entrada:**
- `docs/ci-cd/.github/workflows/*.yml` (templates)
- Fase 1-8 completas (todos packages buildáveis)

**Artefatos saída:**
```
.github/
├── workflows/
│   ├── ci.yml                # Lint + typecheck + test
│   ├── conteudo.yml          # verificar.py + simulador
│   ├── banco-de-dados.yml    # Supabase dry-run
│   ├── deploy-web.yml        # Vercel
│   ├── deploy-api.yml        # Fly.io
│   ├── mobile-release.yml    # EAS Build (manual)
│   └── kill-switch-export.yml # Manual CDN publish
└── environments/
    ├── staging
    └── production
```

**Comandos verificação:**
```bash
# Simular local
act -l                   # Lista workflows
act -j lint              # Roda job lint
```

---

## Tarefas

### Tarefa 9.1: Workflow CI
**Agente:** `write`
**Arquivo:** `.github/workflows/ci.yml`
```yaml
name: CI

on: [push, pull_request]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
  
  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
  
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
```
**Verificação:** Push → Actions verde.

---

### Tarefa 9.2: Workflow Conteúdo
**Agente:** `write`
**Arquivo:** `.github/workflows/conteudo.yml`
```yaml
name: Verificação Conteúdo

on:
  push:
    paths:
      - 'content/**'
      - 'packages/motor-narrativo/**'

jobs:
  verificar:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      - run: pip install -r tooling/verificador/requirements.txt
      - run: python tooling/verificador/verificar.py content/campanhas/espinha/
  
  simular:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: cd tooling/simulador && pnpm simulate --catalog ../../content/campanhas/espinha/manifest.json --runs 50 --policy constante
```
**Verificação:** Mudança em `content/` → workflow roda.

---

### Tarefa 9.3: Workflow Deploy Web
**Agente:** `write`
**Arquivo:** `.github/workflows/deploy-web.yml`
```yaml
name: Deploy Web

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - run: pnpm build --filter=@forja/web
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```
**Secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
**Verificação:** Push `main` → deploy Vercel.

---

### Tarefa 9.4: Workflow Mobile Release
**Agente:** `write`
**Arquivo:** `.github/workflows/mobile-release.yml`
```yaml
name: Mobile Release

on:
  workflow_dispatch:
    inputs:
      platform:
        description: 'Platform (ios|android|all)'
        required: true
        default: 'all'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - run: pnpm install --frozen-lockfile
      - uses: expo/expo-github-action@v8
        with:
          eas-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - run: eas build --platform ${{ github.event.inputs.platform }} --non-interactive
```
**Secrets:** `EXPO_TOKEN`
**Verificação:** Manual trigger → EAS Build inicia.

---

### Tarefa 9.5: Environments
**Agente:** GitHub UI
**Criar:**
- Environment `staging` (sem proteção)
- Environment `production` (required reviewers: 1)
**Secrets configurados:**
- `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- `VERCEL_TOKEN`, `FLY_API_TOKEN`, `EXPO_TOKEN`
**Verificação:** Environments listados em repo settings.

---

## Critérios Gate

- [ ] 6 workflows funcionais
- [ ] CI passa em todo push
- [ ] Deploy staging automatizado
- [ ] Mobile release manual funcional
- [ ] Secrets configurados
- [ ] Tag `fase-9-completa`

**Próxima fase:** Fase 10 (Testes Bloqueantes) — 2 semanas
