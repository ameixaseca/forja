from .base import BANDAS_VALIDAS, Resultado


class SCH01_BandaValida:
    """Sanidade de esquema (fora da tabela ESPEC §7.2, mas exigida pelo tipo `Band`):
    `banda` deve ser Espinha, Arco ou Cor.
    """

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            if st.get("banda") not in BANDAS_VALIDAS:
                erros.append(f"SCH-01: {st.get('id', '?')} tem banda inválida: {st.get('banda')!r}")
        return Resultado(not erros, erros)
