# ADR-0006: PostgreSQL gerenciado com Row-Level Security e criptografia de campo

- **Status:** Aceita
- **Contexto:** Dado de treino é dado pessoal sensível de saúde (art. 5º, II, LGPD — RC-001) e o diário pode conter notas livres com conteúdo de saúde adjacente (RF-011). O sistema não tem margem para tratar segurança de dado sensível como responsabilidade só da camada de aplicação.
- **Decisão:** Usar PostgreSQL gerenciado (com criptografia de disco do provedor) como base de dados única. Habilitar Row-Level Security por `user_id` em todas as tabelas que carregam dado de usuário, como segunda camada de isolamento independente da lógica de aplicação. Aplicar criptografia de campo (envelope encryption por usuário) sobre os campos de texto livre do payload de eventos (`diary_events.payload->notas`).
- **Consequências:**
  - Positivas: uma falha de autorização na camada de aplicação (ex.: um bug de `WHERE user_id = ?` esquecido) não expõe dado de outro usuário, porque o banco também impõe o isolamento; um vazamento de backup ou snapshot não expõe texto livre em claro.
  - Negativas: RLS exige que toda conexão de aplicação carregue o `user_id` como contexto de sessão de forma disciplinada; criptografia de campo complica queries e agregações diretas sobre notas (aceitável, pois notas não são consultadas em agregado — só exportadas e lidas pelo próprio usuário).
- **Alternativas consideradas:**
  - Confiar apenas em checagem de autorização na aplicação — descartada por não oferecer defesa em profundidade para dado de saúde.
  - Banco por usuário/tenant isolado — descartada por overhead operacional desproporcional à escala esperada (§11.2, algumas centenas de usuários).
- **Referências:** RC-001, RF-011, RC-004.
