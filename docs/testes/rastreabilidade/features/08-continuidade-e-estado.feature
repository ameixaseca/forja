# language: pt
# Camada: motor | Requisitos: RF-022, RF-023, RF-032, RF-034, RF-130, RF-131, RN-030, RN-033, T-16

@motor @continuidade
Funcionalidade: Estado do mundo, reconhecimento e continuidade
  Como motor narrativo
  Quero manter estado persistente de entidades, complicações e memória
  Para que retornos sejam explicitamente reconhecidos e o mundo pareça lembrar

  Contexto:
    Dado um catálogo com a entidade "sebastiao", de estado inicial "ausente"
    E um estado de mundo carregado com todas as qualidades no valor inicial

  # ------------------------------------------------------------- Qualidades

  @rf-022 @critico
  Esquema do Cenário: Os efeitos alteram o estado conforme o tipo da qualidade
    Dada a qualidade "<qualidade>" com valor <inicial>
    Quando o efeito "<operacao>" é aplicado com o argumento <argumento>
    Então o valor resultante é <resultado>

    Exemplos:
      | qualidade   | inicial | operacao | argumento | resultado |
      | arco.sede   | 1       | somar    | 1         | 2         |
      | arco.sede   | 5       | somar    | 1         | 5         |
      | arco.sede   | 0       | somar    | -1        | 0         |
      | arco.sede   | 3       | definir  | 0         | 0         |
      | comp.x      | 0       | definir  | 1         | 1         |

  @rf-022 @critico
  Cenário: A operação somar satura nos limites do domínio declarado
    Dada a qualidade "arco.sede" com domínio de 0 a 5 e valor 4
    Quando o efeito soma 10
    Então o valor resultante é 5
    E nenhuma exceção é lançada

  @rf-022 @critico
  Esquema do Cenário: Efeito sobre espaços reservados é rejeitado
    Quando um catálogo declara efeito sobre a qualidade "<qualidade>"
    Então o carregamento do catálogo é recusado
    E o teste T-02 da ESPEC reprova

    Exemplos:
      | qualidade        |
      | in.rolagem       |
      | in.tregua        |
      | sys.resolucoes   |
      | cap.resolucoes   |
      | cap.estagio      |

  @rf-131 @critico
  Cenário: Nomes de qualidade são ASCII minúsculos separados por ponto
    Quando o dicionário de qualidades é validado
    Então todo nome corresponde ao padrão de letras minúsculas, dígitos, sublinhado e ponto
    E nenhum nome contém acento, espaço ou caractere fora de ASCII
    E nenhum nome contém texto destinado a exibição

  # --------------------------------------------------- Contadores de capítulo

  @critico
  Esquema do Cenário: O estágio do capítulo é derivado, nunca escrito
    Dado um capítulo com <resolucoes> resoluções acumuladas
    E que as condições de Marco de capítulo <marco>
    Quando o estágio é avaliado
    Então "cap.estagio" é "<estagio>"

    Exemplos:
      | resolucoes | marco             | estagio  |
      | 0          | não estão satisfeitas | abertura |
      | 1          | não estão satisfeitas | meio     |
      | 11         | não estão satisfeitas | meio     |
      | 12         | não estão satisfeitas | pressao  |
      | 30         | não estão satisfeitas | pressao  |
      | 6          | estão satisfeitas     | desfecho |
      | 20         | estão satisfeitas     | desfecho |

  @critico
  Cenário: O contador de resoluções do capítulo zera na virada
    Dado um capítulo 1 com 17 resoluções acumuladas
    Quando o Marco de capítulo é resolvido e o capítulo 2 inicia
    Então "cap.resolucoes" é 0
    E "sys.resolucoes" permanece 17

  @critico
  Cenário: O contador global é monotônico e nunca é zerado
    Dado "sys.resolucoes" igual a 43
    Quando 3 capítulos são atravessados
    Então "sys.resolucoes" é maior que 43
    E "sys.resolucoes" nunca decresce entre duas leituras consecutivas

  # ------------------------------------------------------ Entidades e memória

  @rf-023 @critico
  Cenário: O conhecimento de entidade é mantido automaticamente
    Dado "ent.sebastiao.conhecido" igual a 0
    Quando um storylet que declara a entidade "sebastiao" é resolvido
    Então "ent.sebastiao.conhecido" é maior ou igual a 1
    E nenhum efeito declarado no catálogo escreveu essa qualidade

  @rf-023 @critico
  Cenário: O retorno de uma entidade é explicitamente reconhecido no texto
    Dado um storylet ambivalente que declara a entidade "sebastiao"
    Quando o storylet é resolvido com "ent.sebastiao.conhecido" igual a 0
    E o mesmo storylet é resolvido depois com "ent.sebastiao.conhecido" igual a 2
    Então as duas resoluções exibem referências de texto distintas
    E a segunda referência corresponde à variante de retorno

  @rf-023 @critico
  Cenário: O marcador de visto é mantido automaticamente por storylet
    Dado "sys.visto.st_c1_sebastiao_encontro" ausente do estado
    Quando aquele storylet é resolvido
    Então "sys.visto.st_c1_sebastiao_encontro" existe e é maior ou igual a 1

  @rf-023 @critico
  Cenário: Uma qualidade de memória escrita num capítulo é lida em capítulo posterior
    Dado "mem.deu_agua" igual a 0 no capítulo 1
    Quando um storylet do capítulo 1 define "mem.deu_agua" como 1
    E o personagem alcança o capítulo 2
    Então existe ao menos um storylet do capítulo 2 cujo texto varia conforme "mem.deu_agua"
    E a variante exibida corresponde ao valor 1

  @rf-023
  Cenário: Complicação é dívida de capítulo e não atravessa a virada em aberto
    Dado o capítulo 1 com "comp.carga_demais" aberta
    Quando o Marco de capítulo é resolvido
    Então "comp.carga_demais" está fechada
    E nenhuma complicação do capítulo 1 permanece aberta no capítulo 2

  # ------------------------------------------- Compatibilidade entre releases

  @rf-130 @t-16 @critico
  Cenário: Estado com qualidade órfã carrega sem exceção
    Dado um estado persistido contendo a qualidade "comp.removida_na_v3"
    E uma versão do aplicativo cujo catálogo não declara aquela qualidade
    Quando o estado é carregado
    Então nenhuma exceção de desserialização é lançada
    E a qualidade órfã é ignorada
    E a campanha em andamento permanece jogável

  @rf-130
  Cenário: Qualidade nova ausente no estado antigo assume o valor inicial
    Dado um estado persistido por uma versão anterior, sem a qualidade "mem.nova"
    Quando o estado é carregado por uma versão que declara "mem.nova" com inicial 0
    Então "mem.nova" é lida como 0
    E nenhuma migração explícita é necessária

  @rn-030 @rf-034 @critico
  Cenário: Atualização do aplicativo não corrompe campanha em andamento
    Dada uma campanha no capítulo 3 com 4 complicações fechadas e 2 memórias escritas
    Quando o aplicativo é atualizado para a versão seguinte
    Então o capítulo corrente permanece 3
    E todas as memórias escritas permanecem legíveis
    E o Diário permanece íntegro
    E a próxima resolução ocorre normalmente

  @rn-030
  Cenário: Mudança não aditiva no dicionário é detectada antes do release
    Dado um catálogo candidato que remove a qualidade "mem.andou_sozinho"
    E que a qualidade é lida por storylets do capítulo 2
    Quando a suíte de catálogo é executada
    Então o teste T-08 reprova
    E o release é bloqueado

  @rf-033
  Cenário: Cada entrada do Diário registra a versão do aplicativo
    Quando uma resolução é registrada no Diário
    Então a entrada contém a versão do aplicativo que a produziu
    E a versão é consultável para rastreabilidade de correção

  # ------------------------------------------------------- Múltiplas campanhas

  @rf-032 @lacuna @critico
  Cenário: Duas campanhas coexistem com estado independente
    # LACUNA CRÍTICA: RF-032 admite campanhas simultâneas, mas o modelo de
    # resolução pressupõe uma campanha por sessão registrada. Não está
    # especificado se uma sessão resolve todas as campanhas ativas, apenas a
    # selecionada, ou se o Fôlego é consumido por campanha.
    # Comportamento proposto: uma campanha é "corrente"; a sessão resolve apenas
    # ela; Fôlego, ciclo e ficha são globais e compartilhados.
    Dadas duas campanhas ativas, "A Longa Seca" no capítulo 2 e "Campanha B" no capítulo 1
    E que "A Longa Seca" é a campanha corrente
    Quando uma sessão é registrada e resolvida
    Então uma resolução é produzida apenas para "A Longa Seca"
    E o estado de "Campanha B" permanece inalterado
    E o Fôlego, o ciclo e a ficha são compartilhados pelas duas campanhas

  @rf-032 @lacuna
  Cenário: O Fôlego consumido por um Marco de capítulo não é cobrado duas vezes
    Dadas duas campanhas ativas e 2 pontos de Fôlego
    Quando o Marco de capítulo de "A Longa Seca" é resolvido
    Então o Fôlego passa a 0
    E o Marco de capítulo de "Campanha B" não é elegível até novo acúmulo
