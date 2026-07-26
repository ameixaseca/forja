# ADR-0003: NestJS (sobre Fastify) para a API

- **Status:** Aceita
- **Contexto:** A API é deliberadamente pequena (conta, sincronização, entitlements, LGPD) mas precisa ser mantida por um desenvolvedor solo por um longo período, com boa parte da complexidade concentrada em conformidade (LGPD) e em fluxos externos sensíveis (validação de recibo de compra).
- **Decisão:** Usar NestJS como framework da API, com Fastify como adapter HTTP subjacente (em vez de Express) por desempenho. NestJS traz módulos, injeção de dependência e guards que impõem estrutura sem exigir um framework próprio.
- **Consequências:**
  - Positivas: estrutura modular natural para os cinco módulos do sistema (auth, sync, entitlements, lgpd, consent); guards e pipes tornam a validação de entrada (Zod) e a autorização por usuário consistentes em toda a API; curva de familiaridade menor para quem vem de arquitetura em camadas/DI de outros ecossistemas.
  - Negativas: overhead de boilerplate (decorators, providers) maior que um framework minimalista como Fastify puro ou Hono, para uma API deste porte.
- **Alternativas consideradas:**
  - Fastify puro — mais leve, mas exige impor a própria convenção de módulos/DI à mão; descartado por preferir estrutura pronta dado o volume de conformidade a manter.
  - GraphQL (Apollo/Yoga) — descartado: domínio pequeno e majoritariamente de escrita (eventos) não se beneficia de um grafo de consulta; REST simples é suficiente e mais fácil de auditar para LGPD.
- **Referências:** §11.1 (sem servidor de jogo), R-002.
