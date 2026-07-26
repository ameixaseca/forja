# Fase 5: API Backend — FORJA

**Duração:** 1.5 semanas  
**Dependências:** Fase 1 (DB), Fase 3 (schemas)  
**Objetivo:** NestJS API com sync, entitlements, LGPD

---

## AI Agent Context

**Artefatos entrada:**
- `docs/database/migrations/*.sql` (12 migrações)
- `packages/schema/` (Zod schemas)
- ADR-0003 (NestJS + Fastify)
- ADR-0006 (RLS Postgres)

**Artefatos saída:**
```
apps/api/
├── src/
│   ├── modules/
│   │   ├── auth/             # Magic link Supabase
│   │   ├── sync/             # Push/pull diary_events
│   │   ├── entitlements/     # Validação compras
│   │   ├── lgpd/             # Consent, deletion
│   │   └── health/           # Healthcheck
│   ├── pipes/                # Zod validation pipe
│   ├── guards/               # Auth guard
│   └── main.ts
├── tests/
│   └── e2e/
│       ├── sync.e2e.test.ts
│       └── entitlements.e2e.test.ts
└── package.json
```

**Comandos verificação:**
```bash
cd apps/api
pnpm dev                  # Roda local
pnpm test:e2e             # Testes integração
curl http://localhost:3000/health  # Healthcheck
```

---

## Tarefas

### Tarefa 5.1: Setup NestJS
**Agente:** `bash`
```bash
npx @nestjs/cli new apps/api --package-manager pnpm
cd apps/api
pnpm add @nestjs/platform-fastify @supabase/supabase-js zod
pnpm add -D @nestjs/testing supertest
```
**Config:** `main.ts` usa Fastify adapter
**Verificação:** `pnpm dev` inicia.

---

### Tarefa 5.2: Módulo Sync
**Agente:** `write`
**Endpoint:** `POST /sync`
**Request:**
```json
{
  "last_sync": "2026-01-01T00:00:00Z",
  "events_to_push": [
    { "id": "uuid", "tipo": "sessao_registrada", "timestamp": "...", "payload": {...} }
  ]
}
```
**Response:**
```json
{
  "events_to_pull": [
    { "id": "uuid", "tipo": "ciclo_encerrado", "timestamp": "...", "payload": {...} }
  ],
  "new_sync_token": "2026-01-02T12:00:00Z"
}
```
**Lógica:**
1. Validar request com Zod pipe
2. Inserir `events_to_push` em `diary_events` (RLS garante user_id)
3. Buscar eventos server > last_sync
4. Retornar eventos + token novo
**Teste:** `tests/e2e/sync.e2e.test.ts` — push 2 eventos, pull 1
**Verificação:** Passa.

---

### Tarefa 5.3: Módulo Entitlements
**Agente:** `write`
**Endpoint:** `POST /entitlements/validate`
**Request:**
```json
{
  "platform": "ios",
  "receipt": "base64..."
}
```
**Response:**
```json
{
  "valid": true,
  "product_id": "forja_campaign_espinha",
  "expires_at": null
}
```
**Lógica:**
1. Validar receipt via Apple/Google API
2. Inserir em `entitlements` (service_role, bypassa RLS)
3. Retornar validade
**Teste:** Mock Apple/Google API
**Verificação:** Passa.

---

### Tarefa 5.4: Módulo LGPD
**Agente:** `write`
**Endpoints:**
- `POST /consent` — registra consent_events
- `POST /deletion-request` — cria deletion_requests
- `GET /data-export` — exporta diary_events como JSON
**Teste:** `tests/e2e/lgpd.e2e.test.ts`
**Verificação:** Passa.

---

### Tarefa 5.5: Deploy Staging
**Agente:** `bash`
**Fly.io:**
```bash
fly launch --name forja-api-staging
fly deploy
```
**Env vars:** `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
**Verificação:** `curl https://forja-api-staging.fly.dev/health` retorna 200.

---

## Critérios Gate

- [ ] Sync push/pull funcional
- [ ] Entitlements valida receipts
- [ ] LGPD endpoints implementados
- [ ] RLS validado (user não vê dados alheios)
- [ ] Testes e2e passando
- [ ] Deploy staging funcional
- [ ] Tag `fase-5-completa`

**Próxima fase:** Fase 6 (Mobile MVP) — 2.5 semanas
