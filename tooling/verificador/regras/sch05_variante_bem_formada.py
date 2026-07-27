from .base import Resultado


class SCH05_VarianteBemFormada:
    """Sanidade de esquema: toda variante tem `texto` (string não vazia) e
    `efeitos` é um objeto (pode ser vazio).
    """

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            for i, v in enumerate(st.get("variantes", [])):
                texto = v.get("texto")
                if not isinstance(texto, str) or not texto.strip():
                    erros.append(f"SCH-05: {st.get('id', '?')} variante[{i}] sem `texto` válido")
                if not isinstance(v.get("efeitos", {}), dict):
                    erros.append(f"SCH-05: {st.get('id', '?')} variante[{i}] `efeitos` não é objeto")
        return Resultado(not erros, erros)
