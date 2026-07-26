# language: pt
# Camada: dominio | Requisitos: RF-040..RF-048, RN-011..RN-015, RE-009, R-008

@dominio @superacao
Funcionalidade: Marcos de Superação
  Como praticante
  Quero declarar quando fiz algo que eu mesmo não fazia antes
  Para que o reconhecimento seja meu e não me empurre a caçar recorde

  Contexto:
    Dado um personagem ativo com histórico de 6 ciclos
    E um ciclo corrente com Juramento de 4 dias

  # ------------------------------------------------------------- Declaração

  @rf-040
  Cenário: O Marco é vinculado a um bloco de sessão já registrada
    Dada uma sessão registrada com um bloco de "musculação"
    Quando o usuário declara um Marco no eixo "carga" naquele bloco
    Então o Marco é persistido vinculado àquele bloco
    E não é possível declarar Marco sem sessão registrada

  @rf-041 @rn-014 @critico
  Esquema do Cenário: Todos os eixos de sobrecarga têm peso e destaque idênticos
    Quando o usuário abre a declaração de Marco
    Então o eixo "<eixo>" é oferecido
    E o eixo "<eixo>" tem o mesmo destaque visual dos demais
    E o Marco declarado no eixo "<eixo>" credita 1 Marco ao atributo do bloco

    Exemplos:
      | eixo      |
      | carga     |
      | repetição |
      | volume    |
      | amplitude |
      | duração   |
      | distância |
      | densidade |

  @rf-045
  Cenário: O rótulo é livre, com autocompletar apenas do próprio histórico
    Dado um histórico com os rótulos "agachamento" e "remada"
    Quando o usuário digita "aga" no rótulo do Marco
    Então "agachamento" é sugerido
    E nenhuma sugestão vem de base externa, catálogo ou histórico de outros usuários

  @rf-046 @d-018 @critico
  Cenário: Nenhum Marco é inferido automaticamente
    Dada uma sessão registrada com duração muito superior ao histórico
    Quando a sessão é confirmada
    Então nenhum Marco é criado automaticamente
    E a ficha não é alterada sem declaração explícita do usuário

  @rf-047 @critico
  Cenário: O aplicativo pode oferecer a declaração, sem preencher e sem instruir
    Dada uma sessão já registrada cuja duração excede o histórico do próprio usuário
    Quando o aplicativo apresenta a oferta de declarar Marco
    Então a oferta é dispensável
    E nenhum campo vem preenchido
    E o texto está no tempo passado
    E o texto não menciona carga, série, repetição, progressão ou substituição de exercício
    E o texto não sugere ação futura

  # ------------------------------------------------------------- Contenções

  @rf-042 @critico
  Esquema do Cenário: No máximo 2 Marcos contabilizados por ciclo
    Quando o usuário declara <declarados> Marcos com rótulos distintos no mesmo ciclo
    Então <contabilizados> Marcos são contabilizados
    E <registrados> Marcos são registrados no Diário

    Exemplos:
      | declarados | contabilizados | registrados |
      | 1          | 1              | 1           |
      | 2          | 2              | 2           |
      | 5          | 2              | 5           |

  @rf-043 @rf-044 @critico
  Cenário: Cooldown de 2 ciclos por rótulo
    Dado um Marco contabilizado com o rótulo "agachamento" no ciclo 1
    Quando o usuário declara um Marco com o rótulo "agachamento" no ciclo 2
    Então o Marco é registrado e não contabilizado
    E o motivo apresentado é o cooldown do rótulo
    E o mesmo rótulo volta a ser contabilizável no ciclo 4

  @rf-043
  Cenário: O cooldown é por rótulo, não por atributo
    Dado um Marco contabilizado com o rótulo "agachamento" no ciclo 1
    Quando o usuário declara um Marco com o rótulo "levantamento terra" no ciclo 2
    Então o Marco é contabilizado
    E a "Força" é creditada

  @rf-044 @rn-012 @critico
  Cenário: Marco em ciclo não cumprido é registrado sem efeito mecânico
    Dado um ciclo que será encerrado como quebrado
    Quando o usuário declara um Marco naquele ciclo
    Então o Marco aparece no Diário
    E nenhum ponto de atributo é concedido
    E o texto exibido não atribui culpa nem condiciona o reconhecimento ao cumprimento

  @rn-015 @critico
  Cenário: Teste de repetição máxima nunca gera Marco e nunca é sugerido
    Quando o usuário percorre a declaração de Marco e as ofertas de RF-047
    Então nenhum eixo, rótulo sugerido ou texto menciona teste de uma repetição máxima
    E não há eixo de "carga máxima" separado do eixo "carga"

  # ------------------------------------------------------- Janela de retorno

  @rf-048 @critico
  Esquema do Cenário: Após inatividade longa, Marcos ficam registráveis e não contabilizados
    Dado um intervalo de <dias> dias sem sessão registrada
    Quando o usuário retorna e declara um Marco no primeiro ciclo após o retorno
    Então o Marco é <situacao>

    Exemplos:
      | dias | situacao                        |
      | 13   | contabilizado                   |
      | 20   | contabilizado                   |
      | 21   | registrado e não contabilizado  |
      | 45   | registrado e não contabilizado  |

  @rf-048 @critico
  Cenário: A janela de retorno dura exatamente 2 ciclos
    Dado um retorno após 30 dias sem sessão
    Quando o usuário declara um Marco em cada um dos 3 ciclos seguintes
    Então o Marco do ciclo 1 é registrado e não contabilizado
    E o Marco do ciclo 2 é registrado e não contabilizado
    E o Marco do ciclo 3 é contabilizado

  @rf-048
  Cenário: A janela de retorno também se aplica ao encerrar Trégua de Recuperação
    Dado um período de Trégua de Recuperação de 2 ciclos, encerrado
    E que não houve intervalo de 21 dias sem sessão
    Quando o usuário declara um Marco no ciclo seguinte
    Então o Marco é registrado e não contabilizado

  @rf-048 @re-009 @critico
  Cenário: A comunicação da janela de retorno é descritiva e não retira o registro
    Dada a janela de retorno ativa
    Quando o usuário declara um Marco
    Então o Marco aparece no Diário com o mesmo destaque dos demais
    E o texto informa que a contagem volta depois, no tempo presente ou futuro do sistema
    E o texto não contém verbo no imperativo dirigido ao usuário
    E o texto não recomenda intensidade, volume ou progressão

  @rf-048 @rf-042
  Cenário: O teto por ciclo continua valendo dentro da janela de retorno
    Dada a janela de retorno ativa
    Quando o usuário declara 4 Marcos com rótulos distintos no mesmo ciclo
    Então os 4 Marcos são registrados
    E nenhum é contabilizado

  # ------------------------------------------------------ Autocalibração

  @rf-042 @rf-043
  Cenário: O teto limita o perfil de alto volume e o cooldown limita o perfil especialista
    Dado o personagem "Ana", que declara 5 Marcos de rótulos distintos por ciclo
    E o personagem "Beto", que declara 1 Marco do mesmo rótulo por ciclo
    Quando 4 ciclos são encerrados como cumpridos
    Então "Ana" acumulou 8 Marcos contabilizados
    E "Beto" acumulou 2 Marcos contabilizados
    E nenhum dos dois foi classificado, rotulado ou advertido pelo aplicativo

  @rf-047 @d-012 @d-018 @defeito @critico
  Cenário: A oferta de RF-047 só é computável em eixos numéricos
    # DEFEITO DE ESPECIFICAÇÃO: D-018 rejeitou a inferência automática porque ela
    # "só funciona em eixos numéricos, criando assimetria que viola D-012".
    # RF-047 reintroduz detecção de discrepância a partir do histórico, e a
    # detecção continua sendo computável apenas em duração, distância, carga,
    # repetição e volume — nunca em amplitude ou técnica. O usuário de mobilidade
    # e o de dança nunca recebem a oferta que o de corrida recebe.
    # Resolução necessária: ou a oferta é suprimida para todos, ou o texto
    # declara explicitamente que ela cobre apenas parte dos eixos.
    Dado um histórico com Marcos declarados nos eixos "duração" e "amplitude"
    Quando uma sessão excede o histórico em ambos os eixos
    Então a oferta de declaração é apresentada para o eixo "duração"
    E a oferta de declaração não é apresentada para o eixo "amplitude"
    E a assimetria está declarada na especificação antes da implementação
