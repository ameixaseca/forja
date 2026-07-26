# PLANO DE TESTES — FORJA

**Estratégia de teste, linguagem ubíqua e suíte BDD executável**

| Campo | Valor |
|---|---|
| Versão | v1.0 |
| Documentos pai | PRD FORJA v0.14 · ESPEC — Sistema Narrativo v2.6 · PROTÓTIPO — A Longa Seca v0.2 · `decisoes.md` |
| Entrega correspondente | Passo 5 de §14 do PRD ("Glossário e cenários BDD") |
| Data | Julho/2026 |
| Cobertura verificada | **198 de 198 requisitos no escopo (100%)**, 8 fora do escopo declarados |
| Volume | 14 arquivos `.feature` · 315 cenários · **502 casos de teste efetivos** |

---

## 1. Objetivo e escopo

Este plano existe por uma razão estrutural: **D-031 removeu o portão de publicação.** Com a narrativa compilada no binário, não há validação estática antes de publicar e não há correção sem release. A suíte deixa de ser rede de segurança e passa a ser a *única* defesa antes da produção — e a produção custa uma revisão de loja para corrigir.

**Está no escopo:** todo requisito funcional, regra de negócio, regra de ética de design, requisito de conformidade e teste de catálogo ou de motor declarado no PRD e na ESPEC.

**Não está no escopo, e é declarado:**

| Item | Por quê | Como é coberto |
|---|---|---|
| RF-030, RF-035, RF-036 | são restrições de arquitetura, não comportamento observável | cenários de inspeção estrutural em `07` e `12` |
| RC-033, RC-034 | são obrigações de processo de autoria, não do produto | lista de verificação de release |
| RC-041, RC-042, RC-043 | dormentes; ativam apenas com expansão de mercado | reativar junto com a decisão de expansão |

**Este documento não substitui** os dois testes bloqueantes de §14 do PRD (leitura do texto corrido e reação ao card). Nenhum deles é automatizável, e nenhum volume de cenário verde compensa reprovar neles — ver §10.

---

## 2. Estratégia: seis camadas

A pirâmide clássica não serve aqui sem ajuste, porque o produto tem uma classe de teste que a maioria não tem: **testes sobre conteúdo escrito**. Um storylet inalcançável não é bug de código, é bug de texto, e reprova numa camada própria.

| Camada | O que prova | Roda contra | Custo | Frequência |
|---|---|---|---|---|
| **Motor** | invariantes do seletor, independentes de conteúdo | catálogos sintéticos | milissegundos | todo commit |
| **Domínio** | regras de ciclo, Fôlego, Marcos, atributos | núcleo de domínio, sem interface | milissegundos | todo commit |
| **Catálogo** | propriedades do conteúdo escrito | catálogo real e fixtures negativas | segundos a minutos | commit com M=50; noturna com M=1000 |
| **Integração** | rede, persistência, sistema operacional | aplicativo real com servidores falsos | segundos | todo commit e pré-release |
| **Transversal** | copy, ética, i18n, privacidade | varredura de recursos e dependências | segundos | todo commit |
| **Manual** | leitura, reação ao card, revisão de RE-010 | pessoas | horas | por marco de projeto |

**A camada de motor é a mais valiosa e a mais barata.** Vários defeitos da ESPEC v2.5 existiam porque garantias que só o motor pode dar estavam escritas como obrigação de autoria, a ser repetida corretamente em algumas centenas de arquivos. Os nove invariantes `M-01` a `M-09` provam essas garantias uma vez, contra catálogo sintético, em milissegundos. **Se apenas uma camada puder existir, é esta.**

**A camada de catálogo tem um custo que precisa ser respeitado.** Cinco políticas × 1000 sementes × ~48 resoluções × filtragem de ~260 storylets é da ordem de 10⁸ avaliações de predicado. Suíte lenta acaba desativada, e aí a garantia vale zero — por isso M é parâmetro, não constante, e a execução por commit usa M=50.

---

## 3. Convenções de escrita

**Gherkin em pt-BR**, com `# language: pt`. O produto é pt-BR-only no MVP (D-037) e a linguagem ubíqua é portuguesa; escrever os cenários em inglês criaria uma segunda tradução do domínio, com todos os erros que uma tradução tem.

**Estilo declarativo, não imperativo.** O cenário descreve a regra, não a sequência de toques. `Quando o ciclo é encerrado como cumprido` — não `Quando o usuário toca em Encerrar e confirma no diálogo`. A exceção é onde o requisito *é* sobre a interface: RF-010 (20 segundos), RF-062 (pré-visualização), RF-064 (camadas desligadas).

**Uma regra por cenário.** Cenário que verifica três coisas falha por uma e esconde as outras duas.

**`Esquema do Cenário` para tabelas de valor.** Toda fronteira numérica do sistema — curva de Vontade, teto de Fôlego, faixas de rolagem, janela de retroatividade — está em `Exemplos`, com os valores de fronteira e os imediatamente adjacentes. É onde os defeitos moram.

### Tags

| Tag | Significado |
|---|---|
| `@dominio` `@motor` `@catalogo` `@integracao` `@transversal` | camada de execução |
| `@rf-010` `@rn-007` `@re-006` `@rc-001` `@t-21` `@m-04` | requisito coberto — base da rastreabilidade automática |
| `@critico` | falha bloqueia release |
| `@lacuna` | **a especificação não determina o comportamento.** O cenário registra a proposta e precisa de confirmação antes da implementação |
| `@defeito` | **a especificação se contradiz.** O cenário reprova de propósito até a contradição ser resolvida |

As duas últimas são a contribuição mais importante deste plano e estão consolidadas em §9. Um cenário `@defeito` **deve** ficar vermelho: apagá-lo esconde a contradição em vez de resolvê-la.

---

## 4. Linguagem ubíqua

Glossário canônico. Todo cenário, todo nome de método e toda mensagem de interface usam estes termos e apenas estes.

| Termo | Definição operacional |
|---|---|
| **Ciclo** | período semanal fixo, unidade de contabilidade de Juramento, Fôlego e Marcos |
| **Juramento** | pacto de 1 a 6 **dias de treino** no ciclo; imutável durante ele |
| **Ciclo cumprido** | dias treinados ≥ dias jurados |
| **Ciclo quebrado** | dias treinados < dias jurados, sem Trégua declarada |
| **Trégua** | pausa voluntária declarada antes do ciclo; consome crédito; nem cumprido nem quebrado |
| **Trégua de Recuperação** | pausa por lesão ou doença; retroativa em até 14 dias; sem crédito e sem limite |
| **Deload** | ciclo de descarga declarado antes do início; conta como cumprido; dobra o teto de Fôlego; 1 a cada 4 ciclos |
| **Sessão** | registro de treino de um dia; contêiner de blocos |
| **Bloco** | trecho de sessão com modalidade própria; unidade de vinculação de Marco |
| **Sessão secundária** | segunda sessão registrada no mesmo dia; resolve apenas ambientação |
| **PSE** | percepção subjetiva de esforço, Borg CR10, inteiro de 0 a 10, opcional |
| **Resolução** | evento produzido por sessão confirmada: rolagem, seleção de storylet, aplicação de efeitos, texto |
| **Rolagem** | `2d6 + Vontade`; faixas triunfo (10+), custo (7–9), reviravolta (≤6) |
| **Fôlego** | moeda gerada por dia de descanso em ciclo cumprido; teto 2 por ciclo, acúmulo 4; Marco de capítulo custa 2 |
| **Marco de Superação** | reconhecimento declarado de feito superior ao próprio histórico; fonte única de Força, Vigor e Destreza |
| **Marco de capítulo** | evento de desfecho com escolha irreversível; exige 2 ciclos cumpridos, complicação pronta e 2 Fôlego |
| **Rótulo** | identificador livre de exercício, escolhido pelo usuário; chave do cooldown |
| **Storylet** | unidade de conteúdo: pré-requisitos, efeitos, peso, variantes de texto |
| **Banda** | estrato de seleção: `espinha` > `arco` > `cor` |
| **Espinha** | abertura e desfecho escritos do capítulo; nunca reposta; nunca desativável |
| **Arco** | vinhetas que movem a complicação estruturante; bolsa por capítulo |
| **Cor** | ambientação sem efeito estrutural; bolsa global; subclasses `ausencia` e `fallback` |
| **Variante** | versão de texto de um storylet, escolhida pelo primeiro `quando` satisfeito |
| **Complicação** (`comp.`) | dívida narrativa do capítulo; fecha dentro dele |
| **Memória** (`mem.`) | dívida narrativa da campanha; cobrada em capítulo posterior |
| **Estágio do capítulo** | derivado: `abertura`, `meio`, `pressao` (≥12 resoluções), `desfecho` |
| **Regra de pressão** | a partir do estágio `pressao`, a banda `arco` restringe-se a storylets de fechamento |
| **Reencontro** | primeira resolução após Trégua encerrada ou 10 dias sem sessão; forçada à subclasse `ausencia` |
| **Bolsa** | conjunto de sorteio sem reposição; `peso` é multiplicidade de cópias |
| **Fila de exclusão (K)** | itens recém-vistos, excluídos da bolsa reposta; calculada sobre o **pool elegível efetivo** |
| **Semente de campanha** | inteiro de 64 bits que determina o mundo, não a história |
| **Kill-switch** | lista estática de ids desativados, buscada na inicialização |
| **Política de agente** | perfil sintético de simulação: `constante`, `erratico`, `especialista`, `pessimo`, `intermitente` |

---

## 5. Organização dos arquivos

```
testes/
  cobertura.py                                    ferramenta de rastreabilidade
  features/
    01-ciclo-juramento-tregua.feature             33 cenários
    02-registro-de-sessao.feature                 28
    03-ficha-atributos-vontade.feature            16
    04-marcos-de-superacao.feature                17
    05-folego-e-marco-de-capitulo.feature         17
    06-rolagem-e-resolucao.feature                10
    07-motor-selecao-storylet.feature             29
    08-continuidade-e-estado.feature              19
    09-escolhas-e-diario.feature                  17
    10-compartilhamento-semente-determinismo.feature  22
    11-kill-switch-e-offline.feature              18
    12-catalogo-e-simulador.feature               44
    13-privacidade-e-direito-de-acesso.feature    23
    14-etica-copy-e-i18n.feature                  22
  fixtures/
    negativos/                                    13 catálogos sintéticos (§7.4 da ESPEC)
    sementes/                                     sementes de regressão conhecidas
```

A numeração segue a ordem de dependência do domínio, não a do PRD: quem for implementar de baixo para cima começa em `07` e `03`, não em `01`.

---

## 6. Rastreabilidade

A rastreabilidade é **verificada por ferramenta, não afirmada em tabela**. `cobertura.py` extrai o inventário de requisitos direto do PRD e da ESPEC, extrai as tags dos `.feature` e cruza os dois.

```
prefixo   definidos  cobertos   fora  lacuna
---------------------------------------------
RF               93        93      3       0
RN               39        39      0       0
RE               11        11      0       0
RC               15        15      5       0
T                31        31      0       0
M                 9         9      0       0
---------------------------------------------
TOTAL           198       198      8       0

cobertura: 100.0%
```

A ferramenta também detecta **tags órfãs** — cenário que se declara cobrindo um requisito inexistente. Foi assim que se encontrou um `@rf-018` escrito onde o correto era `@d-018`; a mesma classe de erro num documento escrito à mão passaria despercebida.

**Portão:** `cobertura.py` sai com código 1 se algum requisito no escopo ficar sem cenário. Requisito novo no PRD sem cenário correspondente quebra o build — que é a única forma conhecida de a rastreabilidade sobreviver a seis meses de manutenção.

---

## 7. Dados de teste

**Sementes.** Toda simulação usa gerador determinístico semeado. Sementes de regressão — as que já expuseram defeito — ficam versionadas em `fixtures/sementes/` e rodam sempre, além das M aleatórias.

**Políticas de agente.** As cinco de RF-101. A política `intermitente` é obrigatória e não negociável: sem ela, `M-01`, `M-02` e a subclasse `ausencia` nunca são exercitados por nenhuma travessia — que é exatamente como o defeito de T-13 sobreviveu à ESPEC v2.5 inteira.

**Fixtures negativas.** Treze catálogos sintéticos, cada um violando exatamente uma regra, verificando que o teste correspondente **reprova**. Um teste que nunca reprovou é um teste em que não se pode confiar. A primeira a escrever é `neg_fechamento_unico`, que reproduz o defeito que o protótipo v0.1 carregava no catálogo de produção.

**Controle de relógio.** Todo cenário com data usa relógio injetado. O produto tem quatro regras dependentes de calendário — retroatividade de 48h, retroatividade de 14 dias, reencontro de 10 dias e janela de retorno de 21 dias — e nenhuma delas é testável contra o relógio do sistema. O relógio nunca entra no subsistema narrativo (§6.2 da ESPEC); a aplicação entrega `in.reencontro` já resolvido.

**Fronteiras.** Toda tabela de `Exemplos` inclui o valor de fronteira e o imediatamente adjacente: 20 e 21 dias na janela de retorno, 13 e 14 dias na retroatividade, 11 e 12 resoluções na pressão, 23 e 25 horas no intervalo do kill-switch.

---

## 8. Ferramental sugerido

| Necessidade | Sugestão | Observação |
|---|---|---|
| Executor Gherkin | Cucumber, Behave, SpecFlow ou Godog | escolher pelo ecossistema do app; os `.feature` são portáveis |
| Camadas motor e domínio | executor nativo da linguagem | sem interface, sem banco, sem rede |
| Camada de catálogo | ferramenta própria, evoluída de `verificar.py` | já roda ~20 dos testes de catálogo hoje |
| Camada de integração | servidor HTTP falso local | para kill-switch, latência e resposta malformada |
| Varredura de copy | analisador morfológico pt-BR | RE-009 e RE-011 exigem detectar imperativo e contração |
| Relatório de cobertura | `cobertura.py` | já pronto |

**RE-009 e RE-011 merecem atenção especial.** São as únicas regras transversais que exigem análise linguística, não comparação de cadeias. Sem um analisador morfológico, viram revisão manual de ~260 storylets a cada release — o que na prática significa que deixarão de ser verificadas por volta do terceiro release.

---

## 9. Achados: 5 defeitos e 11 lacunas

Escrever cenários é a forma mais barata de descobrir que uma especificação não determina o comportamento. Estes dezesseis pontos apareceram ao tentar escrever o `Então` e não conseguir.

### 9.1 Defeitos — a especificação se contradiz

Os cenários correspondentes estão marcados `@defeito` e **reprovam de propósito** até que a contradição seja resolvida.

| ID | Defeito | Severidade | Onde |
|---|---|---|---|
| **DEF-01** | **K = 20 é incompatível com o teto de 4 ciclos.** T-10 fixa 20 resoluções por capítulo; §4.9 do PRD permite 4 ciclos, e o número de resoluções por ciclo é função da frequência do usuário, não do sistema. Juramento 6 com 6 sessões semanais produz **24 resoluções**; com segundas sessões diárias (RF-013), até 56. T-10 reprova para todo usuário acima de 5 sessões por semana | **Crítica** | `05` |
| **DEF-02** | **A regra de pressão dispara cedo demais para o praticante frequente.** Com 6 sessões semanais, `cap.resolucoes >= 12` é atingido no meio do segundo ciclo — antes do piso de 2 ciclos do Marco. Metade do capítulo roda com a banda `arco` restrita a fechamentos | Alta | `05` |
| **DEF-03** | **O kill-switch quebra o determinismo da semente compartilhada.** M-05 fixa "mesma semente, mesmas entradas e mesma versão", mas a lista de desativados tem versão própria (D-034) e altera o pool, logo a bolsa. Dois usuários com a mesma semente e a mesma versão do app, com caches distintos, divergem — o que anula a promessa de mundo compartilhado de D-020 | Alta | `10` |
| **DEF-04** | **O praticante de sete dias por semana fica bloqueado em silêncio.** Zero dias de descanso significa zero Fôlego e, portanto, nenhum Marco de capítulo, para sempre. §4.5 declara isso como intenção, mas nenhum requisito especifica comunicar ao usuário | Média | `05` |
| **DEF-05** | **RF-047 reintroduz a assimetria que D-018 rejeitou.** D-018 recusou a inferência automática porque "só funciona em eixos numéricos, criando assimetria que viola D-012". RF-047 detecta discrepância a partir do histórico — e a detecção continua computável apenas em duração, distância, carga, repetição e volume. O praticante de mobilidade nunca recebe a oferta que o corredor recebe | Média | `04` |

**Resoluções propostas, para decisão do PO:**

- **DEF-01 e DEF-02** têm a mesma causa: dois limites de capítulo expressos em unidades diferentes. Ou T-10 e a regra de pressão passam a ser expressos em **ciclos**, ou o estágio de desfecho passa a ser forçado por `cap.resolucoes`, tornando §4.9 subordinado a K. A primeira opção preserva D-004 (a frequência não deve alterar o ritmo da campanha) e é a recomendada.
- **DEF-03** resolve-se incluindo a versão da lista de desativados na definição de M-05 e no artefato de convite, ou — melhor — excluindo os desativados **na exibição** e não na montagem da bolsa, de modo que a sequência sorteada não dependa da lista.
- **DEF-04** exige apenas um requisito novo: texto descritivo explicando a condição pendente do Marco de capítulo, sem instruir o usuário a descansar (RE-009, RC-010).
- **DEF-05** exige declarar a assimetria ou suprimir a oferta. Suprimir é coerente com D-018 e custa menos.

### 9.2 Lacunas — a especificação não determina o comportamento

Os cenários correspondentes estão marcados `@lacuna` e **registram o comportamento proposto**. Cada um precisa de confirmação antes da implementação; sem isso, quem implementar vai decidir sozinho e a decisão não ficará registrada em lugar nenhum.

| ID | Lacuna | Severidade | Proposta no cenário | Onde |
|---|---|---|---|---|
| **LAC-01** | Múltiplas campanhas (RF-032): qual campanha uma sessão resolve? O Fôlego é por campanha ou global? | **Crítica** | uma campanha corrente; sessão resolve apenas ela; Fôlego, ciclo e ficha globais | `08` |
| **LAC-02** | Recuperação retroativa sobre ciclo já encerrado como quebrado | Alta | reclassifica o ciclo, recalcula consecutivos, não retira Fôlego concedido, não reescreve o Diário | `01` |
| **LAC-03** | Registro retroativo (RF-012) que cruza a fronteira de ciclo já encerrado | Alta | reclassifica o ciclo e concede o Fôlego devido, sem reabrir resoluções | `02` |
| **LAC-04** | Ordem da resolução gerada por registro retroativo | Média | índice monotônico; a ordem narrativa diverge da cronológica e o Diário exibe as duas | `02` |
| **LAC-05** | A sessão secundária incrementa `cap.resolucoes`? Afeta o disparo da pressão | Média | incrementa | `02` |
| **LAC-06** | Momento de persistência da escolha irreversível (RF-028) | Média | efeitos do storylet ao apresentar; efeitos da opção só na confirmação; escolha reapresentada | `09` |
| **LAC-07** | Esquema do JSON de exportação (RF-027), que é obrigação de portabilidade da LGPD | Média | campo de versão de esquema, documentado publicamente | `09` |
| **LAC-08** | RF-049: os 3 Marcos são consumidos ao gerar o ponto, ou apenas contados? | Baixa | contagem acumulada, nunca consumo | `03` |
| **LAC-09** | A janela de 4 ciclos do deload conta ciclos cumpridos ou encerrados? | Baixa | encerrados de qualquer natureza, por simetria com DEC-035 | `01` |
| **LAC-10** | RN-008: Trégua **pausa** ou **reinicia** a contagem de ciclos quebrados? | Baixa | pausa — reiniciar esconderia dificuldade real atrás de pausa declarada | `01` |
| **LAC-11** | Comportamento após recusa por idade (RC-020) | Baixa | bloqueio persistido, sem laço de nova tentativa na mesma sessão | `13` |

### 9.3 Observação sem cenário

**Deload e RE-006 interagem contra o usuário.** O deload reduz volume e, portanto, a média das 4 semanas anteriores — o que aumenta a chance de o ciclo normal seguinte disparar o aviso de +40%. O aviso apareceria justamente para quem periodizou corretamente. Não é defeito de especificação, é efeito de segunda ordem que só se enxerga rodando os números; sugere-se excluir ciclos de deload da média de referência de RE-006.

---

## 10. O que nenhuma suíte cobre

Registrado explicitamente, porque a tentação de uma suíte de 502 casos verdes é acreditar que o produto está verificado.

| Item | Por que não é automatizável | Como cobrir |
|---|---|---|
| **Teste de leitura (§14.1 do PRD)** | mede se uma pessoa consegue resumir a história. Não há asserção possível | 3 leitores, 20 resoluções em texto corrido. Critério de parada em §11.2 do PRD |
| **Teste do card (§14.2)** | mede curiosidade de público frio | 5 variações, público anglófono de RPG solo |
| **Revisão de RE-010** | julgamento sobre conteúdo sensível | revisão humana registrada, item de lista de verificação de release |
| **Coerência narrativa entre capítulos** | T-28 prova que a memória tem leitor; não prova que o texto faz sentido | leitura da espinha completa antes de cada release — são 8 itens na campanha inteira |
| **Parecer jurídico** | RC-009 e RC-034 dependem de interpretação | parecer antes do lançamento; a especificação já assume a posição conservadora |
| **Revisão por profissional de educação física** | RE-006, RF-048 e §4.8 tocam segurança física | revisão obrigatória antes do lançamento |

**A relação entre as duas listas importa.** A suíte prova que o sistema funciona conforme especificado. Ela não prova que a história é boa, e §1.2 do PRD já concluiu que é a história que decide o produto. Suíte verde com teste de leitura reprovado significa que o projeto para (§11.2), e nenhum cenário deste plano muda isso.

---

## 11. Portões de qualidade

**Definição de pronto de uma funcionalidade:**

1. Cenários da funcionalidade verdes na sua camada.
2. Nenhum cenário `@critico` vermelho em nenhuma camada.
3. `cobertura.py` sem lacunas.
4. Nenhum cenário `@lacuna` da funcionalidade sem decisão registrada em `decisoes.md`.

**Portão de release (RN-029):**

| Verificação | Critério |
|---|---|
| Suíte de motor | integralmente verde, incluindo as 13 fixtures negativas |
| Suíte de catálogo | verde com M = 1000 por política |
| Suíte de domínio e integração | verde |
| Varredura de copy | RE-009 e RE-011 sem ocorrência |
| Cenários `@defeito` | **zero** — cada um resolvido por decisão registrada, e o cenário reescrito |
| Revisão manual da espinha | 8 itens, integral |
| `cobertura.py` | 100% dos requisitos no escopo |

**Cenário `@defeito` vermelho bloqueia release.** Não se apaga: resolve-se a contradição na especificação, registra-se a decisão e reescreve-se o cenário contra o comportamento decidido.

---

## 12. Plano de execução

Amarrado aos passos de §14 do PRD.

| Fase | Quando | O que roda | Bloqueante |
|---|---|---|---|
| **0 — Reconciliação** | antes de qualquer código | decisão sobre DEF-01 a DEF-05 e LAC-01 a LAC-11, registradas em `decisoes.md` | **sim** — DEF-01 e LAC-01 mudam o modelo de dados |
| **1 — Motor** | primeiro ciclo de implementação | `07`, `08`, `06` sobre catálogos sintéticos | sim |
| **2 — Catálogo** | junto com a escrita do capítulo 1 | `12` com M=50 por commit; fixtures negativas | sim |
| **3 — Domínio** | segundo ciclo | `01` a `05`, `09` | sim |
| **4 — Integração** | terceiro ciclo | `10`, `11`, `13` | sim |
| **5 — Transversal** | contínuo | `14` a cada commit de recurso de texto | sim |
| **6 — Manual** | por marco | leitura, card, RE-010, pareceres | **sim, e é o que decide o projeto** |

**A fase 0 não é formalidade.** DEF-01 muda como o capítulo termina; LAC-01 muda se o Fôlego é global ou por campanha. Ambas alteram o modelo de dados, e descobri-las depois de implementar custa uma migração num produto que decidiu não ter migração (D-031).

---

## 13. Riscos deste plano

| Risco | Mitigação |
|---|---|
| A suíte de catálogo fica lenta e alguém a desativa | M parametrizado: 50 por commit, 1000 na noturna. É a diferença entre uma suíte que roda e uma que existe |
| Cenários `@lacuna` viram especificação por omissão, sem ninguém decidir | fase 0 bloqueante; cada `@lacuna` exige entrada em `decisoes.md` |
| RE-009 e RE-011 viram revisão manual e param de ser verificadas | investir no analisador morfológico antes do terceiro release |
| A suíte verde cria falsa confiança e o teste de leitura é adiado | §10 e §12: a fase 6 é a que decide o projeto, e §11.2 do PRD já fixou o critério de parada |
| Autor solo mantendo 502 casos além de escrever ~260 storylets | as camadas de motor e domínio são as baratas e cobrem o essencial; as de integração e transversal podem ser adiadas sem risco estrutural. A de catálogo, não |

---

*Documento vivo. Alterações exigem entrada correspondente em `decisoes.md`.*
