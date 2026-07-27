# Riscos e Mitigações — FORJA

**Versão:** 1.0  
**Data:** 26/07/2026  
**Fonte:** PRD v0.14 (R-001 a R-036) + análise técnica

---

## 1. Matriz de Classificação

| Probabilidade         | Impacto Baixo | Impacto Médio | Impacto Alto     | Impacto Crítico  |
| --------------------- | ------------- | ------------- | ---------------- | ---------------- |
| **Muito Alta (>70%)** | 🟡 Monitorar  | 🟠 Mitigar    | 🔴 Ação imediata | 🔴 Ação imediata |
| **Alta (40-70%)**     | 🟢 Aceitar    | 🟡 Monitorar  | 🟠 Mitigar       | 🔴 Ação imediata |
| **Média (15-40%)**    | 🟢 Aceitar    | 🟢 Aceitar    | 🟡 Monitorar     | 🟠 Mitigar       |
| **Baixa (<15%)**      | 🟢 Aceitar    | 🟢 Aceitar    | 🟢 Aceitar       | 🟡 Monitorar     |

---

## 2. Riscos de Validação (Bloqueantes)

### R-001: Narrativa Não Envolve 🔴

**Probabilidade:** Média (30%)  
**Impacto:** Crítico  
**Descrição:** Testes bloqueantes (§14) falham; produto não é lançado.

**Indicadores:**

- Teste de leitura: <2 em 3 leitores conseguem resumir história
- Teste do card: <1 em 5 pergunta "que app é esse?"

**Mitigação:**

- [ ] Escrever 26 storylets antes de fase 10
- [ ] Rodar simulador (M=50, 5 políticas) para detectar deadlocks
- [ ] Revisão narrativa por roteirista externo (opcional, pós-F4)
- [ ] Se falhar leitura: retrabalhar narrativa (motor OK)
- [ ] Se falhar card: decisão GO/NO-GO explícita

**Plano B:** Lançar sem viral, depender de SEO + boca a boca.

---

### R-002: Deadlock Narrativo 🟠

**Probabilidade:** Média (25%)  
**Impacto:** Alto  
**Descrição:** Regras ESPEC criam cenário onde nenhum storylet é elegível.

**Indicadores:**

- Simulador falha (crash ou loop infinito)
- Razão vistos/escritos fora de 0.15-0.3
- Storylets nunca vistos >30%

**Mitigação:**

- [x] Compilar ESPEC §6-7 (regras determinísticas)
- [ ] Implementar RF-025 (storylet fallback sempre elegível)
- [ ] Simulador obrigatório em CI (F4)
- [ ] Rodar M=50 × 5 políticas antes de release
- [ ] T-22: verificar fallback nunca é único storylet com freq>1

**Plano B:** Relaxar pré-requisitos em fallbacks até garantir elegibilidade.

---

### R-003: Teste de Cobertura Falha 🟡

**Probabilidade:** Baixa (10%)  
**Impacto:** Médio  
**Descrição:** `cobertura.py` reporta lacuna de teste não detectada.

**Mitigação:**

- [ ] Rodar `cobertura.py` a cada PR em `packages/motor-narrativo/`
- [ ] Exigir 100% cobertura RF/RN antes de M9
- [ ] Revisão manual de BDD features vs PRD

**Plano B:** Priorizar testes críticos, aceitar gaps em features não-críticas.

---

## 3. Riscos Técnicos

### R-010: Evento Sourcing Corrompe Estado 🔴

**Probabilidade:** Baixa (10%)  
**Impacto:** Crítico  
**Descrição:** Replay de `diary_events` gera estado diferente do snapshot.

**Indicadores:**

- Atributos divergem após sync
- Crash ao recalcular ficha
- Progressão inconsistente

**Mitigação:**

- [ ] ADR-0002: snapshot é cache, log é fonte
- [ ] Testes unitários: replay vs snapshot
- [ ] Validação no sync: recalc completo, comparar com snapshot
- [ ] Se divergir: apagar snapshot, recalc from scratch
- [ ] Versionamento de eventos (`v` em schema)

**Plano B:** Rollback de release, migração forçada.

---

### R-011: Motor Narrativo Impuro 🟠

**Probabilidade:** Média (20%)  
**Impacto:** Alto  
**Descrição:** Resolução depende de I/O, timestamp não-determinístico, quebra RF-036.

**Indicadores:**

- Mesma seed gera resultados diferentes
- Testes flaky
- Simulador não reproduz bugs

**Mitigação:**

- [x] D-033: isolar motor, sem deps de UI/Node/plataforma
- [ ] Forçar assinatura `resolve(state, inputs, seed) → result`
- [ ] Lint rule: proibir `Date.now()`, `Math.random()` sem seed
- [ ] Testes property-based (mesma seed = mesmo output)

**Plano B:** Refatorar motor, pode atrasar F2.

---

### R-012: Sync Conflito 🟡

**Probabilidade:** Média (30%)  
**Impacto:** Médio  
**Descrição:** Usuário registra sessão offline em device A e B; merge falha.

**Mitigação:**

- [ ] Postgres: `created_at` com microsegundos
- [ ] Ordenação estável por (timestamp, device_id, sequence)
- [ ] Conflict resolution: aceitar ambos eventos, recalc
- [ ] UI: avisar se detectar timestamps muito próximos (<5min)

**Plano B:** Pedir usuário escolher versão; exportar ambas.

---

### R-013: Kill-Switch Falha 🟢

**Probabilidade:** Baixa (5%)  
**Impacto:** Médio  
**Descrição:** CDN cai ou app não consegue buscar kill-switch.

**Mitigação:**

- [x] ADR-0004: nunca desabilita Espinha
- [ ] Timeout 3s, fallback sem travamento
- [ ] Limitar 1 requisição/24h + jitter 6h
- [ ] Cache local do último estado conhecido

**Plano B:** Hotfix via app store (último recurso).

---

### R-014: RLS Bypassed 🔴

**Probabilidade:** Muito Baixa (3%)  
**Impacto:** Crítico  
**Descrição:** Vazamento de dados entre usuários por falha em RLS.

**Mitigação:**

- [ ] Testes automatizados: criar 2 users, tentar ler diary do outro
- [ ] Code review obrigatório em migrations
- [ ] Nunca usar `service_role` no client
- [ ] Audit log de acessos suspeitos (queries cross-user)

**Plano B:** Desligar API, rollback de migration, notificar afetados (LGPD art. 48).

---

### R-015: Wearable Data Leak 🟢

**Probabilidade:** Baixa (10%)  
**Impacto:** Baixo  
**Descrição:** Integração futura com wearable expõe dados sensíveis.

**Mitigação:**

- [x] D-003: adiar wearable para v2
- [ ] Quando implementar: não armazenar frequência cardíaca, GPS, sono
- [ ] Apenas duração + tipo (já consentidos)

**Plano B:** Não aplicável (fora do MVP).

---

## 4. Riscos de Arquitetura

### R-020: Monorepo Overhead 🟡

**Probabilidade:** Alta (50%)  
**Impacto:** Médio  
**Descrição:** Turborepo + pnpm workspaces complexifica setup inicial.

**Mitigação:**

- [x] ADR-0001, ADR-0008: justificado (compartilhar domínio)
- [ ] Documentar setup em `docs/setup/README.md`
- [ ] Scripts `pnpm setup`, `pnpm dev`, `pnpm test` na raiz
- [ ] Cache de Turborepo em CI (economizar tempo)

**Plano B:** Se atrasar >1 semana, considerar mono-app com pastas.

---

### R-021: React Native Web Limita Web 🟡

**Probabilidade:** Média (30%)  
**Impacto:** Médio  
**Descrição:** Experiência web inferior por limitações de RNW.

**Mitigação:**

- [x] ADR-0008: escolha consciente (reuso >100%)
- [ ] Aceitar limitações (sem hover states complexos, etc.)
- [ ] Priorizar mobile (D-012)
- [ ] Se crítico: criar componentes web-specific

**Plano B:** Adiar web (F7) para v1.1, focar mobile.

---

### R-022: NestJS Overkill 🟢

**Probabilidade:** Baixa (15%)  
**Impacto:** Baixo  
**Descrição:** API tem poucos endpoints; NestJS adiciona complexidade desnecessária.

**Mitigação:**

- [x] ADR-0003: preparado para crescer (v2 com dashboards, etc.)
- [ ] Aceitar overhead inicial
- [ ] Usar módulos simples, sem microservices

**Plano B:** Migrar para Fastify puro se necessário (pouco provável).

---

### R-023: Supabase Vendor Lock-In 🟡

**Probabilidade:** Média (20%)  
**Impacto:** Médio  
**Descrição:** Difícil migrar de Supabase para Postgres gerenciado.

**Mitigação:**

- [ ] Usar apenas features SQL padrão (não Supabase-specific)
- [ ] RLS é Postgres nativo, portável
- [ ] Evitar Supabase Functions, Storage (usar API NestJS)
- [ ] Migrations em SQL puro

**Plano B:** Migração para RDS/CloudSQL é trabalhosa mas viável.

---

## 5. Riscos de Conteúdo

### R-030: Storylets Insuficientes 🟠

**Probabilidade:** Média (25%)  
**Impacto:** Alto  
**Descrição:** Capítulo 1 com <26 storylets; experiência repetitiva.

**Indicadores:**

- Razão vistos/escritos >0.35
- Mesmos storylets aparecem 3+ vezes em 1 ciclo
- Simulador: >50% de 50 travessias veem <15 storylets únicos

**Mitigação:**

- [ ] Meta: 26 storylets antes de F10
- [ ] Simulador detecta repetitividade (T-23)
- [ ] Se <26: considerar reduzir cap 1 para 3 blocos (vs 4)

**Plano B:** Aceitar repetição, avisar no onboarding "campanha curta".

---

### R-031: Conteúdo Sensível Não Revisado 🟠

**Probabilidade:** Alta (60%)  
**Impacto:** Alto  
**Descrição:** Prosa contém linguagem de julgamento, imperativo, gatilhos.

**Mitigação:**

- [ ] RE-009: checklist antes de commit
- [ ] Revisão por profissional de educação física (RE-005)
- [ ] Revisão por pessoa com histórico de TCA (opcional)
- [ ] Buscar padrões: "você deve", "tem que", "vai", "gordura", "peso"

**Plano B:** Patch de conteúdo pós-launch se reportado.

---

### R-032: Lacunas ESPEC Não Resolvidas 🔴

**Probabilidade:** Média (30%)  
**Impacto:** Crítico  
**Descrição:** 11 lacunas (LAC-01 a LAC-11) + 5 defeitos (DEF-01 a DEF-05) bloqueiam Fase 1.

**Status:**

- [x] LAC-01: resolvido (D-040 — 1 campanha apenas)
- [x] DEF-01: resolvido (D-043 — K dinâmico 60%)
- [x] LAC-02: resolvido (D-042 — Trégua retroativa via replay)
- [ ] LAC-03 a LAC-11: pendente
- [ ] DEF-02 a DEF-05: pendente

**Mitigação:**

- [ ] Fase 0 dedicada a reconciliação (Semana 1-2)
- [ ] Cada lacuna/defeito = issue GitHub
- [ ] Decisões documentadas em `DECISOES-IMPLEMENTACAO.md`
- [ ] Gate: F0 não termina até 100% resolvido

**Plano B:** Nenhum. Bloqueante absoluto.

---

## 6. Riscos de Cronograma

### R-040: Fase 0 Estoura Prazo 🟠

**Probabilidade:** Alta (50%)  
**Impacto:** Alto  
**Descrição:** Reconciliação de lacunas leva >2 semanas.

**Mitigação:**

- [ ] Timebox: 2 semanas hard limit
- [ ] Priorizar defeitos (bloqueantes) > lacunas (escolhas)
- [ ] Se estoura: tomar decisões rápidas, documentar trade-offs

**Plano B:** Estender F0 em 1 semana, comprimir F5 (sync pode ser v1.1).

---

### R-041: Testes M/T Flaky 🟡

**Probabilidade:** Alta (60%)  
**Impacto:** Médio  
**Descrição:** Testes de simulador/verificador falham intermitentemente.

**Mitigação:**

- [ ] Seeds fixas em todos testes
- [ ] Evitar timeouts, usar mocks
- [ ] Retry flaky tests 3x antes de falhar build
- [ ] Log detalhado em falhas (seed, estado, stacktrace)

**Plano B:** Isolar testes flaky, rodar manualmente antes de release.

---

### R-042: Integração Mobile Atrasa 🟡

**Probabilidade:** Média (35%)  
**Impakto:** Médio  
**Descrição:** Expo/EAS Build, permissões iOS, TestFlight atrasam F8.

**Mitigação:**

- [ ] Começar F8 (Mobile) cedo (paralelo a F6)
- [ ] Conta Apple Developer pronta antes de F8
- [ ] TestFlight pode demorar 24-48h review

**Plano B:** Lançar Web (F7) primeiro, mobile em v1.1.

---

### R-043: Testes Bloqueantes Indisponíveis 🔴

**Probabilidade:** Média (25%)  
**Impacto:** Crítico  
**Descrição:** Não consegue recrutar 3 leitores ou 5 pessoas para card test.

**Mitigação:**

- [ ] Planejar recrutamento em F9 (Semana 15)
- [ ] Opções: comunidades fitness, Reddit, amigos, Discord
- [ ] Se falhar: validar com amostra menor (2 leitores, 3 para card)

**Plano B:** Lançar sem validação externa, assumir risco.

---

## 7. Riscos de Conformidade

### R-050: LGPD Não-Conformidade 🔴

**Probabilidade:** Baixa (10%)  
**Impakto:** Crítico  
**Descrição:** Falha em RC-001 a RC-009; app pode ser removido da loja.

**Mitigação:**

- [ ] Parecer jurídico antes de M9
- [ ] Checklist LGPD em code review
- [ ] Testes: RF-091 (export), RF-092 (delete), RC-001 (consentimento)
- [ ] Política de privacidade + Termos publicados antes de M9

**Plano B:** Não lançar até conformidade garantida.

---

### R-051: Consentimento Ambíguo 🟠

**Probabilidade:** Média (20%)  
**Impakto:** Alto  
**Descrição:** Texto de consentimento não é "específico + destacado" (art. 11 LGPD).

**Mitigação:**

- [ ] Revisar copy com advogado especializado
- [ ] Separar consentimento de dados de saúde de outros dados
- [ ] Aceitar sem dados de saúde = app funciona (só sem PSE)

**Plano B:** Patch de tela de onboarding pós-launch.

---

### R-052: Exclusão Não Funciona 🔴

**Probabilidade:** Baixa (5%)  
**Impakto:** Crítico  
**Descrição:** RF-092 falha; dados não são apagados em 15 dias.

**Mitigação:**

- [ ] Job diário em Supabase Edge Functions
- [ ] Testes: criar conta, deletar, verificar 15 dias depois
- [ ] Logs: `deletion_requests.status` rastreável

**Plano B:** Executar deleções manualmente até fix.

---

## 8. Riscos de Operação

### R-060: CDN/Supabase Indisponível 🟢

**Probabilidade:** Baixa (5%)  
**Impakto:** Médio  
**Descrição:** Infraestrutura terceira cai; app offline-only por horas.

**Mitigação:**

- [x] D-008: offline-first (app funciona sem backend)
- [ ] Monitoramento: Uptime Robot em API + CDN
- [ ] SLA Supabase: 99.9% uptime

**Plano B:** Aguardar recuperação; app continua funcional localmente.

---

### R-061: Falta Monitoramento 🟡

**Probabilidade:** Alta (70%)  
**Impakto:** Médio  
**Descrição:** Bugs em produção não são detectados rapidamente.

**Mitigação:**

- [ ] Sentry no mobile + web + API (F9)
- [ ] Supabase logs para erros de RLS/sync
- [ ] Métricas: taxa de sync, crashes, tempo de resolução

**Plano B:** Depender de reports de usuários (aceitável para MVP).

---

### R-062: App Store Rejeição 🟡

**Probabilidade:** Média (30%)  
**Impakto:** Médio  
**Descrição:** Apple/Google rejeitam app por violação de guidelines.

**Mitigação:**

- [ ] Revisar guidelines antes de submit:
  - Apple: Health & Fitness (não prometer cura, não substituir médico)
  - Google: Sensitive Data (consentimento explícito)
- [ ] Disclaimer: "não substitui orientação profissional" (RE-005)
- [ ] Testar em TestFlight/Internal Testing antes de produção

**Plano B:** Ajustar copy/funcionalidade e resubmit (pode levar 1 semana).

---

## 9. Mitigações Gerais

### 9.1 Desenvolvimento

- **Gate de qualidade obrigatório:** RN-029 (suítes em CI, release bloqueado)
- **Testes antes de features:** BDD features escritas antes de código
- **Code review:** 100% do código (solo dev = AI review via OpenCode)
- **Linting rígido:** ESLint, Prettier, TypeScript strict mode
- **ADRs:** Decisões arquiteturais documentadas

### 9.2 Conteúdo

- **Verificador automático:** `verificar.py` + `cobertura.py` em CI
- **Simulador obrigatório:** Rodar M=50 antes de cada release
- **Revisão externa:** Profissional de educação física (RE-005)
- **Versionamento:** Protótipo versionado junto com código

### 9.3 Operação

- **Offline-first:** D-008 (app nunca trava por falta de rede)
- **Kill-switch:** ADR-0004 (desliga campanha, nunca Espinha)
- **Rollback rápido:** Git tags, possibilidade de voltar versão
- **Monitoramento:** Sentry + Supabase logs

---

## 10. Riscos Aceitos

Riscos de **probabilidade baixa + impacto baixo/médio** são aceitos sem mitigação:

| Risco                        | Probabilidade | Impacto | Justificativa                 |
| ---------------------------- | ------------- | ------- | ----------------------------- |
| Modo escuro faltando         | Alta          | Baixo   | Não é RF, pode ser v1.1       |
| Push notifications avançadas | Alta          | Baixo   | Local notification suficiente |
| E2E tests manuais            | Alta          | Baixo   | Testes unitários + BDD cobrem |
| Web experience inferior      | Média         | Médio   | ADR-0008 trade-off consciente |
| Supabase vendor lock-in      | Média         | Médio   | Migração viável se necessário |

---

## 11. Dashboard de Risco (Para Tracking)

| Fase    | Riscos Críticos | Riscos Altos | Mitigação Obrigatória             |
| ------- | --------------- | ------------ | --------------------------------- |
| **F0**  | R-032           | R-040        | Resolver lacunas/defeitos 100%    |
| **F1**  | —               | —            | Nenhuma (setup)                   |
| **F2**  | R-010, R-011    | R-002        | Testes de purity + event sourcing |
| **F3**  | —               | —            | Nenhuma (UI)                      |
| **F4**  | R-032           | R-030        | Simulador + verificador passando  |
| **F5**  | R-010           | R-012        | Sync com conflict resolution      |
| **F6**  | R-014           | —            | Testes de RLS                     |
| **F7**  | —               | R-021        | Aceitar limitações RNW            |
| **F8**  | —               | R-042        | TestFlight/Internal Testing       |
| **F9**  | R-050, R-052    | R-051, R-031 | LGPD + revisão conteúdo           |
| **F10** | R-001, R-043    | —            | Testes bloqueantes                |

---

**Última atualização:** 26/07/2026  
**Próxima revisão:** Após cada fase (atualizar status de mitigação)
