# C4 — Nível 3: Componentes — Pacote compartilhado (motor narrativo + domínio)

```mermaid
C4Component
title Diagrama de Componentes — Pacote compartilhado

Container_Boundary(pacote, "Pacote compartilhado (packages/motor-narrativo, packages/dominio)") {
  Component(seletor, "Seletor de storylet", "TypeScript puro", "Supressão por entrada, filtragem, pressão, estratificação, sorteio sem reposição (ESPEC v2.6 §6.1)")
  Component(predicado, "Avaliador de predicado", "TypeScript puro", "Avalia árvores requer: todos / qualquer / nenhum")
  Component(efeitos, "Aplicador de efeitos", "TypeScript puro", "Aplica efeitos ao estado antes de compor o texto (RF-022)")
  Component(rng, "RNG determinístico", "TypeScript puro", "PRNG com seed explícita — idêntico em Hermes (mobile) e V8 (web)")
  Component(dominioRules, "Regras de domínio", "TypeScript puro", "Vontade, Fôlego, Marcos, ciclo, Juramento — RN e RF do PRD")
}

Container(mobile, "App Mobile", "Expo/React Native")
Container(web, "App Web", "Next.js")

Rel(mobile, seletor, "invoca a cada Rolagem de Resolução (RF-020)")
Rel(web, seletor, "invoca a cada Rolagem de Resolução (RF-020)")
Rel(seletor, predicado, "usa")
Rel(seletor, rng, "usa para sorteio sem reposição")
Rel(seletor, efeitos, "aplica efeitos do storylet escolhido")
Rel(dominioRules, efeitos, "fornece in.tregua, in.reencontro, in.sessao_secundaria (RF-030A)")
```

## Restrição de arquitetura (D-033, RF-035)

Nenhum componente deste pacote conhece treino, ficha, ciclo ou tela. A única forma de entrada é `estado + entradas + índice`; a única saída é `resolução`. Isso é o que torna o simulador (RF-100-103) e os testes de propriedade possíveis sem instanciar o app inteiro — e é o que garante paridade de comportamento entre mobile e web sem duplicar lógica (ver ADR-0001).
