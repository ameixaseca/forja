from .base import Resultado, atomos


class T18_CamadaNeutra:
    """ESPEC §7.2 T-18: camada neutra de Cor >= 60% do total da banda.

    Neutra = storylet de Cor cujo `requer` não referencia `arco.tom`.
    """

    def verificar(self, catalog: dict) -> Resultado:
        cor = [st for st in catalog.get("storylets", []) if st.get("banda") == "Cor"]
        if not cor:
            return Resultado(True, [])
        tonais = [st for st in cor if any(a["qual"] == "arco.tom" for a in atomos(st.get("requer")))]
        neutra = [st for st in cor if st not in tonais]
        razao = len(neutra) / len(cor)
        if razao < 0.60:
            return Resultado(False, [f"T-18: camada neutra de Cor é {razao:.0%} (< 60%): {len(neutra)}/{len(cor)}"])
        return Resultado(True, [])
