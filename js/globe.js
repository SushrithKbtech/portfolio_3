/* A globe for the Location app.

   Orthographic projection of a graticule — meridians and parallels — with the far side
   simply not drawn, which is all the hidden-surface removal a wireframe sphere needs.
   Bengaluru sits at its real coordinates and goes round the back with everything else.

   Coastlines come from js/world.js — Natural Earth 110m land, decoded from TopoJSON at
   build time and baked in, so there is no fetch and no decoder at runtime. Capped near
   20fps and idle when the window it lives in is closed or off screen. */

(function () {
  const TAU = Math.PI * 2;
  const RAD = Math.PI / 180;
  const FRAME_MS = 50;
  const TILT = 20 * RAD;              // looking slightly down on the equator
  const HOME = { lat: 12.9716, lon: 77.5946, name: 'Bengaluru' };

  class Globe {
    constructor(canvas) {
      this.c = canvas;
      this.x = canvas.getContext('2d');
      this.visible = true;
      this.awake = true;              // the app window is open
      this.last = 0;
      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(e => { this.visible = e[0].isIntersecting; },
        { rootMargin: '80px' }).observe(canvas);
    }

    resize() {
      const r = this.c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr);
      this.c.height = Math.round(r.height * dpr);
      this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.last = 0;
    }

    /* lat/lon → screen, plus the z that says which side of the world it is on */
    pt(lat, lon, spin, cx, cy, R) {
      const la = lat * RAD, lo = lon * RAD + spin;
      const cl = Math.cos(la), sl = Math.sin(la);
      const x = cl * Math.sin(lo);
      const y = cl * Math.cos(lo);
      const z = sl;
      // tilt about the x axis so we see the north pole
      const yy = y * Math.cos(TILT) - z * Math.sin(TILT);
      const zz = y * Math.sin(TILT) + z * Math.cos(TILT);
      return { x: cx + x * R, y: cy - zz * R, z: yy };   // z > 0 is the near side
    }

    arc(pts, cx, cy, R, spin, step, fixed, isMeridian) {
      const g = this.x;
      let drawing = false;
      for (let i = 0; i <= pts; i++) {
        const t = -180 + (360 / pts) * i;
        const p = isMeridian
          ? this.pt(t / 2, fixed, spin, cx, cy, R)      // lat runs -90..90
          : this.pt(fixed, t, spin, cx, cy, R);
        if (p.z > 0) {
          if (!drawing) { g.moveTo(p.x, p.y); drawing = true; }
          else g.lineTo(p.x, p.y);
        } else drawing = false;
      }
    }

    draw(time) {
      if (!this.visible || !this.awake || !this.w) return;
      const now = time * 1000;
      if (now - this.last < FRAME_MS) return;
      this.last = now;

      const g = this.x, w = this.w, h = this.h;
      g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      const R = Math.min(w, h) * 0.42;
      const spin = time * 0.12;

      // the body of the sphere, lit from the upper left
      const grad = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      grad.addColorStop(0, 'rgba(198,242,78,.13)');
      grad.addColorStop(0.55, 'rgba(124,142,255,.07)');
      grad.addColorStop(1, 'rgba(10,10,11,.5)');
      g.fillStyle = grad;
      g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.fill();

      g.lineWidth = 1;
      g.strokeStyle = 'rgba(242,241,236,.16)';
      g.beginPath();
      for (let lon = -180; lon < 180; lon += 20) this.arc(90, cx, cy, R, spin, 20, lon, true);
      for (let lat = -60; lat <= 60; lat += 20) this.arc(90, cx, cy, R, spin, 20, lat, false);
      g.stroke();

      // the equator carries a little more weight, as it does on a real one
      g.strokeStyle = 'rgba(242,241,236,.42)';
      g.beginPath();
      this.arc(120, cx, cy, R, spin, 20, 0, false);
      g.stroke();

      // the coastlines, drawn over the grid and brighter than it — one path for the lot,
      // with the pen lifted wherever a ring crosses the horizon
      const land = window.WORLD;
      if (land) {
        g.strokeStyle = 'rgba(242,241,236,.62)';
        g.lineWidth = 1.15;
        g.lineJoin = 'round';
        g.beginPath();
        for (let r = 0; r < land.length; r++) {
          const ring = land[r];
          let drawing = false;
          for (let i = 0; i < ring.length; i += 2) {
            const q = this.pt(ring[i + 1], ring[i], spin, cx, cy, R);
            if (q.z > 0) {
              if (drawing) g.lineTo(q.x, q.y);
              else { g.moveTo(q.x, q.y); drawing = true; }
            } else drawing = false;
          }
        }
        g.stroke();
      }

      g.strokeStyle = 'rgba(242,241,236,.22)';
      g.lineWidth = 1;
      g.beginPath(); g.arc(cx, cy, R, 0, TAU); g.stroke();

      // home
      const p = this.pt(HOME.lat, HOME.lon, spin, cx, cy, R);
      if (p.z > 0) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 2.2);
        g.strokeStyle = `rgba(198,242,78,${(0.5 - pulse * 0.42).toFixed(3)})`;
        g.lineWidth = 1.4;
        g.beginPath(); g.arc(p.x, p.y, 4 + pulse * 11, 0, TAU); g.stroke();
        g.fillStyle = '#C6F24E';
        g.beginPath(); g.arc(p.x, p.y, 3.6, 0, TAU); g.fill();
      }
    }
  }

  let globe = null;
  window.GlobeMount = function (canvas) { globe = new Globe(canvas); return globe; };
  window.GlobeWake = function (on) { if (globe) { globe.awake = on; globe.last = 0; } };
  window.GlobeTick = function (t) { if (globe) globe.draw(t); };
})();
