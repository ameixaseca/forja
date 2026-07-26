# C4 — Nível 2: Diagrama de Contêineres

```mermaid
C4Container
title Diagrama de Contêineres — FORJA

Person(usuario, "Usuário")

System_Boundary(forja, "FORJA") {
  Container(mobile, "App Mobile", "Expo / React Native", "Interface de jogo e registro de treino. Funciona 100% offline (D-008, RF-014)")
  Container(web, "App Web", "Next.js + React Native Web", "Interface de jogo responsiva no navegador, mesma jogabilidade do mobile")
  Container(pacote, "Pacote compartilhado", "TypeScript (biblioteca embutida, não é serviço)", "Motor narrativo — função pura estado+entradas+índice→resolução (RF-035/036) — e regras de domínio (Vontade, Fôlego, Marcos)")
  Container(api, "API Backend", "Node.js 20 / NestJS", "Conta, sincronização do diário, direito de acesso, direitos LGPD")
  ContainerDb(db, "Banco de dados", "PostgreSQL 16", "Event store do diário, entitlements, consentimentos, recibos de compra")
}

System_Ext(cdn, "CDN de kill-switch", "Arquivo estático, infraestrutura isolada, sem log nem IP retidos")
System_Ext(lojas, "App Store / Play / Stripe", "Compras e recibos")
System_Ext(email, "Provedor de e-mail", "Magic link")

Rel(usuario, mobile, "Usa", "iOS / Android")
Rel(usuario, web, "Usa", "HTTPS")
Rel(mobile, pacote, "Importa e embute no bundle")
Rel(web, pacote, "Importa e embute no bundle")
Rel(mobile, api, "Sincroniza eventos do diário, valida entitlement", "HTTPS/JSON, contrato Zod")
Rel(web, api, "Sincroniza eventos do diário, valida entitlement", "HTTPS/JSON, contrato Zod")
Rel(mobile, cdn, "Busca lista de ids desativados a cada 24h±jitter", "HTTPS, sem identificador (RF-039A)")
Rel(web, cdn, "Busca lista de ids desativados a cada 24h±jitter", "HTTPS, sem identificador (RF-039A)")
Rel(api, db, "Lê e escreve", "SQL, via camada de repositório com RLS")
Rel(api, lojas, "Valida recibo de compra", "HTTPS")
Rel(api, email, "Envia magic link", "API HTTP")
```

## Notas de leitura

- O **pacote compartilhado** não é um contêiner implantável no sentido estrito do C4 (não roda como processo isolado) — está listado aqui porque é uma unidade arquitetural de primeira importância: é ele que garante que RF-036 (função pura, sem I/O) se comporte identicamente nos dois clientes. Ver ADR-0001.
- O contêiner **CDN de kill-switch** é desenhado deliberadamente fora do perímetro do FORJA-como-sistema-autenticado — ele nunca deve ter acesso a `user_id`, sessão ou log de aplicação. Ver ADR-0004.
- A **API Backend** não participa da jogabilidade em nenhum momento — RF-020 a RF-025 (seleção e resolução de storylet) rodam inteiramente no pacote compartilhado, no dispositivo do usuário.
