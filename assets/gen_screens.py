"""Laptop screens for the projects that have no live site to photograph.

Each one is a real depiction of what the project actually does — a RAG retrieval loop,
an autoencoder training curve, a translation pipeline, a routing topology — drawn as a
laptop sitting on the page's own paper colour so it drops straight into the work ring.

Run:  python gen_screens.py
"""
import math, os, random

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "art")
os.makedirs(OUT, exist_ok=True)

PAPER = "#EFEEE8"
BODY  = "#C9C8C2"
BEZEL = "#141417"
SCR   = "#0A0A0C"
ACID  = "#C6F24E"

W, H = 1600, 1100
SX, SY, SW, SH = 240, 120, 1120, 700     # screen rect


def frame(uid, inner):
    """Laptop chassis: screen, bezel, hinge, deck."""
    s = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">',
         f'<defs><clipPath id="s{uid}"><rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="4"/></clipPath>',
         f'<linearGradient id="d{uid}" x1="0" y1="0" x2="0" y2="1">'
         f'<stop offset="0%" stop-color="#DEDDD7"/><stop offset="100%" stop-color="#B4B3AD"/></linearGradient>',
         f'<linearGradient id="gl{uid}" x1="0" y1="0" x2="1" y2="1">'
         f'<stop offset="0%" stop-color="#fff" stop-opacity="0.10"/>'
         f'<stop offset="45%" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>',
         f'<rect width="{W}" height="{H}" fill="{PAPER}"/>',
         # lid
         f'<rect x="{SX-26}" y="{SY-26}" width="{SW+52}" height="{SH+62}" rx="14" fill="{BEZEL}"/>',
         f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="4" fill="{SCR}"/>',
         f'<circle cx="{W/2}" cy="{SY-13}" r="4" fill="#2A2A30"/>',
         f'<g clip-path="url(#s{uid})">{inner}</g>',
         f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" rx="4" fill="url(#gl{uid})"/>',
         # deck + hinge
         f'<path d="M{SX-150} {SY+SH+40} L{SX+SW+150} {SY+SH+40} L{SX+SW+240} {SY+SH+118} '
         f'L{SX-240} {SY+SH+118} Z" fill="url(#d{uid})"/>',
         f'<rect x="{SX-26}" y="{SY+SH+32}" width="{SW+52}" height="10" rx="5" fill="#0E0E10"/>',
         f'<rect x="{W/2-90}" y="{SY+SH+92}" width="180" height="9" rx="5" fill="#9E9D97"/>',
         '</svg>']
    return "".join(s)


def code_lines(x, y, w, rows, seed, acid_every=5):
    """Syntax-coloured code block."""
    rnd = random.Random(seed)
    out, cy = [], y
    for i in range(rows):
        ind = rnd.choice([0, 0, 1, 1, 2]) * 22
        segs, sx = [], x + ind
        for _ in range(rnd.randint(2, 4)):
            sw = rnd.randint(40, 150)
            if sx + sw > x + w:
                break
            col = ACID if i % acid_every == 0 else rnd.choice(["#7C8798", "#B8C0CC", "#6F7A8C", "#8FA8FF"])
            segs.append(f'<rect x="{sx}" y="{cy}" width="{sw}" height="9" rx="2" fill="{col}" '
                        f'opacity="{rnd.uniform(.45,.95):.2f}"/>')
            sx += sw + 14
        out += segs
        cy += 26
    return "".join(out)


# ── 1. Outcome-QBank — retrieval loop ────────────────────────────────────────
def qbank():
    g = [f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" fill="#08080B"/>',
         f'<rect x="{SX}" y="{SY}" width="{SW}" height="34" fill="#121216"/>',
         f'<text x="{SX+18}" y="{SY+23}" fill="#7C8798" font-family="JetBrains Mono,monospace" '
         f'font-size="14">outcome_qbank / retrieve.py</text>',
         f'<rect x="{SX}" y="{SY+34}" width="480" height="{SH-34}" fill="#0C0C10"/>']
    g.append(code_lines(SX + 24, SY + 66, 430, 22, 7))
    # retrieval panel
    px = SX + 520
    g.append(f'<text x="{px}" y="{SY+74}" fill="{ACID}" font-family="JetBrains Mono,monospace" '
             f'font-size="15">CHROMADB · top-k = 6</text>')
    for i in range(6):
        yy = SY + 100 + i * 60
        sc = 0.94 - i * 0.09
        g.append(f'<rect x="{px}" y="{yy}" width="540" height="44" rx="4" fill="#15151A" '
                 f'stroke="#26262E"/>')
        g.append(f'<rect x="{px+14}" y="{yy+14}" width="{int(300*sc)}" height="7" rx="3" fill="#8FA8FF" opacity="0.8"/>')
        g.append(f'<rect x="{px+14}" y="{yy+27}" width="{int(210*sc)}" height="6" rx="3" fill="#41414C"/>')
        g.append(f'<text x="{px+470}" y="{yy+28}" fill="{ACID}" font-family="JetBrains Mono,monospace" '
                 f'font-size="13">{sc:.2f}</text>')
    g.append(f'<rect x="{px}" y="{SY+474}" width="540" height="86" rx="4" fill="#101014" stroke="{ACID}" stroke-opacity="0.45"/>')
    g.append(f'<text x="{px+16}" y="{SY+504}" fill="{ACID}" font-family="JetBrains Mono,monospace" '
             f'font-size="13">critique → retry  (attempt 2/3)</text>')
    g.append(f'<text x="{px+16}" y="{SY+528}" fill="#7C8798" font-family="JetBrains Mono,monospace" '
             f'font-size="12">outcome CO3 not covered — regenerating</text>')
    return "".join(g)


# ── 2. Hybrid IDS — training curves + confusion ──────────────────────────────
def ids():
    g = [f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" fill="#08080B"/>',
         f'<text x="{SX+30}" y="{SY+50}" fill="#E6E6EA" font-family="Inter,sans-serif" '
         f'font-weight="700" font-size="22">MLP + AutoEncoder · CSE-CIC-IDS2018</text>']
    # loss curves
    ox, oy, ow, oh = SX + 30, SY + 90, 620, 330
    g.append(f'<rect x="{ox}" y="{oy}" width="{ow}" height="{oh}" fill="#0C0C10" stroke="#20202A"/>')
    for i in range(5):
        yy = oy + oh * i / 4
        g.append(f'<line x1="{ox}" y1="{yy:.0f}" x2="{ox+ow}" y2="{yy:.0f}" stroke="#1C1C24"/>')
    for name, col, k in (("train", ACID, 1.0), ("val", "#8FA8FF", 0.82)):
        pts = []
        for i in range(61):
            t = i / 60
            v = (math.exp(-t * 3.4) * 0.86 + 0.06) * k + math.sin(i * 1.7) * 0.012
            pts.append(f"{ox + t*ow:.1f},{oy + v*oh:.1f}")
        g.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{col}" stroke-width="2.4"/>')
    g.append(f'<text x="{ox+14}" y="{oy+26}" fill="#7C8798" font-family="JetBrains Mono,monospace" font-size="13">loss</text>')
    # confusion matrix
    cx, cy2, cell = SX + 700, SY + 90, 76
    for r in range(4):
        for c in range(4):
            v = 0.93 if r == c else random.Random(r * 9 + c).uniform(0.0, 0.08)
            g.append(f'<rect x="{cx + c*cell}" y="{cy2 + r*cell}" width="{cell-5}" height="{cell-5}" '
                     f'rx="3" fill="{ACID}" opacity="{0.08 + v*0.9:.2f}"/>')
    g.append(f'<text x="{cx}" y="{cy2+340}" fill="#7C8798" font-family="JetBrains Mono,monospace" '
             f'font-size="13">confusion · 4 classes</text>')
    # metric strip
    for i, (k, v) in enumerate([("ACCURACY", "98.12%"), ("MACRO-F1", "96.95%"), ("FN ↓ vs RF", "-41%")]):
        bx = SX + 30 + i * 370
        g.append(f'<rect x="{bx}" y="{SY+470}" width="340" height="96" rx="5" fill="#101015" stroke="#23232C"/>')
        g.append(f'<text x="{bx+20}" y="{SY+502}" fill="#6E6E7A" font-family="JetBrains Mono,monospace" font-size="12">{k}</text>')
        g.append(f'<text x="{bx+20}" y="{SY+544}" fill="{ACID}" font-family="Inter,sans-serif" '
                 f'font-weight="800" font-size="34">{v}</text>')
    return "".join(g)


# ── 3. Voice translation — pipeline + waveform ───────────────────────────────
def voice():
    g = [f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" fill="#08080B"/>',
         f'<text x="{SX+30}" y="{SY+50}" fill="#E6E6EA" font-family="Inter,sans-serif" '
         f'font-weight="700" font-size="22">Whisper → M2M100 → XTTS v2 · on-device</text>']
    for i, (lab, col) in enumerate([("WHISPER  STT", "#8FA8FF"), ("M2M100  TRANSLATE", ACID),
                                    ("XTTS v2  CLONE", "#FF9E7A")]):
        bx = SX + 40 + i * 360
        g.append(f'<rect x="{bx}" y="{SY+90}" width="300" height="80" rx="6" fill="#101016" stroke="{col}" stroke-opacity="0.5"/>')
        g.append(f'<text x="{bx+20}" y="{SY+138}" fill="{col}" font-family="JetBrains Mono,monospace" font-size="14">{lab}</text>')
        if i < 2:
            g.append(f'<path d="M{bx+310} {SY+130} L{bx+348} {SY+130} M{bx+338} {SY+122} L{bx+348} {SY+130} '
                     f'L{bx+338} {SY+138}" stroke="#4A4A56" stroke-width="2" fill="none"/>')
    # dual waveform
    for row, (col, amp) in enumerate([("#8FA8FF", 1.0), (ACID, 0.82)]):
        base = SY + 250 + row * 190
        g.append(f'<line x1="{SX+40}" y1="{base}" x2="{SX+SW-40}" y2="{base}" stroke="#1E1E26"/>')
        rnd = random.Random(row * 31 + 3)
        for i in range(130):
            x = SX + 46 + i * 8
            h = abs(math.sin(i * 0.29 + row) * math.sin(i * 0.071)) * 62 * amp * rnd.uniform(.5, 1.25)
            g.append(f'<rect x="{x}" y="{base-h:.0f}" width="4" height="{h*2:.0f}" rx="2" fill="{col}" '
                     f'opacity="{0.35 + h/90:.2f}"/>')
    g.append(f'<text x="{SX+40}" y="{SY+228}" fill="#6E6E7A" font-family="JetBrains Mono,monospace" font-size="13">source · en</text>')
    g.append(f'<text x="{SX+40}" y="{SY+418}" fill="#6E6E7A" font-family="JetBrains Mono,monospace" font-size="13">cloned · hi — same voice</text>')
    g.append(f'<text x="{SX+SW-300}" y="{SY+660}" fill="{ACID}" font-family="JetBrains Mono,monospace" '
             f'font-size="14">Raspberry Pi · 4 GB</text>')
    return "".join(g)


# ── 4. EIBP on FABRIC — topology ─────────────────────────────────────────────
def eibp():
    g = [f'<rect x="{SX}" y="{SY}" width="{SW}" height="{SH}" fill="#08080B"/>',
         f'<text x="{SX+30}" y="{SY+50}" fill="#E6E6EA" font-family="Inter,sans-serif" '
         f'font-weight="700" font-size="22">EIBP replacing OSPF · FABRIC testbed</text>']
    rnd = random.Random(11)
    nodes = [(SX + 120 + rnd.uniform(0, 900), SY + 130 + rnd.uniform(0, 420)) for _ in range(13)]
    for i, (x1, y1) in enumerate(nodes):
        for x2, y2 in nodes[i + 1:]:
            if math.hypot(x2 - x1, y2 - y1) < 330:
                g.append(f'<line x1="{x1:.0f}" y1="{y1:.0f}" x2="{x2:.0f}" y2="{y2:.0f}" '
                         f'stroke="#2C2C38" stroke-width="1.4"/>')
    # the converged path
    path = [nodes[0], nodes[4], nodes[7], nodes[11]]
    g.append('<polyline points="' + " ".join(f"{x:.0f},{y:.0f}" for x, y in path) +
             f'" fill="none" stroke="{ACID}" stroke-width="3"/>')
    for i, (x, y) in enumerate(nodes):
        on = (x, y) in path
        g.append(f'<circle cx="{x:.0f}" cy="{y:.0f}" r="{13 if on else 9}" fill="{ACID if on else "#1A1A22"}" '
                 f'stroke="{ACID if on else "#3A3A46"}" stroke-width="2"/>')
        g.append(f'<text x="{x+18:.0f}" y="{y+5:.0f}" fill="#6E6E7A" font-family="JetBrains Mono,monospace" '
                 f'font-size="12">r{i}</text>')
    g.append(f'<rect x="{SX+30}" y="{SY+588}" width="{SW-60}" height="88" rx="5" fill="#101015" stroke="#23232C"/>')
    for i, t in enumerate(["DEST      NEXT-HOP   METRIC", "10.0.4.0  r7         12",
                           "10.0.9.0  r11        19"]):
        g.append(f'<text x="{SX+50}" y="{SY+616+i*24}" fill="{"#6E6E7A" if i==0 else ACID}" '
                 f'font-family="JetBrains Mono,monospace" font-size="13">{t}</text>')
    return "".join(g)


for name, fn, uid in (("qbank", qbank, 1), ("ids", ids, 2), ("voice", voice, 3), ("eibp", eibp, 4)):
    with open(os.path.join(OUT, f"work-{name}.svg"), "w", encoding="utf-8") as f:
        f.write(frame(uid, fn()))
    print("wrote", f"work-{name}.svg")
