# ADR-0004: Kill-switch servido fora da API, em infraestrutura estática isolada

- **Status:** Aceita
- **Contexto:** RF-038/039/039A exigem que a busca da lista de storylets desativados aconteça sem identificador de usuário ou dispositivo, sem parâmetro de consulta e sem telemetria, com retenção de log e de IP desabilitadas na distribuição (RC-009, DEC-024). Servir esse arquivo a partir da mesma API autenticada que processa conta, sync e compras cria risco real de que um middleware de log genérico capture IP ou correlação de usuário por acidente.
- **Decisão:** Distribuir a lista de kill-switch como um arquivo JSON estático num CDN/objeto de armazenamento contratado separadamente, sem qualquer middleware de autenticação, sessão ou logging de aplicação anexado. O cliente busca esse arquivo direto do CDN, nunca via API.
- **Consequências:**
  - Positivas: a garantia de "sem log, sem IP retido" vira uma propriedade de infraestrutura, não uma promessa de código — auditável no contrato do provedor, não em uma revisão de código; reduz a superfície de ataque da API (um endpoint autenticado a menos).
  - Negativas: mais um serviço/infra para provisionar e monitorar separadamente (ainda que trivial em custo).
- **Alternativas consideradas:**
  - Endpoint dedicado na própria API com logging desabilitado seletivamente — descartada por depender de disciplina de configuração dentro de um serviço que já tem logging habilitado por padrão para outros endpoints, aumentando o risco de vazamento por erro de configuração.
- **Referências:** RF-038, RF-039, RF-039A, RC-009, DEC-024.
