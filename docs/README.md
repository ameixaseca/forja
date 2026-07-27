# Documentação de Arquitetura — FORJA

Este pacote documenta a arquitetura do FORJA (app de treino estruturado como RPG solo) usando dois padrões complementares:

- **C4 Model** (`c4/`) — visão estrutural do sistema, do contexto até os componentes internos dos contêineres mais relevantes.
- **ADR — Architecture Decision Records** (`adr/`) — o racional por trás de cada decisão técnica relevante, no mesmo espírito do `decisoes.md` do PRD (racional, alternativa descartada, gatilho de reabertura).

## Como ler

1. Comece pelo Nível 1 (Contexto) e desça até o nível de detalhe que precisar.
2. Cada decisão arquitetural relevante nos diagramas tem um ADR correspondente linkado.
3. Os diagramas usam sintaxe Mermaid C4 (`C4Context`, `C4Container`, `C4Component`) — renderizam nativamente em GitHub, GitLab, Obsidian e na maioria dos visualizadores de Markdown modernos.

## Escopo e premissas herdadas do PRD

Esta arquitetura assume as decisões travadas do PRD-Forja v0.14 como restrições de design, não como preferências de engenharia — em especial D-001 (single-player), D-002 (sem LLM em runtime), D-008 (offline-first), D-031 (campanha = release), D-033 (motor narrativo desacoplado) e D-036 (catálogo JSON embutido). A extensão para uma versão web completa (cliente jogável, não apenas portal) foi uma decisão explícita de produto tomada nesta rodada de arquitetura — ver ADR-0001 e ADR-0008.

## Índice

### C4

- [01 — Contexto do sistema](c4/01-contexto.md)
- [02 — Contêineres](c4/02-conteineres.md)
- [03 — Componentes: API Backend](c4/03-componentes-api.md)
- [04 — Componentes: Pacote compartilhado (motor narrativo)](c4/04-componentes-motor.md)

### ADR

- [ADR-0001 — Monorepo com pacote compartilhado para o motor narrativo](adr/0001-monorepo-pacote-compartilhado.md)
- [ADR-0002 — Event sourcing para o diário e sincronização](adr/0002-event-sourcing-diario.md)
- [ADR-0003 — NestJS sobre Fastify para a API](adr/0003-nestjs-api.md)
- [ADR-0004 — Kill-switch servido fora da API, em infraestrutura estática isolada](adr/0004-kill-switch-fora-da-api.md)
- [ADR-0005 — Direito de acesso multiplataforma via conta + reconciliação de recibos](adr/0005-entitlements-multiplataforma.md)
- [ADR-0006 — PostgreSQL gerenciado com RLS e criptografia de campo](adr/0006-postgres-rls-criptografia.md)
- [ADR-0007 — Hosting de baixo custo, sem orquestração de contêineres](adr/0007-hosting-baixo-custo.md)
- [ADR-0008 — React Native Web para reaproveitar UI entre mobile e web](adr/0008-react-native-web.md)
- [ADR-0009 — Zod como contrato de schema compartilhado cliente↔API](adr/0009-zod-contrato-compartilhado.md)
- [ADR-0010 — Verificador de conteúdo em Python mantido fora do runtime do motor](adr/0010-verificador-python-fora-do-runtime.md)
