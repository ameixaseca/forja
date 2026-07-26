# ADR-0005: Direito de acesso multiplataforma via conta + reconciliação de recibos

- **Status:** Aceita
- **Contexto:** D-029/RF-110 modelam direito de acesso como `{pacote, origem, validoAte?}`, avaliado localmente e offline (RF-112). Com cliente completo na web além do mobile, um mesmo usuário pode comprar um pacote de campanha pela App Store, pela Play Store ou via Stripe na web, e espera ter acesso nas três superfícies.
- **Decisão:** A reconciliação de compra entre plataformas exige conta (RF-090 continua permitindo uso completo sem conta para quem usa uma única plataforma). Ao autenticar, o cliente sincroniza a lista de entitlements da API, que os agrega a partir de todos os `origem` conhecidos (`app_store`, `play_store`, `stripe`) validados contra os respectivos provedores. O cliente cacheia essa lista localmente e avalia acesso offline contra o cache.
- **Consequências:**
  - Positivas: usuário sem conta continua 100% funcional numa única plataforma (RF-090 preservado); usuário com conta ganha portabilidade de compra sem exigir arquitetura de assinatura (D-026 permanece fora do MVP).
  - Negativas: "restaurar compra" sem conta não é possível entre plataformas — é uma limitação de produto que precisa ser comunicada na experiência de compra.
- **Alternativas consideradas:**
  - Exigir conta sempre — descartada por contradizer RF-090 diretamente.
  - Portar entitlement por dispositivo sem conta (ex.: código de restauração manual) — mantida como extensão futura possível, mas fora do MVP por não ter sido pedida no PRD.
- **Referências:** D-029, RF-090, RF-110, RF-111, RF-112, RF-113, D-026.
