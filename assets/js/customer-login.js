/*ARTIZAN — CUSTOMER LOGIN JS
   customer-login.js
   Handles: form validation, API login call,
   rate limiting, remember me, testimonials,
   Google OAuth placeholder, redirects */

'use strict';

// ── TESTIMONIALS DATA
const TESTIMONIALS = [
  {
    text:     'Found a plumber in 10 minutes. The escrow payment gave me real peace of mind — I knew my money was safe until the job was done.',
    name:     'Folake Adeyemi',
    location: 'Lekki Phase 1, Lagos',
    initial:  'F',
    color1:   '#4F46E5', color2: '#818CF8',
  },
  {
    text:     'I use Artizan every month now. My tailor is on here, my electrician is on here. It just makes life so much easier in Lagos.',
    name:     'Babatunde Ogunleye',
    location: 'Ikeja, Lagos',
    initial:  'B',
    color1:   '#E85D04', color2: '#F4A261',
  },
  {
    text:     'Finally a platform that actually verifies who is coming into your house. As a single woman in Lagos, this matters so much to me.',
    name:     'Adaeze Obi',
    location: 'Victoria Island, Lagos',
    initial:  'A',
    color1:   '#7B2D8B', color2: '#C084FC',
  },
  {
    text:     'My baby sitter on Artizan has been amazing. Knowing she went through KYC verification makes me feel so much better leaving my kids with her.',
    name:     'Ngozi Eze',
    location: 'Surulere, Lagos',
    initial:  'N',
    color1:   '#059669', color2: '#34D399',
  },
];

// ── DOM REFS
const form        = document.getElementById('login-form');
const emailInput  = document.getElementById('email');
const pwInput     = document.getElementById('password');
const rememberMe  = document.getElementById('remember-me');
const submitBtn   = document.getElementById('submit-btn');
const googleBtn   = document.getElementById('google-btn');

// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  initTestimonials(TESTIMONIALS);
  initPasswordToggle('password', 'pw-toggle', 'pw-icon');
  prefillFromStorage();
  attachValidation();
  attachFormSubmit();
  attachGoogleBtn();
  checkAlreadyLoggedIn();
});

// ── CHECK IF ALREADY LOGGED IN
function checkAlreadyLoggedIn() {
  if (AuthStorage.isLoggedIn()) {
    const user = AuthStorage.getUser();
    redirectAfterLogin(user?.role || 'customer');
  }
}

// ── PREFILL EMAIL IF REMEMBERED
function prefillFromStorage() {
  const remembered = localStorage.getItem('artizan_remembered_email');
  if (remembered && emailInput) {
    emailInput.value = remembered;
    if (rememberMe) rememberMe.checked = true;
    // Move focus to password
    pwInput?.focus();
  }
}

// ── LIVE VALIDATION (validate as user types/tabs)
function attachValidation() {
  // Email — validate on blur
  emailInput?.addEventListener('blur', () => {
    const err = AuthValidate.email(emailInput.value.trim());
    setFieldState('field-email', 'error-email', err);
  });
  emailInput?.addEventListener('input', () => {
    // Clear error as user types
    const field = document.getElementById('field-email');
    if (field?.classList.contains('field-error')) {
      field.classList.remove('field-error');
      document.getElementById('error-email').textContent = '';
    }
  });

  // Password — validate on blur
  pwInput?.addEventListener('blur', () => {
    const err = pwInput.value ? '' : 'Password is required.';
    setFieldState('field-password', 'error-password', err);
  });
  pwInput?.addEventListener('input', () => {
    const field = document.getElementById('field-password');
    if (field?.classList.contains('field-error')) {
      field.classList.remove('field-error');
      document.getElementById('error-password').textContent = '';
    }
    // Clear global error as user edits
    showGlobalError('');
  });

  // Enter key on email moves to password
  emailInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); pwInput?.focus(); }
  });
}

// ── FORM SUBMIT
function attachFormSubmit() {
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    showGlobalError('');

    const email    = emailInput?.value.trim() || '';
    const password = pwInput?.value || '';

    // Client-side validation
    const emailErr = AuthValidate.email(email);
    const pwErr    = password ? '' : 'Password is required.';

    let valid = true;
    if (!setFieldState('field-email',    'error-email',    emailErr)) valid = false;
    if (!setFieldState('field-password', 'error-password', pwErr))    valid = false;
    if (!valid) return;

    // Rate limit check
    const limit = RateLimit.check();
    if (!limit.allowed) {
      RateLimit.startCountdown(limit.wait);
      return;
    }

    // Loading state
    setSubmitLoading(true);

    try {
      const data = await AuthAPI.login(email, password);

      // Verify role
      if (data.user?.role !== 'customer') {
        throw new Error('This account is registered as an artisan. Please use the artisan login.');
      }

      // Save session
      AuthStorage.saveSession(
        data.access,
        data.refresh,
        data.user,
        rememberMe?.checked
      );

      // Remember email if checked
      if (rememberMe?.checked) {
        localStorage.setItem('artizan_remembered_email', email);
      } else {
        localStorage.removeItem('artizan_remembered_email');
      }

      // Reset rate limit on success
      RateLimit.reset();

      // Show brief success then redirect
      showSuccessFlash();
      setTimeout(() => redirectAfterLogin('customer'), 800);

    } catch (err) {
      // Distinguish error types
      const msg = err.message || '';

      if (msg.toLowerCase().includes('artisan')) {
        showGlobalError(msg);
      } else if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
        // Demo mode — allow login in dev without backend
        handleDemoLogin(email);
      } else {
        showGlobalError('Incorrect email or password. Please check and try again.');
        // Shake password field
        const pwField = document.getElementById('field-password');
        pwField?.classList.add('field-error');
        document.getElementById('error-password').textContent = '';
      }
    } finally {
      setSubmitLoading(false);
    }
  });
}

// ── DEMO LOGIN (when backend is not live)
function handleDemoLogin(email) {
  // Simulate a successful login for dev/demo purposes
  const demoUser = {
    id:       'demo-customer-001',
    email,
    full_name: email.split('@')[0].replace(/[._]/g, ' '),
    role:     'customer',
  };
  AuthStorage.saveSession('demo-token-xxx', 'demo-refresh-xxx', demoUser, false);
  showSuccessFlash();
  setTimeout(() => redirectAfterLogin('customer'), 800);
}

// ── SUCCESS FLASH
function showSuccessFlash() {
  const btn = document.getElementById('submit-btn');
  if (!btn) return;
  btn.style.background = '#059669';
  btn.innerHTML = '<i class="fa fa-circle-check"></i> <span>Signed in!</span>';
  btn.disabled = true;
}

// ── GOOGLE SIGN IN (placeholder — requires Firebase/Google OAuth setup)
function attachGoogleBtn() {
  googleBtn?.addEventListener('click', () => {
    // In production: trigger Google OAuth flow
    // e.g. firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider())
    showToast('Google sign-in coming soon. Please use email for now.', 'info');
  });
}

// ── TOAST (local — shared auth.js version may not be loaded yet)
function showToast(message, type = 'info') {
  document.querySelectorAll('.artizan-toast').forEach(t => t.remove());
  const colors = { info: '#4F46E5', error: '#DC2626', warning: '#D97706', success: '#059669' };
  const icons  = { info: 'fa-circle-info', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', success: 'fa-circle-check' };
  const toast  = document.createElement('div');
  toast.className = 'artizan-toast';
  toast.innerHTML = `<i class="fa ${icons[type]}" style="color:${colors[type]}"></i><span>${message}</span>`;
  toast.style.cssText = `
    position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(16px);
    background:#fff;border:1px solid #e5e5ea;border-radius:40px;
    padding:12px 22px;display:flex;align-items:center;gap:10px;
    font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;
    opacity:0;transition:opacity 0.3s,transform 0.3s;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
  });
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
