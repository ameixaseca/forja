from .base import Resultado, qs_escritas, qs_lidas


class T14_AsciiMinusculo:
    """ESPEC §7.2 T-14: nenhum nome de qualidade contém caractere fora de ASCII."""

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            for q in qs_lidas(st) | qs_escritas(st):
                if not (q.isascii() and q == q.lower()):
                    erros.append(f"T-14: {st['id']} usa qualidade não-ASCII/minúscula: {q}")
        return Resultado(not erros, erros)
