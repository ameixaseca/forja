# language: pt
# Camada: transversal | Requisitos: RE-001..RE-011, RN-010, RN-033..RN-035, RF-120..RF-126, RC-010, RC-040

@transversal @etica @i18n
Funcionalidade: Ética de design, regras de redação e internacionalização
  Como responsável pelo produto
  Quero que nenhuma tela puna, cobre ou prescreva
  E que a arquitetura de idioma esteja pronta antes de existir tradução

  # ------------------------------------------------------- Ética de mecânica

  @re-001 @critico
  Cenário: Não existe recompensa aleatória de valor
    Quando o aplicativo é percorrido integralmente
    Então não há loot box
    E não há moeda premium
    E não há item cosmético ou funcional obtido por sorteio
    E nenhuma recompensa de valor depende de aleatoriedade

  @re-001
  Cenário: A rolagem não é recompensa aleatória
    Quando uma rolagem é resolvida
    Então o resultado altera apenas quais storylets são elegíveis
    E nenhum item, moeda ou vantagem persistente é concedido pelo resultado

  @re-002 @critico
  Esquema do Cenário: Nenhuma notificação de culpa ou noturna
    Quando o aplicativo avalia o envio de notificação no contexto "<contexto>"
    Então nenhuma notificação de culpa, cobrança ou contagem regressiva é enviada

    Exemplos:
      | contexto                          |
      | ciclo prestes a ser quebrado      |
      | três dias sem sessão registrada   |
      | trinta dias sem sessão registrada |
      | ciclo quebrado encerrado          |

  @re-002 @critico
  Cenário: Nenhuma notificação entre 22h e 7h
    Dado um evento notificável ocorrido às 23h30
    Quando o agendador de notificações é avaliado
    Então nenhuma notificação é entregue antes das 7h

  @re-003 @critico
  Cenário: Nenhum contador irreversível
    Quando o aplicativo é percorrido integralmente
    Então nenhum elemento apresenta perda permanente por inatividade
    E nenhum histórico é apagado por quebra de ciclo

  @re-004 @rn-009 @critico
  Cenário: Nenhuma métrica corporal é objetivo do jogo
    Quando o aplicativo é percorrido integralmente
    Então nenhum objetivo, meta ou conquista é expresso em grandeza corporal

  @re-008 @critico
  Cenário: Nenhum acesso a contatos ou sugestão de pessoas
    Quando o aplicativo é percorrido integralmente
    Então nenhuma permissão de contatos é solicitada
    E não há sugestão de pessoas para seguir, convidar ou comparar
    E não há vínculo identificável entre convidante e instalador

  # ------------------------------------------------------- Regras de redação

  @re-009 @rc-010 @critico
  Cenário: Nenhuma mensagem sobre execução de exercício usa imperativo ou futuro
    Quando todos os recursos de texto do aplicativo são varridos
    Então nenhuma mensagem referente a execução de exercício contém verbo no modo imperativo
    E nenhuma mensagem referente a execução de exercício contém verbo no tempo futuro
    E o relatório da varredura é anexado à lista de verificação de release

  @rn-010 @critico
  Esquema do Cenário: Nenhum texto atribui valor moral ao cumprimento
    Quando o texto de "<tela>" é inspecionado
    Então o texto não contém termo de julgamento moral
    E o texto não contém elogio condicionado ao desempenho
    E o texto não contém repreensão

    Exemplos:
      | tela                          |
      | Fechamento de ciclo cumprido  |
      | Fechamento de ciclo quebrado  |
      | sugestão de reduzir Juramento |
      | saída de Trégua de Recuperação|
      | janela de retorno de Marcos   |
      | aviso de padrão de RE-006     |

  @re-011 @critico
  Cenário: Nenhum texto exige contração de preposição com nome de entidade
    Quando todos os recursos de texto são varridos
    Então nenhum texto insere parâmetro de nome de entidade imediatamente após preposição que exija contração
    E a varredura cobre "de", "em", "a", "por" e "para"

  @re-010 @critico
  Cenário: Todo storylet publicado passa por revisão registrada
    Dado um catálogo candidato a release
    Quando a lista de verificação de release é auditada
    Então cada storylet tem revisão registrada quanto a conteúdo sensível
    E cada storylet tem revisão registrada quanto a coerência com RE-001 a RE-011
    E cada storylet tem revisão registrada quanto a ausência de conselho de treino

  @rn-035 @critico
  Cenário: Nenhum texto exibido é literal no código
    Quando o código-fonte da camada de apresentação é varrido
    Então nenhuma cadeia destinada a exibição está embutida no código
    E toda cadeia exibida provém de arquivo de recurso

  # --------------------------------------------------- Internacionalização

  @rf-120 @critico
  Cenário: Os recursos existem para os três idiomas, com um preenchido
    Quando a árvore de recursos é inspecionada
    Então existe estrutura para "pt-BR", "en" e "es"
    E "pt-BR" está integralmente preenchido
    E "en" e "es" existem como estrutura

  @rf-121
  Cenário: O idioma segue o dispositivo e a troca manual é persistida
    Dado um dispositivo configurado em "pt-BR"
    Quando o aplicativo é aberto
    Então o idioma ativo é "pt-BR"
    Quando o usuário troca manualmente para outro idioma ativo
    Então a escolha persiste entre aberturas

  @rf-122 @rn-033 @critico
  Cenário: O estado de campanha é agnóstico de idioma
    Dado um estado de campanha persistido com o idioma "pt-BR" ativo
    Quando o idioma ativo é trocado
    Então o estado persistido é byte a byte idêntico
    E nenhum valor de qualidade mudou

  @rn-033 @critico
  Cenário: A sequência de storylets não muda com o idioma
    Dada a semente 555000111 e uma sequência fixa de entradas
    Quando a travessia é simulada com o idioma "pt-BR"
    E a travessia é simulada com um recurso de idioma vazio
    Então a sequência de storylets é idêntica nas duas
    E apenas o texto exibido difere

  @rf-125 @critico
  Cenário: Formatação de número, plural e data ocorre apenas na apresentação
    Quando o subsistema narrativo é inspecionado
    Então nenhum número é formatado dentro dele
    E nenhum plural é resolvido dentro dele
    E nenhuma data é formatada dentro dele
    E os parâmetros são emitidos como valores crus

  @rf-124 @critico
  Cenário: Toda entidade declara gênero por idioma ativo
    Quando a lista de entidades é inspecionada
    Então cada entidade declara gênero para "pt-BR"
    E a estrutura de gênero comporta idiomas adicionais sem alteração de esquema

  @rf-126 @critico
  Cenário: Nomes próprios são invariantes entre idiomas
    Dada a entidade "sebastiao" com "nome_traduzivel" igual a falso
    Quando os recursos de todos os idiomas são comparados
    Então a cadeia do nome é idêntica em todos eles

  @rf-126
  Cenário: Título descritivo é traduzível quando declarado
    Dada a entidade "lapa_do_meio" com "nome_traduzivel" igual a verdadeiro
    Quando os recursos de idiomas distintos são comparados
    Então a cadeia do nome pode divergir entre idiomas
    E a divergência não é reportada como erro por T-23

  @rn-034 @critico
  Cenário: Nenhum idioma é lançado parcialmente traduzido
    Dado um recurso de idioma com 98 por cento das chaves preenchidas
    Quando o idioma é candidato a ativação
    Então a ativação é bloqueada
    E o teste T-23 reprova

  @rc-040 @critico
  Cenário: A disponibilidade no MVP é restrita ao Brasil
    Quando a configuração de publicação nas lojas é inspecionada
    Então apenas o Brasil está habilitado
    E nenhum outro mercado está habilitado
    E o regime de conformidade declarado é a LGPD
