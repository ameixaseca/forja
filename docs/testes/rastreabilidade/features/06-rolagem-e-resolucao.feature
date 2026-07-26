# language: pt
# Camada: dominio | Requisitos: RF-020, RF-022, RN-003, RN-024, D-007

@dominio @rolagem
Funcionalidade: Rolagem de Resolução
  Como praticante
  Quero que cada sessão registrada resolva uma rolagem
  Para que a história avance sempre, inclusive quando a sorte vira contra mim

  Contexto:
    Dado um personagem no capítulo 1 com Vontade 0
    E um Juramento de 4 dias em curso

  @rf-020 @critico
  Cenário: A rolagem é executada ao confirmar a sessão
    Quando o usuário confirma o registro de uma sessão
    Então uma rolagem de resolução é executada
    E uma resolução é produzida e persistida
    E a rolagem não é executada antes da confirmação

  @rf-020 @critico
  Esquema do Cenário: A rolagem é 2d6 somada à Vontade
    Dado uma Vontade de <vontade>
    E dados forçados em <d1> e <d2>
    Quando a rolagem é executada
    Então o valor de "in.rolagem" é <total>
    E a faixa classificada é "<faixa>"

    Exemplos:
      | vontade | d1 | d2 | total | faixa       |
      | 0       | 1  | 1  | 2     | reviravolta |
      | 0       | 3  | 3  | 6     | reviravolta |
      | 0       | 3  | 4  | 7     | custo       |
      | 0       | 4  | 5  | 9     | custo       |
      | 0       | 5  | 5  | 10    | triunfo     |
      | 0       | 6  | 6  | 12    | triunfo     |
      | 2       | 2  | 2  | 6     | reviravolta |
      | 2       | 3  | 2  | 7     | custo       |
      | 3       | 2  | 2  | 7     | custo       |
      | 3       | 4  | 3  | 10    | triunfo     |
      | 3       | 6  | 6  | 15    | triunfo     |

  @rf-020 @critico
  Esquema do Cenário: A distribuição por faixa corresponde à Vontade
    Dado uma Vontade de <vontade>
    Quando 100000 rolagens são executadas com gerador semeado
    Então a proporção de "triunfo" é aproximadamente <triunfo> por cento, com tolerância de 1 ponto
    E a proporção de "custo" é aproximadamente <custo> por cento, com tolerância de 1 ponto
    E a proporção de "reviravolta" é aproximadamente <reviravolta> por cento, com tolerância de 1 ponto

    Exemplos:
      | vontade | triunfo | custo | reviravolta |
      | 0       | 16.7    | 41.7  | 41.7        |
      | 1       | 27.8    | 44.4  | 27.8        |
      | 2       | 41.7    | 41.7  | 16.7        |
      | 3       | 58.3    | 33.3  | 8.3         |

  @rf-020
  Cenário: A rolagem nunca é maior que 15 nem menor que 2
    Quando 10000 rolagens são executadas com Vontade 3
    Então nenhum valor produzido é menor que 5
    E nenhum valor produzido é maior que 15

  @rn-003 @d-007 @critico
  Esquema do Cenário: Nenhum resultado de rolagem reverte progresso mecânico
    Dado um personagem com Vontade 2, Força 2, capítulo 3 e 3 pontos de Fôlego
    Quando uma rolagem de faixa "<faixa>" é resolvida
    Então a Vontade permanece 2
    E a Força permanece 2
    E o capítulo permanece 3
    E o Fôlego permanece 3
    E o dia treinado permanece contado no Juramento

    Exemplos:
      | faixa       |
      | triunfo     |
      | custo       |
      | reviravolta |

  @d-007 @critico
  Cenário: A reviravolta avança a história mesmo sendo o pior resultado
    Dado uma rolagem de faixa "reviravolta"
    Quando a resolução é produzida
    Então um storylet é selecionado e um texto é exibido
    E o estado do mundo é alterado por algum efeito
    E nenhuma tela apresenta o resultado como falha do usuário

  @rf-020
  Cenário: A faixa de custo introduz uma complicação no estado do mundo
    Dado um catálogo em que existe storylet elegível para "in.rolagem" menor ou igual a 6
    Quando uma rolagem de faixa "custo" ou "reviravolta" seleciona um storylet abridor de complicação
    Então a complicação correspondente passa a aberta
    E a complicação aparece como pendência narrativa no estado do capítulo

  @rn-024 @critico
  Cenário: O resultado da rolagem é pré-requisito de seleção, nunca multiplicador
    Dado dois storylets elegíveis com pesos 5 e 10
    Quando a mesma rolagem de valor 12 é resolvida 10000 vezes com sementes distintas
    Então a razão entre as seleções aproxima-se de 1 para 2
    E nenhum peso é alterado pelo valor da rolagem

  @rf-022 @critico
  Cenário: Os efeitos são aplicados antes de compor o texto
    Dado um storylet cujo efeito define "ent.sebastiao.estado" como "encontrado"
    E cuja variante de texto é escolhida por "ent.sebastiao.conhecido"
    Quando o storylet é resolvido
    Então o estado é atualizado antes da escolha da variante
    E o texto exibido corresponde ao estado posterior ao efeito

  @rf-020
  Cenário: Uma sessão não confirmada não consome rolagem
    Dado um registro de sessão iniciado e abandonado sem confirmação
    Quando o usuário reabre o aplicativo
    Então nenhuma resolução foi produzida
    E o índice de resolução permanece inalterado
