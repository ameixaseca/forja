## Purpose

Validação de recibo de compra multiplataforma (App Store, Play Store, Stripe) e materialização de direito de acesso (`entitlements`), a única escrita nessas tabelas permitida fora de `service_role` (ADR-0005, ADR-0011).

## Requirements

### Requirement: Validação de recibo de compra
A API SHALL expor `POST /entitlements/validate` que recebe `{ platform: 'ios' | 'android' | 'stripe', receipt: string }`, valida o recibo contra o provedor correspondente (App Store Server API, Google Play Developer API, ou Stripe) e, se válido, materializa um `entitlement` para o usuário autenticado. A API SHALL rejeitar requests sem JWT válido do Supabase Auth. Para `platform: 'ios'` e `platform: 'android'`, a API SHALL rejeitar (`{ valid: false }`) qualquer recibo cuja identidade de app (`bundle_id` para iOS, `packageName` para Android) não corresponda ao app FORJA configurado via env var, mesmo que o recibo seja válido perante a loja para outro app.

#### Scenario: Recibo válido da App Store
- **WHEN** um usuário autenticado envia `POST /entitlements/validate` com `platform: 'ios'` e um recibo válido cujo `bundle_id` corresponde ao app FORJA
- **THEN** a API grava um registro em `purchase_receipts` com `status_verificacao: 'verificado'`, grava um `entitlement` correspondente via `service_role`, e retorna `{ valid: true, product_id, expires_at }`

#### Scenario: Recibo inválido ou forjado
- **WHEN** um usuário autenticado envia um recibo que a API oficial da loja rejeita
- **THEN** a API grava o registro em `purchase_receipts` com `status_verificacao: 'falhou'`, NÃO grava nenhum `entitlement`, e retorna `{ valid: false }`

#### Scenario: Recibo válido pertencente a outro app
- **WHEN** um usuário autenticado envia `platform: 'ios'` ou `platform: 'android'` com um recibo que a loja confirma como válido, mas cujo `bundle_id`/`packageName` não é o do app FORJA
- **THEN** a API retorna `{ valid: false }`, grava `purchase_receipts` com `status_verificacao: 'falhou'`, e NÃO grava nenhum `entitlement`

#### Scenario: Request sem autenticação
- **WHEN** `POST /entitlements/validate` é chamado sem JWT ou com JWT inválido/expirado
- **THEN** a API retorna 401 e não grava nada em `purchase_receipts` nem `entitlements`

### Requirement: Limite de taxa em validação de recibo
A API SHALL limitar a taxa de chamadas a `POST /entitlements/validate` para conter abuso e proteger cotas de APIs pagas de terceiros (Apple, Google, Stripe).

#### Scenario: Excesso de requisições
- **WHEN** o número de requisições a `POST /entitlements/validate` de uma mesma origem excede o limite configurado dentro da janela de tempo
- **THEN** a API retorna 429 e não realiza nenhuma chamada às APIs de loja/Stripe para as requisições excedentes

### Requirement: Auditoria antes de concessão
A API SHALL sempre persistir o recibo bruto em `purchase_receipts` antes de gravar qualquer `entitlement`, de modo que nenhuma concessão de acesso exista sem trilha de auditoria correspondente.

#### Scenario: Falha ao gravar entitlement após recibo válido
- **WHEN** o recibo é validado como válido pela loja mas a gravação em `entitlements` falha (ex.: erro transiente de banco)
- **THEN** o registro em `purchase_receipts` já existe com `status_verificacao: 'verificado'` e `entitlement_id` nulo, permitindo reprocessamento posterior sem perder a evidência da validação
