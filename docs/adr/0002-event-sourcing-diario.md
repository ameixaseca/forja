# ADR-0002: Event sourcing para o diário e sincronização

- **Status:** Aceita
- **Contexto:** O app precisa funcionar integralmente offline (D-008, RF-014) e sincronizar quando há conta e conexão (RF-015), sem servidor de jogo (§11.1) e sem propor uma solução de sincronização complexa que fuja do orçamento de engenharia de um projeto solo (R-002). O diário é, por natureza, um registro histórico imutável (RF-026, RF-033 grava a versão do app em cada entrada).
- **Decisão:** Modelar o diário como um log de eventos append-only tanto no cliente (SQLite local) quanto no servidor (tabela `diary_events` no Postgres). O estado da ficha (atributos, Fôlego, Vontade) é sempre uma projeção recalculada a partir dos eventos pelo pacote `dominio` — nunca uma fonte de verdade própria. A sincronização é só push/pull de eventos, deduplicados por `idempotency_key` gerado no cliente.
- **Consequências:**
  - Positivas: elimina a necessidade de merge de estado ou CRDT — não há "conflito" de sincronização possível, só eventos que ainda não chegaram; auditoria e replay de campanha ficam de graça; troca de dispositivo é trivial (replay do log reconstrói a ficha).
  - Negativas: exige disciplina para nunca escrever estado mutável diretamente; queries que dependem do estado atual (ex.: "ficha atual") exigem uma view materializada, recalculada ou cacheada, para não recomputar o replay inteiro a cada leitura.
- **Alternativas consideradas:**
  - Sincronização de estado mutável com last-write-wins — descartada porque múltiplos dispositivos do mesmo usuário perderiam Marcos ou ciclos silenciosamente.
  - CRDT (Automerge/Yjs) — descartada por complexidade desproporcional: o app é single-player (D-001), então não há edição concorrente real, só dispositivos assíncronos do mesmo usuário.
- **Referências:** D-008, RF-014, RF-015, RF-026, RF-033, D-001.
