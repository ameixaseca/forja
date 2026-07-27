# Simulador de Travessia

CLI que roda `simulate()` de `@forja/motor-narrativo` sobre um catálogo
JSON e reporta cobertura (razão vistos/escritos), conforme ESPEC v2.6 §7.1.
Não reimplementa lógica de resolução — só invoca o motor e formata o
relatório.

## Uso

```bash
pnpm --filter tooling-simulador run simulate -- \
  --catalog ../../content/campanhas/espinha/manifest.json \
  --runs 50 \
  --policy constante \
  --output relatorio.html
```

| Flag | Obrigatória | Descrição |
| --- | --- | --- |
| `--catalog <path>` | sim | Caminho para o catálogo JSON |
| `--runs <n>` | sim | Número de resoluções a simular |
| `--policy <nome>` | sim | `constante\|erratico\|especialista\|pessimo\|intermitente` |
| `--seed <n>` | não (padrão 42) | Semente inicial |
| `--output <path>` | não | Também salva relatório HTML nesse caminho |

Política inválida é rejeitada antes de qualquer simulação rodar.

## Relatório de console

Imprime número de resoluções, storylets vistos/nunca vistos, e a razão
vistos/escritos — com aviso se ela sair do intervalo esperado (15%-30%,
ESPEC T-12).

## Volume de execuções

Por commit, M=50 por política (ESPEC §7.1) — é o que a CI roda em
`docs/ci-cd/.github/workflows/conteudo.yml`. Volumes maiores (M=1000
noturno, M=1000+regressão em release) não são automatizados nesta fase.

## Testes

```bash
pnpm --filter tooling-simulador run test
```

Roda as 5 políticas com `runs=50` contra um catálogo sintético
(`tests/fixtures/catalogo-sintetico.json`, 200 storylets de Cor) e
confirma que a razão fica entre 15% e 30%, que política inválida lança
erro, e que o relatório HTML é gerado corretamente.
