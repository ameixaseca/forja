# language: pt
# Camada: catalogo | Requisitos: RF-037, RF-100..RF-103, RN-029, T-01..T-34
# Estes cenários rodam em CI sobre o catálogo real e sobre as fixtures negativas.

@catalogo
Funcionalidade: Suíte de catálogo e simulador
  Como responsável pelo release
  Quero que o conteúdo escrito seja verificável por ferramenta
  Porque sem portão de publicação a suíte é a única defesa antes da produção

  Contexto:
    Dado o catálogo real da campanha "A Longa Seca"
    E o dicionário de qualidades e a lista de entidades declarados

  # -------------------------------------------------- Testes estáticos de forma

  @t-01 @critico
  Cenário: Todo identificador de storylet é único
    Quando o catálogo é carregado
    Então não há dois storylets com o mesmo identificador

  @t-02 @critico
  Cenário: Nenhum efeito escreve espaço reservado
    Quando todos os efeitos do catálogo são inspecionados
    Então nenhum escreve qualidade dos espaços "in.", "sys." ou "cap."

  @t-03
  Cenário: Todo valor comparado pertence ao domínio da qualidade
    Quando todos os predicados do catálogo são inspecionados
    Então todo valor comparado com qualidade de tipo enum pertence ao conjunto declarado
    E todo valor comparado com qualidade de tipo inteiro está entre o mínimo e o máximo declarados

  @t-04
  Cenário: A profundidade de predicado não excede 3
    Quando todos os predicados do catálogo são inspecionados
    Então nenhum tem profundidade de aninhamento maior que 3

  @t-05 @critico
  Cenário: Todo storylet tem variante de fallback
    Quando todos os storylets são inspecionados
    Então a última variante de texto de cada storylet não declara "quando"

  @t-06
  Cenário: Toda entidade referenciada existe e tem estado inicial
    Quando todas as referências de entidade são inspecionadas
    Então cada entidade referenciada consta da lista de entidades
    E cada entidade tem estado inicial declarado no dicionário de qualidades

  @t-08
  Cenário: Toda qualidade lida é escrita por algum efeito
    Quando todas as leituras de qualidade são inspecionadas
    Então cada qualidade lida ou é escrita por algum efeito do catálogo
    Ou pertence aos espaços "in.", "sys." ou "cap."

  @t-14
  Cenário: Nenhum nome de qualidade contém caractere fora de ASCII
    Quando o dicionário de qualidades é inspecionado
    Então todo nome é ASCII

  @t-26 @rf-123 @critico
  Cenário: Nenhum storylet contém prosa embutida
    Quando todos os storylets são inspecionados
    Então todo campo de texto é uma referência de recurso
    E nenhuma cadeia destinada a exibição consta do catálogo

  @t-33 @critico
  Cenário: Nenhum storylet de capítulo lê o contador global
    Quando os predicados de storylets com capítulo declarado são inspecionados
    Então nenhum referencia "sys.resolucoes"

  # ------------------------------------------- Regra de reconhecimento (T-07)

  @t-07 @critico
  Esquema do Cenário: A classificação por alcançabilidade determina o número de variantes
    Dado um storylet que declara a entidade "sebastiao"
    E cujo "requer" <condicao>
    Quando o storylet é classificado
    Então a classe é "<classe>"
    E o número mínimo de variantes exigido é <variantes>

    Exemplos:
      | condicao                                          | classe          | variantes |
      | implica estado igual ao inicial                   | primeiro contato| 1         |
      | implica conhecido igual a 0                       | primeiro contato| 1         |
      | implica estado diferente do inicial               | retorno         | 1         |
      | implica conhecido maior ou igual a 1              | retorno         | 1         |
      | nada diz sobre a entidade                         | ambivalente     | 2         |

  @t-07 @critico
  Cenário: Storylet ambivalente com variante única reprova
    Dada a fixture "neg_reconhecimento"
    Quando a suíte de catálogo é executada
    Então o teste T-07 reprova

  # ------------------------------------------------ Estrutura da banda "cor"

  @t-18 @critico
  Cenário: A camada neutra da banda "cor" é de ao menos 60 por cento
    Quando a banda "cor" é medida
    Então a proporção de storylets sem predicado sobre "arco.tom" é maior ou igual a 60 por cento

  @t-19
  Cenário: O domínio de tom tem no máximo 4 valores
    Quando o dicionário de qualidades é inspecionado
    Então "arco.tom" declara no máximo 4 valores

  @t-17 @critico
  Cenário: O pool elegível de "cor" nunca esfomeia
    Quando toda combinação alcançável de capítulo e tom é enumerada
    Então em cada combinação o pool elegível de "cor" é maior ou igual a 2,5 vezes o valor de K

  @t-31 @critico
  Cenário: A subclasse de ausência existe e é suficiente
    Quando a banda "cor" é medida
    Então há ao menos 6 storylets de subclasse "ausencia"
    E todos eles pertencem à camada neutra
    E há exatamente 1 storylet de subclasse "fallback"

  @t-34 @critico
  Cenário: Nenhum storylet de "cor" tem efeito estrutural
    Quando os efeitos dos storylets de "cor" são inspecionados
    Então nenhum escreve qualidade dos espaços "comp.", "ent." ou "mem."
    E efeitos sobre o espaço "arco." são admitidos

  # --------------------------------------------- Complicações e desfecho

  @t-21 @critico
  Cenário: Toda complicação tem ao menos dois caminhos de fechamento
    Quando cada qualidade do espaço "comp." é analisada
    Então há ao menos 2 storylets que a fecham
    E ao menos 1 deles não declara predicado sobre atributo

  @t-21 @critico
  Cenário: Complicação com caminho único reprova
    Dada a fixture "neg_fechamento_unico"
    Quando a suíte de catálogo é executada
    Então o teste T-21 reprova

  @t-21
  Cenário: Complicação cujos caminhos todos exigem atributo reprova
    Dada a fixture "neg_fechamento_com_atributo"
    Quando a suíte de catálogo é executada
    Então o teste T-21 reprova

  @t-29 @critico
  Cenário: O desfecho de capítulo não lê complicação no seu pré-requisito
    Quando os storylets de "espinha" de desfecho são inspecionados
    Então nenhum "requer" referencia qualidade do espaço "comp."
    E ao menos uma variante de texto de cada desfecho reconhece complicação em aberto

  @t-28 @critico
  Cenário: Toda memória escrita é cobrada em capítulo posterior
    Quando cada qualidade do espaço "mem." é analisada
    Então há ao menos um storylet de capítulo posterior ao de escrita cujo texto varia com ela

  # ------------------------------------------------------------ i18n estático

  @t-23 @rf-120 @critico
  Cenário: Toda referência de texto existe em todo idioma ativo
    Dado que o idioma ativo é apenas "pt-BR"
    Quando todas as referências de texto são resolvidas
    Então nenhuma referência fica sem entrada correspondente no recurso de "pt-BR"

  @t-23
  Cenário: O teste cresce sozinho ao ativar um idioma
    Dado que o idioma "es" passa a ser ativo
    Quando a suíte é executada
    Então o teste T-23 passa a exigir entrada em "es" para toda referência
    E reprova enquanto o recurso estiver incompleto

  @t-24
  Cenário: Nenhum arquivo de recurso contém chave órfã
    Quando os arquivos de recurso são comparados ao catálogo
    Então nenhuma chave de recurso deixa de ser referenciada por alguma variante

  @t-25 @rf-124 @critico
  Cenário: Parâmetros e gênero declarados
    Quando as variantes que consomem parâmetro são inspecionadas
    Então todo parâmetro consumido pelo texto está declarado na variante
    E toda entidade usada como parâmetro declara gênero em todo idioma ativo

  # ------------------------------------------------------ Testes por simulação

  @rf-100 @rf-101 @critico
  Esquema do Cenário: O simulador oferece as cinco políticas de agente
    Quando o simulador é executado com a política "<politica>"
    Então a travessia é concluída
    E o relatório é emitido

    Exemplos:
      | politica      |
      | constante     |
      | erratico      |
      | especialista  |
      | pessimo       |
      | intermitente  |

  @rf-101 @m-01 @m-02 @critico
  Cenário: A política intermitente exercita Trégua e reencontro
    Quando o simulador é executado com a política "intermitente"
    Então ao menos uma resolução ocorreu com "in.tregua" igual a 1
    E ao menos uma resolução ocorreu com "in.reencontro" igual a 1
    E ao menos um storylet de subclasse "ausencia" foi exibido

  @t-09 @critico
  Cenário: Todo storylet é visto ao menos uma vez
    Quando o simulador é executado com 1000 sementes em cada política
    Então todo storylet do catálogo foi selecionado ao menos uma vez
    E a lista de nunca sorteados está vazia

  @t-27 @critico
  Cenário: Toda variante de texto é exercida ao menos uma vez
    Quando o simulador é executado com 1000 sementes em cada política
    Então toda variante declarada foi exibida ao menos uma vez
    E a lista de variantes nunca exibidas está vazia

  @t-27
  Cenário: Variante morta em storylet de disparo único reprova
    Dada a fixture "neg_variante_morta"
    Quando a suíte de catálogo é executada
    Então o teste T-27 reprova

  @t-10 @critico
  Cenário: Todo capítulo alcança o desfecho dentro do limite K
    Quando o simulador é executado com 1000 sementes em cada política
    Então todo capítulo alcançou o seu desfecho
    E nenhum capítulo excedeu o limite K declarado

  @t-11 @critico
  Cenário: Toda complicação aberta é fechada em toda travessia
    Quando o simulador é executado com 1000 sementes em cada política
    Então nenhuma travessia terminou com complicação aberta

  @t-22 @critico
  Cenário: A política especialista fecha toda complicação
    Quando o simulador é executado com 1000 sementes na política "especialista"
    Então nenhuma travessia terminou com complicação aberta
    E o caminho base incondicionado foi utilizado ao menos uma vez

  @t-32
  Cenário: A complicação estruturante é fechada por storylet de fechamento na maioria das travessias
    Quando o simulador é executado com 1000 sementes nas políticas "constante" e "erratico"
    Então em ao menos 90 por cento das travessias a complicação estruturante foi fechada por storylet de fechamento
    E não pelo efeito do desfecho

  @t-12 @critico
  Cenário: A razão vistos sobre escritos fica na faixa de orçamento
    Quando o simulador é executado com 1000 sementes em cada política
    Então a razão entre storylets vistos e storylets escritos está entre 0,15 e 0,3

  @t-30 @critico
  Esquema do Cenário: A distribuição por banda respeita a faixa declarada
    Quando o simulador é executado com 1000 sementes na política "<politica>"
    Então a fração de resoluções da banda "arco" por capítulo está entre 25 e 45 por cento

    Exemplos:
      | politica      |
      | constante     |
      | erratico      |
      | especialista  |
      | pessimo       |
      | intermitente  |

  @t-30
  Cenário: Storylet de arco largamente condicionado reprova
    Dada a fixture "neg_arco_largo"
    Quando a suíte de catálogo é executada
    Então o teste T-30 reprova

  @rf-102 @critico
  Cenário: O relatório do simulador contém as saídas exigidas
    Quando o simulador é executado
    Então o relatório contém a razão vistos sobre escritos
    E contém histograma por storylet
    E contém histograma por variante
    E contém a lista de storylets nunca sorteados
    E contém a lista de variantes nunca exibidas
    E contém a distribuição de resoluções por banda e por capítulo
    E contém o comprimento até o desfecho por capítulo e por política

  @rf-100
  Cenário: O simulador emite texto corrido para leitura humana
    Quando o simulador é executado com 60 resoluções na política "constante"
    Então a saída inclui os 60 textos em sequência
    E a saída de leitura não contém identificador de storylet, nome de banda ou nome de qualidade

  # --------------------------------------------------------- Portão de release

  @rn-029 @rf-103 @critico
  Cenário: Release com suíte vermelha é bloqueado
    Dado um catálogo candidato em que o teste T-21 reprova
    Quando o pipeline de release é executado
    Então o release é bloqueado
    E o motivo indicado é o teste reprovado

  @rf-103 @critico
  Esquema do Cenário: Toda fixture negativa reprova exatamente o seu teste
    Dada a fixture "<fixture>"
    Quando a suíte de catálogo é executada
    Então o teste "<teste>" reprova
    E nenhum outro teste reprova

    Exemplos:
      | fixture                     | teste |
      | neg_id_duplicado            | T-01  |
      | neg_efeito_em_in            | T-02  |
      | neg_sem_fallback            | T-05  |
      | neg_reconhecimento          | T-07  |
      | neg_fechamento_unico        | T-21  |
      | neg_fechamento_com_atributo | T-21  |
      | neg_variante_morta          | T-27  |
      | neg_mem_sem_leitor          | T-28  |
      | neg_desfecho_le_comp        | T-29  |
      | neg_arco_largo              | T-30  |
      | neg_sem_ausencia            | T-31  |
      | neg_sys_resolucoes          | T-33  |
      | neg_cor_estrutural          | T-34  |

  @rf-037
  Cenário: O catálogo é JSON embutido nos assets
    Quando o pacote do aplicativo é inspecionado
    Então os arquivos de catálogo estão presentes como assets em formato JSON
    E nenhum arquivo de catálogo é baixado em tempo de execução

  @rf-030 @rn-028
  Cenário: Campanha nova exige release do aplicativo
    Dada uma campanha nova pronta no repositório
    Quando o aplicativo instalado é executado sem atualização
    Então a campanha nova não está disponível
    E nenhum mecanismo de download de campanha existe no aplicativo
