/* ══════════════════════════════════════════
   ARTIZAN — SHARED AUTH JS (auth.js)
   Shared utilities used by all auth pages:
   customer-login, customer-signup,
   artisan-login, artisan-signup
══════════════════════════════════════════ */

'use strict';

// ── SHARED: Password visibility toggle
// Call once per password field pair
window.initPasswordToggle = function (inputId, toggleId, iconId) {
  const input  = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  const icon   = document.getElementById(iconId);
  if (!input || !toggle) return;

  toggle.addEventListener('click', () => {
    const isText = input.type === 'text';
    input.type = isText ? 'password' : 'text';
    if (icon) icon.className = isText ? 'fa fa-eye' : 'fa fa-eye-slash';
    toggle.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
  });
};

// ── SHARED: Field validation helpers
window.AuthValidate = {
  email(val) {
    if (!val) return 'Email address is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return 'Please enter a valid email address.';
    return '';
  },
  password(val) {
    if (!val) return 'Password is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    return '';
  },
  passwordMatch(val, confirm) {
    if (!confirm) return 'Please confirm your password.';
    if (val !== confirm) return 'Passwords do not match.';
    return '';
  },
  phone(val) {
    if (!val) return 'Phone number is required.';
    const clean = val.replace(/[\s\-()]/g, '');
    if (!/^(0|\+234)[789][01]\d{8}$/.test(clean)) return 'Enter a valid Nigerian number (e.g. 08012345678).';
    return '';
  },
  required(val, label) {
    if (!val || !val.toString().trim()) return `${label} is required.`;
    return '';
  },
};

// ── SHARED: Set field state
window.setFieldState = function (fieldId, errorId, errorMsg) {
  const field = document.getElementById(fieldId);
  const error = document.getElementById(errorId);
  if (!field) return;

  field.classList.remove('field-valid', 'field-error');
  if (error) error.textContent = '';

  if (errorMsg) {
    field.classList.add('field-error');
    if (error) error.textContent = errorMsg;
    return false;
  } else {
    field.classList.add('field-valid');
    return true;
  }
};

// ── SHARED: Show/hide global error
window.showGlobalError = function (msg, elId = 'global-error', textId = 'global-error-text') {
  const el   = document.getElementById(elId);
  const text = document.getElementById(textId);
  if (!el) return;
  if (msg) {
    if (text) text.textContent = msg;
    el.style.display = 'flex';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  } else {
    el.style.display = 'none';
  }
};

// ── SHARED: Submit button loading state
window.setSubmitLoading = function (loading, btnId = 'submit-btn', textId = 'submit-text', spinnerId = 'submit-spinner') {
  const btn     = document.getElementById(btnId);
  const text    = document.getElementById(textId);
  const spinner = document.getElementById(spinnerId);
  if (!btn) return;
  btn.disabled = loading;
  if (text)    text.style.display    = loading ? 'none' : 'inline';
  if (spinner) spinner.style.display = loading ? 'inline-flex' : 'none';
};

// ── SHARED: Password strength meter
window.initPasswordStrength = function (inputId, fillId, labelId) {
  const input = document.getElementById(inputId);
  const fill  = document.getElementById(fillId);
  const label = document.getElementById(labelId);
  if (!input || !fill) return;

  input.addEventListener('input', () => {
    const val = input.value;
    let score = 0;
    if (val.length >= 8)  score++;
    if (val.length >= 12) score++;
    if (/[A-Z]/.test(val))   score++;
    if (/[0-9]/.test(val))   score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    const levels = [
      { pct: '0%',   color: 'transparent', text: '' },
      { pct: '25%',  color: '#DC2626', text: 'Weak' },
      { pct: '50%',  color: '#D97706', text: 'Fair' },
      { pct: '75%',  color: '#F59E0B', text: 'Good' },
      { pct: '90%',  color: '#059669', text: 'Strong' },
      { pct: '100%', color: '#059669', text: 'Very strong' },
    ];
    const lvl = levels[Math.min(score, 5)];
    fill.style.width    = lvl.pct;
    fill.style.background = lvl.color;
    if (label) label.textContent = lvl.text;
  });
};

// ── SHARED: Animated counters (left panel stats)
window.animateCounters = function () {
  document.querySelectorAll('.al-stat-num[data-target]').forEach(el => {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start    = performance.now();
    function update(now) {
      const p = Math.min((now - start) / duration, 1);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(e * target);
      el.textContent = v >= 1000 ? (v/1000).toFixed(v % 1000 === 0 ? 0 : 1) + 'K' : v;
      if (p < 1) requestAnimationFrame(update);
      else el.textContent = target >= 1000 ? (target/1000).toFixed(0) + 'K' : target;
    }
    requestAnimationFrame(update);
  });
};

// ── SHARED: Rotating testimonials (left panel)
window.initTestimonials = function (testimonials) {
  const textEl   = document.getElementById('al-testi-text');
  const nameEl   = document.getElementById('al-testi-name');
  const locEl    = document.getElementById('al-testi-loc');
  const avatarEl = document.getElementById('al-testi-avatar');
  const dotsEl   = document.getElementById('al-testi-dots');
  if (!textEl || !testimonials?.length) return;

  let current = 0;

  // Build dots
  testimonials.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Testimonial ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl?.appendChild(dot);
  });

  function goTo(i) {
    current = i;
    const t = testimonials[i];

    // Fade out
    if (textEl) textEl.style.opacity = '0';

    setTimeout(() => {
      if (textEl)   textEl.textContent   = `"${t.text}"`;
      if (nameEl)   nameEl.textContent   = t.name;
      if (locEl)    locEl.textContent    = t.location;
      if (avatarEl) {
        avatarEl.textContent  = t.initial;
        avatarEl.style.background = `linear-gradient(135deg, ${t.color1}, ${t.color2})`;
      }
      if (textEl) textEl.style.opacity = '1';

      document.querySelectorAll('.testi-dot').forEach((d, idx) => {
        d.classList.toggle('active', idx === i);
      });
    }, 300);
  }

  // Auto advance every 5s
  let timer = setInterval(() => goTo((current + 1) % testimonials.length), 5000);
  dotsEl?.addEventListener('mouseenter', () => clearInterval(timer));
  dotsEl?.addEventListener('mouseleave', () => {
    timer = setInterval(() => goTo((current + 1) % testimonials.length), 5000);
  });
};

// ── SHARED: Rate limit logic
window.RateLimit = {
  key: 'artizan_login_attempts',
  max: 5,
  windowMs: 60 * 1000,

  check() {
    const stored = JSON.parse(localStorage.getItem(this.key) || '{"count":0,"ts":0}');
    const now    = Date.now();
    if (now - stored.ts > this.windowMs) {
      localStorage.setItem(this.key, JSON.stringify({ count: 1, ts: now }));
      return { allowed: true };
    }
    if (stored.count >= this.max) {
      const wait = Math.ceil((this.windowMs - (now - stored.ts)) / 1000);
      return { allowed: false, wait };
    }
    stored.count++;
    localStorage.setItem(this.key, JSON.stringify(stored));
    return { allowed: true };
  },

  reset() {
    localStorage.removeItem(this.key);
  },

  startCountdown(seconds, countdownId = 'countdown', rateLimitId = 'rate-limit') {
    const cdEl = document.getElementById(countdownId);
    const rlEl = document.getElementById(rateLimitId);
    if (!cdEl || !rlEl) return;

    rlEl.style.display = 'flex';
    let s = seconds;
    cdEl.textContent = s;

    const timer = setInterval(() => {
      s--;
      cdEl.textContent = s;
      if (s <= 0) {
        clearInterval(timer);
        rlEl.style.display = 'none';
        this.reset();
      }
    }, 1000);
  },
};

// ── SHARED: Token storage
window.AuthStorage = {
  saveSession(token, refreshToken, user, remember) {
    sessionStorage.setItem('artizan_token', token);
    sessionStorage.setItem('artizan_user', JSON.stringify(user));
    if (remember) {
      localStorage.setItem('artizan_refresh', refreshToken);
    }
  },
  getToken()   { return sessionStorage.getItem('artizan_token'); },
  getUser()    { return JSON.parse(sessionStorage.getItem('artizan_user') || 'null'); },
  clear() {
    sessionStorage.removeItem('artizan_token');
    sessionStorage.removeItem('artizan_user');
    localStorage.removeItem('artizan_refresh');
  },
  isLoggedIn() { return !!this.getToken(); },
};

// ── SHARED: API call wrapper
window.AuthAPI = {
  base: '/api',

  async login(email, password) {
    const res = await fetch(`${this.base}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.message || 'Login failed.');
    return data;
  },

  async register(payload) {
    const formData = payload instanceof FormData ? payload : null;
    const res = await fetch(`${this.base}/auth/register/`, {
      method: 'POST',
      headers: formData ? {} : { 'Content-Type': 'application/json' },
      body: formData || JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || data.email?.[0] || data.phone_number?.[0] || 'Registration failed.');
    return data;
  },
};

// ── SHARED: Redirect after login based on role
window.redirectAfterLogin = function (role) {
  const returnUrl = new URLSearchParams(window.location.search).get('next');
  if (returnUrl) { window.location.href = returnUrl; return; }
  window.location.href = role === 'artisan' ? 'artisan-dashboard.html' : 'customer-dashboard.html';
};

// ── INIT counters on load
document.addEventListener('DOMContentLoaded', () => {
  animateCounters();
});
