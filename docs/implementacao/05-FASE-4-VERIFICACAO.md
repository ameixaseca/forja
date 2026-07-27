# Fase 4: Verificação — FORJA

**Duração:** 1 semana  
**Dependências:** Fase 2 (motor narrativo)  
**Objetivo:** Scripts verificação catálogo, simulador, fixtures negativas

---

## AI Agent Context

**Fonte verdade:**

- ESPEC §7 (verificação estática + simulação)
- RF-100 a RF-103 (simulador)
- Testes T-01 a T-34 (propriedades catálogo)

**Artefatos entrada:**

- `docs/prd/verificar.py` (prototype script)
- `docs/testes/cobertura.py`
- `packages/motor-narrativo/src/simulator/` (Fase 2)

**Artefatos saída esperados:**

```
tooling/
├── verificador/
│   ├── verificar.py          # Script evoluído
│   ├── regras/
│   │   ├── t01_ids_unicos.py
│   │   ├── t02_referencias.py
│   │   └── ... (T-01 a T-21)
│   ├── testes/
│   │   └── test_verificador.py
│   └── README.md
├── simulador/
│   ├── src/
│   │   ├── index.ts          # CLI simulator
│   │   ├── reporter.ts       # Relatório HTML/JSON
│   │   └── policies.ts       # 5 políticas (reusa motor)
│   ├── tests/
│   │   └── simulator.test.ts
│   └── package.json
└── fixtures/
    └── negativos/            # 13 catálogos quebrados
        ├── 01-id-duplicado.json
        ├── 02-referencia-quebrada.json
        └── ... (T-01 a T-13)
```

**Comandos verificação:**

```bash
# Verificador Python
cd tooling/verificador
python verificar.py ../../content/campanhas/espinha/

# Simulador TS
cd tooling/simulador
pnpm simulate --catalog ../../content/campanhas/espinha/manifest.json --runs 50 --policy constante
```

**Dependências externas:**

- Python 3.10+ (verificador)
- `@forja/motor-narrativo` (simulador reutiliza)

---

## 1. Verificador Python

### Tarefa 4.1: Estrutura Base

**Agente:** `bash` + `write`
**Ações:**

```bash
mkdir -p tooling/verificador/regras tooling/verificador/testes
cd tooling/verificador
python -m venv venv
source venv/bin/activate  # Linux/Mac
# venv\Scripts\activate   # Windows
pip install pytest click rich
```

**Arquivo:** `tooling/verificador/verificar.py`
**CLI:**

```python
import click
from pathlib import Path
from regras import *

@click.command()
@click.argument('catalog_path', type=click.Path(exists=True))
def verificar(catalog_path: str):
    """Verifica catálogo contra regras T-01 a T-21."""
    catalog = carregar_catalogo(Path(catalog_path))

    regras = [
        T01_IdsUnicos(),
        T02_ReferenciasValidas(),
        # ... T-03 a T-21
    ]

    erros = []
    for regra in regras:
        resultado = regra.verificar(catalog)
        if not resultado.sucesso:
            erros.extend(resultado.erros)

    if erros:
        print(f"❌ {len(erros)} erros encontrados:")
        for erro in erros:
            print(f"  - {erro}")
        exit(1)
    else:
        print("✅ Catálogo válido (T-01 a T-21 passando)")
        exit(0)

if __name__ == '__main__':
    verificar()
```

**Verificação:** `python verificar.py --help` mostra ajuda.

---

### Tarefa 4.2: Regras T-01 a T-21

**Agente:** `write`
**Arquivos:** `tooling/verificador/regras/*.py`
**Implementar:**

- **T-01:** IDs únicos (sem duplicatas)
- **T-02:** Referências válidas (qualidades, entidades existem)
- **T-03:** Predicados bem-formados (operadores válidos)
- **T-04:** Capítulos sequenciais (1, 2, 3, sem pulos)
- **T-05:** Subclasses válidas (ausencia, marco, sessao, null)
- **T-06:** Bandas válidas (Espinha, Arco, Cor)
- **T-07:** Reconhecimento (ao menos 1 Espinha + st_cor_fallback)
- **T-08 a T-21:** Outras propriedades ESPEC §7.2

**Padrão:**

```python
class T01_IdsUnicos:
    def verificar(self, catalog: dict) -> Resultado:
        ids = [st['id'] for st in catalog['storylets']]
        duplicados = [id for id in ids if ids.count(id) > 1]

        if duplicados:
            return Resultado(
                sucesso=False,
                erros=[f"T-01: ID duplicado: {id}" for id in set(duplicados)]
            )
        return Resultado(sucesso=True, erros=[])
```

**Teste:** `tooling/verificador/testes/test_verificador.py` — rodar contra fixtures negativos
**Verificação:** `pytest` passa.

---

## 2. Simulador TypeScript

### Tarefa 4.3: CLI Simulador

**Agente:** `bash` + `write`
**Setup:**

```bash
mkdir -p tooling/simulador/src tooling/simulador/tests
cd tooling/simulador
pnpm init
pnpm add -D typescript vitest
pnpm add commander chalk @forja/motor-narrativo
```

**Arquivo:** `src/index.ts`

```typescript
#!/usr/bin/env node
import { Command } from 'commander';
import { simulate } from '@forja/motor-narrativo';
import { readFileSync } from 'fs';
import { Reporter } from './reporter';

const program = new Command();

program
  .name('simulate')
  .description('Simula M resoluções com política')
  .requiredOption('--catalog <path>', 'Caminho catálogo JSON')
  .requiredOption('--runs <n>', 'Número resoluções', parseInt)
  .requiredOption(
    '--policy <name>',
    'Política: constante|erratico|especialista|pessimo|intermitente'
  )
  .option('--seed <n>', 'Seed inicial', parseInt, 42)
  .option('--output <path>', 'Relatório HTML (opcional)')
  .action((opts) => {
    const catalog = JSON.parse(readFileSync(opts.catalog, 'utf-8'));
    const report = simulate(catalog, opts.seed, opts.runs, opts.policy);

    const reporter = new Reporter(report);
    reporter.printConsole();

    if (opts.output) {
      reporter.saveHTML(opts.output);
    }
  });

program.parse();
```

**Verificação:** `pnpm simulate --catalog ../../content/test.json --runs 50 --policy constante` roda.

---

### Tarefa 4.4: Reporter

**Agente:** `write`
**Arquivo:** `src/reporter.ts`

```typescript
import { SimulationReport } from '@forja/motor-narrativo';
import chalk from 'chalk';

export class Reporter {
  constructor(private report: SimulationReport) {}

  printConsole() {
    const { vistos, nunca_vistos, razao_vistos_escritos } = this.report;

    console.log(chalk.bold('\n📊 Relatório de Simulação\n'));
    console.log(`Resoluções: ${this.report.resolutions.length}`);
    console.log(`Vistos: ${vistos.length}`);
    console.log(`Nunca vistos: ${nunca_vistos.length}`);
    console.log(`Razão vistos/escritos: ${(razao_vistos_escritos * 100).toFixed(1)}%`);

    if (razao_vistos_escritos < 0.15 || razao_vistos_escritos > 0.3) {
      console.log(chalk.yellow('\n⚠️  Razão fora intervalo esperado (15%-30%)'));
    } else {
      console.log(chalk.green('\n✅ Razão dentro do esperado'));
    }

    if (nunca_vistos.length > 0) {
      console.log(chalk.dim(`\nNunca vistos: ${nunca_vistos.join(', ')}`));
    }
  }

  saveHTML(path: string) {
    const html = `
      <!DOCTYPE html>
      <html>
      <head><title>Simulação</title></head>
      <body>
        <h1>Relatório</h1>
        <p>Razão: ${(this.report.razao_vistos_escritos * 100).toFixed(1)}%</p>
        <h2>Nunca vistos (${this.report.nunca_vistos.length})</h2>
        <ul>${this.report.nunca_vistos.map((id) => `<li>${id}</li>`).join('')}</ul>
      </body>
      </html>
    `;
    require('fs').writeFileSync(path, html);
    console.log(chalk.green(`\n💾 Relatório salvo: ${path}`));
  }
}
```

**Verificação:** Relatório exibe razão 15%-30%.

---

## 3. Fixtures Negativas

### Tarefa 4.5: Catálogos Quebrados

**Agente:** `write`
**Arquivos:** `tooling/fixtures/negativos/*.json`
**Criar 13 fixtures:**

1. **01-id-duplicado.json:** 2 storylets com mesmo ID
2. **02-referencia-quebrada.json:** Predicado referencia qualidade inexistente
3. **03-banda-invalida.json:** `banda: "Invalida"`
4. **04-subclasse-invalida.json:** `subclasse: "invalida"`
5. **05-capitulo-pulo.json:** Cap 1, cap 3 (sem cap 2)
6. **06-sem-espinha.json:** Só Arco e Cor (sem Espinha)
7. **07-sem-fallback.json:** Sem `st_cor_fallback`
8. **08-predicado-malformado.json:** Operador inválido `"op": ">>"`
9. **09-variante-sem-texto.json:** Variante sem campo `texto`
10. **10-efeitos-invalidos.json:** Efeito referencia qualidade inválida
11. **11-circular-reference.json:** Predicado circular (A requer B, B requer A)
12. **12-vazio.json:** Catálogo vazio (sem storylets)
13. **13-json-invalido.json:** JSON malformado (vírgula extra)

**Teste:** `verificar.py` detecta erro específico em cada fixture
**Verificação:** `pytest tooling/verificador/testes/test_negativos.py` passa.

---

## 4. Critérios Gate

- [ ] `verificar.py` roda contra catálogo válido sem erros
- [ ] Regras T-01 a T-21 implementadas
- [ ] Simulador gera relatório 5 políticas × M=50
- [ ] Razão vistos/escritos 15%-30% em catálogo sintético
- [ ] 13 fixtures negativas detectam erros corretos
- [ ] CI roda `verificar.py` automaticamente
- [ ] Tag `fase-4-completa`

---

## 5. Checklist Saída

- [ ] `tooling/verificador/` funcional
- [ ] `tooling/simulador/` funcional
- [ ] Fixtures negativas criadas
- [ ] CI rodando verificação
- [ ] README em ambas pastas
- [ ] Tag `fase-4-completa`

**Próxima fase:** Fase 5 (API Backend) — 1.5 semanas
