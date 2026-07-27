import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from regras import REGRAS  # noqa: E402

FIXTURES = Path(__file__).parent / "fixtures"


def carregar(nome: str) -> dict:
    return json.loads((FIXTURES / nome).read_text(encoding="utf-8"))


def rodar_regras(catalog: dict) -> list[str]:
    erros: list[str] = []
    for regra in REGRAS:
        resultado = regra.verificar(catalog)
        if not resultado.sucesso:
            erros.extend(resultado.erros)
    return erros


def test_catalogo_valido_passa_sem_erros():
    catalog = carregar("catalogo_valido.json")
    assert rodar_regras(catalog) == []
