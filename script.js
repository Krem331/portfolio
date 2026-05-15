// ===== FISH WAG + BALL PHYSICS =====
(function () {
  const fish  = document.querySelector('.hero-img');
  const balls = Array.from(document.querySelectorAll('.ball'));
  if (!fish || !balls.length) return;

  // Each ball: physics state + scatter direction
  const DIRS = [
    { ax:  1.0, ay: -1.2 }, // ig  — up-right
    { ax:  1.3, ay: -0.5 }, // tt  — right, slight up
    { ax:  1.4, ay:  0.1 }, // yt  — straight right
    { ax:  1.1, ay:  0.8 }, // fb  — right-down
    { ax:  0.8, ay:  1.4 }, // li  — down-right
  ];

  const states = balls.map((_, i) => ({
    x: 0, y: 0,
    vx: 0, vy: 0,
    rot: 0, rotV: 0,
    hitDelay: i * 80,    // ms stagger between hits
    lastHit: -Infinity,
  }));

  const PERIOD   = 2600;   // ms — full tail wag cycle
  const MAX_ANG  = 5.5;    // degrees total rotation
  const SPRING   = 0.10;
  const DAMP     = 0.72;
  const IMPULSE  = 22;

  let t0 = null;
  let prevSin = 0;

  function tick(ts) {
    if (!t0) t0 = ts;
    const elapsed = ts - t0;

    // ---- fish rotation ----
    const phase = (elapsed % PERIOD) / PERIOD;           // 0 → 1
    const sinVal = Math.sin(2 * Math.PI * phase);
    const angle  = MAX_ANG * sinVal;
    fish.style.transform = `rotate(${angle}deg)`;

    // Detect tail crossing max-right (sinVal going positive-peak)
    const tailMovingRight = sinVal > 0.85 && prevSin <= 0.85;
    prevSin = sinVal;

    // ---- ball physics ----
    balls.forEach((ball, i) => {
      const s = states[i];
      const d = DIRS[i];

      // Trigger hit with stagger
      if (tailMovingRight && ts - s.lastHit > PERIOD * 0.9) {
        setTimeout(() => {
          s.vx += d.ax * IMPULSE;
          s.vy += d.ay * IMPULSE;
          s.rotV += (i % 2 === 0 ? 1 : -1) * 18;
          s.lastHit = ts;
        }, s.hitDelay);
      }

      // Spring back
      s.vx  += -s.x   * SPRING;
      s.vy  += -s.y   * SPRING;
      s.vx  *= DAMP;
      s.vy  *= DAMP;
      s.x   += s.vx;
      s.y   += s.vy;
      s.rotV *= DAMP;
      s.rot  += s.rotV;

      ball.style.transform =
        `translate(${s.x.toFixed(2)}px, ${s.y.toFixed(2)}px) rotate(${s.rot.toFixed(2)}deg)`;
    });

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();

// ===== MOBILE NAV =====
const toggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
toggle.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ===== ACTIVE NAV LINK =====
const sections = document.querySelectorAll('section[id]');
const links    = document.querySelectorAll('.nav-link');

const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      links.forEach(l => l.classList.remove('active'));
      const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
      if (active) active.classList.add('active');
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => navObserver.observe(s));

// ===== SCROLL REVEAL =====
const revealEls = document.querySelectorAll(
  '.about-grid > *, .service-card, .work-card, .contact-inner, .stat'
);
revealEls.forEach(el => el.classList.add('reveal'));

const revealObs = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 90);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revealObs.observe(el));

// ===== COUNTER ANIMATION =====
function animateCount(el) {
  const target   = +el.dataset.target;
  const duration = 1600;
  const start    = performance.now();
  const step = (now) => {
    const p = Math.min((now - start) / duration, 1);
    el.textContent = Math.floor((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-n').forEach(animateCount);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const statsEl = document.querySelector('.about-stats');
if (statsEl) counterObs.observe(statsEl);

// ===== CONTACT FORM =====
document.getElementById('contactForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const btn = this.querySelector('.btn-submit');
  btn.textContent = 'Sending...';
  btn.disabled = true;
  setTimeout(() => {
    btn.textContent = 'Message Sent ✓';
    this.reset();
    setTimeout(() => { btn.textContent = 'Send Message →'; btn.disabled = false; }, 3000);
  }, 1200);
});
