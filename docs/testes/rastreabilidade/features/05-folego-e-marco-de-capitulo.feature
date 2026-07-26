# language: pt
# Camada: dominio | Requisitos: RF-029, RF-080..RF-084, RN-006, RN-007, RN-023, RN-039

@dominio @folego @capitulo
Funcionalidade: Fôlego, Descanso Longo e Marco de capítulo
  Como praticante em campanha
  Quero que o descanso seja a moeda que move a história
  Para que seja mecanicamente impossível avançar treinando todos os dias

  Contexto:
    Dado um personagem no capítulo 1 com 0 pontos de Fôlego
    E que o último Marco de capítulo ocorreu no encerramento do capítulo anterior

  # --------------------------------------------------------- Geração de Fôlego

  @rf-080 @rf-084 @critico
  Esquema do Cenário: Fôlego por ciclo, com teto de 2
    Dado um Juramento de <jurados> dias
    Quando o ciclo é encerrado como cumprido com <treinados> dias treinados
    Então os dias de descanso do ciclo são <descanso>
    E o Fôlego concedido no ciclo é <folego>

    Exemplos:
      | jurados | treinados | descanso | folego |
      | 1       | 1         | 6        | 2      |
      | 2       | 2         | 5        | 2      |
      | 3       | 3         | 4        | 2      |
      | 5       | 5         | 2        | 2      |
      | 6       | 6         | 1        | 1      |
      | 3       | 6         | 1        | 1      |
      | 3       | 7         | 0        | 0      |

  @rf-080
  Esquema do Cenário: Ciclo sem cumprimento não gera Fôlego
    Quando o ciclo é encerrado como <tipo>
    Então o Fôlego concedido no ciclo é 0

    Exemplos:
      | tipo                  |
      | quebrado              |
      | Trégua                |
      | Trégua de Recuperação |

  @rf-082
  Cenário: Deload dobra o teto do ciclo para 4
    Dado um Juramento de 2 dias e deload declarado
    Quando o ciclo é encerrado como cumprido com 2 dias treinados
    Então o Fôlego concedido no ciclo é 4

  @rf-084 @critico
  Esquema do Cenário: O Fôlego acumulado tem teto de 4
    Dado <inicial> pontos de Fôlego acumulados
    Quando um ciclo cumprido concede <concedido> pontos
    Então o Fôlego acumulado é <final>

    Exemplos:
      | inicial | concedido | final |
      | 0       | 2         | 2     |
      | 2       | 2         | 4     |
      | 3       | 2         | 4     |
      | 4       | 2         | 4     |
      | 4       | 4         | 4     |

  @rn-006 @rf-083 @critico
  Cenário: Treinar acima do Juramento não gera Fôlego adicional
    Dado um Juramento de 2 dias
    Quando o ciclo é encerrado como cumprido com 5 dias treinados
    Então o ciclo é cumprido
    E o Fôlego concedido é 2
    E nenhum bônus, multiplicador ou reconhecimento mecânico é concedido pelos 3 dias excedentes

  @rf-080 @d-004 @critico
  Cenário: Todos os perfis de Juramento habilitam o Marco de capítulo em 2 ciclos
    Dado o personagem "Ana" com Juramento de 2 dias
    E o personagem "Beto" com Juramento de 6 dias
    Quando cada um encerra 2 ciclos consecutivos como cumpridos, treinando exatamente o jurado
    Então "Ana" tem 4 pontos de Fôlego
    E "Beto" tem 2 pontos de Fôlego
    E ambos satisfazem a condição de Fôlego do Marco de capítulo

  @rf-080 @defeito @critico
  Cenário: O praticante de sete dias por semana nunca acumula Fôlego
    # DEFEITO DE ESPECIFICAÇÃO: §4.5 declara que é impossível avançar treinando
    # todos os dias, o que é intencional, mas nenhum requisito especifica
    # comunicação ao usuário. O resultado é bloqueio permanente e silencioso.
    Dado um Juramento de 6 dias
    Quando 4 ciclos consecutivos são encerrados como cumpridos com 7 dias treinados cada
    Então o Fôlego acumulado é 0
    E nenhum Marco de capítulo é disparado
    E o aplicativo apresenta ao usuário a razão do bloqueio em texto descritivo
    E o texto não instrui o usuário a descansar

  # ------------------------------------------------------ Marco de capítulo

  @rf-029 @rn-007 @rn-023 @critico
  Esquema do Cenário: As três condições do Marco de capítulo
    Dado <ciclos> ciclos cumpridos desde o Marco anterior
    E que a complicação estruturante está <complicacao>
    E <folego> pontos de Fôlego acumulados
    Quando o motor avalia o disparo do Marco de capítulo
    Então o Marco é <resultado>

    Exemplos:
      | ciclos | complicacao          | folego | resultado   |
      | 1      | pronta para desfecho | 4      | não disparado |
      | 2      | em aberto            | 4      | não disparado |
      | 2      | pronta para desfecho | 1      | não disparado |
      | 2      | pronta para desfecho | 2      | disparado   |
      | 3      | pronta para desfecho | 4      | disparado   |

  @rf-029 @rn-023 @critico
  Cenário: O teto de 4 ciclos dispara o Marco ignorando a condição da complicação
    Dado 4 ciclos cumpridos desde o Marco anterior
    E que a complicação estruturante está em aberto
    E 2 pontos de Fôlego acumulados
    Quando o motor avalia o disparo do Marco de capítulo
    Então o Marco é disparado
    E o storylet de desfecho do capítulo é elegível

  @rf-029 @rn-007 @critico
  Cenário: O teto de 4 ciclos não contorna a exigência de Fôlego
    Dado 4 ciclos cumpridos desde o Marco anterior
    E 1 ponto de Fôlego acumulado
    Quando o motor avalia o disparo do Marco de capítulo
    Então o Marco não é disparado
    E a condição pendente informada ao usuário é o Fôlego

  @rf-081 @rn-007 @critico
  Cenário: O Marco de capítulo consome exatamente 2 pontos de Fôlego
    Dado 4 pontos de Fôlego acumulados e as três condições satisfeitas
    Quando o Marco de capítulo é resolvido
    Então o Fôlego acumulado passa a 2
    E o capítulo corrente é incrementado

  @rn-039 @critico
  Cenário: O desfecho forçado por teto fecha as complicações pendentes como efeito
    Dado um capítulo alcançando o teto de 4 ciclos
    E que "comp.carga_demais" está aberta e "comp.pe_ferido" está aberta
    Quando o storylet de desfecho é resolvido
    Então "comp.carga_demais" passa a fechada
    E "comp.pe_ferido" passa a fechada
    E o texto exibido reconhece que a complicação estruturante ficou por resolver

  @rf-029
  Cenário: O piso de 2 ciclos vale para o capítulo 1
    Dado um personagem no capítulo 1, recém-criado
    Quando 2 ciclos consecutivos são encerrados como cumpridos e as demais condições são satisfeitas
    Então o Marco de capítulo é disparado
    E o capítulo 1 é concluído

  @rf-029
  Cenário: A contagem de ciclos do Marco reinicia após o disparo
    Dado um Marco de capítulo disparado no ciclo 3
    Quando o ciclo 4 é encerrado como cumprido
    Então os ciclos cumpridos desde o Marco anterior são 1
    E nenhum novo Marco de capítulo é disparado

  @rf-029
  Cenário: Ciclos de Trégua não contam para o piso nem para o teto do Marco
    Dado 1 ciclo cumprido desde o Marco anterior
    Quando 3 ciclos de Trégua são encerrados
    Então os ciclos cumpridos desde o Marco anterior permanecem 1
    E nenhum Marco de capítulo é disparado

  # ------------------------- Conflito entre o teto de ciclos e o limite K

  @rf-029 @defeito @critico
  Cenário: Um capítulo pode exceder o limite de 20 resoluções antes do teto de 4 ciclos
    # DEFEITO DE ESPECIFICAÇÃO: T-10 da ESPEC fixa K = 20 resoluções por capítulo,
    # mas §4.9 do PRD permite até 4 ciclos, e o número de resoluções por ciclo é
    # função da frequência do usuário, não do sistema. Um Juramento de 6 com 6
    # sessões semanais produz 24 resoluções em 4 ciclos; com segundas sessões
    # diárias (RF-013) o teto sobe para 56. T-10 reprova para qualquer usuário
    # acima de 5 sessões semanais.
    # Resolução necessária antes da implementação: ou T-10 passa a ser expresso
    # em ciclos, ou o estágio de desfecho passa a ser forçado por cap.resolucoes.
    Dado um Juramento de 6 dias e 6 sessões registradas por ciclo
    Quando 4 ciclos consecutivos são encerrados como cumpridos sem que a complicação feche
    Então o número de resoluções do capítulo é 24
    E o limite K declarado em T-10 da ESPEC foi excedido
    E o teste deve reprovar até que a especificação seja reconciliada

  @rf-029 @defeito
  Cenário: A regra de pressão dispara cedo demais para praticantes frequentes
    # DEFEITO CORRELATO: a pressão começa em cap.resolucoes >= 12. Com 6 sessões
    # semanais isso ocorre no meio do segundo ciclo, antes do piso de 2 ciclos do
    # Marco, restringindo o pool de Arco a fechamentos por metade do capítulo.
    Dado um Juramento de 6 dias e 6 sessões registradas por ciclo
    Quando 12 resoluções ocorrem no capítulo
    Então o estágio do capítulo é "pressao"
    E o pool da banda "arco" está restrito a storylets de fechamento
    E o Marco de capítulo ainda não é elegível pelo piso de 2 ciclos
