from .base import Resultado, SUBCLASSES_VALIDAS


class SCH02_SubclasseValida:
    """Sanidade de esquema: `subclasse` deve ser ausencia, marco, sessao ou null."""

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            if st.get("subclasse") not in SUBCLASSES_VALIDAS:
                erros.append(f"SCH-02: {st.get('id', '?')} tem subclasse inválida: {st.get('subclasse')!r}")
        return Resultado(not erros, erros)
