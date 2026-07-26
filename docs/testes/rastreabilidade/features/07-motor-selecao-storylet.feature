# language: pt
# Camada: motor | Requisitos: RF-021, RF-025, RF-030A, RF-039B, RN-024, RN-025, RN-031, RN-032, RN-036, M-01..M-09
# Estes cenários rodam sobre catálogos sintéticos, sem tocar interface, banco ou rede.

@motor @selecao
Funcionalidade: Seleção de storylet
  Como motor narrativo
  Quero selecionar exatamente um storylet por resolução, de forma determinística
  Para que o enredo escrito sempre vença o procedural e nenhuma resolução fique sem texto

  Contexto:
    Dado um catálogo sintético com bandas "espinha", "arco" e "cor"
    E que a banda "cor" contém 1 storylet de subclasse "fallback" e 6 de subclasse "ausencia"
    E um gerador determinístico semeado com a semente 424242

  # ---------------------------------------------- Etapa 1: supressão por entrada

  @m-01 @rn-031 @critico
  Cenário: Em ciclo de Trégua, apenas a banda "cor" é consultada
    Dado "in.tregua" igual a 1
    E que existem storylets elegíveis nas bandas "espinha" e "arco"
    Quando a resolução é executada
    Então a banda da resolução é "cor"
    E as bandas "espinha" e "arco" não foram sequer filtradas
    E nenhum efeito sobre "comp.", "ent." ou "mem." foi aplicado

  @m-01 @rn-031
  Cenário: A supressão por Trégua ocorre antes da filtragem, não por predicado de autoria
    Dado "in.tregua" igual a 1
    E um storylet de "arco" cujo "requer" é satisfeito e que não declara guarda contra Trégua
    Quando a resolução é executada
    Então aquele storylet não foi avaliado
    E a resolução veio da banda "cor"

  @m-02 @critico
  Cenário: Na resolução de reencontro, a seleção vem da subclasse "ausencia"
    Dado "in.reencontro" igual a 1
    E que existem storylets elegíveis nas três bandas
    Quando a resolução é executada
    Então a banda da resolução é "cor"
    E a subclasse do storylet resolvido é "ausencia"

  @m-02 @critico
  Cenário: O reencontro dura exatamente uma resolução
    Dado "in.reencontro" igual a 1 na resolução corrente
    Quando a resolução é executada
    E uma segunda resolução é executada com "in.reencontro" igual a 0
    Então a primeira resolução tem subclasse "ausencia"
    E a segunda resolução pode vir de qualquer banda

  @m-02 @m-01
  Cenário: Reencontro tem precedência sobre Trégua quando ambos estão ativos
    Dado "in.tregua" igual a 1
    E "in.reencontro" igual a 1
    Quando a resolução é executada
    Então a subclasse do storylet resolvido é "ausencia"

  @m-08 @rn-036 @critico
  Cenário: Segunda sessão do dia consulta apenas a banda "cor"
    Dado "in.sessao_secundaria" igual a 1
    E que existem storylets elegíveis nas bandas "espinha" e "arco"
    Quando a resolução é executada
    Então a banda da resolução é "cor"

  @rf-030a @critico
  Esquema do Cenário: A aplicação calcula as entradas de ausência, não o motor
    Dado que a última sessão registrada ocorreu há <dias> dias
    E que o último ciclo <situacao>
    Quando a aplicação prepara as entradas da resolução
    Então "in.reencontro" é <reencontro>

    Exemplos:
      | dias | situacao                  | reencontro |
      | 1    | foi cumprido              | 0          |
      | 9    | foi cumprido              | 0          |
      | 10   | foi cumprido              | 1          |
      | 31   | foi cumprido              | 1          |
      | 2    | foi de Trégua e encerrou  | 1          |
      | 2    | foi de Recuperação e encerrou | 1      |

  @rf-030a
  Cenário: O motor não conhece calendário nem relógio
    Quando o subsistema narrativo é inspecionado
    Então nenhuma chamada a relógio, fuso, data ou intervalo é executada dentro dele
    E "in.reencontro" e "in.sessao_secundaria" chegam já resolvidos como entrada

  # ------------------------------------------------------- Etapa 2: filtragem

  @rn-024 @critico
  Cenário: Storylet com pré-requisito não satisfeito nunca é elegível
    Dado um storylet cujo "requer" exige "in.atributo.forca" maior ou igual a 3
    E um personagem com Força 2
    Quando a resolução é executada 1000 vezes com sementes distintas
    Então aquele storylet nunca é selecionado

  @rn-032 @rf-039b @m-03 @critico
  Cenário: Storylet desativado pelo kill-switch é excluído da filtragem
    Dada uma lista de desativados contendo o id de um storylet de "cor"
    Quando a resolução é executada 1000 vezes com sementes distintas
    Então aquele storylet nunca é selecionado
    E nenhum estado já gravado foi alterado pela desativação
    E nenhuma entrada do Diário foi removida

  @m-03 @rf-039b @critico
  Cenário: O kill-switch nunca desativa storylet de "espinha"
    Dada uma lista de desativados contendo o id de um storylet de "espinha"
    Quando a lista é aplicada
    Então o storylet de "espinha" permanece elegível
    E o id ignorado é registrado em log interno de diagnóstico

  @m-03 @critico
  Cenário: O kill-switch nunca desativa o storylet de fallback
    Dada uma lista de desativados contendo "st_cor_fallback"
    Quando a lista é aplicada
    Então "st_cor_fallback" permanece elegível

  # -------------------------------------------------------- Etapa 3: pressão

  @m-06 @critico
  Esquema do Cenário: A regra de pressão restringe a banda "arco" a fechamentos
    Dado um capítulo com <resolucoes> resoluções acumuladas
    E que existem storylets de "arco" que fecham complicação e storylets de "arco" que não fecham
    Quando o pool da banda "arco" é montado
    Então o estágio do capítulo é "<estagio>"
    E o pool contém storylets que não fecham complicação: <contem>

    Exemplos:
      | resolucoes | estagio  | contem |
      | 0          | abertura | sim    |
      | 5          | meio     | sim    |
      | 11         | meio     | sim    |
      | 12         | pressao  | não    |
      | 25         | pressao  | não    |

  @m-06 @critico
  Cenário: Sob pressão, sempre existe ao menos um fechamento elegível
    Dado um capítulo em estágio "pressao"
    E uma complicação aberta cujo caminho base não exige atributo
    E um personagem com todos os atributos em 0
    Quando o pool da banda "arco" é montado
    Então o pool contém ao menos 1 storylet
    E ao menos 1 storylet do pool fecha a complicação aberta

  @m-06
  Cenário: Sem complicação aberta, a pressão não esvazia a resolução
    Dado um capítulo em estágio "pressao"
    E nenhuma complicação aberta
    Quando a resolução é executada
    Então o pool da banda "arco" está vazio
    E a resolução vem da banda "cor"

  # ------------------------------------------------- Etapa 4: estratificação

  @rf-021 @critico
  Esquema do Cenário: A banda superior com elegíveis descarta as inferiores
    Dado que há <espinha> storylets elegíveis em "espinha"
    E <arco> storylets elegíveis em "arco"
    E <cor> storylets elegíveis em "cor"
    Quando a resolução é executada
    Então a banda da resolução é "<banda>"

    Exemplos:
      | espinha | arco | cor | banda   |
      | 1       | 4    | 20  | espinha |
      | 0       | 4    | 20  | arco    |
      | 0       | 0    | 20  | cor     |
      | 1       | 0    | 0   | espinha |

  # --------------------------------------------- Etapa 5 e 6: bolsa e reposição

  @rn-025 @critico
  Cenário: Storylet sorteado sai da bolsa e não retorna até o esgotamento
    Dada uma bolsa de "cor" com 10 storylets de peso 1
    Quando 10 resoluções consecutivas são executadas
    Então os 10 storylets distintos foram exibidos exatamente uma vez cada

  @rn-025
  Cenário: A bolsa de "cor" é reposta ao esgotar
    Dada uma bolsa de "cor" com 10 storylets de peso 1
    Quando 11 resoluções consecutivas são executadas
    Então a décima primeira resolução vem de um storylet já exibido

  @m-09 @critico
  Esquema do Cenário: A fila de exclusão K é calculada sobre o pool elegível efetivo
    Dado um pool elegível de "cor" com <pool> storylets
    E 6 resoluções de "cor" por capítulo
    Quando a bolsa é reposta
    Então o valor de K aplicado é <k>

    Exemplos:
      | pool | k  |
      | 100  | 18 |
      | 45   | 18 |
      | 40   | 16 |
      | 20   | 8  |
      | 10   | 4  |

  @m-09 @critico
  Cenário: K nunca é calculado sobre o total da banda quando a camada tonal reduz o pool
    Dada uma banda "cor" com 150 storylets, dos quais 60 são tonais e incompatíveis com o tom corrente
    Quando a bolsa é reposta
    Então o pool elegível considerado é 90
    E K é 18
    E K não é 60

  @rn-025
  Cenário: Os últimos K vistos são excluídos da bolsa reposta
    Dado um pool elegível de "cor" com 40 storylets e K igual a 16
    Quando a bolsa é reposta
    Então os 16 storylets mais recentemente vistos não estão na bolsa nova
    E os 24 restantes estão na bolsa nova

  @rn-025
  Cenário: A bolsa de "arco" é reposta apenas na virada de capítulo
    Dada uma bolsa de "arco" esgotada no capítulo 1
    Quando 5 resoluções adicionais ocorrem ainda no capítulo 1
    Então nenhuma delas vem da banda "arco"
    E ao virar para o capítulo 2 a bolsa de "arco" do capítulo 2 é montada do zero

  @rn-025 @critico
  Cenário: A bolsa de "espinha" nunca é reposta
    Dado um capítulo cuja abertura já foi exibida
    Quando 30 resoluções adicionais ocorrem no mesmo capítulo
    Então a abertura não é exibida novamente

  @rn-024
  Cenário: O peso é multiplicidade de cópias na bolsa, não probabilidade contínua
    Dada uma bolsa com o storylet "A" de peso 3 e o storylet "B" de peso 1
    Quando a bolsa é montada
    Então a bolsa contém exatamente 4 entradas
    E 3 entradas referenciam "A"
    E 1 entrada referencia "B"

  # ------------------------------------------------- Etapa 8: rede de segurança

  @m-04 @rf-025 @critico
  Cenário: Sem elegíveis em nenhuma banda, a rede devolve o fallback
    Dado que nenhum storylet de "espinha", "arco" ou "cor" tem o "requer" satisfeito
    Quando a resolução é executada
    Então o storylet resolvido é "st_cor_fallback"
    E a resolução não fica vazia

  @m-04 @rn-007 @critico
  Cenário: A rede de segurança jamais devolve o desfecho de capítulo
    Dado um capítulo em estágio "meio" com 0 pontos de Fôlego
    E que nenhum storylet tem o "requer" satisfeito
    Quando a resolução é executada
    Então o storylet resolvido é "st_cor_fallback"
    E o storylet de desfecho do capítulo não foi selecionado
    E o capítulo corrente não foi incrementado
    E nenhum ponto de Fôlego foi consumido

  @m-04
  Cenário: O storylet de fallback não tem predicado nem efeito
    Quando "st_cor_fallback" é inspecionado no catálogo
    Então ele não declara "requer"
    E ele não declara "efeitos"
    E ele declara exatamente uma variante de texto sem "quando"

  # ------------------------------------------------------------- Pureza

  @rf-036 @critico
  Cenário: A resolução é função pura de estado, entradas e índice
    Dado um estado, um conjunto de entradas e um índice de resolução
    Quando a resolução é executada duas vezes com os mesmos argumentos
    Então as duas saídas são idênticas
    E nenhuma escrita em disco ocorreu
    E nenhuma chamada de rede ocorreu

  @rf-035 @critico
  Cenário: O subsistema narrativo não conhece o domínio de treino
    Quando a superfície pública do subsistema narrativo é inspecionada
    Então nenhum tipo, campo ou parâmetro menciona treino, Juramento, Fôlego, Superação, sessão ou tela
    E toda entrada chega como qualidade do espaço "in."
