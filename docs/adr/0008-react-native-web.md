# ADR-0008: React Native Web para reaproveitar UI entre mobile e web

- **Status:** Aceita
- **Contexto:** A decisão de produto foi ter um "cliente completo" jogável na web, com design mobile-friendly, e não apenas um portal de conta. Isso cria risco de duplicar a camada de interface (não só a lógica, já endereçada pelo ADR-0001) entre mobile e web.
- **Decisão:** Usar React Native Web para as telas de jogo (ficha, registro de sessão, resolução de storylet, diário) dentro do app Next.js, compartilhando componentes com o app Expo/React Native onde a experiência é a mesma. Páginas que são exclusivamente web (marketing, checkout Stripe, páginas de conta) ficam em Next.js puro, fora do escopo compartilhado.
- **Consequências:**
  - Positivas: uma única implementação de tela de jogo a manter e testar visualmente; consistência de experiência entre plataformas, que é importante para um produto cujo ativo central é a narrativa, não a plataforma.
  - Negativas: React Native Web tem limitações de fidelidade visual e de performance em cenários muito específicos de web (não é o caso aqui, dado que a UI de jogo é majoritariamente formulários e texto); exige atenção redobrada a acessibilidade web, que React Native Web não resolve automaticamente.
- **Alternativas consideradas:**
  - Duas implementações de UI independentes (React puro na web, React Native no mobile) — descartada por duplicar esforço de manutenção de UI, o que R-002 já sinaliza como risco de tempo do projeto.
- **Referências:** decisão de produto (cliente web completo, mobile-friendly).
