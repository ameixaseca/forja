# language: pt
# Camada: integracao | Requisitos: RF-014, RF-015, RF-038, RF-039, RF-039A, RF-039B, RN-027, RN-032, RC-003, RC-009

@integracao @rede
Funcionalidade: Kill-switch, operação offline e privacidade de rede
  Como controlador do conteúdo
  Quero poder desativar um storylet quebrado sem release
  Sem que isso crie a primeira superfície de vigilância de um aplicativo que se diz offline

  Contexto:
    Dado um aplicativo instalado com catálogo embutido
    E que nenhuma lista de desativados foi buscada anteriormente

  # ------------------------------------------------------------ Busca da lista

  @rf-038 @critico
  Cenário: A busca ocorre na inicialização e não bloqueia a abertura
    Dado um servidor que responde em 200 milissegundos
    Quando o aplicativo é aberto
    Então a lista de desativados é buscada
    E a tela inicial é apresentada sem esperar a conclusão da busca

  @rf-038 @critico
  Esquema do Cenário: Timeout agressivo de 1,5 segundo
    Dado um servidor que responde em <latencia> milissegundos
    Quando o aplicativo é aberto
    Então a lista aplicada é a <origem>
    E o aplicativo abre normalmente

    Exemplos:
      | latencia | origem            |
      | 200      | lista buscada     |
      | 1400     | lista buscada     |
      | 1600     | último cache      |
      | 30000    | último cache      |

  @rf-038 @critico
  Cenário: Sem rede e sem cache, a lista aplicada é vazia
    Dado um dispositivo sem conectividade
    E nenhum cache de lista de desativados
    Quando o aplicativo é aberto
    Então a lista aplicada é vazia
    E todos os storylets do catálogo estão elegíveis
    E o aplicativo abre normalmente

  @rf-038 @critico
  Cenário: Resposta malformada não derruba o aplicativo
    Dado um servidor que responde com conteúdo que não é JSON válido
    Quando o aplicativo é aberto
    Então a resposta é descartada
    E a lista aplicada é o último cache ou vazia
    E nenhuma exceção é propagada ao usuário

  @rf-038
  Cenário: Resposta com identificador inexistente é ignorada sem erro
    Dada uma lista contendo o id "st_inexistente_999"
    Quando a lista é aplicada
    Então o id desconhecido é ignorado
    E os demais ids da lista são aplicados normalmente

  @rf-039a @critico
  Esquema do Cenário: A busca ocorre no máximo uma vez a cada 24 horas
    Dada uma busca bem-sucedida há <horas> horas
    Quando o aplicativo é aberto
    Então uma nova busca é <resultado>

    Exemplos:
      | horas | resultado  |
      | 1     | omitida    |
      | 12    | omitida    |
      | 23    | omitida    |
      | 25    | executada  |

  @rf-039a @critico
  Cenário: A busca aplica jitter aleatório de até 6 horas
    Dado 1000 dispositivos simulados com a mesma hora de última busca
    Quando todos abrem o aplicativo após 24 horas
    Então os instantes de busca distribuem-se ao longo de uma janela de até 6 horas
    E nenhum instante de busca coincide com um horário fixo do relógio

  # ------------------------------------------------------------- Privacidade

  @rf-039 @rc-003 @rc-009 @critico
  Cenário: A requisição do kill-switch não carrega identificação
    Quando a busca da lista é executada
    Então a URL requisitada não contém parâmetro de consulta
    E o cabeçalho não contém identificador de usuário
    E o cabeçalho não contém identificador de dispositivo ou de instalação
    E o cabeçalho não contém cabeçalho customizado do aplicativo
    E nenhum corpo é enviado na requisição

  @rf-039 @rc-003 @critico
  Cenário: Nenhuma telemetria acompanha a busca
    Quando a busca da lista é executada
    Então nenhuma requisição adicional é emitida
    E nenhum evento de analytics é registrado
    E nenhum SDK de terceiro é acionado

  @rc-009 @critico
  Cenário: A busca é declarada em seção própria da política de privacidade
    Quando a política de privacidade é consultada
    Então existe seção própria descrevendo a busca do kill-switch
    E a seção descreve o que é buscado
    E a seção declara que nenhum dado do usuário é enviado
    E a seção declara a ausência de retenção de log e de IP na distribuição

  @rc-003 @critico
  Cenário: O kill-switch é a única superfície de rede sem conta
    Dado um usuário sem conta criada
    Quando o aplicativo é usado durante um ciclo completo, com registro de sessões e resoluções
    Então a única requisição de rede emitida é a busca da lista de desativados

  @rn-027 @rc-008 @critico
  Cenário: Nenhuma chamada a modelo de linguagem ocorre em tempo de execução
    Quando o aplicativo é usado durante uma travessia completa de capítulo
    Então nenhuma requisição a provedor de modelo de linguagem é emitida
    E nenhum dado de treino é enviado a qualquer provedor externo

  # ----------------------------------------------------- Aplicação e limites

  @rn-032 @critico
  Cenário: Desativar storylet não altera estado já gravado
    Dado um estado em que "st_c1_sebastiao_encontro" já foi resolvido
    Quando aquele id passa a constar da lista de desativados
    Então "ent.sebastiao.estado" permanece no valor gravado
    E a entrada correspondente do Diário permanece íntegra
    E a campanha em andamento permanece jogável

  @rf-039b @m-03 @critico
  Cenário: Ids de espinha e de fallback presentes na lista são ignorados
    Dada uma lista contendo o id da abertura do capítulo 1, o id do desfecho do capítulo 1 e "st_cor_fallback"
    Quando a lista é aplicada
    Então os três ids permanecem elegíveis
    E o número de ids efetivamente aplicados é 0

  @rf-038
  Cenário: O kill-switch desativa, mas não substitui texto
    Dada a lista de desativados
    Quando a lista é inspecionada quanto ao seu formato
    Então ela contém apenas versão e lista de identificadores
    E não há campo para texto, tradução ou substituição de conteúdo

  # -------------------------------------------------------- Operação offline

  @rf-014 @critico
  Cenário: O aplicativo funciona integralmente sem conexão
    Dado um dispositivo em modo avião
    Quando o usuário declara Juramento, registra 4 sessões, resolve 4 resoluções e encerra o ciclo
    Então todas as operações são concluídas
    E nenhum erro de conectividade é exibido
    E nenhuma funcionalidade é apresentada como indisponível

  @rf-015
  Cenário: Registros locais sincronizam quando há conexão e conta ativa
    Dada uma conta ativa e 6 sessões registradas offline
    Quando a conectividade é restabelecida
    Então as 6 sessões são sincronizadas
    E nenhuma duplicação é criada
    E o estado local permanece a fonte de verdade em caso de conflito

  @rf-015
  Cenário: Sem conta, nada é sincronizado
    Dado um usuário sem conta e 6 sessões registradas
    Quando a conectividade está disponível
    Então nenhuma sessão é transmitida
    E nenhum prompt de criação de conta é apresentado durante o registro
