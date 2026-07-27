# Stack Técnico — FORJA

**Versão:** 1.0  
**Data:** 26/07/2026  
**Princípio:** Decisões baseadas em ADRs, não em preferência pessoal

---

## 1. Visão Geral

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (Multi-plataforma)           │
├──────────────────────┬──────────────────────────────────┤
│   Mobile (Expo)      │   Web (Next.js + RN Web)         │
│   iOS + Android      │   Navegador desktop/mobile       │
└──────────┬───────────┴───────────┬──────────────────────┘
           │                       │
           │   Importam pacotes compartilhados
           │                       │
┌──────────▼───────────────────────▼──────────────────────┐
│           Packages (TypeScript Puro)                     │
├──────────────────────┬──────────────────────────────────┤
│  motor-narrativo     │  dominio     │  schema  │ db-types│
│  (seletor, RNG)      │  (eventos)   │  (Zod)   │ (gen)   │
└──────────────────────┴──────────────────────────────────┘
           │                       │
           │   Conectam via API ou direto
           │                       │
┌──────────▼───────────────────────▼──────────────────────┐
│                    Backend                               │
├──────────────────────┬──────────────────────────────────┤
│   API (NestJS)       │   Database (Supabase/Postgres)   │
│   Fastify adapter    │   RLS + criptografia             │
└──────────────────────┴──────────────────────────────────┘
```

---

## 2. Monorepo

### 2.1 Gerenciamento de Pacotes

**Ferramenta:** pnpm v8+  
**Justificativa:**

- Workspace nativo (melhor que npm workspaces)
- Mais rápido que yarn
- Disk-efficient (symlinks)
- Lockfile determinístico

**Alternativas consideradas:**

- ❌ npm: workspaces funcional, mas mais lento
- ❌ yarn: Berry complexo demais para projeto solo

**Configuração:**

```yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'tooling/*'
```

---

### 2.2 Build System

**Ferramenta:** Turborepo  
**Justificativa (ADR-0001):**

- Cache inteligente (local + remoto)
- Builds incrementais
- Detecta pacotes afetados
- Pipeline configurável

**Alternativas consideradas:**

- ❌ Nx: mais features, mas overkill para escopo
- ❌ Rush: Microsoft-centric, menos adoção

**Configuração:**

```json
// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": []
    },
    "lint": {},
    "typecheck": {}
  }
}
```

---

### 2.3 TypeScript

**Versão:** 5.x  
**Configuração:** `strict: true` em todos os pacotes

**Por pacote:**

| Pacote            | Target | Module   | Justificativa          |
| ----------------- | ------ | -------- | ---------------------- |
| `motor-narrativo` | ES2020 | ESNext   | Pure TS, sem deps Node |
| `dominio`         | ES2020 | ESNext   | Pure TS, sem deps Node |
| `schema`          | ES2020 | CommonJS | Compatibilidade NestJS |
| `api`             | ES2022 | CommonJS | Node 22                |
| `mobile`          | ES2020 | ESNext   | Hermes engine          |
| `web`             | ES2022 | ESNext   | Next.js                |

---

## 3. Packages Compartilhados

### 3.1 `motor-narrativo`

**Restrições arquiteturais (D-033, RF-035):**

- ✅ Pure TypeScript
- ❌ NUNCA importar React, Node, platform APIs
- ❌ NUNCA importar de `dominio`, `api`, apps
- ✅ Função pura: estado + inputs + seed → resolução

**Dependências permitidas:**

```json
{
  "dependencies": {
    // NENHUMA dependência runtime
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0"
  }
}
```

**Teste de conformidade:**

```bash
# Deve falhar se importar deps proibidas
pnpm depcheck packages/motor-narrativo
```

---

### 3.2 `dominio`

**Responsabilidades:**

- Event sourcing (projeção de eventos → estado)
- Cálculo de Vontade, Fôlego, Marcos
- Regras de ciclo (Juramento, Trégua)
- Validação de business rules (RN-XXX)

**Dependências:**

```json
{
  "dependencies": {
    "@forja/schema": "workspace:*"
  }
}
```

**Mesmas restrições que `motor-narrativo`:** Pure TS, sem deps UI/Node.

---

### 3.3 `schema`

**Ferramenta:** Zod v3  
**Justificativa (ADR-0009):**

- Schema compartilhado cliente ↔ API
- Runtime validation
- TypeScript types inferidos
- Composable

**Alternativas consideradas:**

- ❌ Yup: menos type-safe
- ❌ Joi: Node-only
- ❌ io-ts: verbose

**Schemas principais:**

```typescript
// DiaryEvent
export const DiaryEventSchema = z.object({
  tipo: z.enum([
    'juramento_declarado',
    'sessao_registrada',
    'resolucao_gerada',
    'marco_declarado',
    'tregua_declarada',
    'tregua_recuperacao_declarada',
    // ...
  ]),
  payload: z.record(z.any()),
  ocorrido_em: z.string().datetime(),
  idempotency_key: z.string().uuid(),
  device_id: z.string(),
  app_version: z.string(),
});

// Sync request/response
export const SyncRequestSchema = z.object({
  events: z.array(DiaryEventSchema),
  last_sync_id: z.number().optional(),
});

export const SyncResponseSchema = z.object({
  events_received: z.number(),
  new_events: z.array(DiaryEventSchema),
  conflicts: z.array(z.string()),
});

// Entitlement
export const EntitlementSchema = z.object({
  pacote: z.string(),
  origem: z.enum(['iap_ios', 'iap_android', 'stripe']),
  valido_ate: z.string().datetime().nullable(),
});
```

---

### 3.4 `db-types`

**Gerado por:** Supabase CLI  
**Comando:**

```bash
supabase gen types typescript --local > packages/db-types/src/index.ts
```

**Atualização:** A cada mudança de migration.

---

## 4. Backend

### 4.1 Runtime

**Ferramenta:** Node.js 22 LTS  
**Justificativa:**

- LTS até abril 2026 (alinhado com timeline)
- Native fetch, test runner
- Performance adequada

**Alternativas consideradas:**

- ❌ Bun: muito novo, ecosistema imaturo
- ❌ Deno: boa opção, mas tooling menos maduro que Node

---

### 4.2 Framework

**Ferramenta:** NestJS v10  
**Adapter:** Fastify (não Express)  
**Justificativa (ADR-0003):**

- Estrutura modular (auth, sync, entitlements, lgpd)
- DI nativo
- Guards/pipes para validação consistente
- Familiaridade com arquitetura em camadas

**Alternativas consideradas:**

- ❌ Fastify puro: mais leve, mas sem convenções (exige impor estrutura manualmente)
- ❌ Express: lento comparado a Fastify

**Módulos:**

```
apps/api/src/
├── auth/           # Magic link via Supabase Auth
├── sync/           # Push/pull diary_events
├── entitlements/   # Valida recibo, grava entitlement
├── lgpd/           # deletion_requests
├── consent/        # consent_events
└── common/         # Guards, pipes, interceptors
```

---

### 4.3 Validação de Entrada

**Ferramenta:** nestjs-zod ou pipe custom  
**Integração com `@forja/schema`:**

```typescript
import { createZodDto } from 'nestjs-zod';
import { SyncRequestSchema } from '@forja/schema';

class SyncRequestDto extends createZodDto(SyncRequestSchema) {}

@Post('/sync')
async sync(@Body() dto: SyncRequestDto) {
  // dto já validado
}
```

---

### 4.4 Database Client

**Ferramenta:** @supabase/supabase-js v2  
**Uso:**

- Auth: Supabase Auth SDK
- Queries: PostgREST via SDK (respeita RLS)
- Admin: `service_role` key (bypass RLS)

**Alternativas consideradas:**

- ❌ Prisma: ORM complexo, RLS complicado
- ❌ TypeORM: menos maduro que Prisma
- ✅ Supabase SDK: RLS nativo, auth integrado

**Configuração:**

```typescript
// apps/api/src/supabase/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

export class SupabaseService {
  private client = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

  private adminClient = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // client → usa RLS (autenticado)
  // adminClient → bypass RLS (só para entitlements)
}
```

---

### 4.5 Database

**Ferramenta:** Supabase (PostgreSQL 16 gerenciado)  
**Justificativa (ADR-0006):**

- RLS nativo
- Auth gerenciado
- PostgREST automático
- Criptografia de disco
- Backup automático

**Alternativas consideradas:**

- ❌ PostgreSQL self-hosted: operacional complexo para solo
- ❌ MongoDB: não relacional, RLS inexistente
- ❌ Firebase: vendor lock-in, SQL superior para queries

**Local development:**

```bash
supabase start          # Inicia Postgres + Studio local
supabase db reset       # Aplica migrations
supabase db push        # Push para remoto
```

**Migrations:** SQL puro (não ORM), numeradas por timestamp.

---

## 5. Frontend Mobile

### 5.1 Framework

**Ferramenta:** Expo SDK 51+  
**Workflow:** Managed (não bare)  
**Justificativa:**

- Setup zero para iOS + Android
- OTA updates (EAS Update) para hotfix
- Expo Router (navegação file-based)
- Build cloud (EAS Build)

**Alternativas consideradas:**

- ❌ React Native bare: mais controle, mas setup complexo
- ❌ Flutter: Dart não compartilha lógica TS
- ❌ Kotlin Multiplatform: ecosistema menor

**Decisão de eject:** Só se necessário (push notifications nativas, background tasks avançados). Por ora, managed é suficiente.

---

### 5.2 Navegação

**Ferramenta:** Expo Router v3  
**Padrão:** File-based routing

```
apps/mobile/app/
├── (tabs)/
│   ├── index.tsx       # Home (Juramento)
│   ├── sessao.tsx      # Registrar sessão
│   ├── diario.tsx      # Histórico
│   └── ficha.tsx       # Ficha de personagem
├── resolucao/
│   └── [id].tsx        # Tela de resolução
└── _layout.tsx         # Root layout
```

---

### 5.3 Storage Local

**Ferramenta:** expo-sqlite  
**Justificativa (D-008, ADR-0002):**

- Offline-first
- Event store local
- Sync eventual com Postgres

**Schema local:**

```sql
CREATE TABLE diary_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  campaign_instance_id TEXT NOT NULL,
  tipo TEXT NOT NULL,
  payload TEXT NOT NULL,  -- JSON stringified
  ocorrido_em TEXT NOT NULL,
  idempotency_key TEXT NOT NULL UNIQUE,
  device_id TEXT NOT NULL,
  app_version TEXT NOT NULL,
  synced INTEGER DEFAULT 0  -- 0 = pending, 1 = synced
);
```

**Alternativas consideradas:**

- ❌ AsyncStorage: não relacional, sem queries
- ❌ WatermelonDB: ORM complexo, overkill
- ❌ Realm: vendor lock-in

---

### 5.4 State Management

**Ferramenta:** Zustand v4  
**Justificativa:**

- Leve (< 1KB)
- Sem boilerplate (vs Redux)
- TypeScript-first
- Hooks nativos

**Stores principais:**

```typescript
// apps/mobile/src/stores/campaign.ts
export const useCampaignStore = create<CampaignState>((set) => ({
  currentCampaign: null,
  ficha: null,
  setFicha: (ficha) => set({ ficha }),
  // ...
}));

// apps/mobile/src/stores/sync.ts
export const useSyncStore = create<SyncState>((set) => ({
  lastSyncAt: null,
  pendingEvents: 0,
  sync: async () => {
    /* ... */
  },
}));
```

**Alternativas consideradas:**

- ❌ Redux Toolkit: verboso demais
- ❌ MobX: magic demais
- ❌ Jotai/Recoil: atômico, mas overkill

---

### 5.5 Data Fetching

**Ferramenta:** TanStack Query (React Query) v5  
**Justificativa:**

- Cache inteligente
- Retry automático
- Offline support
- Invalidação declarativa

**Exemplo:**

```typescript
const { data: ficha } = useQuery({
  queryKey: ['ficha', campaignId],
  queryFn: () => calcularFicha(eventos),
  staleTime: 5 * 60 * 1000, // 5min
});
```

---

### 5.6 UI Components

**Ferramenta:** React Native Paper v5 (Material Design 3)  
**Justificativa:**

- Componentes prontos (Button, TextInput, Card)
- Tema personalizável
- Acessibilidade built-in
- Boa documentação

**Alternativas consideradas:**

- ❌ NativeBase: bundle maior
- ❌ UI Kitten: menos adoção
- ❌ Componentes custom: esforço alto

**Tema:**

```typescript
const theme = {
  ...MD3DarkTheme,
  colors: {
    primary: '#...',
    background: '#...',
    // Definir após design
  },
};
```

---

## 6. Frontend Web

### 6.1 Framework

**Ferramenta:** Next.js 14 (App Router)  
**Justificativa (ADR-0008):**

- React Native Web suportado
- SSR/SSG para SEO
- API routes para BFF (se necessário)
- Deploy Vercel trivial

**Alternativas consideradas:**

- ❌ Vite + React: sem SSR out-of-the-box
- ❌ Remix: menos maduro que Next

---

### 6.2 React Native Web

**Versão:** 0.19+  
**Justificativa (ADR-0008):**

- Compartilha ~90% componentes com mobile
- `react-native` → `react-native-web` alias

**Configuração Next.js:**

```javascript
// next.config.js
module.exports = {
  webpack: (config) => {
    config.resolve.alias = {
      'react-native$': 'react-native-web',
    };
    return config;
  },
};
```

**Divergências permitidas:**

- Navegação (Next router vs Expo router)
- Auth (cookie vs SecureStore)
- Layout responsivo (2 colunas desktop)

---

## 7. Tooling

### 7.1 Verificador de Conteúdo

**Linguagem:** Python 3.11+  
**Justificativa:**

- Script já existe (`docs/prd/verificar.py`)
- Pandas/NumPy para análise
- Portável (roda em CI)

**Dependências:**

```txt
# requirements.txt
pytest>=7.0
```

**Testes executados:**

- T-01 a T-08 (estáticos): IDs únicos, schemas válidos
- T-14, T-17 a T-21: predicados, closures
- T-23 a T-26: referências de texto
- T-28, T-29, T-33, T-34: regras de autoria

---

### 7.2 Simulador

**Linguagem:** TypeScript (roda via ts-node)  
**Justificativa:**

- Reutiliza `motor-narrativo` (mesmo código de produção)
- Types compartilhados

**Estrutura:**

```
tooling/simulador/
├── src/
│   ├── politicas.ts     # constante, erratico, especialista, pessimo, intermitente
│   ├── simulador.ts     # Simular(seed, n, policy)
│   └── reporter.ts      # vistos/escritos, histograms, nunca vistos
└── cli.ts               # pnpm simulate --policy constante --n 50
```

**Output:**

```
$ pnpm simulate --policy constante --n 50 --seed 42
Simulação concluída: 50 resoluções
- Storylets vistos: 18/26 (69%)
- Variantes vistas: 24/38 (63%)
- Nunca vistos: st_arco_sebastiao_retorno, ...
- Razão vistos/escritos: 0.21 ✅ (meta: 0.15-0.3)
- Distribuição por banda:
  - Espinha: 4 (8%)
  - Arco: 19 (38%) ✅ (meta: 25-45%)
  - Cor: 27 (54%)
```

---

### 7.3 Linter

**Ferramenta:** ESLint v8  
**Config:** `eslint-config-next` (para web), custom para packages

**Rules importantes:**

```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/explicit-function-return-type": "warn",
    "no-console": ["error", { "allow": ["warn", "error"] }]
  }
}
```

---

### 7.4 Formatter

**Ferramenta:** Prettier v3  
**Config:**

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 80,
  "tabWidth": 2
}
```

---

### 7.5 Testes

#### Unit/Integration Tests

**Ferramenta:** Vitest v1  
**Justificativa:**

- Compatível com Vite
- Mais rápido que Jest
- ESM nativo

**Usado em:** `motor-narrativo`, `dominio`, `schema`, `api`

#### BDD Tests

**Ferramenta:** Cucumber.js v10 ou Vitest + custom matcher  
**Features:** Gherkin em pt-BR

**Decisão:** Avaliar na Fase 8. Se Cucumber muito verboso, usar Vitest com helpers que parsam Gherkin.

#### E2E Tests (Mobile)

**Ferramenta:** Detox (não no MVP)  
**Justificativa:** Custo alto, adiar para v1.1

#### E2E Tests (Web)

**Ferramenta:** Playwright (não no MVP)  
**Justificativa:** Custo alto, adiar para v1.1

---

## 8. CI/CD

### 8.1 CI

**Ferramenta:** GitHub Actions  
**Workflows:** (já especificados em `docs/ci-cd/`)

**Runners:**

- Linux (ubuntu-latest) para API, packages, verificação
- macOS (macos-14) para build iOS (EAS Build, não local)
- Sem Windows (não necessário)

---

### 8.2 Deploy

#### API

**Plataforma:** Fly.io  
**Justificativa:**

- Deploy Node.js trivial
- Postgres próximo (Supabase)
- Free tier generoso
- Blue-green deploy

**Alternativas consideradas:**

- ❌ Heroku: caro
- ❌ Railway: menos maduro
- ❌ AWS ECS: complexo demais

#### Web

**Plataforma:** Vercel  
**Justificativa:**

- Next.js nativo
- Preview deployments automáticos
- CDN global
- Free tier para hobby

#### Mobile

**Plataforma:** EAS Build + EAS Submit  
**Justificativa:**

- Build cloud (sem necessidade de Mac/Xcode local)
- Submit automático para lojas
- OTA updates (EAS Update)

---

### 8.3 Secrets Management

**Ferramenta:** GitHub Secrets (repository + environment)  
**Ambientes:**

- `staging`: auto-deploy, sem gate
- `producao`: gate manual
- `mobile-lojas`: gate manual
- `kill-switch`: gate manual

**Secrets:**

```
# Repository secrets
SUPABASE_ACCESS_TOKEN
VERCEL_TOKEN
FLY_API_TOKEN
EXPO_TOKEN

# Environment secrets (staging/producao)
SUPABASE_URL_STAGING
SUPABASE_SERVICE_ROLE_KEY_STAGING
SUPABASE_URL_PRODUCAO
SUPABASE_SERVICE_ROLE_KEY_PRODUCAO
CLOUDFLARE_API_TOKEN  # para kill-switch
```

---

## 9. Monitoramento

### 9.1 Logs

**Ferramenta:** Console logs estruturados (JSON)  
**Agregação:** Fly.io logs (staging), Datadog free tier (produção)

**Estrutura:**

```json
{
  "level": "info",
  "timestamp": "2026-07-26T10:00:00Z",
  "message": "sync_completed",
  "user_id": "uuid",
  "events_synced": 5,
  "duration_ms": 123
}
```

---

### 9.2 Error Tracking

**Ferramenta:** Sentry  
**Planos:**

- Dev: free tier
- Produção: avaliar custo após lançamento

**Integração:**

- Mobile: `@sentry/react-native`
- Web: `@sentry/nextjs`
- API: `@sentry/node`

**Scrubbing:** Nunca enviar `payload` de `diary_events` (dado de saúde).

---

### 9.3 Analytics

**MVP:** Nenhum analytics de uso  
**Justificativa (RC-003):**

- Sem SDK de terceiros (exfiltração)
- Plausible Analytics (privacy-first) para web em v1.1
- Mobile: telemetria própria agregada (sem user_id)

---

## 10. Desenvolvimento Local

### 10.1 Requisitos

**Obrigatório:**

- Node.js 22
- pnpm 8
- Git
- VSCode (ou editor com TypeScript LSP)

**Opcional (para mobile):**

- Xcode 15+ (macOS, para iOS)
- Android Studio (para Android)
- Expo Go app (para testes rápidos)

---

### 10.2 Setup Inicial

```bash
# Clone
git clone https://github.com/user/forja.git
cd forja

# Install
pnpm install

# Database local
supabase start
supabase db reset

# Gerar types
pnpm gen:types

# Dev
pnpm dev
```

**`pnpm dev` inicia:**

- Supabase Studio: http://localhost:54323
- API: http://localhost:3001
- Web: http://localhost:3000
- Mobile: Expo DevTools

---

### 10.3 Comandos Úteis

```bash
# Build tudo
pnpm build

# Test tudo
pnpm test

# Lint + typecheck
pnpm lint
pnpm typecheck

# Verificação de conteúdo
pnpm verify:content

# Simulador
pnpm simulate --policy constante --n 50

# Database
pnpm db:reset
pnpm db:push
pnpm db:pull
```

---

## 11. Decisões Pendentes

### 11.1 BDD Runner

**Opções:** Cucumber.js vs Vitest + custom  
**Decidir em:** Fase 8  
**Critério:** Verbosity vs readability

### 11.2 Mobile E2E

**Opções:** Detox vs Maestro vs manual  
**Decidir em:** Pós-MVP  
**Critério:** Custo vs cobertura

### 11.3 Web Analytics

**Opções:** Plausible vs PostHog vs custom  
**Decidir em:** Pós-MVP  
**Critério:** Privacy vs features

---

## 12. Versionamento

### 12.1 Packages Internos

**Estratégia:** `workspace:*` (sempre última versão local)  
**Versioning:** Não publicados no npm, sem semver rígido

### 12.2 Apps

**Mobile:** semver (1.0.0, 1.0.1, ...)  
**Web:** commit SHA (deploy contínuo)  
**API:** commit SHA (deploy contínuo)

---

## 13. Conformidade com ADRs

| ADR      | Decisão                 | Implementação                   |
| -------- | ----------------------- | ------------------------------- |
| ADR-0001 | Monorepo                | pnpm + Turborepo                |
| ADR-0002 | Event sourcing          | SQLite local + Postgres remoto  |
| ADR-0003 | NestJS                  | API framework                   |
| ADR-0004 | Kill-switch fora da API | Cloudflare Workers (não no MVP) |
| ADR-0005 | Entitlements            | Tabela `entitlements`           |
| ADR-0006 | Postgres + RLS          | Supabase                        |
| ADR-0007 | Hosting baixo custo     | Fly.io + Vercel                 |
| ADR-0008 | RN Web                  | Next.js + RN Web                |
| ADR-0009 | Zod                     | Package `@forja/schema`         |
| ADR-0010 | Verificador Python      | `tooling/verificador/`          |

---

**Última atualização:** 26/07/2026  
**Próxima revisão:** Após Fase 1 (validar ferramentas na prática)
