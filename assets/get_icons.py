"""Pull the tech-stack icons in, once, and colour them to each brand's own hex.

simple-icons ships monochrome paths plus the official colour for every brand, so this
downloads the ones this site actually uses and bakes the right fill into each file. They
then live in assets/icons/ and the page has no runtime dependency on a CDN.

simple-icons is CC0.

Run:  python get_icons.py
"""
import json, os, re, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "icons")
os.makedirs(OUT, exist_ok=True)

CDN = "https://cdn.jsdelivr.net/npm/simple-icons@13"

# slug -> label shown under the icon. Order is the order they ride the rails.
WANT = [
    ("python", "Python"), ("pytorch", "PyTorch"), ("openai", "OpenAI"),
    ("huggingface", "Hugging Face"), ("langchain", "LangGraph"),
    ("scikitlearn", "scikit-learn"), ("numpy", "NumPy"), ("pandas", "pandas"),
    ("jupyter", "Jupyter"), ("streamlit", "Streamlit"),
    ("react", "React"), ("nextdotjs", "Next.js"), ("typescript", "TypeScript"),
    ("javascript", "JavaScript"), ("threedotjs", "Three.js"),
    ("tailwindcss", "Tailwind"), ("vite", "Vite"), ("greensock", "GSAP"),
    ("nodedotjs", "Node.js"), ("express", "Express"), ("supabase", "Supabase"),
    ("postgresql", "PostgreSQL"), ("mongodb", "MongoDB"), ("fastapi", "FastAPI"),
    ("docker", "Docker"), ("git", "Git"), ("github", "GitHub"),
    ("vercel", "Vercel"), ("linux", "Linux"), ("c", "C"),
    ("raspberrypi", "Raspberry Pi"), ("googlecloud", "Google Cloud"),
]

# a few read badly as pure brand colour on a dark ground
OVERRIDE = {"nextdotjs": "FFFFFF", "vercel": "FFFFFF", "express": "FFFFFF",
            "github": "FFFFFF", "threedotjs": "FFFFFF", "openai": "FFFFFF"}


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": "sk-folio/1.0"})
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read()


print("fetching icon metadata …")
meta = json.loads(get(f"{CDN}/_data/simple-icons.json").decode("utf-8"))
icons = meta["icons"] if isinstance(meta, dict) else meta
hexes = {}
for it in icons:
    slug = it.get("slug") or re.sub(r"[^a-z0-9]", "", it["title"].lower())
    hexes[slug] = it.get("hex", "999999")

manifest, missing = [], []
for slug, label in WANT:
    try:
        svg = get(f"{CDN}/icons/{slug}.svg").decode("utf-8")
    except Exception as e:
        missing.append(slug)
        continue
    hx = OVERRIDE.get(slug, hexes.get(slug, "999999"))
    # simple-icons paths carry no fill, so give the path the brand colour outright
    svg = svg.replace("<svg ", f'<svg fill="#{hx}" ', 1)
    with open(os.path.join(OUT, f"{slug}.svg"), "w", encoding="utf-8") as f:
        f.write(svg)
    manifest.append({"slug": slug, "label": label, "hex": hx})

with open(os.path.join(OUT, "manifest.json"), "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=1)

print(f"wrote {len(manifest)} icons -> {OUT}")
if missing:
    print("missing:", ", ".join(missing))
