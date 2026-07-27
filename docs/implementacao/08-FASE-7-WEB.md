# Fase 7: Web App — FORJA

**Duração:** 1 semana  
**Dependências:** Fase 6 (Mobile)  
**Objetivo:** Next.js + RN Web, 90% reaproveitamento

---

## AI Agent Context

**Artefatos entrada:**

- `apps/mobile/src/components/` (RN components)
- `apps/mobile/src/screens/` (RN screens)
- ADR-0008 (RN Web strategy)

**Artefatos saída:**

```
apps/web/
├── app/
│   ├── page.tsx              # Home (Next.js App Router)
│   ├── juramento/page.tsx
│   ├── sessao/page.tsx
│   └── layout.tsx
├── src/
│   ├── components/           # Reaproveitados de mobile
│   └── styles/
│       └── responsive.css    # Desktop 2-col layout
├── next.config.js            # RN Web alias
└── package.json
```

**Comandos verificação:**

```bash
cd apps/web
pnpm dev              # http://localhost:3000
pnpm build            # Build produção
```

---

## Tarefas

### Tarefa 7.1: Setup Next.js + RN Web

**Agente:** `bash`

```bash
npx create-next-app@latest apps/web --typescript --app --no-tailwind
cd apps/web
pnpm add react-native-web @forja/motor-narrativo @forja/dominio
```

**Config:** `next.config.js`

```javascript
const withRNWeb = require('next-transpile-modules')(['react-native-web']);
module.exports = withRNWeb({
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-native$': 'react-native-web',
    };
    return config;
  },
});
```

**Verificação:** `pnpm dev` inicia sem erros.

---

### Tarefa 7.2: Reaproveitar Componentes

**Agente:** `bash`
**Symlink ou workspace ref:**

```bash
# Em apps/web/package.json
"dependencies": {
  "@forja/ui-primitives": "workspace:*"
}
```

**Mover:** `apps/mobile/src/components/ui/` → `packages/ui-primitives/`
**Adaptar:** Navegação (Next Router vs Expo Router)
**Verificação:** Componentes renderizam em web.

---

### Tarefa 7.3: Navegação Adaptada

**Agente:** `write`
**Arquivo:** `app/layout.tsx`

```tsx
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <nav>
          <Link href="/">Home</Link>
          <Link href="/juramento">Juramento</Link>
          <Link href="/sessao">Sessão</Link>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

**Verificação:** Navegação funciona.

---

### Tarefa 7.4: Layout Responsivo

**Agente:** `write`
**Arquivo:** `src/styles/responsive.css`

```css
@media (min-width: 768px) {
  .container {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  }

  .sidebar {
    position: sticky;
    top: 0;
    height: 100vh;
  }
}
```

**Verificação:** Desktop mostra sidebar + conteúdo.

---

### Tarefa 7.5: Deploy Vercel

**Agente:** `bash`

```bash
vercel --prod
```

**Env vars:** `NEXT_PUBLIC_API_URL`
**Verificação:** `https://forja.vercel.app` funcional.

---

## Critérios Gate

- [ ] 90% componentes reaproveitados
- [ ] Navegação Next Router funcional
- [ ] Layout responsivo (mobile + desktop)
- [ ] Deploy Vercel staging
- [ ] Tag `fase-7-completa`

**Próxima fase:** Fase 8 (Suíte BDD) — 1.5 semanas
