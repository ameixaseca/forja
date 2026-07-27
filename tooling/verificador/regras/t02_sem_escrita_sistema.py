from .base import Resultado, eh_sistema, qs_escritas


class T02_SemEscritaSistema:
    """ESPEC §7.2 T-02: nenhum efeito escreve `in.`, `sys.` ou `cap.`."""

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            for q in qs_escritas(st):
                if eh_sistema(q):
                    erros.append(f"T-02: {st['id']} escreve qualidade de sistema {q}")
        return Resultado(not erros, erros)
