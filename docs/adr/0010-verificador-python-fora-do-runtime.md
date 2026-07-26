# ADR-0010: Verificador de conteúdo em Python mantido fora do runtime do motor

- **Status:** Aceita
- **Contexto:** Já existe um validador de conteúdo (`verificar.py`) que confere o catálogo de storylets contra as regras da ESPEC e as referências cruzadas do PRD, usado como lint de autoria. O motor de resolução em produção (`packages/motor-narrativo`) é implementado em TypeScript por exigência de compartilhamento entre mobile e web (ADR-0001).
- **Decisão:** Manter o `verificar.py` como estágio de lint de conteúdo pré-merge no CI (roda sobre o Markdown/JSON de autoria, antes de o catálogo ser embutido no bundle), separado das suítes de comportamento do motor (RF-103: suíte de catálogo e suíte de motor), que são escritas em TypeScript e testam o runtime que efetivamente vai para produção.
- **Consequências:**
  - Positivas: reaproveita uma ferramenta já validada sem reescrevê-la sem necessidade; separa claramente "o conteúdo está bem formado" (Python, tempo de autoria) de "o motor se comporta corretamente" (TypeScript, tempo de execução) — dois testes com propósitos diferentes.
  - Negativas: duas linguagens de tooling no CI (Python + TypeScript); risco de as duas suítes divergirem em regras com o tempo, exigindo revisão periódica para garantir que ambas ainda refletem a ESPEC vigente.
- **Alternativas consideradas:**
  - Reescrever o verificador em TypeScript para unificar a stack de tooling — considerada como melhoria futura, não bloqueante; adiada porque o script Python já funciona e reescrevê-lo sem necessidade seria o tipo de esforço de engenharia que R-002 pede para evitar.
- **Referências:** RF-100-103, D-032, R-002.
