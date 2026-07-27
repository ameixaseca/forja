from .base import Resultado, profundidade


class T04_ProfundidadePredicado:
    """ESPEC §7.2 T-04: profundidade de predicado <= 3."""

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            if profundidade(st.get("requer")) > 3:
                erros.append(f"T-04: {st['id']} tem predicado (requer) com profundidade > 3")
            for v in st.get("variantes", []):
                if profundidade(v.get("quando")) > 3:
                    erros.append(f"T-04: {st['id']} tem variante com predicado (quando) de profundidade > 3")
        return Resultado(not erros, erros)
