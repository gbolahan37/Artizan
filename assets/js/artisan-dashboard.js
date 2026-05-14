/* ══════════════════════════════════════════
   ARTIZAN — ARTISAN DASHBOARD JS
   artisan-dashboard.js
   Handles: sidebar nav, job requests,
   schedule, earnings, portfolio, messages,
   profile/KYC, trust score, availability,
   confirm modal, toast
══════════════════════════════════════════ */

'use strict';

// ── DEMO DATA
const DEMO_ARTISAN = {
  id: 'demo-artisan-001',
  full_name: 'Chukwudi Nwosu',
  email: 'chukwudi@gmail.com',
  phone: '+2348034567890',
  role: 'artisan',
  skill_category: 'Plumbing',
  years_experience: 7,
  base_rate_ngn: 6500,
  bio: 'Expert plumber with 7+ years solving residential and commercial pipe issues across Lagos. Fast, clean, reliable.',
  kyc_status: 'verified',
  trust_score: 87,
  average_rating: 4.9,
  completion_rate: 0.97,
  account_age_score: 12,
  is_available: true,
};

const DEMO_JOBS = [
  { id: 'j1', customer: 'Folake Adeyemi',   job: 'Burst pipe repair — kitchen sink',   address: '14 Admiralty Way, Lekki',   date: 'Today, 2:00 PM',        amount: 6500,  status: 'in_progress', gradient: ['#4F46E5','#818CF8'], initial: 'F' },
  { id: 'j2', customer: 'Emeka Eze',         job: 'Bathroom plumbing installation',     address: '5 Adeola Hopewell, VI',     date: 'Tomorrow, 10:00 AM',    amount: 12000, status: 'confirmed',   gradient: ['#1447E6','#60A5FA'], initial: 'E' },
  { id: 'j3', customer: 'Bisi Okonkwo',      job: 'Water heater fault diagnosis',       address: '8 Gbagada Expressway',      date: 'Fri, 9:00 AM',          amount: 4500,  status: 'pending',     gradient: ['#7B2D8B','#C084FC'], initial: 'B' },
  { id: 'j4', customer: 'Yemi Adegoke',      job: 'Fix leaking overhead tank valve',    address: '23 Oregun Road, Ikeja',     date: 'Fri, 3:00 PM',          amount: 5000,  status: 'pending',     gradient: ['#E85D04','#F4A261'], initial: 'Y' },
  { id: 'j5', customer: 'Amaka Obi',         job: 'Full bathroom replumbing',           address: '1 Ozumba Mbadiwe, VI',      date: 'Sat, 8:00 AM',          amount: 35000, status: 'pending',     gradient: ['#059669','#34D399'], initial: 'A' },
  { id: 'j6', customer: 'Kunle Martins',     job: 'Outdoor borehole pump repair',       address: '17 Ikorodu Road, Ketu',     date: 'Jun 5, 11:00 AM',       amount: 8000,  status: 'completed',   gradient: ['#2B2D42','#8D99AE'], initial: 'K' },
  { id: 'j7', customer: 'Ngozi Afolabi',     job: 'Blocked drainage clearance',         address: '9 Nnamdi Azikiwe St, CMS',  date: 'May 30, 1:00 PM',       amount: 5500,  status: 'completed',   gradient: ['#0077B6','#48CAE4'], initial: 'N' },
  { id: 'j8', customer: 'Tunde Fashola',     job: 'Toilet cistern replacement',         address: '4 Oba Elegushi Road, Ikate',date: 'May 22, 4:00 PM',       amount: 7000,  status: 'completed',   gradient: ['#D97706','#FDE68A'], initial: 'T' },
  { id: 'j9', customer: 'Sola Oduya',        job: 'Gas pipe pressure test',             address: '11 Hughes Ave, Yaba',       date: 'May 10, 10:00 AM',      amount: 4000,  status: 'cancelled',   gradient: ['#DC2626','#FCA5A5'], initial: 'S' },
];

const DEMO_CHATS = [
  {
    id: 'c1', customer: 'Folake Adeyemi', job: 'Burst pipe — Lekki', initial: 'F', gradient: ['#4F46E5','#818CF8'], unread: 2,
    lastMsg: 'Please call me when you are at the gate.',
    messages: [
      { from: 'customer', text: 'Hi Chukwudi! I have confirmed your booking for today at 2pm.', time: '9:00 AM' },
      { from: 'me',       text: 'Good morning Folake. I will be there on time. The kitchen pipe, right?', time: '9:05 AM' },
      { from: 'customer', text: 'Yes, it is under the sink. Water has been dripping since last night.', time: '9:07 AM' },
      { from: 'me',       text: 'Understood. I will bring replacement fittings in case the pipe is cracked.', time: '9:10 AM' },
      { from: 'customer', text: 'Please call me when you are at the gate.', time: '1:30 PM' },
    ],
  },
  {
    id: 'c2', customer: 'Emeka Eze', job: 'Bathroom installation — VI', initial: 'E', gradient: ['#1447E6','#60A5FA'], unread: 0,
    lastMsg: 'See you tomorrow at 10.',
    messages: [
      { from: 'customer', text: 'Chukwudi, are you available tomorrow at 10am?', time: 'Yesterday' },
      { from: 'me',       text: 'Yes I am. I have your booking confirmed.', time: 'Yesterday' },
      { from: 'customer', text: 'Perfect. It is a full bathroom plumbing from scratch. The tiles have already been laid.', time: 'Yesterday' },
      { from: 'me',       text: 'Understood. I will bring the necessary pipes and connectors. See you tomorrow at 10.', time: 'Yesterday' },
    ],
  },
];

const DEMO_NOTIFICATIONS = [
  { id: 'n1', text: 'New booking request from Amaka Obi — Full bathroom replumbing.', time: '10 min ago', read: false },
  { id: 'n2', text: 'Folake Adeyemi sent you a message: "Please call when you arrive."', time: '30 min ago', read: false },
  { id: 'n3', text: 'Payment of ₦8,000 released for your job with Kunle Martins.', time: '1 hr ago', read: false },
  { id: 'n4', text: 'New booking request from Yemi Adegoke — Leaking tank valve.', time: '2 hrs ago', read: false },
  { id: 'n5', text: 'Reminder: You have a confirmed job with Emeka Eze tomorrow at 10:00 AM.', time: 'Yesterday', read: true },
];

const DEMO_PORTFOLIO = [
  { id: 'p1', caption: 'Burst pipe repair — Lekki Phase 1',    color: '#059669' },
  { id: 'p2', caption: 'Bathroom replumbing — Victoria Island', color: '#1447E6' },
  { id: 'p3', caption: 'Overhead tank valve replacement',       color: '#7B2D8B' },
  { id: 'p4', caption: 'Kitchen sink installation — Ikeja GRA', color: '#E85D04' },
  { id: 'p5', caption: 'Borehole pump servicing — Ketu',       color: '#D97706' },
];

const DEMO_HOURS = [
  { day: 'Monday',    active: true,  from: '08:00', to: '18:00' },
  { day: 'Tuesday',   active: true,  from: '08:00', to: '18:00' },
  { day: 'Wednesday', active: true,  from: '08:00', to: '18:00' },
  { day: 'Thursday',  active: true,  from: '08:00', to: '18:00' },
  { day: 'Friday',    active: true,  from: '08:00', to: '17:00' },
  { day: 'Saturday',  active: true,  from: '09:00', to: '14:00' },
  { day: 'Sunday',    active: false, from: '00:00', to: '00:00' },
];

// ── STATE
const state = {
  currentSection: 'overview',
  currentFilter: 'all',
  activeChat: null,
  confirmCallback: null,
  notifications: [...DEMO_NOTIFICATIONS],
  jobs: [...DEMO_JOBS],
  portfolio: [...DEMO_PORTFOLIO],
  hours: [...DEMO_HOURS],
  isAvailable: true,
  pendingPortfolioFile: null,
};

// ══════════════════════════════════════════
//   INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  initSidebar();
  initTopbar();
  initAvailabilityToggle();
  renderOverview();
  renderJobs();
  renderSchedule();
  renderChats();
  renderEarnings();
  renderPortfolio();
  renderProfile();
  renderNotifications();
  initConfirmModal();
  initPortfolioUpload();
  initProfileForm();
  initWithdraw();
  initSectionLinks();
});

// ══════════════════════════════════════════
//   USER
// ══════════════════════════════════════════
function loadUser() {
  const u = DEMO_ARTISAN;
  const initial = u.full_name.charAt(0).toUpperCase();
  document.getElementById('sb-avatar').textContent = initial;
  document.getElementById('sb-user-name').textContent = u.full_name;
  document.getElementById('sb-user-email').textContent = u.email;
  document.getElementById('greeting-name').textContent = u.full_name.split(' ')[0];
  document.getElementById('profile-dash-avatar').textContent = initial;
  document.getElementById('profile-dash-name').textContent = u.full_name;
  document.getElementById('profile-dash-email').textContent = u.email;

  // pre-fill profile form
  const parts = u.full_name.split(' ');
  document.getElementById('pf-first').value = parts[0] || '';
  document.getElementById('pf-last').value = parts.slice(1).join(' ') || '';
  document.getElementById('pf-email').value = u.email;
  document.getElementById('pf-phone').value = u.phone;
  document.getElementById('pf-rate').value = u.base_rate_ngn;
  document.getElementById('pf-exp').value = u.years_experience;
  document.getElementById('pf-bio').value = u.bio;

  // KYC banner
  renderKYCBanner(u.kyc_status);

  // TrustScore
  renderTrustScore(u);
}

function renderKYCBanner(status) {
  const banner = document.getElementById('kyc-banner');
  const badge  = document.getElementById('kyc-status-badge');
  const title  = document.getElementById('kyc-banner-title');
  const sub    = document.getElementById('kyc-banner-sub');
  const map = {
    verified:  { cls: 'kyc-verified',  badgeTxt: 'Verified',  title: 'Identity Verified', sub: 'Your government ID has been verified. Your TrustScore has been boosted by 30 points.' },
    submitted: { cls: 'kyc-pending',   badgeTxt: 'Pending',   title: 'Verification Pending', sub: 'We are reviewing your documents. This usually takes 1–2 business days.' },
    rejected:  { cls: 'kyc-rejected',  badgeTxt: 'Rejected',  title: 'Verification Failed', sub: 'Your document could not be verified. Please upload a clearer copy.' },
    pending:   { cls: 'kyc-unverified',badgeTxt: 'Not Submitted', title: 'Complete Your KYC', sub: 'Upload a government-issued ID to boost your TrustScore and unlock more bookings.' },
  };
  const cfg = map[status] || map['pending'];
  banner.className = 'kyc-banner ' + cfg.cls;
  badge.textContent = cfg.badgeTxt;
  title.textContent = cfg.title;
  sub.textContent   = cfg.sub;
}

function renderTrustScore(u) {
  const kyc_score        = u.kyc_status === 'verified' ? 30 : 0;
  const rating_score     = (u.average_rating / 5) * 30;
  const completion_score = u.completion_rate * 25;
  const tenure_score     = u.account_age_score; // pre-computed for demo
  const total            = Math.round(kyc_score + rating_score + completion_score + tenure_score);
  const band = total >= 80 ? { label: 'Highly Trusted', cls: 'ts-band-high' }
             : total >= 60 ? { label: 'Trusted', cls: 'ts-band-mid' }
             :               { label: 'New', cls: 'ts-band-low' };

  document.getElementById('ts-num').textContent  = total;
  const tsb = document.getElementById('ts-band');
  tsb.textContent  = band.label;
  tsb.className    = 'ts-band ' + band.cls;

  const bars = [
    { label: 'KYC',         val: kyc_score,        max: 30, color: '#4F46E5' },
    { label: 'Rating',      val: rating_score,      max: 30, color: '#059669' },
    { label: 'Completion',  val: completion_score,  max: 25, color: '#D97706' },
    { label: 'Tenure',      val: tenure_score,      max: 15, color: '#0077B6' },
  ];
  const barsEl = document.getElementById('ts-bars');
  barsEl.innerHTML = bars.map(b => `
    <div class="ts-bar-row">
      <span>${b.label}</span>
      <div class="ts-track"><div class="ts-fill" style="width:${(b.val/b.max)*100}%;background:${b.color}"></div></div>
      <span>${Math.round(b.val)}/${b.max}</span>
    </div>
  `).join('');
}

// ══════════════════════════════════════════
//   SIDEBAR
// ══════════════════════════════════════════
function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sb-overlay');
  const closeBtn = document.getElementById('sb-close');

  document.getElementById('topbar-menu').addEventListener('click', () => {
    sidebar.classList.add('open');
    overlay.classList.add('open');
  });
  closeBtn.addEventListener('click', closeSidebar);
  overlay.addEventListener('click', closeSidebar);
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
  }

  // nav links
  document.querySelectorAll('.sb-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      closeSidebar();
    });
  });

  document.getElementById('logout-btn').addEventListener('click', () => {
    showConfirm('Log out?', 'You will be returned to the login page.', () => {
      window.location.href = 'artisan-login.html';
    });
  });
}

function initTopbar() {
  // notification bell
  const btn      = document.getElementById('notif-btn');
  const dropdown = document.getElementById('notif-dropdown');
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
  });
  document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  document.getElementById('notif-clear').addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true);
    renderNotifications();
  });
}

function initSectionLinks() {
  // CTA buttons and "view all" links that switch sections
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-section]');
    if (btn && !btn.classList.contains('sb-link')) {
      e.preventDefault();
      navigateTo(btn.dataset.section);
    }
  });
}

function navigateTo(section) {
  state.currentSection = section;

  // update active link
  document.querySelectorAll('.sb-link[data-section]').forEach(l => {
    l.classList.toggle('active', l.dataset.section === section);
  });

  // update active panel
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('panel-' + section);
  if (panel) panel.classList.add('active');

  // update topbar title
  const titles = {
    overview:  'Overview',
    bookings:  'Job Requests',
    schedule:  'My Schedule',
    messages:  'Messages',
    earnings:  'Earnings',
    portfolio: 'Portfolio',
    profile:   'Profile & KYC',
  };
  document.getElementById('topbar-title').textContent = titles[section] || section;

  // scroll to top of content
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ══════════════════════════════════════════
//   AVAILABILITY TOGGLE
// ══════════════════════════════════════════
function initAvailabilityToggle() {
  const mainToggle   = document.getElementById('avail-main-toggle');
  const topbarToggle = document.getElementById('avail-topbar-toggle');
  const label        = document.getElementById('topbar-avail-label');
  const statusText   = document.getElementById('avail-status-text');

  function updateUI(val) {
    state.isAvailable = val;
    mainToggle.checked   = val;
    topbarToggle.checked = val;
    label.textContent    = val ? 'Available' : 'Unavailable';
    label.style.color    = val ? 'var(--brand-green)' : 'var(--ink-400)';
    statusText.innerHTML = val
      ? 'You are currently <strong style="color:var(--brand-green)">available</strong> — customers can book you.'
      : 'You are currently <strong style="color:var(--ink-500)">unavailable</strong> — new bookings are paused.';
    showToast(val ? 'You are now available for bookings.' : 'You are now set as unavailable.', val ? 'fa-circle-check' : 'fa-circle-xmark');
  }

  mainToggle.addEventListener('change', () => updateUI(mainToggle.checked));
  topbarToggle.addEventListener('change', () => updateUI(topbarToggle.checked));
}

// ══════════════════════════════════════════
//   OVERVIEW
// ══════════════════════════════════════════
function renderOverview() {
  const u = DEMO_ARTISAN;
  const jobs = state.jobs;
  const completed = jobs.filter(j => j.status === 'completed').length;
  const pending   = jobs.filter(j => j.status === 'pending').length;
  const earned    = jobs.filter(j => j.status === 'completed').reduce((s,j) => s + j.amount, 0);

  document.getElementById('stat-earned').textContent  = '₦' + fmtAmount(earned);
  document.getElementById('stat-jobs').textContent    = completed;
  document.getElementById('stat-rating').textContent  = u.average_rating;
  document.getElementById('stat-pending').textContent = pending;

  // Upcoming (confirmed/in_progress)
  const upcoming = jobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress').slice(0, 3);
  const upEl = document.getElementById('overview-upcoming');
  upEl.innerHTML = upcoming.length
    ? upcoming.map(j => renderJobCard(j, false)).join('')
    : emptyState('fa-calendar-check', 'No upcoming jobs', 'Confirm a pending request to see it here.');

  // Pending
  const pendingJobs = jobs.filter(j => j.status === 'pending').slice(0, 3);
  const pendingEl = document.getElementById('overview-pending');
  pendingEl.innerHTML = pendingJobs.length
    ? pendingJobs.map(j => renderJobCard(j, false)).join('')
    : emptyState('fa-inbox', 'No new requests', 'New booking requests will appear here.');

  attachJobActions();
}

// ══════════════════════════════════════════
//   JOB REQUESTS
// ══════════════════════════════════════════
function renderJobs() {
  // filter chips
  document.querySelectorAll('#panel-bookings .bf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('#panel-bookings .bf-chip').forEach(c => c.classList.remove('active', 'green-active'));
      chip.classList.add('active', 'green-active');
      state.currentFilter = chip.dataset.filter;
      renderJobsList();
    });
  });
  renderJobsList();
}

function renderJobsList() {
  const list = document.getElementById('jobs-list');
  const filtered = state.currentFilter === 'all'
    ? state.jobs
    : state.jobs.filter(j => j.status === state.currentFilter);
  list.innerHTML = filtered.length
    ? filtered.map(j => renderJobCard(j, true)).join('')
    : emptyState('fa-briefcase', 'No jobs here', 'There are no jobs matching this filter.');
  attachJobActions();
}

function renderJobCard(j, fullActions) {
  const statusLabel = { pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled' };
  const actions = fullActions ? getJobActions(j) : getJobActions(j, true);
  return `
    <div class="booking-card" data-job-id="${j.id}">
      <div class="bc-avatar" style="background:linear-gradient(135deg,${j.gradient[0]},${j.gradient[1]})">${j.initial}</div>
      <div class="bc-body">
        <p class="bc-title">${j.job}</p>
        <div class="bc-meta">
          <span><i class="fa fa-user"></i>${j.customer}</span>
          <span><i class="fa fa-location-dot"></i>${j.address}</span>
          <span><i class="fa fa-clock"></i>${j.date}</span>
        </div>
      </div>
      <div class="bc-right">
        <span class="bc-status status-${j.status}">${statusLabel[j.status] || j.status}</span>
        <span class="bc-amount">₦${j.amount.toLocaleString()}</span>
        <div class="bc-actions">${actions}</div>
      </div>
    </div>
  `;
}

function getJobActions(j, compact) {
  if (j.status === 'pending') {
    return `
      <button class="bc-btn bc-btn-primary job-accept" data-id="${j.id}"><i class="fa fa-check"></i> Accept</button>
      <button class="bc-btn bc-btn-danger job-decline" data-id="${j.id}">Decline</button>
    `;
  }
  if (j.status === 'confirmed' && !compact) {
    return `<button class="bc-btn bc-btn-primary job-start" data-id="${j.id}"><i class="fa fa-play"></i> Mark Started</button>`;
  }
  if (j.status === 'in_progress' && !compact) {
    return `<button class="bc-btn bc-btn-primary job-done" data-id="${j.id}" style="background:var(--brand-green)"><i class="fa fa-flag-checkered"></i> Mark Done</button>`;
  }
  return '';
}

function attachJobActions() {
  document.querySelectorAll('.job-accept').forEach(btn => {
    btn.addEventListener('click', () => {
      const job = state.jobs.find(j => j.id === btn.dataset.id);
      if (!job) return;
      showConfirm('Accept this job?', `Confirm the booking with ${job.customer}?`, () => {
        job.status = 'confirmed';
        refreshAll();
        showToast(`Booking with ${job.customer} confirmed!`, 'fa-circle-check');
      });
    });
  });
  document.querySelectorAll('.job-decline').forEach(btn => {
    btn.addEventListener('click', () => {
      const job = state.jobs.find(j => j.id === btn.dataset.id);
      if (!job) return;
      showConfirm('Decline this job?', `Are you sure you want to decline ${job.customer}'s request?`, () => {
        job.status = 'cancelled';
        refreshAll();
        showToast('Job request declined.', 'fa-circle-xmark');
      });
    });
  });
  document.querySelectorAll('.job-start').forEach(btn => {
    btn.addEventListener('click', () => {
      const job = state.jobs.find(j => j.id === btn.dataset.id);
      if (!job) return;
      job.status = 'in_progress';
      refreshAll();
      showToast('Job marked as In Progress.', 'fa-play');
    });
  });
  document.querySelectorAll('.job-done').forEach(btn => {
    btn.addEventListener('click', () => {
      const job = state.jobs.find(j => j.id === btn.dataset.id);
      if (!job) return;
      showConfirm('Mark as Complete?', `This will notify ${job.customer} and release payment from escrow.`, () => {
        job.status = 'completed';
        refreshAll();
        showToast(`Job completed! Payment of ₦${job.amount.toLocaleString()} will be released.`, 'fa-circle-check');
      });
    });
  });
}

function refreshAll() {
  renderOverview();
  renderJobsList();
  renderSchedule();
  renderEarnings();
  updateBadges();
}

// ══════════════════════════════════════════
//   BADGES
// ══════════════════════════════════════════
function updateBadges() {
  const pendingCount  = state.jobs.filter(j => j.status === 'pending').length;
  const unreadMsgs    = DEMO_CHATS.reduce((s, c) => s + c.unread, 0);
  const bookingBadge  = document.getElementById('badge-bookings');
  const msgBadge      = document.getElementById('badge-messages');
  bookingBadge.textContent  = pendingCount;
  bookingBadge.style.display = pendingCount  ? '' : 'none';
  msgBadge.textContent       = unreadMsgs;
  msgBadge.style.display     = unreadMsgs    ? '' : 'none';
}

// ══════════════════════════════════════════
//   SCHEDULE
// ══════════════════════════════════════════
function renderSchedule() {
  // Week strip
  const weekEl = document.getElementById('schedule-week');
  const today  = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }

  // range label
  const label = document.getElementById('week-range-label');
  label.textContent = `${days[0].toLocaleDateString('en-GB',{day:'numeric',month:'short'})} – ${days[6].toLocaleDateString('en-GB',{day:'numeric',month:'short'})}`;

  // count confirmed jobs per day of week
  const confirmedJobs = state.jobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress');
  const dayNames = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  weekEl.innerHTML = days.map((d, i) => {
    const isToday = d.toDateString() === today.toDateString();
    const jobCount = confirmedJobs.length > 0 && i < 3 ? (i === 0 ? 1 : i === 1 ? 1 : 0) : 0; // demo
    return `
      <div class="sched-day${isToday ? ' today' : ''}">
        <div class="day-label">${dayNames[i]}</div>
        <div class="day-num">${d.getDate()}</div>
        <div class="day-bookings">${jobCount > 0 ? `${jobCount} job` : ''}</div>
      </div>
    `;
  }).join('');

  // Working hours grid
  const hoursEl = document.getElementById('avail-hours-grid');
  hoursEl.innerHTML = state.hours.map((h, i) => `
    <div class="hours-row">
      <label class="hours-day-toggle">
        <input type="checkbox" class="hours-active-cb" data-idx="${i}" ${h.active ? 'checked' : ''}/>
        <span class="hours-day-name">${h.day}</span>
      </label>
      <div class="hours-time-range ${!h.active ? 'hours-disabled' : ''}">
        <input type="time" class="hours-input hours-from" data-idx="${i}" value="${h.from}" ${!h.active ? 'disabled' : ''}/>
        <span class="hours-sep">to</span>
        <input type="time" class="hours-input hours-to" data-idx="${i}" value="${h.to}" ${!h.active ? 'disabled' : ''}/>
      </div>
    </div>
  `).join('');

  // hours interactivity
  document.querySelectorAll('.hours-active-cb').forEach(cb => {
    cb.addEventListener('change', () => {
      const idx = parseInt(cb.dataset.idx);
      state.hours[idx].active = cb.checked;
      renderSchedule();
    });
  });
  document.querySelectorAll('.hours-from').forEach(inp => {
    inp.addEventListener('change', () => {
      state.hours[parseInt(inp.dataset.idx)].from = inp.value;
    });
  });
  document.querySelectorAll('.hours-to').forEach(inp => {
    inp.addEventListener('change', () => {
      state.hours[parseInt(inp.dataset.idx)].to = inp.value;
    });
  });

  document.getElementById('save-hours-btn').addEventListener('click', () => {
    showToast('Working hours saved.', 'fa-calendar-check');
  });

  // Confirmed jobs list on schedule
  const scheduledJobs = state.jobs.filter(j => j.status === 'confirmed' || j.status === 'in_progress');
  const schedEl = document.getElementById('schedule-jobs-list');
  schedEl.innerHTML = scheduledJobs.length
    ? scheduledJobs.map(j => renderJobCard(j, true)).join('')
    : emptyState('fa-calendar-days', 'No confirmed jobs', 'Accept a pending request to add it to your schedule.');
  attachJobActions();
}

// ══════════════════════════════════════════
//   MESSAGES (CHAT)
// ══════════════════════════════════════════
function renderChats() {
  const listEl = document.getElementById('chat-list');
  listEl.innerHTML = DEMO_CHATS.map(c => `
    <div class="chat-list-item${state.activeChat === c.id ? ' active' : ''}" data-chat="${c.id}">
      <div class="cli-avatar" style="background:linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})">${c.initial}</div>
      <div class="cli-body">
        <div class="cli-name">${c.customer}</div>
        <div class="cli-preview">${c.lastMsg}</div>
      </div>
      <div class="cli-meta">
        <span class="cli-time">Now</span>
        ${c.unread ? `<span class="cli-unread">${c.unread}</span>` : ''}
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.chat-list-item').forEach(item => {
    item.addEventListener('click', () => openChat(item.dataset.chat));
  });

  if (state.activeChat) openChat(state.activeChat);
}

function openChat(id) {
  state.activeChat = id;
  const chat = DEMO_CHATS.find(c => c.id === id);
  if (!chat) return;
  chat.unread = 0;

  document.querySelectorAll('.chat-list-item').forEach(item => {
    item.classList.toggle('active', item.dataset.chat === id);
  });

  document.getElementById('chat-empty').style.display = 'none';
  const active = document.getElementById('chat-active');
  active.style.display = 'flex';

  document.getElementById('chat-header').innerHTML = `
    <div class="ch-avatar" style="background:linear-gradient(135deg,${chat.gradient[0]},${chat.gradient[1]})">${chat.initial}</div>
    <div><div class="ch-name">${chat.customer}</div><div class="ch-skill">${chat.job}</div></div>
  `;

  const messagesEl = document.getElementById('chat-messages');
  messagesEl.innerHTML = chat.messages.map(m => `
    <div class="msg ${m.from === 'me' ? 'msg-out' : 'msg-in'}">
      ${m.text}
      <div class="msg-time">${m.time}</div>
    </div>
  `).join('');
  messagesEl.scrollTop = messagesEl.scrollHeight;

  // send message
  const input  = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');
  const doSend = () => {
    const txt = input.value.trim();
    if (!txt) return;
    chat.messages.push({ from: 'me', text: txt, time: 'Now' });
    chat.lastMsg = txt;
    input.value = '';
    openChat(id);
    renderChats();
  };
  sendBtn.onclick = doSend;
  input.onkeydown = e => { if (e.key === 'Enter') doSend(); };
}

// ══════════════════════════════════════════
//   EARNINGS
// ══════════════════════════════════════════
function renderEarnings() {
  const completed = state.jobs.filter(j => j.status === 'completed');
  const total     = completed.reduce((s, j) => s + j.amount, 0);
  // demo: month = last 6 jobs, week = last 3
  const monthJobs = completed.slice(-6);
  const weekJobs  = completed.slice(-3);
  const monthAmt  = monthJobs.reduce((s, j) => s + j.amount, 0);
  const weekAmt   = weekJobs.reduce((s, j) => s + j.amount, 0);

  document.getElementById('earn-week').textContent       = '₦' + weekAmt.toLocaleString();
  document.getElementById('earn-week-jobs').textContent  = weekJobs.length + ' jobs';
  document.getElementById('earn-month').textContent      = '₦' + monthAmt.toLocaleString();
  document.getElementById('earn-month-jobs').textContent = monthJobs.length + ' jobs';
  document.getElementById('earn-total').textContent      = '₦' + total.toLocaleString();
  document.getElementById('earn-total-jobs').textContent = completed.length + ' jobs';
  document.getElementById('avail-balance').textContent   = '₦' + Math.round(total * 0.07).toLocaleString();

  const histEl = document.getElementById('earnings-history');
  histEl.innerHTML = completed.length
    ? [...completed].reverse().map(j => `
        <div class="booking-card">
          <div class="bc-avatar" style="background:linear-gradient(135deg,${j.gradient[0]},${j.gradient[1]})">${j.initial}</div>
          <div class="bc-body">
            <p class="bc-title">${j.job}</p>
            <div class="bc-meta">
              <span><i class="fa fa-user"></i>${j.customer}</span>
              <span><i class="fa fa-calendar"></i>${j.date}</span>
            </div>
          </div>
          <div class="bc-right">
            <span class="bc-status status-completed">Paid</span>
            <span class="bc-amount" style="color:var(--brand-green)">+₦${j.amount.toLocaleString()}</span>
          </div>
        </div>
      `).join('')
    : emptyState('fa-naira-sign', 'No earnings yet', 'Completed jobs will appear here.');
}

// ══════════════════════════════════════════
//   PORTFOLIO
// ══════════════════════════════════════════
function renderPortfolio() {
  const max    = 10;
  const count  = state.portfolio.length;
  document.getElementById('portfolio-count-text').textContent = `${count} / ${max} photos uploaded`;
  document.getElementById('portfolio-count-fill').style.width = `${(count / max) * 100}%`;

  const gridEl = document.getElementById('portfolio-grid');
  let html = state.portfolio.map(p => `
    <div class="pm-item" data-pid="${p.id}">
      <div style="width:100%;height:100%;background:linear-gradient(135deg,${p.color}33,${p.color}11);display:flex;align-items:center;justify-content:center;font-size:2rem;color:${p.color}">
        <i class="fa fa-wrench"></i>
      </div>
      <button class="pm-delete" data-pid="${p.id}"><i class="fa fa-xmark"></i></button>
      <div class="pm-caption">${p.caption}</div>
    </div>
  `).join('');

  if (count < max) {
    html += `<div class="pm-item add-btn" id="pm-add-btn"><i class="fa fa-plus"></i></div>`;
  }
  gridEl.innerHTML = html;

  // delete
  gridEl.querySelectorAll('.pm-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      showConfirm('Delete photo?', 'This photo will be removed from your portfolio.', () => {
        state.portfolio = state.portfolio.filter(p => p.id !== btn.dataset.pid);
        renderPortfolio();
        showToast('Photo removed.', 'fa-trash');
      });
    });
  });

  // add
  const addBtn = document.getElementById('pm-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      document.getElementById('portfolio-file-input').click();
    });
  }
}

function initPortfolioUpload() {
  const fileInput    = document.getElementById('portfolio-file-input');
  const captionModal = document.getElementById('caption-modal');
  const captionClose = document.getElementById('caption-modal-close');
  const captionInput = document.getElementById('caption-input');
  const captionSubmit = document.getElementById('caption-submit');

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      state.pendingPortfolioFile = fileInput.files[0];
      captionInput.value = '';
      captionModal.style.display = 'flex';
    }
  });

  captionClose.addEventListener('click', () => { captionModal.style.display = 'none'; });
  captionModal.addEventListener('click', e => { if (e.target === captionModal) captionModal.style.display = 'none'; });

  captionSubmit.addEventListener('click', () => {
    const caption = captionInput.value.trim() || 'My work';
    const colors  = ['#059669','#4F46E5','#E85D04','#D97706','#0077B6','#7B2D8B','#DC2626'];
    state.portfolio.push({
      id:      'p' + Date.now(),
      caption,
      color:   colors[state.portfolio.length % colors.length],
    });
    captionModal.style.display = 'none';
    fileInput.value = '';
    renderPortfolio();
    showToast('Photo uploaded to your portfolio!', 'fa-image');
  });
}

// ══════════════════════════════════════════
//   PROFILE FORM
// ══════════════════════════════════════════
function renderProfile() {
  // KYC file input trigger
  document.getElementById('kyc-file-input').addEventListener('change', e => {
    if (e.target.files.length) {
      document.getElementById('kyc-doc-name').textContent = e.target.files[0].name;
      showToast('KYC document uploaded. Pending review.', 'fa-shield-halved');
    }
  });
}

function initProfileForm() {
  const form    = document.getElementById('profile-form');
  const errorEl = document.getElementById('pf-error');
  const succEl  = document.getElementById('pf-success');

  form.addEventListener('submit', e => {
    e.preventDefault();
    errorEl.textContent = '';
    succEl.style.display = 'none';

    const pw = document.getElementById('pf-pw').value;
    const pwc = document.getElementById('pf-pw-confirm').value;
    if (pw && pw !== pwc) {
      errorEl.textContent = 'Passwords do not match.';
      return;
    }

    const first = document.getElementById('pf-first').value.trim();
    const last  = document.getElementById('pf-last').value.trim();
    if (!first || !last) {
      errorEl.textContent = 'Please enter your full name.';
      return;
    }

    // update demo state
    DEMO_ARTISAN.full_name = first + ' ' + last;
    DEMO_ARTISAN.base_rate_ngn = parseInt(document.getElementById('pf-rate').value) || DEMO_ARTISAN.base_rate_ngn;

    succEl.style.display = 'flex';
    showToast('Profile saved successfully.', 'fa-circle-check');
    setTimeout(() => { succEl.style.display = 'none'; }, 4000);
  });

  document.getElementById('pf-delete-btn').addEventListener('click', () => {
    showConfirm('Delete your account?', 'All your data will be permanently removed. This cannot be undone.', () => {
      showToast('Account deletion requested.', 'fa-trash');
    });
  });
}

// ══════════════════════════════════════════
//   WITHDRAW
// ══════════════════════════════════════════
function initWithdraw() {
  document.getElementById('withdraw-btn').addEventListener('click', () => {
    const amt = parseInt(document.getElementById('withdraw-input').value);
    if (!amt || amt < 500) {
      showToast('Minimum withdrawal is ₦500.', 'fa-triangle-exclamation');
      return;
    }
    showConfirm('Confirm withdrawal?', `₦${amt.toLocaleString()} will be sent to your registered bank account.`, () => {
      document.getElementById('withdraw-input').value = '';
      showToast(`₦${amt.toLocaleString()} withdrawal initiated. Expect it in 1–2 business days.`, 'fa-circle-check');
    });
  });
}

// ══════════════════════════════════════════
//   NOTIFICATIONS
// ══════════════════════════════════════════
function renderNotifications() {
  const list  = document.getElementById('notif-list');
  const count = document.getElementById('notif-count');
  const unread = state.notifications.filter(n => !n.read).length;

  count.textContent   = unread;
  count.style.display = unread ? '' : 'none';

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item${n.read ? '' : ' unread'}">
      <div class="notif-dot${n.read ? ' read' : ''}"></div>
      <div class="notif-text">${n.text}</div>
      <div class="notif-time">${n.time}</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════
//   CONFIRM MODAL
// ══════════════════════════════════════════
function initConfirmModal() {
  document.getElementById('confirm-yes').addEventListener('click', () => {
    document.getElementById('confirm-modal').style.display = 'none';
    if (state.confirmCallback) state.confirmCallback();
    state.confirmCallback = null;
  });
  document.getElementById('confirm-no').addEventListener('click', () => {
    document.getElementById('confirm-modal').style.display = 'none';
    state.confirmCallback = null;
  });
}

function showConfirm(title, msg, cb) {
  document.getElementById('confirm-title').textContent = title;
  document.getElementById('confirm-msg').textContent   = msg;
  state.confirmCallback = cb;
  document.getElementById('confirm-modal').style.display = 'flex';
}

// ══════════════════════════════════════════
//   TOAST
// ══════════════════════════════════════════
function showToast(msg, icon = 'fa-circle-check') {
  const wrap = document.getElementById('toast-wrap');
  const item = document.createElement('div');
  item.className = 'toast-item';
  item.innerHTML = `<i class="fa ${icon}"></i><span>${msg}</span>`;
  wrap.appendChild(item);
  setTimeout(() => item.remove(), 4000);
}

// ══════════════════════════════════════════
//   HELPERS
// ══════════════════════════════════════════
function fmtAmount(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1).replace('.0','') + 'M';
  if (n >= 1000)    return (n/1000).toFixed(0) + 'K';
  return n.toLocaleString();
}

function emptyState(icon, title, sub) {
  return `
    <div class="empty-state">
      <i class="fa ${icon}"></i>
      <h4>${title}</h4>
      <p>${sub}</p>
    </div>
  `;
}

// initial badge update
updateBadges();
