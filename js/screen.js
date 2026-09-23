/* The hero laptop screen.

   A live canvas rather than a still: it cycles three scenes drawn from what is actually
   on this site — an agent orchestrator running a round, the hybrid IDS training to its
   real numbers, and Satark.ai going to production. Code is rendered as coloured runs
   rather than legible text, because at this size real glyphs turn to mush; the one or two
   lines that matter are set large enough to read.

   Idles at ~0% CPU when scrolled out of view. */

(function () {
  const ACID = '#C6F24E', BLUE = '#8FA8FF', WARM = '#FF9E7A';
  const MUTE = '#5A6270', TEXT = '#C8CCD4';
  const SCENE_MS = 5600, WIPE_MS = 620;

  class Screen {
    constructor(canvas) {
      this.c = canvas;
      this.x = canvas.getContext('2d', { alpha: false });
      this.t0 = performance.now();
      this.visible = true;
      this.resize();
      new ResizeObserver(() => this.resize()).observe(canvas);
      new IntersectionObserver(([e]) => { this.visible = e.isIntersecting; },
        { rootMargin: '150px' }).observe(canvas);

      // deterministic "code" so it doesn't reshuffle every frame
      const rnd = mulberry(7);
      this.code = Array.from({ length: 16 }, () => ({
        ind: Math.floor(rnd() * 3),
        runs: Array.from({ length: 2 + Math.floor(rnd() * 3) }, () => ({
          w: 0.08 + rnd() * 0.26,
          c: rnd() < 0.17 ? ACID : rnd() < 0.4 ? BLUE : rnd() < 0.6 ? MUTE : TEXT,
        })),
      }));
      this.nodes = [
        [0.22, 0.24], [0.62, 0.16], [0.84, 0.44],
        [0.58, 0.58], [0.2, 0.62], [0.44, 0.38],
      ];
      this.edges = [[0, 5], [5, 1], [1, 2], [2, 3], [3, 5], [5, 4], [4, 3]];
    }

    resize() {
      const r = this.c.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const dpr = Math.min(devicePixelRatio || 1, 1.25);
      this.w = r.width; this.h = r.height;
      this.c.width = Math.round(r.width * dpr);
      this.c.height = Math.round(r.height * dpr);
      this.x.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    /* ── chrome ──────────────────────────────────────────────────────────── */
    chrome(title) {
      const g = this.x, w = this.w, bar = Math.max(16, this.h * 0.085);
      g.fillStyle = '#121218';
      g.fillRect(0, 0, w, bar);
      const r = bar * 0.16;
      ['#3A3A44', '#3A3A44', '#3A3A44'].forEach((c, i) => {
        g.fillStyle = c;
        g.beginPath(); g.arc(bar * 0.55 + i * bar * 0.42, bar / 2, r, 0, 7); g.fill();
      });
      g.fillStyle = MUTE;
      g.font = `${Math.max(7, this.h * 0.045)}px "JetBrains Mono", monospace`;
      g.textBaseline = 'middle';
      g.fillText(title, bar * 2.2, bar / 2 + 0.5);
      return bar;
    }

    /* ── scene A · agents ────────────────────────────────────────────────── */
    agents(p) {
      const g = this.x, w = this.w, h = this.h;
      const top = this.chrome('agents / orchestrator.py');
      const padX = w * 0.045, colW = w * 0.40;
      const lh = (h - top) / 19;

      // code typing in
      const shown = Math.min(this.code.length, Math.floor(p * this.code.length * 1.5));
      for (let i = 0; i < shown; i++) {
        const ln = this.code[i];
        let x = padX + ln.ind * w * 0.035;
        const y = top + lh * 1.4 + i * lh;
        const grow = Math.min(1, (p * this.code.length * 1.5 - i) * 2.2);
        for (const run of ln.runs) {
          const rw = run.w * colW * grow;
          if (rw <= 0) break;
          g.fillStyle = run.c;
          g.globalAlpha = run.c === MUTE ? 0.45 : 0.85;
          g.fillRect(x, y, rw, Math.max(2, lh * 0.34));
          x += rw + colW * 0.035;
        }
      }
      g.globalAlpha = 1;
      // caret
      if ((performance.now() / 500 | 0) % 2 && shown < this.code.length) {
        g.fillStyle = ACID;
        g.fillRect(padX, top + lh * 1.4 + shown * lh, Math.max(2, w * 0.006), lh * 0.5);
      }

      // graph
      const gx = w * 0.52, gy = top + (h - top) * 0.06;
      const gw = w * 0.44, gh = (h - top) * 0.78;
      const P = this.nodes.map(([a, b]) => [gx + a * gw, gy + b * gh]);
      const lit = p * this.edges.length * 1.15;
      this.edges.forEach(([a, b], i) => {
        const on = lit - i;
        g.strokeStyle = on > 0 ? ACID : '#242630';
        g.globalAlpha = on > 0 ? Math.min(1, on) * 0.85 : 1;
        g.lineWidth = Math.max(1, w * 0.0035);
        g.beginPath(); g.moveTo(...P[a]); g.lineTo(...P[b]); g.stroke();
        if (on > 0 && on < 1) {           // pulse riding the edge
          const px = P[a][0] + (P[b][0] - P[a][0]) * on;
          const py = P[a][1] + (P[b][1] - P[a][1]) * on;
          g.globalAlpha = 1; g.fillStyle = '#fff';
          g.beginPath(); g.arc(px, py, Math.max(2, w * 0.007), 0, 7); g.fill();
        }
      });
      g.globalAlpha = 1;
      P.forEach(([x, y], i) => {
        const on = lit > i;
        g.fillStyle = on ? ACID : '#15171E';
        g.strokeStyle = on ? ACID : '#2E313C';
        g.lineWidth = Math.max(1, w * 0.003);
        g.beginPath(); g.arc(x, y, Math.max(3, w * 0.014), 0, 7); g.fill(); g.stroke();
      });

      this.foot(`23 agents · round ${p > 0.5 ? 2 : 1} / 2`, ACID);
    }

    /* ── scene B · training ──────────────────────────────────────────────── */
    train(p) {
      const g = this.x, w = this.w, h = this.h;
      const top = this.chrome('ids / train.py');
      const ox = w * 0.06, oy = top + (h - top) * 0.16;
      const ow = w * 0.52, oh = (h - top) * 0.52;

      g.strokeStyle = '#1C1E26'; g.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = oy + oh * i / 4;
        g.beginPath(); g.moveTo(ox, y); g.lineTo(ox + ow, y); g.stroke();
      }
      const e = Math.min(1, p * 1.5);
      [[ACID, 1], [BLUE, 0.78]].forEach(([col, k]) => {
        g.strokeStyle = col; g.lineWidth = Math.max(1.4, w * 0.005);
        g.beginPath();
        for (let i = 0; i <= 60 * e; i++) {
          const t = i / 60;
          const v = (Math.exp(-t * 3.3) * 0.84 + 0.07) * k + Math.sin(i * 1.6) * 0.012;
          const X = ox + t * ow, Y = oy + v * oh;
          i ? g.lineTo(X, Y) : g.moveTo(X, Y);
        }
        g.stroke();
      });
      g.fillStyle = MUTE;
      g.font = `${Math.max(7, h * 0.042)}px "JetBrains Mono", monospace`;
      g.fillText('loss · 40 epochs', ox, oy - h * 0.035);

      // the real number, counting
      const acc = (98.12 * Math.min(1, p * 1.7)).toFixed(2);
      g.fillStyle = ACID;
      g.font = `800 ${h * 0.20}px Inter, sans-serif`;
      g.textBaseline = 'alphabetic';
      g.fillText(`${acc}%`, w * 0.64, oy + oh * 0.62);
      g.fillStyle = TEXT;
      g.font = `${Math.max(7, h * 0.046)}px "JetBrains Mono", monospace`;
      g.fillText('ACCURACY', w * 0.64, oy + oh * 0.82);
      g.fillStyle = MUTE;
      g.fillText('macro-F1 96.95%', w * 0.64, oy + oh * 1.02);
      g.textBaseline = 'middle';

      this.foot('MLP + AutoEncoder · CSE-CIC-IDS2018', BLUE);
    }

    /* ── scene C · deploy ────────────────────────────────────────────────── */
    deploy(p) {
      const g = this.x, w = this.w, h = this.h;
      const top = this.chrome('satark.ai — deploy');
      const lines = [
        ['$ ', 'npm run build', TEXT],
        ['✓ ', 'bridge-logic  compiled', ACID],
        ['✓ ', '18 scam types  registered', ACID],
        ['✓ ', 'gpt-4.1-mini  wired', ACID],
        ['→ ', 'pushing to production', WARM],
        ['✓ ', 'live — adaptive-honeypot-agent', ACID],
      ];
      const lh = (h - top) / 8.4;
      const fs = Math.max(8, h * 0.062);
      g.font = `${fs}px "JetBrains Mono", monospace`;
      const total = p * lines.length * 1.25;
      lines.forEach(([sig, txt, col], i) => {
        const on = total - i;
        if (on <= 0) return;
        const y = top + lh * 1.2 + i * lh;
        const n = Math.max(0, Math.min(txt.length, Math.floor(on * txt.length * 1.6)));
        g.fillStyle = col;
        g.fillText(sig, w * 0.055, y);
        g.fillStyle = i === 0 ? TEXT : col;
        g.globalAlpha = Math.min(1, on * 3);
        g.fillText(txt.slice(0, n), w * 0.055 + fs * 1.6, y);
        g.globalAlpha = 1;
      });
      this.foot('vercel · production', ACID);
    }

    foot(txt, col) {
      const g = this.x, h = this.h, y = h - h * 0.055;
      g.fillStyle = '#121218';
      g.fillRect(0, h - h * 0.11, this.w, h * 0.11);
      g.fillStyle = col;
      g.beginPath(); g.arc(this.w * 0.045, y, Math.max(2, h * 0.014), 0, 7); g.fill();
      g.fillStyle = MUTE;
      g.font = `${Math.max(7, h * 0.044)}px "JetBrains Mono", monospace`;
      g.fillText(txt, this.w * 0.085, y);
    }

    draw() {
      if (!this.visible || !this.w) return;
      // ~30fps is plenty for a prop this size and halves its cost
      const now = performance.now();
      if (now - (this.lastFrame || 0) < 32) return;
      this.lastFrame = now;
      const g = this.x;
      g.fillStyle = '#08080B';
      g.fillRect(0, 0, this.w, this.h);

      const el = performance.now() - this.t0;
      const idx = Math.floor(el / SCENE_MS) % 3;
      const inScene = el % SCENE_MS;
      const p = Math.min(1, inScene / (SCENE_MS - WIPE_MS));

      [this.agents, this.train, this.deploy][idx].call(this, p);

      // wipe out on the way to the next scene
      const left = SCENE_MS - inScene;
      if (left < WIPE_MS) {
        const k = 1 - left / WIPE_MS;
        g.fillStyle = '#08080B';
        g.fillRect(0, 0, this.w * k * 1.02, this.h);
        g.fillStyle = ACID;
        g.fillRect(this.w * k * 1.02 - Math.max(1, this.w * 0.004), 0,
                   Math.max(1, this.w * 0.004), this.h);
      }
    }
  }

  function mulberry(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      let t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const screens = [];
  window.ScreenMount = c => { const s = new Screen(c); screens.push(s); return s; };
  window.ScreenTick = () => { for (const s of screens) s.draw(); };
})();
