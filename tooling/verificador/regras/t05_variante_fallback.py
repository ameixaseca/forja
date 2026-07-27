from .base import Resultado


class T05_VarianteFallback:
    """ESPEC §7.2 T-05: todo storylet tem variante de fallback sem `Quando`."""

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            variantes = st.get("variantes", [])
            if not variantes:
                erros.append(f"T-05: {st['id']} não tem variantes")
                continue
            if not any("quando" not in v or v["quando"] is None for v in variantes):
                erros.append(f"T-05: {st['id']} sem variante de fallback (todas têm `quando`)")
        return Resultado(not erros, erros)
