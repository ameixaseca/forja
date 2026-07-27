from .base import Resultado, atomos, qs_escritas


class SCH06_PredicadoCircular:
    """Sanidade de esquema: detecta ciclo de dependência entre qualidades
    (ex.: A requer B, e o único escritor de B requer A) via grafo
    qualidade-lida -> qualidade-escrita, por storylet.
    """

    def verificar(self, catalog: dict) -> Resultado:
        storylets = catalog.get("storylets", [])
        grafo: dict[str, set[str]] = {}
        for st in storylets:
            lidas = {a["qual"] for a in atomos(st.get("requer"))}
            escritas = qs_escritas(st)
            for qr in lidas:
                # Auto-referência (uma storylet lê e escreve a mesma qualidade,
                # ex.: fechamento `comp.x == 1` -> efeito `comp.x = 0`) é o
                # padrão normal de fechamento (T-21), não um ciclo.
                grafo.setdefault(qr, set()).update(escritas - {qr})

        ciclo = self._achar_ciclo(grafo)
        if ciclo:
            return Resultado(False, [f"SCH-06: dependência circular entre qualidades: {' -> '.join(ciclo)}"])
        return Resultado(True, [])

    @staticmethod
    def _achar_ciclo(grafo: dict[str, set[str]]) -> list[str] | None:
        visitando: set[str] = set()
        visitado: set[str] = set()

        def dfs(no: str, caminho: list[str]) -> list[str] | None:
            visitando.add(no)
            caminho.append(no)
            for vizinho in grafo.get(no, ()):
                if vizinho in visitando:
                    return caminho[caminho.index(vizinho):] + [vizinho]
                if vizinho not in visitado:
                    resultado = dfs(vizinho, caminho)
                    if resultado:
                        return resultado
            visitando.discard(no)
            visitado.add(no)
            caminho.pop()
            return None

        for no in list(grafo):
            if no not in visitado:
                achado = dfs(no, [])
                if achado:
                    return achado
        return None
