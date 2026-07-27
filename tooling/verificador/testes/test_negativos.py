"""Cada fixture em tooling/fixtures/negativos/ viola exatamente uma regra
(ESPEC v2.6 §7.4 / DEC-037): a suíte confirma que a regra esperada dispara.

Exceções documentadas à exclusividade (mais de uma regra falha, por
necessidade matemática, não por imprecisão da fixture):
- 12-vazio.json: catálogo vazio também falha T-07 (sem Espinha/fallback),
  além de SCH-04.
- 13-json-invalido.json: falha no parse, não chega a rodar regras.
"""
import json
import re
import sys
from pathlib import Path

import pytest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from regras import REGRAS  # noqa: E402

NEGATIVOS = Path(__file__).resolve().parents[2] / "fixtures" / "negativos"

CASOS_REGRA_UNICA = [
    ("01-id-duplicado.json", "T-01"),
    ("02-referencia-quebrada.json", "T-08"),
    ("03-banda-invalida.json", "SCH-01"),
    ("04-subclasse-invalida.json", "SCH-02"),
    ("05-capitulo-pulo.json", "SCH-03"),
    ("06-sem-espinha.json", "T-07"),
    ("07-sem-fallback.json", "T-07"),
    ("08-predicado-malformado.json", "T-03"),
    ("09-variante-sem-texto.json", "SCH-05"),
    ("10-efeitos-invalidos.json", "T-03"),
    ("11-circular-reference.json", "SCH-06"),
]


def rodar_regras(catalog: dict) -> list[str]:
    erros: list[str] = []
    for regra in REGRAS:
        resultado = regra.verificar(catalog)
        if not resultado.sucesso:
            erros.extend(resultado.erros)
    return erros


def ids_das_regras(erros: list[str]) -> set[str]:
    return {re.match(r"^([A-Z]+-\d+)", e).group(1) for e in erros}


@pytest.mark.parametrize("arquivo,regra_esperada", CASOS_REGRA_UNICA)
def test_fixture_dispara_regra_esperada_e_apenas_ela(arquivo: str, regra_esperada: str):
    catalog = json.loads((NEGATIVOS / arquivo).read_text(encoding="utf-8"))
    erros = rodar_regras(catalog)
    assert erros, f"{arquivo} deveria falhar em {regra_esperada}, mas passou"
    ids = ids_das_regras(erros)
    assert ids == {regra_esperada}, f"{arquivo} esperava só {regra_esperada}, obteve {ids}"


def test_fixture_vazio_dispara_sch04():
    catalog = json.loads((NEGATIVOS / "12-vazio.json").read_text(encoding="utf-8"))
    erros = rodar_regras(catalog)
    assert "SCH-04" in ids_das_regras(erros)


def test_fixture_json_invalido_nao_carrega():
    texto = (NEGATIVOS / "13-json-invalido.json").read_text(encoding="utf-8")
    with pytest.raises(json.JSONDecodeError):
        json.loads(texto)
