# Testes de Mutação — FORJA

**Versão:** v1.0 | **Data:** Julho/2026

---

## 1. O que são testes de mutação

Testes de mutação avaliam a qualidade dos testes unitários introduzindo pequenas alterações sintáticas no código-fonte (mutantes) e verificando se os testes detectam essas alterações. Um mutante "morto" (killed) significa que algum teste falhou ao detectá-lo — o que é o comportamento desejado. Um mutante "sobrevivente" (survived) indica uma lacuna na suíte de testes: o código pode ser alterado sem que nenhum teste perceba.

O score de mutação é a razão entre mutantes mortos e o total de mutantes gerados. Um score de 100% significa que toda lógica do código está coberta por pelo menos um teste que detecta sua ausência ou alteração.

---

## 2. Ferramental

| Componente | Pacote | Versão |
|---|---|---|
| Core | `@stryker-mutator/core` | ^8.7.1 |
| Runner | `@stryker-mutator/vitest-runner` | ^8.7.1 |
| Executor de testes | `vitest` | ^1.x |

Configuração por pacote: `stryker.config.mjs` (ESM, `export default { ... }`).

---

## 3. Como rodar localmente

```bash
# Pacote dominio (recomendado para desenvolvimento)
pnpm --filter @forja/dominio run test:mutation

# Pacote motor-narrativo
pnpm --filter @forja/motor-narrativo run test:mutation

# Todos os pacotes via Turborepo
pnpm run test:mutation
```

O relatório HTML é gerado em `packages/<pkg>/reports/mutation/index.html`.

---

## 4. Thresholds por pacote

| Pacote | break | low | high | Observação |
|--------|-------|-----|------|------------|
| `@forja/dominio` | 60 | 70 | 80 | Portão ativo — CI falha abaixo de 60% |
| `@forja/motor-narrativo` | 0 | 50 | 80 | Placeholder — `resolve()` não implementado. Elevar para break=60 na Fase 2 |

- **break**: score abaixo deste valor encerra o processo com código de saída 1 (bloqueia CI)
- **low**: score abaixo deste valor exibe aviso em vermelho no relatório
- **high**: score acima deste valor exibe em verde

---

## 5. Relatório HTML

Após `stryker run`, abrir:

```
packages/dominio/reports/mutation/index.html
packages/motor-narrativo/reports/mutation/index.html
```

O relatório lista cada mutante com:
- **Killed** ✅ — detectado por algum teste (bom)
- **Survived** ❌ — não detectado = lacuna de teste (ruim, exige novo caso de teste)
- **No coverage** ⚠️ — nenhum teste sequer executa esse trecho de código

---

## 6. Como interpretar os resultados

### Mutante sobrevivente (Survived)

Indica que o código pode ser alterado sem que nenhum teste falhe. Ação: escrever um teste que cubra o comportamento específico que o mutante alterou.

Exemplo: se Stryker muda `>=` para `>` em `calcularProgressao` e nenhum teste falha, falta um caso de teste com `diasTreinados === diasJurados`.

### Sem cobertura (No coverage)

Indica que nenhum teste executa aquele trecho. Ação: escrever testes unitários para o caminho não coberto.

### Score 100%

Todos os mutantes foram detectados. Não significa que os testes são perfeitos — apenas que toda lógica presente tem pelo menos um teste que detecta sua alteração.

---

## 7. Portão de qualidade

**Definição de pronto para `@forja/dominio`:**

1. `pnpm --filter @forja/dominio run test` — todos os testes passam
2. `pnpm --filter @forja/dominio run test:mutation` — score ≥ 80% (break em 60%)
3. Nenhum mutante sobrevivente em funções de regra de negócio crítica (RN-001, RN-002, RN-006, RF-080, RF-082, RF-084)

**CI:** `.github/workflows/mutation-tests.yml` executa em push/PR para `packages/**`.

---

## 8. CI — GitHub Actions

Workflow: `.github/workflows/mutation-tests.yml`

- **Trigger:** push ou pull_request com mudanças em `packages/**`
- **Passos:** checkout → pnpm install → build → `pnpm run test:mutation`
- **Artefato:** relatório HTML enviado como artifact do workflow (disponível por 90 dias)

---

## 9. Adicionando testes de mutação a um novo pacote

1. Instalar dependências:
   ```bash
   pnpm --filter @forja/<pkg> add -D @stryker-mutator/core @stryker-mutator/vitest-runner
   ```

2. Criar `packages/<pkg>/stryker.config.mjs`:
   ```javascript
   export default {
     testRunner: 'vitest',
     plugins: ['@stryker-mutator/vitest-runner'],
     mutate: ['src/**/*.ts'],
     reporters: ['html', 'clear-text', 'progress'],
     htmlReporter: { fileName: 'reports/mutation/index.html' },
     thresholds: { break: 60, low: 70, high: 80 },
   };
   ```

3. Adicionar script ao `package.json`:
   ```json
   "test:mutation": "stryker run"
   ```

4. Verificar: `pnpm --filter @forja/<pkg> run test:mutation`

---

_Documento vivo. Alterações nos thresholds exigem entrada correspondente em `decisoes.md`._
