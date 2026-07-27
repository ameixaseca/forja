from .base import Resultado, eh_sistema, qs_escritas, qs_lidas


class T08_LeituraEscrita:
    """ESPEC §7.2 T-08: toda qualidade lida é escrita por algum efeito, ou é `in.`/`sys.`/`cap.`."""

    def verificar(self, catalog: dict) -> Resultado:
        storylets = catalog.get("storylets", [])
        escritas_todas: set[str] = set()
        for st in storylets:
            escritas_todas |= qs_escritas(st)

        erros = []
        for st in storylets:
            for q in qs_lidas(st):
                if not eh_sistema(q) and q not in escritas_todas:
                    erros.append(f"T-08: {st['id']} lê {q}, que nenhum efeito escreve")
        return Resultado(not erros, erros)
