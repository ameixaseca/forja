## ADDED Requirements

### Requirement: Navegação entre telas MVP
O app SHALL prover navegação (Expo Router) entre as 7 telas MVP: Home, Juramento, Sessão, Resolução, Histórico, Compartilhar, Config.

#### Scenario: Fluxo completo navegável
- **WHEN** o usuário abre o app pela primeira vez
- **THEN** consegue navegar de Home até Juramento, criar um juramento, ir a Sessão, registrar, ser levado a Resolução, e retornar a Home sem erro de navegação

### Requirement: Validação de compra via apps/api
O app SHALL chamar `POST /entitlements/validate` de `apps/api` (não reimplementar validação de recibo) ao processar uma compra, autenticado com o JWT do Supabase Auth.

#### Scenario: Recibo validado
- **WHEN** o usuário completa uma compra na loja e o app envia o recibo para `/entitlements/validate`
- **THEN** o app reflete o `entitlement` retornado (`valid: true`) na UI sem persistir lógica própria de verificação de recibo

### Requirement: Exportação LGPD via apps/api
A tela Config SHALL oferecer exportação de dados chamando `GET /data-export` de `apps/api`, autenticado com o JWT do Supabase Auth.

#### Scenario: Usuário solicita exportação
- **WHEN** o usuário aciona "Exportar meus dados" em Config
- **THEN** o app chama `GET /data-export` e disponibiliza o resultado ao usuário (compartilhar/salvar arquivo)

### Requirement: Catálogo embarcado no binário
O app SHALL importar o catálogo de storylets como JSON estático embarcado no bundle, sem requisição de rede para obter o catálogo (D-036).

#### Scenario: Resolução funciona sem rede
- **WHEN** o app está offline e uma sessão é registrada
- **THEN** o catálogo usado por `resolve()` já está disponível localmente, sem necessidade de fetch
