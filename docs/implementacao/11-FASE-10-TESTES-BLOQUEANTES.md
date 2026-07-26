# Fase 10: Testes Bloqueantes — FORJA

**Duração:** 2 semanas  
**Dependências:** Fase 6 (mobile funcional)  
**Objetivo:** Validação externa, decisão GO/NO-GO

---

## AI Agent Context

**Fonte verdade:**
- PRD §14 (testes bloqueantes)
- PRD §11.2 (critério parada)

**Artefatos entrada:**
- App mobile funcional (Fase 6)
- Protótipo cap 1 v0.2 (14 storylets)

**Artefatos saída:**
- `docs/validacao/teste-leitura-resultado.md`
- `docs/validacao/teste-card-resultado.md`
- **Decisão GO/NO-GO**

---

## Teste 1: Leitura (§14.1 PRD)

### Objetivo
Validar que storylets formam narrativa compreensível.

### Protocolo
1. Gerar 20 resoluções com protótipo cap 1
2. Extrair texto corrido (sem mecânica, só prosa)
3. Entregar a 3 leitores frios (não familiarizados com projeto)
4. Pedir resumo da história em 1-2 parágrafos

### Critério Sucesso
- **PASS:** 2+ de 3 leitores resumem história coerente
- **FAIL:** 0-1 de 3 leitores resumem → problema narrativo crítico

### Ação se FAIL
- Reescrever protótipo cap 1
- Rodar teste novamente
- **Não prosseguir** até passar

---

## Teste 2: Card (§14.2 PRD)

### Objetivo
Validar que artefato compartilhável gera curiosidade.

### Protocolo
1. Gerar 5 variações de artefato compartilhável (screenshot ficha + snippet narrativo)
2. Postar em r/Solo_Roleplaying (público anglófono, ~50k membros)
3. Aguardar 48h
4. Contar quantos comentários perguntam "que app é esse?"

### Critério Sucesso
- **PASS:** ≥1 em 5 posts gera pergunta sobre app
- **FAIL:** <1 em 5 → canal de aquisição não existe

### Ação se FAIL
- Repensar posicionamento
- Testar em outros subreddits (r/gamification, r/fitness)
- Considerar pivot se nenhum canal responder

---

## Decisão GO/NO-GO

### GO (ambos testes passam)
- ✅ Completar capítulo 1 (escrever 12 storylets restantes, meta 26 total)
- ✅ Preparar release staging
- ✅ Beta fechado (50 usuários)
- ✅ Submit lojas (iOS TestFlight, Android Beta)

### NO-GO Temporário (teste leitura falha)
- ⚠️ Reescrever protótipo
- ⚠️ Rodar teste novamente
- ⚠️ Não prosseguir até passar

### NO-GO Crítico (teste card falha)
- ❌ Canal de aquisição quebrado
- ❌ Reavaliar premissa "ficção autoral cria motivo"
- ❌ Possível pivot ou encerramento

---

## Tarefas

### Tarefa 10.1: Gerar 20 Resoluções
**Agente:** `bash`
```bash
cd tooling/simulador
pnpm simulate --catalog ../../content/campanhas/espinha/manifest.json --runs 20 --policy constante --output relatorio.json
```
**Extrair texto:**
```bash
node scripts/extract-text.js relatorio.json > texto-corrido.txt
```
**Verificação:** `texto-corrido.txt` tem ~20 parágrafos prosa.

---

### Tarefa 10.2: Recrutar Leitores
**Agente:** Humano (não automatizável)
**Canais:**
- r/BetaReaders
- Goodreads beta readers
- Contatos pessoais
**Critério:** Leitores não familiarizados com gamificação/fitness.

---

### Tarefa 10.3: Coletar Resumos
**Agente:** Humano
**Template email:**
```
Olá [Nome],

Gostaria da sua opinião sobre um texto experimental. Leia o anexo (20 parágrafos, ~5 min) e responda:

1. Resuma a história em 1-2 parágrafos.
2. Você conseguiu identificar uma trama?

Sem contexto adicional — apenas leia e responda.

Obrigado!
```
**Coletar:** 3 resumos.

---

### Tarefa 10.4: Avaliar Resultado Leitura
**Agente:** Humano
**Critério:**
- Resumo menciona elementos principais? (protagonista, conflito, progressão)
- História tem coerência mínima?
**Documentar:** `docs/validacao/teste-leitura-resultado.md`

---

### Tarefa 10.5: Gerar Cards
**Agente:** Design + screenshot
**5 variações:**
1. Ficha + snippet "Você alcançou Força 3"
2. Ficha + snippet "10 ciclos cumpridos"
3. Marco destacado + texto Marco
4. Estatísticas + snippet narrativo
5. Timeline ciclos + último storylet
**Postar:** r/Solo_Roleplaying (1 post/dia, 5 dias)
**Coletar:** Comentários em 48h.

---

### Tarefa 10.6: Avaliar Resultado Card
**Agente:** Humano
**Contar:** Comentários "what app is this?" ou variações
**Critério:** ≥1 em 5 posts
**Documentar:** `docs/validacao/teste-card-resultado.md`

---

### Tarefa 10.7: Decisão Final
**Agente:** Humano
**Input:** Resultados testes 1 e 2
**Output:** GO, NO-GO Temporário, ou NO-GO Crítico
**Documentar:** `docs/validacao/DECISAO-GO-NO-GO.md`

---

## Critérios Gate

- [ ] Teste leitura executado (3 leitores)
- [ ] Teste card executado (5 posts)
- [ ] Resultados documentados
- [ ] Decisão GO/NO-GO registrada
- [ ] Se GO: tag `mvp-validado`
- [ ] Se NO-GO: issue com próximos passos

---

## Próximos Passos (se GO)

1. Completar cap 1 (12 storylets restantes)
2. Beta fechado (50 users)
3. Submit TestFlight/Beta Android
4. Marketing landing page
5. Preparar lançamento público

**Fim do cronograma MVP.**
