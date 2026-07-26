# language: pt
# Camada: dominio + motor | Requisitos: RF-060..RF-070, RN-019..RN-022, RC-006, RE-007, RE-008, M-05

@compartilhamento @determinismo
Funcionalidade: Artefato de compartilhamento, semente de campanha e determinismo
  Como praticante
  Quero publicar a minha história sem publicar o meu corpo
  Para que o compartilhamento seja um convite e nunca uma exposição

  Contexto:
    Dado um personagem que acabou de concluir o capítulo 1
    E que as camadas opcionais do artefato nunca foram alteradas

  # ------------------------------------------------------------- Artefato

  @rf-060 @critico
  Esquema do Cenário: Cada evento gera a peça correspondente
    Quando o evento "<evento>" ocorre
    Então um artefato do tipo "<peca>" é gerado e oferecido

    Exemplos:
      | evento                      | peca                         |
      | capítulo concluído          | página de diário             |
      | Marco de capítulo resolvido | cena da escolha irreversível |
      | ciclo cumprido              | selo                         |
      | Marco de Superação          | cartão sóbrio                |
      | campanha finalizada         | retrospectiva narrativa      |

  @rf-061 @rn-021 @critico
  Cenário: O artefato é gerado integralmente no dispositivo
    Quando um artefato é gerado
    Então nenhuma requisição de rede é emitida durante a geração
    E nenhum dado de treino é transmitido
    E a geração funciona com o dispositivo em modo avião

  @rf-064 @rn-020 @critico
  Cenário: As camadas opcionais vêm desligadas por padrão
    Quando o artefato de "capítulo concluído" é gerado pela primeira vez
    Então a camada narrativa está presente
    E a camada de modalidades está desligada
    E a camada de ciclos está desligada
    E a camada de atributos está desligada

  @rf-063
  Cenário: Cada camada opcional é ligada e desligada individualmente
    Quando o usuário liga a camada de atributos e mantém as demais desligadas
    Então o artefato exibe atributos
    E o artefato não exibe modalidades nem ciclos

  @rn-020 @rn-009 @critico
  Cenário: Grandezas corporais nunca são disponíveis no artefato
    Quando o usuário percorre todas as camadas disponíveis do artefato
    Então não há camada de peso corporal
    E não há camada de medidas
    E não há camada de carga bruta
    E não há camada de comparação com outros usuários

  @rf-062 @critico
  Cenário: Pré-visualização integral antes de compartilhar
    Quando o usuário abre o compartilhamento de um artefato
    Então a pré-visualização exibe exatamente o que será compartilhado
    E o controle de cada camada está disponível na mesma tela
    E nada é compartilhado antes de ação explícita do usuário

  @rf-065 @rf-066 @rn-008 @critico
  Cenário: O compartilhamento usa apenas a folha nativa do sistema
    Quando o usuário aciona o compartilhamento
    Então a folha de compartilhamento nativa do sistema operacional é aberta
    E nenhuma permissão de publicação é solicitada
    E nenhum login social é solicitado
    E nenhuma permissão de contatos é solicitada

  @rf-068
  Cenário: Salvar o artefato localmente sem compartilhar
    Quando o usuário escolhe salvar o artefato
    Então o arquivo é gravado no dispositivo
    E nenhuma folha de compartilhamento é aberta

  @rf-069 @rn-019 @critico
  Cenário: Compartilhar nunca altera a progressão
    Dado um personagem com capítulo 1 concluído, Fôlego 2 e Vontade 1
    Quando o usuário compartilha 5 artefatos
    Então o capítulo permanece o mesmo
    E o Fôlego permanece 2
    E a Vontade permanece 1
    E nenhuma recompensa é concedida pelo compartilhamento

  @rf-070 @re-007 @critico
  Cenário: Uma única sugestão de compartilhamento por evento
    Dado um capítulo concluído
    Quando o usuário dispensa a sugestão de compartilhamento
    Então a sugestão não reaparece para aquele evento
    E nenhuma marcação de "não compartilhado" é exibida em qualquer tela

  @rc-006
  Cenário: Aviso na primeira publicação sobre revelar informação de saúde
    Dado que o usuário nunca compartilhou um artefato
    Quando o usuário aciona o primeiro compartilhamento
    Então um aviso informa que o conteúdo pode revelar informação de saúde
    E o aviso é exibido antes da folha de compartilhamento
    E o aviso não reaparece nas publicações seguintes

  # ------------------------------------------------------ Semente de campanha

  @rf-067 @rn-022 @critico
  Cenário: O artefato embute a semente e nunca o convidante
    Quando um artefato é gerado
    Então o artefato contém a semente de campanha
    E o artefato não contém identificador de usuário
    E o artefato não contém identificador de dispositivo ou de instalação
    E não é possível derivar do artefato quem o gerou

  @rf-067 @critico
  Cenário: Entrar por convite inicia a mesma campanha no capítulo 1
    Dada uma semente extraída de um artefato de um personagem no capítulo 4
    Quando um novo usuário inicia campanha com aquela semente
    Então a campanha do novo usuário começa no capítulo 1
    E nenhum progresso, estado ou ficha do convidante é transferido

  @rc-007
  Cenário: A métrica de convite é agregada e não identificável
    Quando 50 instalações ocorrem a partir de artefatos compartilhados
    Então a métrica registrada é uma contagem agregada
    E nenhum vínculo entre convidante e instalador é persistido

  # -------------------------------------------------------------- Determinismo

  @m-05 @critico
  Cenário: A mesma semente e as mesmas entradas produzem a mesma sequência
    Dada a semente 987654321
    E uma sequência fixa de 60 conjuntos de entradas
    Quando a travessia é simulada duas vezes
    Então as duas sequências de storylets são idênticas
    E as duas sequências de variantes de texto são idênticas

  @m-05 @critico
  Cenário: O determinismo se mantém entre plataformas
    Dada a semente 987654321 e a mesma sequência de entradas
    Quando a travessia é simulada em duas plataformas distintas
    Então as duas sequências de storylets são idênticas

  @m-05 @critico
  Cenário: Reordenar ou reexecutar não desloca o fluxo
    Dada a semente 987654321
    Quando a resolução de índice 17 é executada isoladamente
    Então o resultado é idêntico ao da resolução de índice 17 da travessia completa

  @m-05 @critico
  Esquema do Cenário: O subsistema não consulta fontes não determinísticas
    Quando o subsistema narrativo é executado sob instrumentação
    Então nenhuma chamada a "<fonte>" é registrada

    Exemplos:
      | fonte                          |
      | relógio do sistema             |
      | fuso horário                   |
      | locale                         |
      | gerador aleatório da plataforma|
      | ordenação cultural de cadeias  |

  @m-05
  Cenário: A ordenação interna é sempre por identificador ordinal
    Dado um pool cujas chaves são iteradas a partir de um dicionário
    Quando o pool é montado 100 vezes no mesmo estado
    Então a ordem resultante é idêntica nas 100 execuções
    E a ordem corresponde à ordenação ordinal dos identificadores

  @m-05
  Cenário: Nenhuma decisão do motor usa ponto flutuante
    Quando o código de seleção é inspecionado
    Então nenhuma comparação de elegibilidade, peso ou sorteio usa ponto flutuante

  @m-05 @defeito @critico
  Cenário: A lista de desativados altera a sequência da mesma semente
    # DEFEITO DE ESPECIFICAÇÃO: M-05 fixa "mesma semente, mesmas entradas e mesma
    # versão", mas a lista do kill-switch tem versão própria (D-034) e altera o
    # pool, logo a bolsa. Dois usuários com a mesma semente e a mesma versão do
    # aplicativo, com caches de kill-switch distintos, divergem — o que quebra a
    # promessa de mundo compartilhado de D-020.
    # Resolução necessária: incluir a versão da lista de desativados na
    # definição de M-05 e no artefato de convite, ou excluir os desativados do
    # cálculo da bolsa em vez de do pool.
    Dada a semente 987654321
    E o dispositivo "A" com lista de desativados de versão 3
    E o dispositivo "B" com lista de desativados de versão 4, que desativa 1 storylet de "cor"
    Quando a mesma sequência de entradas é aplicada aos dois
    Então as sequências divergem a partir da primeira resolução de "cor"
    E o teste deve reprovar até que a especificação seja reconciliada

  @m-05
  Cenário: A semente determina o mundo, não a história
    Dada a mesma semente em dois personagens
    E rolagens, atributos e escolhas distintos entre eles
    Quando ambos atravessam o capítulo 1
    Então o conjunto de storylets disponíveis é o mesmo para os dois
    E as sequências efetivamente resolvidas divergem
