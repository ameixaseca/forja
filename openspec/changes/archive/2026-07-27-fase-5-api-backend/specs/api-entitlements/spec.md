## ADDED Requirements

### Requirement: Validação de recibo de compra
A API SHALL expor `POST /entitlements/validate` que recebe `{ platform: 'ios' | 'android' | 'stripe', receipt: string }`, valida o recibo contra o provedor correspondente (App Store Server API, Google Play Developer API, ou Stripe) e, se válido, materializa um `entitlement` para o usuário autenticado. A API SHALL rejeitar requests sem JWT válido do Supabase Auth.

#### Scenario: Recibo válido da App Store
- **WHEN** um usuário autenticado envia `POST /entitlements/validate` com `platform: 'ios'` e um recibo válido
- **THEN** a API grava um registro em `purchase_receipts` com `status_verificacao: 'valido'`, grava um `entitlement` correspondente via `service_role`, e retorna `{ valid: true, product_id, expires_at }`

#### Scenario: Recibo inválido ou forjado
- **WHEN** um usuário autenticado envia um recibo que a API oficial da loja rejeita
- **THEN** a API grava o registro em `purchase_receipts` com `status_verificacao: 'invalido'`, NÃO grava nenhum `entitlement`, e retorna `{ valid: false }`

#### Scenario: Request sem autenticação
- **WHEN** `POST /entitlements/validate` é chamado sem JWT ou com JWT inválido/expirado
- **THEN** a API retorna 401 e não grava nada em `purchase_receipts` nem `entitlements`

### Requirement: Auditoria antes de concessão
A API SHALL sempre persistir o recibo bruto em `purchase_receipts` antes de gravar qualquer `entitlement`, de modo que nenhuma concessão de acesso exista sem trilha de auditoria correspondente.

#### Scenario: Falha ao gravar entitlement após recibo válido
- **WHEN** o recibo é validado como válido pela loja mas a gravação em `entitlements` falha (ex.: erro transiente de banco)
- **THEN** o registro em `purchase_receipts` já existe com `status_verificacao: 'valido'` e `entitlement_id` nulo, permitindo reprocessamento posterior sem perder a evidência da validação
