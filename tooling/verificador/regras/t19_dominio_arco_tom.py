from .base import Resultado, atomos


class T19_DominioArcoTom:
    """ESPEC §7.2 T-19: `arco.tom` tem no máximo 4 valores no domínio declarado.

    O catálogo não declara domínios de qualidade separadamente; esta
    implementação aproxima o domínio pelo conjunto de valores distintos
    comparados contra `arco.tom` em todo o catálogo (predicados e efeitos).
    """

    def verificar(self, catalog: dict) -> Resultado:
        valores: set = set()
        for st in catalog.get("storylets", []):
            for a in atomos(st.get("requer")):
                if a["qual"] == "arco.tom":
                    valores.add(a["valor"])
            for v in st.get("variantes", []):
                for a in atomos(v.get("quando")):
                    if a["qual"] == "arco.tom":
                        valores.add(a["valor"])
                if "arco.tom" in (v.get("efeitos") or {}):
                    valores.add(v["efeitos"]["arco.tom"])
        if len(valores) > 4:
            return Resultado(False, [f"T-19: arco.tom tem {len(valores)} valores distintos usados (> 4): {sorted(valores, key=str)}"])
        return Resultado(True, [])
