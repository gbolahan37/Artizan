/* ══════════════════════════════════════════
   ARTIZAN — ARTISAN SIGNUP JS
   artisan-signup.js
   Handles: 5-step form navigation, field
   validation, file upload with drag & drop,
   zone chip selection, radius slider,
   API registration, KYC upload, demo mode
══════════════════════════════════════════ */

'use strict';

// ── TESTIMONIALS
const TESTIMONIALS = [
  { text: 'My earnings doubled in my first month. Customers pay through escrow so I always get paid on time — no more chasing.',       name: 'Chukwudi Nwosu',  location: 'Plumber · Victoria Island', initial: 'C', color1: '#0077B6', color2: '#48CAE4' },
  { text: 'Since joining Artizan I get 3–4 bookings every week. The SMS alert means I never miss a job even when my data finishes.',  name: 'Kingsley Eze',    location: 'Electrician · Surulere',    initial: 'K', color1: '#059669', color2: '#34D399' },
  { text: 'I built my reputation from zero reviews. Now I have 150+ five-star ratings and my diary is always full.',                   name: 'Aisha Bello',     location: 'Tailor · Surulere',         initial: 'A', color1: '#7B2D8B', color2: '#C084FC' },
  { text: 'The portfolio feature is what sells me. Customers see my past work and book me before even chatting.',                       name: 'Biodun Lawal',    location: 'Carpenter · Ikeja',         initial: 'B', color1: '#E85D04', color2: '#F4A261' },
];

// ── STATE
const stepData   = {};
let currentStep  = 1;
const TOTAL_STEPS = 5;
const selectedZones = new Set();

// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  initTestimonials(TESTIMONIALS);
  initPasswordToggle('password',        'pw-toggle-1', 'pw-icon-1');
  initPasswordToggle('confirm-password','pw-toggle-2', 'pw-icon-2');
  initPasswordStrength('password', 'pw-fill', 'pw-label');

  // Check already logged in
  if (AuthStorage.isLoggedIn()) {
    const u = AuthStorage.getUser();
    if (u?.role === 'artisan') redirectAfterLogin('artisan');
  }

  // Step forms
  document.getElementById('step1-form')?.addEventListener('submit', handleStep1);
  document.getElementById('step2-form')?.addEventListener('submit', handleStep2);
  document.getElementById('step3-form')?.addEventListener('submit', handleStep3);
  document.getElementById('step4-form')?.addEventListener('submit', handleStep4);

  // Back buttons
  document.getElementById('btn-back-2')?.addEventListener('click', () => goToStep(1));
  document.getElementById('btn-back-3')?.addEventListener('click', () => goToStep(2));
  document.getElementById('btn-back-4')?.addEventListener('click', () => goToStep(3));

  // Zone chips
  initZoneChips();

  // Radius slider
  initRadiusSlider();

  // File uploads
  initFileUpload('id-drop-zone',   'id-doc',   'id-preview',   'id-filename',   'id-remove');
  initFileUpload('cert-drop-zone', 'cert-doc', 'cert-preview', 'cert-filename', 'cert-remove');
});

// ══════════════════════════════════════════
//   STEP NAVIGATION
// ══════════════════════════════════════════
function goToStep(n) {
  // Hide all panels, show target
  document.querySelectorAll('.ar-step-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`step-${n}`)?.classList.add('active');
  currentStep = n;

  // Update step indicator circles
  for (let i = 1; i <= TOTAL_STEPS; i++) {
    const circle = document.getElementById(`sc-${i}`);
    const label  = document.getElementById(`sl-${i}`);
    if (!circle) continue;

    circle.classList.remove('active', 'done');
    label?.classList.remove('active');

    if (i < n) {
      circle.classList.add('done');
      circle.innerHTML = '<i class="fa fa-check" style="font-size:0.65rem"></i>';
    } else if (i === n) {
      circle.classList.add('active');
      circle.textContent = i;
      label?.classList.add('active');
    } else {
      circle.textContent = i;
    }
  }

  // Update connectors
  for (let i = 1; i < TOTAL_STEPS; i++) {
    document.getElementById(`conn-${i}`)?.classList.toggle('done', i < n);
  }

  // Scroll to top of right panel
  document.querySelector('.auth-right')?.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════
//   STEP 1 — Personal details
// ══════════════════════════════════════════
function handleStep1(e) {
  e.preventDefault();
  let ok = true;

  const fn = document.getElementById('first-name')?.value.trim()     || '';
  const ln = document.getElementById('last-name')?.value.trim()      || '';
  const em = document.getElementById('email')?.value.trim()          || '';
  const ph = document.getElementById('phone')?.value.trim()          || '';
  const pw = document.getElementById('password')?.value              || '';
  const cf = document.getElementById('confirm-password')?.value      || '';

  if (!setFieldState('field-first',    'error-first',    AuthValidate.required(fn, 'First name')))    ok = false;
  if (!setFieldState('field-last',     'error-last',     AuthValidate.required(ln, 'Last name')))     ok = false;
  if (!setFieldState('field-email',    'error-email',    AuthValidate.email(em)))                     ok = false;
  if (!setFieldState('field-phone',    'error-phone',    AuthValidate.phone(ph)))                     ok = false;
  if (!setFieldState('field-password', 'error-password', AuthValidate.password(pw)))                  ok = false;
  if (!setFieldState('field-confirm',  'error-confirm',  AuthValidate.passwordMatch(pw, cf)))         ok = false;

  if (!ok) return;

  Object.assign(stepData, {
    first_name: fn,
    last_name:  ln,
    full_name:  `${fn} ${ln}`,
    email:      em,
    phone:      '+234' + ph.replace(/^0/, '').replace(/[\s\-]/g, ''),
    password:   pw,
    role:       'artisan',
  });

  goToStep(2);
}

// ══════════════════════════════════════════
//   STEP 2 — Skill & rate
// ══════════════════════════════════════════
function handleStep2(e) {
  e.preventDefault();
  let ok = true;

  const category   = document.getElementById('category')?.value   || '';
  const experience = document.getElementById('experience')?.value || '';
  const bio        = document.getElementById('bio')?.value.trim() || '';
  const rate       = document.getElementById('rate')?.value       || '';

  if (!category) {
    document.getElementById('error-category').textContent = 'Please select a skill category.';
    ok = false;
  } else {
    document.getElementById('error-category').textContent = '';
    setFieldState('field-category', 'error-category', '');
  }

  if (!experience) {
    document.getElementById('error-experience').textContent = 'Please select your years of experience.';
    ok = false;
  } else {
    document.getElementById('error-experience').textContent = '';
  }

  if (bio.length < 50) {
    document.getElementById('error-bio').textContent = `Bio must be at least 50 characters (currently ${bio.length}).`;
    ok = false;
  } else {
    document.getElementById('error-bio').textContent = '';
  }

  const rateNum = parseFloat(rate);
  if (!rate || rateNum < 500) {
    document.getElementById('error-rate').textContent = 'Minimum base rate is ₦500.';
    ok = false;
  } else {
    document.getElementById('error-rate').textContent = '';
  }

  if (!ok) return;

  Object.assign(stepData, {
    skill_category:  category,
    years_experience: experience,
    bio,
    base_rate_ngn: rateNum,
  });

  goToStep(3);
}

// ══════════════════════════════════════════
//   STEP 3 — Location & zones
// ══════════════════════════════════════════
function handleStep3(e) {
  e.preventDefault();

  const address = document.getElementById('address')?.value.trim() || '';
  const radius  = document.getElementById('radius')?.value         || '10';

  if (!address) {
    document.getElementById('error-address').textContent = 'Please enter your base address.';
    return;
  }
  document.getElementById('error-address').textContent = '';

  if (selectedZones.size === 0) {
    document.getElementById('error-zones').textContent = 'Please select at least one service zone.';
    return;
  }
  document.getElementById('error-zones').textContent = '';

  Object.assign(stepData, {
    base_address:     address,
    service_zones:    Array.from(selectedZones),
    service_radius_km: parseInt(radius, 10),
  });

  goToStep(4);
}

// ══════════════════════════════════════════
//   STEP 4 — KYC & submit
// ══════════════════════════════════════════
function handleStep4(e) {
  e.preventDefault();

  const idType  = document.getElementById('id-type')?.value  || '';
  const idFile  = document.getElementById('id-doc')?.files[0];
  const terms   = document.getElementById('terms')?.checked;

  let ok = true;

  if (!idType) {
    document.getElementById('error-id-type').textContent = 'Please select an ID document type.';
    ok = false;
  } else {
    document.getElementById('error-id-type').textContent = '';
  }

  if (!idFile) {
    document.getElementById('error-id-doc').textContent = 'Please upload your government-issued ID.';
    ok = false;
  } else {
    document.getElementById('error-id-doc').textContent = '';
  }

  if (!terms) {
    document.getElementById('error-terms').textContent = 'You must agree to continue.';
    ok = false;
  } else {
    document.getElementById('error-terms').textContent = '';
  }

  if (!ok) return;

  Object.assign(stepData, { id_document_type: idType });
  submitRegistration(idFile);
}

// ══════════════════════════════════════════
//   SUBMIT — build FormData and POST
// ══════════════════════════════════════════
async function submitRegistration(idFile) {
  const btn     = document.getElementById('final-submit');
  const txt     = document.getElementById('final-submit-text');
  const spinner = document.getElementById('final-submit-spinner');

  if (btn)     btn.disabled     = true;
  if (txt)     txt.style.display  = 'none';
  if (spinner) spinner.style.display = 'inline-flex';

  const errEl = document.getElementById('global-error');
  const errTx = document.getElementById('global-error-text');
  if (errEl) errEl.style.display = 'none';

  try {
    // Build FormData so we can include the file
    const fd = new FormData();
    Object.entries(stepData).forEach(([k, v]) => {
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else fd.append(k, v);
    });
    if (idFile) fd.append('id_document', idFile);

    const certFile = document.getElementById('cert-doc')?.files[0];
    if (certFile) fd.append('professional_cert', certFile);

    const data = await AuthAPI.register(fd);
    AuthStorage.saveSession(data.access, data.refresh, data.user, false);
    goToStep(5);

  } catch (err) {
    // Demo mode fallback when backend not live
    const isDemoError = err.message?.toLowerCase().includes('fetch') ||
                        err.message?.toLowerCase().includes('network') ||
                        err.message?.toLowerCase().includes('failed');

    if (isDemoError) {
      AuthStorage.saveSession(
        'demo-artisan-token',
        'demo-artisan-refresh',
        { ...stepData, id: 'demo-artisan-001', kyc_status: 'submitted' },
        false
      );
      goToStep(5);
    } else {
      if (errEl) errEl.style.display = 'flex';
      if (errTx) errTx.textContent = err.message || 'Registration failed. Please try again.';
    }
  } finally {
    if (btn)     btn.disabled       = false;
    if (txt)     txt.style.display  = 'inline';
    if (spinner) spinner.style.display = 'none';
  }
}

// ══════════════════════════════════════════
//   ZONE CHIPS
// ══════════════════════════════════════════
function initZoneChips() {
  document.querySelectorAll('.ar-zone-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const zone = chip.dataset.zone;
      if (selectedZones.has(zone)) {
        selectedZones.delete(zone);
        chip.classList.remove('selected');
      } else {
        selectedZones.add(zone);
        chip.classList.add('selected');
      }
      // Clear error once at least one is selected
      if (selectedZones.size > 0) {
        document.getElementById('error-zones').textContent = '';
      }
    });
  });
}

// ══════════════════════════════════════════
//   RADIUS SLIDER
// ══════════════════════════════════════════
function initRadiusSlider() {
  const slider = document.getElementById('radius');
  const valEl  = document.getElementById('radius-val');
  if (!slider || !valEl) return;

  function updateSlider() {
    const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.background =
      `linear-gradient(to right, var(--brand-green) ${pct}%, var(--border) ${pct}%)`;
    valEl.textContent = `${slider.value} km`;
  }

  slider.addEventListener('input', updateSlider);
  updateSlider(); // init on load
}

// ══════════════════════════════════════════
//   FILE UPLOAD with drag & drop
// ══════════════════════════════════════════
function initFileUpload(dropZoneId, inputId, previewId, filenameId, removeId) {
  const dropZone  = document.getElementById(dropZoneId);
  const input     = document.getElementById(inputId);
  const preview   = document.getElementById(previewId);
  const filename  = document.getElementById(filenameId);
  const removeBtn = document.getElementById(removeId);

  if (!dropZone || !input) return;

  // Click to open file picker
  dropZone.addEventListener('click', () => input.click());

  // File selected via picker
  input.addEventListener('change', () => {
    if (input.files[0]) showPreview(input.files[0]);
  });

  // Drag over
  dropZone.addEventListener('dragover', e => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
  });
  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));

  // Drop
  dropZone.addEventListener('drop', e => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      // Validate type and size
      const allowed = ['image/jpeg','image/png','image/jpg','application/pdf'];
      if (!allowed.includes(file.type)) {
        alert('Only JPG, PNG or PDF files are accepted.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB.');
        return;
      }
      // Assign to input via DataTransfer
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      showPreview(file);
    }
  });

  // Remove file
  removeBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    input.value = '';
    if (preview)  preview.style.display  = 'none';
    dropZone.style.display = 'block';
  });

  function showPreview(file) {
    if (filename) filename.textContent = file.name;
    if (preview)  preview.style.display = 'flex';
    dropZone.style.display = 'none';
    // Clear error
    const errId = inputId === 'id-doc' ? 'error-id-doc' : null;
    if (errId) document.getElementById(errId).textContent = '';
  }
}

// ══════════════════════════════════════════
//   BIO CHARACTER COUNTER
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const bio = document.getElementById('bio');
  if (!bio) return;

  // Add character counter below bio
  const counter = document.createElement('p');
  counter.style.cssText = 'font-size:0.72rem;color:var(--text-muted);text-align:right;margin-top:4px;';
  bio.parentNode.insertAdjacentElement('afterend', counter);

  bio.addEventListener('input', () => {
    const len = bio.value.trim().length;
    counter.textContent = `${len} / 50 min`;
    counter.style.color = len >= 50 ? '#059669' : 'var(--text-muted)';
    if (len >= 50) document.getElementById('error-bio').textContent = '';
  });
});
