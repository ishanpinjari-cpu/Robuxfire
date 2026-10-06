/* ═══════════════════════════════════════════════════════════
   ROBLOX LOVE — APP LOGIC
   Password validation, page transitions, proposal interactions,
   particles, confetti, floating hearts, sound effects.
   ═══════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ──────────────────────────────────────────────
     CONFIGURATION — EASY TO CHANGE
     ────────────────────────────────────────────── */

  // ✏️ Change the password here
  const SECRET_PASSWORD = 'chickenman';

  // ✏️ Wrong-password messages (shown in order, then cycles last ones)
  const WRONG_MESSAGES = [
    "Hmmmm… nope 👀💭",
    "Atiqa, that's not the secret password 😭",
    "Brooo 😭 think about your Roblox bestie 🎮💗",
    "Okay I'm literally crying rn 😭😭",
    "My heart can't take this 💔🥺",
    "I'll wait forever for you to guess it 🥹💗",
    "Hint: think about my Roblox username 👀🎮",
    "PLEASEEEE 😭😭💗",
  ];

  // ✏️ Proposal messages — NO reactions (shown via reveal steps in HTML)
  // ✏️ YES reaction messages
  const YES_MESSAGES = [
    {
      emoji: '😭💗🎉',
      text: "YAYYYYY 😭💗<br/>ATIQAAA FINALLYYYY!!<br/>I'M YOUR ROBLOX BF NOW 🎮💕",
    },
    {
      emoji: '🥹💕✨',
      text: "WAITTT 😭💗<br/>YOU ACTUALLY SAID YESSSS 🎀",
    },
    {
      emoji: '🫶🏻💖🎮',
      text: "STOP CLICKING YES 😭<br/>I'm already blushing 🥹💗",
    },
    {
      emoji: '🎀✨💗',
      text: "Okay okay I GET IT 😭<br/>You love me too 💗🎮",
    },
  ];

  // ✏️ NO reaction messages
  const NO_MESSAGES = [
    {
      emoji: '🥺💗',
      text: "Plsss click YES 🥺💗",
    },
    {
      emoji: '😭💗',
      text: "Atiqa pls pls click yes 😭💗<br/>I really like youuu 🥺👉👈",
    },
    {
      emoji: '😭😭💔',
      text: "WHY ARE YOU DOING THIS TO ME 😭😭<br/>🥺💔<br/>I really thought you liked me toooo…",
    },
    {
      emoji: '😤😤😤',
      text: "OKAY ENOUGH 😭<br/>Click YES alreadyyy!! 💗🎮",
    },
  ];

  /* ──────────────────────────────────────────────
     DOM REFERENCES
     ────────────────────────────────────────────── */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const pagePassword  = $('#page-password');
  const pageProposal  = $('#page-proposal');
  const pageNext      = $('#page-next');

  const passwordInput = $('#password-input');
  const btnSubmit     = $('#btn-submit-password');
  const passwordGroup = $('#password-group');
  const errorMsg      = $('#error-message');
  const successPopup  = $('#success-popup');

  const btnYes        = $('#btn-yes');
  const btnNo         = $('#btn-no');
  const reactionArea  = $('#reaction-area');
  const celebOverlay  = $('#celebration-overlay');
  const btnContinue    = $('#btn-continue');
  const bgMusic        = $('#bg-music');
  const musicToggleBtn = $('#music-toggle-btn');
  const musicStatus    = $('#music-status');
  const btnReplay      = $('#btn-replay-proposal');

  const pageBouquet       = $('#page-bouquet');
  const btnFlowerSurprise = $('#btn-flower-surprise');
  const btnBackToAlbum    = $('#btn-back-to-album');
  const flowerRainCanvas  = $('#flower-rain-canvas');

  const confettiCanvas = $('#confetti-canvas');
  const particlesCanvas = $('#particles-canvas');

  /* ──────────────────────────────────────────────
     STATE
     ────────────────────────────────────────────── */
  let wrongAttempts = 0;
  let yesClicks     = 0;
  let noClicks      = 0;
  let celebrationShown = false;
  let isMusicPlaying = false;

  /* ──────────────────────────────────────────────
     SOUND HELPER
     Tries the <audio> element first.
     Falls back to Web Audio API synthesized tones
     so the site works instantly without .mp3 files.

     ✏️ To use your own sound files:
        1. Drop .mp3/.wav files into the sounds/ folder.
        2. Name them: correct.mp3, wrong.mp3, pop.mp3,
           celebrate.mp3, sad.mp3
        3. The <audio> tags in index.html already point to them.
        4. Once real files exist the fallback is never heard.
     ────────────────────────────────────────────── */
  let audioCtx;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtx;
  }

  // Synthesized fallback sounds
  function synthPop() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.18, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.15);
  }

  function synthCorrect() {
    const ctx = getAudioCtx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.25);
    });
  }

  function synthWrong() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(330, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.14, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.25);
  }

  function synthCelebrate() {
    const ctx = getAudioCtx();
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.13, ctx.currentTime + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.2);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.1);
      osc.stop(ctx.currentTime + i * 0.1 + 0.2);
    });
  }

  function synthSad() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
    osc.connect(gain).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.35);
  }

  const SYNTH_MAP = {
    'snd-correct':   synthCorrect,
    'snd-wrong':     synthWrong,
    'snd-pop':       synthPop,
    'snd-celebrate': synthCelebrate,
    'snd-sad':       synthSad,
  };

  function playSound(id) {
    // 1. Try the real audio file
    try {
      const audio = document.getElementById(id);
      if (audio && audio.src && audio.readyState >= 2) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
        return;
      }
    } catch (_) { /* noop */ }

    // 2. Fall back to synthesized tone
    try {
      const fn = SYNTH_MAP[id];
      if (fn) fn();
    } catch (_) { /* noop */ }
  }

  /* ──────────────────────────────────────────────
     PAGE TRANSITIONS
     ────────────────────────────────────────────── */
  function showPage(pageEl) {
    $$('.page').forEach((p) => p.classList.remove('active'));
    pageEl.classList.add('active');
  }

  /* ──────────────────────────────────────────────
     PASSWORD HANDLING
     ────────────────────────────────────────────── */
  function handlePassword() {
    const val = passwordInput.value.trim().toLowerCase();

    if (val === SECRET_PASSWORD) {
      onCorrectPassword();
    } else {
      onWrongPassword();
    }
  }

  function onCorrectPassword() {
    playSound('snd-correct');

    // Show success popup
    successPopup.classList.add('visible');

    // After a moment, transition to proposal page
    setTimeout(() => {
      successPopup.classList.remove('visible');
      switchToProposal();
    }, 2200);
  }

  function onWrongPassword() {
    playSound('snd-wrong');

    // Shake input
    passwordGroup.classList.add('shake');
    setTimeout(() => passwordGroup.classList.remove('shake'), 500);

    // Show error message
    const msgIndex = Math.min(wrongAttempts, WRONG_MESSAGES.length - 1);
    errorMsg.textContent = WRONG_MESSAGES[msgIndex];
    errorMsg.classList.add('visible');

    wrongAttempts++;

    // Clear input
    passwordInput.value = '';
    passwordInput.focus();
  }

  btnSubmit.addEventListener('click', handlePassword);
  passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handlePassword();
  });

  /* ──────────────────────────────────────────────
     PROPOSAL PAGE — REVEAL ANIMATION
     ────────────────────────────────────────────── */
  function switchToProposal() {
    updateParticlesTheme('pink');
    showPage(pageProposal);

    // Reveal steps one-by-one smoothly (quietly, without pop beeps)
    const steps = pageProposal.querySelectorAll('.reveal-step');
    steps.forEach((step, i) => {
      setTimeout(() => {
        step.classList.add('visible');
      }, 350 + i * 500);
    });
  }

  /* ──────────────────────────────────────────────
     YES BUTTON
     ────────────────────────────────────────────── */
  btnYes.addEventListener('click', () => {
    playSound('snd-celebrate');
    spawnFloatingHearts(10);

    // Pre-buffer the song so it starts instantly on Continue
    if (bgMusic) {
      try { bgMusic.load(); } catch (_) {}
    }

    if (!celebrationShown && yesClicks === 0) {
      // First YES — show reaction then celebration
      showReaction(YES_MESSAGES[0]);

      setTimeout(() => {
        showCelebration();
        celebrationShown = true;
      }, 1800);
    } else {
      // Subsequent YES clicks — fun reactions
      const idx = Math.min(yesClicks, YES_MESSAGES.length - 1);
      showReaction(YES_MESSAGES[idx]);
      spawnFloatingHearts(6);
    }

    yesClicks++;
  });

  /* ──────────────────────────────────────────────
     NO BUTTON
     ────────────────────────────────────────────── */
  btnNo.addEventListener('click', () => {
    playSound('snd-sad');

    const idx = Math.min(noClicks, NO_MESSAGES.length - 1);
    showReaction(NO_MESSAGES[idx]);

    // Visual changes on repeated clicks
    btnNo.classList.remove('wiggle');
    void btnNo.offsetWidth; // reflow to restart animation

    if (noClicks === 0) {
      // subtle wiggle
      btnNo.classList.add('wiggle');
    } else if (noClicks === 1) {
      btnNo.classList.add('wiggle', 'shrink-1');
    } else if (noClicks === 2) {
      btnNo.classList.add('wiggle', 'shrink-2');
      // move randomly a tiny bit
      moveNoButton();
    } else {
      btnNo.classList.add('wiggle', 'shrink-3');
      moveNoButton();
    }

    noClicks++;
  });

  function moveNoButton() {
    const rx = (Math.random() - 0.5) * 40;
    const ry = (Math.random() - 0.5) * 20;
    btnNo.style.transform = `translate(${rx}px, ${ry}px)`;

    // Reset after a moment
    setTimeout(() => {
      btnNo.style.transform = '';
    }, 1500);
  }

  /* ──────────────────────────────────────────────
     REACTION DISPLAY
     ────────────────────────────────────────────── */
  function showReaction(msg) {
    reactionArea.innerHTML = `
      <div class="reaction-card">
        <div class="reaction-emoji">${msg.emoji}</div>
        <p class="reaction-text">${msg.text}</p>
      </div>
    `;
  }

  /* ──────────────────────────────────────────────
     CELEBRATION
     ────────────────────────────────────────────── */
  function showCelebration() {
    playSound('snd-celebrate');
    celebOverlay.classList.add('visible');
    startConfetti();
    spawnFloatingHearts(20);
  }

  /* ── Background Music Controller ── */
  function startBgMusic() {
    if (!bgMusic) return;

    bgMusic.volume = 0.85;
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          isMusicPlaying = true;
          if (musicToggleBtn) musicToggleBtn.classList.add('playing');
          if (musicStatus) musicStatus.textContent = 'Now Playing 🎵';
        })
        .catch((err) => {
          console.warn("Autoplay blocked, click button to play:", err);
          isMusicPlaying = false;
          if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
          if (musicStatus) musicStatus.textContent = 'Tap to Play 🎵';
        });
    }
  }

  function pauseBgMusic() {
    isMusicPlaying = false;
    if (musicToggleBtn) musicToggleBtn.classList.remove('playing');
    if (musicStatus) musicStatus.textContent = 'Paused ⏸️';

    if (bgMusic) {
      try { bgMusic.pause(); } catch (_) {}
    }
  }

  function toggleBgMusic() {
    if (isMusicPlaying) {
      pauseBgMusic();
    } else {
      startBgMusic();
    }
  }

  if (musicToggleBtn) {
    musicToggleBtn.addEventListener('click', toggleBgMusic);
  }

  /* ── Continue button (leads to Scrapbook Album + Music) ── */
  btnContinue.addEventListener('click', () => {
    celebOverlay.classList.remove('visible');
    stopConfetti();

    // Show Album Page
    showPage(pageNext);

    // Scroll album to top
    if (pageNext) pageNext.scrollTop = 0;

    // Start background song!
    startBgMusic();

    // Spawn cute floating hearts to welcome her into the album
    spawnFloatingHearts(12);
  });

  /* ── Flower Surprise Button (leads to Page 4 Bouquet) ── */
  /* NOTE: The background music NEVER stops! It continues playing seamlessly! */
  if (btnFlowerSurprise) {
    btnFlowerSurprise.addEventListener('click', () => {
      // Transition to Bouquet Page without touching or interrupting music!
      showPage(pageBouquet);
      if (pageBouquet) pageBouquet.scrollTop = 0;
      startFlowerRain();
      spawnFloatingFlowers(20);
    });
  }

  /* ── Back to Album Button ── */
  if (btnBackToAlbum) {
    btnBackToAlbum.addEventListener('click', () => {
      showPage(pageNext);
      if (pageNext) pageNext.scrollTop = 0;
    });
  }

  /* ──────────────────────────────────────────────
     FLOATING HEARTS
     ────────────────────────────────────────────── */
  const HEART_EMOJIS = ['💗', '💕', '💖', '🎀', '✨', '🥹', '🫶🏻', '🎮'];

  function spawnFloatingHearts(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'floating-heart';
        el.textContent = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
        el.style.left = Math.random() * 90 + 5 + '%';
        el.style.bottom = '10%';
        el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
        el.style.animationDuration = (2 + Math.random() * 1.5) + 's';
        document.body.appendChild(el);

        el.addEventListener('animationend', () => el.remove());
      }, i * 120);
    }
  }

  /* ══════════════════════════════════════════════
     BACKGROUND PARTICLES  (Canvas)
     Hearts, stars, tiny circles — gentle float
     ══════════════════════════════════════════════ */
  const pCtx = particlesCanvas.getContext('2d');
  let particles = [];
  let particleTheme = 'cyan'; // 'cyan' | 'pink'

  function resizeParticleCanvas() {
    particlesCanvas.width  = window.innerWidth;
    particlesCanvas.height = window.innerHeight;
  }

  window.addEventListener('resize', resizeParticleCanvas);
  resizeParticleCanvas();

  function createParticles(count) {
    particles = [];
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        r: 3 + Math.random() * 5,
        dx: (Math.random() - 0.5) * 0.4,
        dy: -0.2 - Math.random() * 0.4,
        opacity: 0.15 + Math.random() * 0.25,
        type: Math.random() > 0.5 ? 'heart' : 'circle',
      });
    }
  }

  function drawParticle(p) {
    pCtx.save();
    pCtx.globalAlpha = p.opacity;

    if (p.type === 'heart') {
      drawHeart(pCtx, p.x, p.y, p.r,
        particleTheme === 'cyan' ? 'rgba(128,222,234,0.7)' : 'rgba(244,143,177,0.7)');
    } else {
      pCtx.beginPath();
      pCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      pCtx.fillStyle = particleTheme === 'cyan'
        ? 'rgba(178,235,242,0.6)'
        : 'rgba(248,187,208,0.6)';
      pCtx.fill();
    }

    pCtx.restore();
  }

  function drawHeart(ctx, cx, cy, size, color) {
    ctx.beginPath();
    const s = size * 0.6;
    ctx.moveTo(cx, cy + s * 0.4);
    ctx.bezierCurveTo(cx, cy - s * 0.2, cx - s, cy - s * 0.6, cx - s, cy + s * 0.1);
    ctx.bezierCurveTo(cx - s, cy + s * 0.6, cx, cy + s, cx, cy + s * 1.1);
    ctx.bezierCurveTo(cx, cy + s, cx + s, cy + s * 0.6, cx + s, cy + s * 0.1);
    ctx.bezierCurveTo(cx + s, cy - s * 0.6, cx, cy - s * 0.2, cx, cy + s * 0.4);
    ctx.fillStyle = color;
    ctx.fill();
  }

  function animateParticles() {
    pCtx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);

    particles.forEach((p) => {
      p.x += p.dx;
      p.y += p.dy;

      // Wrap around
      if (p.y + p.r < 0) p.y = particlesCanvas.height + p.r;
      if (p.x < -p.r) p.x = particlesCanvas.width + p.r;
      if (p.x > particlesCanvas.width + p.r) p.x = -p.r;

      drawParticle(p);
    });

    requestAnimationFrame(animateParticles);
  }

  function updateParticlesTheme(theme) {
    particleTheme = theme;
  }

  // Start particles
  createParticles(35);
  animateParticles();

  /* ══════════════════════════════════════════════
     CONFETTI  (Canvas)
     ══════════════════════════════════════════════ */
  let confettiPieces = [];
  let confettiRunning = false;
  let confettiRaf;
  const cCtx = confettiCanvas.getContext('2d');

  const CONFETTI_COLORS = [
    '#f48fb1', '#ec407a', '#ce93d8', '#80deea',
    '#fff176', '#ffab91', '#a5d6a7', '#81d4fa',
  ];

  function startConfetti() {
    confettiCanvas.style.display = 'block';
    confettiCanvas.width  = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiRunning = true;
    confettiPieces = [];

    for (let i = 0; i < 150; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        w: 6 + Math.random() * 6,
        h: 4 + Math.random() * 4,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        dy: 1.5 + Math.random() * 3,
        dx: (Math.random() - 0.5) * 2,
        rot: Math.random() * 360,
        dr: (Math.random() - 0.5) * 6,
        opacity: 0.8 + Math.random() * 0.2,
      });
    }

    animateConfetti();
  }

  function animateConfetti() {
    if (!confettiRunning) return;

    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces.forEach((c) => {
      c.x += c.dx;
      c.y += c.dy;
      c.rot += c.dr;

      if (c.y > confettiCanvas.height + 20) {
        c.y = -10;
        c.x = Math.random() * confettiCanvas.width;
      }

      cCtx.save();
      cCtx.translate(c.x, c.y);
      cCtx.rotate((c.rot * Math.PI) / 180);
      cCtx.globalAlpha = c.opacity;
      cCtx.fillStyle = c.color;
      cCtx.fillRect(-c.w / 2, -c.h / 2, c.w, c.h);
      cCtx.restore();
    });

    confettiRaf = requestAnimationFrame(animateConfetti);
  }

  function stopConfetti() {
    confettiRunning = false;
    cancelAnimationFrame(confettiRaf);
    cCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiCanvas.style.display = 'none';
  }

  /* ══════════════════════════════════════════════
     FALLING FLOWER RAIN CANVAS (Page 4 Bouquet)
     Cherry blossoms, pink lily petals, roses & sparkles
     ══════════════════════════════════════════════ */
  let flowerPetals = [];
  let flowerRainRunning = false;
  let flowerRainRaf;
  const fCtx = flowerRainCanvas ? flowerRainCanvas.getContext('2d') : null;

  const PETAL_COLORS = [
    '#f8bbd0', '#f48fb1', '#f06292', '#fce4ec',
    '#ffffff', '#ff80ab', '#ffcdd2', '#fce4ec'
  ];

  function resizeFlowerCanvas() {
    if (!flowerRainCanvas) return;
    flowerRainCanvas.width  = window.innerWidth;
    flowerRainCanvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeFlowerCanvas);

  function startFlowerRain() {
    if (!flowerRainCanvas || !fCtx) return;
    resizeFlowerCanvas();
    flowerRainRunning = true;
    flowerPetals = [];

    for (let i = 0; i < 70; i++) {
      flowerPetals.push({
        x: Math.random() * flowerRainCanvas.width,
        y: Math.random() * flowerRainCanvas.height - flowerRainCanvas.height,
        w: 9 + Math.random() * 8,
        h: 14 + Math.random() * 10,
        color: PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        dy: 1.2 + Math.random() * 1.8,
        dx: 0.3 + Math.sin(Math.random() * Math.PI) * 1.2,
        rot: Math.random() * 360,
        dr: (Math.random() - 0.5) * 2.5,
        swaySpeed: 0.02 + Math.random() * 0.03,
        swayAngle: Math.random() * Math.PI * 2,
        opacity: 0.55 + Math.random() * 0.35,
      });
    }

    animateFlowerRain();
  }

  function drawPetal(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate((p.rot * Math.PI) / 180);
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;

    // Realistic petal curve
    ctx.beginPath();
    ctx.moveTo(0, -p.h / 2);
    ctx.bezierCurveTo(p.w, -p.h / 4, p.w, p.h / 3, 0, p.h / 2);
    ctx.bezierCurveTo(-p.w, p.h / 3, -p.w, -p.h / 4, 0, -p.h / 2);
    ctx.fill();

    // Subtle petal vein highlight
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, -p.h / 3);
    ctx.lineTo(0, p.h / 3);
    ctx.stroke();

    ctx.restore();
  }

  function animateFlowerRain() {
    if (!flowerRainRunning || !fCtx) return;

    fCtx.clearRect(0, 0, flowerRainCanvas.width, flowerRainCanvas.height);

    flowerPetals.forEach((p) => {
      p.swayAngle += p.swaySpeed;
      p.x += p.dx + Math.sin(p.swayAngle) * 1.2;
      p.y += p.dy;
      p.rot += p.dr;

      if (p.y > flowerRainCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * flowerRainCanvas.width;
      }
      if (p.x > flowerRainCanvas.width + 20) {
        p.x = -20;
      }

      drawPetal(fCtx, p);
    });

    flowerRainRaf = requestAnimationFrame(animateFlowerRain);
  }

  /* ── Spawn floating flowers ── */
  const FLOWER_EMOJIS = ['🌸', '🌺', '🌷', '💐', '✨', '💖', '💗', '🎀'];

  function spawnFloatingFlowers(count) {
    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'floating-heart';
        el.textContent = FLOWER_EMOJIS[Math.floor(Math.random() * FLOWER_EMOJIS.length)];
        el.style.left = Math.random() * 90 + 5 + '%';
        el.style.bottom = '10%';
        el.style.fontSize = (1.2 + Math.random() * 1.3) + 'rem';
        el.style.animationDuration = (2.2 + Math.random() * 1.5) + 's';
        document.body.appendChild(el);

        el.addEventListener('animationend', () => el.remove());
      }, i * 110);
    }
  }

})();
