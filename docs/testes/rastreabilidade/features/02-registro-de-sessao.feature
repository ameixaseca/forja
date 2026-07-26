# language: pt
# Camada: dominio | Requisitos: RF-010..RF-017, RF-050..RF-057, RN-016..RN-018, RN-036, RN-037, RE-006

@dominio @registro
Funcionalidade: Registro de sessão, modalidades e sessões compostas
  Como praticante
  Quero registrar o que treinei em poucos segundos, em qualquer modalidade
  Para que o registro nunca seja o motivo de eu abandonar o aplicativo

  Contexto:
    Dado um personagem ativo com Juramento de 4 dias declarado
    E que o ciclo corrente está em curso

  # --------------------------------------------------------- Registro básico

  @rf-010 @critico
  Cenário: Registrar uma sessão em menos de 20 segundos
    Quando o usuário registra uma sessão informando tipo e duração
    Então a sessão é persistida
    E o número de campos obrigatórios é no máximo 2
    E o número de toques necessários do início ao fim é no máximo 5

  @rf-010
  Esquema do Cenário: A PSE é opcional e usa a escala de Borg CR10
    Quando o usuário registra uma sessão com PSE igual a <pse>
    Então o registro é <resultado>

    Exemplos:
      | pse     | resultado |
      | ausente | aceito    |
      | 0       | aceito    |
      | 7       | aceito    |
      | 10      | aceito    |
      | 11      | recusado  |
      | -1      | recusado  |

  @rf-010
  Cenário: A escala de PSE apresenta âncoras verbais
    Quando o usuário abre o campo de PSE
    Então a escala apresentada vai de 0 a 10
    E as âncoras extremas e a mediana têm rótulo verbal

  @rf-010
  Cenário: Sessão sem PSE é válida e não gera pendência
    Quando o usuário registra uma sessão sem informar PSE
    Então a sessão é persistida e conta como dia treinado
    E nenhuma pendência, lembrete ou marcação de incompletude é criada

  @rf-017 @rn-037 @critico
  Esquema do Cenário: Não existe duração mínima de sessão
    Quando o usuário registra uma sessão com duração de <minutos> minutos
    Então o registro é aceito
    E a sessão conta como dia treinado do Juramento

    Exemplos:
      | minutos |
      | 3       |
      | 10      |
      | 45      |
      | 180     |

  @rf-011
  Cenário: Notas livres são incorporáveis ao Diário
    Quando o usuário registra uma sessão com a nota "ombro incomodou no fim"
    Então a nota é persistida vinculada à sessão
    E a nota aparece na entrada correspondente do Diário

  @rf-016
  Cenário: O registro não captura exercícios individuais
    Quando o usuário abre a tela de registro de sessão
    Então não há campo para nome de exercício, série, repetição ou carga
    E não há base de exercícios sugerida

  # ------------------------------------------------------ Retroativo e limites

  @rf-012
  Esquema do Cenário: Registro retroativo é permitido em até 48 horas
    Dado que agora são 26 de julho às 10h
    Quando o usuário registra uma sessão datada de <data>
    Então o registro é <resultado>

    Exemplos:
      | data                | resultado |
      | 26 de julho às 09h  | aceito    |
      | 25 de julho às 20h  | aceito    |
      | 24 de julho às 11h  | aceito    |
      | 24 de julho às 09h  | recusado  |
      | 27 de julho às 09h  | recusado  |

  @rf-012 @lacuna @critico
  Cenário: Registro retroativo que cruza a fronteira de um ciclo já encerrado
    # LACUNA: o PRD permite retroativo de 48h e encerra ciclos automaticamente,
    # mas não especifica o efeito de um registro retroativo sobre ciclo fechado.
    # Proposto: reclassifica o ciclo e concede o Fôlego devido, sem reabrir resoluções.
    Dado um ciclo encerrado ontem como quebrado, com 3 de 4 dias treinados
    Quando o usuário registra retroativamente uma sessão datada do último dia daquele ciclo
    Então o ciclo é reclassificado como cumprido
    E o Fôlego devido é concedido respeitando o teto do ciclo
    E a contagem de ciclos consecutivos cumpridos é recalculada
    E as resoluções já registradas no Diário permanecem inalteradas

  @rf-012 @lacuna
  Cenário: A resolução de um registro retroativo entra na ordem de chegada
    # LACUNA: o índice de resolução é monotônico (§6.2 da ESPEC), logo a ordem
    # narrativa diverge da ordem cronológica. Confirmar se é aceitável.
    Dado uma sessão já registrada hoje, que produziu a resolução de índice 12
    Quando o usuário registra retroativamente uma sessão de ontem
    Então a resolução gerada recebe o índice 13
    E a entrada do Diário exibe a data da sessão e a ordem da resolução

  @rf-013 @critico
  Cenário: No máximo duas sessões por dia
    Dado duas sessões já registradas hoje
    Quando o usuário tenta registrar uma terceira sessão hoje
    Então o registro é recusado
    E a mensagem é descritiva e não contém julgamento

  @rf-013 @rn-017
  Cenário: Duas sessões no mesmo dia ocupam um único dia do Juramento
    Dado um Juramento de 4 dias
    Quando o usuário registra 2 sessões na segunda-feira e 1 sessão em cada um dos dias terça, quarta e quinta
    Então o número de dias treinados no ciclo é 4
    E o ciclo é classificado como cumprido

  @rn-036 @critico
  Cenário: A segunda sessão do dia não avança o arco
    Dado uma sessão já registrada hoje, que produziu uma resolução da banda "arco"
    Quando o usuário registra a segunda sessão de hoje
    Então uma resolução é produzida
    E a banda da resolução é "cor"
    E nenhuma complicação é aberta ou fechada
    E nenhum estado de entidade é alterado

  @rn-036 @lacuna
  Cenário: A segunda sessão do dia incrementa o contador de resoluções do capítulo
    # LACUNA: não especificado. Impacta a regra de pressão, que dispara em
    # cap.resolucoes >= 12. Proposto: incrementa, por coerência com o contador.
    Dado um capítulo com 7 resoluções acumuladas
    Quando o usuário registra a segunda sessão do dia
    Então o contador de resoluções do capítulo passa a 8

  # ------------------------------------------------------------ Modalidades

  @rf-050 @rn-016
  Esquema do Cenário: Todas as modalidades são suportadas sem privilégio
    Quando o usuário registra uma sessão da modalidade "<modalidade>"
    Então a sessão é aceita
    E o atributo alvo associado é "<atributo>"
    E os campos de registro apresentados são adequados à modalidade

    Exemplos:
      | modalidade  | atributo          |
      | musculação  | Força             |
      | calistenia  | Força / Destreza  |
      | corrida     | Vigor             |
      | escalada    | Força / Destreza  |
      | luta        | Vigor / Destreza  |
      | dança       | Destreza / Vigor  |
      | mobilidade  | Destreza          |
      | funcional   | composta          |

  @rf-051
  Cenário: Criar modalidade própria, sem validação
    Quando o usuário cria a modalidade "capoeira" com atributo alvo "Destreza" e eixos "duração" e "densidade"
    Então a modalidade é criada
    E nenhuma validação de nome, categoria ou existência é aplicada
    E a modalidade fica disponível para registro imediatamente

  @rf-057
  Cenário: Editar retroativamente uma modalidade criada, sem penalidade
    Dada a modalidade "capoeira" com atributo alvo "Destreza" e 6 Marcos já contabilizados
    Quando o usuário altera o atributo alvo para "Vigor"
    Então os 6 Marcos são recalculados para "Vigor"
    E o ponto de "Destreza" derivado deles é removido
    E o ponto correspondente de "Vigor" é concedido
    E nenhuma penalidade, aviso de perda ou bloqueio é aplicado

  @rf-055 @rn-018
  Cenário: Trocar de modalidade não custa campanha, atributos nem histórico
    Dado um personagem no capítulo 3, com Força 2 e 14 sessões de musculação
    Quando o usuário passa a registrar exclusivamente corrida
    Então o capítulo corrente permanece 3
    E a Força permanece 2
    E as 14 sessões anteriores permanecem no Diário

  @rf-056
  Cenário: Os campos de registro se adaptam à modalidade do bloco
    Quando o usuário adiciona um bloco de "corrida" a uma sessão
    Então os eixos oferecidos incluem distância, duração e densidade
    E os eixos oferecidos não incluem carga

  # ----------------------------------------------------- Sessões compostas

  @rf-052 @rf-053 @rn-017
  Cenário: Sessão composta por blocos ocupa um único dia do Juramento
    Quando o usuário registra uma sessão com um bloco de "musculação" e um bloco de "corrida"
    Então a sessão é persistida com 2 blocos
    E o número de dias treinados é incrementado em 1

  @rf-054
  Cenário: Cada Marco é vinculado ao bloco e ao atributo correspondentes
    Dada uma sessão com um bloco de "musculação" e um bloco de "mobilidade"
    Quando o usuário declara um Marco no bloco de "mobilidade" no eixo "amplitude"
    Então o Marco é vinculado ao bloco de "mobilidade"
    E o atributo creditado é "Destreza"

  @rf-052
  Cenário: Sessão composta de modalidades com atributos distintos permite Marcos em atributos distintos
    Dada uma sessão com um bloco de "musculação" e um bloco de "corrida"
    Quando o usuário declara um Marco em cada bloco
    Então um Marco é creditado a "Força"
    E um Marco é creditado a "Vigor"
    E o teto de 2 Marcos contabilizados por ciclo é respeitado

  # ------------------------------------------------- Aviso de padrão (RE-006)

  @re-006 @critico
  Cenário: O aviso de padrão exige histórico mínimo de quatro ciclos
    Dado um personagem com 3 ciclos de histórico
    E que a frequência dos últimos 7 dias é 80 por cento maior que a média anterior
    Quando o ciclo é encerrado
    Então nenhum aviso de padrão é exibido

  @re-006
  Esquema do Cenário: O aviso dispara com dois ciclos consecutivos acima de 40 por cento
    Dado um personagem com 4 ciclos de histórico e nenhum aviso nos últimos 4 ciclos
    Quando a grandeza "<grandeza>" excede a média das 4 semanas anteriores em <excesso> por cento durante <ciclos> ciclos consecutivos
    Então o aviso de padrão é <resultado>

    Exemplos:
      | grandeza          | excesso | ciclos | resultado |
      | frequência        | 45      | 2      | exibido   |
      | frequência        | 45      | 1      | omitido   |
      | frequência        | 35      | 2      | omitido   |
      | duração semanal   | 60      | 2      | exibido   |
      | PSE médio         | 40      | 2      | exibido   |
      | PSE médio         | 39      | 3      | omitido   |

  @re-006
  Cenário: Sessões sem PSE são excluídas da média de PSE
    Dado um ciclo com 4 sessões, das quais 2 sem PSE, e PSE 9 nas outras duas
    Quando a média de PSE do ciclo é calculada
    Então o denominador é 2
    E a média é 9

  @re-006
  Cenário: No máximo um aviso de padrão a cada quatro ciclos
    Dado um aviso de padrão exibido no ciclo 1
    E que a condição de disparo permanece satisfeita nos ciclos 2, 3 e 4
    Quando os ciclos 2, 3 e 4 são encerrados
    Então nenhum aviso adicional é exibido
    E o aviso volta a ser elegível no ciclo 5

  @re-006 @re-009 @rc-010 @critico
  Cenário: O aviso de padrão é descritivo, no passado, e não instrui
    Dada a condição de disparo do aviso satisfeita
    Quando o aviso é exibido
    Então o texto está no tempo passado
    E o texto não contém verbo no imperativo
    E o texto não contém recomendação, sugestão de descanso ou prescrição
    E o texto não menciona carga, série, repetição, progressão ou substituição de exercício

  @re-006 @rf-048
  Cenário: O aviso de padrão não dispara na volta de uma pausa longa
    Dado um personagem retornando após 30 dias sem sessão
    E 4 ciclos de histórico anteriores à pausa
    Quando o primeiro ciclo após o retorno é encerrado com frequência 100 por cento acima da média anterior
    Então nenhum aviso de padrão é exibido no primeiro ciclo
    E o aviso só pode disparar após dois ciclos consecutivos acima do limiar
