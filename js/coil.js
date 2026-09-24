/* The recurring object — a slinky wound into a ring.

   Two renderers share one class:

   • The plain one (the work ring, the CTA) is the cheap original: segments bucketed by
     brightness, one stroke per bucket, semi-transparent. ~10 draw calls a frame.

   • The hero one above THE TOOLBOX asks for `wave` and `sharp`. A travelling wave runs
     around the ring's circumference — the tube swells and thins, the whole band lifts out
     of plane — and it is drawn back-to-front with OPAQUE strokes, each wire carrying a
     thin dark outline, so it occludes itself instead of being a net you see through.

     It is shaded as polished metal: a tight Blinn-Phong lobe over a nearly black body,
     plus the sky-to-floor horizon a chrome surface reflects and a rim where it turns away
     from the eye. That contrast is what reads as metal — a diffuse mid-grey ramp reads as
     rubber no matter how good the geometry is. It also needs SHORT segments: shading is
     averaged per stroked segment, so at 7 segments a strand each one covered 51 degrees of
     the ring and the specular washed out to nothing. 22 segments resolves it.

   Performance notes, because several of these share a page:

   • Redraws are capped near 20fps. The ring turns slowly enough that nobody can tell.
   • The backing store is 1x except on the hero object, where 1x aliased the strands into
     grey fuzz — that is exactly the cost worth paying, and only once, and even there it
     is capped at 1.75x rather than the display's true DPR.
   • Off-screen instances do not draw at all.
   • Per-lane colour and line width used to be recomputed every frame — Math.round, a
     divide, a toFixed and an rgb() string built fresh for up to 96 lanes, twice each
     (outline then fill), at 20fps. None of that depends on time, only on which lane a
     segment landed in, so it is now computed once per resize into lookup tables and the
     draw loop just indexes into them. The geometry itself (segs*res points a strand,
     every frame) can't be cached the same way — the object is continuously turning and
     rippling — so that cost stays; this removes the cost that was pure waste.          */

(function () {
  const TAU = Math.PI * 2;
  const BUCKETS = 10;          // brightness lanes, plain renderer
  const DEPTHS = 12;           // depth lanes, hero renderer — these give the occlusion
  const LUMS = 8;              // brightness lanes within a depth lane
  const FRAME_MS = 50;

  /* the wave. K crests around the ring, travelling at WAVE_S rad/s. */
  const WAVE_K = 3;
  const WAVE_R = 0.34;   // how much the tube section breathes
  const WAVE_Z = 0.30;   // how far the band lifts out of plane
  const WAVE_S = 0.55;   // the ripple runs faster than the ring spins

  class Coil {
    constructor(canvas, opts) {
      opts = opts || {};
      this.c = canvas;
      this.light = !!opts.light;
      this.wave = !!opts.wave;
      this.sharp = !!opts.sharp;
      this.x = canvas.getContext('2d', { alpha: this.light, desynchronized: true });
      this.strands = opts.strands || 34;
      this.segs = opts.segs || 7;
      this.res = opts.res || (this.wave ? 9 : 6);
      this.twist = opts.twist || 3;
      this.spin = opts.spin || 0.16;
      this.tilt = opts.tilt === undefined ? 1.02 : opts.tilt;
      this.scale = opts.scale || 0.335;
      this.visible = true;
      this.last = 0;

      // reused each frame so the render loop allocates nothing
      this.nLanes = this.wave ? DEPTHS * LUMS : BUCKETS;
      this.lanes = [];
      for (let i = 0; i < this.nLanes; i++) this.lanes.push([]);
      this.pool = [];

      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(e => { this.visible = e[0].isIntersecting; },
        { rootMargin: '100px' }).observe(canvas);
    }

    resize() {
      const r = this.c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // the small background coils are soft-edged and gain nothing from HiDPI; the hero
      // object does — at 1x its strands alias into grey fuzz and it reads as pencil
      const dpr = this.sharp ? Math.min(devicePixelRatio || 1, 1.75) : 1;
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr);
      this.c.height = Math.round(r.height * dpr);
      this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.lw = Math.max(1, Math.min(r.width, r.height) / 210);
      this.precompute();
      this.last = 0;                       // force a repaint at the new size
    }

    /* every colour and width a lane can use, built once instead of every frame */
    precompute() {
      const lw = this.lw;
      this.fillStyle = new Array(this.nLanes);
      this.fillWidth = new Array(this.nLanes);
      this.outlineWidth = new Array(this.nLanes);
      for (let k = 0; k < this.nLanes; k++) {
        if (this.wave) {
          const df = ((k / LUMS) | 0) / (DEPTHS - 1);
          const t = (k % LUMS) / (LUMS - 1);
          const v = Math.round((12 + t * 243) * (0.5 + 0.5 * df));
          this.fillStyle[k] = 'rgb(' + (v > 2 ? v - 2 : v) + ',' + v + ',' +
            (v + 7 > 255 ? 255 : v + 7) + ')';
          this.fillWidth[k] = lw * (0.86 + df * 0.46);
          this.outlineWidth[k] = this.fillWidth[k] + lw * 0.40;
        } else {
          const t = k / (BUCKETS - 1);
          let v, alpha;
          if (this.light) { v = Math.min(210, Math.round(16 + t * 190)); alpha = 0.6 - t * 0.2; }
          else { v = Math.min(255, Math.round(30 + t * 225)); alpha = 0.16 + t * 0.8; }
          this.fillStyle[k] = 'rgba(' + v + ',' + v + ',' + Math.min(255, v + 5) + ',' +
            alpha.toFixed(3) + ')';
          this.fillWidth[k] = (0.8 + t * 2.4) * lw;
        }
      }
    }

    pt(u, v, rot, o, ph) {
      const R = 1;
      const wv = this.wave ? Math.sin(WAVE_K * u - ph) : 0;
      const r = this.wave ? 0.42 * (1 + WAVE_R * wv) : 0.42;
      const cu = Math.cos(u), su = Math.sin(u), cv = Math.cos(v), sv = Math.sin(v);
      let px = (R + r * cv) * cu, py = (R + r * cv) * su, pz = r * sv + WAVE_Z * wv;
      let nx = cv * cu, ny = cv * su, nz = sv;

      if (this.wave) {
        // tilt the normal by the wave's own slope, or the light ignores the ripple
        // and the crests go flat
        const sl = WAVE_Z * WAVE_K * Math.cos(WAVE_K * u - ph) * nz;
        nx += sl * su; ny -= sl * cu;
        const inv = 1 / Math.sqrt(nx * nx + ny * ny + nz * nz);
        nx *= inv; ny *= inv; nz *= inv;
      }

      const cr = Math.cos(rot), sr = Math.sin(rot);
      let t1 = px * cr - py * sr; py = px * sr + py * cr; px = t1;
      t1 = nx * cr - ny * sr; ny = nx * sr + ny * cr; nx = t1;

      const ct = Math.cos(this.tilt), st = Math.sin(this.tilt);
      t1 = py * ct - pz * st; pz = py * st + pz * ct; py = t1;
      t1 = ny * ct - nz * st; nz = ny * st + nz * ct; ny = t1;

      o.px = px; o.py = py; o.pz = pz; o.nx = nx; o.ny = ny; o.nz = nz;
    }

    draw(time) {
      if (!this.visible || !this.w) return;
      const now = time * 1000;
      if (now - this.last < FRAME_MS) return;
      this.last = now;

      const g = this.x, w = this.w, h = this.h;
      if (this.light) g.clearRect(0, 0, w, h);
      else { g.fillStyle = '#050506'; g.fillRect(0, 0, w, h); }

      const rot = time * this.spin;
      const ph = time * WAVE_S;
      const S = Math.min(w, h) * this.scale;
      const cx = w / 2, cy = h / 2;
      const LX = -0.55, LY = -0.42, LZ = 0.72;
      // two half-vectors, eye straight down +z. Chrome needs more than one source —
      // a single highlight band reads as plastic; two reads as polished steel.
      const HX = -0.2445, HY = -0.2987, HZ = 0.9226;
      const JX = 0.3367, JY = 0.1903, JZ = 0.9223;
      const total = this.segs * this.res;
      const p = this._p || (this._p = {});

      for (let i = 0; i < this.nLanes; i++) this.lanes[i].length = 0;
      let used = 0;

      // pass 1 — build geometry, sorted into lanes
      for (let s = 0; s < this.strands; s++) {
        const off = (s / this.strands) * TAU;
        for (let b = 0; b < this.segs; b++) {
          let lum = 0, dep = 0;
          const pts = this.pool[used] || (this.pool[used] = []);
          used++;
          pts.length = 0;
          for (let i = 0; i <= this.res; i++) {
            const k = b * this.res + i;
            const u = (k / total) * TAU;
            this.pt(u, u * this.twist + off, rot, p, ph);
            const persp = 1 / (2.55 - p.pz * 0.5);
            pts.push(cx + p.px * S * persp * 2.05, cy + p.py * S * persp * 2.05);
            const ndl = p.nx * LX + p.ny * LY + p.nz * LZ;
            if (this.wave) {
              /* Chrome. A metal surface is almost black except for a few very narrow,
                 very bright bands — that contrast is the whole reason it reads as metal
                 rather than rubber. So: a tight specular lobe (^16), a faint diffuse
                 floor, the horizon the surface reflects, and a rim where it turns away
                 from the eye. */
              let sp = p.nx * HX + p.ny * HY + p.nz * HZ;
              sp = sp > 0 ? sp : 0;
              sp *= sp; sp *= sp; sp *= sp;               // ^8
              let s2 = p.nx * JX + p.ny * JY + p.nz * JZ;
              s2 = s2 > 0 ? s2 : 0;
              s2 *= s2; s2 *= s2; s2 *= s2;
              const e = 0.5 + 0.5 * p.ny;                 // what it sees, sky to floor
              const rim = 1 - (p.nz < 0 ? -p.nz : p.nz);
              const r2 = rim * rim;
              lum += 0.05 + (ndl > 0 ? ndl * 0.12 : 0)
                   + e * e * (3 - 2 * e) * 0.26 + sp * 1.5 + s2 * 0.8 + r2 * r2 * 0.25;
            } else if (ndl > 0) lum += ndl;
            dep += p.pz;
          }
          const n = this.res + 1;
          lum /= n; dep /= n;
          let key;
          if (this.wave) {
            // depth-major, so the lane order IS the painter's order
            const front = Math.min(1, Math.max(0, (dep + 0.85) / 1.7));
            let dl = Math.round(front * (DEPTHS - 1));
            let ll = Math.round((lum > 1 ? 1 : lum) * (LUMS - 1));
            if (dl < 0) dl = 0; else if (dl > DEPTHS - 1) dl = DEPTHS - 1;
            if (ll < 0) ll = 0; else if (ll > LUMS - 1) ll = LUMS - 1;
            key = dl * LUMS + ll;
          } else {
            const front = (dep + 1) * 0.5;
            key = Math.round(Math.pow(lum, 1.55) * (0.45 + front * 0.55) * (BUCKETS - 1));
            if (key < 0) key = 0; else if (key > BUCKETS - 1) key = BUCKETS - 1;
          }
          this.lanes[key].push(pts);
        }
      }

      // pass 2 — one path per lane
      g.lineCap = 'round'; g.lineJoin = 'round';
      for (let k = 0; k < this.nLanes; k++) {
        const lane = this.lanes[k];
        if (!lane.length) continue;

        g.beginPath();
        for (let i = 0; i < lane.length; i++) {
          const pts = lane[i];
          g.moveTo(pts[0], pts[1]);
          for (let j = 2; j < pts.length; j += 2) g.lineTo(pts[j], pts[j + 1]);
        }

        if (this.wave) {
          // wire, not tube: a dark outline first (wider), the lane's own colour on top —
          // both looked up rather than rebuilt, this is the only real work left here
          g.strokeStyle = '#050506';
          g.lineWidth = this.outlineWidth[k];
          g.stroke();
          g.strokeStyle = this.fillStyle[k];
          g.lineWidth = this.fillWidth[k];
          g.stroke();
          continue;
        }

        g.strokeStyle = this.fillStyle[k];
        g.lineWidth = this.fillWidth[k];
        g.stroke();
      }
    }
  }

  const coils = [];
  window.COIL_BUILD = 34;
  window.CoilMount = function (canvas, opts) { const c = new Coil(canvas, opts); coils.push(c); return c; };
  window.CoilTick = function (t) { for (let i = 0; i < coils.length; i++) coils[i].draw(t); };
  // exposed so a draw can be timed directly (c.draw(t) in a loop) without fighting
  // Lenis/ScrollTrigger for a real scroll position first — see the README
  window.CoilInstances = coils;
})();
