from .base import Resultado


class SCH03_CapitulosSequenciais:
    """Sanidade de esquema: capítulos declarados (não-nulos) formam sequência
    1, 2, 3, ... sem pulos.
    """

    def verificar(self, catalog: dict) -> Resultado:
        capitulos = sorted({
            st["capitulo"] for st in catalog.get("storylets", [])
            if st.get("capitulo") is not None
        })
        if not capitulos:
            return Resultado(True, [])
        esperado = list(range(1, capitulos[-1] + 1))
        if capitulos != esperado:
            return Resultado(False, [f"SCH-03: capítulos com pulo: encontrados {capitulos}, esperado {esperado}"])
        return Resultado(True, [])
