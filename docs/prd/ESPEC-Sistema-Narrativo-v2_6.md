# ESPEC — Sistema Narrativo FORJA

**Especificação do subsistema de storylets — campanha codificada**

| Campo | Valor |
|---|---|
| Versão | **v2.6** (substitui v2.5) |
| Documento pai | PRD FORJA v0.14 |
| Registro de decisões | `decisoes.md` — DEC-005 a DEC-020, DEC-036, DEC-037 |
| Status | **Fechada para início da especificação técnica.** Sem questões abertas |
| Data | Julho/2026 |

**Mudanças desde v2.5 — todas com origem em `decisoes.md`:**

| Mudança | Origem |
|---|---|
| A regra de reconhecimento passa de forma para **alcançabilidade** (§5). Novo T-27, cobertura por variante | DEC-010 |
| Trégua e reencontro passam a ser **invariantes de motor** (M-01, M-02), não predicados de autoria. T-13 aposentado | DEC-011 |
| Campo `Desativavel` **removido**; elegibilidade à desativação é derivada da banda (M-03). T-20 aposentado | DEC-012 |
| Prefixo `mem.` oficializado; novo T-28 | DEC-013 |
| **Espinha de desfecho não lê complicação** (T-29); rede de segurança devolve `st_cor_fallback` (M-04) | DEC-014 |
| `cap.resolucoes` e `cap.estagio` definidos; `sys.resolucoes` proibido em `requer` (T-33) | DEC-015 |
| Ponto de escolha intermediário especificado (M-07) | DEC-016 |
| **Regra de pressão** (M-06): solubilidade do capítulo passa de amostrada a estrutural | DEC-017 |
| Camada neutra de `Cor` ≥ 60% (T-18) | DEC-018 |
| Nomes próprios invariantes entre idiomas | DEC-020 |
| Orçamento recalculado para **4 capítulos**, ~260 storylets | DEC-021 |
| Banda `Arco` exige condicionamento estreito; novo T-30 | DEC-036 |
| Fixtures de teste negativo substituem defeitos deliberados no catálogo | DEC-037 |
| §3 renumerada de forma contígua | DEC-005 |

---

## 1. Escopo

Este documento especifica **como a narrativa funciona**, não como ela é distribuída. Com o rollback de D-027, o sistema narrativo é um subsistema interno do aplicativo, não uma biblioteca com fronteira contratual.

**O que sobreviveu do v1.0 e por quê:** o modelo de storylet, as bandas de seleção, o algoritmo de sorteio, o determinismo e a regra de reconhecimento são decisões de *desenho de sistema narrativo*. Elas valem igualmente se o conteúdo é dado remoto ou classe compilada. Descartá-las junto com o motor seria jogar fora a parte que resolve R-001.

**O que morreu:** formato de pacote, manifesto, migração de estado entre versões, assinatura criptográfica, validação estática como portão de publicação e a API pura de biblioteca.

**Duas suítes, não uma.** A partir desta versão a verificação está separada em:

| Suíte | Objeto | Notação |
|---|---|---|
| **Catálogo** | propriedades do conteúdo escrito | `T-nn` |
| **Motor** | invariantes do seletor, independentes de catálogo | `M-nn` |

A separação não é organizacional. Vários defeitos da v2.5 existiam porque garantias que só o motor pode dar estavam escritas como obrigações de autoria, a serem repetidas corretamente em algumas centenas de arquivos.

---

## 2. Modelo de estado — qualidades

O estado do mundo é um **dicionário de qualidades**: nome → valor.

### 2.1 Tipos

| Tipo | Domínio | Uso |
|---|---|---|
| `int` | faixa declarada | contadores, intensidade, progresso |
| `bool` | 0 ou 1 | sinalizadores |
| `enum` | conjunto declarado | estado de entidade, tom de arco |

Sem strings livres, listas ou objetos aninhados. A restrição continua valendo mesmo sem validador: ela é o que mantém o estado serializável, comparável e testável.

### 2.2 Espaço de nomes

| Prefixo | Escrito por | Semântica | Exemplo |
|---|---|---|---|
| `in.` | aplicação | entradas da resolução corrente | `in.rolagem`, `in.atributo.forca`, `in.tregua`, `in.reencontro` |
| `cap.` | sistema | estado do capítulo corrente | `cap.atual`, `cap.resolucoes`, `cap.estagio` |
| `ent.` | campanha | estado de entidade | `ent.sebastiao.estado`, `ent.sebastiao.conhecido` |
| `comp.` | campanha | complicação **do capítulo** | `comp.carga_demais` |
| `mem.` | campanha | memória **de campanha**: escrita num capítulo, lida em outro posterior | `mem.andou_sozinho` |
| `arco.` | campanha | tom e intensidade | `arco.tom`, `arco.sede` |
| `sys.` | sistema | contadores globais | `sys.visto.<storylet_id>`, `sys.resolucoes` |

`sys.visto.<id>` e `ent.X.conhecido` são mantidos automaticamente. O autor não escreve efeito para eles.

**`comp.` versus `mem.` (DEC-013).** A distinção é de horizonte, não de tipo. `comp.X` é dívida do capítulo e tem de ser fechada dentro dele (§3.5). `mem.X` é dívida da campanha e tem de ser cobrada depois — verificado por T-28. Uma qualidade `mem.` que ninguém lê num capítulo posterior é o mesmo defeito que um storylet nunca sorteado: trabalho de escrita não entregue.

**Entradas mantidas pela aplicação:**

| Qualidade | Tipo | Definição |
|---|---|---|
| `in.rolagem` | int 2..15 | resultado de `2d6 + Vontade` |
| `in.atributo.{forca,vigor,destreza}` | int 0..5 | ficha corrente |
| `in.vontade` | int 0..3 | ficha corrente |
| `in.ciclo_cumprido` | bool | o ciclo anterior foi cumprido |
| `in.tregua` | bool | o ciclo corrente é de Trégua ou de Trégua de Recuperação |
| `in.reencontro` | bool | 1 na **primeira** resolução após uma Trégua encerrada ou após 10 dias ou mais sem sessão (DEC-011) |
| `in.sessao_secundaria` | bool | é a segunda sessão registrada no mesmo dia (DEC-033) |

**Estado de capítulo mantido pelo sistema:**

| Qualidade | Tipo | Definição |
|---|---|---|
| `cap.atual` | int | capítulo corrente |
| `cap.resolucoes` | int | resoluções desde a virada de capítulo. **Zerado na virada** |
| `cap.estagio` | enum | `abertura` \| `meio` \| `pressao` \| `desfecho` |

`cap.estagio` é derivado, nunca escrito por efeito:

```
abertura   ⟺ cap.resolucoes == 0
meio       ⟺ 1 ≤ cap.resolucoes ≤ 11
pressao    ⟺ cap.resolucoes ≥ 12  e  o capítulo ainda não entrou em desfecho
desfecho   ⟺ as condições de §4.9 do PRD foram satisfeitas
```

**`sys.resolucoes` é proibido em `requer`** (T-33). É contador global e monotônico: um predicado `sys.resolucoes >= 4` no capítulo 1 vira trivialmente verdadeiro no capítulo 2, o que faz storylets de abertura reaparecerem fora de hora sem produzir nenhum erro. Autoria usa `cap.resolucoes`.

### 2.3 Nomes

Nomes de qualidade são estritamente **ASCII**, minúsculos, separados por ponto. Nenhum texto de exibição vive no nome. Todo texto exibido reside em arquivo de recurso por idioma. Isso mantém o estado independente de idioma e blindado contra formatação localizada, que colidiria com o determinismo de §6.2.

### 2.4 Serialização

O estado serializa como dicionário plano. Sem grafo de objetos, sem referências cíclicas, sem serializador customizado. Isso importa mais agora, não menos: sem migração declarada, a compatibilidade entre versões do app depende de o estado ser trivialmente legível.

**Qualidades órfãs.** O leitor de estado ignora silenciosamente qualidades presentes no save e ausentes na versão corrente do catálogo, sem lançar exceção. Mudanças no dicionário entre releases devem ser aditivas. Save de usuário ativo nunca é invalidado por atualização do aplicativo.

---

## 3. Storylet

```
Storylet {
  Id         : string    // único, imutável entre releases
  Capitulo   : int?      // null = transversal
  Banda      : Banda     // Espinha | Arco | Cor
  Subclasse  : string?   // apenas em Cor: "ausencia" | "fallback" | null
  Peso       : int       // padrão 1
  Entidades  : string[]  // referências declaradas
  Requer     : Predicado
  Efeitos    : Efeito[]
  Textos     : Variante[]
  Escolhas   : Escolha[]?
}
```

O campo `Desativavel` da v2.5 **não existe mais** (DEC-012). A elegibilidade à desativação é função da banda e é aplicada pelo kill-switch (§6.3, M-03).

### 3.1 Bandas

| Banda | Papel | Reposição |
|---|---|---|
| `Espinha` | abertura e desfecho escritos do capítulo | nunca reposta |
| `Arco` | vinhetas que movem a complicação estruturante | bolsa por capítulo |
| `Cor` | ambientação sem efeito estrutural | bolsa global, reposta ao esgotar |

A estratificação garante que o enredo escrito sempre vença o procedural. É a implementação de D-017.

**"Sem efeito estrutural" tem definição exata (T-34):** storylet de `Cor` pode escrever `arco.*` — tom e intensidade são ambientação — e **não pode** escrever `comp.*`, `ent.*` nem `mem.*`. Sem essa fronteira, uma vinheta global sorteada em qualquer capítulo poderia abrir complicação, mover entidade ou criar dívida de campanha, e a banda deixaria de amortizar: cada item precisaria ser reescrito por capítulo.

#### Orçamento por banda (DEC-021)

Com ~12 resoluções por capítulo, 4 capítulos (D-041) e razão vistos/escritos-alvo de 0,2:

| Banda | Escopo | Escritos | Resoluções esperadas | Razão |
|---|---|---|---|---|
| `Espinha` | por capítulo | 2 × 4 = **8** | 2 por capítulo = 8 | 1,0 |
| `Arco` | por capítulo | ~24 × 4 = **96** | ~4 por capítulo = 16 | 0,17 |
| `Cor` neutra | global | **~90** | — | — |
| `Cor` tonal | global | **~60** | — | — |
| `Cor` total | global | **~150** | ~6 por capítulo = 24 | 0,16 |
| **Total** | | **~254** | **~48** | **0,19** |

Ordem de grandeza: **~260 storylets, 40–65 mil palavras.** Ver R-026 do PRD.

`Espinha` tem razão 1,0 por construção — todo item é lido em toda travessia. É por isso que os 8 itens da espinha justificam revisão manual integral antes de cada release (R-029).

#### Condicionamento estreito da banda `Arco` (DEC-036)

A estratificação faz `Arco` descartar `Cor` sempre que houver **qualquer** `Arco` elegível. Um storylet de `Arco` largamente elegível não produz erro, não reprova em teste algum da v2.5, e simplesmente impede que 150 vinhetas de `Cor` — 58% do orçamento de escrita — apareçam.

**Regra de autoria:** todo storylet de `Arco` declara predicado sobre estado de entidade, complicação aberta ou resultado de rolagem. Predicado apenas sobre `cap.resolucoes` é insuficiente e reprova em revisão.

**Verificação:** T-30. Fora da faixa de 25% a 45% de resoluções na banda `Arco`, o defeito é de condicionamento, não de peso — mexer em `Peso` mascara o sintoma.

#### Camadas da banda `Cor` (DEC-018)

Condicionar toda a banda `Cor` por `arco.tom` multiplicaria o orçamento pelo número de tons. A banda é dividida em duas camadas:

| Camada | Predicado de tom | Proporção | Papel |
|---|---|---|---|
| `Cor` neutra | nenhum — elegível sempre | **≥ 60%** (~90) | ambientação que funciona em qualquer momento da campanha |
| `Cor` tonal | declara 1 ou 2 tons compatíveis | ≤ 40% (~60) | cor específica do momento; é o que faz o capítulo 4 soar diferente do 1 |

**A proporção é restrição, não alvo.** Com neutra ≥ 60%, a camada neutra sozinha satisfaz T-17 em qualquer tom, o que torna a banda robusta a mudanças no domínio de `arco.tom` sem recálculo.

**Teto do domínio de `arco.tom`: 4 valores.** Cada valor adicional é multiplicador de conteúdo na camada tonal. Decisão de orçamento, não limitação técnica.

**Duas subclasses obrigatórias de `Cor`:**

| Subclasse | Mínimo | Papel |
|---|---|---|
| `ausencia` | ≥ 6 itens, todos na camada neutra | vinhetas de Trégua e de reencontro (§3.4) |
| `fallback` | exatamente 1 (`st_cor_fallback`) | rede de segurança de §6.1; sem predicado, sem efeito |

#### Fila de exclusão na reposição

Ao esgotar a bolsa, os últimos `K` storylets vistos são excluídos do novo sorteio e reinseridos apenas na reposição seguinte.

`K` é proporcional ao ritmo de jogo, não ao tamanho da banda — o usuário percebe repetição por distância em semanas jogadas, não por fração de catálogo:

```
K_alvo  = 3 × resolucoes_cor_por_capitulo        (~18 com 6 resoluções de Cor por capítulo)
K_teto  = floor(0,4 × |pool elegível efetivo|)
K       = min(K_alvo, K_teto)
```

`K` é sempre calculado sobre o **pool elegível no momento da reposição**, jamais sobre o total da banda. A camada tonal reduz o pool elegível a qualquer instante; uma fila dimensionada para a banda inteira excluiria fração grande demais do que resta e tornaria o sorteio quase determinístico.

### 3.2 Variantes de texto

Lista ordenada. Avaliação: primeira variante cujo `Quando` é satisfeito. A última, sem `Quando`, é o fallback obrigatório.

**A variante não contém prosa.** Ela contém uma **referência de texto** e a lista de parâmetros que o texto consome:

```json
{ "quando": { "todos": [ { "q": "ent.sebastiao.conhecido", "eq": 0 } ] },
  "texto": "c1.sebastiao.primeiro",
  "parametros": ["ent.sebastiao"] }
```

A prosa vive em arquivos de recurso por idioma, fora do catálogo:

```
recursos/pt-BR/cap1.json      ← preenchido no MVP
recursos/en/cap1.json         ← estrutura pronta, vazio
recursos/es/cap1.json         ← estrutura pronta, vazio
```

**No MVP existe um único idioma preenchido.** A estrutura entra agora porque retrofitar referência de texto depois exigiria uma passada por todo o catálogo já escrito — mesma lógica de D-029 quanto à mensalidade: um campo hoje evita uma migração amanhã.

**Por que assim.** Prosa dentro do storylet faria o subsistema tocar locale, o que colide com o determinismo de §6.2 e tornaria o simulador dependente de idioma. Com referência, o subsistema permanece puro e agnóstico, a tradução vira problema exclusivamente de recursos, e a suíte roda uma vez para todos os idiomas.

**Cobertura por variante (DEC-010).** Variante é unidade de escrita e passa a ser unidade de medida: T-27 exige que toda variante declarada seja exercida ao menos uma vez em simulação ampla. O relatório de "nunca sorteados" da v2.5 operava por storylet e por isso não enxergava prosa morta dentro de storylet vivo — que foi exatamente o defeito encontrado no protótipo v0.1.

### 3.3 Escolhas

Presentes no storylet de desfecho e no ponto de escolha intermediário (D-025). Efeitos do storylet aplicam sempre; efeitos da escolha, só na escolha tomada. Irreversível — não há desfazer.

**Frequência:** **2 pontos de escolha por capítulo** — um intermediário e o Marco de capítulo.

**Disparo do ponto intermediário (DEC-016).** Dispara na primeira resolução em que:

```
cap.resolucoes ≥ 6   e   |elegíveis de Arco| ≥ 2
```

Uma única vez por capítulo. Com menos de 2 elegíveis, a resolução degrada silenciosamente para seleção automática e o ponto permanece armado para a resolução seguinte. Invariante M-07.

Ponto de escolha ancorado em índice fixo cai sobre qualquer estado, inclusive um em que só exista uma opção — e apresentar uma "escolha" com uma alternativa é pior do que não apresentar nenhuma.

### 3.4 Reconhecimento de ausência (DEC-011)

Implementa RN-031 do PRD: o mundo nota a ausência; a história não anda sem o usuário.

**Duas situações distintas, dois tratamentos distintos:**

| Situação | Entrada | Comportamento |
|---|---|---|
| Ciclo de Trégua (comum ou de Recuperação) | `in.tregua == 1` | Apenas a banda `Cor` é consultada. `Espinha` e `Arco` são **suprimidas antes da filtragem** (M-01) |
| Primeira resolução após Trégua encerrada, ou após ≥ 10 dias sem sessão | `in.reencontro == 1` | A seleção é forçada à subclasse `ausencia` de `Cor` (M-02). **Uma resolução apenas** |

**Isto é regra de motor, não de autoria.** Na v2.5 a garantia dependia de todo storylet de `Arco` declarar uma guarda contra Trégua; nenhum declarava, e como `Arco` descarta `Cor`, a vinheta de Trégua nunca era sorteada. A regra existia, o comportamento não.

**O que foi deliberadamente rejeitado:** suprimir `Arco` sempre que o ciclo anterior tivesse sido quebrado. Isso colide com D-007 e RN-001 — o usuário que quebrou um ciclo e voltou a treinar está registrando sessão real e receberia apenas ambientação, o que é punir o comportamento desejado sob o disfarce de reconhecer a ausência. A ausência merece **uma** vinheta de reencontro, não um ciclo de castigo narrativo.

**Proibido ajustar a banda `Arco` por constância.** Progressão de campanha é função exclusiva de dias treinados sobre dias jurados (RN-001).

### 3.5 Fechamento de complicação

**Regra.** Toda complicação aberta por qualquer efeito tem **ao menos dois storylets de fechamento** distintos.

**Trava de solubilidade.** Ao menos um dos caminhos é **incondicionado por atributo**: elegível sempre que a complicação estiver aberta, independentemente de Força, Vigor ou Destreza. Sem isso, um jogador especialista pode ficar com complicação aberta e nenhum caminho elegível — capítulo emperrado por construção de personagem.

| Caminho | Condição | Papel |
|---|---|---|
| Base | apenas `comp.X == 1` | garante solubilidade para qualquer ficha |
| Gatilhado | `comp.X == 1` + atributo ≥ limiar | desfecho diferente ou melhor; é o que dá função concreta aos atributos |

**Por que isso importa além da corrigibilidade.** "Atributos abrem opções de resolução" era afirmação sem mecanismo. Os caminhos gatilhados **são** essas opções: resolver pela força, pela persistência ou pela precisão. O sistema de atributos deixa de ser decorativo e passa a ter consequência narrativa observável.

**A espinha de desfecho não lê complicação (DEC-014).** Nenhum storylet de `Espinha` de desfecho tem predicado sobre `comp.*` (T-29). O desfecho:

1. é elegível sempre que `cap.estagio == desfecho`;
2. **fecha, como efeito, todas as complicações abertas do capítulo**;
3. tem variante para o caso de a complicação estruturante chegar aberta — o texto reconhece que ficou por resolver.

**O defeito que isso corrige.** O Marco de capítulo tem duas fontes de disparo independentes: a espinha narrativa e o teto de 4 ciclos de §4.9 do PRD. Qualquer predicado do desfecho sobre estado de mundo cria a possibilidade de as duas discordarem — e a política `pessimo` chega ao teto com a complicação aberta, tornando o desfecho inelegível e travando o capítulo. A regra "espinha não lê complicação" mantém as duas fontes reconciliadas por construção.

**Custo.** ~14 complicações na campanha de 4 capítulos (4 estruturantes + as abertas por rolagem 7–9) × 1 fechamento extra ≈ **14 storylets adicionais na banda `Arco`**, já incluídos no orçamento de §3.1.

### 3.6 Gênero, concordância e nomes próprios

Português e espanhol exigem concordância de artigo e adjetivo com o substantivo referido; inglês não. Substituir nome de entidade em frase sem tratar isso produz erro gramatical sistemático em dois dos três idiomas.

**Entidade declara gênero por idioma**, ainda que só pt-BR seja preenchido no MVP:

```json
{ "id": "sebastiao",
  "genero": { "pt-BR": "m", "es": "m", "en": "n" },
  "nome": "ent.sebastiao.nome",
  "nome_traduzivel": false }
```

**Nomes próprios são invariantes entre idiomas (DEC-020).** A chave de recurso permanece — a estrutura não muda —, mas todos os idiomas carregam a mesma cadeia. `nome_traduzivel: true` é a exceção explícita, para quando o "nome" é substantivo comum ou título descritivo (*o Andarilho*, *a Lapa do Meio*).

O motivo é D-020: a semente compartilhada opera por reconhecimento mútuo, duas pessoas comparando o que aconteceu no mesmo mundo. Sebastião chamar-se outra coisa em espanhol destrói a conversa que é o produto do compartilhamento.

**Resolução.** A camada de apresentação recebe a referência de texto e os parâmetros, consulta o gênero declarado do parâmetro no idioma corrente e seleciona a forma correta de artigo e concordância no recurso. Nada disso ocorre dentro do subsistema narrativo.

**Contração de preposição com artigo.** Não há maquinaria. Vale a convenção de redação de RE-011 do PRD: nenhum texto constrói frase em que o nome de entidade seja precedido de preposição que exija contração. Custo zero hoje; a maquinaria será projetada contra dois idiomas reais quando houver um segundo.

**Números e plurais.** Formatação de número, plural e data acontece exclusivamente na apresentação. O subsistema emite valores crus como parâmetro. §6.2 proíbe formatação dependente de locale dentro do subsistema.

### 3.7 Formato do catálogo

Arquivos **JSON** embutidos nos assets do aplicativo (D-036), não classes de código e não YAML. JSON foi escolhido sobre YAML porque a ambiguidade de parsing do YAML conflita com o requisito de determinismo de §6.2. O catálogo permanece desacoplado da lógica de execução, o que viabiliza o simulador sem instanciar o app.

```
catalogo/
  qualidades.json
  entidades.json
  cap1.json  cap2.json  cap3.json  cap4.json
  cor.json                       ← banda global
recursos/
  pt-BR/  en/  es/
testes/
  fixtures/negativos/            ← §7.3
```

---

## 4. Predicados e efeitos

**Alerta de desenho.** Com storylets codificados, a tentação é usar lambdas arbitrárias como pré-requisito. Isso é mais expressivo e é um erro: a pergunta "este storylet é alcançável?" não desaparece com o rollback — apenas perde o validador que a respondia. A forma restrita é o que permite os testes de §7 e o que torna decidível a classificação estática de §5.

```
Predicado ::= Todos(Predicado[]) | Qualquer(Predicado[]) | Nenhum(Predicado[])
            | Atomo(qualidade, op, valor)
Op        ::= Eq | Ne | Gte | Lte | Gt | Lt

Efeito    ::= Definir(qualidade, valor) | Somar(qualidade, inteiro)
```

Profundidade máxima de aninhamento: **3**. `Somar` satura no domínio declarado. Efeito sobre `in.`, `sys.` ou `cap.` é proibido — verificado por T-02.

Sem aritmética, sem referência indireta, sem chamada de função, sem condicional em efeito.

---

## 5. Reconhecimento e continuidade

Requisito RF-023 do PRD, e a defesa central contra R-001.

**Regra (DEC-010).** Todo storylet que declare a entidade X tem variante para cada classe de `ent.X.conhecido` **alcançável nos seus próprios pontos de elegibilidade**.

Como os predicados são de forma restrita (§4), a classificação é decidível estaticamente:

| Classe | Condição estática sobre `Requer` | Variantes exigidas |
|---|---|---|
| **Primeiro contato** | implica `ent.X.estado == <valor inicial>` ou `ent.X.conhecido == 0` | 1 |
| **Retorno** | implica `ent.X.estado != <valor inicial>` ou `ent.X.conhecido >= 1` | 1 |
| **Ambivalente** | nenhuma das duas | 2 — uma para cada classe |

**Referência explícita.** Entidades são declaradas no campo `Entidades`, nunca inferidas do texto. Mantém a checagem trivial.

**Por que a regra da v2.5 estava errada.** Ela exigia duas variantes de todo storylet com entidade, e produzia dois defeitos opostos no mesmo catálogo. Storylets travados atrás de um estado já avançado (`estado == ouvido`) só são elegíveis com a entidade conhecida, e a segunda variante era exigência sem objeto. Storylets de disparo único no estado inicial só são elegíveis com `conhecido == 0`, e a segunda variante era **prosa inalcançável** — escrita, revisada, traduzida e nunca lida.

**O reconhecimento é propriedade do catálogo, não do item.** Quem entrega o reconhecimento de uma entidade não é uma segunda variante do primeiro encontro; são os storylets de retorno que só existem porque o encontro aconteceu, e as variantes de outros storylets que consultam `mem.` e `ent.X.conhecido`. A regra nova mede a coisa certa; T-27 e T-28 medem se ela foi cumprida na prática.

**Verificação.** T-07 (estática) e T-27 (por simulação), ambas em CI.

---

## 6. Seleção e determinismo

### 6.1 Algoritmo

```
1.  SUPRESSÃO POR ENTRADA
    se in.reencontro == 1     → pool := Cor[subclasse = ausencia];  ir para 5
    se in.tregua == 1         → bandas := { Cor }
    se in.sessao_secundaria==1 → bandas := { Cor }
    senão                     → bandas := { Espinha, Arco, Cor }

2.  FILTRAGEM
    remover storylets desativados pelo kill-switch (§6.3)
    filtrar catálogo do capítulo corrente + transversais pelos Requer satisfeitos

3.  PRESSÃO
    se cap.estagio == pressao → pool de Arco := { s ∈ Arco : s fecha alguma comp. aberta }

4.  ESTRATIFICAÇÃO
    Espinha > Arco > Cor.  Banda superior com elegíveis descarta as inferiores.

5.  SORTEIO
    sem reposição, da bolsa da banda vencedora, com RNG semeado.  Sorteado sai da bolsa.

6.  REPOSIÇÃO
    Cor ao esgotar (com fila de exclusão K)  ·  Arco ao virar capítulo  ·  Espinha nunca

7.  PONTO DE ESCOLHA
    se o ponto intermediário está armado e |elegíveis de Arco| ≥ 2 → devolver 2–3

8.  REDE DE SEGURANÇA
    pool vazio em todas as bandas → devolver st_cor_fallback
```

`Peso` é multiplicidade de cópias na bolsa, não probabilidade contínua. Mantém o sorteio discreto e auditável.

**Etapa 3 — a regra de pressão (DEC-017).** A partir de `cap.resolucoes >= 12`, o pool de `Arco` é restrito aos storylets que fecham alguma complicação aberta. Como §3.5 garante que toda complicação tem um caminho de fechamento sem condição de atributo, existe sempre ao menos um elegível.

Isso troca uma garantia estatística por uma estrutural. Na v2.5, T-10 ("todo capítulo alcança seu desfecho em ≤ K resoluções em toda política") era amostrado por simulação, e ME-011 perguntava se `K` precisaria variar por política porque a camada tonal podia esfomear o pool. A pergunta estava mal posta: o capítulo não se arrasta porque o sorteio azarou, se arrasta porque nada obriga o fechamento. Com M-06, `K` é único (20) e T-10 passa a ser consequência de um invariante de motor. Para esta propriedade específica, recupera-se a força de prova que o rollback de D-031 havia custado.

**Etapa 8 — a rede de segurança devolve `st_cor_fallback`, nunca o desfecho.** Devolver o desfecho contornaria as três condições de §4.9 do PRD e, em particular, o consumo de Fôlego exigido por RN-007. O furo existia desde a v1.0 e passava despercebido porque a rede quase nunca dispara.

### 6.2 Determinismo

Continua sendo requisito, por três motivos que o rollback não elimina: a semente compartilhada de D-020, a simulação de §7 e a reprodução de bug reportado por usuário — que agora importa **mais**, porque a correção depende de release.

- **Semente de campanha:** inteiro de 64 bits. É o que o convite de D-020 transporta.
- **RNG:** gerador determinístico especificado e congelado (PCG-32 ou xoshiro). Nunca o RNG da plataforma.
- **Derivação:** `semente_resolucao = hash(semente_campanha, indice_resolucao, id_bolsa)`. Reordenar ou reexecutar não desloca o fluxo.
- **Proibido no subsistema:** relógio, fuso, locale, ordenação cultural, iteração sobre dicionário sem ordem definida, ponto flutuante em decisão. Ordenação sempre por `Id` ordinal.

**O que a semente determina:** o mundo — quais storylets existem e em que ordem saem da bolsa. **O que não determina:** a história, que depende de rolagens, atributos e escolhas. Duas pessoas com a mesma semente atravessam o mesmo mundo com histórias divergentes, que é o efeito pretendido por D-020.

### 6.3 Kill-switch de storylet

Mitigação parcial de R-001 após D-031, especificada em D-034 do PRD.

**Mecânica.** Na inicialização, buscar arquivo estático:

```json
{ "versao": 3, "desativados": ["st_c2_012", "st_c4_007"] }
```

- Timeout agressivo de **1,5 s**. Falha ou ausência de rede: usar o último cache.
- Sem cache: lista vazia. **Nunca bloqueia a abertura do app.**
- No máximo uma busca a cada 24 h, com jitter aleatório de até 6 h (RF-039A do PRD).
- Storylet desativado é excluído da filtragem (etapa 2 de §6.1). Não altera estado já gravado, não remove entradas do Diário, não invalida campanha em andamento.

**Restrição de desativação (DEC-012).** A elegibilidade à desativação é **derivada da banda**, não declarada por storylet:

| Banda | Desativável |
|---|---|
| `Espinha` | **não**, sem exceção |
| `Arco` | sim — §3.5 garante que nenhum é caminho único |
| `Cor` | sim, exceto `st_cor_fallback` |

O motor **ignora** qualquer id de `Espinha` ou de `fallback` presente na lista, mesmo que o controlador o publique por engano (M-03). Campo cujo valor é sempre derivável de outro campo é campo que um dia diverge dele; e como invariante de motor, a garantia não depende de ~260 declarações corretas.

**O buraco que isso deixa, declarado.** `Espinha` é indesativável, e é exatamente onde um texto quebrado, incoerente ou ofensivo teria o pior efeito: abertura e desfecho de capítulo. Não há remédio barato — desativar uma abertura quebra o capítulo. A compensação é que a `Espinha` da campanha inteira são **8 itens**, o que torna revisão manual integral antes de cada release trivialmente pagável. Ver R-029 do PRD.

**Restrições de privacidade — não negociáveis.** É o primeiro ponto de rede de um aplicativo que se posiciona como integralmente offline.

- Arquivo estático, sem parâmetro de consulta.
- Sem identificador de usuário, de dispositivo ou de instalação.
- Sem telemetria, sem log de acesso vinculável, sem cabeçalho customizado.
- CDN contratada com retenção de log desabilitada e sem retenção de IP.
- Busca com jitter, para que o padrão temporal de acesso não seja em si um sinal.
- Declarado em seção própria da política de privacidade.

Se essas condições não puderem ser cumpridas, o kill-switch não compensa — ele corroeria RC-003 do PRD, que é parte do posicionamento do produto.

**Limite.** O kill-switch **desativa**, não substitui. Corrigir o texto de um storylet continua exigindo release.

---

## 7. Simulador e testes

Esta seção substitui a validação estática do v1.0. Sem portão de publicação, a garantia migra para as suítes — e o simulador passa a ser a peça mais valiosa do subsistema, não um acessório.

### 7.1 Simulador

```
Simular(semente, n, politica) → Resolucao[]
```

| Política | Comportamento |
|---|---|
| `constante` | Juramento sempre cumprido, rolagens medianas, atributos crescendo devagar |
| `erratico` | Juramento cumprido em ~60% dos ciclos, rolagens uniformes |
| `especialista` | Um atributo cresce, os outros estagnam |
| `pessimo` | Rolagens no piso, atributos parados |
| `intermitente` *(nova)* | Trégua a cada 3 ciclos e um intervalo de 14 dias sem sessão por capítulo — exercita `in.tregua` e `in.reencontro` |

A quinta política existe porque, sem ela, M-01, M-02 e a subclasse `ausencia` nunca são exercitados por nenhuma travessia simulada — que é a razão pela qual o defeito de T-13 sobreviveu à v2.5 inteira.

**Volume de sementes.** `M` é parâmetro, não constante:

| Execução | M por política | Objetivo |
|---|---|---|
| Por commit | 50 | manter a suíte rápida o suficiente para ninguém desativar |
| Noturna | 1000 | relevância estatística para T-09 a T-11, T-27 e T-30 |
| Antes de release | 1000 + sementes conhecidas por regressão | portão final |

M=1000 em toda execução é otimista: 5 políticas × 1000 sementes × ~48 resoluções × filtragem de ~260 storylets é da ordem de 10⁸ avaliações de predicado. Suíte lenta acaba desligada, e aí a garantia vale zero.

**Saídas:** texto corrido das N resoluções para leitura humana; razão vistos/escritos; histograma por storylet e **por variante**; **storylets e variantes nunca vistos em nenhuma política**; distribuição de resoluções por banda e por capítulo; comprimento até o desfecho por capítulo e política.

Storylet ou variante escrito e nunca sorteado é trabalho de escrita não entregue.

### 7.2 Suíte de catálogo

Executada em CI sobre o catálogo real.

| # | Teste | Método |
|---|---|---|
| T-01 | Todo `Id` é único | estático |
| T-02 | Nenhum efeito escreve `in.`, `sys.` ou `cap.` | estático |
| T-03 | Todo valor comparado pertence ao domínio da qualidade | estático |
| T-04 | Profundidade de predicado ≤ 3 | estático |
| T-05 | Todo storylet tem variante de fallback sem `Quando` | estático |
| T-06 | Toda entidade referenciada existe e tem estado inicial | estático |
| T-07 | **Regra de reconhecimento de §5 satisfeita** por classificação estática | estático |
| T-08 | Toda qualidade lida é escrita por algum efeito, ou é `in.`/`sys.`/`cap.` | estático |
| T-09 | **Todo storylet é visto ao menos uma vez** em simulação ampla | simulação |
| T-10 | **Todo capítulo alcança seu desfecho** em ≤ 20 resoluções, em toda política | simulação |
| T-11 | **Toda complicação aberta é fechada** em toda travessia | simulação |
| T-12 | Razão vistos/escritos entre 0,15 e 0,3 | simulação |
| T-14 | Nenhum nome de qualidade contém caractere fora de ASCII | estático |
| T-16 | Estado com qualidade órfã carrega sem exceção | unitário |
| T-17 | Em toda combinação alcançável de capítulo e `arco.tom`, o pool elegível de `Cor` é ≥ 2,5 × K | estático |
| T-18 | Camada neutra de `Cor` ≥ **60%** do total da banda | estático |
| T-19 | `arco.tom` tem no máximo 4 valores no domínio declarado | estático |
| T-21 | Toda complicação tem ≥ 2 storylets de fechamento, dos quais ≥ 1 sem condição de atributo | estático |
| T-22 | Na política `especialista`, toda complicação aberta é fechada | simulação |
| T-23 | Toda referência de texto existe em todo idioma **ativo**. No MVP, só pt-BR — o teste cresce sozinho ao ativar um idioma | estático |
| T-24 | Nenhum arquivo de recurso contém chave órfã | estático |
| T-25 | Todo parâmetro consumido por um texto está declarado na variante, e toda entidade usada como parâmetro declara gênero em todo idioma ativo | estático |
| T-26 | Nenhum storylet contém prosa embutida; todo texto é referência | estático |
| **T-27** | **Toda variante declarada é exercida ao menos uma vez** em simulação ampla | simulação |
| **T-28** | Toda qualidade `mem.` escrita no capítulo N é lida por algum storylet de capítulo > N | estático |
| **T-29** | Nenhum **`Requer`** de storylet de `Espinha` de desfecho referencia `comp.*`. A restrição não alcança `Quando` de variante — é justamente ali que o desfecho reconhece a complicação deixada em aberto | estático |
| **T-30** | A fração de resoluções da banda `Arco` por capítulo fica entre 25% e 45% em toda política | simulação |
| **T-31** | Existe ≥ 1 storylet de `Cor` da subclasse `ausencia` elegível em todo estado alcançável com `in.tregua == 1` ou `in.reencontro == 1` | estático |
| **T-32** | A complicação estruturante é fechada por storylet de fechamento — e não pelo desfecho — em ≥ 90% das travessias nas políticas `constante` e `erratico` | simulação |
| **T-33** | Nenhum `Requer` de storylet com `Capitulo != null` referencia `sys.resolucoes` | estático |
| **T-34** | Nenhum storylet de `Cor` escreve `comp.`, `ent.` ou `mem.` | estático |

**Aposentados nesta versão:** T-13 (vira M-01), T-15 e T-20 (viram M-03).

> **Nota honesta sobre a amostragem.** No v1.0, T-09 a T-11 eram *provadas* por propagação de restrições sobre domínios finitos; na v2.5 passaram a ser *amostradas*. A regra de pressão (M-06) devolve T-10 ao território da prova, mas T-09, T-11, T-27, T-30 e T-32 continuam amostrados: simulação com M sementes não prova ausência de storylet inalcançável, só não encontra nenhum. O custo do rollback aparece aqui, e a mitigação é M alto — a simulação é barata.

### 7.3 Suíte de motor

Executada sobre catálogos sintéticos, independentes do conteúdo real.

| # | Invariante |
|---|---|
| **M-01** | Com `in.tregua == 1`, nenhuma banda além de `Cor` é consultada |
| **M-02** | Com `in.reencontro == 1`, a resolução vem da subclasse `ausencia` de `Cor` |
| **M-03** | O kill-switch nunca desativa storylet de `Espinha` nem `st_cor_fallback`, mesmo que a lista os contenha |
| **M-04** | A rede de segurança devolve `st_cor_fallback`, nunca o desfecho |
| **M-05** | Mesma semente, mesmas entradas e mesma versão → sequência idêntica em duas plataformas |
| **M-06** | Com `cap.estagio == pressao`, o pool de `Arco` contém apenas storylets de fechamento |
| **M-07** | O ponto de escolha devolve 2–3 opções; com menos de 2 elegíveis, degrada para automático e permanece armado |
| **M-08** | Com `in.sessao_secundaria == 1`, nenhuma banda além de `Cor` é consultada |
| **M-09** | A fila de exclusão `K` é calculada sobre o pool elegível efetivo, nunca sobre o total da banda |

### 7.4 Fixtures de teste negativo (DEC-037)

Cada teste de catálogo tem uma fixture mínima em `testes/fixtures/negativos/` que o viola **e apenas ele**, e a suíte verifica que o teste correspondente reprova. Um teste que nunca reprovou é um teste em que não se pode confiar.

Isto substitui a prática do protótipo v0.1 de deixar defeitos deliberados no catálogo real "para o teste enxergar". Defeito intencional em conteúdo de produção é indistinguível de defeito real seis meses depois, e o comentário que explicava a intenção não sobrevive ao primeiro merge.

---

## 8. Fronteira interna

Mesmo sem motor independente, vale manter a disciplina de acoplamento — não por ideologia, mas porque é o que torna as suítes de §7 possíveis:

- O subsistema narrativo não conhece treino, Juramento, Fôlego, Superação ou tela.
- A aplicação traduz seu domínio em qualidades `in.` antes de invocar a resolução.
- A resolução é função pura: estado + entradas + índice → resolução. Não persiste, não faz E/S.
- A busca do kill-switch acontece **fora** do subsistema, na inicialização do app, e entra como lista já resolvida.
- `in.reencontro` e `in.sessao_secundaria` são calculados pela aplicação, não pelo subsistema — o subsistema não conhece calendário nem relógio (§6.2).

Sem isso, o simulador não existe, porque simular exigiria instanciar o app inteiro.

---

## 9. Não-objetivos

O subsistema não faz:

- Lógica de treino, ciclo, Juramento, Fôlego ou Superação
- Persistência, sincronização, rede ou download
- Renderização ou geração de artefato de compartilhamento
- Chamada a modelo de linguagem, em qualquer circunstância (RN-027)
- Edição ou importação de conteúdo por usuário (RN-026)
- Aritmética ou lógica arbitrária em conteúdo
- Cálculo de datas, intervalos ou detecção de ausência — a aplicação entrega isso pronto em `in.`

---

## 10. Critérios de aceite

1. **Determinismo.** Mesma semente, mesmas entradas e mesma versão produzem saída idêntica em duas plataformas (M-05).
2. **Suíte de motor integralmente verde**, incluindo as fixtures negativas de §7.4.
3. **Suíte de catálogo verde** em CI, com M suficientemente alto para os testes por simulação serem informativos.
4. **Teste de leitura.** Simulação de 60 resoluções em política `constante`, lida por pessoa que não conhece o projeto, resulta em resumo coerente da história. Ao ativar cada idioma novo, repetir com **leitor nativo** — coerência narrativa não sobrevive automaticamente à tradução.
5. **Teste de agnosticismo de idioma.** A mesma semente produz a mesma sequência de storylets independentemente do idioma ativo. Verificável no MVP trocando para um recurso vazio: a sequência não muda, só o texto falta.
6. **Teste de orçamento.** Razão vistos/escritos entre 0,15 e 0,3, e distribuição por banda dentro da faixa de T-30, nas cinco políticas.

O critério 4 continua sendo o único que engenharia não resolve.

---

## 11. O que o rollback custou

Registro explícito, para decisão informada no futuro:

| Perdido | Consequência |
|---|---|
| Pacote atualizável remotamente | **R-001 volta a não ter escape.** Storylet quebrado ou padrão de seleção exposto só se corrige com release e revisão de loja |
| Validação estática como portão | Alcançabilidade passa de provada a amostrada — **exceto T-10**, devolvida à prova por M-06 |
| Migração declarada de estado | Compatibilidade entre releases depende de disciplina manual sobre o dicionário de qualidades |
| Campanha nova sem release | Cada ambientação adicional é um ciclo completo de release e revisão de loja |
| Assinatura de pacote | Deixa de ser necessária — RN-026 passa a ser garantida pelo próprio binário |

---

## 12. Estado desta especificação

**Sem questões abertas.** ME-001 a ME-015 estão todas fechadas; o histórico de cada fechamento está em `decisoes.md`. Alterações a partir daqui são mudanças de escopo, não amadurecimento de rascunho, e devem entrar como nova decisão registrada.

---

*Documento vivo. Alterações exigem entrada correspondente em `decisoes.md`.*
