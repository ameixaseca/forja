# language: pt
# Camada: dominio | Requisitos: RF-024, RF-026, RF-027, RF-028, RF-031, RF-033, RN-026, M-07

@dominio @escolhas @diario
Funcionalidade: Pontos de escolha, irreversibilidade e Diário
  Como praticante
  Quero escolher em momentos que importam e reler tudo o que aconteceu
  Para que eu volte a ser o intérprete da minha própria campanha

  Contexto:
    Dado um personagem no capítulo 1
    E um catálogo com ao menos 4 storylets de "arco" elegíveis

  # ------------------------------------------------ Ponto de escolha intermediário

  @rf-024 @m-07 @critico
  Esquema do Cenário: O ponto intermediário arma em 6 resoluções e exige 2 elegíveis
    Dado um capítulo com <resolucoes> resoluções acumuladas
    E <elegiveis> storylets de "arco" elegíveis
    Quando a resolução é executada
    Então o número de opções apresentadas ao usuário é <opcoes>

    Exemplos:
      | resolucoes | elegiveis | opcoes |
      | 5          | 4         | 1      |
      | 6          | 1         | 1      |
      | 6          | 2         | 2      |
      | 6          | 5         | 3      |
      | 7          | 3         | 3      |

  @rf-024 @m-07 @critico
  Cenário: Com menos de dois elegíveis o ponto degrada e permanece armado
    Dado um capítulo com 6 resoluções acumuladas e 1 storylet de "arco" elegível
    Quando a resolução é executada
    Então a seleção é automática
    E o ponto de escolha permanece armado
    Quando uma resolução seguinte ocorre com 3 storylets de "arco" elegíveis
    Então 3 opções são apresentadas

  @rf-024 @m-07
  Cenário: O ponto intermediário dispara uma única vez por capítulo
    Dado um ponto de escolha intermediário já resolvido no capítulo 1
    Quando 10 resoluções adicionais ocorrem no capítulo 1
    Então nenhuma delas apresenta escolha
    E ao iniciar o capítulo 2 o ponto intermediário volta a ficar armado

  @rf-024 @critico
  Cenário: O número de opções nunca excede três
    Dado um capítulo com 8 resoluções acumuladas e 12 storylets de "arco" elegíveis
    Quando o ponto de escolha é apresentado
    Então o número de opções é 3

  @rf-024
  Cenário: A maioria das resoluções não interrompe o usuário com escolha
    Dado um capítulo atravessado com 12 resoluções
    Quando a travessia é concluída
    Então no máximo 2 resoluções apresentaram escolha
    E as demais foram automáticas

  # ----------------------------------------------------- Marco de capítulo

  @rf-028 @critico
  Cenário: O Marco de capítulo apresenta no mínimo duas escolhas irreversíveis
    Dado um Marco de capítulo disparado
    Quando o storylet de desfecho é apresentado
    Então há ao menos 2 opções distintas
    E cada opção declara efeitos próprios sobre o estado do mundo

  @rf-028 @critico
  Cenário: A escolha é irreversível e não oferece desfazer
    Dado um Marco de capítulo com as opções "Seguir com a romaria" e "Tomar a frente sozinho"
    Quando o usuário confirma "Tomar a frente sozinho"
    Então "mem.andou_sozinho" é 1
    E não há controle de desfazer, voltar ou refazer
    E reabrir a entrada no Diário não permite alterar a escolha

  @rf-028 @critico
  Cenário: Os efeitos do storylet aplicam sempre; os da escolha, só na escolha tomada
    Dado um storylet de desfecho com efeito próprio que fecha as complicações
    E as opções "A" e "B" com efeitos distintos
    Quando o usuário confirma a opção "A"
    Então as complicações estão fechadas
    E os efeitos de "A" foram aplicados
    E nenhum efeito de "B" foi aplicado

  @rf-028 @lacuna @critico
  Cenário: Encerramento do aplicativo durante a apresentação da escolha
    # LACUNA: RF-028 declara a escolha irreversível mas não especifica o momento
    # da persistência. Proposto: efeitos do storylet persistem ao apresentar;
    # efeitos da escolha persistem apenas na confirmação; a escolha é reapresentada.
    Dado um Marco de capítulo apresentado e nenhuma opção confirmada
    Quando o aplicativo é encerrado abruptamente e reaberto
    Então os efeitos do storylet de desfecho estão persistidos
    E nenhum efeito de opção foi aplicado
    E a mesma escolha é reapresentada com as mesmas opções

  # ---------------------------------------------------------------- Diário

  @rf-026 @critico
  Cenário: Toda resolução é registrada no Diário com data e sessão vinculada
    Quando 5 sessões são registradas e resolvidas
    Então o Diário contém 5 entradas
    E cada entrada tem data, texto da resolução e referência à sessão que a produziu

  @rf-026
  Cenário: Resoluções de Trégua e de reencontro também aparecem no Diário
    Dada uma resolução de Trégua e uma resolução de reencontro
    Quando o Diário é consultado
    Então ambas aparecem como entradas
    E ambas são visualmente indistinguíveis de uma resolução comum quanto a julgamento

  @rf-026
  Cenário: O Diário é navegável por capítulo
    Dado um personagem no capítulo 3, com 30 resoluções registradas
    Quando o usuário navega o Diário
    Então as entradas são agrupadas por capítulo
    E o desfecho de cada capítulo concluído é identificável

  @rf-027 @critico
  Cenário: Exportar o Diário em JSON estruturado
    Dado um Diário com 30 entradas
    Quando o usuário exporta o Diário em JSON
    Então o arquivo gerado é JSON válido
    E contém todas as 30 entradas
    E contém data, capítulo, texto e versão do aplicativo por entrada
    E contém a semente de campanha

  @rf-027
  Cenário: Exportar o Diário em markdown legível
    Quando o usuário exporta o Diário em markdown
    Então o arquivo gerado é legível como texto corrido
    E não contém identificador de storylet nem nome de qualidade

  @rf-027 @lacuna
  Cenário: O esquema do JSON exportado é versionado
    # LACUNA: RF-027 não especifica o esquema do JSON de exportação, que é
    # obrigação de portabilidade (LGPD art. 18, V). Proposto: campo "esquema".
    Quando o usuário exporta o Diário em JSON
    Então o arquivo declara um campo de versão de esquema
    E o esquema está documentado publicamente

  # -------------------------------------------------- Imutabilidade do conteúdo

  @rf-031 @rn-026 @critico
  Cenário: O usuário não tem meio de criar, editar ou importar storylet
    Quando o usuário percorre todas as telas do aplicativo
    Então não há editor de conteúdo narrativo
    E não há importação de arquivo de campanha
    E não há exportação de storylet, catálogo ou identificador de storylet
    E o Diário exportado não permite reimportação como conteúdo

  @rn-026
  Cenário: O texto do Diário não é editável pelo usuário
    Dada uma entrada de Diário com o texto de uma resolução
    Quando o usuário abre a entrada
    Então o texto da resolução é somente leitura
    E apenas a nota livre do usuário, vinculada à sessão, é editável
