from .base import Resultado


class T01_IdsUnicos:
    """ESPEC §7.2 T-01: todo Id é único."""

    def verificar(self, catalog: dict) -> Resultado:
        ids = [st["id"] for st in catalog.get("storylets", [])]
        duplicados = {i for i in ids if ids.count(i) > 1}
        if duplicados:
            return Resultado(False, [f"T-01: id duplicado: {i}" for i in sorted(duplicados)])
        return Resultado(True, [])
