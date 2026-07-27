from .base import Resultado, atomos, OPS_VALIDOS


class T03_TiposValidos:
    """ESPEC §7.2 T-03: todo valor comparado pertence ao domínio da qualidade.

    O catálogo (packages/motor-narrativo) não declara domínios de qualidade
    separadamente — `Predicate.valor` e `Variant.efeitos` são tipados como
    `number | boolean`. Nesta implementação, T-03 verifica que todo valor
    comparado ou escrito é de fato `number` ou `boolean` (nunca string/null/
    lista/objeto) e que todo operador usado é um dos 6 válidos.
    """

    def verificar(self, catalog: dict) -> Resultado:
        erros = []
        for st in catalog.get("storylets", []):
            preds = atomos(st.get("requer"))
            for v in st.get("variantes", []):
                preds += atomos(v.get("quando"))
                for qual, valor in (v.get("efeitos") or {}).items():
                    if not isinstance(valor, (int, float, bool)):
                        erros.append(f"T-03: {st['id']} efeito {qual} com valor fora do domínio: {valor!r}")
            for a in preds:
                if a["op"] not in OPS_VALIDOS:
                    erros.append(f"T-03: {st['id']} operador inválido: {a['op']!r}")
                if not isinstance(a["valor"], (int, float, bool)):
                    erros.append(f"T-03: {st['id']} compara {a['qual']} com valor fora do domínio: {a['valor']!r}")
        return Resultado(not erros, erros)
