## Purpose

Healthcheck do deploy da API, usado por orquestradores (Fly.io) para detectar disponibilidade.

## Requirements

### Requirement: Healthcheck público
A API SHALL expor `GET /health` sem exigir autenticação, retornando 200 quando o processo está no ar e consegue alcançar o Postgres configurado.

#### Scenario: API e banco disponíveis
- **WHEN** `GET /health` é chamado com a API rodando e o Postgres acessível
- **THEN** a API retorna 200 com um corpo indicando status ok

#### Scenario: Banco indisponível
- **WHEN** `GET /health` é chamado mas a conexão com o Postgres falha
- **THEN** a API retorna um status de erro (503) em vez de 200, permitindo que o orquestrador de deploy detecte a falha
