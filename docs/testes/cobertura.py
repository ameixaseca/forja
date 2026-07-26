#!/usr/bin/env python3
"""Cruza as tags dos .feature com o inventário de requisitos do PRD e da ESPEC."""
import re, pathlib, sys, collections

RAIZ = pathlib.Path(__file__).resolve().parent
DOCS = pathlib.Path("/mnt/user-data/uploads")
PRD = (DOCS / "PRD-Forja-v0_14.md").read_text()
ESPEC = (DOCS / "ESPEC-Sistema-Narrativo-v2_6.md").read_text()

# ---- inventário de requisitos definidos ----
definidos = {
    "RF": set(re.findall(r"\*\*(RF-\d{3}[A-Z]?)\*\*", PRD)),
    "RN": set(re.findall(r"\*\*(RN-\d{3})\*\*", PRD)),
    "RE": set(re.findall(r"\*\*(RE-\d{3})\*\*", PRD)),
    "RC": set(re.findall(r"\*\*(RC-\d{3})\*\*", PRD)),
    "T":  set(re.findall(r"\|\s*\*{0,2}(T-\d{2})", ESPEC)),
    "M":  set(re.findall(r"\|\s*\*{0,2}(M-\d{2})", ESPEC)),
}
# testes aposentados na v2.6
definidos["T"] -= {"T-13", "T-15", "T-20"}

# ---- requisitos deliberadamente fora do escopo de teste automatizado ----
FORA = {
    "RF-030": "arquitetura: campanha compilada; coberto por RN-028",
    "RF-035": "arquitetura; coberto por cenário de inspeção em 07",
    "RF-036": "arquitetura; coberto por cenário de pureza em 07",
    "RC-033": "processo de autoria: autoria humana",
    "RC-034": "processo de autoria: política de uso de IA",
    "RC-041": "dormente: ativa apenas com expansão para a UE",
    "RC-042": "dormente: ativa apenas com expansão hispanofalante",
    "RC-043": "dormente: ativa apenas com expansão de idioma",
}

# ---- tags usadas nos .feature ----
usadas = collections.defaultdict(set)
por_arquivo = {}
for f in sorted((RAIZ / "features").glob("*.feature")):
    txt = f.read_text()
    tags = set(re.findall(r"@((?:rf|rn|re|rc|t|m)-\d{2,3}[a-z]?)\b", txt))
    por_arquivo[f.name] = tags
    for t in tags:
        pref, num = t.split("-")
        usadas[pref.upper()].add(f"{pref.upper()}-{num.upper()}")

# ---- relatório ----
print(f"{'prefixo':<8} {'definidos':>10} {'cobertos':>9} {'fora':>6} {'lacuna':>7}")
print("-" * 45)
total_def = total_cob = total_falta = 0
faltantes = {}
for pref in ("RF", "RN", "RE", "RC", "T", "M"):
    d = definidos[pref]
    fora = {x for x in d if x in FORA}
    alvo = d - fora
    cob = alvo & usadas[pref]
    falta = sorted(alvo - cob)
    faltantes[pref] = falta
    total_def += len(alvo); total_cob += len(cob); total_falta += len(falta)
    print(f"{pref:<8} {len(alvo):>10} {len(cob):>9} {len(fora):>6} {len(falta):>7}")
print("-" * 45)
print(f"{'TOTAL':<8} {total_def:>10} {total_cob:>9} {sum(1 for _ in FORA):>6} {total_falta:>7}")
pct = 100 * total_cob / total_def if total_def else 0
print(f"\ncobertura: {pct:.1f}%")

for pref, falta in faltantes.items():
    if falta:
        print(f"\nSEM COBERTURA — {pref} ({len(falta)}):")
        for x in falta: print("  -", x)

# ---- tags órfãs (usadas e não definidas) ----
print()
for pref in ("RF", "RN", "RE", "RC", "T", "M"):
    orfas = sorted(usadas[pref] - definidos[pref] - set(FORA))
    if orfas:
        print(f"TAG SEM REQUISITO CORRESPONDENTE — {pref}: {orfas}")

# ---- estatística dos arquivos ----
print(f"\n{'arquivo':<48} {'cenários':>9} {'tags':>6}")
print("-" * 66)
tot_cen = 0
for f in sorted((RAIZ / "features").glob("*.feature")):
    txt = f.read_text()
    n = len(re.findall(r"^\s*(Cenário|Esquema do Cenário):", txt, re.M))
    ex = len(re.findall(r"^\s*\|", txt, re.M)) - len(re.findall(r"^\s*\|\s*[a-zç]", txt, re.M))
    tot_cen += n
    print(f"{f.name:<48} {n:>9} {len(por_arquivo[f.name]):>6}")
print("-" * 66)
print(f"{'TOTAL':<48} {tot_cen:>9}")

# linhas de exemplo (casos de teste efetivos)
casos = 0
for f in (RAIZ / "features").glob("*.feature"):
    txt = f.read_text()
    for bloco in re.findall(r"Exemplos:\n((?:\s*\|.*\n)+)", txt):
        linhas = [l for l in bloco.strip().split("\n") if l.strip().startswith("|")]
        casos += max(0, len(linhas) - 1)
simples = tot_cen - len(re.findall(r"Esquema do Cenário:", "".join(
    p.read_text() for p in (RAIZ / "features").glob("*.feature"))))
print(f"\ncasos de teste efetivos: {simples} cenários simples + {casos} linhas de exemplo = {simples + casos}")

sys.exit(1 if total_falta else 0)
