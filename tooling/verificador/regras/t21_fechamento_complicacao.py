from .base import Resultado, atomos


class T21_FechamentoComplicacao:
    """ESPEC §7.2 T-21: toda complicação (`comp.*`) tem >= 2 storylets de
    fechamento (efeito que zera a complicação), dos quais >= 1 sem condição
    de atributo (`in.atributo.*`) no `requer`.
    """

    def verificar(self, catalog: dict) -> Resultado:
        storylets = catalog.get("storylets", [])
        comps: set[str] = set()
        for st in storylets:
            for v in st.get("variantes", []):
                for q in (v.get("efeitos") or {}):
                    if q.startswith("comp."):
                        comps.add(q)
            for a in atomos(st.get("requer")):
                if a["qual"].startswith("comp."):
                    comps.add(a["qual"])

        erros = []
        for comp in sorted(comps):
            fechamento = [
                st for st in storylets
                if any((v.get("efeitos") or {}).get(comp) in (0, False) for v in st.get("variantes", []))
            ]
            if len(fechamento) < 2:
                erros.append(f"T-21: {comp} tem {len(fechamento)} storylet(s) de fechamento (mínimo 2)")
                continue
            sem_atributo = [
                st for st in fechamento
                if not any(a["qual"].startswith("in.atributo.") for a in atomos(st.get("requer")))
            ]
            if not sem_atributo:
                erros.append(f"T-21: {comp} não tem storylet de fechamento sem condição de atributo")
        return Resultado(not erros, erros)
