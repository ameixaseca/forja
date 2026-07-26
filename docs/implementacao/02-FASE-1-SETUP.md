# Fase 1: Setup de Monorepo — FORJA

**Duração:** 1 semana (Semana 3)  
**Dependências:** Fase 0 completa (gate aprovado)  
**Objetivo:** Configurar estrutura base do monorepo com Turborepo + pnpm

---

## 1. Contexto

### 1.1 Estado Inicial
- Repo tem apenas `docs/` e `AGENTS.md`
- Nenhum código de produção existe
- ADR-0001 define monorepo como arquitetura

### 1.2 Estado Final
- Monorepo funcional com 5 packages + 3 apps
- Build pipeline configurado (`turbo.json`)
- Linting, formatting, typechecking funcionais
- CI configurado (GitHub Actions)

---

## 2. Estrutura Alvo

```
forja/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       ├── lint.yml
│       └── typecheck.yml
├── packages/
│   ├── motor-narrativo/          # Pure TS, no deps (D-033)
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── dominio/                   # Domain rules (D-033)
│   │   ├── src/
│   │   ├── tests/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── ui-primitives/             # Shared components (RN + Web)
│   │   ├── src/
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── config-eslint/             # Shared ESLint config
│   │   └── index.js
│   └── config-typescript/         # Shared TSConfig
│       ├── base.json
│       ├── react.json
│       └── node.json
├── apps/
│   ├── mobile/                    # React Native (Expo)
│   │   ├── src/
│   │   ├── app.json
│   │   ├── package.json
│   │   └── tsconfig.json
│   ├── web/                       # Next.js + RN Web (ADR-0008)
│   │   ├── src/
│   │   ├── next.config.js
│   │   ├── package.json
│   │   └── tsconfig.json
│   └── api/                       # NestJS (ADR-0003)
│       ├── src/
│       ├── nest-cli.json
│       ├── package.json
│       └── tsconfig.json
├── content/                       # Storylet catalog (D-036)
│   ├── campanhas/
│   │   └── espinha/
│   │       ├── capitulos/
│   │       └── manifest.json
│   └── schema/
│       └── storylet.schema.json
├── docs/                          # Existing docs
├── package.json                   # Root workspace
├── pnpm-workspace.yaml
├── turbo.json
├── .gitignore
├── .prettierrc
├── .eslintrc.js
└── README.md
```

---

## 3. Tarefas Detalhadas

### 3.1 Dia 1: Estrutura Base

**3.1.1 Inicializar Workspace**

```bash
# Na raiz do repo
pnpm init
```

**3.1.2 Criar `pnpm-workspace.yaml`**

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**3.1.3 Instalar Turborepo**

```bash
pnpm add -D -w turbo
```

**3.1.4 Criar `turbo.json`**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "dependsOn": ["^build"],
      "outputs": []
    },
    "test": {
      "dependsOn": ["^build"],
      "outputs": ["coverage/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

**Checklist:**
- [ ] `package.json` criado com workspace scripts
- [ ] `pnpm-workspace.yaml` criado
- [ ] Turborepo instalado
- [ ] `turbo.json` configurado

---

### 3.2 Dia 2: Packages Base

**3.2.1 Criar `packages/config-typescript/`**

```bash
mkdir -p packages/config-typescript
cd packages/config-typescript
pnpm init
```

`packages/config-typescript/package.json`:

```json
{
  "name": "@forja/config-typescript",
  "version": "0.0.1",
  "private": true,
  "files": ["*.json"]
}
```

`packages/config-typescript/base.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "incremental": true
  },
  "exclude": ["node_modules", "dist", "build"]
}
```

`packages/config-typescript/react.json`:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "lib": ["ES2020", "DOM", "DOM.Iterable"]
  }
}
```

`packages/config-typescript/node.json`:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "lib": ["ES2020"],
    "types": ["node"]
  }
}
```

**3.2.2 Criar `packages/config-eslint/`**

```bash
mkdir -p packages/config-eslint
cd packages/config-eslint
pnpm init
pnpm add -D eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

`packages/config-eslint/index.js`:

```js
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
  },
};
```

**Checklist:**
- [ ] `@forja/config-typescript` criado
- [ ] `@forja/config-eslint` criado
- [ ] Configs versionados

---

### 3.3 Dia 3: Package `motor-narrativo`

**3.3.1 Criar Estrutura**

```bash
mkdir -p packages/motor-narrativo/src
mkdir -p packages/motor-narrativo/tests
cd packages/motor-narrativo
pnpm init
```

**3.3.2 `package.json`**

```json
{
  "name": "@forja/motor-narrativo",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "lint": "eslint src/ --ext .ts",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "@forja/config-typescript": "workspace:*",
    "@forja/config-eslint": "workspace:*",
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  }
}
```

**3.3.3 `tsconfig.json`**

```json
{
  "extends": "@forja/config-typescript/base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["tests/**/*", "dist"]
}
```

**3.3.4 `src/index.ts` (Placeholder)**

```typescript
/**
 * Motor Narrativo — Pure TS, no deps (D-033)
 * Implements ESPEC v2.6
 */

export interface State {
  qualities: Record<string, number | boolean>;
}

export interface Inputs {
  rolagem: number;
  tregua: boolean;
  reencontro: boolean;
  // ... outras inputs (§2.2 ESPEC)
}

export interface Storylet {
  id: string;
  titulo: string;
  // ... campos (implementar em Fase 2)
}

export interface Resolution {
  storylet: Storylet;
  texto: string;
  effects: Record<string, number | boolean>;
}

/**
 * Função pura (RF-036): estado + inputs + seed → resolução
 */
export function resolve(
  state: State,
  inputs: Inputs,
  seed: number
): Resolution {
  // Placeholder: implementar em Fase 2
  throw new Error('Not implemented');
}
```

**3.3.5 `tests/resolve.test.ts` (Placeholder)**

```typescript
import { describe, it, expect } from 'vitest';
import { resolve } from '../src/index';

describe('resolve', () => {
  it('should be deterministic (M-05)', () => {
    const state = { qualities: {} };
    const inputs = { rolagem: 7, tregua: false, reencontro: false };
    const seed = 42;

    expect(() => resolve(state, inputs, seed)).toThrow('Not implemented');
  });
});
```

**Checklist:**
- [ ] `@forja/motor-narrativo` criado
- [ ] Placeholder types + função `resolve`
- [ ] Teste placeholder (falha esperada)
- [ ] `pnpm build` funciona (TypeScript compila)
- [ ] `pnpm test` roda (Vitest funciona)

---

### 3.4 Dia 4: Package `dominio`

Similar a `motor-narrativo`, mas para lógica de domínio (Juramento, Ciclo, Fôlego).

**3.4.1 Criar Estrutura**

```bash
mkdir -p packages/dominio/src
mkdir -p packages/dominio/tests
cd packages/dominio
pnpm init
```

**3.4.2 `package.json`** (idêntico a `motor-narrativo`, ajustar nome)

**3.4.3 `src/index.ts` (Placeholder)**

```typescript
/**
 * Domínio — Regras de negócio (RN-001 a RN-039)
 * Implementa: Juramento, Ciclo, Fôlego, Superação, Modalidades
 */

export interface Juramento {
  diasPorSemana: number; // 1-6 (RF-004)
  dataInicio: Date;
  dataFim: Date;
}

export interface Ciclo {
  numero: number;
  juramento: Juramento;
  diasTreinados: number;
  diasJurados: number;
  cumprido: boolean;
}

/**
 * RN-001: Progressão = dias_treinados / dias_jurados
 */
export function calcularProgressao(ciclo: Ciclo): number {
  return ciclo.diasTreinados / ciclo.diasJurados;
}

// ... outras funções (implementar em Fase 3)
```

**3.4.4 Teste Placeholder**

```typescript
import { describe, it, expect } from 'vitest';
import { calcularProgressao } from '../src/index';

describe('calcularProgressao', () => {
  it('should calculate RN-001 correctly', () => {
    const ciclo = {
      numero: 1,
      juramento: { diasPorSemana: 3, dataInicio: new Date(), dataFim: new Date() },
      diasTreinados: 2,
      diasJurados: 3,
      cumprido: false,
    };

    expect(calcularProgressao(ciclo)).toBeCloseTo(0.667, 2);
  });
});
```

**Checklist:**
- [ ] `@forja/dominio` criado
- [ ] Placeholder types + `calcularProgressao`
- [ ] Teste funciona
- [ ] `pnpm build` e `pnpm test` OK

---

### 3.5 Dia 5: CI e Linting

**3.5.1 Configurar Prettier**

Na raiz:

```bash
pnpm add -D -w prettier
```

`.prettierrc`:

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

**3.5.2 Configurar ESLint na Raiz**

`.eslintrc.js`:

```js
module.exports = {
  root: true,
  extends: ['@forja/config-eslint'],
};
```

**3.5.3 Scripts na Raiz**

`package.json`:

```json
{
  "scripts": {
    "build": "turbo run build",
    "lint": "turbo run lint",
    "typecheck": "turbo run typecheck",
    "test": "turbo run test",
    "format": "prettier --write \"**/*.{ts,tsx,js,json,md}\"",
    "format:check": "prettier --check \"**/*.{ts,tsx,js,json,md}\""
  }
}
```

**3.5.4 GitHub Actions**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

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
      - run: pnpm format:check

  typecheck:
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
      - run: pnpm typecheck

  test:
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
      - run: pnpm test
```

**Checklist:**
- [ ] Prettier configurado
- [ ] ESLint na raiz funcional
- [ ] Scripts `pnpm lint`, `pnpm format` funcionam
- [ ] CI configurado (GitHub Actions)
- [ ] CI passa (mesmo com placeholders)

---

## 4. Validação da Fase

### 4.1 Critérios de Aceite

- [ ] Monorepo funcional: `pnpm install` sem erros
- [ ] Build funciona: `pnpm build` compila todos packages
- [ ] Lint funciona: `pnpm lint` passa
- [ ] Typecheck funciona: `pnpm typecheck` passa
- [ ] Testes funcionam: `pnpm test` roda (mesmo que placeholder)
- [ ] CI passa: GitHub Actions verde
- [ ] Cache de Turborepo funciona (segundo build 50% mais rápido)
- [ ] Estrutura de diretórios segue desenho (§2)

### 4.2 Smoke Tests

```bash
# Na raiz
pnpm install
pnpm build
pnpm lint
pnpm typecheck
pnpm test

# Cache test
pnpm build  # Primeira vez: ~30s
pnpm build  # Segunda vez: ~10s (cache hit)
```

### 4.3 Documentação

Criar `docs/setup/README.md`:

```markdown
# Setup Local — FORJA

## Pré-requisitos
- Node.js 20+
- pnpm 8+

## Instalação
\`\`\`bash
pnpm install
\`\`\`

## Comandos
- `pnpm build` — Build all packages
- `pnpm lint` — Lint all packages
- `pnpm typecheck` — Type-check all packages
- `pnpm test` — Run all tests
- `pnpm dev` — Start dev servers (mobile/web/api)

## Estrutura
- `packages/motor-narrativo` — Pure TS narrative engine
- `packages/dominio` — Domain rules
- `apps/mobile` — React Native (Expo)
- `apps/web` — Next.js + RN Web
- `apps/api` — NestJS

## Troubleshooting
- Se `pnpm install` falhar: deletar `node_modules` e tentar novamente
- Se cache quebrar: `turbo run build --force`
\`\`\`

---

## 5. Riscos e Mitigações

| Risco | Probabilidade | Mitigação |
|-------|---------------|-----------|
| **Turborepo complexo** | Média | Usar config minimal, expandir depois |
| **Dependências conflitantes** | Alta | Usar `pnpm` (strict hoisting) |
| **CI lento** | Média | Cache de Turborepo + GitHub Actions cache |

---

## 6. Checklist de Saída

Antes de marcar Fase 1 completa:

- [ ] Todos packages criados (motor-narrativo, dominio, config-*)
- [ ] Build pipeline funcional
- [ ] CI passando (lint, typecheck, test)
- [ ] Documentação de setup criada
- [ ] Commit com tag `fase-1-completa`
- [ ] Gate aprovado (revisão própria ou par)

---

**Próxima fase:** Fase 2 (Motor Narrativo)  
**Duração estimada Fase 2:** 3 semanas
