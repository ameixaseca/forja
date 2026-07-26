# C4 — Nível 3: Componentes — API Backend

```mermaid
C4Component
title Diagrama de Componentes — API Backend (NestJS)

Container_Boundary(api, "API Backend") {
  Component(authMod, "AuthModule", "Módulo NestJS", "Conta opcional via magic link (RF-090); emissão/rotação de JWT")
  Component(syncMod, "SyncModule", "Módulo NestJS", "Recebe eventos do outbox do cliente por idempotency_key; serve pull incremental por cursor (RF-015)")
  Component(entMod, "EntitlementsModule", "Módulo NestJS", "Valida recibo de compra e materializa {pacote, origem, validoAte} (RF-110-113, D-029)")
  Component(lgpdMod, "LgpdModule", "Módulo NestJS", "Exportação integral (RF-091/027) e exclusão de conta/dados em até 15 dias (RF-092)")
  Component(consentMod, "ConsentModule", "Módulo NestJS", "Registro de consentimento granular e versionado (RC-001)")
  Component(guards, "Guards e pipes", "NestJS Guards/Pipes", "AuthGuard (JWT), ValidationPipe (Zod/nestjs-zod), rate limiting")
  Component(repo, "Camada de repositório", "Prisma", "Acesso a dados com Row-Level Security por usuário")
}

ContainerDb(db, "PostgreSQL", "Banco de dados")
System_Ext(lojas, "App Store / Play / Stripe")
System_Ext(email, "Provedor de e-mail")

Rel(guards, authMod, "protege")
Rel(guards, syncMod, "protege")
Rel(guards, entMod, "protege")
Rel(guards, lgpdMod, "protege")
Rel(authMod, repo, "lê/escreve usuários e sessões")
Rel(syncMod, repo, "lê/escreve diary_events")
Rel(entMod, repo, "lê/escreve entitlements e purchase_receipts")
Rel(entMod, lojas, "valida recibo", "HTTPS")
Rel(lgpdMod, repo, "lê, anonimiza e exclui dados")
Rel(consentMod, repo, "lê/escreve consents")
Rel(authMod, email, "envia magic link", "HTTPS")
Rel(repo, db, "SQL parametrizado")
```

## Decisões relevantes deste nível

- ADR-0002 (event sourcing) explica por que o `SyncModule` só faz append, nunca merge.
- ADR-0006 explica o uso de Row-Level Security na camada de repositório.
- ADR-0009 explica o uso de Zod como contrato compartilhado validado pelos guards/pipes.
