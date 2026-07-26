# C4 — Nível 1: Diagrama de Contexto

Visão do FORJA como uma caixa preta, mostrando quem interage com ele e quais sistemas externos ele depende.

```mermaid
C4Context
title Diagrama de Contexto — FORJA

Person(usuario, "Usuário", "Pratica exercícios e joga a campanha solo (personas P1/P2 do PRD)")
Person(autor, "Autor / Desenvolvedor", "Escreve o catálogo de storylets e opera o simulador de travessia")

System(forja, "FORJA", "Aplicativo de treino estruturado como RPG solo (mobile + web) e API de suporte")

System_Ext(lojas, "App Store / Google Play", "Distribuição do app e processamento de compra única")
System_Ext(stripe, "Stripe", "Pagamentos via web")
System_Ext(cdn, "Distribuidor de kill-switch", "Serviço estático contratado sem retenção de log nem de IP (RC-009)")
System_Ext(email, "Provedor de e-mail transacional", "Envio de magic link para autenticação opcional")

Rel(usuario, forja, "Registra sessão de treino, joga a campanha, gerencia conta e backup")
Rel(autor, forja, "Publica releases contendo novo catálogo de campanha (D-031)")
Rel(forja, lojas, "Valida recibo de compra única de pacote de campanha")
Rel(forja, stripe, "Processa pagamento de pacote via web")
Rel(forja, cdn, "Consulta lista de ids de storylet desativados, sem identificar o usuário (RF-039/039A)")
Rel(forja, email, "Envia link de autenticação")
```

## Notas

- Não há usuários "administradores" externos no sistema em produção — o "Autor/Desenvolvedor" publica conteúdo por release do app (D-031), não por um painel administrativo em produção.
- Não existe integração com wearables/Health Connect/HealthKit no MVP (D-003) — de propósito, para não expandir a superfície de dado sensível.
- O sistema não tem qualquer canal de rede social interno (D-001, D-014) — o compartilhamento é sempre via folha nativa do SO, fora do escopo desta arquitetura de backend.
