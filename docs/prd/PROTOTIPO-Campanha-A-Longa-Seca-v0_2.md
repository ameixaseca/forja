# PROTÓTIPO — Campanha "A Longa Seca"

**Espinha do capítulo 1 e catálogo de storylets para o teste de §14.1 do PRD**

| Campo | Valor |
|---|---|
| Versão | **v0.2** (substitui v0.1) |
| Documentos pai | PRD FORJA v0.14 · ESPEC — Sistema Narrativo v2.6 · `decisoes.md` |
| Finalidade | Instrumento do teste de leitura de §14.1 do PRD, e catálogo de referência do formato |
| Idioma | pt-BR (único idioma do MVP, D-037) |
| Data | Julho/2026 |

**Mudanças desde v0.1:**

| Mudança | Origem |
|---|---|
| Arco recortado de **6 para 4 capítulos** | DEC-021 / D-041 |
| Catálogo integralmente **conformante**; os dois defeitos deliberados do v0.1 saíram para fixtures negativas | DEC-037 |
| Removidas as duas variantes de prosa inalcançável (`c1.sebastiao.retorno`, `c1.firmina.retorno`) | DEC-010 |
| `sys.resolucoes` → `cap.resolucoes` em todo predicado | DEC-015 |
| `comp.pe_ferido` ganha segundo caminho de fechamento; `comp.carga_demais` ganha um terceiro | DEC-037 |
| Desfecho deixa de ler `comp.*` no `Requer`; fecha as complicações como efeito e reconhece a que ficou aberta | DEC-014 |
| `st_cor_tregua` substituído pela subclasse `ausencia` (6 itens) e criado `st_cor_fallback` | DEC-011, DEC-014 |
| Campo `desativavel` removido do modelo | DEC-012 |
| Tabela de calibragem passa a ser **saída de ferramenta**, não contagem manual | DEC-006 |

---

## 0. O que este documento é, e o que não é

**É:** a espinha do capítulo 1, um catálogo conformante que serve de referência do formato para a especificação técnica, e o instrumento do teste de leitura bloqueante de §14.1 do PRD.

**Não é:** o capítulo 1 completo. O orçamento da ESPEC pede ~26 itens de capítulo; este documento entrega 14, escolhidos para exercitar **toda** construção do formato ao menos uma vez — primeiro contato, retorno, caminho de fechamento base, caminho gatilhado por cada um dos três atributos, complicação aberta por rolagem baixa, variante ambivalente, ponto de escolha, reconhecimento de ausência e dívida de campanha.

**Consequência sobre as suítes.** Sobre um catálogo parcial, alguns testes não são informativos, e isso é escopo declarado e não ressalva:

| Teste | Aplica-se ao protótipo? |
|---|---|
| T-01 a T-08, T-14, T-17 a T-21, T-23 a T-26, T-28, T-29, T-33, T-34 | **Sim.** Todos devem passar |
| T-09, T-11, T-22, T-27, T-31, T-32 | **Sim**, com o capítulo 1 isolado |
| T-10 | Sim, com `cap.estagio` forçado no simulador, já que só há um capítulo |
| **T-12, T-30** | **Não.** Razão vistos/escritos e distribuição por banda só são interpretáveis sobre o catálogo completo. Com 14 itens de capítulo, a razão fica em ~0,55 contra o alvo de 0,2 — que é exatamente o efeito que o teste de leitura precisa provocar |

---

## 1. Análise estrutural de referência

Análise de **estrutura e método** de um módulo comercial de RPG de mesa, para fins de projeto de um sistema diferente. Nenhum conteúdo, personagem, cenário ou texto é reaproveitado — a campanha de §2 em diante é original.

### 1.1 O que o módulo faz e como mapeia

| Estrutura observada | Equivalente em FORJA |
|---|---|
| Cena de abertura obrigatória, sempre a primeira | `Espinha` — abertura de capítulo |
| Conjunto de missões jogáveis em qualquer ordem | `Arco` — bolsa por capítulo |
| Tabela de encontros aleatórios rolada durante deslocamento | `Cor` — bolsa global |
| Cena de encerramento fixa que dispara ao fim | `Espinha` — desfecho de capítulo |
| Tabela de duração por missão (curta / longa) | Orçamento de resoluções por capítulo |
| Sistema de alerta com dificuldade variável conforme estado prévio | Predicados sobre qualidades |

A convergência é forte o bastante para servir de validação: designers profissionais chegaram à mesma forma de maneira independente. A arquitetura de bandas não é excêntrica.

### 1.2 Achado crítico — densidade de estado

O episódio de abertura do módulo tem cerca de oito missões e carrega **dois** flags de estado com consequência posterior: um atalho aberto ou não, que altera rotas seguintes; e um confronto enfrentado ou não, que muda a fala do inimigo **dois episódios depois**. Fora isso, as missões são independentes — fazer todas em ordem inversa produz a mesma história.

**Isso funciona lá porque há um mestre humano improvisando a continuidade entre as cenas.** FORJA não tem mestre (D-001, D-002). Copiar essa densidade de estado entrega R-001 na semana seis: vinhetas bem escritas, sem enredo.

**Regra derivada, hoje formalizada:** todo storylet de `Arco` lê ao menos uma qualidade escrita por outro storylet do mesmo capítulo, ou escreve uma qualidade lida por outro. Storylet de `Arco` sem entrada nem saída de estado é `Cor` disfarçada. Esta regra virou a exigência de condicionamento estreito de §3.1 da ESPEC e o teste T-30.

### 1.3 O padrão que vale copiar

O flag do confronto é o melhor mecanismo do módulo inteiro: **um bit, ativado no capítulo 1, altera o texto no capítulo 3**. Custo de autoria: uma variante. Efeito percebido: o mundo lembrou.

É a regra de reconhecimento de §5 da ESPEC. O prefixo `mem.` deste protótipo nasceu daqui e hoje é espaço de nomes oficial, com T-28 exigindo que toda dívida declarada seja de fato cobrada num capítulo posterior — sem isso, "o mundo lembra" continuaria sendo intenção em vez de propriedade verificável.

---

## 2. A campanha

### 2.1 Premissa

O sertão não chove há três anos. Corre a notícia de que a água ainda brota na **Lapa do Meio**, do outro lado da chapada — dez dias de caminhada para quem tem perna. Uma romaria se forma. O personagem parte com ela.

A campanha é uma travessia a pé. Cada capítulo é um trecho da estrada e um lugar alcançado. Sessão de treino registrada = trecho caminhado. Dia de descanso = acampamento, e é no acampamento que as coisas acontecem — o que dá função ficcional ao Fôlego sem precisar explicar mecânica.

**Por que esta premissa e não fantasia genérica:** a caminhada mapeia o loop sem metáfora forçada; o descanso é obrigatório na ficção como é obrigatório na mecânica (D-006); e a ambientação é do mercado do MVP (D-039), com textura própria em vez de Tolkien de segunda mão.

### 2.2 Arco de quatro capítulos (D-041)

| # | Título | Complicação estruturante | Entidade central | Ciclos típicos |
|---|---|---|---|---|
| 1 | O Último Poço | `comp.carga_demais` — partiu carregando mais do que aguenta | Sebastião | 2–4 |
| 2 | A Estrada de Pedra | `comp.rota_escolhida` — a romaria se divide e a escolha cobra | Dona Firmina | 2–4 |
| 3 | O Casario Vazio | `comp.o_que_vem_atras` — o povoado abandonado tem água boa, e o que vinha atrás alcança | Sebastião (retorno e confronto) | 2–4 |
| 4 | A Lapa do Meio | `comp.subida` — a chapada cobra o corpo, e a água existe | Dona Firmina (retorno) | 2–4 |

**O recorte de 6 para 4.** O antigo capítulo 5 ("O Que Vem Atrás") foi absorvido pelo 3, onde o povoado vazio já criava a expectativa de perseguição; o antigo 4 ("A Subida") foi absorvido pelo 4 atual, que passa a ser subida e chegada no mesmo trecho. Nada ficou pendurado: a campanha termina na Lapa do Meio com a pergunta que a premissa abriu — a água existe, e o que ela custa.

**Sebastião** é o padrão de §1.3: um homem encontrado na estrada caminhando **na direção contrária**, para longe da água. Aparece no capítulo 1, retorna no 3, e o retorno reconhece explicitamente o que ficou para trás.

### 2.3 Dívida de campanha declarada (T-28)

Toda qualidade `mem.` escrita no capítulo 1 e o capítulo em que é cobrada. É esta tabela que T-28 verifica contra o catálogo completo.

| Qualidade | Escrita em | Cobrada em | Como |
|---|---|---|---|
| `mem.aliviou_carga` | cap. 1 | cap. 3 | o que ficou na pedra reaparece no casario, ou não reaparece |
| `mem.deu_agua` | cap. 1 | cap. 2 e 4 | Firmina anda do seu lado, e na subida decide por você |
| `mem.andou_sozinho` | cap. 1 | cap. 2 | chegar antes muda quem já está na Estrada de Pedra |
| `mem.sebastiao_recusou` | cap. 1 | cap. 3 | ele lembra que não aceitou, e o que disse na ocasião |
| `mem.sebastiao_partilhou` | cap. 1 | cap. 3 | ele lembra que aceitou, e o que isso passou a dever |

---

## 3. Capítulo 1 — O Último Poço

### 3.1 Espinha

**Abertura.** O poço do arraial deu areia na véspera. Quem vai, vai agora. O personagem tem uma carga a decidir e uma estrada pela frente.

**Complicação estruturante.** `comp.carga_demais` — partiu carregando mais do que aguenta.

**Desfecho.** O fim do primeiro trecho, à vista da Estrada de Pedra. Escolha irreversível: seguir com a romaria ou tomar a frente sozinho. O desfecho **não exige** que a carga tenha sido resolvida: se chegar aberta, o texto reconhece o peso e a complicação é fechada como efeito (§3.5 da ESPEC).

**Piso de disparo:** 2 ciclos com Juramento cumprido e 2 de Fôlego (§4.9 do PRD) — o capítulo 1 usa o piso, porque P2 morre na semana 3.

### 3.2 Qualidades declaradas

```json
{
  "qualidades": [
    { "nome": "arco.tom", "tipo": "enum",
      "valores": ["esperanca", "cansaco", "desconfianca", "duro"],
      "inicial": "esperanca" },
    { "nome": "arco.sede", "tipo": "int", "min": 0, "max": 5, "inicial": 1 },

    { "nome": "comp.carga_demais", "tipo": "bool", "inicial": 1 },
    { "nome": "comp.pe_ferido",    "tipo": "bool", "inicial": 0 },

    { "nome": "ent.sebastiao.estado", "tipo": "enum",
      "valores": ["ausente", "encontrado", "ouvido", "recusado", "partilhado"],
      "inicial": "ausente" },
    { "nome": "ent.sebastiao.conhecido", "tipo": "int", "min": 0, "max": 9, "inicial": 0 },
    { "nome": "ent.firmina.estado", "tipo": "enum",
      "valores": ["ausente", "presente", "grata"], "inicial": "ausente" },
    { "nome": "ent.firmina.conhecido", "tipo": "int", "min": 0, "max": 9, "inicial": 0 },

    { "nome": "mem.aliviou_carga",       "tipo": "bool", "inicial": 0 },
    { "nome": "mem.deu_agua",            "tipo": "bool", "inicial": 0 },
    { "nome": "mem.andou_sozinho",       "tipo": "bool", "inicial": 0 },
    { "nome": "mem.sebastiao_recusou",   "tipo": "bool", "inicial": 0 },
    { "nome": "mem.sebastiao_partilhou", "tipo": "bool", "inicial": 0 }
  ]
}
```

`comp.` é dívida do capítulo e fecha dentro dele; `mem.` é dívida da campanha e é cobrada depois (§2.2 da ESPEC). A distinção, que no v0.1 era convenção deste documento, hoje é espaço de nomes oficial com teste próprio.

### 3.3 Entidades

```json
{
  "entidades": [
    { "id": "sebastiao", "genero": { "pt-BR": "m" },
      "nome": "ent.sebastiao.nome", "nome_traduzivel": false },
    { "id": "firmina",   "genero": { "pt-BR": "f" },
      "nome": "ent.firmina.nome",   "nome_traduzivel": false }
  ]
}
```

Gênero declarado agora ainda que só pt-BR seja preenchido (D-040, RF-124). `nome_traduzivel: false` porque são nomes próprios (RF-126): a semente compartilhada de D-020 opera por reconhecimento mútuo, e Sebastião chamar-se outra coisa em outro idioma destruiria a conversa que é o produto do compartilhamento.

---

## 4. Catálogo — capítulo 1

Formato conforme §3.2 da ESPEC: o storylet carrega **referência de texto**, nunca prosa. A prosa está em §5. Nenhum storylet declara `desativavel` — o campo não existe mais (DEC-012).

### 4.1 Espinha (2)

```json
[
  {
    "id": "st_c1_abertura",
    "capitulo": 1, "banda": "espinha", "peso": 10,
    "requer": { "todos": [ { "q": "cap.estagio", "eq": "abertura" } ] },
    "efeitos": [ { "q": "comp.carga_demais", "definir": 1 } ],
    "textos": [ { "texto": "c1.abertura" } ]
  },
  {
    "id": "st_c1_desfecho",
    "capitulo": 1, "banda": "espinha", "peso": 10,
    "requer": { "todos": [ { "q": "cap.estagio", "eq": "desfecho" } ] },
    "efeitos": [ { "q": "comp.carga_demais", "definir": 0 },
                 { "q": "comp.pe_ferido",    "definir": 0 } ],
    "textos": [
      { "quando": { "todos": [ { "q": "comp.carga_demais", "eq": 1 } ] },
        "texto": "c1.desfecho.com_peso" },
      { "quando": { "todos": [ { "q": "ent.sebastiao.conhecido", "gte": 1 } ] },
        "texto": "c1.desfecho.viu_sebastiao", "parametros": ["ent.sebastiao"] },
      { "texto": "c1.desfecho.base" }
    ],
    "escolhas": [
      { "id": "com_a_romaria", "rotulo": "Seguir com a romaria",
        "efeitos": [ { "q": "arco.tom", "definir": "esperanca" },
                     { "q": "ent.firmina.estado", "definir": "presente" } ] },
      { "id": "tomar_a_frente", "rotulo": "Tomar a frente sozinho",
        "efeitos": [ { "q": "arco.tom", "definir": "duro" },
                     { "q": "mem.andou_sozinho", "definir": 1 } ] }
    ]
  }
]
```

**Três coisas a notar no desfecho**, todas consequência de DEC-014:

1. O `Requer` não menciona `comp.*` — se mencionasse, o jogador que chegasse ao teto de 4 ciclos com a carga aberta encontraria o desfecho inelegível e o capítulo travaria (T-29).
2. As complicações são fechadas **como efeito**, não como pré-condição.
3. O `Quando` da primeira variante lê `comp.carga_demais` — e isso é permitido e desejável: é ali que o texto reconhece o que ficou por resolver. A restrição de T-29 é sobre `Requer`, não sobre `Quando`.

### 4.2 Arco (12)

Cada storylet declara predicado sobre estado de entidade, complicação aberta ou resultado de rolagem — nunca apenas sobre `cap.resolucoes` (§3.1 da ESPEC). Predicado largo em `Arco` faria a banda `Cor` inteira desaparecer do sorteio.

**Caminhos de fechamento (T-21):**

| Complicação | Base (sem atributo) | Gatilhados |
|---|---|---|
| `comp.carga_demais` | `st_c1_carga_largar` | `st_c1_carga_aguentar` (Força) · `st_c1_firmina_ombro` (Vigor) |
| `comp.pe_ferido` | `st_c1_pe_cuidado` | `st_c1_pe_apressar` (Destreza) |

```json
[
  {
    "id": "st_c1_sebastiao_encontro",
    "capitulo": 1, "banda": "arco", "peso": 8,
    "entidades": ["sebastiao"],
    "requer": { "todos": [ { "q": "ent.sebastiao.estado", "eq": "ausente" },
                           { "q": "cap.resolucoes", "gte": 2 } ] },
    "efeitos": [ { "q": "ent.sebastiao.estado", "definir": "encontrado" },
                 { "q": "arco.tom", "definir": "desconfianca" } ],
    "textos": [ { "texto": "c1.sebastiao.primeiro", "parametros": ["ent.sebastiao"] } ]
  },
  {
    "id": "st_c1_sebastiao_pergunta",
    "capitulo": 1, "banda": "arco", "peso": 6,
    "entidades": ["sebastiao"],
    "requer": { "todos": [ { "q": "ent.sebastiao.estado", "eq": "encontrado" } ] },
    "efeitos": [ { "q": "ent.sebastiao.estado", "definir": "ouvido" },
                 { "q": "arco.sede", "somar": 1 } ],
    "textos": [ { "texto": "c1.sebastiao.pergunta", "parametros": ["ent.sebastiao"] } ]
  },
  {
    "id": "st_c1_sebastiao_recusa",
    "capitulo": 1, "banda": "arco", "peso": 5,
    "entidades": ["sebastiao"],
    "requer": { "todos": [ { "q": "ent.sebastiao.estado", "eq": "ouvido" },
                           { "q": "mem.deu_agua", "eq": 0 } ] },
    "efeitos": [ { "q": "ent.sebastiao.estado", "definir": "recusado" },
                 { "q": "mem.sebastiao_recusou", "definir": 1 } ],
    "textos": [ { "texto": "c1.sebastiao.recusa", "parametros": ["ent.sebastiao"] } ]
  },
  {
    "id": "st_c1_sebastiao_partilha",
    "capitulo": 1, "banda": "arco", "peso": 5,
    "entidades": ["sebastiao"],
    "requer": { "todos": [ { "q": "ent.sebastiao.estado", "eq": "ouvido" },
                           { "q": "mem.deu_agua", "eq": 1 } ] },
    "efeitos": [ { "q": "ent.sebastiao.estado", "definir": "partilhado" },
                 { "q": "mem.sebastiao_partilhou", "definir": 1 },
                 { "q": "arco.tom", "definir": "esperanca" } ],
    "textos": [ { "texto": "c1.sebastiao.partilha", "parametros": ["ent.sebastiao"] } ]
  },
  {
    "id": "st_c1_firmina_tropeco",
    "capitulo": 1, "banda": "arco", "peso": 7,
    "entidades": ["firmina"],
    "requer": { "todos": [ { "q": "ent.firmina.estado", "eq": "ausente" },
                           { "q": "cap.resolucoes", "gte": 3 } ] },
    "efeitos": [ { "q": "ent.firmina.estado", "definir": "presente" } ],
    "textos": [ { "texto": "c1.firmina.primeiro", "parametros": ["ent.firmina"] } ]
  },
  {
    "id": "st_c1_firmina_agua",
    "capitulo": 1, "banda": "arco", "peso": 6,
    "entidades": ["firmina"],
    "requer": { "todos": [ { "q": "ent.firmina.estado", "eq": "presente" },
                           { "q": "arco.sede", "gte": 2 } ] },
    "efeitos": [ { "q": "mem.deu_agua", "definir": 1 },
                 { "q": "ent.firmina.estado", "definir": "grata" },
                 { "q": "arco.sede", "somar": 1 } ],
    "textos": [ { "texto": "c1.firmina.agua", "parametros": ["ent.firmina"] } ]
  },
  {
    "id": "st_c1_firmina_ombro",
    "capitulo": 1, "banda": "arco", "peso": 6,
    "entidades": ["firmina"],
    "requer": { "todos": [ { "q": "ent.firmina.estado", "eq": "grata" },
                           { "q": "comp.carga_demais", "eq": 1 },
                           { "q": "in.atributo.vigor", "gte": 1 } ] },
    "efeitos": [ { "q": "comp.carga_demais", "definir": 0 },
                 { "q": "mem.aliviou_carga", "definir": 1 },
                 { "q": "arco.tom", "definir": "esperanca" } ],
    "textos": [ { "texto": "c1.carga.ombro", "parametros": ["ent.firmina"] } ]
  },
  {
    "id": "st_c1_carga_largar",
    "capitulo": 1, "banda": "arco", "peso": 10,
    "requer": { "todos": [ { "q": "comp.carga_demais", "eq": 1 },
                           { "q": "cap.resolucoes", "gte": 4 } ] },
    "efeitos": [ { "q": "comp.carga_demais", "definir": 0 },
                 { "q": "mem.aliviou_carga", "definir": 1 },
                 { "q": "arco.tom", "definir": "cansaco" } ],
    "textos": [ { "texto": "c1.carga.largar" } ]
  },
  {
    "id": "st_c1_carga_aguentar",
    "capitulo": 1, "banda": "arco", "peso": 8,
    "requer": { "todos": [ { "q": "comp.carga_demais", "eq": 1 },
                           { "q": "in.atributo.forca", "gte": 1 },
                           { "q": "in.rolagem", "gte": 10 } ] },
    "efeitos": [ { "q": "comp.carga_demais", "definir": 0 },
                 { "q": "arco.tom", "definir": "duro" } ],
    "textos": [ { "texto": "c1.carga.aguentar" } ]
  },
  {
    "id": "st_c1_pe_ferido",
    "capitulo": 1, "banda": "arco", "peso": 5,
    "requer": { "todos": [ { "q": "in.rolagem", "lte": 6 },
                           { "q": "comp.pe_ferido", "eq": 0 },
                           { "q": "cap.resolucoes", "gte": 3 } ] },
    "efeitos": [ { "q": "comp.pe_ferido", "definir": 1 },
                 { "q": "arco.tom", "definir": "cansaco" } ],
    "textos": [ { "texto": "c1.pe.ferido" } ]
  },
  {
    "id": "st_c1_pe_cuidado",
    "capitulo": 1, "banda": "arco", "peso": 8,
    "entidades": ["firmina"],
    "requer": { "todos": [ { "q": "comp.pe_ferido", "eq": 1 } ] },
    "efeitos": [ { "q": "comp.pe_ferido", "definir": 0 } ],
    "textos": [
      { "quando": { "todos": [ { "q": "ent.firmina.estado", "eq": "grata" } ] },
        "texto": "c1.pe.cuidado_firmina", "parametros": ["ent.firmina"] },
      { "texto": "c1.pe.cuidado_sozinho" }
    ]
  },
  {
    "id": "st_c1_pe_apressar",
    "capitulo": 1, "banda": "arco", "peso": 6,
    "requer": { "todos": [ { "q": "comp.pe_ferido", "eq": 1 },
                           { "q": "in.atributo.destreza", "gte": 1 } ] },
    "efeitos": [ { "q": "comp.pe_ferido", "definir": 0 },
                 { "q": "arco.tom", "definir": "duro" } ],
    "textos": [ { "texto": "c1.pe.apressar" } ]
  }
]
```

**As três classes de §5 da ESPEC, exemplificadas:**

| Storylet | Classe | Variantes | Por quê |
|---|---|---|---|
| `st_c1_sebastiao_encontro` | primeiro contato | 1 | `Requer` implica `estado == ausente`, o valor inicial: só é elegível com `conhecido == 0` |
| `st_c1_sebastiao_pergunta` | retorno | 1 | `Requer` implica `estado == encontrado`: só é elegível com a entidade já conhecida |
| `st_c1_pe_cuidado` | **ambivalente** | 2 | `Requer` nada diz sobre Firmina; é elegível com e sem ela conhecida, e precisa de uma variante para cada caso |

No v0.1, os dois primeiros carregavam uma segunda variante de "retorno" que **nunca podia ser exibida**, porque ambos são de disparo único no estado inicial. As duas foram removidas. É o defeito que motivou DEC-010, e é a razão de T-27 medir cobertura por variante e não por storylet.

### 4.3 Cor (17)

Treze itens na camada neutra, quatro na tonal — 76%, acima do piso de 60% de T-18. Inclui a subclasse `ausencia` obrigatória (6 itens) e o `st_cor_fallback` da rede de segurança. Nenhum escreve `comp.`, `ent.` ou `mem.` (T-34).

```json
[
  { "id": "st_cor_fallback", "capitulo": null, "banda": "cor",
    "subclasse": "fallback", "peso": 1,
    "textos": [ { "texto": "cor.fallback" } ] },

  { "id": "st_cor_poeira",   "capitulo": null, "banda": "cor", "peso": 3,
    "textos": [ { "texto": "cor.poeira" } ] },

  { "id": "st_cor_carcaca",  "capitulo": null, "banda": "cor", "peso": 2,
    "efeitos": [ { "q": "arco.sede", "somar": 1 } ],
    "textos": [ { "texto": "cor.carcaca" } ] },

  { "id": "st_cor_reza",     "capitulo": null, "banda": "cor", "peso": 3,
    "textos": [ { "texto": "cor.reza" } ] },

  { "id": "st_cor_sombra",   "capitulo": null, "banda": "cor", "peso": 2,
    "textos": [ { "texto": "cor.sombra" } ] },

  { "id": "st_cor_bota",     "capitulo": null, "banda": "cor", "peso": 2,
    "textos": [ { "texto": "cor.bota" } ] },

  { "id": "st_cor_cisterna", "capitulo": null, "banda": "cor", "peso": 2,
    "efeitos": [ { "q": "arco.sede", "somar": 1 } ],
    "textos": [ { "texto": "cor.cisterna" } ] },

  { "id": "st_cor_aus_estrada",  "capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 4,
    "textos": [ { "texto": "cor.aus.estrada" } ] },

  { "id": "st_cor_aus_pegadas",  "capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 4,
    "textos": [ { "texto": "cor.aus.pegadas" } ] },

  { "id": "st_cor_aus_romaria",  "capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 4,
    "textos": [ { "texto": "cor.aus.romaria" } ] },

  { "id": "st_cor_aus_juazeiro", "capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 3,
    "textos": [ { "texto": "cor.aus.juazeiro" } ] },

  { "id": "st_cor_aus_cantil",   "capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 3,
    "textos": [ { "texto": "cor.aus.cantil" } ] },

  { "id": "st_cor_aus_assentada","capitulo": null, "banda": "cor",
    "subclasse": "ausencia", "peso": 3,
    "textos": [ { "texto": "cor.aus.assentada" } ] },

  { "id": "st_cor_tonal_esperanca", "capitulo": null, "banda": "cor", "peso": 4,
    "requer": { "todos": [ { "q": "arco.tom", "eq": "esperanca" } ] },
    "textos": [ { "texto": "cor.tonal.esperanca" } ] },

  { "id": "st_cor_tonal_cansaco", "capitulo": null, "banda": "cor", "peso": 4,
    "requer": { "todos": [ { "q": "arco.tom", "eq": "cansaco" } ] },
    "textos": [ { "texto": "cor.tonal.cansaco" } ] },

  { "id": "st_cor_tonal_desconfianca", "capitulo": null, "banda": "cor", "peso": 4,
    "requer": { "todos": [ { "q": "arco.tom", "eq": "desconfianca" } ] },
    "textos": [ { "texto": "cor.tonal.desconfianca" } ] },

  { "id": "st_cor_tonal_duro", "capitulo": null, "banda": "cor", "peso": 4,
    "requer": { "todos": [ { "q": "arco.tom", "eq": "duro" } ] },
    "textos": [ { "texto": "cor.tonal.duro" } ] }
]
```

**A subclasse `ausencia` substitui o `st_cor_tregua` do v0.1.** No v0.1, aquele storylet era a implementação literal de RN-031 e **nunca seria sorteado**: nenhum storylet de `Arco` guardava contra Trégua, e como `Arco` descarta `Cor`, a vinheta nunca chegava à mesa. Hoje a garantia é do motor — com `in.tregua == 1` só a banda `Cor` é consultada, e com `in.reencontro == 1` a seleção é forçada a esta subclasse (M-01, M-02). O catálogo não precisa declarar nada; precisa apenas ter itens suficientes, o que T-31 verifica.

**`st_cor_fallback` não tem predicado e não tem efeito**, por construção: é o que a rede de segurança devolve quando nenhuma banda tem elegíveis. No v0.1 a rede devolvia o desfecho do capítulo, o que contornaria as três condições de §4.9 do PRD e, em particular, o consumo de Fôlego de RN-007.

---

## 5. Recurso pt-BR

`recursos/pt-BR/cap1.json` e `recursos/pt-BR/cor.json` — a prosa, separada do catálogo por D-038.

### 5.1 Espinha

**c1.abertura**
> O poço deu areia na véspera. O balde subiu raspando, com um punhado de barro seco no fundo, e ninguém disse nada por um tempo bom. Depois começaram a arrumar as trouxas. Você arrumou a sua duas vezes: uma pensando no caminho, outra pensando em quem fica. A segunda ficou mais pesada.

**c1.desfecho.base**
> Do alto do último barranco dá para ver a Estrada de Pedra cortando o chão branco até onde a vista alcança. A romaria vai chegar lá amanhã, no passo dela. Você pode chegar hoje, se for sozinho.

**c1.desfecho.viu_sebastiao**
> Do alto do último barranco dá para ver a Estrada de Pedra cortando o chão branco. E dá para ver, muito longe, uma figura de chapéu na mão andando no rumo contrário — sempre no rumo contrário, sempre longe da água. A romaria vai chegar amanhã. Você pode chegar hoje, se for sozinho.

**c1.desfecho.com_peso**
> Do alto do último barranco dá para ver a Estrada de Pedra, e você para ali mais tempo do que precisava. Não é a vista. É o ombro, que passou o trecho inteiro pedindo uma coisa que você não deu. A trouxa continua inteira. Isso vai ter de ser resolvido na estrada de baixo, porque aqui em cima já não dá.

### 5.2 Arco

**c1.sebastiao.primeiro**
> Ele vem no rumo contrário, e isso é a primeira coisa estranha. Todo mundo caminha para o poente, atrás da notícia da água. Ele caminha para o nascente, sem pressa, com um chapéu velho na mão em vez de na cabeça. Passa por você e cumprimenta com a cabeça, como quem cumprimenta conhecido. Você não conhece ninguém aqui.

**c1.sebastiao.pergunta**
> — A senhora água — ele diz, sem que você tenha perguntado. — Tem gente que chega lá e bebe. Tem gente que chega lá e olha.
> Ele espera. Você entende que é para perguntar qual das duas. Não pergunta. Ele acha graça e segue andando para o lado errado do mundo.

**c1.sebastiao.recusa**
> Você estende o cantil. É pouca água e você sabe. Ele olha para o cantil, olha para você, e põe as mãos para trás — não com desprezo, mas com o cuidado de quem não quer dever. — Guarde. Você vai precisar antes de mim.

**c1.sebastiao.partilha**
> Você estende o cantil, e dessa vez ele pega. Bebe um gole só, do jeito de quem mede, e devolve com as duas mãos. — Já vi gente dar água tendo — diz. — Dar não tendo é outra conta. — Não explica que conta é essa. Guarda o chapéu na cabeça, o que até agora não tinha feito, e segue.

**c1.firmina.primeiro**
> A mulher que vinha na frente tropeça numa raiz e cai de joelhos, e a trouxa dela abre no chão. Sai roupa, sai retrato, sai um saco de farinha que rasga. Ela junta tudo depressa, com raiva, e o que junta primeiro é o retrato.

**c1.firmina.agua**
> A garganta dela está fechando de tão seca; dá para ouvir na voz. Você calcula o que sobra no cantil e calcula errado de propósito. Ela bebe dois goles, devolve, e não agradece com palavra — agradece passando a andar do seu lado, que na estrada é agradecimento maior.

**c1.carga.ombro**
> Ela anda um trecho olhando de lado para o seu ombro antes de dizer qualquer coisa. Depois estende a mão, sem pedir licença, e tira metade da sua trouxa para a dela. — Não é favor — avisa. — É que eu ando atrás de você e o seu passo torto me atrasa. Você aceita porque é mentira educada e as duas partes sabem.

**c1.carga.largar**
> Você para no meio do caminho, abre a trouxa e escolhe. Fica o que serve. Sai o que era só para não deixar para trás. Você põe o que sai numa pedra, do lado da estrada, arrumado, como quem devolve. Depois anda mais leve e por um tempo isso dói mais do que o peso doía.

**c1.carga.aguentar**
> Você troca o nó, joga o peso para o outro ombro e resolve que aguenta. As pernas discutem. Você não responde. No fim do trecho o ombro está marcado e a trouxa está inteira, e você chega junto com a fila, não atrás dela.

**c1.pe.ferido**
> A pedra entra pela costura e você só percebe três passos depois, quando o passo já mudou de jeito. Tirar a bota agora é perder a fila. Você não tira.

**c1.pe.cuidado_sozinho**
> Na parada, você tira a bota. O pano gruda, sai devagar e sai com companhia. Você lava com o que não devia gastar, amarra com o que não devia rasgar, e calça de volta antes de pensar demais.

**c1.pe.cuidado_firmina**
> Ela vê o jeito que você senta e já chega falando que era para ter falado antes. Amarra o pé com o pano em que o retrato vinha embrulhado — tira o retrato, guarda no peito, rasga o pano. Faz isso sem cerimônia, como quem já fez muitas vezes.

**c1.pe.apressar**
> Você não para. Muda o apoio para a borda do pé, encurta o passo e acha, em três tentativas, um jeito de andar que dói menos. Não é bonito de ver. Cobre o mesmo chão da fila e ninguém repara, que é exatamente o que você queria.

### 5.3 Cor — camada neutra

**cor.fallback**
> A estrada continua. É isso o que a estrada faz.

**cor.poeira**
> A poeira sobe até o joelho e fica ali, como se não soubesse descer.

**cor.carcaca**
> Uma rês morta do lado da estrada, seca antes de apodrecer. O couro bateu no osso e ficou. Ninguém comenta.

**cor.reza**
> Alguém na frente começa uma reza e três vozes acompanham. Na quarta estrofe já são dez. Na sexta ninguém lembra a letra e a coisa vira só um som que se anda junto.

**cor.sombra**
> Um juazeiro sozinho no meio do branco. A sombra dele cabe quatro pessoas e a fila tem quarenta. Ninguém para.

**cor.bota**
> Um par de botas no acostamento, lado a lado, arrumado. Botas boas. Ninguém pega.

**cor.cisterna**
> A cisterna da beira do caminho está aberta e tem o fundo à mostra. Alguém, em algum ano, caiou a parede de dentro. A cal continua branca. É a coisa mais limpa que você vê o dia inteiro.

### 5.4 Cor — subclasse `ausencia`

Estas seis vinhetas são as que o motor devolve em ciclo de Trégua e na resolução de reencontro. Todas dizem a mesma coisa por caminhos diferentes: **o mundo notou, e o mundo esperou.** Nenhuma cobra.

**cor.aus.estrada**
> A estrada continua sem você por uns dias. Isso não é figura de linguagem: quando você voltar a andar, ela vai estar exatamente onde estava, porque estrada não anda sozinha. O que anda é quem caminha.

**cor.aus.pegadas**
> As suas pegadas do último trecho ainda estão lá, meio comidas de vento, mas estão. Dá para ver onde você parou, onde trocou o peso de ombro, onde pensou em voltar. O chão guardou por você.

**cor.aus.romaria**
> A romaria seguiu, como romaria segue. Mas romaria não é reta: ela para, ela acampa, ela espera água. Quem senta um tempo à sombra não fica para trás para sempre — fica para trás por enquanto.

**cor.aus.juazeiro**
> Você fica um tempo debaixo do juazeiro que ontem tinha fila. Hoje a sombra é toda sua e não custou nada. Não é conquista nem derrota. É sombra.

**cor.aus.cantil**
> O cantil está do mesmo jeito que você deixou. Nem mais cheio, nem mais vazio. Há coisas neste mundo que não pioram sozinhas.

**cor.aus.assentada**
> A poeira assentou. Sem passo, ela assenta — leva um dia, dois. Quando você puser o pé de novo ela sobe outra vez, do mesmo jeito de sempre, sem cobrar os dias parados.

### 5.5 Cor — camada tonal

**cor.tonal.esperanca**
> Um menino pergunta se a água da Lapa é doce ou salobra. A mãe diz que é doce. Ela não sabe. Todo mundo por perto resolve saber junto com ela.

**cor.tonal.cansaco**
> A conversa acabou faz tempo. Ninguém brigou. Simplesmente cada um passou a gastar o ar em andar.

**cor.tonal.desconfianca**
> Alguém conta que conhece um que voltou da Lapa. Perguntam quem. A pessoa demora a responder e depois responde outra coisa.

**cor.tonal.duro**
> Você não conta mais os passos. Conta o que falta, que é outra conta e dá sempre um número pior.

---

## 6. Calibragem medida

Tabela emitida por `verificar.py`, que extrai os JSON de §4 e a prosa de §5 deste próprio arquivo e roda as regras da ESPEC contra eles. Não é contagem manual — foi contagem manual que produziu os três números errados do v0.1 (DEC-006).

| Métrica | Valor | Alvo | Situação |
|---|---|---|---|
| Storylets de capítulo | 14 (2 espinha + 12 arco) | ~26 por capítulo | escopo declarado em §0 |
| Storylets de `Cor` | 17 | ~150 na campanha | escopo declarado em §0 |
| **Total no protótipo** | **31** | ~260 na campanha | — |
| Unidades de texto | 34 | — | — |
| Palavras de prosa (§5) | ~1.320 | 40–65 mil na campanha | — |
| `Cor` neutra | 13 de 17 (76%) | ≥ 60% | **conforme** |
| Subclasse `ausencia` | 6 | ≥ 6 | **conforme** |
| Subclasse `fallback` | 1 | exatamente 1 | **conforme** |
| Domínio de `arco.tom` | 4 valores | ≤ 4 | **conforme** |
| Profundidade máxima de predicado | 2 | ≤ 3 | **conforme** |
| Complicações com ≥ 2 caminhos de fechamento | 2 de 2 | 100% | **conforme** |
| Complicações com caminho base sem atributo | 2 de 2 | 100% | **conforme** |
| Storylets de `Arco` com predicado sobre entidade, complicação ou rolagem | 12 de 12 | 100% | **conforme** |
| Variantes inalcançáveis por classificação estática | 0 | 0 | **conforme** |
| `Requer` de espinha de desfecho lendo `comp.*` | 0 | 0 | **conforme** |
| Qualidades `mem.` sem leitor declarado em capítulo posterior | 0 de 5 | 0 | conforme, contra §2.3 |

**Nenhuma não-conformidade.** Os dois defeitos deliberados do v0.1 — a complicação com um único fechamento e a razão vistos/escritos inflada — saíram daqui: o primeiro foi corrigido e virou fixture negativa (§8); o segundo é consequência do escopo declarado em §0 e por isso T-12 e T-30 não se aplicam a este documento.

**Estimativa de esforço.** As 31 unidades deste protótipo, com predicados, efeitos e prosa, levaram o equivalente a algumas horas de trabalho concentrado. É o dado que sustenta a estimativa de §11.1 do PRD e, por consequência, D-041.

---

## 7. Como rodar o teste do §14.1

1. Simular 20 resoluções em política `constante`, à mão ou no papel: sortear entre os elegíveis a cada passo, aplicar efeitos, anotar o texto.
2. Copiar os 20 textos em sequência, sem títulos, sem ids, sem marcação de banda — **texto corrido puro**.
3. Entregar a **três pessoas** que não conhecem o projeto e pedir a cada uma: *resuma essa história em três frases*.

Três leitores, e não um, porque o critério de parada de §11.2 do PRD é "duas em três não conseguem" — com um leitor só, um mau dia de leitura decide o projeto.

**Critérios de leitura do resultado:**

| Resultado | Diagnóstico |
|---|---|
| Resume e menciona Sebastião | Continuidade funciona. Seguir |
| Resume mas só descreve caminhada e calor | `Cor` está engolindo `Arco`. Ajustar pesos ou condicionamento |
| Menciona Sebastião mas não sabe dizer o que ele quer | Reconhecimento funciona, intenção não. Problema de escrita, corrigível |
| Não consegue resumir | Problema de continuidade, não de volume. **Mais conteúdo não resolve** — é o cenário de §1.2 do PRD |
| Reclama de repetição antes da resolução 15 | Esperado com 31 itens. Confirma o orçamento da ESPEC |

Duas em três no penúltimo caso, **após uma rodada de correção**, aciona o critério de parada de §11.2 do PRD.

---

## 8. Fixtures de teste negativo

Substituem a prática do v0.1 de deixar defeitos deliberados no catálogo real (DEC-037). Cada fixture é um catálogo sintético mínimo que viola exatamente uma regra, e a suíte verifica que o teste correspondente **reprova**. Teste que nunca reprovou é teste em que não se pode confiar.

| Fixture | Viola | Deve reprovar em |
|---|---|---|
| `neg_id_duplicado` | dois storylets com o mesmo `Id` | T-01 |
| `neg_efeito_em_in` | efeito escrevendo `in.rolagem` | T-02 |
| `neg_sem_fallback` | storylet cuja última variante tem `Quando` | T-05 |
| `neg_reconhecimento` | storylet ambivalente com uma variante só | T-07 |
| `neg_fechamento_unico` | complicação com um só caminho de fechamento | T-21 |
| `neg_fechamento_com_atributo` | complicação cujos dois caminhos exigem atributo | T-21 |
| `neg_variante_morta` | segunda variante em storylet de disparo único | T-27 |
| `neg_mem_sem_leitor` | `mem.X` escrita e nunca lida em capítulo posterior | T-28 |
| `neg_desfecho_le_comp` | `Requer` de desfecho com predicado sobre `comp.*` | T-29 |
| `neg_arco_largo` | storylet de `Arco` com predicado só sobre `cap.resolucoes` | T-30 |
| `neg_sem_ausencia` | catálogo sem storylet da subclasse `ausencia` | T-31 |
| `neg_sys_resolucoes` | storylet de capítulo com `Requer` sobre `sys.resolucoes` | T-33 |
| `neg_cor_estrutural` | storylet de `Cor` escrevendo `comp.X` | T-34 |

A primeira fixture a escrever é `neg_fechamento_unico`: é a que reproduz o defeito que o v0.1 carregava no catálogo de produção.

---

*Documento vivo. Campanha original; nenhum conteúdo de terceiros reaproveitado. Alterações exigem entrada correspondente em `decisoes.md`.*
