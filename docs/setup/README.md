# Setup — FORJA

Instruções configuração ambiente desenvolvimento.

---

## Requisitos

- **Node.js:** 20+
- **pnpm:** 8+ (instalar: `npm install -g pnpm@8`)
- **Git:** qualquer versão recente
- **GitHub CLI:** `gh` (opcional, para criar issues/PRs)

---

## Instalação

```bash
# Clone repo
git clone https://github.com/ameixaseca/forja.git
cd forja

# Instalar dependências
pnpm install

# Verificar setup
pnpm build      # Compila todos packages
pnpm typecheck  # Verifica tipos
pnpm test       # Roda testes
pnpm format     # Formata código (Prettier)
```

---

## Estrutura Monorepo

```
forja/
├── packages/
│   ├── motor-narrativo/    # Motor narrativo (TypeScript puro, zero deps)
│   ├── dominio/             # Regras domínio (Juramento, Ciclo, Fôlego)
│   ├── config-typescript/   # Shared tsconfig
│   └── config-eslint/       # Shared ESLint (pendente resolução workspace)
├── apps/                    # (Fase 3+) Mobile, Web, API
├── content/                 # (Fase 4+) Catálogo storylets JSON
├── docs/
│   ├── implementacao/       # Plano fases + decisões
│   ├── prd/                 # PRD + ESPEC
│   ├── adr/                 # Architecture Decision Records
│   └── setup/               # Este documento
└── turbo.json               # Turborepo config
```

---

## Scripts Disponíveis

### Root

```bash
pnpm build        # Turborepo build all packages
pnpm typecheck    # TSC all packages
pnpm test         # Vitest all packages
pnpm format       # Prettier write
pnpm format:check # Prettier check (CI)
pnpm lint         # ESLint (pendente DI-012)
```

### Package-specific

```bash
pnpm --filter @forja/motor-narrativo build
pnpm --filter @forja/dominio test
```

---

## Troubleshooting

### `pnpm install` lento

**Causa:** Cache pnpm vazio primeira vez.  
**Solução:** Normal, subsequente instalações rápidas.

### `pnpm lint` falha com "config not found"

**Causa:** DI-012, ESLint workspace resolution pendente Fase 2.  
**Workaround:** Usar Prettier + TypeScript (`pnpm format && pnpm typecheck`).

### Turborepo cache não funciona

**Causa:** Provável `.turbo/` não persistente ou inputs variáveis.  
**Solução:** Verificar `.gitignore` inclui `.turbo/`, rodar `pnpm build` duas vezes consecutivas sem mudanças.

---

## CI/CD

**GitHub Actions:** `.github/workflows/ci.yml`

- ✅ `typecheck` job
- ✅ `test` job
- ✅ `format` job (check mode)
- ❌ `lint` job (pendente DI-012)

Rodado em: push `main`, PRs.

---

## Próximas Fases

- **Fase 2:** Motor narrativo completo (RF-036, 9 tarefas M-01 a M-09)
- **Fase 3:** API NestJS + Supabase
- **Fase 6:** Mobile Expo RN
- **Fase 7:** Web Next.js + RN Web

Ver `docs/implementacao/` para detalhes.

---

**Atualizado:** 26/07/2026 (Fase 1 completa)
