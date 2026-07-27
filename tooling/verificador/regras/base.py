"""Tipos e utilitários compartilhados pelas regras T-xx/SCH-xx.

Schema alvo: packages/motor-narrativo/src/types.ts (Catalog/Storylet/Predicate).
Predicate usa `qual`/`op`/`valor` com encadeamento `e`/`ou` (não `todos`/`qualquer` do protótipo antigo).
"""
from __future__ import annotations

from dataclasses import dataclass, field

BANDAS_VALIDAS = {"Espinha", "Arco", "Cor"}
SUBCLASSES_VALIDAS = {"ausencia", "marco", "sessao", None}
OPS_VALIDOS = {"==", "!=", ">", "<", ">=", "<="}
PREFIXOS_SISTEMA = ("in.", "sys.", "cap.")


@dataclass
class Resultado:
    sucesso: bool
    erros: list[str] = field(default_factory=list)


def atomos(pred: dict | None) -> list[dict]:
    """Achata um predicado (incluindo cadeia e/ou) em lista de átomos {qual,op,valor}."""
    if not pred:
        return []
    out = [{"qual": pred["qual"], "op": pred.get("op"), "valor": pred.get("valor")}]
    if "e" in pred and pred["e"]:
        out += atomos(pred["e"])
    if "ou" in pred and pred["ou"]:
        out += atomos(pred["ou"])
    return out


def profundidade(pred: dict | None) -> int:
    """Profundidade da cadeia e/ou (predicado simples = 1)."""
    if not pred:
        return 0
    d = 1
    if pred.get("e"):
        d = max(d, 1 + profundidade(pred["e"]))
    if pred.get("ou"):
        d = max(d, 1 + profundidade(pred["ou"]))
    return d


def qs_lidas(storylet: dict) -> set[str]:
    """Qualidades lidas por um storylet: em `requer` e em `quando` de cada variante."""
    out = {a["qual"] for a in atomos(storylet.get("requer"))}
    for v in storylet.get("variantes", []):
        out |= {a["qual"] for a in atomos(v.get("quando"))}
    return out


def qs_escritas(storylet: dict) -> set[str]:
    """Qualidades escritas por um storylet: chaves de `efeitos` em cada variante."""
    out: set[str] = set()
    for v in storylet.get("variantes", []):
        out |= set((v.get("efeitos") or {}).keys())
    return out


def eh_sistema(qual: str) -> bool:
    return qual.startswith(PREFIXOS_SISTEMA)
