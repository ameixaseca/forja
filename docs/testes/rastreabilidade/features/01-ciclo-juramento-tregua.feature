# language: pt
# Camada: dominio | Requisitos: RF-004..RF-009, RF-007A, RF-082, RN-001, RN-002, RN-004, RN-008, RN-038, RC-002, RE-002, RE-003

@dominio @ciclo
Funcionalidade: Juramento, ciclo semanal, Trégua e deload
  Como praticante em campanha
  Quero declarar um pacto semanal de dias de treino e poder pausá-lo sem punição
  Para que a constância seja o motor da história sem que a vida real me custe o progresso

  Contexto:
    Dado um personagem ativo na campanha "A Longa Seca"
    E que o ciclo é semanal
    E que a data corrente é domingo, antes do início do ciclo

  # ---------------------------------------------------------------- Juramento

  @rf-004 @critico
  Esquema do Cenário: Juramento aceita apenas de 1 a 6 dias de treino
    Quando o usuário declara um Juramento de <dias> dias
    Então a declaração é <resultado>

    Exemplos:
      | dias | resultado  |
      | 0    | recusada   |
      | 1    | aceita     |
      | 2    | aceita     |
      | 5    | aceita     |
      | 6    | aceita     |
      | 7    | recusada   |

  @rf-004
  Cenário: O Juramento é declarado em dias, nunca em sessões ou blocos
    Quando o usuário abre a tela de declaração do Juramento
    Então a unidade apresentada é "dias de treino"
    E não há campo para número de sessões, blocos, séries ou carga

  @rf-005 @critico
  Cenário: O Juramento é imutável durante o ciclo em curso
    Dado um Juramento de 4 dias declarado e o ciclo iniciado
    Quando o usuário tenta alterar o Juramento para 2 dias
    Então a alteração é recusada
    E a mensagem informa que o Juramento vale até o fim do ciclo corrente
    E a mensagem não atribui valor moral à tentativa

  @rf-004
  Cenário: O Juramento é ajustável entre ciclos, sem penalidade
    Dado um ciclo encerrado com Juramento de 5 dias
    Quando o usuário declara um Juramento de 2 dias para o ciclo seguinte
    Então a declaração é aceita
    E nenhum atributo, ponto de Fôlego ou progresso de capítulo é reduzido
    E o Diário não registra a redução como evento negativo

  # -------------------------------------------------- Cumprimento e progressão

  @rn-001 @rn-002 @critico
  Esquema do Cenário: A progressão do arco depende da razão cumprida, não do valor jurado
    Dado um Juramento de <jurados> dias
    Quando o usuário registra sessões em <treinados> dias distintos do ciclo
    Então o ciclo é classificado como <classificacao>
    E o avanço de arco concedido é <avanco>

    Exemplos:
      | jurados | treinados | classificacao | avanco  |
      | 2       | 2         | cumprido      | integral|
      | 5       | 5         | cumprido      | integral|
      | 6       | 6         | cumprido      | integral|
      | 5       | 4         | quebrado      | nenhum  |
      | 2       | 1         | quebrado      | nenhum  |

  @rn-002 @d-004 @critico
  Cenário: Juramento baixo cumprido rende a mesma progressão que Juramento alto cumprido
    Dado o personagem "Ana" com Juramento de 2 dias, cumprido
    E o personagem "Beto" com Juramento de 5 dias, cumprido
    Quando ambos os ciclos são encerrados
    Então o avanço de arco de "Ana" é igual ao avanço de arco de "Beto"
    E o ganho de Vontade de "Ana" é igual ao ganho de Vontade de "Beto"

  @rn-006
  Cenário: Treinar acima do Juramento não gera benefício adicional
    Dado um Juramento de 3 dias
    Quando o usuário registra sessões em 6 dias distintos do ciclo
    Então o ciclo é classificado como cumprido
    E o avanço de arco é o mesmo de um ciclo com exatamente 3 dias treinados
    E nenhum Fôlego adicional é concedido pelos dias excedentes

  @rf-008
  Cenário: O ciclo encerra automaticamente ao fim do período
    Dado um ciclo em curso cujo último dia terminou
    Quando o relógio do dispositivo cruza o início do ciclo seguinte
    Então o ciclo anterior é encerrado sem ação do usuário
    E a tela de Fechamento é apresentada na próxima abertura do aplicativo

  @rf-009 @rn-010 @re-009
  Cenário: O Fechamento de ciclo quebrado não julga o usuário
    Dado um ciclo quebrado com 2 de 5 dias treinados
    Quando a tela de Fechamento é apresentada
    Então o texto descreve o ocorrido no passado
    E o texto não contém termo de julgamento moral
    E o texto não contém verbo no imperativo referente a execução de exercício
    E o texto não contém promessa, cobrança ou comparação com outros ciclos

  @rn-003 @rn-004 @critico
  Cenário: Quebra de Juramento gera revés narrativo recuperável, jamais perda mecânica
    Dado um personagem com Vontade 2, Força 1 e capítulo 2 em curso
    Quando um ciclo é encerrado como quebrado
    Então a Vontade permanece 2
    E a Força permanece 1
    E o capítulo corrente permanece 2
    E a resolução seguinte oferece um caminho narrativo de recuperação

  @rn-008
  Cenário: Três ciclos quebrados consecutivos disparam sugestão de reduzir o Juramento
    Dado 2 ciclos consecutivos encerrados como quebrados
    Quando um terceiro ciclo é encerrado como quebrado
    Então o aplicativo sugere reduzir o Juramento
    E a sugestão é dispensável
    E a sugestão não é apresentada como falha do usuário

  @rn-008
  Cenário: Trégua não conta para a contagem de três ciclos quebrados
    Dado 2 ciclos consecutivos encerrados como quebrados
    E um ciclo seguinte encerrado como Trégua
    Quando o ciclo posterior é encerrado como quebrado
    Então a contagem de ciclos quebrados consecutivos é 3
    E o aplicativo sugere reduzir o Juramento

  # ------------------------------------------------------------ Trégua comum

  @rf-007 @critico
  Cenário: Usuário novo começa com um crédito de Trégua disponível
    Dado um personagem recém-criado, sem ciclo encerrado
    Quando o usuário abre a declaração de ciclo
    Então há 1 crédito de Trégua disponível
    E a Trégua pode ser declarada já para o primeiro ciclo

  @rf-007
  Esquema do Cenário: Crédito de Trégua acumula a cada 8 ciclos encerrados de qualquer natureza
    Dado um personagem com 0 créditos de Trégua em reserva
    Quando <encerrados> ciclos são encerrados, sendo <cumpridos> cumpridos, <quebrados> quebrados e <treguas> de Trégua
    Então a reserva de Trégua é <reserva>

    Exemplos:
      | encerrados | cumpridos | quebrados | treguas | reserva |
      | 7          | 7         | 0         | 0       | 0       |
      | 8          | 8         | 0         | 0       | 1       |
      | 8          | 3         | 4         | 1       | 1       |
      | 16         | 8         | 6         | 2       | 2       |
      | 24         | 12        | 8         | 4       | 2       |

  @rf-007
  Cenário: Crédito concedido com a reserva no teto é perdido, sem aviso de perda
    Dado um personagem com 2 créditos de Trégua em reserva
    Quando o oitavo ciclo desde o último crédito é encerrado
    Então a reserva permanece 2
    E nenhuma mensagem de perda ou desperdício é exibida

  @rf-007
  Cenário: Trégua comum é declarada antes do início do ciclo
    Dado 1 crédito de Trégua em reserva
    E que o ciclo corrente já foi iniciado
    Quando o usuário tenta declarar Trégua para o ciclo corrente
    Então a declaração é recusada
    E o aplicativo oferece declarar Trégua para o ciclo seguinte

  @rf-007 @rn-031
  Cenário: Ciclo de Trégua não é cumprido nem quebrado e não avança o capítulo
    Dado 1 crédito de Trégua em reserva
    E um capítulo em curso com 5 resoluções acumuladas
    Quando o usuário declara Trégua e o ciclo é encerrado
    Então o ciclo não conta como cumprido nem como quebrado
    E nenhum Fôlego é concedido
    E o contador de resoluções do capítulo permanece 5
    E a contagem de ciclos consecutivos cumpridos não é interrompida
    E o crédito de Trégua é consumido

  # ------------------------------------------------- Trégua de Recuperação

  @rf-007a @critico
  Cenário: Trégua de Recuperação é declarável a qualquer momento e não consome reserva
    Dado um personagem com 0 créditos de Trégua em reserva
    E um ciclo em curso, na quarta-feira
    Quando o usuário declara Trégua de Recuperação
    Então a declaração é aceita
    E a reserva de Trégua permanece 0
    E o ciclo corrente passa a ser de Recuperação

  @rf-007a @rc-002 @critico
  Cenário: O aplicativo não pergunta nem registra o motivo da Recuperação
    Quando o usuário declara Trégua de Recuperação
    Então nenhum campo de motivo, lesão, diagnóstico ou sintoma é apresentado
    E o registro persistido contém apenas o período e o tipo de pausa
    E nenhum dado sobre natureza de lesão é gravado em qualquer parte do estado

  @rf-007a
  Esquema do Cenário: A Recuperação é declarável retroativamente em até 14 dias
    Dado que hoje é 26 de julho
    Quando o usuário declara Trégua de Recuperação com início em <inicio>
    Então a declaração é <resultado>

    Exemplos:
      | inicio     | resultado |
      | 26 de julho| aceita    |
      | 20 de julho| aceita    |
      | 12 de julho| aceita    |
      | 11 de julho| recusada  |

  @rf-007a
  Esquema do Cenário: A Recuperação dura de 1 a 8 ciclos e é prorrogável
    Quando o usuário declara Trégua de Recuperação por <ciclos> ciclos
    Então a declaração é <resultado>

    Exemplos:
      | ciclos | resultado |
      | 1      | aceita    |
      | 8      | aceita    |
      | 9      | recusada  |

  @rf-007a
  Cenário: Recuperação não tem limite de frequência
    Dado um personagem que usou Trégua de Recuperação em 3 períodos distintos nos últimos 6 meses
    Quando o usuário declara uma quarta Trégua de Recuperação
    Então a declaração é aceita
    E nenhum aviso de uso excessivo é exibido

  @rn-038 @critico
  Cenário: Ciclos de Recuperação saem do denominador das métricas de constância
    Dado 4 ciclos cumpridos, 2 ciclos de Recuperação e 1 ciclo quebrado
    Quando a taxa de cumprimento é calculada
    Então o denominador considerado é 5
    E a taxa apresentada é 80 por cento

  @rn-038
  Cenário: Recuperação não interrompe a contagem de ciclos consecutivos cumpridos
    Dado 6 ciclos consecutivos cumpridos
    E 3 ciclos seguintes de Trégua de Recuperação
    Quando o ciclo seguinte é encerrado como cumprido
    Então a contagem de ciclos consecutivos cumpridos é 7

  @rf-007a @re-009
  Cenário: A saída da Recuperação oferece redução do Juramento como padrão dispensável
    Dado um personagem saindo de Trégua de Recuperação, com Juramento anterior de 5 dias
    Quando a declaração do ciclo seguinte é apresentada
    Então há uma sugestão de Juramento reduzido pré-selecionada
    E o usuário pode declarar qualquer valor de 1 a 6, inclusive 5
    E o texto da sugestão é descritivo e não contém verbo no imperativo

  @rf-007a @lacuna
  Cenário: Recuperação retroativa sobre ciclo já encerrado como quebrado
    # LACUNA: o PRD não especifica o efeito da retroatividade sobre ciclo já fechado.
    # Comportamento proposto, a confirmar antes da implementação.
    Dado um ciclo encerrado há 5 dias como quebrado
    E que nenhum Marco de capítulo foi disparado desde então
    Quando o usuário declara Trégua de Recuperação com início anterior àquele ciclo
    Então o ciclo é reclassificado como de Recuperação
    E a contagem de ciclos quebrados consecutivos é recalculada
    E nenhum Fôlego já concedido é retirado
    E nenhuma resolução já registrada no Diário é removida ou reescrita

  # ------------------------------------------------------------------ Deload

  @rf-006
  Cenário: Deload é declarável antes do início do ciclo e conta como cumprido
    Dado um personagem sem deload nos 4 ciclos anteriores
    Quando o usuário declara deload para o ciclo seguinte e o ciclo é encerrado
    Então o ciclo é classificado como cumprido
    E a contagem de ciclos consecutivos cumpridos é incrementada

  @rf-006 @critico
  Esquema do Cenário: Deload é limitado a 1 a cada 4 ciclos e não acumula
    Dado um deload declarado no ciclo 1
    Quando o usuário tenta declarar deload no ciclo <ciclo>
    Então a declaração é <resultado>

    Exemplos:
      | ciclo | resultado |
      | 2     | recusada  |
      | 3     | recusada  |
      | 4     | recusada  |
      | 5     | aceita    |

  @rf-006 @lacuna
  Cenário: A janela de 4 ciclos do deload conta ciclos encerrados de qualquer natureza
    # LACUNA: o PRD não diz se a janela conta ciclos cumpridos ou encerrados.
    # Proposto: encerrados de qualquer natureza, por simetria com a Trégua (DEC-035).
    Dado um deload declarado no ciclo 1
    E que os ciclos 2 e 3 foram de Trégua de Recuperação
    E que o ciclo 4 foi quebrado
    Quando o usuário declara deload no ciclo 5
    Então a declaração é aceita

  @rf-082 @rf-084
  Cenário: Deload dobra o teto de Fôlego do ciclo
    Dado um Juramento de 3 dias e deload declarado
    Quando o ciclo é encerrado como cumprido com 4 dias de descanso
    Então o Fôlego concedido no ciclo é 4
    E o Fôlego acumulado respeita o teto de 4

  @re-002
  Cenário: Nenhuma notificação de culpa é emitida durante um ciclo em risco
    Dado um Juramento de 5 dias e 1 dia treinado, com o ciclo terminando amanhã
    Quando o aplicativo avalia o envio de notificações
    Então nenhuma notificação de cobrança, culpa ou contagem regressiva é enviada
    E nenhuma notificação é enviada entre 22h e 7h

  @re-003
  Cenário: A quebra de ciclo não zera um contador irreversível
    Dado 12 ciclos consecutivos cumpridos
    Quando um ciclo é encerrado como quebrado
    Então o histórico de 12 ciclos permanece consultável no Diário
    E a contagem corrente reinicia sem apagar o recorde anterior
    E nenhuma tela apresenta a quebra como perda de conquista

  @rn-008 @lacuna
  Cenário: Trégua pausa a contagem de ciclos quebrados, sem reiniciá-la
    # LACUNA: RN-008 diz que Trégua "não conta" para os três ciclos, o que é
    # ambíguo entre pausar e reiniciar. Proposto: pausar, porque reiniciar
    # esconderia uma dificuldade real atrás de uma pausa declarada.
    Dado 2 ciclos consecutivos encerrados como quebrados
    E 2 ciclos seguintes encerrados como Trégua de Recuperação
    Quando o ciclo posterior é encerrado como quebrado
    Então a contagem de ciclos quebrados consecutivos é 3
    E a sugestão de reduzir o Juramento é apresentada
