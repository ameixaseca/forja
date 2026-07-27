# Banco de dados — FORJA (Supabase / PostgreSQL)

Estrutura lógica do banco, resultado da consulta entre a arquitetura (`../c4/`, `../adr/`) e a modelagem de dados. Ver também `../c4/05-modelo-dados-erd.md` para o diagrama entidade-relacionamento.

## Como aplicar

Com a [CLI do Supabase](https://supabase.com/docs/guides/cli):

```bash
supabase link --project-ref <seu-projeto>
supabase db push
```

Os arquivos em `migrations/` são numerados por timestamp e devem ser aplicados em ordem — cada um depende do anterior (tipos → funções → tabelas de referência → tabelas de usuário → grants finais).

> Se `20260726120000_extensoes_e_tipos.sql` falhar ao criar a extensão `pg_cron`, habilite-a manualmente em **Dashboard → Database → Extensions** e reaplique a migração.

## Princípios que guiaram o esquema

1. **O Postgres não guarda conteúdo de jogo.** Storylets, qualidades e entidades continuam embutidos no binário do cliente (D-036). O banco guarda só conta, progresso (como log de eventos) e conformidade.
2. **`diary_events` é a fonte de verdade; tudo o mais é projeção ou cache.** A ficha do personagem nunca é escrita diretamente — é sempre recalculada a partir do log de eventos pelo pacote `dominio`, do lado do cliente (ADR-0002). O único cache no banco (`campaign_instances.ultimo_snapshot`) é explicitamente não autoritativo.
3. **RLS é a barreira real, não a aplicação.** Toda tabela com dado de usuário tem Row Level Security habilitada com políticas explícitas por comando. Onde não existe política para um comando, esse comando fica bloqueado por padrão — reforçado com `REVOKE`/`GRANT` explícitos por clareza e auditoria (ADR-0012).
4. **Domínios que o PRD declara extensíveis usam tabela de referência, não enum.** `entitlement_origens` existe porque RF-111 exige que uma nova origem de compra não exija migração de dado existente — crescer uma tabela de referência é mais direto que gerenciar `ALTER TYPE ... ADD VALUE`.
5. **Retenção legal pode conviver com o direito de exclusão.** `purchase_receipts.user_id` usa `ON DELETE SET NULL` em vez de `CASCADE`: o registro financeiro tem obrigação de retenção (LGPD art. 16, I) que precede RF-092 para essa categoria específica de dado. `deletion_requests` não tem FK nenhuma, de propósito, para sobreviver como prova de conformidade à própria exclusão que registra.
6. **Kill-switch nunca é lido em runtime pelo banco.** `storylet_kill_switch` é só a fonte administrativa; o caminho de execução do cliente é sempre o arquivo estático no CDN, fora do perímetro autenticado (ADR-0004).

## Dois caminhos de acesso, mesma barreira

Como descrito no ADR-0011 e ADR-0012, o cliente pode alcançar estas tabelas de duas formas — ambas protegidas pelas mesmas políticas de RLS:

- **Direto via Supabase** (SDK/PostgREST), para sincronização de diário, consentimento e instâncias de campanha — operações onde o próprio `auth.uid()` do usuário já é toda a autorização necessária.
- **Via API NestJS**, reservada ao que exige segredo de servidor: validar recibo de compra junto a App Store/Play/Stripe (grava em `entitlements`/`purchase_receipts` usando a chave `service_role`, que ignora RLS) e nada mais — o expurgo de LGPD roda dentro do próprio Postgres via `pg_cron`, sem precisar da API.

## Tabelas

| Tabela                 | Papel                                           | Escrita por                   |
| ---------------------- | ----------------------------------------------- | ----------------------------- |
| `profiles`             | Perfil 1:1 com `auth.users`                     | usuário (próprio)             |
| `campanhas`            | Índice leve de campanhas publicadas             | só admin/release              |
| `campaign_instances`   | Uma partida de campanha por usuário             | usuário (próprio)             |
| `diary_events`         | Event store do diário — append-only             | usuário (próprio, só insert)  |
| `consent_events`       | Log de consentimento LGPD — append-only         | usuário (próprio, só insert)  |
| `entitlement_origens`  | Referência de origens de compra                 | só admin                      |
| `entitlements`         | Direito de acesso `{pacote, origem, validoAte}` | só `service_role`             |
| `purchase_receipts`    | Auditoria de recibos de compra                  | só `service_role`             |
| `deletion_requests`    | Solicitação de exclusão de conta (RF-092)       | usuário abre; sistema conclui |
| `storylet_kill_switch` | Fonte administrativa do kill-switch             | só `service_role`             |

## O que este esquema deliberadamente não tem

- Tabela de storylets/catálogo — vive no app (D-036).
- Assinatura recorrente — fora do MVP (D-026); o campo `entitlements.valido_ate` já existe para não exigir migração se isso mudar.
- Registro de motivo de Trégua de Recuperação — RC-002 proíbe coletar essa informação; não há coluna para isso em `diary_events.payload` por contrato (validado no schema Zod compartilhado, não no banco).
