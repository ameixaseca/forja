## ADDED Requirements

### Requirement: Persistência local de eventos do diário
O app SHALL gravar todo evento de diário (`juramento_declarado`, `sessao_registrada`, `tregua_declarada`, `tregua_recuperacao_declarada`, `deload_declarado`, `marco_declarado`, `ciclo_encerrado`) em SQLite local antes de qualquer tentativa de sincronização, incluindo `id_local`, `campaign_instance_id`, `tipo`, `payload`, `device_id`, `idempotency_key` (gerada no client), `app_version`, `ocorrido_em` e `synced_at` (inicialmente nulo).

#### Scenario: Evento gravado sem rede
- **WHEN** o app está sem conectividade e uma sessão é registrada
- **THEN** o evento é inserido na tabela local `diary_events` com `synced_at` nulo e a ficha é recalculada a partir do log local, sem erro

#### Scenario: Reabertura do app sem rede
- **WHEN** o app é reaberto offline após eventos terem sido gravados anteriormente
- **THEN** a ficha exibida é recalculada via `calcularFicha` a partir de todos os eventos persistidos localmente, sem depender de rede

### Requirement: Sincronização direta via Supabase SDK
O app SHALL sincronizar `diary_events` diretamente com o Supabase (PostgREST, autenticado com o JWT de sessão do usuário, sob RLS), sem depender de nenhum endpoint de `apps/api` — não SHALL existir chamada a um endpoint `/sync` próprio (ADR-0011).

#### Scenario: Push de eventos pendentes
- **WHEN** há conectividade e existem eventos locais com `synced_at` nulo
- **THEN** o app envia esses eventos via `insert` do Supabase SDK, autenticado como o usuário, e marca `synced_at` localmente somente após confirmação de sucesso do servidor

#### Scenario: Pull de eventos gravados em outro dispositivo
- **WHEN** há conectividade e o servidor possui eventos da mesma `campaign_instance_id` que não existem localmente
- **THEN** o app busca esses eventos via `select` do Supabase SDK e os insere localmente, permitindo que `calcularFicha` reflita o estado consolidado

#### Scenario: Falha de rede durante push
- **WHEN** o envio de um lote de eventos falha (timeout, sem rede)
- **THEN** nenhum evento do lote é marcado como `synced_at`, e o app tenta reenviar no próximo ciclo de sincronização sem duplicar dados (reenvio é idempotente via `idempotency_key`)

### Requirement: Idempotência de eventos sincronizados
Cada evento gravado localmente SHALL carregar uma `idempotency_key` (UUID) única por `campaign_instance_id`, gerada no momento da criação do evento, garantindo que reenvios após falha não criem duplicatas no servidor.

#### Scenario: Reenvio após falha parcial
- **WHEN** um evento já foi persistido no servidor mas a confirmação não chegou ao client (ex.: conexão caiu após o insert)
- **THEN** o reenvio do mesmo evento (mesma `idempotency_key`) é rejeitado pela constraint única do servidor sem criar um segundo registro, e o app trata a rejeição como sucesso (marca `synced_at`)
