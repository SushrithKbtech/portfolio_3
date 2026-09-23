/* The cursor — a free-form body of water, not a circle.

   A ring of points orbits the pointer, each one on its own spring. Because every point
   lags slightly differently the outline is never a clean circle: it wobbles at rest and,
   when you throw the pointer across the screen, the trailing half stretches out into a
   comet while the leading edge stays tight. Velocity also squashes the whole body along
   its direction of travel, the way a droplet deforms when it is flung.

   Rendered as one closed catmull-rom path so the silhouette stays smooth, and painted with
   mix-blend-mode:difference — over the paper it reads black, over the black headline the
   letters punch out white. */

(function () {
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

  const root  = document.querySelector('.cursor');
  const path  = document.querySelector('.cursor__path');
  const label = document.querySelector('.cursor-label');
  const labelText = label?.querySelector('span');
  if (!root || !path) return;

  const N = 16;                      // outline points
  const BASE = 19;                   // resting radius
  let target = BASE;                 // grows on text, shrinks on links

  const cx0 = innerWidth / 2, cy0 = innerHeight / 2;
  // each point springs at its own rate — this is what stops it being a circle
  const pts = Array.from({ length: N }, (_, i) => ({
    a: (i / N) * Math.PI * 2,
    x: cx0, y: cy0,
    k: 0.18 + 0.13 * Math.sin(i * 2.4) ** 2,   // stiffness, varies around the ring
    vx: 0, vy: 0,
  }));

  let tx = cx0, ty = cy0, px = cx0, py = cy0;
  let vx = 0, vy = 0, r = BASE;
  let seen = false;                  // has the pointer ever been in the window
  let lx = cx0, ly = cy0;

  const show = () => { seen = true; root.classList.add('on'); };

  addEventListener('pointermove', e => {
    tx = e.clientX; ty = e.clientY;
    show();
  }, { passive: true });

  // deliberately no pointerleave/mouseout hide: the blob stays with you the whole page,
  // right down into the footer. Only leaving the WINDOW puts it away — and coming back
  // brings it straight back. The first version latched `shown` on the way out and never
  // cleared it, so one alt-tab killed the cursor for the rest of the visit.
  addEventListener('blur',  () => root.classList.remove('on'));
  addEventListener('focus', () => { if (seen) show(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && seen) show();
  });
  addEventListener('pointerdown', () => { target = BASE * 0.55; });
  addEventListener('pointerup',   () => { target = BASE; });

  /* over anything clickable the body tightens to a bead; over display type it swells */
  const HOT = 'a,button,[data-cursor],.panel,.ach,.cert';
  document.addEventListener('pointerover', e => {
    const hot = e.target.closest?.(HOT);
    if (hot) {
      target = BASE * 0.5;
      const l = hot.dataset.cursor || '';
      if (l && labelText) { labelText.textContent = l; label.classList.add('on'); }
      return;
    }
    if (e.target.closest?.('h1,h2,.mani__h,.foot__h')) target = BASE * 3.4;
    else target = BASE;
  });
  document.addEventListener('pointerout', e => {
    if (e.target.closest?.(HOT) && !e.relatedTarget?.closest?.(HOT)) {
      target = BASE;
      label?.classList.remove('on');
    }
  });

  /* closed catmull-rom → cubic bézier, so 16 points read as one liquid silhouette */
  function toPath(p) {
    let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
    for (let i = 0; i < p.length; i++) {
      const p0 = p[(i - 1 + p.length) % p.length];
      const p1 = p[i];
      const p2 = p[(i + 1) % p.length];
      const p3 = p[(i + 2) % p.length];
      const c1x = p1.x + (p2.x - p0.x) / 6, c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6, c2y = p2.y - (p3.y - p1.y) / 6;
      d += `C${c1x.toFixed(1)} ${c1y.toFixed(1)},${c2x.toFixed(1)} ${c2y.toFixed(1)},` +
           `${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
    }
    return d + 'Z';
  }

  let t = 0;
  (function raf() {
    t += 0.016;

    // the body centre trails the pointer, and its own velocity drives the deformation
    const nx = px + (tx - px) * 0.28;
    const ny = py + (ty - py) * 0.28;
    vx = vx * 0.82 + (nx - px) * 0.18;
    vy = vy * 0.82 + (ny - py) * 0.18;
    px = nx; py = ny;

    const speed = Math.min(Math.hypot(vx, vy), 34);
    const dir = Math.atan2(vy, vx);
    const stretch = 1 + speed * 0.075;      // along travel
    const squash  = 1 / (1 + speed * 0.034); // across it
    r += (target - r) * 0.16;

    for (let i = 0; i < N; i++) {
      const p = pts[i];
      // resting shape: a circle breathing slightly out of phase — never a perfect one
      const wob = 1 + 0.11 * Math.sin(t * 2.1 + p.a * 3) + 0.07 * Math.sin(t * 1.3 + p.a * 5);
      const rr = r * wob;
      // deform in the travel frame, then rotate back into screen space
      const lxp = Math.cos(p.a - dir) * rr * stretch;
      const lyp = Math.sin(p.a - dir) * rr * squash;
      const gx = px + lxp * Math.cos(dir) - lyp * Math.sin(dir);
      const gy = py + lxp * Math.sin(dir) + lyp * Math.cos(dir);
      // points on the trailing side are slacker, so fast moves smear into a tail
      const trail = 0.5 + 0.5 * Math.cos(p.a - dir);       // 1 leading, 0 trailing
      const k = p.k * (0.45 + trail * 0.85);
      p.vx = (p.vx + (gx - p.x) * k) * 0.62;
      p.vy = (p.vy + (gy - p.y) * k) * 0.62;
      p.x += p.vx; p.y += p.vy;
    }

    path.setAttribute('d', toPath(pts));

    if (label) {
      lx += (tx - lx) * 0.2; ly += (ty - ly) * 0.2;
      label.style.transform =
        `translate3d(${lx.toFixed(1)}px,${(ly + 46).toFixed(1)}px,0) translate(-50%,-50%)`;
    }
    requestAnimationFrame(raf);
  })();
})();
