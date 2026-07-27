# C4 — Nível 3: Componentes — API Backend

```mermaid
C4Component
title Diagrama de Componentes — API Backend (NestJS)

Container_Boundary(api, "API Backend") {
  Component(authGuard, "AuthGuard", "NestJS Guard", "Valida o JWT do Supabase Auth (magic link, RF-090); a API não emite/rotaciona JWT próprio")
  Component(entMod, "EntitlementsModule", "Módulo NestJS", "Valida recibo de compra e materializa {pacote, origem, validoAte} (RF-110-113, D-029)")
  Component(lgpdMod, "LgpdModule", "Módulo NestJS", "Exportação integral (RF-091) e exclusão de conta/dados em até 15 dias (RF-092)")
  Component(healthMod, "HealthModule", "Módulo NestJS", "Healthcheck de deploy")
  Component(guards, "Guards e pipes", "NestJS Guards/Pipes", "AuthGuard (JWT Supabase), ValidationPipe (Zod/nestjs-zod), rate limiting")
  Component(svcRole, "Cliente service_role", "@supabase/supabase-js", "Único caminho de escrita em entitlements/purchase_receipts; leitura ampla para export LGPD, bypassa RLS")
}

ContainerDb(db, "PostgreSQL", "Banco de dados (RLS por user_id)")
System_Ext(lojas, "App Store / Play / Stripe")
System_Ext(supabaseAuth, "Supabase Auth")

Rel(guards, entMod, "protege")
Rel(guards, lgpdMod, "protege")
Rel(authGuard, supabaseAuth, "valida JWT (JWKS)", "HTTPS")
Rel(entMod, svcRole, "grava entitlements/purchase_receipts")
Rel(entMod, lojas, "valida recibo", "HTTPS")
Rel(lgpdMod, svcRole, "lê, anonimiza e exclui dados")
Rel(svcRole, db, "service_role, bypassa RLS")
```

## Decisões relevantes deste nível

- ADR-0011: a API não implementa `SyncModule` nem `ConsentModule` — `diary_events` e `consent_events` são gravados pelo cliente direto via Supabase SDK, protegidos por RLS (`auth.uid()`), conforme os GRANTs de `20260726121100_grants_defesa_em_profundidade.sql`. A API só cobre módulos que exigem `service_role` ou lógica de servidor.
- ADR-0002 (event sourcing) explica por que a escrita de eventos é só append, nunca merge — válido independente de estar na API ou no cliente.
- ADR-0006 explica o uso de Row-Level Security; a API usa `service_role` deliberadamente só onde a RLS não pode se aplicar (ex.: agregar entitlements de todas as origens, ADR-0005).
- ADR-0009 explica o uso de Zod como contrato compartilhado validado pelos guards/pipes.
