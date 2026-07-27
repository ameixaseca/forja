# Verificador de Catálogo

Valida estaticamente um catálogo de storylets contra ESPEC v2.6 §7.2
(T-01 a T-21) e sanidade de esquema (SCH-xx), sem depender de simulação.

## Uso

```bash
pip install -r requirements.txt
python verificar.py <caminho-para-catalogo.json-ou-diretorio>
```

Se `<caminho>` for um diretório, procura `manifest.json`, `catalogo.json`
ou `catalog.json` dentro dele.

Saída: lista de erros (formato `REGRA: descrição`) e `exit 1` se houver
falhas; `exit 0` se o catálogo passar.

## Regras implementadas

Baseadas na tabela ESPEC v2.6 §7.2 (só as marcadas `estático` no range
T-01 a T-21; T-09/T-10/T-11/T-12 são `simulação` — ver `tooling/simulador`;
T-13/T-15/T-20 foram aposentadas; T-16 é teste unitário de motor):

| Regra | Descrição |
| --- | --- |
| T-01 | Todo `id` é único |
| T-02 | Nenhum efeito escreve `in.`/`sys.`/`cap.` |
| T-03 | Todo valor comparado/escrito é `number`/`boolean`; todo operador é válido |
| T-04 | Profundidade de predicado (`requer`/`quando`) ≤ 3 |
| T-05 | Todo storylet tem variante de fallback sem `quando` |
| T-07 | Reconhecimento mínimo: ≥1 storylet de Espinha + `st_cor_fallback` presente |
| T-08 | Toda qualidade lida é escrita por algum efeito, ou é `in.`/`sys.`/`cap.` |
| T-14 | Nomes de qualidade são ASCII minúsculo |
| T-18 | Camada neutra de `Cor` ≥ 60% da banda |
| T-19 | `arco.tom` usa no máximo 4 valores distintos |
| T-21 | Toda complicação (`comp.*`) tem ≥2 fechamentos, ≥1 sem condição de atributo |

Checagens adicionais de sanidade de esquema (fora da tabela ESPEC, mas
necessárias porque o catálogo não é validado por schema JSON separado):

| Regra | Descrição |
| --- | --- |
| SCH-01 | `banda` é Espinha, Arco ou Cor |
| SCH-02 | `subclasse` é ausencia, marco, sessao ou null |
| SCH-03 | Capítulos declarados são sequenciais, sem pulos |
| SCH-04 | Catálogo não está vazio |
| SCH-05 | Toda variante tem `texto` não vazio e `efeitos` é objeto |
| SCH-06 | Não há dependência circular entre qualidades (heurística por grafo leitura→escrita) |

## Limitações conhecidas (não implementadas nesta fase)

- **T-06** (toda entidade referenciada existe): o `Catalog` atual
  (`packages/motor-narrativo/src/types.ts`) não declara uma lista de
  entidades separada do catálogo de storylets — não há contra o que validar.
- **T-17** (pool elegível de Cor ≥ 2.5×K por combinação capítulo×arco.tom):
  depende da constante `K` (calculada em runtime por
  `packages/motor-narrativo/src/selector/exclusion.ts`) e de análise de
  alcançabilidade — fora do escopo de uma verificação puramente estática.

## Testes

```bash
pytest tooling/verificador
```

`testes/test_verificador.py` roda o catálogo válido de exemplo e espera
zero erros. `testes/test_negativos.py` roda cada fixture em
`tooling/fixtures/negativos/` e confirma que a regra esperada — e só ela —
dispara (DEC-037 / ESPEC §7.4).
