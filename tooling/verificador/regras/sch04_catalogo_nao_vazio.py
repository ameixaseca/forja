from .base import Resultado


class SCH04_CatalogoNaoVazio:
    """Sanidade de esquema: catálogo deve ter ao menos um storylet."""

    def verificar(self, catalog: dict) -> Resultado:
        if not catalog.get("storylets"):
            return Resultado(False, ["SCH-04: catálogo vazio (sem storylets)"])
        return Resultado(True, [])
