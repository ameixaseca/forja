# ADR-0009: Zod como contrato de schema compartilhado cliente↔API

- **Status:** Aceita
- **Contexto:** O diário é sincronizado como eventos estruturados (ADR-0002), e tanto o cliente quanto a API precisam concordar exatamente sobre a forma desses eventos, do payload de entitlement e das respostas de erro, sem depender de documentação solta que se desalinha do código.
- **Decisão:** Definir todos os schemas de payload trocados entre cliente e API em `packages/schema`, usando Zod, e reutilizar esse pacote tanto na validação de entrada da API (via `nestjs-zod` ou pipe equivalente) quanto na validação de saída do cliente antes de enviar ao outbox.
- **Consequências:**
  - Positivas: um schema alterado quebra a build dos dois lados imediatamente (TypeScript), em vez de falhar silenciosamente em produção; validação de entrada da API fica gratuita a partir do mesmo schema.
  - Negativas: acopla a evolução do contrato à disciplina de versionamento do monorepo — mudanças de schema exigem cuidado com compatibilidade retroativa para clientes que ainda não atualizaram (RF-034: atualização não pode corromper campanha em andamento, mesma disciplina se estende ao contrato de sync).
- **Alternativas consideradas:**
  - OpenAPI gerado a partir da API, consumido pelo cliente — descartada por inverter a fonte de verdade (o cliente TypeScript já tem tipos nativos; gerar API a partir de tipos é mais direto que gerar tipos a partir de uma spec HTTP).
- **Referências:** RF-034, ADR-0002.
