# sk-folio — Sushrith Kandagatla

A scroll-driven portfolio for a final-year CSE (AI & ML) engineer. Type, motion and
interaction are modelled on two references — cappen.com for the cursor, warp-in type and
scroll rhythm, alche.jp for the tilted-panel work section — recombined into a work act that
orbits its own object.

**The opening.** Black screen, a handwritten *Hello*, then the SK signature draws itself on
over a technical readout — ticks, a filled track, the module being loaded and a three-digit
percentage. The signature is three SVG paths (the S in one stroke, then the pen lifts once for
the K's arm) revealed with `stroke-dashoffset`, and the draw is distributed by real path length
so the pen moves at a steady rate instead of racing through the short strokes. Each stroke
settles from acid to paper as it completes. The greeting wants *Young Coconut*, which is not on
Google Fonts — `--script` in the tokens points at Yellowtail instead, and swapping in a licensed
`@font-face` is a one-line change.

Everything the boot panel covers has to be parked *before* it starts moving. The panel spends
0.9s sliding up before its timeline reports complete, so anything left in its natural state is
on screen for that whole slide: the headline appeared fully formed, held a beat, blanked, and
warped in from nothing, and the laptop was simply sitting there already. `heroLines`, `.rig` and
the meta row are all `gsap.set` to their from-states at init, and `enterHero()` only tweens them
in. Verified: nothing above 0.05 opacity while `#boot` is still in the DOM.

Scroll restoration is turned off in an inline `<script>` in `<head>`, not from `app.js`. A page
with a preloader has to start at the top; left on, a refresh half way down put the boot screen
over a page that was already scrolled there, and when it lifted the hero entrance played on
content you could not see while `ScrollTrigger.refresh()` re-applied every scrubbed state
underneath — which looks exactly like the intro running twice. By the time a script at the end
of `<body>` runs, the restore is already queued.

## Run it

```bash
python serve.py
```

No build step, no install. Open <http://localhost:5183>.

`serve.py` is the plain static server with caching switched off. `python -m http.server`
sends no `Cache-Control`, so the browser applies heuristic freshness and happily serves the
*previous* build after you edit a file — which costs an afternoon the first time it happens.

## The four things that carry the design

**The cursor.** A ring of 16 points orbits the pointer, each on its own spring, drawn as one
closed catmull-rom path. Because every point lags differently the outline is never a circle:
it wobbles at rest, and thrown across the screen the trailing half stretches into a comet
while the leading edge stays tight — velocity also squashes the body along its direction of
travel. Painted with `mix-blend-mode: difference`, so it reads black on paper, white on the
dark sections, and punches the headline letters white where it crosses them. It sits above
every section and never loses visibility. See [`js/cursor.js`](js/cursor.js).

It hides on window blur and comes back on focus. The first version latched a `shown` flag on
the way out and only ever set it once, so a single alt-tab killed the cursor for the rest of
the visit — invisible in a preview pane that never loses focus, and the first thing you hit
in a real browser with other tabs open.

**The warp-in.** Every display line splits to characters that arrive sheared, shrunk and
low-right (`rotate -12° · skewX -28° · scale .55`), then unwind left-to-right on a long
`expo.out` tail. Hero on load, footer on enter. `warpIn()` in [`js/app.js`](js/app.js).

**The ring.** The work section is a real CSS 3D carousel: eight panels on a ring wide enough
that the coil at its centre is never fully covered, each panel fading and dimming by its own
depth. Scroll turns the ring; the front project drives the reading column. "Read the detail"
slides a full description, tech stack and metrics down over the ring.

**The hero machine.** The laptop beside the headline runs a live canvas, not a still. It
cycles three scenes drawn from what is actually on this site — an agent orchestrator running
a round, the hybrid IDS training to its real 98.12%, and Satark.ai going to production — with
an acid wipe between them. Code is drawn as coloured runs rather than legible glyphs, because
at that size real text turns to mush; the lines that matter are set large enough to read. See
[`js/screen.js`](js/screen.js).

**The toolbox.** Two rails of real brand marks running in opposite directions, nudged by
scroll velocity. The icons are simple-icons (CC0), downloaded once by
`assets/get_icons.py` with each brand's own hex baked in, so there is no CDN at runtime.

**The capability figure.** The About column carries a cutting pattern rather than a list: a
head-and-shoulders silhouette with a stitched outline and notches where a real pattern would
have them, and the capabilities set *inside* the shape. Running over one lights its notch and
writes the long form underneath. Positions live in `caps` in `js/data.js`, in the figure's own
460x520 viewBox.

**The contact section.** The left half is a game of Snake — arrows or WASD, Enter to start,
best score kept in `localStorage`. It replaced a terminal that typed a paragraph at you and then
sat there, which was a lot of screen for something you read once. It runs a frame loop only
while it is being played *and* on screen *and* the tab is visible; the rest of the time it costs
nothing. See [`js/game.js`](js/game.js).

The right half is a note stuck to the page — pale paper, tape, a slight angle it straightens out
of when you reach for it — carrying the rules rather than the CV. Everything on it is absent
from the rest of the site, which is the whole point: the first version repeated the degree, the
university and the year, all of which appear twice elsewhere already.

**The certificate wall.** Five poster cards on cream mats. Odd ones enter from above, even
ones from below, then keep drifting past each other on scroll — the effect the reference
gets from its award wall.

**Performance.** The coil renderer is the one thing on the page that can cost real frames, so
it is written for it: segments are bucketed and each bucket stroked once (~10 draw calls a frame
instead of ~400, or up to 96 for the hero object's depth lanes), redraws are capped near 20fps,
backing stores are 1x except on the hero, and off-screen instances do not draw at all. The hero
object costs 1.14ms per draw at 38 strands x 18 segments — about 2.3% of one core at its 20fps
cap. If you add strands or segments, re-measure — and time `window.CoilTick()` in a loop rather
than sampling rAF, which gets throttled the moment the window drops behind and reports garbage
(a p95 of two seconds, on a page that is actually fine).

**The coil.** One canvas object, three instances, two renderers. The work ring and the CTA
get the cheap one: segments bucketed by brightness, one semi-transparent stroke per bucket.
The hero above THE TOOLBOX asks for `wave` and `sharp` and gets the other one — a travelling
wave runs around the ring so the tube swells and the band lifts out of plane, and the segments
are bucketed by *depth*, then drawn back to front with opaque strokes and a thin dark outline
each, so the object occludes itself instead of being a net you see through.

It is shaded as polished metal: two tight Blinn-Phong lobes over a nearly black body, the
sky-to-floor horizon a chrome surface reflects, and a rim term where the surface turns away
from the eye. The contrast is the point — a diffuse mid-grey ramp reads as rubber no matter how
good the geometry is, and depth is allowed to darken only the bottom of the ramp so the near
wires still reach white. It also needs *short* segments: shading is averaged per stroked
segment, and at 7 segments a strand each one spanned 51° of the ring, which washed the specular
out completely. 18 resolves it. 2x backing store, which none of the others need.

Segment count is the thing to watch, and it is not linear. 38 strands x 18 segments costs
**1.14ms a draw**; 44 x 22 — only 2.3x the segments — costs **58ms**, which is a stall you can
feel. Stroked segments carry round caps at both ends, and past a few hundred subpaths per frame
the rasteriser falls off a cliff. Re-measure after any change, and treat anything over ~2ms as
a regression. Idles at 0 when off-screen.

## Layout

| file | what it owns |
|---|---|
| `js/app.js` | scroll choreography, the ring, section rendering, boot |
| `js/cursor.js` | the water cursor |
| `js/coil.js` | the torus object, canvas 2D, light and dark themes |
| `js/screen.js` | the hero laptop screen and its three scenes |
| `js/game.js` | the Snake board in the contact section |
| `assets/get_icons.py` | pulls the brand icons in and colours them |
| `js/data.js` | every fact on the page — projects, stack, achievements, certs |
| `css/app.css` | the whole type and layout system |

## Type

- Display — **Inter 900** at `opsz 32`, `-0.045em`
- Serif — **Instrument Serif**, roman mixed with italic
- Mono — **JetBrains Mono** for nav, tags, counters and the contact terminal

## Imagery

Four projects use real screenshots of the deployed site, captured headlessly:

```bash
python assets/shoot.py https://your-site.example assets/art/shot-name.jpg 7000
```

`shoot.py` drives Chrome over the DevTools protocol so it can dismiss tour modals and consent
banners before the shot — a plain `chrome --screenshot` bakes them in.

The four projects with no live site get a drawn laptop screen of what the system actually
does — a RAG retrieval loop, an autoencoder training curve, a translation pipeline, a routing
topology. Regenerate with:

```bash
python assets/gen_screens.py
```

Drop a real screenshot into `assets/art/` and point `js/data.js` at it to replace one.
