#!/usr/bin/env python3
"""Verifica o protótipo contra as regras da ESPEC v2.6 e confere referências cruzadas."""
import json, re, sys, pathlib

BASE = pathlib.Path("/home/claude")
PROTO = (BASE / "PROTOTIPO-Campanha-A-Longa-Seca-v0_2.md").read_text()
ESPEC = (BASE / "ESPEC-Sistema-Narrativo-v2_6.md").read_text()
PRD   = (BASE / "PRD-Forja-v0_14.md").read_text()
DEC   = (BASE / "decisoes.md").read_text()

falhas, avisos = [], []
def check(cond, msg):
    if not cond: falhas.append(msg)

# ---------- 1. extrair JSON do protótipo ----------
blocos = re.findall(r"```json\n(.*?)\n```", PROTO, re.S)
objs = []
for b in blocos:
    try: objs.append(json.loads(b))
    except json.JSONDecodeError as e:
        falhas.append(f"JSON inválido no protótipo: {e}")

qualidades, entidades, storylets = {}, {}, []
for o in objs:
    if isinstance(o, dict) and "qualidades" in o:
        qualidades = {q["nome"]: q for q in o["qualidades"]}
    elif isinstance(o, dict) and "entidades" in o:
        entidades = {e["id"]: e for e in o["entidades"]}
    elif isinstance(o, list):
        storylets += o

print(f"catálogo: {len(storylets)} storylets, {len(qualidades)} qualidades, {len(entidades)} entidades")

# ---------- helpers ----------
def atomos(pred):
    if not pred: return []
    out = []
    for k, v in pred.items():
        if k in ("todos", "qualquer", "nenhum"):
            for sub in v: out += atomos(sub)
        elif k == "q":
            out.append(pred)
    return out

def profundidade(pred, d=1):
    if not pred: return 0
    m = d
    for k, v in pred.items():
        if k in ("todos", "qualquer", "nenhum"):
            for sub in v: m = max(m, profundidade(sub, d + 1))
    return m

def qs_lidas(s):
    out = {a["q"] for a in atomos(s.get("requer"))}
    for t in s.get("textos", []):
        out |= {a["q"] for a in atomos(t.get("quando"))}
    return out

def qs_escritas(s):
    out = {e["q"] for e in s.get("efeitos", [])}
    for e in s.get("escolhas", []) or []:
        out |= {x["q"] for x in e.get("efeitos", [])}
    return out

def implica_eq(s, q, val):
    """Requer contém, no topo de um 'todos', o átomo q == val."""
    r = s.get("requer") or {}
    for a in r.get("todos", []):
        if a.get("q") == q and a.get("eq") == val: return True
    return False

def implica_ne(s, q, val):
    r = s.get("requer") or {}
    for a in r.get("todos", []):
        if a.get("q") != q: continue
        if a.get("ne") == val: return True
        if "eq" in a and a["eq"] != val: return True
        if "gte" in a and isinstance(a["gte"], int) and isinstance(val, int) and a["gte"] > val: return True
    return False

ids = [s["id"] for s in storylets]

# ---------- suíte de catálogo ----------
# T-01
check(len(ids) == len(set(ids)), "T-01: ids duplicados")
# T-02
for s in storylets:
    for q in qs_escritas(s):
        check(not q.startswith(("in.", "sys.", "cap.")), f"T-02: {s['id']} escreve {q}")
# T-03
for s in storylets:
    for a in atomos(s.get("requer")) + [x for t in s.get("textos", []) for x in atomos(t.get("quando"))]:
        q = qualidades.get(a["q"])
        if not q or a["q"].startswith(("in.", "sys.", "cap.")): continue
        for op in ("eq", "ne"):
            if op in a and q["tipo"] == "enum":
                check(a[op] in q["valores"], f"T-03: {s['id']} compara {a['q']} com {a[op]!r}")
        for op in ("gte", "lte", "gt", "lt"):
            if op in a and q["tipo"] == "int":
                check(q["min"] <= a[op] <= q["max"], f"T-03: {s['id']} compara {a['q']} fora do domínio")
# T-04
for s in storylets:
    check(profundidade(s.get("requer")) <= 3, f"T-04: {s['id']} profundidade > 3")
# T-05
for s in storylets:
    check(s["textos"] and "quando" not in s["textos"][-1], f"T-05: {s['id']} sem variante de fallback")
# T-06
for s in storylets:
    for e in s.get("entidades", []):
        check(e in entidades, f"T-06: {s['id']} referencia entidade inexistente {e}")
# T-07 — classificação por alcançabilidade
for s in storylets:
    for e in s.get("entidades", []):
        ini = qualidades[f"ent.{e}.estado"]["inicial"]
        primeiro = implica_eq(s, f"ent.{e}.estado", ini) or implica_eq(s, f"ent.{e}.conhecido", 0)
        retorno  = implica_ne(s, f"ent.{e}.estado", ini) or any(
            a.get("q") == f"ent.{e}.conhecido" and a.get("gte", 0) >= 1 for a in atomos(s.get("requer")))
        n = len(s["textos"])
        if primeiro or retorno:
            check(n >= 1, f"T-07: {s['id']} sem variante")
        else:
            check(n >= 2, f"T-07: {s['id']} é ambivalente para {e} e tem {n} variante(s)")
# T-08
escritas_todas = set().union(*[qs_escritas(s) for s in storylets]) | {
    f"ent.{e}.conhecido" for e in entidades}
for s in storylets:
    for q in qs_lidas(s):
        check(q.startswith(("in.", "sys.", "cap.")) or q in escritas_todas,
              f"T-08: {s['id']} lê {q}, que nada escreve")
# T-14
for q in qualidades: check(q.isascii() and q.islower(), f"T-14: nome não-ASCII/minúsculo: {q}")
# T-18 / subclasses
cor = [s for s in storylets if s["banda"] == "cor"]
tonal = [s for s in cor if any(a["q"] == "arco.tom" for a in atomos(s.get("requer")))]
neutra = [s for s in cor if s not in tonal]
check(len(neutra) / len(cor) >= 0.60, f"T-18: neutra {len(neutra)}/{len(cor)}")
ausencia = [s for s in cor if s.get("subclasse") == "ausencia"]
fallback = [s for s in cor if s.get("subclasse") == "fallback"]
check(len(ausencia) >= 6, f"T-31: subclasse ausencia tem {len(ausencia)}, mínimo 6")
check(len(fallback) == 1, f"fallback: {len(fallback)}, esperado 1")
check(not fallback[0].get("requer") and not fallback[0].get("efeitos"),
      "fallback não pode ter predicado nem efeito")
# T-19
check(len(qualidades["arco.tom"]["valores"]) <= 4, "T-19: arco.tom > 4 valores")
# T-21
comps = [q for q in qualidades if q.startswith("comp.")]
for c in comps:
    fech = [s for s in storylets if any(e["q"] == c and e.get("definir") == 0 for e in s.get("efeitos", []))
            and s["banda"] == "arco"]
    check(len(fech) >= 2, f"T-21: {c} tem {len(fech)} caminho(s) de fechamento na banda arco")
    base = [s for s in fech if not any(a["q"].startswith("in.atributo.") for a in atomos(s.get("requer")))]
    check(len(base) >= 1, f"T-21: {c} sem caminho base incondicionado por atributo")
# T-26
for s in storylets:
    for t in s["textos"]:
        check(re.fullmatch(r"[a-z0-9._]+", t["texto"]) is not None,
              f"T-26: {s['id']} parece conter prosa embutida")
# T-27 (estático): variante inalcançável em storylet de disparo único
for s in storylets:
    for e in s.get("entidades", []):
        ini = qualidades[f"ent.{e}.estado"]["inicial"]
        if implica_eq(s, f"ent.{e}.estado", ini) and f"ent.{e}.estado" in qs_escritas(s):
            check(len(s["textos"]) == 1,
                  f"T-27: {s['id']} é de disparo único e tem {len(s['textos'])} variantes")
# T-28
mem_escritas = {q for s in storylets for q in qs_escritas(s) if q.startswith("mem.")}
declaradas = set(re.findall(r"`(mem\.[a-z_]+)`\s*\|\s*cap\. 1", PROTO))
for m in mem_escritas:
    check(m in declaradas, f"T-28: {m} escrita sem leitor declarado em §2.3")
# T-29
for s in storylets:
    if s["banda"] == "espinha" and "desfecho" in s["id"]:
        check(not any(a["q"].startswith("comp.") for a in atomos(s.get("requer"))),
              f"T-29: {s['id']} lê comp.* no Requer")
        check(any(a["q"].startswith("comp.") for t in s["textos"] for a in atomos(t.get("quando"))),
              f"T-29: {s['id']} não reconhece complicação aberta em nenhuma variante")
# T-30 (regra de autoria)
for s in storylets:
    if s["banda"] == "arco":
        qs = {a["q"] for a in atomos(s.get("requer"))}
        check(any(q.startswith(("ent.", "comp.", "mem.")) or q == "in.rolagem" for q in qs),
              f"T-30/autoria: {s['id']} não tem predicado sobre entidade, complicação ou rolagem")
# T-33
for s in storylets:
    if s.get("capitulo") is not None:
        check("sys.resolucoes" not in {a["q"] for a in atomos(s.get("requer"))},
              f"T-33: {s['id']} usa sys.resolucoes no Requer")
# T-34
for s in cor:
    for q in qs_escritas(s):
        check(not q.startswith(("comp.", "ent.", "mem.")), f"T-34: {s['id']} de Cor escreve {q}")
# campo removido
for s in storylets:
    check("desativavel" not in s, f"DEC-012: {s['id']} ainda declara desativavel")

# ---------- solubilidade por força bruta ----------
def resolvivel(forca, vigor, destreza, rolagem):
    est = {q: v["inicial"] for q, v in qualidades.items()}
    ent_conh = {e: 0 for e in entidades}
    for passo in range(1, 41):
        entradas = {"in.atributo.forca": forca, "in.atributo.vigor": vigor,
                    "in.atributo.destreza": destreza, "in.rolagem": rolagem,
                    "cap.resolucoes": passo}
        def val(q): return entradas.get(q, ent_conh.get(q.split(".")[1] if q.startswith("ent.") and q.endswith("conhecido") else "", est.get(q)))
        def ok(p):
            if not p: return True
            for k, v in p.items():
                if k == "todos": return all(ok(x) for x in v)
                if k == "qualquer": return any(ok(x) for x in v)
                if k == "nenhum": return not any(ok(x) for x in v)
            q = p["q"]; cur = entradas.get(q, est.get(q))
            if cur is None: return False
            for op, tgt in p.items():
                if op == "q": continue
                if op == "eq" and cur != tgt: return False
                if op == "ne" and cur == tgt: return False
                if op == "gte" and cur < tgt: return False
                if op == "lte" and cur > tgt: return False
            return True
        arco = [s for s in storylets if s["banda"] == "arco" and ok(s.get("requer"))]
        # regra de pressão
        if passo >= 12:
            arco = [s for s in arco if any(e["q"].startswith("comp.") and e.get("definir") == 0
                                           for e in s.get("efeitos", []))]
        if est["comp.carga_demais"] == 0 and est["comp.pe_ferido"] == 0 and passo > 1:
            return True, passo
        if not arco:
            continue                      # resolução de Cor: o capítulo segue
        s = max(arco, key=lambda x: x["peso"])
        for e in s.get("efeitos", []):
            if "definir" in e: est[e["q"]] = e["definir"]
            else:
                qd = qualidades[e["q"]]
                est[e["q"]] = max(qd["min"], min(qd["max"], est[e["q"]] + e["somar"]))
    return False, 40

for nome, (f, v, d, r) in {
    "pessimo":      (0, 0, 0, 5),
    "especialista": (3, 0, 0, 8),
    "constante":    (1, 1, 1, 9),
    "sem_atributo": (0, 0, 0, 12),
}.items():
    # abre o pé ferido à força para testar os dois fechamentos
    okc, passos = resolvivel(f, v, d, r)
    check(okc, f"T-10/T-11: política {nome} não fecha as complicações em 40 resoluções")
    if okc: print(f"  solubilidade {nome}: complicações fechadas em {passos} resoluções")

# ---------- referências cruzadas ----------
docs = {"PRD": PRD, "ESPEC": ESPEC, "PROTOTIPO": PROTO, "decisoes": DEC}
def definidos(texto, pat):
    return set(re.findall(pat, texto))

univ = {
    "D-":   definidos(PRD, r"\|\s*\*{0,2}(D-\d{3})"),
    "RF-":  definidos(PRD, r"\*\*(RF-\d{3}[A-Z]?)\*\*"),
    "RN-":  definidos(PRD, r"\*\*(RN-\d{3})\*\*"),
    "RE-":  definidos(PRD, r"\*\*(RE-\d{3})\*\*"),
    "RC-":  definidos(PRD, r"\*\*(RC-\d{3})\*\*"),
    "R-":   definidos(PRD, r"\|\s*\*{0,2}(R-\d{3})"),
    "T-":   definidos(ESPEC, r"\|\s*\*{0,2}(T-\d{2})"),
    "M-":   definidos(ESPEC, r"\|\s*\*{0,2}(M-\d{2})"),
    "DEC-": definidos(DEC, r"### (DEC-\d{3})"),
}
for pref, defs in univ.items():
    usados = set()
    for nome_doc, texto in docs.items():
        if nome_doc == "decisoes": continue
        usados |= set(re.findall(rf"\b({re.escape(pref)}\d{{2,3}}[A-Z]?)\b", texto))
    # ids explicitamente aposentados ou eliminados no proprio texto sao legitimos
    aposentados = set(re.findall(r"[Aa]posentado[s]? nesta versão:\*{0,2}\s*([^\n]+)", ESPEC))
    aposentados |= set(re.findall(r"Eliminados por perda de objeto:\*{0,2}\s*([^\n]+)", PRD))
    legit = set()
    for linha in aposentados: legit |= set(re.findall(r"\b([A-Z]{1,3}-\d{2,3})\b", linha))
    usados -= legit
    faltando = {u for u in usados if u not in defs}
    if faltando:
        avisos.append(f"referências {pref} usadas e não definidas: {sorted(faltando)}")

# ---------- vocabulário obsoleto ----------
obsoletos = {
    r"conforme a ESPEC v[12]|ESPEC — Sistema Narrativo v2\.[0-5]\b": "referência a versão antiga da ESPEC",
    r"T-01 a T-12": "faixa de testes obsoleta",
    r"O controlador pode adicionar campanhas|distribuído fora do binário|sem release de app": "vocabulário de pacote remoto",
    r"6 capítulos gratuitos|campanha gratuita de 6|espinha autoral de 6": "6 capítulos",
    r"a decidir|a definir|a calibrar|\bTBD\b|\bpendente de decisão\b": "pendência declarada",
    r"### 13\.2 Em aberto|## Questões abertas|Em aberto:": "seção de questões abertas",
    r"estimativa de escrivaninha|só respondível com|não foi escrito": "questão adiada sem decisão",
}
for doc, texto in docs.items():
    if doc == "decisoes": continue
    for pat, desc in obsoletos.items():
        for m in re.finditer(pat, texto, re.I):
            ctx = texto[max(0, m.start()-70):m.end()+70].replace("\n", " ")
            avisos.append(f"[{doc}] {desc}: …{ctx}…")

# ---------- métricas declaradas no protótipo ----------
esp = [s for s in storylets if s["banda"] == "espinha"]
arc = [s for s in storylets if s["banda"] == "arco"]
unidades = sum(len(s["textos"]) for s in storylets)
print(f"  espinha={len(esp)} arco={len(arc)} cor={len(cor)} total={len(storylets)} unidades={unidades}")
print(f"  neutra={len(neutra)}/{len(cor)} = {100*len(neutra)/len(cor):.0f}%  ausencia={len(ausencia)}")
prosa = re.search(r"## 5\. Recurso pt-BR(.*?)\n---", PROTO, re.S).group(1)
palavras = len(re.findall(r"\b[\wÀ-ÿ']+\b", re.sub(r"\*\*.*?\*\*", "", prosa)))
print(f"  palavras de prosa ≈ {palavras}")

for tabela, esperado in [("Storylets de capítulo | 14", len(esp)+len(arc) == 14),
                         ("Storylets de `Cor` | 17", len(cor) == 17),
                         ("Total | 31", len(storylets) == 31),
                         ("Unidades de texto | 34", unidades == 34),
                         ("neutra 13 de 17", len(neutra) == 13)]:
    check(esperado, f"§6 do protótipo: tabela declara '{tabela}' e a ferramenta discorda")

# ---------- saída ----------
print()
if falhas:
    print(f"FALHAS ({len(falhas)}):")
    for f_ in falhas: print("  ✗", f_)
else:
    print("Todas as regras verificáveis: OK")
if avisos:
    print(f"\nAVISOS ({len(avisos)}):")
    for a in avisos: print("  !", a)

# ---------- trava de solubilidade: complicação aberta com ficha zerada ----------
def fecha_forcado(comp, forca=0, vigor=0, destreza=0, rolagem=5):
    est = {q: v["inicial"] for q, v in qualidades.items()}
    est[comp] = 1
    for passo in range(1, 41):
        entradas = {"in.atributo.forca": forca, "in.atributo.vigor": vigor,
                    "in.atributo.destreza": destreza, "in.rolagem": rolagem,
                    "cap.resolucoes": passo}
        def ok(p):
            if not p: return True
            for k, v in p.items():
                if k == "todos": return all(ok(x) for x in v)
                if k == "qualquer": return any(ok(x) for x in v)
                if k == "nenhum": return not any(ok(x) for x in v)
            q = p["q"]; cur = entradas.get(q, est.get(q))
            if cur is None: return False
            for op, tgt in p.items():
                if op == "q": continue
                if op == "eq" and cur != tgt: return False
                if op == "ne" and cur == tgt: return False
                if op == "gte" and cur < tgt: return False
                if op == "lte" and cur > tgt: return False
            return True
        if est[comp] == 0: return True, passo
        cands = [s for s in storylets if s["banda"] == "arco" and ok(s.get("requer"))
                 and any(e["q"] == comp and e.get("definir") == 0 for e in s.get("efeitos", []))]
        if cands:
            for e in max(cands, key=lambda x: x["peso"]).get("efeitos", []):
                if "definir" in e: est[e["q"]] = e["definir"]
    return est[comp] == 0, 40

print("\ntrava de solubilidade (ficha zerada, rolagem no piso):")
for c in [q for q in qualidades if q.startswith("comp.")]:
    okc, passo = fecha_forcado(c)
    print(f"  {c}: {'fecha' if okc else 'NÃO FECHA'} em {passo} resoluções")
    if not okc: falhas.append(f"T-21/trava: {c} não fecha com ficha zerada")

# ordem das variantes do desfecho
d = next(s for s in storylets if s["id"] == "st_c1_desfecho")
primeira = d["textos"][0]
assert "comp.carga_demais" in {a["q"] for a in atomos(primeira.get("quando"))}, \
    "a variante de complicação aberta precisa vir primeiro na ordem de avaliação"
print("  ordem de variantes do desfecho: OK")
print()
if falhas:
    print(f"FALHAS ({len(falhas)}):")
    for f_ in falhas: print("  X", f_)
print("RESULTADO:", "FALHAS" if falhas else "TUDO VERDE")
sys.exit(1 if falhas else 0)
