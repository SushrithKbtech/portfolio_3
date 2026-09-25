/* Scroll choreography.
   boot → hero warp-in → fade to dark → statement + stack rail → the work ring →
   manifesto → about → proof → marquee → contact → footer warp-in. */

(function () {
  const D = window.DATA;
  const REDUCED = matchMedia('(prefers-reduced-motion:reduce)').matches;
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  gsap.registerPlugin(ScrollTrigger);


  /* index.html turns off scroll restoration before anything parses; these catch the
     cases where the browser has already moved us by the time scripts run. */
  scrollTo(0, 0);
  addEventListener('load', () => { if (!heroIn) scrollTo(0, 0); });

  /* ── smooth scroll ─────────────────────────────────────────────────────── */
  let lenis = null;
  if (!REDUCED && window.Lenis) {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    window.LenisInstance = lenis;   // for direct scroll control when debugging/profiling
  }
  gsap.ticker.add(t => {
    window.CoilTick && window.CoilTick(t);
    window.ScreenTick && window.ScreenTick();
    window.GlobeTick && window.GlobeTick(t);
  });

  /* ── text splitting ────────────────────────────────────────────────────── */
  function splitChars(el) {
    const txt = el.textContent;
    el.textContent = '';
    return [...txt].map(c => {
      const s = document.createElement('span');
      s.className = 'ch';
      s.textContent = c === ' ' ? ' ' : c;
      el.appendChild(s);
      return s;
    });
  }
  function splitWordsDeep(root) {
    const out = [], nodes = [];
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while (walk.nextNode()) nodes.push(walk.currentNode);
    for (const n of nodes) {
      const frag = document.createDocumentFragment();
      for (const p of n.textContent.split(/(\s+)/)) {
        if (!p) continue;
        if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); continue; }
        const s = document.createElement('span');
        s.className = 'wd'; s.textContent = p;
        frag.appendChild(s); out.push(s);
      }
      n.parentNode.replaceChild(frag, n);
    }
    return out;
  }

  /* the signature entrance — unchanged */
  const WARP_FROM = { opacity: 0, xPercent: 46, yPercent: 28,
    rotation: -12, skewX: -28, scale: 0.55, transformOrigin: '0% 100%' };
  const warpIn = (chars, delay = 0) => gsap.fromTo(chars, WARP_FROM, {
    opacity: 1, xPercent: 0, yPercent: 0, rotation: 0, skewX: 0, scale: 1,
    duration: 1.15, ease: 'expo.out', stagger: 0.028, delay,
  });

  /* ══ render ═════════════════════════════════════════════════════════════ */

  /* the toolbox: two rails of real brand marks, running opposite ways.
     Each is duplicated so the wrap is seamless. */
  const tile = i => `<span class="tile"><img src="assets/icons/${i.slug}.svg" alt="" loading="lazy">${i.label}</span>`;
  const half = Math.ceil(D.icons.length / 2);
  const rowA = D.icons.slice(0, half).map(tile).join('');
  const rowB = D.icons.slice(half).map(tile).join('');
  $('#worksTrack').innerHTML = '<span>WORKS</span>';
  $('#railA').innerHTML = rowA + rowA;
  $('#railB').innerHTML = rowB + rowB;

  /* the ring */
  const N = D.work.length;
  const STEP = 360 / N;
  $('#ringOrbit').innerHTML = D.work.map((p, i) => `
    <a class="panel" data-i="${i}" ${p.live ? `href="${p.live}" target="_blank" rel="noopener"` : ''}
       data-cursor="${p.live ? 'visit' : 'view'}">
      <img src="${p.img}" alt="${p.n}" loading="${i < 3 ? 'eager' : 'lazy'}">
      <span class="panel__tag"><b>${p.n}</b><em>${p.k}</em></span>
    </a>`).join('');
  const panels = $$('.panel');
  $('#rTot').textContent = String(N).padStart(2, '0');

  /* proof */
  $('#achs').innerHTML = D.achievements.map(a => `
    <article class="ach">
      <span class="ach__m">${a.m}</span>
      <div class="ach__b">
        <h3>${a.h}</h3>
        <p class="ach__w">${a.w}</p>
        <p class="ach__p">${a.p}</p>
      </div>
      <span class="ach__i">↗</span>
    </article>`).join('');

  $('#abilGrid').innerHTML = D.abilities.map(([n, lvl]) => `
    <div class="skill">
      <div class="skill__row"><span class="skill__n">${n}</span><span class="skill__l">LVL ${lvl}</span></div>
      <div class="skill__bar"><u data-lvl="${lvl}"></u></div>
    </div>`).join('');
  $('#abilChips').innerHTML = D.chips.map(c => `<span>${c}</span>`).join('');

  /* all five certificates sit in one row from the start — they arrive into it one after
     another, not batch by batch replacing each other */
  const certCard = c => `
    <div class="mat">
      <article class="cert" style="--cbg:${c.bg};--cfg:${c.fg}">
        <div class="cert__top"><span class="cert__m">${c.m}</span><span class="cert__s">${c.s}</span></div>
        <h3>${c.h}</h3>
        <p class="cert__w">${c.w}</p>
        <p class="cert__p">${c.p}</p>
      </article>
    </div>`;
  $('#certs').innerHTML = `<div class="row">${D.certs.map(certCard).join('')}</div>`;

  /* about — the capability figure: notches on the outline, labels inside the shape */
  const fig = $('#capFig');
  if (fig && D.caps) {
    const esc = t => t.replace(/&/g, '&amp;');
    fig.querySelector('.fig__marks').innerHTML = D.caps.map((c, i) =>
      `<g class="fig__x" data-i="${i}" transform="translate(${c[4]} ${c[5]})">
         <path d="M-7 -7L7 7M7 -7L-7 7"/></g>`).join('');
    // each label carries an invisible hit rect — SVG text only answers over its glyphs
    fig.querySelector('.fig__labels').innerHTML = D.caps.map((c, i) => {
      const hw = c[0].length * 7 + 26;
      const wide = c[3] > 380 ? ' fig__t--wide' : '';   // the two on the shoulders have room
      return `<g class="fig__t${wide}" data-i="${i}" data-cursor="0${i + 1}">
         <rect x="${c[2] - hw}" y="${c[3] - 22}" width="${hw * 2}" height="34" fill="transparent"/>
         <text x="${c[2]}" y="${c[3]}" text-anchor="middle">${esc(c[0])}</text></g>`;
    }).join('');

    const cap = $('#capCap'), REST = cap.textContent;
    const mark = i => {
      $$('[data-i]', fig).forEach(el => el.classList.toggle('on', +el.dataset.i === i));
      cap.textContent = i < 0 ? REST : D.caps[i][1];
    };
    fig.addEventListener('pointerover', e => {
      const t = e.target.closest('.fig__t');
      if (t) mark(+t.dataset.i);
    });
    fig.addEventListener('pointerleave', () => mark(-1));
  }

  /* ══ about — the desktop ════════════════════════════════════════════════
     Two apps, one window at a time, a clock on Bengaluru time and a line that
     asks GitHub when I last pushed. */
  const mac = $('#mac');
  if (mac) {
    const rows = $('#nowRows');
    if (rows && D.now) {
      rows.innerHTML = D.now.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join('');
    }

    const wins = { about: $('#winAbout'), now: $('#winNow'), loc: $('#winLoc') };
    const globeCv = $('#globeCv');
    if (globeCv && window.GlobeMount) { window.GlobeMount(globeCv); window.GlobeWake(false); }
    const show = key => {
      $$('.dapp', mac).forEach(b => b.classList.toggle('on', b.dataset.win === key));
      Object.entries(wins).forEach(([k, w]) => w && w.classList.toggle('on', k === key));
      // the globe only turns while you are looking at it
      window.GlobeWake && window.GlobeWake(key === 'loc');
    };
    $$('.dapp', mac).forEach(b => b.addEventListener('click', () => show(b.dataset.win)));
    // the red light closes the window and drops the app back to idle
    $$('.win__x', mac).forEach(x => x.addEventListener('click', e => {
      e.stopPropagation();
      x.closest('.win').classList.remove('on');
      $$('.dapp', mac).forEach(b => b.classList.remove('on'));
      window.GlobeWake && window.GlobeWake(false);
    }));

    const macClock = $('#macClock'), nowBig = $('#nowBig');
    const tick = () => {
      // IST regardless of where the page is being read
      const p = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', hour12: true,
        hour: 'numeric', minute: '2-digit',   // 6:32 pm, not 06:32
      }).formatToParts(new Date()).reduce((a, x) => (a[x.type] = x.value, a), {});
      if (macClock) macClock.textContent = `${p.hour}:${p.minute} ${(p.dayPeriod || '').toLowerCase()}`;
      if (nowBig) nowBig.innerHTML = `${p.hour}:${p.minute}<em>&nbsp;${(p.dayPeriod || '').toLowerCase()}</em>`;
    };
    tick();
    setInterval(tick, 20000);

    /* public events, no token. It can rate-limit or fail outright, so the link is
       already useful before the answer arrives and stays useful if it never does. */
    const git = $('#nowGit');
    if (git) {
      fetch('https://api.github.com/users/SushrithKbtech/events/public?per_page=30')
        .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
        .then(ev => {
          const push = ev.find(e => e.type === 'PushEvent');
          if (!push) return Promise.reject('no push');
          const mins = (Date.now() - new Date(push.created_at)) / 60000;
          const ago = mins < 60 ? Math.max(1, Math.round(mins)) + 'm'
                    : mins < 1440 ? Math.round(mins / 60) + 'h'
                    : Math.round(mins / 1440) + 'd';
          const repo = push.repo.name.split('/')[1];
          git.textContent = `last push to github · ${ago} ago · ${repo} ↗`;
          git.href = 'https://github.com/' + push.repo.name;
        })
        .catch(() => { git.textContent = 'github.com/SushrithKbtech ↗'; });
    }
  }

  /* coils */
  const coilOpts = {
    stmt: { strands: 32, spin: 0.14, twist: 3, scale: 0.5, wave: true, sharp: true,
            segs: 16, res: 3 },
    ring: { strands: 30, spin: 0.10, twist: 4, tilt: 1.2, light: true, scale: 0.62 },
    cta:  { strands: 30, spin: 0.18, twist: 3, tilt: 0.75 },
  };
  $$('[data-coil]').forEach(c => window.CoilMount(c, coilOpts[c.dataset.coil] || {}));
  const heroScreen = $('#heroScreen');
  if (heroScreen) window.ScreenMount(heroScreen);

  /* Split and park the hero display lines NOW, not in enterHero(). The boot panel spends
     0.9s sliding up before its timeline reports complete, and whatever sits underneath is
     on screen for that entire slide — so the headline appeared fully formed, held for a
     beat, blanked, and then warped in from nothing. Parked up front, the warp is the only
     entrance there is. It also hides any late web-font swap, which reflows this text by
     about a third. */
  const heroLines = $$('.hero__h [data-warp]').map(el => splitChars(el));
  const RIG_FROM = { opacity: 0, y: 46, rotateX: 8 };
  const META_FROM = { opacity: 0, y: 14 };
  if (!REDUCED) {
    heroLines.forEach(chars => gsap.set(chars, WARP_FROM));
    // the laptop has no opacity:0 in CSS, so it sat there fully drawn for the whole
    // slide while the headline warped in beside it. Park it and it arrives with the type.
    gsap.set('.rig', RIG_FROM);
    gsap.set('.hero__meta span, .hero__cue', META_FROM);
  }

  /* ══ boot ═══════════════════════════════════════════════════════════════
     Runs once per load, guarded, and never re-arms — the old preloader could be
     re-entered by a late layout pass, which is what made it look like a refresh. */
  /* The monogram is drawn on with stroke-dashoffset, one continuous line across four
     paths, distributed by real path length so the pen moves at a steady rate rather than
     racing through the short strokes. The stroke settles from acid to paper as each one
     completes, which is what the reference does with its accent colour. */
  const ACID = [198, 242, 78], PAPER = [242, 241, 236];
  function initMark() {
    const paths = $$('#bootMark path');
    if (!paths.length) return () => {};
    const lens = paths.map(p => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0);
    paths.forEach((p, i) => {
      p.style.strokeDasharray = lens[i];
      p.style.strokeDashoffset = lens[i];
    });
    return prog => {
      let drawn = prog * total;
      for (let i = 0; i < paths.length; i++) {
        const l = clamp(drawn, 0, lens[i]);
        paths[i].style.strokeDashoffset = lens[i] - l;
        const t = l / lens[i];
        const c = ACID.map((v, k) => Math.round(v + (PAPER[k] - v) * t));
        paths[i].style.stroke = 'rgb(' + c[0] + ',' + c[1] + ',' + c[2] + ')';
        drawn -= lens[i];
      }
    };
  }

  const BOOT_TASKS = [
    [0, 'INIT'], [13, 'AGENTIC-SYSTEMS'], [34, 'RETRIEVAL-PIPELINES'],
    [56, 'NETWORK-SECURITY'], [77, 'ASSETS'], [93, 'MOUNT'],
  ];

  let booted = false, heroIn = false;

  /* Jump straight to the finished state. Used when the page is opened in a background tab:
     browsers pause requestAnimationFrame there, GSAP's ticker rides on it, and an animated
     boot would simply never advance — leaving a stuck loading screen. */
  function bootSkip() {
    if (heroIn) return;
    booted = true;
    gsap.globalTimeline.getChildren().forEach(t => { if (t.vars && t.vars.id === 'boot') t.kill(); });
    $('#boot')?.remove();
    enterHero();
  }

  function bootSeq() {
    if (booted) return; booted = true;
    if (document.hidden) return bootSkip();       // nothing to watch — just be ready
    const fill = $('#bootFill'), pct = $('#bootPct'), task = $('#bootTask');
    const hello = $('#bootHello'), inner = $('.boot__inner');
    const mark = initMark();
    document.body.style.overflow = 'hidden';
    lenis?.stop();

    const tl = gsap.timeline({
      id: 'boot',
      onComplete: () => { $('#boot')?.remove(); enterHero(); },
    });
    // belt and braces: if the tab is backgrounded mid-boot, finish on return
    document.addEventListener('visibilitychange', function once() {
      if (document.hidden || heroIn) return;
      document.removeEventListener('visibilitychange', once);
      if (tl.progress() < 1) { tl.progress(1); }
    });

    /* the greeting lands first, alone on the black, then clears out of the way */
    tl.fromTo(hello, { opacity: 0, y: 20, scale: 0.94 },
      { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' })
      .to(hello, { opacity: 0, y: -18, duration: 0.42, ease: 'power2.in' }, '+=0.45')
      .to(inner, { opacity: 1, duration: 0.4, ease: 'power2.out' }, '-=0.12');

    tl.to({ v: 0 }, {
      v: 100, duration: 2.1, ease: 'power1.inOut',
      onUpdate() {
        const v = this.targets()[0].v;
        pct.textContent = String(Math.round(v)).padStart(3, '0');
        fill.style.width = v + '%';
        mark(v / 100);
        for (let i = BOOT_TASKS.length - 1; i >= 0; i--) {
          if (v >= BOOT_TASKS[i][0]) {
            if (task.textContent !== BOOT_TASKS[i][1]) task.textContent = BOOT_TASKS[i][1];
            break;
          }
        }
      },
    })
      .to('.boot__inner', { opacity: 0, y: -18, duration: 0.5, ease: 'power2.in' }, '>0.4')
      .to('#boot', { yPercent: -100, duration: 0.9, ease: 'expo.inOut' }, '<0.15');
  }

  function enterHero() {
    if (heroIn) return; heroIn = true;
    document.body.style.overflow = '';
    scrollTo(0, 0);
    lenis?.start();
    lenis?.scrollTo(0, { immediate: true });
    gsap.to('#nav', { opacity: 1, duration: 1, ease: 'power2.out' });
    heroLines.forEach((chars, i) => {
      if (REDUCED) return gsap.set(chars, { opacity: 1 });
      gsap.to(chars, { opacity: 1, xPercent: 0, yPercent: 0, rotation: 0, skewX: 0, scale: 1,
        duration: 1.15, ease: 'expo.out', stagger: 0.028, delay: 0.05 + i * 0.1 });
    });
    const lede = splitWordsDeep($('.hero__lede'));
    gsap.set('.hero__lede', { opacity: 1 });
    gsap.fromTo(lede, { opacity: 0, yPercent: 40, skewX: -14 },
      { opacity: 1, yPercent: 0, skewX: 0, duration: 0.9, ease: 'expo.out', stagger: 0.012, delay: 0.4 });
    gsap.to('.hero__meta span, .hero__cue',
      { opacity: 0.48, y: 0, duration: 0.8, ease: 'power2.out', stagger: 0.07, delay: 0.7 });
    // 0.15 against the headline's 0.05 — they land together, type a beat ahead
    gsap.to('.rig', { opacity: 1, y: 0, rotateX: 0, duration: 1.3, ease: 'expo.out', delay: 0.15 });

    /* the résumé call-out: in, three deliberate pops, then the label settles under it */
    const cv = $('#cvBtn');
    if (cv) {
      cv.classList.add('on');
      gsap.timeline({ delay: 1.05 })
        .fromTo(cv, { opacity: 0, y: -16, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: 'expo.out' })
        // hand the element back to CSS, or the inline opacity:1 GSAP leaves behind
        // outranks .cv.gone and the call-out follows you down the whole page
        .set(cv, { clearProps: 'opacity,transform' })
        .to('.cv__b', { scale: 1.12, duration: 0.17, ease: 'power2.out' })
        .to('.cv__b', { scale: 1, duration: 0.24, ease: 'power2.in' })
        .to('.cv__b', { scale: 1.12, duration: 0.17, ease: 'power2.out' }, '+=0.1')
        .to('.cv__b', { scale: 1, duration: 0.24, ease: 'power2.in' })
        .to('.cv__b', { scale: 1.12, duration: 0.17, ease: 'power2.out' }, '+=0.1')
        .to('.cv__b', { scale: 1, duration: 0.24, ease: 'power2.in' })
        .call(() => $('#cvNote').classList.add('on'));
    }
    ScrollTrigger.refresh();
  }

  /* ══ hero → dark: a straight cross-fade, no zooming plate ═══════════════ */
  if (!REDUCED) {
    // queried once, not on every scrub tick — this ScrollTrigger fires continuously
    // while scrolling through the hero and into the coil just below it, and
    // gsap.set(selectorString, ...) re-runs querySelectorAll internally each call
    const fadeEls = $$('.hero__h, .hero__lede, .hero__meta, .hero__cue, .rig');
    let wasDark = false;
    ScrollTrigger.create({
      trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5,
      onUpdate: self => {
        const p = self.progress;
        gsap.set(fadeEls, { opacity: 1 - clamp((p - 0.18) / 0.55, 0, 1) });
        const dark = p > 0.45;
        if (dark !== wasDark) { wasDark = dark; document.body.classList.toggle('is-dark', dark); }
      },
    });
  }

  /* The résumé call-out belongs to the hero and nowhere else — by the statement
     section it is gone. Gated on raw scroll position rather than a ScrollTrigger on
     .hero: pinned sections downstream move that element's measured bottom around, and
     the call-out kept reappearing halfway down the page. */
  const cvEl = $('#cvBtn');
  if (cvEl) {
    const gate = () => {
      const off = scrollY > innerHeight * 0.26;
      cvEl.classList.toggle('gone', off);
      // written inline too, so it wins even mid-pop
      cvEl.style.opacity = off ? '0' : '';
      cvEl.style.transform = off ? 'translateY(-14px)' : '';
    };
    gate();
    addEventListener('scroll', gate, { passive: true });
    addEventListener('resize', gate);
  }

  /* ══ per-word lighting ══════════════════════════════════════════════════ */
  $$('[data-reveal-words]').forEach(el => {
    const words = splitWordsDeep(el);
    ScrollTrigger.create({
      trigger: el, start: 'top 88%', end: 'bottom 52%', scrub: true,
      onUpdate: self => {
        const n = Math.round(self.progress * words.length * 1.25);
        words.forEach((w, i) => w.classList.toggle('lit', i < n));
      },
    });
  });

  /* ══ toolbox rails — opposite directions, nudged by scroll velocity ═════ */
  function mountRail(el, dir, trig, speed) {
    let x = dir > 0 ? -el.scrollWidth / 2 : 0, last = performance.now(), bump = 0;
    ScrollTrigger.create({
      trigger: trig || '.tools', start: 'top bottom', end: 'bottom top',
      onUpdate: self => { bump = self.getVelocity() * -0.00028 * dir; },
    });
    gsap.ticker.add(() => {
      const now = performance.now();
      const dt = Math.min(64, now - last); last = now;
      const half = el.scrollWidth / 2;
      if (!half) return;
      x += ((speed || 0.034) + clamp(bump, -0.5, 0.5)) * dt * dir;
      bump *= 0.94;
      if (dir > 0 && x >= 0) x -= half;
      if (dir < 0 && x <= -half) x += half;
      el.style.transform = `translate3d(${x.toFixed(2)}px,0,0)`;
    });
  }
  mountRail($('#railA'), 1);
  mountRail($('#railB'), -1);

  /* the WORKS heading rides in from the right as you scroll into the section and then
     stays put on the left — a heading that arrives rather than one that is just there */
  if (!REDUCED) gsap.fromTo('#worksTrack',
    { x: () => innerWidth * 0.66 },
    { x: 0, ease: 'none',
      scrollTrigger: { trigger: '.work', start: 'top bottom', end: 'top 16%',
                       scrub: 0.7, invalidateOnRefresh: true } });

  /* the caption pops in from the left once WORKS has parked */
  if (!REDUCED) gsap.fromTo('.work__lead',
    { x: -70, opacity: 0 },
    { x: 0, opacity: 1, duration: 1.05, ease: 'expo.out',
      scrollTrigger: { trigger: '.work', start: 'top 62%' } });

  /* ══ the work ring ══════════════════════════════════════════════════════
     Panels orbit the coil on a real 3D ring; the core counter-rotates so it always
     faces the camera while still depth-sorting against the panels. */
  const orbit = $('#ringOrbit'), core = $('.ring__core');
  let theta = 0, active = -1;

  /* wide enough that the coil at the centre is never fully covered by the front panel */
  function radius() {
    const w = panels[0]?.getBoundingClientRect().width || 420;
    return (w * 0.86) / Math.tan(Math.PI / N);
  }

  function layout() {
    const R = radius();
    panels.forEach((p, i) => {
      const w = p.offsetWidth, h = p.offsetHeight;
      p.style.transform =
        `translate(${-w / 2}px,${-h / 2}px) rotateY(${i * STEP}deg) translateZ(${R}px)`;
    });
  }

  function setActive(i) {
    if (i === active) return;
    active = i;
    const p = D.work[i];
    $('#rNum').textContent = String(i + 1).padStart(2, '0');
    $('#rKind').textContent = p.k;
    $('#rName').textContent = p.n;
    $('#rTag').textContent = p.t;
    panels.forEach((el, j) => el.classList.toggle('is-on', j === i));
    gsap.fromTo('#rName, #rTag', { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.05, overwrite: true });
  }

  function renderRing() {
    orbit.style.transform = `rotateY(${theta}deg)`;
    // the coil breathes very slightly against the ring's motion so the centre never reads static
    core.style.transform = `translate(-50%,-50%) scale(${(1 + Math.sin(theta * Math.PI / 180) * 0.035).toFixed(4)})`;
    // depth cue: panels facing away recede and fade
    panels.forEach((p, i) => {
      const a = ((i * STEP + theta) % 360 + 360) % 360;
      const front = (Math.cos(a * Math.PI / 180) + 1) / 2;       // 1 front, 0 back
      p.style.opacity = (0.22 + front * 0.78).toFixed(3);
      p.style.filter = `brightness(${(0.55 + front * 0.45).toFixed(2)})`;
    });
    setActive(((Math.round(-theta / STEP) % N) + N) % N);
  }

  layout();
  renderRing();
  addEventListener('resize', () => { layout(); renderRing(); });

  if (!REDUCED) {
    ScrollTrigger.create({
      trigger: '.ring', start: 'top top', end: `+=${N * 90}%`,
      pin: true, scrub: 1.15,
      onUpdate: self => { theta = -self.progress * STEP * (N - 1); renderRing(); },
    });
  }

  const spin = dir => {
    gsap.to({ v: theta }, {
      v: theta - dir * STEP, duration: 0.8, ease: 'expo.out',
      onUpdate() { theta = this.targets()[0].v; renderRing(); },
    });
  };
  $('#rNext').addEventListener('click', () => spin(1));
  $('#rPrev').addEventListener('click', () => spin(-1));

  /* ── detail drawer ───────────────────────────────────────────────────── */
  const drawer = $('#drawer');
  gsap.set(drawer, { yPercent: -101 });   // parked above the ring, ready to slide down
  function openDrawer() {
    const p = D.work[active];
    $('#dName').textContent = p.n;
    $('#dDesc').textContent = p.d.replace(/\s+/g, ' ').trim();
    $('#dStack').innerHTML = p.stack.map(s => `<li>${s}</li>`).join('');
    $('#dMetrics').innerHTML = (p.metrics || [])
      .map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');
    $('#dLinks').innerHTML =
      (p.live ? `<a href="${p.live}" target="_blank" rel="noopener" data-cursor="visit">Live site ↗</a>` : '') +
      (p.repo ? `<a href="${p.repo}" target="_blank" rel="noopener" data-cursor="code">Source ↗</a>` : '');
    drawer.hidden = false;
    gsap.to(drawer, { yPercent: 0, duration: 0.85, ease: 'expo.out', overwrite: true });
    gsap.fromTo('.drawer__in > *', { opacity: 0, y: 26 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out', stagger: 0.06, delay: 0.18 });
  }
  function closeDrawer() {
    gsap.to(drawer, { yPercent: -101, duration: 0.62, ease: 'expo.inOut', overwrite: true,
      onComplete: () => { drawer.hidden = true; } });
  }
  $('#rMore').addEventListener('click', () => (drawer.hidden ? openDrawer() : closeDrawer()));
  $('#drawerX').addEventListener('click', closeDrawer);

  /* ══ manifesto ══════════════════════════════════════════════════════════ */
  function fitMani() {
    const h = $('.mani__h');
    if (!h) return;
    if (innerWidth < 1000) { $$('.ln', h).forEach(l => l.style.fontSize = ''); return; }
    const avail = h.clientWidth;
    $$('.ln', h).forEach(l => {
      l.style.fontSize = '100px';
      const w = l.scrollWidth;
      if (w) l.style.fontSize = (100 * avail / w).toFixed(2) + 'px';
    });
  }
  (document.fonts?.ready ?? Promise.resolve()).then(() => { fitMani(); ScrollTrigger.refresh(); });
  addEventListener('resize', fitMani);

  if (!REDUCED) gsap.fromTo('.mani__h .ln', { yPercent: 118 }, {
    yPercent: 0, ease: 'none', stagger: 0.12,
    scrollTrigger: { trigger: '.mani', start: 'top 78%', end: 'bottom bottom', scrub: 0.7 },
  });

  /* ══ proof cards rise ═══════════════════════════════════════════════════ */
  $$('.ach').forEach(el => gsap.fromTo(el, { y: 70, opacity: 0 }, {
    y: 0, opacity: 1, duration: 1.05, ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 90%' },
  }));

  /* All five certificates ride into one row, one after another — a solo card first, then
     two pairs cascading in behind it, each dropping from the opposite side to the one
     before it so they read as a moving train rather than five things popping in at once.
     Once all five have landed they hold a beat, then the whole row bursts outward like a
     fountain — each card thrown on its own diverging path, spinning and fading — while
     Abilities fades up through exactly that same progress, so one is the other clearing. */
  const row = $('.field .row');

  if (!REDUCED && row) {
    const abil = $('#abil'), hold = $('#fieldHold'), head = $('#credHead');
    let barsIn = false;

    const cards = [...row.children];              // five .mat elements, already in their
                                                    // resting flex position
    // [start, end] of each card's own arrival, in pin progress — overlapping in pairs the
    // way the old batches did, cascading left to right
    const ENTER_WIN = [
      [0.00, 0.15], [0.09, 0.24], [0.09, 0.24], [0.18, 0.33], [0.18, 0.33],
    ];
    // card 0 rides from below alone; each pair afterward drops from opposite sides so they
    // cross as they arrive, same as the old train
    const ENTER_DIR = [1, -1, 1, -1, 1];
    const EXIT_START = 0.56;                        // hold ends, the fountain begins
    // one outward angle per card, fanned around straight up — this is the fountain
    const EXIT_ANGLE = [-52, -24, 0, 24, 52];

    const smooth = t => t * t * (3 - 2 * t);

    /* Set the opening frame synchronously, or all five sit stacked at rest until the first
       scroll event lands — the pile-up you'd see the moment the section scrolls into view. */
    cards.forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = i === 0
        ? 'translate3d(0,' + (innerHeight * 0.8).toFixed(0) + 'px,0)' : '';
    });

    /* The first certificate rides up with the page as you scroll into the section, landing
       in its row slot exactly as the pin takes hold — there is never an empty stage before
       it arrives. */
    ScrollTrigger.create({
      trigger: '#fieldHold', start: 'top bottom', end: 'top top', scrub: 0.6,
      onUpdate: self => {
        if (self.progress >= 1) return;             // from here the pin owns it
        const e = smooth(self.progress);
        cards[0].style.transform = `translate3d(0,${((1 - e) * innerHeight * 0.8).toFixed(1)}px,0)`;
        cards[0].style.opacity = e.toFixed(3);
      },
    });

    ScrollTrigger.create({
      trigger: '#fieldHold', start: 'top top', end: '+=420%',
      pin: true, scrub: 0.85,
      onUpdate: self => {
        const p = self.progress;
        const travelY = innerHeight * 0.85;

        cards.forEach((card, i) => {
          const [a, b] = ENTER_WIN[i];
          if (p < EXIT_START) {
            // arriving, or holding once arrived — settled dead in its row slot
            const e = i === 0 ? 1 : smooth(clamp((p - a) / (b - a), 0, 1));
            card.style.transform = `translate3d(0,${(ENTER_DIR[i] * travelY * (1 - e)).toFixed(1)}px,0)`;
            card.style.opacity = e.toFixed(3);
            card.style.filter = '';
            return;
          }
          // the fountain: thrown outward on its own angle, spinning and blurring as it goes
          const out = smooth(clamp((p - EXIT_START) / (1 - EXIT_START), 0, 1));
          const rad = EXIT_ANGLE[i] * Math.PI / 180;
          const dist = travelY * 1.15 * out;
          const x = Math.sin(rad) * dist;
          const y = -Math.cos(rad) * dist;
          const r = EXIT_ANGLE[i] * 0.4 * out;
          card.style.transform =
            `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) rotate(${r.toFixed(2)}deg) scale(${(1 - out * 0.16).toFixed(3)})`;
          card.style.filter = out > 0.04 ? `blur(${(out * 7).toFixed(1)}px)` : '';
          card.style.opacity = (1 - smooth(clamp(out / 0.85, 0, 1))).toFixed(3);
        });

        const ie = smooth(clamp((p - EXIT_START) / (1 - EXIT_START), 0, 1));
        head.style.opacity = (1 - smooth(clamp(ie / 0.5, 0, 1))).toFixed(3);
        abil.style.opacity = ie.toFixed(3);
        abil.style.transform = `translate3d(0,${((1 - ie) * 44).toFixed(1)}px,0) scale(${(0.97 + ie * 0.03).toFixed(4)})`;
        abil.classList.toggle('on', ie > 0.5);

        // the bars refill on every approach rather than only the first
        if (ie > 0.28 && !barsIn) {
          barsIn = true;
          $$('.skill__bar u').forEach((u, i) => gsap.to(u, {
            width: u.dataset.lvl + '%', duration: 1.25, ease: 'expo.out', delay: i * 0.06,
            overwrite: true }));
        } else if (ie < 0.08 && barsIn) {
          barsIn = false;
          gsap.to('.skill__bar u', { width: 0, duration: 0.35, ease: 'power2.in', overwrite: true });
        }
      },
    });
  }



  /* ══ CTA marquee ════════════════════════════════════════════════════════ */
  if (!REDUCED) gsap.fromTo('#ctaTrack', { xPercent: 4 }, {
    xPercent: -62, ease: 'none',
    scrollTrigger: { trigger: '.cta', start: 'top bottom', end: 'bottom top', scrub: 0.5 },
  });

  /* ══ footer warp ════════════════════════════════════════════════════════ */
  const footLines = $$('.foot__h [data-warp]').map(splitChars);
  gsap.set('.foot__h .ch', { opacity: 0 });
  ScrollTrigger.create({
    trigger: '.foot', start: 'top 72%', once: true,
    onEnter: () => footLines.forEach((c, i) => warpIn(c, i * 0.09)),
  });

  /* ══ nav follows the section you're in ══════════════════════════════════ */
  const rail = $('#navRail');
  const items = $$('.nav__i');
  const byName = Object.fromEntries(items.map(a => [a.dataset.sec, a]));
  function markNav(name) {
    items.forEach(a => a.classList.toggle('on', a.dataset.sec === name));
    const el = byName[name];
    if (!el || innerWidth < 1000) { rail.classList.remove('on'); return; }
    const nb = $('#nav').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    rail.classList.add('on');
    rail.style.width = r.width + 'px';
    rail.style.transform = `translateX(${r.left - nb.left}px)`;
    rail.style.bottom = (nb.bottom - r.bottom) + 'px';
  }
  const SECS = { hero: 'hero', stmt: 'hero', tools: 'work', work: 'work', mani: 'about', abil: 'proof', tools: 'work',
                 about: 'about', proof: 'proof', contact: 'contact' };
  $$('section[data-sec]').forEach(sec => {
    ScrollTrigger.create({
      trigger: sec, start: 'top 55%', end: 'bottom 55%',
      onToggle: self => { if (self.isActive) markNav(SECS[sec.dataset.sec] || 'hero'); },
    });
  });

  /* ══ anchors ════════════════════════════════════════════════════════════ */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const t = $(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    lenis ? lenis.scrollTo(t) : t.scrollIntoView({ behavior: 'smooth' });
  }));

  addEventListener('resize', () => ScrollTrigger.refresh());

  /* ══ go ═════════════════════════════════════════════════════════════════ */
  gsap.set('.hero__h .warp', { opacity: 1 });
  if (REDUCED) {
    $('#boot')?.remove();
    gsap.set('#nav, .hero__lede, .foot__h .ch', { opacity: 1 });
  } else if (document.readyState === 'complete') {
    bootSeq();
  } else {
    addEventListener('load', bootSeq, { once: true });
    setTimeout(bootSeq, 2600);        // never let a slow asset hold the page hostage
  }
  // and never let a paused ticker hold it hostage either
  setTimeout(bootSkip, 7000);
})();
