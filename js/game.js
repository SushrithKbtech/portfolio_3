/* Snake, in the contact section.

   The box that used to sit here typed a paragraph at you and then stopped, which is a
   lot of screen for something you read once. This is the same frame with something to
   do in it. Arrows or WASD, Enter to start, best score kept in localStorage.

   It only runs a frame loop while it is actually being played AND on screen AND the tab
   is visible — the rest of the time it costs nothing, which matters on a page that is
   already drawing three canvas objects. */

(function () {
  const cv = document.getElementById('gmCanvas');
  if (!cv) return;
  const g = cv.getContext('2d', { alpha: false });

  const COLS = 26, ROWS = 17;
  const ACID = '#C6F24E', PAPER = '#F2F1EC', BLACK = '#0A0A0B';
  const KEY = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
  };

  const scoreEl = document.getElementById('gmScore');
  const bestEl = document.getElementById('gmBest');
  const hintEl = document.getElementById('gmHint');

  let cell = 12, w = 0, h = 0;
  let snake = [], dir = [1, 0], next = [1, 0], food = { x: 0, y: 0 };
  let score = 0, best = 0, state = 'idle';
  let raf = 0, last = 0, acc = 0, inView = true;

  // a private window, cleared site data or a locked-down browser all throw here
  try { best = parseInt(localStorage.getItem('sk-snake') || '0', 10) || 0; } catch (e) {}

  const pad = n => String(n).padStart(2, '0');
  const hud = () => {
    if (scoreEl) scoreEl.textContent = pad(score);
    if (bestEl) bestEl.textContent = pad(best);
  };

  function fit() {
    const r = cv.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = r.width; h = r.height;
    cell = w / COLS;
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function place() {
    let x, y, clash;
    do {
      x = (Math.random() * COLS) | 0;
      y = (Math.random() * ROWS) | 0;
      clash = snake.some(s => s.x === x && s.y === y);
    } while (clash);
    food = { x, y };
  }

  function reset() {
    snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }, { x: 5, y: 8 }];
    dir = next = [1, 0];
    score = 0; acc = 0;
    place(); hud();
  }

  function start() {
    reset();
    state = 'play';
    if (hintEl) hintEl.textContent = 'arrows or WASD';
    last = performance.now();
    loop(last);
  }

  function die() {
    state = 'dead';
    if (score > best) {
      best = score;
      try { localStorage.setItem('sk-snake', String(best)); } catch (e) {}
    }
    hud();
    if (hintEl) hintEl.textContent = 'enter to go again';
    cancelAnimationFrame(raf); raf = 0;
    draw();
  }

  // gets quicker as it gets longer, with a floor so it stays playable
  const stepMs = () => Math.max(68, 132 - score * 2.6);

  function tick() {
    dir = next;
    const head = { x: snake[0].x + dir[0], y: snake[0].y + dir[1] };
    if (head.x < 0 || head.y < 0 || head.x >= COLS || head.y >= ROWS ||
        snake.some(s => s.x === head.x && s.y === head.y)) return die();
    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) { score++; hud(); place(); }
    else snake.pop();
  }

  function rr(x, y, sz, r) {
    g.beginPath();
    g.roundRect ? g.roundRect(x, y, sz, sz, r)
                : g.rect(x, y, sz, sz);
    g.fill();
  }

  function draw() {
    if (!w) return;
    g.fillStyle = BLACK;
    g.fillRect(0, 0, w, h);

    // the board reads as a grid without drawing 442 lines
    g.fillStyle = 'rgba(242,241,236,.07)';
    for (let x = 0; x < COLS; x++) {
      for (let y = 0; y < ROWS; y++) {
        g.fillRect(x * cell + cell / 2 - 0.75, y * cell + cell / 2 - 0.75, 1.5, 1.5);
      }
    }

    const inset = Math.max(1.2, cell * 0.11);
    const sz = cell - inset * 2;
    const rad = Math.max(2, cell * 0.24);

    // food
    g.fillStyle = PAPER;
    rr(food.x * cell + inset, food.y * cell + inset, sz, rad);

    // snake — brightest at the head, falling away down the body
    for (let i = snake.length - 1; i >= 0; i--) {
      const t = 1 - i / Math.max(1, snake.length);
      g.fillStyle = i === 0 ? ACID : `rgba(198,242,78,${(0.28 + t * 0.62).toFixed(3)})`;
      rr(snake[i].x * cell + inset, snake[i].y * cell + inset, sz, rad);
    }

    if (state === 'play') return;

    g.fillStyle = 'rgba(10,10,11,.82)';
    g.fillRect(0, 0, w, h);
    g.textAlign = 'center';
    g.fillStyle = PAPER;
    g.font = `800 ${Math.round(cell * 1.5)}px Inter, system-ui, sans-serif`;
    g.fillText(state === 'dead' ? `${pad(score)} EATEN` : 'SNAKE', w / 2, h / 2 - cell * 0.2);
    g.fillStyle = 'rgba(242,241,236,.55)';
    g.font = `${Math.round(cell * 0.62)}px "JetBrains Mono", ui-monospace, monospace`;
    g.fillText(state === 'dead' ? 'press enter to go again'
                                : 'press enter — or click — to play',
      w / 2, h / 2 + cell * 1.25);
  }

  function loop(now) {
    raf = requestAnimationFrame(loop);
    if (state !== 'play') return;
    const dt = Math.min(now - last, 200);   // a backgrounded tab must not fast-forward
    last = now;
    acc += dt;
    const ms = stepMs();
    while (acc >= ms) { acc -= ms; if (state !== 'play') break; tick(); }
    draw();
  }

  const pause = () => { cancelAnimationFrame(raf); raf = 0; };
  const resume = () => {
    if (state !== 'play' || raf || !inView || document.hidden) return;
    last = performance.now(); acc = 0;
    loop(last);
  };

  function turn(v) {
    // no reversing into your own neck
    if (v[0] === -dir[0] && v[1] === -dir[1]) return;
    next = v;
  }

  addEventListener('keydown', e => {
    if (!inView) return;
    const v = KEY[e.key] || KEY[(e.key || '').toLowerCase()];
    if (v) {
      if (state !== 'play') return;        // otherwise arrows stop scrolling the page
      e.preventDefault();
      turn(v);
    } else if (e.key === 'Enter' || e.key === ' ') {
      if (state === 'play') return;
      e.preventDefault();
      start();
    }
  });

  cv.addEventListener('pointerdown', () => { if (state !== 'play') start(); });

  // swipe, for a phone
  let tx = 0, ty = 0;
  cv.addEventListener('touchstart', e => {
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
    if (state !== 'play') start();
  }, { passive: true });
  cv.addEventListener('touchmove', e => {
    const dx = e.touches[0].clientX - tx, dy = e.touches[0].clientY - ty;
    if (Math.hypot(dx, dy) < 24) return;
    turn(Math.abs(dx) > Math.abs(dy) ? [Math.sign(dx), 0] : [0, Math.sign(dy)]);
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });

  new ResizeObserver(fit).observe(cv);
  new IntersectionObserver(e => {
    inView = e[0].isIntersecting;
    inView ? resume() : pause();
  }, { rootMargin: '60px' }).observe(cv);
  document.addEventListener('visibilitychange', () => document.hidden ? pause() : resume());

  reset();
  fit();
  window.SNAKE = { start, state: () => state, score: () => score };
})();
