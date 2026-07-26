# language: pt
# Camada: dominio + conformidade | Requisitos: RF-090..RF-093, RF-110..RF-113, RC-001..RC-005, RC-010, RC-020, RC-030..RC-032, RE-005

@conformidade @dados
Funcionalidade: Onboarding, consentimento, dados pessoais e direito de acesso
  Como controlador de dado sensível de saúde
  Quero consentimento específico, granular e revogável, e uso pleno sem conta
  Para que a base legal seja o art. 11, I da LGPD e não uma ficção contratual

  Contexto:
    Dado um aplicativo recém-instalado, sem conta e sem dados

  # ------------------------------------------------------------- Onboarding

  @re-005 @rc-010 @critico
  Cenário: O aviso de saúde é exibido na primeira abertura, com aceite registrado
    Quando o aplicativo é aberto pela primeira vez
    Então o aviso de que o aplicativo não substitui profissional de educação física ou médico é exibido
    E o aviso recomenda avaliação profissional
    E o aceite explícito é solicitado e registrado com data
    E o usuário não avança sem aceitar

  @re-005 @critico
  Cenário: O aviso de saúde não reaparece periodicamente
    Dado o aviso de saúde já aceito
    Quando o aplicativo é aberto 30 vezes ao longo de 90 dias
    Então o aviso não é exibido novamente

  @re-005 @critico
  Cenário: O aviso de saúde permanece acessível nos ajustes
    Dado o aviso de saúde já aceito
    Quando o usuário abre os ajustes
    Então o aviso está disponível para leitura
    E a data do aceite é consultável

  @rc-020 @critico
  Esquema do Cenário: A idade mínima é 18 anos
    Quando o usuário declara a idade de <idade> anos no onboarding
    Então o acesso é <resultado>

    Exemplos:
      | idade | resultado  |
      | 15    | recusado   |
      | 17    | recusado   |
      | 18    | permitido  |
      | 45    | permitido  |

  @rc-020 @lacuna
  Cenário: Recusa por idade não oferece nova tentativa imediata
    # LACUNA: RC-020 fixa o piso de 18 anos mas não especifica o comportamento
    # após a recusa. Proposto: bloqueio persistido localmente, com informação
    # sobre como proceder, sem laço de nova tentativa na mesma sessão.
    Dado que o usuário declarou 16 anos e teve o acesso recusado
    Quando o aplicativo é reaberto
    Então a recusa persiste
    E o aplicativo informa a razão e a idade mínima
    E nenhuma tela de nova declaração de idade é apresentada na mesma sessão

  @rc-001 @rf-093 @critico
  Cenário: O consentimento é específico, destacado e granular por finalidade
    Quando o onboarding apresenta o consentimento
    Então há consentimento separado para o funcionamento local da ficha e do Diário
    E há consentimento separado para backup em nuvem
    E cada consentimento é apresentado em destaque, fora dos termos de uso
    E nenhum consentimento vem pré-marcado

  @rc-001 @critico
  Cenário: Recusar o consentimento de nuvem não impede o uso local
    Quando o usuário aceita o consentimento local e recusa o de nuvem
    Então o aplicativo é integralmente utilizável
    E nenhum dado é transmitido
    E nenhuma funcionalidade local é bloqueada

  @rc-001
  Cenário: O consentimento é revogável a qualquer momento
    Dado o consentimento de backup em nuvem concedido e dados sincronizados
    Quando o usuário revoga aquele consentimento nos ajustes
    Então a sincronização cessa
    E os dados na nuvem são excluídos no prazo declarado
    E os dados locais permanecem intactos

  @rc-002 @critico
  Cenário: A finalidade é limitada e não há uso secundário
    Quando o inventário de tratamentos é auditado
    Então todo tratamento consta da política de privacidade com finalidade declarada
    E nenhum dado de saúde é usado para finalidade diversa da declarada
    E nenhum dado sobre motivo de pausa, lesão ou diagnóstico é coletado

  @rc-005
  Cenário: A política de privacidade documenta os papéis
    Quando a política de privacidade é consultada
    Então o controlador está identificado
    E os operadores estão identificados
    E a base legal de cada tratamento está declarada

  # ------------------------------------------------------------ Conta e dados

  @rf-090 @critico
  Cenário: Uso completo sem criação de conta
    Quando o usuário atravessa o capítulo 1 inteiro sem criar conta
    Então nenhuma funcionalidade foi bloqueada
    E nenhum prompt obrigatório de criação de conta foi apresentado
    E nenhum dado foi transmitido

  @rf-091 @critico
  Cenário: Exportação integral dos dados
    Dado um personagem com 20 ciclos de histórico
    Quando o usuário solicita a exportação integral
    Então o arquivo gerado contém sessões, Marcos, ciclos, Diário, ficha e semente
    E o formato é legível por máquina
    E a exportação funciona offline

  @rf-092 @critico
  Cenário: Exclusão definitiva de conta e dados em até 15 dias
    Dada uma conta ativa com dados sincronizados
    Quando o usuário solicita a exclusão
    Então a solicitação é confirmada com prazo declarado
    E os dados locais são apagados imediatamente
    E os dados remotos são apagados em até 15 dias
    E nenhuma retenção residual identificável permanece após o prazo

  @rf-092
  Cenário: A exclusão é possível sem contato com suporte
    Quando o usuário procura a exclusão de dados
    Então a função está disponível dentro do aplicativo
    E não exige envio de email, formulário externo ou contato humano

  @rc-004 @critico
  Cenário: Os dados ficam no dispositivo por padrão
    Dado um usuário que criou conta mas não concedeu o consentimento de nuvem
    Quando 10 sessões são registradas
    Então nenhum dado de treino é transmitido
    E o armazenamento remoto permanece vazio

  @rc-003 @critico
  Cenário: Nenhum SDK de terceiro tem acesso a dado de saúde
    Quando as dependências do aplicativo são auditadas
    Então nenhum SDK de publicidade está presente
    E nenhum SDK de analytics de terceiro recebe dado de treino, ficha ou Diário

  # ------------------------------------------------------- Direito de acesso

  @rf-110 @critico
  Esquema do Cenário: O direito de acesso é modelado com origem e validade
    Dado um direito de acesso ao pacote "<pacote>" com origem "<origem>" e validade "<validade>"
    Quando o direito é avaliado
    Então o acesso é <resultado>

    Exemplos:
      | pacote      | origem        | validade   | resultado |
      | campanha_1  | gratuito      | nulo       | concedido |
      | pacote_a    | compra_unica  | nulo       | concedido |
      | pacote_b    | promocional   | futuro     | concedido |
      | pacote_b    | promocional   | passado    | negado    |

  @rf-111
  Cenário: Adicionar uma origem não exige migração de dados
    Dado um esquema de direito de acesso em produção com as origens "gratuito" e "compra_unica"
    Quando a origem "assinatura" é adicionada
    Então nenhum registro existente precisa ser migrado
    E nenhum registro existente é invalidado

  @rf-112 @critico
  Cenário: O direito de acesso é avaliado localmente
    Dado um dispositivo em modo avião e um pacote adquirido anteriormente
    Quando o usuário abre o pacote
    Então o acesso é concedido sem consulta de rede
    E o aplicativo permanece funcional

  @rf-113 @critico
  Cenário: Não há cobrança recorrente no MVP
    Quando o fluxo de compra é inspecionado
    Então apenas produtos de compra única são oferecidos
    E nenhum produto de assinatura está configurado na loja
    E o campo de validade permanece disponível no modelo, sem uso

  # -------------------------------------------------------- Propriedade intelectual

  @rc-031 @critico
  Cenário: A licença sobre a saída narrativa é restrita ao log do Diário
    Quando os termos de uso são consultados
    Então a licença concedida ao controlador cobre o log do Diário
    E a licença exclui expressamente regras de transição
    E a licença exclui expressamente identificadores de storylet
    E a licença exclui expressamente metadados de qualidade
    E a licença exclui expressamente o texto bruto dos modelos do catálogo

  @rc-032
  Cenário: As notas do usuário não são licenciadas ao aplicativo
    Quando os termos de uso são consultados
    Então as notas livres do usuário permanecem integralmente dele
    E nenhuma licença sobre elas é concedida ao controlador

  @rc-030
  Cenário: O catálogo não é extraível pelo usuário
    Quando o usuário utiliza todas as funções de exportação disponíveis
    Então nenhuma saída contém o catálogo de storylets
    E nenhuma saída contém a espinha de campanha
    E nenhuma saída permite reconstruir o catálogo
