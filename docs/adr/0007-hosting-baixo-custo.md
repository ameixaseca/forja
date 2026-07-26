# ADR-0007: Hosting de baixo custo, sem orquestração de contêineres

- **Status:** Aceita
- **Contexto:** O PRD trata explicitamente "algumas centenas de usuários ativos, autofinanciado, cobrindo o próprio custo de operação" como desfecho aceitável (§11.2), e lista como risco crítico o esforço de engenharia gasto além do necessário em um projeto de dev solo com produtos concorrendo por tempo (R-002). §11.1 estima o custo de operação em "algumas centenas de reais por mês".
- **Decisão:** Hospedar a API como contêiner único em uma plataforma gerenciada de baixo custo com autoscale-to-baixo (ex.: Fly.io, Railway ou Render), o banco em Postgres gerenciado com scale-to-zero quando ocioso (ex.: Neon ou Supabase), o app web em uma plataforma com deploy de Next.js nativo (ex.: Vercel), e o kill-switch em CDN/object storage dedicado (ex.: Cloudflare R2). Evitar Kubernetes, filas de mensagens e multi-região neste estágio.
- **Consequências:**
  - Positivas: custo previsível e baixo, alinhado à Pergunta 1 de §11.1; operação sustentável por uma única pessoa; menos superfície operacional para monitorar.
  - Negativas: menor controle fino sobre infraestrutura; migração para uma arquitetura mais elaborada, se o produto crescer muito além da escala prevista, exigirá revisão desta decisão.
- **Alternativas consideradas:**
  - Kubernetes (EKS/GKE) — descartada por complexidade e custo fixo incompatíveis com a escala e o modelo de autofinanciamento do produto.
  - Servidor único auto-gerenciado (VPS) — mantida como alternativa aceitável, mas com mais responsabilidade operacional manual (patches, backups) do que uma plataforma gerenciada equivalente em custo.
- **Referências:** §11.1, §11.2, R-002, D-028.
