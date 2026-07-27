from .base import Resultado


class T07_Reconhecimento:
    """ESPEC §7.2 T-07: regra de reconhecimento de §5 satisfeita (classificação estática).

    Verificação mínima (Fase 4): existe ao menos 1 storylet de banda Espinha
    e existe o storylet `st_cor_fallback` (rede de segurança, M-04).
    """

    def verificar(self, catalog: dict) -> Resultado:
        storylets = catalog.get("storylets", [])
        erros = []
        if not any(st.get("banda") == "Espinha" for st in storylets):
            erros.append("T-07: catálogo sem nenhum storylet de banda Espinha")
        if not any(st.get("id") == "st_cor_fallback" for st in storylets):
            erros.append("T-07: catálogo sem storylet st_cor_fallback (rede de segurança)")
        return Resultado(not erros, erros)
