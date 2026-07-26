# ADR-0001: Monorepo com pacote compartilhado para o motor narrativo

- **Status:** Aceita
- **Contexto:** RF-036 exige que a resolução de storylet seja uma função pura (estado + entradas + índice → resolução), e agora o produto tem dois clientes completos (mobile e web) que precisam jogar a mesma campanha com o mesmo resultado para a mesma semente. Duplicar essa lógica em dois códigos-fonte quebraria o determinismo na primeira divergência de implementação, e violaria D-033 (o subsistema narrativo não conhece tela).
- **Decisão:** Estruturar o projeto como monorepo (pnpm workspaces + Turborepo), com o motor narrativo e as regras de domínio isolados em pacotes TypeScript puros (`packages/motor-narrativo`, `packages/dominio`), sem nenhuma dependência de React, Node ou APIs de plataforma. Mobile e web importam esses pacotes como biblioteca.
- **Consequências:**
  - Positivas: uma única implementação a testar (property-based tests cobrem os dois clientes de uma vez); simulador (RF-100-103) roda contra o mesmo código que vai para produção; elimina uma classe inteira de bugs de divergência.
  - Negativas: exige disciplina de build (Turborepo) e de versionamento interno; qualquer alteração no pacote obriga rebuild dos dois apps antes do release.
- **Alternativas consideradas:**
  - Reimplementar o motor separadamente em cada cliente — descartada por risco de divergência de comportamento e duplicação de esforço de manutenção.
  - Rodar o motor via WebAssembly compilado de uma única fonte (ex.: Rust) — descartada por custo de setup desproporcional ao porte do projeto (D-028, projeto autofinanciado, R-002).
- **Referências:** RF-035, RF-036, D-033, D-036.
