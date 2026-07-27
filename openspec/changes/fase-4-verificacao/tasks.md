## 1. Verificador Python — estrutura base

- [x] 1.1 Criar `tooling/verificador/{regras,testes}` e `tooling/verificador/README.md`
- [x] 1.2 Portar lógica reaproveitável de `docs/prd/verificar.py` para `tooling/verificador/verificar.py` (CLI `click`, carrega catálogo, roda lista de regras, imprime erros, exit code) — reescrito para o schema real de `packages/motor-narrativo/src/types.ts` (`qual`/`op`/`valor`, não `q`/`eq`/`todos` do protótipo antigo)
- [x] 1.3 Adicionar `requirements.txt`/`pyproject.toml` com `click`, `rich`, `pytest`
- [x] 1.4 Verificar: `python tooling/verificador/verificar.py --help` funciona

## 2. Verificador Python — regras T-01 a T-21

- [x] 2.1 Implementar T-01 (IDs únicos) e T-02 (nenhum efeito escreve in./sys./cap.)
- [x] 2.2 Implementar T-03 (tipos/operadores válidos) e T-04 (profundidade de predicado ≤ 3) — nomes T-03/T-04 seguem a tabela real da ESPEC §7.2 (que difere da paráfrase deste doc de fase; ver README para a divergência)
- [x] 2.3 Implementar T-05 (variante de fallback) e T-07 (reconhecimento: Espinha + st_cor_fallback) — T-06 (entidades) e capítulos/bandas/subclasses viraram regras de sanidade de esquema SCH-01/02/03 porque o catálogo real não declara lista de entidades separada (ver Limitações no README)
- [x] 2.4 T-07 implementado junto ao item anterior
- [x] 2.5 Implementar T-08 (leitura sem escrita) e T-14 (ASCII minúsculo)
- [x] 2.6 Implementar T-18 (camada neutra), T-19 (domínio arco.tom aproximado) e T-21 (fechamento de complicação) — T-15/T-20 estão aposentadas na ESPEC v2.6 (não implementar); T-17 fica documentado como limitação (depende de K em runtime)
- [x] 2.7 Registrar todas as regras em `regras/__init__.py` (`REGRAS`)

## 3. Fixtures negativas (T-01 a T-13)

- [x] 3.1 Criar `01-id-duplicado.json` a `05-capitulo-pulo.json`
- [x] 3.2 Criar `06-sem-espinha.json` a `09-variante-sem-texto.json`
- [x] 3.3 Criar `10-efeitos-invalidos.json` a `13-json-invalido.json`
- [x] 3.4 Escrever `tooling/verificador/testes/test_negativos.py` — cada fixture dispara exatamente sua regra esperada (exceto 12-vazio, que necessariamente também falha T-07 — documentado no próprio teste)
- [x] 3.5 Escrever `tooling/verificador/testes/test_verificador.py` — catálogo válido passa sem erros
- [x] 3.6 Verificar: `pytest tooling/verificador` passa 100% (14/14)

## 4. Simulador TypeScript — CLI

- [x] 4.1 Checar exports de `packages/motor-narrativo/src/index.ts` — `simulate`/`SimulationReport`/`Policy` já públicos; descoberto que só 3/5 políticas estavam implementadas em `simulator/policies.ts` (faltavam `especialista`/`pessimo`) — adicionadas separadamente com testes unitários
- [x] 4.2 Criar `tooling/simulador/` com `package.json`, `tsconfig.json`, `@forja/motor-narrativo: workspace:*`, `commander`, `chalk`, `vitest`; adicionado `tooling/*` ao `pnpm-workspace.yaml`
- [x] 4.3 Implementar `src/index.ts` + `src/core.ts` — CLI `simulate` com `--catalog`, `--runs`, `--policy`, `--seed` (default 42), `--output` opcional
- [x] 4.4 Implementar `src/reporter.ts` — `Reporter.printConsole()` e `Reporter.saveHTML(path)`
- [x] 4.5 Verificar: `pnpm --filter tooling-simulador run simulate -- --catalog <fixture> --runs 50 --policy constante` roda e imprime relatório

## 5. Simulador TypeScript — testes

- [x] 5.1 Catálogo sintético criado em `tooling/simulador/tests/fixtures/catalogo-sintetico.json` (200 storylets de Cor) — fixtures existentes de `packages/motor-narrativo/tests/fixtures/` eram pequenas demais para produzir ratio na faixa 15%-30% com runs=50
- [x] 5.2 Escrever `tooling/simulador/tests/simulator.test.ts` — 5 políticas × runs=50, ratio 15%-30% confirmado
- [x] 5.3 Testar `--policy` inválido rejeita antes de simular
- [x] 5.4 Testar `--output` grava HTML válido com ratio e lista de never-seen
- [x] 5.5 Verificar: `pnpm --filter tooling-simulador run test` passa (7/7)

## 6. CI — atualizar conteudo.yml para tooling/

- [x] 6.1 Atualizar `docs/ci-cd/.github/workflows/conteudo.yml`: `python tooling/verificador/verificar.py`, paths incluem `tooling/verificador/**` e `tooling/simulador/**`
- [x] 6.2 Substituído o step do simulador para `pnpm --filter tooling-simulador run simulate -- --catalog ... --runs 50 --policy constante --output relatorio-simulacao.html`
- [x] 6.3 Ajustado upload de artifact para `tooling/simulador/relatorio-simulacao.html`
- [x] 6.4 `docs/prd/verificar.py` mantido (valida o documento-protótipo, não o catálogo real — escopo diferente) com nota explícita de que não é mais chamado pela CI
- [x] 6.5 Verificar: YAML válido (`yaml.safe_load` sem erro)

## 7. Documentação e gate

- [x] 7.1 Escrever `tooling/verificador/README.md` e `tooling/simulador/README.md`
- [x] 7.2 Rodar `python tooling/verificador/verificar.py` contra catálogo de teste sem erros
- [x] 7.3 Critérios do gate Fase 4 confirmados — ver resumo na entrega desta mudança; regras T-01–T-21 implementadas como subconjunto estático real (T06/T17 documentados como limitação, não fabricados)
- [ ] 7.4 Criar tag `fase-4-completa` — ação de repositório compartilhado; não executada automaticamente, aguardando confirmação explícita do usuário
