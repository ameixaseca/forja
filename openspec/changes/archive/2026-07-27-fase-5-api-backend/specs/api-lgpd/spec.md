## ADDED Requirements

### Requirement: Exportação integral de dados
A API SHALL expor `GET /data-export` que, para o usuário autenticado, retorna um JSON único agregando `diary_events`, `consent_events`, `profiles` e `entitlements` do próprio usuário (via RLS, com o JWT do usuário), mais o histórico de `purchase_receipts` do usuário (via `service_role`, única forma de acesso a essa tabela).

#### Scenario: Export de usuário com histórico completo
- **WHEN** um usuário autenticado com eventos de diário, consentimentos, um perfil, um entitlement e um recibo de compra chama `GET /data-export`
- **THEN** a API retorna 200 com um JSON contendo as cinco coleções, cada uma filtrada estritamente para `user_id`/`id` do usuário autenticado

#### Scenario: Export de usuário sem conta paga
- **WHEN** um usuário autenticado sem nenhum `entitlement` nem `purchase_receipts` chama `GET /data-export`
- **THEN** a API retorna 200 com as coleções de `entitlements` e `purchase_receipts` vazias, sem erro

#### Scenario: Request sem autenticação
- **WHEN** `GET /data-export` é chamado sem JWT válido
- **THEN** a API retorna 401 e não executa nenhuma query

### Requirement: Isolamento por usuário no export
A API SHALL nunca retornar dado de `purchase_receipts` de um usuário diferente do autenticado, mesmo usando `service_role` (que bypassa RLS) para acessar essa tabela — o filtro por `user_id` do usuário autenticado é responsabilidade explícita do código da API, não do banco, para esta tabela específica.

#### Scenario: Tentativa de acessar dado de outro usuário
- **WHEN** o código do endpoint constrói a query de `purchase_receipts` para o export
- **THEN** a query SHALL incluir `where user_id = <id do usuário do JWT autenticado>` explicitamente, verificado por teste de integração que garante isolamento entre dois usuários de teste
