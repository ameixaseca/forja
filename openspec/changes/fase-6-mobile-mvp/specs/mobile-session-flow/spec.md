## ADDED Requirements

### Requirement: Registro de sessão via motor narrativo
Ao registrar uma sessão, o app SHALL recalcular a ficha atual via `calcularFicha(eventos)` do pacote `@forja/dominio`, montar os `Inputs` exigidos por `resolve()` a partir dessa ficha, chamar `resolve(catalog, state, inputs, seed)` do pacote `@forja/motor-narrativo`, e gravar um evento `sessao_registrada` local com o resultado — sem duplicar lógica de seleção/resolução de storylet no código do app.

#### Scenario: Sessão registrada com sucesso
- **WHEN** o usuário aciona "Registrar Sessão" com um juramento ativo
- **THEN** o app chama `resolve()` com a ficha corrente, grava um evento `sessao_registrada` (payload incluindo `storylet_id`, variante e efeitos) e exibe o resultado na tela de Resolução

#### Scenario: Sessão sem juramento ativo
- **WHEN** o usuário aciona "Registrar Sessão" sem juramento ativo (`ficha.juramento === null`)
- **THEN** o app não chama `resolve()` e orienta o usuário a criar um juramento primeiro

### Requirement: Criação de juramento
O app SHALL permitir criar um juramento (dias por semana, data início/fim) via `validarJuramento` de `@forja/dominio`, gravando um evento `juramento_declarado` local somente se a validação passar.

#### Scenario: Juramento válido
- **WHEN** o usuário preenche o formulário de juramento com parâmetros aceitos por `validarJuramento`
- **THEN** o app grava um evento `juramento_declarado` local e a ficha projetada passa a refletir o novo juramento

#### Scenario: Juramento inválido
- **WHEN** o usuário submete parâmetros rejeitados por `validarJuramento`
- **THEN** o app não grava nenhum evento e exibe o motivo da rejeição

### Requirement: Ficha sempre derivada do log de eventos
O app SHALL nunca persistir a ficha (atributos, Vontade, Fôlego, ciclo) como estado mutável independente — toda exibição de ficha SHALL ser o resultado de `calcularFicha(eventos)` sobre o log local no momento da renderização.

#### Scenario: Ficha exibida no Dashboard
- **WHEN** a tela Home é aberta
- **THEN** a ficha exibida é recalculada a partir do log completo de eventos locais, nunca lida de um campo salvo separadamente
