#!/usr/bin/env python3
"""Verifica um catálogo de storylets contra as regras estáticas de catálogo
(ESPEC v2.6 §7.2, T-01 a T-21) e checagens de sanidade de esquema (SCH-xx).

Uso:
    python verificar.py <caminho-para-catalogo.json>
    python verificar.py <diretorio-com-manifest.json-ou-catalogo.json>
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import click

from regras import REGRAS

# Windows consoles default to a non-UTF-8 codepage (cp1252); force UTF-8 so
# accented pt-BR text and status glyphs don't crash `click.echo`.
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8")

NOMES_CATALOGO = ("manifest.json", "catalogo.json", "catalog.json")


def carregar_catalogo(caminho: Path) -> dict:
    if caminho.is_dir():
        for nome in NOMES_CATALOGO:
            candidato = caminho / nome
            if candidato.exists():
                caminho = candidato
                break
        else:
            raise click.ClickException(
                f"nenhum de {NOMES_CATALOGO} encontrado em {caminho}"
            )
    try:
        return json.loads(caminho.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise click.ClickException(f"JSON inválido em {caminho}: {e}") from e


@click.command()
@click.argument("catalog_path", type=click.Path(exists=True, path_type=Path))
def verificar(catalog_path: Path) -> None:
    """Verifica catálogo contra regras SCH-xx e T-01 a T-21 (estáticas)."""
    catalog = carregar_catalogo(catalog_path)

    erros: list[str] = []
    for regra in REGRAS:
        resultado = regra.verificar(catalog)
        if not resultado.sucesso:
            erros.extend(resultado.erros)

    n_storylets = len(catalog.get("storylets", []))
    click.echo(f"catálogo: {n_storylets} storylet(s)")

    if erros:
        click.echo(f"❌ {len(erros)} erro(s) encontrado(s):")
        for erro in erros:
            click.echo(f"  - {erro}")
        sys.exit(1)

    click.echo("✅ Catálogo válido (SCH-xx e T-01 a T-21 passando)")
    sys.exit(0)


if __name__ == "__main__":
    verificar()
