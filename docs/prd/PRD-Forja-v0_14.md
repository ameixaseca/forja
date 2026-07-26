# PRD — Projeto FORJA (codinome)

**Aplicativo de acompanhamento de treino estruturado como RPG solo de mesa**

| Campo | Valor |
|---|---|
| Versão | **v0.14** |
| Status | **Fechado para início da especificação técnica.** Sem questões abertas de produto, de jogo ou de domínio |
| Autor | Luiz Paulo |
| Data | Julho/2026 |
| Documentos irmãos | **ESPEC — Sistema Narrativo v2.6** (vigente) · **PROTÓTIPO — A Longa Seca v0.2** · **`decisoes.md`** (registro de decisões) |
| Arquivados | ESPEC — Motor de Narrativas v1.0 |
| Pendente de produção | Glossário e cenários BDD (passo 7 de §14) |

**Mudanças desde v0.13.** Esta versão não amadurece o rascunho: ela o fecha. Todas as questões abertas foram decididas e registradas em `decisoes.md`, com racional, alternativa descartada e gatilho de reabertura. As mudanças de maior consequência:

| Mudança | Origem |
|---|---|
| **Campanha gratuita passa de 6 para 4 capítulos.** R-026 cai de ~320 para ~260 storylets | DEC-021 |
| **Trégua de Recuperação** para lesão e doença, sem consumo de reserva | DEC-040 |
| **Economia do Fôlego fechada** — o desenho anterior fazia o jurador de 6 dias avançar 3× mais devagar que o de 2, invertendo D-004 | DEC-032 |
| **Vontade ganha teto** (+3) e curva de progressão | DEC-030 |
| Segunda sessão do dia não avança o arco | DEC-033 |
| RE-006 ganha limiar operacional; PSE definida; deload limitado; janela de retorno sem Marco | DEC-034, DEC-042 a DEC-044 |
| Trégua/reencontro viram regra de motor; RN-031 deixa de ser inerte | DEC-011 |
| Referências obsoletas a pacote remoto purgadas; numeração e referências cruzadas corrigidas | DEC-001 a DEC-006 |

---

## 1. Visão

FORJA transforma o registro de treino em uma campanha de RPG solo. O usuário mantém uma ficha de personagem cujos atributos derivam do treino real, declara um pacto semanal de dias de treino, e cada sessão registrada resolve uma rolagem que avança a narrativa.

O produto **não** é um gerador de treinos, não é rede social e não é um jogo com barra de XP temática. É um **RPG solo de diário** cujo gatilho de resolução é a atividade física real.

### 1.1 Tese central

Apps de fitness falham em retenção porque a recompensa é abstrata e desconectada do esforço. Apps "gamificados" falham porque a camada de jogo é um verniz. FORJA aposta que a ficção cria um motivo para **abrir o app amanhã** que uma barra de progresso não cria, e que essa ficção é o único ativo de um app de treino que outra pessoa tem curiosidade de ver publicado.

### 1.2 Anti-tese

Se a narrativa for percebida como aleatória e sem consequência, o produto colapsa para "Habitica com tema de fantasia" em 4–6 semanas.

**Precedentes que delimitam a aposta:**

- **Zombies, Run!** é o único precedente real de ficção autoral acoplada a esforço físico, e prova que retém — com temporadas de 30 a 60 missões escritas por equipe de escritores, não por autor solo.
- **Wildermyth** é o precedente estrutural exato de D-023: abertura escrita, desfecho escrito, meio procedural. E seu modo de falha é literalmente o R-001 — depois de várias campanhas os padrões de seleção aparecem e a fachada da escrita cai. O limite é o número finito de vinhetas.
- **Fitness-RPG de verniz** (Questing, RPGFitness e similares) confirma a tese negativa: loot box, guilda, ranking, e inimigos que ficam mais fortes quando você falta — o oposto direto de D-007 e RE-001.

---

## 2. Decisões travadas (D)

| ID | Decisão | Justificativa | Alternativa descartada |
|---|---|---|---|
| D-001 | Single-player. Sem grupo, multiplayer ou estado compartilhado. | Escopo de dev solo; evita antifraude, moderação e massa crítica. | Mesa/party como motor de retenção. |
| D-002 | **Sem LLM em tempo de execução.** | Preserva offline (D-008), custo marginal zero, determinismo e ausência de risco de moderação. | Mestre por LLM em runtime. |
| D-003 | Registro por auto-reporte. Sem wearable no MVP. | Em solo não há economia a fraudar. | Health Connect / HealthKit (v2). |
| D-004 | Duas moedas. **Constância** avança campanha. **Superação** alimenta atributos. Nunca performance absoluta. | Atende iniciante e avançado no mesmo sistema. Proporção-alvo 80/20. | XP por tonelagem. |
| D-005 | O app **não prescreve** treino. | Distância deliberada da Lei 9.696/1998 e do CREF. | Programação embutida. |
| D-006 | Descanso e deload são ações de jogo obrigatórias. | Impede incentivo a overtraining. | Streak puro. |
| D-007 | Rolagem nunca pune sessão realizada. | Punir o comportamento desejado é erro fatal. | Falha crítica com perda. |
| D-008 | Offline-first. | Academia tem sinal ruim. | Cloud-first. |
| D-009 | Campanha por marcos narrativos; personagem por atributos. | Barra de XP global perde significado. | Level grinding. |
| D-010 | Superação é **multiplicador de Constância, nunca substituto**. | Implementa o 80/20 estruturalmente. | Soma ponderada. |
| D-011 | Superação medida contra o **próprio histórico**. | Justiça entre corpos; mantém P2 no jogo. | Comparação com norma. |
| D-012 | Superação vale em qualquer eixo de sobrecarga, com peso igual. | Carga é uma variável entre várias. | Marco só por carga. |
| D-013 | Modalidade-agnóstico, sessões compostas por blocos, modalidades criadas pelo usuário. | Cobre híbrido e troca de esporte. | Taxonomia fechada. |
| D-014 | Compartilhamento externo é primeiro-classe; social interno fora. | Laço viral sem moderação. | Feed interno. |
| D-015 | O artefato destaca narrativa, não estatística. | Narrativa é o ativo único; stat não converte. | Card de ficha. |
| D-016 | Artefato gerado no dispositivo, sem postagem automática. | Dado de saúde é sensível. | Renderização server-side. |
| D-017 | Campanha = **espinha autoral + conteúdo procedural**. | Sem intérprete humano, procedural puro não produz enredo. | Procedural puro. |
| D-018 | Superação é sempre **declarada**, nunca inferida. | Inferência só funciona em eixos numéricos, criando assimetria que viola D-012 na prática. | Detecção automática de PR. |
| D-019 | Juramento declarado em **dias de treino**. | O pacto é sobre comparecer. | Juramento em sessões ou blocos. |
| D-020 | Convite carrega **semente de campanha**, não estado. Entrada sempre no capítulo 1. | Efeito de mesa compartilhada sem violar D-001, a custo zero. | Sincronizar progresso. |
| D-021 | ~~Campanha inicial gratuita de 6 capítulos~~ **REVISTA por D-041.** | — | — |
| D-022 | **A narrativa é escrita pelo autor, com IA como ferramenta de apoio.** Nenhuma IA participa da execução. | Reduz o custo de rascunho sem abrir mão do que D-002 protege; mantém autoria humana inequívoca para RC-030. | Geração automática com curadoria posterior. |
| D-023 | **Arquitetura de storylet**, não combinatória de tabelas. | Antirrepetição percebida vem de condição e reconhecimento, não de combinatória. | Casas × entradas com janela de não-repetição. |
| D-024 | ~~Pacote versionado e atualizável remotamente~~ **REVERTIDA por D-031.** Permanece a parte negativa: narrativa **nunca é editável, importável ou criável pelo usuário**. | Moderação, suporte e coerência de estado. | — |
| D-025 | Em pontos definidos do arco, o usuário **escolhe entre 2–3 storylets elegíveis**. | Devolve o papel de intérprete ao usuário e barateia o seletor. | Escolha a cada resolução; ou nenhuma. |
| D-026 | Sem assinatura **no MVP**. Monetização por compra única. Mensalidade permanece possível e não pode ser inviabilizada por nenhuma decisão de agora. | O mercado de RPG solo paga pouco e uma vez; fechar a porta hoje custaria uma migração depois. | Assinatura no MVP; ou descartá-la em definitivo. |
| D-027 | ~~Motor independente; toda campanha é dado~~ **REVERTIDA por D-031.** | — | — |
| D-028 | **Projeto autofinanciado.** | Remove obrigação perante terceiros. Em troca, remove a função de forçamento da validação — ver R-019 e §11.2. | Crowdfunding. |
| D-029 | **Direito de acesso modelado como `{pacote, origem, validoAte?}`** desde o MVP. | Assinatura futura é apenas outra origem preenchendo o campo. | Desbloqueio local hard-coded. |
| D-030 | ~~Motor e ferramental completo como escopo de MVP~~ **REVERTIDA por D-031.** | — | — |
| D-031 | **Campanhas são codificadas. Cada campanha nova é um release.** | Reduz drasticamente o escopo de engenharia do MVP. Custo em §11 da ESPEC. | Motor independente com pacote atualizável. |
| D-032 | **O simulador permanece no escopo do MVP.** | É a única garantia de alcançabilidade. Parte mais barata da ESPEC e a de maior retorno. | Verificação artesanal do catálogo. |
| D-033 | **Disciplina de acoplamento interno mantida:** o subsistema narrativo não conhece treino, ficha nem tela. | Sem isso o simulador exigiria instanciar o app inteiro. | Narrativa acoplada às telas. |
| D-034 | **Kill-switch de storylet**, com restrições estritas de privacidade. | Recupera parte da mitigação de R-001 a custo muito menor que pacote remoto. | Nenhuma correção entre releases. |
| D-035 | ~~Preparado para tradução, não traduzido~~ **REVERTIDA por D-037.** | — | — |
| D-036 | **Storylets como JSON embutido no binário**, não classes, não YAML. | Mantém o catálogo desacoplado e viabiliza o simulador. YAML tem ambiguidade de parsing. | Classes de código; ou YAML. |
| D-037 | **MVP em pt-BR apenas.** Inglês e espanhol adiados. | ~800 unidades × 2 idiomas empatava com a escrita original como maior risco. Traduzir antes de validar arriscaria traduzir o que será reescrito. | Três idiomas no lançamento. |
| D-038 | **Storylet carrega referência de texto, não prosa.** | Prosa no catálogo faria o subsistema tocar locale, quebrando determinismo e simulador. | Prosa embutida. |
| D-039 | **Disponibilidade nas lojas é deliberada. No MVP: Brasil apenas.** | Restringir ao Brasil mantém o escopo em LGPD e reduz o parecer de cinco regimes a um. | Publicar em todos os mercados por padrão. |
| D-040 | **A arquitetura de i18n entra no MVP; o conteúdo traduzido não.** | Retrofitar referência de texto depois exigiria uma passada por todo o catálogo. | Prosa embutida agora, refatorar depois. |
| **D-041** | **Campanha inicial gratuita de 4 capítulos** (~12 semanas), integralmente terminada. Revisa D-021. | Quatro capítulos ≈ D84: o paywall cai **em cima** do D90 em vez de depois. Reduz R-026 em 22% — é o único risco crítico redutível por decisão em vez de por esforço. O produto compete por acoplamento ao treino, não por extensão (R-018). | 6 capítulos; ou 6 com corte posterior. |
| **D-042** | **Trégua de Recuperação**, distinta da Trégua comum: declarável retroativamente em até 14 dias, sem consumo de reserva, sem limite de frequência, sem pergunta sobre o motivo. | O sistema tinha pausa voluntária e nada para lesão ou doença. Um usuário lesionado esgotava a reserva em duas semanas e passava a quebrar ciclos — o produto punia quem está machucado, no cenário exato em que ele não pode parecer cobrar treino. | Usar a Trégua comum; ou não tratar. |
| **D-043** | **Vontade tem teto de +3**, com progressão de custo crescente (2, 6 e 14 ciclos cumpridos). | Modificador irrestrito eliminaria as faixas 7–9 e ≤6 justamente para o usuário mais engajado, e a rolagem deixaria de significar algo. Aos 14 ciclos, triunfo em 58% e reviravolta em 8%: constância compra vantagem substancial, não certeza. | Vontade sem teto; ou modificador fixo. |
| **D-044** | **Fôlego tem teto de 2 por ciclo, acúmulo máximo de 4, e o Marco de capítulo custa 2.** | Sem teto, quem jura 2 dias descansa 5 e acumula 5 por ciclo, enquanto quem jura 6 acumula 1 — o jurador alto avançaria a campanha 3× mais devagar, invertendo o princípio derivado de D-004. Com teto, **todos os perfis habilitam o Marco no piso de 2 ciclos**. | Fôlego linear por dia de descanso. |
| **D-045** | **Não existe duração mínima de sessão**, e isso é decisão explícita. | Qualquer piso é prescrição de treino (colide com D-005) e é enviesado contra P2, contra reabilitação e contra modalidades de sessão curta. O autoengano já está tratado por R-009 da única forma disponível a um jogo solo. | Piso de 10 ou 15 minutos. |

---

## 3. Problema e usuário

### 3.1 Personas

**P1 — "O praticante que quer sabor"**
Treina 3–5 dias/semana, já usa algum log, joga ou jogou RPG de mesa. Não tem dor de motivação; quer que o registro deixe de ser tedioso. Retém mal por definição. É quem **paga** e quem valida. **Definido pelo RPG, não pelo treino** — é onde ele deve ser encontrado e testado.

**P2 — "O fã de RPG sedentário"**
Ama RPG, treina de forma errática. A dor é real: começar e não parar na terceira semana. Declara Juramentos de 1–2 dias e precisa que isso seja legítimo.

> **Princípio derivado (D-004):** Juramento de 2 dias cumprido rende a mesma progressão de campanha que um de 5 cumprido. D-044 existe para que isso seja verdade também na economia do Fôlego, onde não era.

### 3.2 Panorama competitivo

| Cluster | Exemplos | Relação com FORJA |
|---|---|---|
| Fitness-RPG de verniz | Questing, RPGFitness, Fito, GymLevels, Level Up | Confirmam a tese negativa. Não disputam o espaço. |
| Narrativa + atividade física | Zombies, Run!; Marvel Move | Único precedente real. Provam que ficção retém; alertam que é feita por equipe. |
| **Companheiros de RPG solo** | **Solesworn, Solo Quest, Mythic GME, Iron Journal, Stargazer** | **Onde P1 já mora. Definem o teto de preço e ocupam o modelo de §11.** |

> **Alerta de posicionamento:** o Solesworn é gratuito, offline, com dados apenas no dispositivo e pacotes de cenário pagos previstos. Isso não é referência de preço — é o modelo de negócio de §11 já operando a custo zero. Qualquer pacote pago de FORJA precisa justificar valor contra um incumbente gratuito.

---

## 4. Sistema de jogo

### 4.1 Loop principal

```
Domingo      → Firmar o Juramento (dias de treino), declarar Trégua ou Trégua de Recuperação
Durante      → Registrar sessão composta por blocos (< 20s)
Após sessão  → Rolagem de Resolução → storylet selecionado → narrativa
Pontos-chave → Escolha entre 2–3 storylets elegíveis (D-025)
Opcional     → Declarar Marco de Superação (por bloco)
Fim de ciclo → Fechamento → Fôlego → avanço do arco
Condicional  → Marco de capítulo (escolha irreversível)
```

### 4.2 Ficha de personagem

| Atributo | Cresce por | Efeito narrativo |
|---|---|---|
| **Força** | Marcos em blocos de carga | Abre storylets de confronto direto |
| **Vigor** | Marcos em condicionamento | Abre storylets de persistência e travessia |
| **Destreza** | Marcos em mobilidade e técnica | Abre storylets de evasão e precisão |
| **Vontade** | Ciclos com Juramento cumprido | Modificador global na Rolagem |

**Escalas (D-043, DEC-031):**

| Atributo | Faixa | Progressão |
|---|---|---|
| Força, Vigor, Destreza | 0..5 | **3 Marcos naquele atributo = +1 ponto** |
| Vontade | 0..3 | **+1 aos 2 ciclos cumpridos, +2 aos 6, +3 aos 14** |

Com o teto de 2 Marcos por ciclo e o cooldown de 2 ciclos por rótulo (§4.8), o primeiro ponto de um atributo é alcançável dentro do capítulo 1 e o segundo não — que é o que faz o capítulo 2 parecer diferente. Ciclo quebrado nunca reduz atributo (RN-003); ciclo de Trégua não conta para Vontade.

**O 80/20 estrutural:** Vontade é o único atributo que modifica rolagens — **constância controla a chance de sucesso**. Os outros três entram como **pré-requisito de elegibilidade de storylet** — **superação controla o repertório**, nunca a probabilidade.

**Mecanismo concreto.** Toda complicação tem um caminho de fechamento **base**, disponível a qualquer ficha, e caminhos **gatilhados** por Força, Vigor ou Destreza, que entregam desfechos diferentes ou melhores. Resolver pela força, pela persistência ou pela precisão. Nenhuma construção de personagem fica sem saída; construções diferentes atravessam a mesma complicação por portas diferentes.

### 4.3 O Juramento, a Trégua e o deload

**Juramento.** Declarado em **dias de treino**, faixa de 1 a 6, imutável durante o ciclo, ajustável entre ciclos sem penalidade. Ciclo é sempre semanal. Quebra gera **revés narrativo recuperável**, nunca perda de nível, capítulo ou ficha.

**Ciclo de Trégua.** Declarável antes do início. Não conta como cumprido nem quebrado, não gera Fôlego, não avança capítulo, não interrompe a contagem de consecutivos.

| Regra da Trégua comum (DEC-035) | Valor |
|---|---|
| Crédito | 1 a cada **8 ciclos encerrados de qualquer natureza** |
| Reserva máxima | 2 |
| Crédito inicial | **1, disponível desde o primeiro ciclo** |

Contar apenas ciclos cumpridos negaria Trégua justamente a quem está em dificuldade, que é quem ela existe para atender. O crédito inicial existe porque a vida acontece na semana 2 tanto quanto na 10.

**Trégua de Recuperação (D-042).** Para lesão, doença ou qualquer interrupção não voluntária.

| Regra | Valor |
|---|---|
| Declaração | a qualquer momento, inclusive **retroativa em até 14 dias** |
| Custo | **nenhum** — não consome reserva, sem limite de frequência |
| Duração | 1 a 8 ciclos, prorrogável |
| Efeito | não conta como cumprido nem quebrado; não gera Fôlego; não avança capítulo; não interrompe consecutivos |
| Motivo | **o app não pergunta** e não registra natureza de lesão |
| Saída | resolução de reencontro (§4.6); redução do Juramento oferecida como padrão pré-selecionado, dispensável |
| Métricas | ciclos em Recuperação saem do denominador de toda métrica de constância (RN-038) |

A retroatividade existe porque ninguém declara pausa no dia em que se machuca — declara quando percebe que não vai voltar essa semana. Não perguntar o motivo é decisão de privacidade e de tom: o produto não diagnostica, e RE-005 já encaminha ao profissional.

**Deload (DEC-034).** Declarável antes do início do ciclo. Conta como cumprido e dobra o teto de Fôlego do ciclo. **Máximo de 1 a cada 4 ciclos**, sem acúmulo. O limite fecha o exploit de "ciclo cumprido perpétuo sem treino declarado" e coincide com a prática corrente de periodização — uma semana de descarga a cada três a cinco de acúmulo.

### 4.4 Rolagem de Resolução

`2d6 + Vontade`, com Vontade ∈ 0..3 (D-043).

| Resultado | Efeito |
|---|---|
| 10+ | Triunfo — avanço narrativo limpo |
| 7–9 | Avanço com custo — complicação introduzida no estado do mundo |
| ≤6 | Reviravolta — avança mesmo assim (D-007); a história vira contra o personagem |

| Vontade | Triunfo | Custo | Reviravolta |
|---|---|---|---|
| 0 | 16,7% | 41,7% | 41,7% |
| 1 | 27,8% | 44,4% | 27,8% |
| 2 | 41,7% | 41,7% | 16,7% |
| 3 | 58,3% | 33,3% | 8,3% |

O resultado é **um pré-requisito de seleção de storylet**, não um multiplicador de recompensa. Nenhum resultado reverte progresso mecânico.

### 4.5 Descanso Longo e Fôlego

Dia sem treino em ciclo cumprido gera **Fôlego**, consumido obrigatoriamente em Marcos de capítulo. É mecanicamente impossível avançar a campanha treinando todos os dias.

| Regra (D-044) | Valor |
|---|---|
| Fôlego por dia de descanso em ciclo cumprido | 1 |
| **Teto por ciclo** | **2** |
| Deload | dobra o teto do ciclo, para 4 |
| Acúmulo máximo | 4 |
| **Custo do Marco de capítulo** | **2** |
| Ciclo quebrado, Trégua ou Recuperação | 0 |

Com o teto de 2, todo jurador de 1 a 5 dias recebe 2 por ciclo e o de 6 dias recebe 1. Dois ciclos cumpridos entregam 4 e 2 respectivamente — ambos ≥ 2, ou seja, **todos os perfis habilitam o Marco de capítulo no piso de 2 ciclos de §4.9**. O teto de acúmulo impede estocar Fôlego para atravessar dois capítulos sem treinar.

### 4.6 Arquitetura de storylets (D-023)

**Unidade de conteúdo — o storylet:**

| Componente | Descrição |
|---|---|
| Referência de texto | Chave de recurso, com variantes por estado. Nunca prosa (D-038) |
| Pré-requisitos | Capítulo, arco, atributos, resultado da rolagem, entidades vivas, complicações abertas, storylets já vistos |
| Efeitos | Cria/mata entidade, abre/fecha complicação, marca conhecimento, altera tom do arco |
| Peso | Multiplicidade na bolsa de sorteio |

**Espinha autoral (D-017).** Cada capítulo tem abertura escrita, entidade central, complicação estruturante e desfecho escrito. Storylets preenchem o meio.

**Seleção.** Supressão por estado de entrada → filtragem por pré-requisito → regra de pressão → estratificação por banda → sorteio **sem reposição** → aplicação de efeitos. Detalhamento em §6.1 da ESPEC vigente.

**Escolha do usuário (D-025).** Dois pontos por capítulo: um intermediário, que dispara na primeira resolução com `cap.resolucoes ≥ 6` e ao menos 2 storylets de `Arco` elegíveis, e o Marco de capítulo. Nas demais resoluções a seleção é automática, para preservar RF-010.

**Reconhecimento de ausência.** Em ciclo de Trégua ou de Recuperação, apenas a banda de ambientação é consultada — o mundo comenta a ausência e o arco não anda. Na primeira resolução após uma Trégua encerrada ou após 10 dias sem sessão, a resolução é forçada a uma vinheta de reencontro. **Uma resolução apenas.** Suprimir o arco durante um ciclo inteiro por baixa constância foi considerado e rejeitado: colide com D-007, porque puniria com ambientação o usuário que voltou a treinar.

**Orçamento de conteúdo.** Razão entre extensão total escrita e extensão média de uma travessia. Referência da indústria: **0,2**. Abaixo disso, o autor gasta energia em conteúdo que quase ninguém verá; muito acima, a campanha é rasa em variação.

**Modo de falha conhecido:** o limite é o número finito de vinhetas. Em travessias repetidas o padrão de seleção aparece e a fachada cai (R-001). Storylet não elimina esse teto — apenas o empurra e o torna orçável.

### 4.7 Pipeline de conteúdo (D-022, D-031)

**Autoria.** O autor escreve a narrativa, usando IA como ferramenta de apoio à escrita (D-022) — como usaria um editor de texto ou um caderno de notas. Não há geração automática de conteúdo publicável.

> **Nota de custo:** IA acelera prosa. Ela não decide elegibilidade nem efeito sobre o estado do mundo — que é onde mora o custo real do storylet. D-022 reduz R-015; não o elimina.

**Campanha codificada (D-031).** O catálogo é composto por arquivos JSON embutidos nos assets do aplicativo. Campanha nova exige release do app. **Não há pacote remoto, manifesto, migração de pacote nem assinatura de conteúdo** — o kill-switch de D-034 é a única superfície de rede, e apenas desativa.

**Disciplina de acoplamento (D-033).** O subsistema narrativo não conhece treino, ficha nem tela: a aplicação traduz seu domínio em qualidades de entrada antes de invocar a resolução, e a resolução é função pura. Isso não é purismo — é o que permite o simulador de D-032 existir sem instanciar o app inteiro.

**Imutabilidade pelo usuário.** O usuário nunca cria, edita ou importa storylet. Não há editor, não há conteúdo gerado por usuário, não há importação de arquivo.

**Compatibilidade de estado.** Atualização **do aplicativo** não pode corromper campanha em andamento. O estado é dicionário plano de qualidades e mudanças entre releases devem ser aditivas; qualidades órfãs são ignoradas silenciosamente (RF-130).

### 4.8 Marcos de Superação

Reconhecimento de que o usuário fez algo que **ele próprio** não fazia antes. Única fonte de crescimento de Força, Vigor e Destreza. Sempre **declarado** (D-018).

**Eixos, peso igual (D-012):** carga, repetição, volume, amplitude, duração, distância, densidade.

**Rótulo livre** com autocompletar do próprio histórico. É a chave do cooldown e o único lugar onde identidade de exercício existe no sistema.

**Contenções:**

| Contenção | Regra |
|---|---|
| Teto | 2 Marcos contabilizados por ciclo |
| Cooldown | 2 ciclos por rótulo |
| Teste de repetição máxima | nunca gera Marco e nunca é sugerido |
| Ciclo não cumprido | Marco registrado, não contabilizado |
| **Janela de retorno (DEC-044)** | após **21 dias ou mais sem sessão**, ou ao encerrar uma Trégua de Recuperação, Marcos ficam **registráveis porém não contabilizados por 2 ciclos** |

**A janela de retorno** cobre o cenário clássico de lesão no retorno, e é onde um sistema que premia superação relativa ao próprio histórico é mais perigoso — o histórico é de um corpo que teve três semanas de destreino. É a única regra do sistema que retém temporariamente uma recompensa por algo realizado, e é aceita porque o vetor de dano é físico e irreversível, ao contrário do de motivação. Registrar em vez de bloquear preserva D-007: o usuário não perde nada por ter feito. O texto de interface é descritivo, sem instrução (RE-009).

**Autocalibração observada:** P2 é limitado pelo **teto**, P1 pelo **cooldown**. O par regula os dois perfis sem classificar ninguém.

### 4.9 Marco de capítulo

Dispara quando **todas** se cumprem:

1. mínimo de **2 ciclos com Juramento cumprido** desde o Marco anterior;
2. o arco tem complicação em aberto pronta para desfecho;
3. há **2 pontos de Fôlego**.

**Teto:** aos **4 ciclos cumpridos**, dispara independentemente da condição 2 — a espinha força o desfecho. Nesse caso o storylet de desfecho fecha as complicações pendentes como efeito e o texto reconhece que ficaram por resolver; nenhum predicado de desfecho lê estado de complicação (T-29 da ESPEC). Sem esse cuidado, um jogador de baixa rolagem chegaria ao teto com o desfecho inelegível e o capítulo travaria.

A condição 3 nunca é o gargalo: por D-044, dois ciclos cumpridos entregam Fôlego suficiente em qualquer perfil de Juramento.

**Capítulo 1 usa o piso de 2 ciclos.** P2 morre na terceira semana; o primeiro desfecho precisa chegar antes disso.

### 4.10 Modalidades e sessões compostas

| Modalidade | Atributo | Eixos típicos |
|---|---|---|
| Musculação / levantamento | Força | carga, repetição, volume |
| Calistenia | Força / Destreza | repetição, progressão, amplitude |
| Corrida / natação / ciclismo | Vigor | distância, duração, densidade |
| Escalada | Força / Destreza | grau, duração, amplitude |
| Luta / artes marciais | Vigor / Destreza | duração, densidade, técnica |
| Dança | Destreza / Vigor | duração, amplitude, técnica |
| Mobilidade | Destreza | amplitude, duração |
| Funcional / híbrido | composta | herdada dos blocos |
| Definida pelo usuário | escolhido na criação | escolhidos na criação |

**Campos de registro (RF-010):** tipo, duração e **PSE**. PSE é **inteiro de 0 a 10 na escala de Borg CR10**, com rótulos verbais nas âncoras, e é **campo opcional** — sessão sem PSE é válida e não gera pendência, e é excluída da média de RE-006. Opcional porque três campos obrigatórios não cabem no orçamento de 20 segundos.

**Sem duração mínima (D-045).** Não há piso, e a ausência é deliberada.

**Sessão composta.** Contêiner de blocos. Marcos são por bloco; o teto é global; a sessão ocupa **um dia** do Juramento.

**Segunda sessão do mesmo dia (DEC-033).** Permitida (RF-013), e gera resolução — mas **restrita à banda de ambientação**, sem avanço de arco. O usuário continua recebendo texto; a história não anda duas vezes no mesmo dia. Recompensar narrativamente o segundo treino do dia seria incentivo a volume que o produto não tem como calibrar por indivíduo (R-008).

> **Compensação:** condensar treinos não penaliza. Mais blocos = mais oportunidade de Superação, e o dia liberado vira descanso → Fôlego → Marco de capítulo. Volume condensado converte-se em capital narrativo. Precisa ser dito no onboarding.

**Modalidade criada pelo usuário.** Sem validação. Atributo e eixos **editáveis retroativamente**, com recálculo sem penalidade.

### 4.11 Artefato de Compartilhamento

| Evento | Peça |
|---|---|
| Capítulo concluído | Página de diário com título e trecho |
| Marco de capítulo resolvido | Cena da escolha irreversível |
| Ciclo cumprido | Selo, sem números de treino |
| Marco de Superação | Cartão sóbrio, auto-relativo |
| Campanha finalizada | Retrospectiva narrativa |

Camada obrigatória: narrativa. Opcionais desligadas por padrão: modalidades, ciclos, atributos. Nunca disponíveis: peso, medidas, comparação, carga crua. Pré-visualização integral com controle granular. **Semente de campanha** embutida, sem identificador do convidante.

---

## 5. Escopo

### 5.1 Dentro do MVP

- Uso completo sem conta; conta opcional para backup
- Criação de personagem
- Ciclo semanal de Juramento em dias, com Trégua, **Trégua de Recuperação** e deload
- Registro de sessão composta, modalidades variadas e criadas pelo usuário
- Rolagem de Resolução
- Subsistema de storylets com pré-requisitos, efeitos e shuffle bag, conforme a ESPEC vigente
- **Simulador de travessias com cinco políticas de agente** (D-032) e as suítes de catálogo e de motor
- **Catálogo JSON embutido nos assets**, com kill-switch de desativação (D-034)
- Espinha autoral de **4 capítulos** + catálogo de storylets (D-041)
- Escolha entre elegíveis nos dois pontos por capítulo
- Marcos de Superação com rótulo livre, teto, cooldown e janela de retorno
- Fôlego e Descanso Longo
- Diário navegável e exportável
- Artefatos de compartilhamento com semente
- Modo totalmente offline
- Exportação e exclusão de dados
- Arquitetura de i18n com um idioma preenchido (D-040)

### 5.2 Fora do MVP

| Item | Motivo |
|---|---|
| Feed interno, perfil público, party, ranking | D-001, D-014 |
| LLM em tempo de execução | D-002 |
| Editor de conteúdo para usuário; importação de storylet | D-024 (parte remanescente) |
| Pacote de conteúdo remoto, manifesto, migração de pacote, assinatura | D-031 |
| Validação estática como portão de publicação | D-031 — substituída pelas suítes da ESPEC |
| Conteúdo traduzido, maquinaria de concordância por idioma | D-037 |
| Wearable / Health Connect / HealthKit | D-003 |
| Prescrição de treino | D-005 |
| Nutrição, calorias, peso corporal como métrica | Fora da tese |
| Notificação de culpa / streak agressivo | D-006, D-007 |
| Loja de itens, moeda, loot box | §8 |
| Assinatura / cobrança recorrente | D-026 — **fora do MVP, preservada como possível** por D-029 |
| Validação de disposição a pagar | DEC-025 — diferida com método e gatilho fixados |
| Base de exercícios catalogada | Rótulo livre substitui |
| Ciclo quinzenal | Ciclo é sempre semanal |

---

## 6. Requisitos funcionais (RF)

### 6.1 Personagem e ciclo

- **RF-001** — Permitir criar personagem com nome, arquétipo e origem narrativa.
- **RF-002** — Derivar os quatro atributos exclusivamente do histórico registrado, nas escalas de §4.2.
- **RF-003** — Não permitir distribuição manual de pontos.
- **RF-004** — Permitir declarar Juramento de 1 a 6 **dias de treino** por ciclo semanal.
- **RF-005** — Bloquear alteração do Juramento durante o ciclo.
- **RF-006** — Permitir declarar deload antes do início do ciclo, no máximo **1 a cada 4 ciclos**.
- **RF-007** — Permitir declarar **Ciclo de Trégua**: 1 crédito a cada 8 ciclos encerrados, reserva máxima 2, 1 crédito inicial.
- **RF-007A** — Permitir declarar **Trégua de Recuperação** a qualquer momento, inclusive retroativamente em até 14 dias, sem consumo de crédito e sem limite de frequência, com duração de 1 a 8 ciclos prorrogável, **sem solicitar ou registrar o motivo**.
- **RF-008** — Encerrar o ciclo automaticamente e apresentar o Fechamento.
- **RF-009** — Apresentar o Fechamento sem linguagem de julgamento.

### 6.2 Registro de sessão

- **RF-010** — Permitir registrar sessão com tipo, duração e **PSE (Borg CR10, 0 a 10, opcional)** em **menos de 20 segundos**.
- **RF-011** — Permitir notas livres, incorporáveis ao diário.
- **RF-012** — Permitir registro retroativo de até 48 horas.
- **RF-013** — Permitir no máximo 2 sessões por dia; ambas ocupam o mesmo dia do Juramento.
- **RF-014** — Funcionar integralmente sem conexão.
- **RF-015** — Sincronizar registros locais quando houver conexão e conta ativa.
- **RF-016** — Não capturar exercícios individuais na sessão.
- **RF-017** — **Não impor duração mínima de sessão** (D-045).

### 6.3 Motor de storylets

- **RF-020** — Executar a Rolagem de Resolução ao confirmar sessão.
- **RF-021** — Selecionar storylet conforme o algoritmo de §6.1 da ESPEC vigente: supressão por entrada, filtragem, pressão, estratificação, sorteio sem reposição.
- **RF-022** — Aplicar os efeitos do storylet selecionado ao estado do mundo antes de compor o texto.
- **RF-023** — *(Arquitetura.)* Manter estado persistente de entidades, complicações, conhecimento e desfechos, de modo que retornos sejam **explicitamente reconhecidos** no texto.
- **RF-024** — Apresentar **2 a 3 storylets elegíveis para escolha** nos dois pontos por capítulo, degradando para seleção automática quando houver menos de 2 elegíveis.
- **RF-025** — Garantir que exista sempre ao menos um storylet elegível; na ausência, recorrer ao storylet de ambientação de reserva, **nunca ao desfecho de capítulo**.
- **RF-026** — Registrar toda resolução no Diário, com data e sessão vinculada.
- **RF-027** — Permitir exportar o Diário em **JSON estruturado** (portabilidade, art. 18, V) e, adicionalmente, em markdown legível.
- **RF-028** — Apresentar Marcos de capítulo com no mínimo duas escolhas irreversíveis.
- **RF-029** — Disparar Marco de capítulo conforme §4.9, com teto de 4 ciclos.
- **RF-030A** — Fornecer ao subsistema narrativo as entradas `in.tregua`, `in.reencontro` e `in.sessao_secundaria`, calculadas pela aplicação. `in.reencontro` é 1 na primeira resolução após uma Trégua encerrada ou após 10 dias ou mais sem sessão registrada.

### 6.4 Pipeline de conteúdo

- **RF-030** — Compilar a narrativa no aplicativo. Campanha nova é entregue por release (D-031).
- **RF-031** — Não oferecer ao usuário qualquer meio de criar, editar, importar ou exportar storylet.
- **RF-032** — Suportar múltiplas campanhas coexistindo, com estado independente por campanha.
- **RF-033** — Registrar a versão do aplicativo em cada entrada do Diário, para rastreabilidade de correções.
- **RF-034** — Garantir que atualização do aplicativo não corrompa campanha em andamento.
- **RF-035** — *(Arquitetura, D-033.)* O subsistema narrativo não conhece treino, ficha, ciclo ou tela.
- **RF-036** — Manter a resolução como função pura: estado + entradas + índice → resolução, sem persistência nem E/S.
- **RF-037** — Armazenar o catálogo como arquivos **JSON** embutidos nos assets (D-036).
- **RF-038** — Buscar, na inicialização, arquivo estático com lista de ids desativados: timeout de 1,5 s, cache da última lista, lista vazia como padrão (D-034).
- **RF-039** — Realizar a busca de RF-038 **sem identificador de usuário ou dispositivo, sem parâmetro de consulta e sem telemetria**, e declará-la em seção própria da política de privacidade.
- **RF-039A** — Limitar a busca a no máximo uma vez a cada 24 h, com **jitter aleatório de até 6 h**, e contratar a distribuição com **retenção de log desabilitada e sem retenção de IP** (DEC-024).
- **RF-039B** — Ignorar, na aplicação da lista de desativados, qualquer id pertencente à banda de espinha ou ao storylet de ambientação de reserva.

#### 6.4.1 Simulador e testes

Uso exclusivo do desenvolvedor, executado em CI. Escopo de MVP por D-032: com correção dependente de release, é a única defesa antes da produção.

- **RF-100** — Prover simulador de travessia: N resoluções com semente fixa e política de agente, emitindo o texto resultante em sequência para leitura corrida.
- **RF-101** — Prover as políticas `constante`, `erratico`, `especialista`, `pessimo` e `intermitente`.
- **RF-102** — Reportar razão vistos/escritos, histograma por storylet **e por variante**, lista de storylets e variantes **nunca sorteados**, e distribuição de resoluções por banda e por capítulo.
- **RF-103** — Manter em CI a **suíte de catálogo e a suíte de motor** da ESPEC vigente, incluindo as fixtures de teste negativo.

#### 6.4.2 Arquitetura de internacionalização

Entra no MVP com **um único idioma preenchido** (pt-BR). O conteúdo traduzido é posterior (D-037, D-040).

- **RF-120** — Estruturar todo texto exibido em arquivos de recurso por idioma, com pt-BR preenchido e estrutura pronta para `en` e `es`.
- **RF-121** — Selecionar idioma pelo ajuste do dispositivo, com troca manual persistida.
- **RF-122** — Manter o estado de campanha **agnóstico de idioma**.
- **RF-123** — **Não embutir prosa no catálogo** (D-038).
- **RF-124** — Declarar **gênero por entidade** desde a autoria, ainda que só pt-BR seja preenchido.
- **RF-125** — Realizar formatação de número, plural e data exclusivamente na apresentação.
- **RF-126** — Manter **nomes próprios de entidade invariantes entre idiomas**, com `nome_traduzivel: true` como exceção explícita para títulos descritivos.

**Adiado para depois do MVP:** tradução de conteúdo, maquinaria de concordância por idioma, briefing de tradução, revisão jurídica de termos por idioma.

#### 6.4.3 Compatibilidade e resiliência de estado

- **RF-130** — Ignorar de forma resiliente qualidades órfãs no estado carregado, sem lançar exceção de desserialização.
- **RF-131** — Manter nomes de qualidade estritamente em ASCII, com todo texto de exibição em arquivos de recurso por idioma.

#### 6.4.4 Direito de acesso

- **RF-110** — Modelar direito de acesso como `{pacote, origem, validoAte?}`, com `validoAte` nulo significando perpétuo (D-029).
- **RF-111** — Suportar `origem` como valor extensível, sem que a adição de uma origem exija migração de dados.
- **RF-112** — Avaliar direito de acesso localmente, mantendo o app funcional offline.
- **RF-113** — Não implementar cobrança recorrente no MVP, e não introduzir nenhuma decisão que a inviabilize.

### 6.5 Superação

- **RF-040** — Permitir declarar Marco vinculado a um bloco de sessão registrada.
- **RF-041** — Oferecer todos os eixos com igual destaque.
- **RF-042** — Limitar a 2 Marcos contabilizados por ciclo.
- **RF-043** — Aplicar cooldown de 2 ciclos por rótulo.
- **RF-044** — Registrar, sem contabilizar, Marcos excedentes ou em ciclo não cumprido.
- **RF-045** — Permitir rótulo livre com autocompletar exclusivamente do histórico do próprio usuário.
- **RF-046** — Não inferir Marcos automaticamente.
- **RF-047** — Identificar, a partir de sessão **já registrada**, discrepância positiva em relação ao histórico do próprio usuário e oferecer a declaração de Marco, sem preenchimento automático, sem sugerir ação futura e sem mencionar carga, série, repetição, progressão ou substituição de exercício.
- **RF-048** — Registrar sem contabilizar todo Marco declarado nos **2 ciclos seguintes** a um intervalo de 21 dias ou mais sem sessão, ou ao encerramento de uma Trégua de Recuperação, informando-o em redação descritiva conforme RE-009.
- **RF-049** — Converter 3 Marcos contabilizados no mesmo atributo em +1 ponto, com teto de 5.

### 6.6 Modalidades

- **RF-050** — Suportar qualquer modalidade sem privilegiar nenhuma.
- **RF-051** — Permitir criar modalidade com atributo alvo e eixos escolhidos.
- **RF-052** — Permitir compor sessão com múltiplos blocos.
- **RF-053** — Contabilizar sessão composta como um dia do Juramento.
- **RF-054** — Vincular cada Marco ao bloco e atributo correspondentes.
- **RF-055** — Permitir trocar de modalidade sem perder campanha, atributos ou histórico.
- **RF-056** — Adaptar campos de registro à modalidade do bloco.
- **RF-057** — Permitir editar retroativamente atributo e eixos de modalidade criada, recalculando sem penalidade.

### 6.7 Compartilhamento

- **RF-060** — Gerar artefato para cada evento de §4.11.
- **RF-061** — Gerar todo artefato integralmente no dispositivo.
- **RF-062** — Exibir pré-visualização integral antes de compartilhar.
- **RF-063** — Permitir ligar/desligar cada camada opcional individualmente.
- **RF-064** — Manter camadas opcionais desligadas por padrão.
- **RF-065** — Usar exclusivamente a folha de compartilhamento nativa do SO.
- **RF-066** — Não solicitar permissão de publicação, login social nem contatos.
- **RF-067** — Embutir **semente de campanha**, permitindo iniciar a mesma campanha a partir do capítulo 1.
- **RF-068** — Permitir salvar o artefato localmente sem compartilhar.
- **RF-069** — Não condicionar progressão ao ato de compartilhar.
- **RF-070** — Limitar a uma sugestão de compartilhamento por evento.

### 6.8 Fôlego e descanso

- **RF-080** — Conceder 1 Fôlego por dia de descanso em ciclo cumprido.
- **RF-081** — Exigir **2 Fôlego** para iniciar Marco de capítulo.
- **RF-082** — Dobrar o teto de Fôlego do ciclo em deload.
- **RF-083** — Não conceder benefício por treinar acima do Juramento.
- **RF-084** — Limitar o Fôlego a **2 por ciclo** e a **4 acumulados**.

### 6.9 Dados e privacidade

- **RF-090** — Permitir uso completo sem criação de conta.
- **RF-091** — Permitir exportação integral dos dados.
- **RF-092** — Permitir exclusão definitiva de conta e dados em até 15 dias.
- **RF-093** — Coletar consentimento específico e destacado para dado de saúde, granular por finalidade.

---

## 7. Regras de negócio (RN)

- **RN-001** — Progressão de campanha é função exclusiva de `dias_treinados / dias_jurados`.
- **RN-002** — Juramento cumprido avança o arco, independentemente do valor declarado.
- **RN-003** — Nenhum resultado de rolagem reduz atributo, nível ou capítulo.
- **RN-004** — Quebra de Juramento gera revés narrativo com caminho de recuperação explícito.
- **RN-005** — Vontade é o único atributo que modifica rolagem, com teto de +3. Força, Vigor e Destreza atuam apenas como pré-requisito de elegibilidade.
- **RN-006** — Dias treinados além do Juramento não geram Fôlego, rolagem de arco nem progressão.
- **RN-007** — Marco de capítulo exige 2 Fôlego.
- **RN-008** — Três ciclos consecutivos não cumpridos disparam sugestão de reduzir o Juramento. Trégua e Recuperação não contam para os três.
- **RN-009** — O app nunca exibe peso corporal, percentual de gordura ou meta calórica como elemento de jogo.
- **RN-010** — Nenhum texto atribui valor moral ao cumprimento ou descumprimento.
- **RN-011** — Superação alimenta exclusivamente Força, Vigor e Destreza.
- **RN-012** — Superação em ciclo não cumprido tem efeito mecânico nulo.
- **RN-013** — Superação é sempre relativa ao histórico do próprio usuário.
- **RN-014** — Todos os eixos de sobrecarga têm peso idêntico.
- **RN-015** — Teste de repetição máxima não gera Marco e não é sugerido.
- **RN-016** — Nenhuma modalidade tem tratamento privilegiado.
- **RN-017** — Sessão composta ocupa um dia do Juramento.
- **RN-018** — Troca ou reconfiguração de modalidade não penaliza.
- **RN-019** — Compartilhar é opcional e nunca altera progressão.
- **RN-020** — Artefato nunca contém peso, medidas nem comparação com terceiros.
- **RN-021** — Nenhum dado de treino sai do dispositivo por causa de compartilhamento.
- **RN-022** — A semente identifica a campanha e **nunca** o convidante.
- **RN-023** — Marco de capítulo dispara apenas com as três condições, ou por teto de 4 ciclos.
- **RN-024** — Nenhum storylet é elegível sem que seus pré-requisitos estejam integralmente satisfeitos.
- **RN-025** — Storylet já consumido não retorna ao sorteio até esgotamento da bolsa.
- **RN-026** — Todo conteúdo narrativo é publicado pelo controlador. O usuário nunca é autor, editor ou importador.
- **RN-027** — Nenhuma chamada a modelo de linguagem ocorre durante o uso do aplicativo.
- **RN-028** — Campanha nova é entregue por release do aplicativo.
- **RN-029** — Release que não passe integralmente nas suítes de catálogo e de motor da ESPEC vigente não é publicável.
- **RN-030** — Mudança no dicionário de qualidades entre releases deve ser aditiva; campanha em andamento nunca é invalidada por atualização.
- **RN-031** — Em ciclo de Trégua ou de Recuperação, apenas a banda de ambientação é consultada: a narrativa **reconhece a ausência** e o arco **não anda**. Na primeira resolução após uma Trégua encerrada ou após 10 dias sem sessão, a resolução é de reencontro. **Baixa constância fora desses casos não suprime o arco** — o usuário que voltou a treinar recebe progressão narrativa normal.
- **RN-032** — Storylet desativado é excluído da filtragem, jamais alterando estado já gravado.
- **RN-033** — O estado de campanha é agnóstico de idioma.
- **RN-034** — Nenhum idioma é lançado parcialmente traduzido.
- **RN-035** — Nenhum texto exibido ao usuário é literal no código ou no catálogo.
- **RN-036** — A segunda sessão registrada no mesmo dia gera resolução restrita à banda de ambientação, sem avanço de arco.
- **RN-037** — Não há duração mínima de sessão.
- **RN-038** — Ciclos em Trégua de Recuperação saem do denominador de toda métrica de constância e não interrompem a contagem de ciclos consecutivos.
- **RN-039** — Marco de capítulo forçado por teto de 4 ciclos fecha as complicações pendentes do capítulo como efeito do desfecho.

---

## 8. Ética de design

- **RE-001** — Sem loot box, moeda premium ou recompensa aleatória de valor.
- **RE-002** — Sem notificação noturna e sem notificação de culpa.
- **RE-003** — Sem streak irreversível.
- **RE-004** — Sem métrica corporal como objetivo do jogo.
- **RE-005** — Aviso de que o app não substitui profissional de educação física ou médico, com recomendação de avaliação, exibido na primeira abertura com aceite registrado e **permanentemente acessível nos ajustes. Sem reexibição periódica** — aviso repetido é ignorado por hábito, que é o pior estado possível para um aviso de segurança.
- **RE-006** — Relatar padrão observado sem instruir, deixando a conclusão com o usuário. **Limiar operacional:** dispara quando, por **dois ciclos consecutivos**, frequência semanal, duração total semanal ou PSE médio excederem em **40% ou mais** a média das 4 semanas anteriores. Exige histórico mínimo de 4 ciclos. **No máximo um aviso a cada 4 ciclos.** Redação estritamente descritiva e no passado: *"sua frequência nos últimos 7 dias foi 45% maior que a média das últimas 4 semanas"*.
- **RE-007** — Uma sugestão de compartilhamento por evento, dispensável, sem badge de "não compartilhado".
- **RE-008** — Sem lista de contatos, sem sugestão de pessoas, sem vínculo identificável entre convidante e instalador.
- **RE-009** — **Regra transversal de redação.** Nenhuma mensagem referente a execução de exercício é redigida no modo imperativo ou em tempo futuro. Testável em revisão de copy.
- **RE-010** — Todo storylet publicado passa por revisão quanto a conteúdo sensível, coerência com RE-001 a RE-011 e ausência de conselho de treino. Item obrigatório da lista de verificação de release.
- **RE-011** — **Convenção de concordância.** Nenhum texto constrói frase em que o nome de entidade seja precedido de preposição que exija contração com artigo (*do*, *no*, *ao*). Evita a maquinaria de molde até existir um segundo idioma (DEC-019).

---

## 9. Conformidade

### 9.1 LGPD

Dado de saúde é **dado pessoal sensível** (art. 5º, II, Lei 13.709/2018).

- **RC-001** — Base legal: **consentimento específico e destacado (art. 11, I), granular por finalidade**. Consentimentos separados para (a) funcionamento local da ficha e do diário e (b) backup em nuvem. **O art. 7º não é base admissível aqui:** o rol do art. 11 é exaustivo para dado sensível.
- **RC-002** — Finalidade limitada; vedado uso secundário. Em particular, **não se coleta motivo de Trégua de Recuperação**: seria dado de saúde adicional sem finalidade declarada.
- **RC-003** — Sem compartilhamento com terceiros, sem ad tech, sem SDK que exfiltre dado de saúde.
- **RC-004** — Dados no dispositivo por padrão; nuvem apenas com conta e consentimento.
- **RC-005** — Papéis documentados em política de privacidade específica.
- **RC-006** — Informar, na primeira publicação, que o conteúdo pode revelar informação de saúde.
- **RC-007** — Métrica de convite agregada e não identificável.
- **RC-008** — Dado de treino do usuário **nunca** é enviado a provedor de IA. D-022 opera exclusivamente em tempo de autoria, sobre conteúdo do controlador.
- **RC-009** — A busca do kill-switch é declarada em seção própria da política, com descrição do que é buscado e do que não é enviado, e é servida por distribuição contratada sem retenção de log nem de IP (RF-039A).

### 9.1.1 Jurisdição

- **RC-040** — **MVP disponível apenas no Brasil** (D-039). Regime aplicável: LGPD, exclusivamente.
- **RC-041** — *(Ativa apenas com expansão.)* Incluir a União Europeia implica **GDPR art. 9**.
- **RC-042** — *(Ativa apenas com expansão.)* Mercados hispanofalantes exigem mapear Argentina, México, Colômbia e Chile.
- **RC-043** — *(Ativa apenas com expansão.)* Termos e política revistos juridicamente por idioma, não apenas vertidos.

### 9.2 Regulação profissional

- **RC-010** — Posicionamento como **registro e acompanhamento**, não prescrição (Lei 9.696/1998, CONFEF/CREF). Operacionalizado por RE-009, RE-010, RF-017 e RF-047. **A ausência de duração mínima de sessão (D-045) integra esta postura:** definir piso seria prescrever.

### 9.3 Menores

- **RC-020** — **Idade mínima 18 anos no MVP.** Consentimento de relativamente incapaz para dado sensível de saúde sem assistência é frágil, e autodeclaração por checkbox não resolve. Elevar o piso apaga a questão a custo de mercado desprezível. Reavaliar apenas com parecer específico.

### 9.4 Propriedade intelectual

- **RC-030** — **Catálogo de storylets e espinha de campanha:** obra do desenvolvedor. Vedada extração, compilação ou redistribuição.
- **RC-031** — **Saída narrativa da campanha do usuário:** licença perpétua, mundial, gratuita, não exclusiva e **inclusive comercial**, com atribuição solicitada e não exigida. **Escopo estrito ao log do diário.** Excluídos expressamente: regras de transição, identificadores de storylet, metadados de qualidade e o texto bruto dos modelos do catálogo.
- **RC-032** — **Notas do usuário:** integralmente dele, sem licença ao app.
- **RC-033** — **Autoria.** A narrativa é escrita pelo autor com IA como ferramenta de apoio (D-022). A autoria humana exigida pela LDA 9.610/98 é inequívoca.
- **RC-034** — **Política operacional de uso de IA na autoria** (DEC-023), vigente desde o primeiro storylet: (a) admissível apenas provedor cujos termos atribuam ao usuário os direitos sobre a saída, verificado na data de uso e registrado; (b) registro versionado de prompts e revisões no mesmo repositório do catálogo; (c) revisão humana registrada de todo texto publicado. A conferência jurídica dos termos é item da lista de verificação de release, não pendência de especificação.

> A licença comercial de RC-031 é decisão de crescimento: o laço viral depende de o usuário publicar o texto, e ambiguidade contratual inviabilizaria actual play por criadores — o melhor canal de aquisição disponível.

---

## 10. Métricas

### 10.1 Métrica-norte

**Ciclos consecutivos com Juramento cumprido.**

### 10.2 Denominadores

**Todas as métricas de retenção e conclusão são medidas sobre usuários ativados** — quem firmou o primeiro Juramento — e não sobre instalações.

**Ciclos em Trégua de Recuperação são excluídos** de todo denominador de constância (RN-038). Sem essa exclusão, o produto se pareceria pior justamente quando fez a coisa certa por um usuário lesionado.

### 10.3 Métricas

| Métrica | Denominador | Alvo | Referência de mercado |
|---|---|---|---|
| Instalação → ativação | instalações | > 40% | funil novo; instrumentar |
| Retenção D30 | ativados | > 15% | saúde/fitness: 3–25% sobre instalações |
| Retenção D90 | ativados | > 8% | melhores apps de fitness: 15–20% |
| Ciclos consecutivos (mediana) | ativados | ≥ 4 | — |
| **% que fecha o capítulo 1** | ativados | > 45% | teste de §4.9 contra a morte na semana 3 |
| **% que conclui os 4 capítulos** | ativados | acompanhar | teto observado 25–36% em jogos pagos; tratar como teto |
| % que reduz o Juramento em vez de abandonar | ativados | > 30% | — |
| % que usa Trégua de Recuperação | ativados | instrumentar | uso zero indica que a função não foi encontrada |
| % que exporta o Diário | ativados | > 5% | — |
| % de capítulos concluídos que geram compartilhamento | eventos | > 15% | — |
| Instalações por artefato compartilhado | artefatos | > 0,15 | — |
| Fator k | ativados | > 0,2 | — |
| % com mais de uma modalidade | ativados | > 30% | — |
| Distribuição de Marcos por ciclo | ativados | instrumentar | — |
| % de Marcos bloqueados por teto vs. cooldown vs. janela de retorno | Marcos | instrumentar | cooldown < 10% = regra inerte, remover |
| **Storylets vistos / storylets escritos** | campanha | ≈ 0,2 | régua de orçamento (§4.6) |
| **Fração de resoluções por banda** | campanha | `Arco` entre 25% e 45% | espelha T-30 em produção |

> Queda acentuada entre semana 4 e 8 é o padrão de morte de app gamificado. Se acontecer, o problema é narrativo (§1.2), não onboarding.

---

## 11. Monetização

| Modelo | Nota |
|---|---|
| Gratuito | Campanha inicial de **4 capítulos** (~12 semanas), completa e com desfecho real |
| Pacotes de campanha | **Compra única** por ambientação adicional |
| Assinatura | **Fora do MVP**, preservada como possível por D-029 |

**Financiamento:** autofinanciado no início, sustentado depois pelas vendas de pacote (D-028).

**Âncora de preço observada:** companheiros de RPG solo cobram na faixa de US$ 3–10 vitalício, sem assinatura, e há concorrente gratuito de qualidade ocupando o mesmo modelo de pacotes.

### 11.1 Duas perguntas distintas

**Pergunta 1 — o produto paga o próprio custo de operação?** Quase certamente sim, e com folga. Sem LLM em execução (D-002), offline-first (D-008), sem servidor de jogo, sem moderação, sem social (D-001). Sobram taxa de loja e distribuição do arquivo de kill-switch — ordem de algumas centenas de reais por mês. Poucas dezenas de vendas cobrem.

**Pergunta 2 — o produto paga o tempo de autoria a preço de mercado?** Quase certamente não. Compra única de R$ 15–25 é o teto realista do público; a referência de escrita de TTRPG é ~US$ 0,085/palavra.

**Conclusão assumida:** o produto **não precisa de margem de lucro no início**. A régua é a Pergunta 1.

**Custo autoral estimado (DEC-026), a partir da medição do protótipo:**

| Item | Estimativa |
|---|---|
| Storylet de `Arco` | 25–40 min |
| Storylet de `Cor` neutro | 8–12 min |
| Espinha de capítulo | 60–90 min |
| **Capítulo completo (26 itens)** | **14–20 h** |
| **Banda `Cor` global (150 itens)** | **25–35 h** |
| **Campanha de 4 capítulos** | **~80–110 h** |

A estimativa **exclui deliberadamente** revisão, retrabalho após o teste de leitura e a passada de RE-010 — historicamente 30 a 50% adicionais. Com 6 capítulos seria 110–150 h, que é o número que motivou D-041.

**Disposição a pagar** não é medida no MVP. Reabre obrigatoriamente antes de precificar qualquer pacote, e o método está fixado: **teste de cobrança real**, não pesquisa declarativa, em comunidade de RPG solo.

### 11.2 Critério de parada e desfecho aceitável

R-019 exigia definir, por escrito e de antemão, qual desfecho é aceitável — já que o autofinanciamento removeu a função de forçamento da validação. Fica registrado (DEC-051).

**O projeto é interrompido se qualquer um destes ocorrer:**

| Marco | Critério de parada |
|---|---|
| Teste de leitura (§14.1) | Duas pessoas em três não conseguem resumir a história em três frases, **após uma rodada de correção** |
| Teste do card (§14.2) | Menos de 1 em 5 do público anglófono pergunta "que app é esse?" |
| Esforço do capítulo 1 completo | Acima de 30 h |
| Retenção pós-lançamento | % que fecha o capítulo 1 abaixo de 25% sobre ativados, em 8 semanas |

**Desfecho aceitável, declarado:** um produto de nicho com algumas centenas de usuários ativos, que cobre o próprio custo de operação e que o autor continua querendo escrever, **é sucesso** — e não deve ser reavaliado contra a Pergunta 2.

---

## 12. Riscos

| ID | Risco | Severidade | Mitigação |
|---|---|---|---|
| R-001 | Padrão de seleção aparece e a fachada narrativa cai | **Crítica** | Storylets com pré-requisito e reconhecimento (D-023); orçamento 0,2; simulador (D-032); teste de leitura antes de codar. Com narrativa no binário, a correção exige release |
| R-002 | Terceiro produto em especificação simultânea, com custo próprio | **Crítica** | D-041 reduz o esforço autoral em 22%; §11.2 fixa critério de parada |
| R-003 | Auto-reporte tedioso → usuário para de registrar | Alta | Registro < 20 s; PSE opcional; escolha restrita a 2 pontos por capítulo |
| R-004 | P1 não retém e P2 não paga | Alta | Teste de cobrança real em comunidade de RPG solo |
| R-005 | Conteúdo é trabalho autoral, não engenharia | **Crítica** | D-022 reduz o custo de prosa; parceria com designer de RPG solo continua recomendada |
| R-006 | Dado sensível sem parecer jurídico | Média | Parecer antes do lançamento; RC-009 e RC-034 já adotam o caminho conservador |
| R-007 | Classificação como app de saúde nas lojas | Média | Revisar diretrizes antes do submit |
| R-008 | Marcos incentivam caça a recorde → lesão | **Crítica** | Teto, cooldown, exclusão de 1RM, paridade entre eixos, **janela de retorno (RF-048)** e **RN-036**; revisar com profissional de educação física |
| R-009 | Autoengano no auto-reporte esvazia a moeda | Média | Punição adequada é a própria descrença na história |
| R-010 | Artefato não desperta curiosidade → sem canal de aquisição | **Crítica** | Testar 5 variações com público frio antes de codar, em público anglófono (§14.2) |
| R-011 | Comparação entra pela rede social | Média | Stat fora do card por padrão |
| R-012 | Divulgação de dado de saúde gera consequência real | Média | RC-006; camadas sensíveis desligadas |
| R-013 | Multimodalidade explode complexidade | Alta | Blocos com campos adaptativos; superação auto-relativa |
| R-015 | Custo autoral inviabiliza o catálogo de §11 | Média | Sem exigência de margem, deixa de ser risco financeiro; permanece como risco de tempo, coberto por R-002 |
| R-016 | Conteúdo rascunhado por IA sem rastro de curadoria enfraquece RC-030 | Média | RC-034: registro versionado de prompts e revisões desde o primeiro storylet |
| R-017 | Grafo de pré-requisitos cresce além do gerenciável e a continuidade quebra | Alta | **Mitigação atualizada:** profundidade ≤ 3, condicionamento estreito de `Arco`, T-27 (cobertura por variante), T-28 (`mem.` com leitor futuro) e T-30. O grafo passa a ser observável por instrumento, não por disciplina |
| R-018 | Concorrente gratuito no mesmo modelo de pacotes | Alta | O diferencial é o acoplamento ao treino, não o oráculo em si |
| R-019 | Autofinanciamento remove a função de forçamento da validação | **Crítica** | **Mitigado:** §11.2 fixa critério de parada e desfecho aceitável, por escrito e antes dos testes |
| R-023 | Alcançabilidade amostrada em vez de provada | Alta | M alto; política `pessimo` e `intermitente` obrigatórias; **T-10 devolvido à prova** pela regra de pressão |
| R-024 | Cada campanha adicional é ciclo completo de release e revisão de loja | Média | Aceito por D-031 |
| R-025 | Correção de narrativa quebrada leva dias | Média | Mitigado por D-034 |
| **R-026** | **Volume de conteúdo: ~260 storylets, 40–65 mil palavras** para a campanha gratuita de 4 capítulos | **Crítica — reduzido** | D-041 cortou 22%. ~58% são vinhetas curtas de `Cor`, reutilizadas e sem trabalho de continuidade. Estimativa detalhada em §11.1; remedir ao fim do capítulo 1 |
| R-027 | Kill-switch corrói o posicionamento de privacidade | Média — **reduzido** | RF-039 e RF-039A: arquivo estático, sem identificador, sem retenção de log ou IP, com jitter, declarado em seção própria |
| R-029 | O kill-switch não alcança a `Espinha` | Média — **reduzido** | Com 4 capítulos, o buraco fica restrito a **8 itens na campanha inteira**. Revisão manual integral da espinha antes de cada release |
| R-030 | Camada tonal reduz o pool e pode esfomear a bolsa | Média | K sobre o pool efetivo com teto de 40%; camada neutra ≥ 60% garante T-17 sozinha |
| R-031 | Volume de tradução | **Adiado** | Fora do MVP por D-037. A arquitetura de D-040 garante que reabrir não exige refatoração |
| R-032 | Espanhol revisado por falante de português produz portunhol | **Adiado** | Quando reabrir: revisor nativo obrigatório para `es`, sem exceção |
| R-033 | Publicar em inglês implica GDPR | **Eliminado no MVP** | D-039 restringe ao Brasil |
| R-034 | O público-alvo real fica fora de alcance no MVP | Alta | Consequência aceita de D-037. **Mitigado metodologicamente:** o teste do card roda em público anglófono (§14.2), separando qualidade do artefato de tamanho do público |
| **R-035** | **A banda `Arco` sufoca a banda `Cor`** por condicionamento largo, e 150 vinhetas escritas nunca aparecem — sem erro e sem teste vermelho | Alta | Regra de autoria de condicionamento estreito e T-30, medidos já no capítulo 1 |
| **R-036** | **Trégua de Recuperação usada como pausa indefinida** sem lesão, esvaziando a métrica-norte | Baixa | Aceito. Um app solo não tem como nem por que auditar isso, e o custo de suspeitar do usuário é maior que o de ser ocasionalmente usado como pausa livre |

**Eliminados por perda de objeto:** R-014 (obrigação perante apoiadores, resolvida por D-028), R-020 a R-022 (sem objeto após D-031), R-028 (realizado e absorvido por R-031).

---

## 13. Estado das questões

**Não há questões abertas.** Todas as que constavam do v0.13 foram fechadas e registradas em `decisoes.md`:

| Questão | Fechamento | Decisão |
|---|---|---|
| QA-010 — disposição a pagar | Diferida com método e gatilho fixados (§11.1) | DEC-025 |
| QA-019 — custo autoral | Respondida com a medição do protótipo (§11.1) | DEC-026 |
| QA-022 — termos do provedor de IA | Convertida em política operacional (RC-034) | DEC-023 |
| QA-028 — MEs remanescentes da ESPEC | Dissolvida: ME-011, 012, 014 e 015 fechadas | DEC-017 a DEC-020 |
| QA-031 — kill-switch e LGPD | Caminho conservador adotado (RF-039A, RC-009) | DEC-024 |
| QA-032 — número de capítulos gratuitos | **4 capítulos** (D-041) | DEC-021 |
| QA-035 — onde testar o card | Público anglófono (§14.2) | DEC-022 |

Itens que dependem de terceiros — parecer jurídico e revisão por profissional de educação física — deixam de ser questões de especificação e passam a ser **itens da lista de verificação de release**. A especificação assume a posição conservadora em cada um deles, de modo que um parecer mais permissivo não obriga a desfazer nada.

---

## 14. Próximos passos

1. **Escrever a espinha do capítulo 1 completo e prototipar em papel.** Gerar 20 resoluções em sequência, entregar a **outra pessoa** para ler como texto corrido e pedir que **resuma a história**. Bloqueante. Critério de parada em §11.2. *(O PROTÓTIPO v0.2 já entrega o instrumento; falta rodar o teste.)*
2. **Prototipar 5 variações do artefato de compartilhamento** e mostrar a público frio **anglófono** de RPG solo. Se menos de 1 em 5 perguntar "que app é esse?", o canal de aquisição não existe. Bloqueante. Registrado antes do teste, conforme R-034: a taxa brasileira é observada, mas não é critério de decisão sobre o artefato.
3. **Medir o esforço real do capítulo 1 completo** e confrontar com §11.1. Acima de 30 h, §11.2 se aplica; abaixo de 15 h, D-041 pode ser reaberta para 5 capítulos.
4. **Implementar o subsistema conforme a ESPEC vigente**, com o simulador e **as duas suítes desde o primeiro dia**, incluindo as fixtures de teste negativo. Sem portão de publicação, as suítes são a única defesa antes da produção — e a produção é cara de corrigir.
5. **Glossário e cenários BDD**, a partir deste documento e da ESPEC.
6. **Itens de lista de verificação, não bloqueantes:** parecer jurídico sobre RC-009 e RC-034; revisão de RE-006, RF-048 e §4.8 por profissional de educação física; estimativa de custo recorrente de operação.

---

*Documento vivo. Alterações exigem entrada correspondente em `decisoes.md`.*
