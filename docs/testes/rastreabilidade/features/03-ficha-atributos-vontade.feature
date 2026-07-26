# language: pt
# Camada: dominio | Requisitos: RF-001..RF-003, RF-049, RN-003, RN-005, RN-009, RN-011, RN-013

@dominio @ficha
Funcionalidade: Ficha de personagem, atributos e Vontade
  Como praticante em campanha
  Quero que a ficha derive exclusivamente do que eu registrei
  Para que constância e superação tenham efeitos distintos e nenhum deles seja comprável

  Contexto:
    Dado um personagem recém-criado com todos os atributos em 0

  # ------------------------------------------------------------ Criação

  @rf-001
  Cenário: Criar personagem com nome, arquétipo e origem narrativa
    Quando o usuário cria um personagem com nome, arquétipo e origem narrativa
    Então o personagem é persistido
    E a campanha inicia no capítulo 1
    E a semente de campanha é gerada e persistida

  @rf-003 @critico
  Cenário: Não há distribuição manual de pontos
    Quando o usuário abre a ficha de personagem
    Então não há controle para atribuir, comprar, redistribuir ou resetar pontos
    E cada atributo exibe a origem do seu valor no histórico registrado

  @rf-002 @critico
  Cenário: Os atributos derivam exclusivamente do histórico registrado
    Dado um histórico com 6 Marcos contabilizados em "Força" e 0 em "Vigor"
    Quando a ficha é recalculada a partir do zero
    Então a "Força" resultante é 2
    E o "Vigor" resultante é 0
    E o resultado é idêntico ao valor persistido antes do recálculo

  # ------------------------------------------------------- Força, Vigor, Destreza

  @rf-049 @critico
  Esquema do Cenário: Cada 3 Marcos contabilizados no mesmo atributo concedem 1 ponto
    Dado <marcos> Marcos contabilizados em "Força"
    Quando a ficha é avaliada
    Então a "Força" é <forca>

    Exemplos:
      | marcos | forca |
      | 0      | 0     |
      | 2      | 0     |
      | 3      | 1     |
      | 5      | 1     |
      | 6      | 2     |
      | 14     | 4     |
      | 15     | 5     |
      | 21     | 5     |

  @rf-049 @critico
  Cenário: O atributo tem teto de 5
    Dado 30 Marcos contabilizados em "Vigor"
    Quando a ficha é avaliada
    Então o "Vigor" é 5
    E os Marcos excedentes permanecem no Diário sem efeito adicional

  @rf-049 @lacuna
  Cenário: Os Marcos não são consumidos ao gerar um ponto
    # LACUNA: RF-049 não diz se os 3 Marcos são consumidos ou apenas contados.
    # Proposto: contagem acumulada, nunca consumo — evita estado derivado divergente.
    Dado 3 Marcos contabilizados em "Destreza" e a "Destreza" em 1
    Quando mais 3 Marcos são contabilizados em "Destreza"
    Então a "Destreza" passa a 2
    E o total de Marcos contabilizados em "Destreza" é 6

  @rn-011 @critico
  Cenário: Superação alimenta apenas Força, Vigor e Destreza
    Dado 12 Marcos contabilizados, distribuídos entre os três atributos físicos
    Quando a ficha é avaliada
    Então a Vontade permanece no valor derivado dos ciclos cumpridos
    E nenhum Marco altera a Vontade

  @rn-013
  Cenário: A superação é sempre relativa ao histórico do próprio usuário
    Dado dois personagens com históricos distintos
    E que ambos declaram um Marco de mesma grandeza absoluta
    Quando os Marcos são contabilizados
    Então cada Marco é avaliado apenas contra o histórico do seu próprio personagem
    E nenhuma comparação entre os dois personagens é realizada ou exibida

  # --------------------------------------------------------------- Vontade

  @rn-005 @critico
  Esquema do Cenário: A Vontade cresce por ciclos cumpridos acumulados, com teto de 3
    Dado <ciclos> ciclos cumpridos acumulados
    Quando a ficha é avaliada
    Então a Vontade é <vontade>

    Exemplos:
      | ciclos | vontade |
      | 0      | 0       |
      | 1      | 0       |
      | 2      | 1       |
      | 5      | 1       |
      | 6      | 2       |
      | 13     | 2       |
      | 14     | 3       |
      | 40     | 3       |

  @rn-003 @critico
  Cenário: Ciclo quebrado não reduz a Vontade
    Dado 7 ciclos cumpridos acumulados e Vontade 2
    Quando 3 ciclos consecutivos são encerrados como quebrados
    Então os ciclos cumpridos acumulados permanecem 7
    E a Vontade permanece 2

  @rn-005
  Cenário: Ciclo de Trégua não conta para a Vontade
    Dado 5 ciclos cumpridos acumulados e Vontade 1
    Quando 2 ciclos são encerrados como Trégua
    Então os ciclos cumpridos acumulados permanecem 5
    E a Vontade permanece 1

  @rn-005
  Cenário: Ciclo de Trégua de Recuperação não conta para a Vontade
    Dado 5 ciclos cumpridos acumulados e Vontade 1
    Quando 3 ciclos são encerrados como Trégua de Recuperação
    Então os ciclos cumpridos acumulados permanecem 5
    E a Vontade permanece 1

  @rn-005 @critico
  Cenário: A Vontade é o único atributo que modifica a rolagem
    Dado um personagem com Força 5, Vigor 5, Destreza 5 e Vontade 0
    Quando 200 rolagens são executadas
    Então o modificador aplicado em toda rolagem é 0
    E a distribuição resultante corresponde à de Vontade 0

  @rn-005 @critico
  Cenário: Força, Vigor e Destreza atuam apenas como pré-requisito de elegibilidade
    Dado um personagem com Força 3
    Quando o motor filtra os storylets elegíveis
    Então storylets que exigem "in.atributo.forca" maior ou igual a 3 tornam-se elegíveis
    E nenhum peso de sorteio é alterado pelo valor da Força
    E nenhuma probabilidade de resultado de rolagem é alterada pelo valor da Força

  # ----------------------------------------------------- Fronteiras do produto

  @rn-009 @re-004 @critico
  Cenário: Peso corporal e composição jamais aparecem como elemento de jogo
    Quando o usuário percorre a ficha, o Fechamento de ciclo e o Diário
    Então nenhuma tela exibe peso corporal
    E nenhuma tela exibe percentual de gordura
    E nenhuma tela exibe meta calórica
    E não há campo para registrar qualquer uma dessas grandezas

  @rf-002
  Cenário: A ficha é reconstruível a partir do Diário após reinstalação com backup
    Dado um personagem com histórico de 20 ciclos e backup em conta ativa
    Quando o aplicativo é reinstalado e o backup restaurado
    Então todos os atributos são idênticos aos anteriores à reinstalação
    E o número de ciclos cumpridos acumulados é idêntico
