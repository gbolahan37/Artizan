/* ══════════════════════════════════════════
   ARTIZAN — CUSTOMER DASHBOARD JS
   customer-dashboard.js
   Handles: sidebar nav, bookings, chat,
   saved artisans, profile, notifications,
   review modal, confirm modal, toast
══════════════════════════════════════════ */

'use strict';

// ── DEMO DATA
const DEMO_USER = {
  id: 'demo-customer-001',
  full_name: 'Folake Adeyemi',
  email: 'folake@gmail.com',
  phone: '+2348012345678',
  role: 'customer',
  default_address: '14 Admiralty Way, Lekki Phase 1',
};

const DEMO_BOOKINGS = [
  { id: 'b1', artisan: 'Chukwudi Nwosu',  skill: 'Plumbing',      date: 'Today, 2:00 PM',      amount: 6500,  status: 'in_progress', gradient: ['#059669','#34D399'], initial: 'C', job: 'Burst pipe repair in kitchen', negotiationHistory: [] },
  { id: 'b2', artisan: 'Aisha Bello',     skill: 'Tailoring',     date: 'Tomorrow, 10:00 AM',  amount: 4000,  status: 'confirmed',   gradient: ['#7B2D8B','#C084FC'], initial: 'A', job: 'Wedding ankara dress — 2 outfits', negotiationHistory: [] },
  { id: 'b3', artisan: 'Tayo Adeyemi',    skill: 'Home Cleaning', date: 'Sat, 9:00 AM',        amount: 7000,  status: 'pending',     gradient: ['#1447E6','#60A5FA'], initial: 'T', job: 'Full apartment deep clean', negotiationHistory: [] },
  { id: 'b8', artisan: 'Chukwudi Nwosu',  skill: 'Plumbing',      date: 'Mon, 11:00 AM',       amount: 8000,  status: 'negotiating', gradient: ['#059669','#34D399'], initial: 'C', job: 'Kitchen sink and dishwasher plumbing', counterAmount: 11500, lastOfferFrom: 'artisan', negotiationHistory: [{ from: 'artisan', amount: 11500, note: 'The dishwasher rerouting adds more work than expected. ₦11,500 covers materials and 3–4 hrs labour.', time: '2 hrs ago' }] },
  { id: 'b9', artisan: 'Emeka Okafor',    skill: 'Electrical',    date: 'Wed, 2:00 PM',        amount: 5000,  status: 'negotiating', gradient: ['#0077B6','#48CAE4'], initial: 'E', job: 'Inverter battery replacement', counterAmount: 6200, lastOfferFrom: 'artisan', negotiationHistory: [{ from: 'artisan', amount: 6200, note: 'The 200AH battery costs ₦5,200. Plus ₦1,000 for my labour.', time: '1 hr ago' }] },
  { id: 'b4', artisan: 'Emeka Okafor',    skill: 'Electrical',    date: 'Jun 5, 3:00 PM',      amount: 8000,  status: 'completed',   gradient: ['#0077B6','#48CAE4'], initial: 'E', job: 'Inverter installation and wiring', negotiationHistory: [] },
  { id: 'b5', artisan: 'Ngozi Ogundimu',  skill: 'Elder Care',    date: 'May 28, 8:00 AM',     amount: 6000,  status: 'completed',   gradient: ['#4F46E5','#818CF8'], initial: 'N', job: 'Weekly elder care — 3 days', negotiationHistory: [] },
  { id: 'b6', artisan: 'Biodun Lawal',    skill: 'Carpentry',     date: 'May 20, 11:00 AM',    amount: 15000, status: 'completed',   gradient: ['#E85D04','#F4A261'], initial: 'B', job: 'Custom wardrobe installation', negotiationHistory: [] },
  { id: 'b7', artisan: 'Rotimi Fasanya',  skill: 'Security',      date: 'May 10, 6:00 AM',     amount: 8000,  status: 'cancelled',   gradient: ['#2B2D42','#8D99AE'], initial: 'R', job: 'Event security — birthday party', negotiationHistory: [] },
];

const DEMO_SAVED = [
  { id: 'a1', name: 'Chukwudi Nwosu', skill: 'Plumber',   rating: 4.9, jobs: 203, gradient: ['#059669','#34D399'], initial: 'C' },
  { id: 'a2', name: 'Aisha Bello',    skill: 'Tailor',    rating: 4.8, jobs: 156, gradient: ['#7B2D8B','#C084FC'], initial: 'A' },
  { id: 'a4', name: 'Emeka Okafor',   skill: 'Electrician', rating: 4.9, jobs: 312, gradient: ['#1447E6','#60A5FA'], initial: 'E' },
];

const DEMO_RECOMMENDED = [
  { id: 'r1', name: 'Kemi Ogundimu', skill: 'Elder Care',    rating: 4.9, gradient: ['#4F46E5','#818CF8'], initial: 'K' },
  { id: 'r2', name: 'Biodun Lawal',  skill: 'Carpenter',     rating: 4.8, gradient: ['#E85D04','#F4A261'], initial: 'B' },
  { id: 'r3', name: 'Bola Martins',  skill: 'Laundry',       rating: 4.6, gradient: ['#48CAE4','#90E0EF'], initial: 'B' },
  { id: 'r4', name: 'Seun Adegoke',  skill: 'Painter',       rating: 4.7, gradient: ['#D97706','#FDE68A'], initial: 'S' },
];

const DEMO_CHATS = [
  {
    id: 'c1', artisan: 'Chukwudi Nwosu', skill: 'Plumber', initial: 'C', gradient: ['#059669','#34D399'], unread: 2,
    lastMsg: 'I am on my way, be there in 15 minutes.',
    messages: [
      { from: 'artisan', text: 'Good morning! I have confirmed your booking for today at 2pm.', time: '9:00 AM' },
      { from: 'me',      text: 'Great, thank you! The pipe is in the kitchen near the sink.', time: '9:05 AM' },
      { from: 'artisan', text: 'Understood. I will bring all the necessary tools and fittings.', time: '9:10 AM' },
      { from: 'me',      text: 'Perfect. Please call me when you arrive at the gate.', time: '9:12 AM' },
      { from: 'artisan', text: 'I am on my way, be there in 15 minutes.', time: '1:45 PM' },
    ],
  },
  {
    id: 'c2', artisan: 'Aisha Bello', skill: 'Tailor', initial: 'A', gradient: ['#7B2D8B','#C084FC'], unread: 1,
    lastMsg: 'Please send me your measurements when you have a moment.',
    messages: [
      { from: 'artisan', text: 'Hello! Thank you for your booking. I am excited to make your ankara outfits.', time: 'Yesterday' },
      { from: 'me',      text: 'Thank you Aisha! I am looking forward to it.', time: 'Yesterday' },
      { from: 'artisan', text: 'Please send me your measurements when you have a moment.', time: 'Yesterday' },
    ],
  },
];

const DEMO_NOTIFICATIONS = [
  { id: 'n1', text: 'Chukwudi Nwosu is on his way to your location.', time: '2 min ago', read: false },
  { id: 'n2', text: 'Aisha Bello confirmed your tailoring booking for tomorrow.', time: '1 hr ago', read: false },
  { id: 'n3', text: 'Your cleaning booking with Tayo Adeyemi is pending acceptance.', time: '3 hrs ago', read: false },
  { id: 'n4', text: 'Review reminder: Rate your experience with Emeka Okafor.', time: 'Yesterday', read: true },
  { id: 'n5', text: 'Payment of ₦8,000 released to Emeka Okafor.', time: '2 days ago', read: true },
];

// ── STATE
const state = {
  currentSection: 'overview',
  currentFilter: 'all',
  activeChat: null,
  reviewBookingId: null,
  selectedRating: 0,
  confirmCallback: null,
  notifications: [...DEMO_NOTIFICATIONS],
  bookings: [...DEMO_BOOKINGS],
  saved: [...DEMO_SAVED],
};

// ══════════════════════════════════════════
//   INIT
// ══════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  loadUser();
  initSidebar();
  initTopbar();
  renderOverview();
  renderBookings();
  renderChats();
  renderSaved();
  renderProfile();
  renderNotifications();
  initBookingFilters();
  initReviewModal();
  initConfirmModal();
  initProfileForm();
  initChat();
  handleURLHash();
  // Expose bookings so negotiate.js can mutate statuses in real-time
  window._customerBookings = state.bookings;
});

// ══════════════════════════════════════════
//   USER
// ══════════════════════════════════════════
function loadUser() {
  // Try real session, fallback to demo
  const user = AuthStorage?.getUser() || DEMO_USER;
  const name = user.full_name || DEMO_USER.full_name;
  const email = user.email   || DEMO_USER.email;
  const initial = name.charAt(0).toUpperCase();

  setText('sb-avatar', initial);
  setText('sb-user-name', name);
  setText('sb-user-email', email);
  setText('greeting-name', name.split(' ')[0]);
  setText('profile-dash-name', name);
  setText('profile-dash-email', email);
  setText('profile-dash-avatar', initial);

  // Pre-fill profile form
  const parts = name.split(' ');
  setVal('pf-first',   parts[0] || '');
  setVal('pf-last',    parts.slice(1).join(' ') || '');
  setVal('pf-email',   email);
  setVal('pf-phone',   user.phone || '');
  setVal('pf-address', user.default_address || '');
}

// ══════════════════════════════════════════
//   SIDEBAR NAVIGATION
// ══════════════════════════════════════════
function initSidebar() {
  // Nav links
  document.querySelectorAll('.sb-link[data-section]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      closeSidebar();
    });
  });

  // "View all" quick-links in overview
  document.querySelectorAll('[data-section]').forEach(el => {
    if (el.tagName === 'BUTTON') {
      el.addEventListener('click', () => navigateTo(el.dataset.section));
    }
  });

  // Mobile sidebar toggle
  document.getElementById('topbar-menu')?.addEventListener('click', openSidebar);
  document.getElementById('sb-close')?.addEventListener('click', closeSidebar);
  document.getElementById('sb-overlay')?.addEventListener('click', closeSidebar);

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    showConfirm('Log out?', 'You will be returned to the login page.', () => {
      AuthStorage?.clear?.();
      window.location.href = 'customer-login.html';
    });
  });
}

function navigateTo(section) {
  state.currentSection = section;

  // Update panels
  document.querySelectorAll('.dash-panel').forEach(p => p.classList.remove('active'));
  document.getElementById(`panel-${section}`)?.classList.add('active');

  // Update sidebar links
  document.querySelectorAll('.sb-link').forEach(l => l.classList.remove('active'));
  document.querySelector(`.sb-link[data-section="${section}"]`)?.classList.add('active');

  // Update topbar title
  const titles = { overview: 'Overview', bookings: 'My Bookings', messages: 'Messages', saved: 'Saved Artisans', profile: 'My Profile' };
  setText('topbar-title', titles[section] || section);

  // Update URL hash
  window.location.hash = section;
}

function openSidebar() {
  document.getElementById('sidebar')?.classList.add('open');
  document.getElementById('sb-overlay')?.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeSidebar() {
  document.getElementById('sidebar')?.classList.remove('open');
  document.getElementById('sb-overlay')?.classList.remove('open');
  document.body.style.overflow = '';
}

function handleURLHash() {
  const hash = window.location.hash.replace('#', '');
  const valid = ['overview','bookings','messages','saved','profile'];
  if (valid.includes(hash)) navigateTo(hash);
}

// ══════════════════════════════════════════
//   TOPBAR — notifications
// ══════════════════════════════════════════
function initTopbar() {
  const btn      = document.getElementById('notif-btn');
  const dropdown = document.getElementById('notif-dropdown');
  const clearBtn = document.getElementById('notif-clear');

  btn?.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dropdown.style.display === 'block';
    dropdown.style.display = isOpen ? 'none' : 'block';
  });

  document.addEventListener('click', e => {
    if (!document.getElementById('notif-wrap')?.contains(e.target)) {
      if (dropdown) dropdown.style.display = 'none';
    }
  });

  clearBtn?.addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true);
    renderNotifications();
    showToast('All notifications marked as read.', 'success');
  });
}

function renderNotifications() {
  const list  = document.getElementById('notif-list');
  const count = document.getElementById('notif-count');
  if (!list) return;

  const unread = state.notifications.filter(n => !n.read).length;
  if (count) {
    count.textContent = unread;
    count.style.display = unread > 0 ? 'flex' : 'none';
  }

  list.innerHTML = state.notifications.map(n => `
    <div class="notif-item ${n.read ? '' : 'unread'}">
      <div class="notif-dot ${n.read ? 'read' : ''}"></div>
      <div class="notif-text">${n.text}</div>
      <div class="notif-time">${n.time}</div>
    </div>
  `).join('');
}

// ══════════════════════════════════════════
//   OVERVIEW
// ══════════════════════════════════════════
function renderOverview() {
  // Active bookings (pending + confirmed + in_progress)
  const active = state.bookings.filter(b => ['pending','confirmed','in_progress'].includes(b.status));
  const listEl = document.getElementById('overview-bookings');
  if (listEl) {
    if (active.length === 0) {
      listEl.innerHTML = emptyState('fa-calendar-check', 'No active bookings', 'Book an artisan to get started.', 'discover.html', 'Find an Artisan');
    } else {
      listEl.innerHTML = active.slice(0, 3).map(b => bookingCardHTML(b, false)).join('');
      attachBookingActions(listEl);
    }
  }

  // Recommended artisans
  const recEl = document.getElementById('overview-rec');
  if (recEl) {
    recEl.innerHTML = DEMO_RECOMMENDED.map(a => `
      <a href="artisan-profile.html?id=${a.id}" class="ra-card">
        <div class="ra-avatar" style="background:linear-gradient(135deg,${a.gradient[0]},${a.gradient[1]})">${a.initial}</div>
        <p class="ra-name">${a.name}</p>
        <p class="ra-skill">${a.skill}</p>
        <p class="ra-rating"><i class="fa fa-star"></i>${a.rating} rating</p>
      </a>
    `).join('');
  }
}

// ══════════════════════════════════════════
//   BOOKINGS
// ══════════════════════════════════════════
function renderBookings() {
  const listEl = document.getElementById('bookings-list');
  if (!listEl) return;

  const filtered = state.currentFilter === 'all'
    ? state.bookings
    : state.bookings.filter(b => b.status === state.currentFilter);

  if (filtered.length === 0) {
    listEl.innerHTML = emptyState('fa-calendar-xmark', 'No bookings found', 'No bookings match this filter.', null, null);
    return;
  }

  listEl.innerHTML = filtered.map(b => bookingCardHTML(b, true)).join('');
  attachBookingActions(listEl);
}

function bookingCardHTML(b, showFullActions) {
  const NM = window.NegotiationModule;
  const label = NM ? NM.statusLabel(b.status) : statusLabel(b.status);
  const statusCls = NM ? NM.statusClass(b.status) : 'status-' + b.status;
  const displayAmount = b.agreedAmount || b.counterAmount || b.amount;

  // Negotiation status pill shown inside the card body
  let negPill = '';
  if (b.status === 'negotiating' && b.lastOfferFrom === 'artisan') {
    negPill = `<span class="neg-pill"><i class="fa fa-comment-dollar"></i> Artisan sent an offer — tap to view</span>`;
  } else if (b.status === 'negotiating' && b.lastOfferFrom === 'customer') {
    negPill = `<span class="neg-pill" style="background:#EEF2FF;color:#4338CA"><i class="fa fa-hourglass-half"></i> Counter-offer sent — awaiting artisan</span>`;
  } else if (b.status === 'offer_accepted') {
    negPill = `<span class="offer-pill"><i class="fa fa-circle-check"></i> Price agreed — ready to pay</span>`;
  }

  const actions = buildActions(b, showFullActions);
  return `
    <div class="booking-card" data-booking-id="${b.id}">
      <div class="bc-avatar" style="background:linear-gradient(135deg,${b.gradient[0]},${b.gradient[1]})">${b.initial}</div>
      <div class="bc-body">
        <p class="bc-title">${b.job}</p>
        <div class="bc-meta">
          <span><i class="fa fa-user"></i>${b.artisan}</span>
          <span><i class="fa fa-screwdriver-wrench"></i>${b.skill}</span>
          <span><i class="fa fa-clock"></i>${b.date}</span>
        </div>
        ${negPill}
        ${showFullActions ? `<div class="bc-actions">${actions}</div>` : ''}
      </div>
      <div class="bc-right">
        <span class="bc-status ${statusCls}">${label}</span>
        <span class="bc-amount">₦${displayAmount.toLocaleString()}</span>
        ${!showFullActions ? `<div class="bc-actions">${actions}</div>` : ''}
      </div>
    </div>
  `;
}

function buildActions(b, full) {
  let btns = '';

  // ── NEGOTIATING: artisan sent offer, customer must respond ──
  if (b.status === 'negotiating' && b.lastOfferFrom === 'artisan') {
    btns += `
      <button class="bc-btn" data-action="respond-offer" data-id="${b.id}"
        style="background:#059669;color:#fff;font-weight:600;border:none;">
        <i class="fa fa-comment-dollar"></i> View Offer — ₦${(b.counterAmount || b.amount).toLocaleString()}
      </button>
    `;
    btns += `<button class="bc-btn bc-btn-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`;
    return btns;
  }

  // ── NEGOTIATING: customer countered, waiting for artisan ──
  if (b.status === 'negotiating' && b.lastOfferFrom === 'customer') {
    btns += `<span style="font-size:0.78rem;color:var(--text-muted);display:flex;align-items:center;gap:5px"><i class="fa fa-hourglass-half"></i> Waiting for artisan…</span>`;
    btns += `<button class="bc-btn bc-btn-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`;
    return btns;
  }

  // ── OFFER ACCEPTED: price agreed, customer must now pay ──
  if (b.status === 'offer_accepted') {
    btns += `
      <button class="bc-btn" data-action="pay-now" data-id="${b.id}"
        style="background:#059669;color:#fff;font-weight:700;font-size:0.9rem;border:none;padding:10px 16px;">
        <i class="fa fa-lock"></i> Pay ₦${(b.agreedAmount || b.amount).toLocaleString()} to Confirm
      </button>
    `;
    return btns;
  }

  // ── EXISTING STATUSES (unchanged) ──
  if (b.status === 'in_progress') {
    btns += `<button class="bc-btn bc-btn-primary" data-action="confirm" data-id="${b.id}">Confirm Complete</button>`;
    btns += `<button class="bc-btn bc-btn-secondary" data-action="message" data-id="${b.id}"><i class="fa fa-comment"></i></button>`;
    btns += `<button class="bc-btn bc-btn-danger" data-action="dispute" data-id="${b.id}">Dispute</button>`;
  } else if (b.status === 'confirmed') {
    btns += `<button class="bc-btn bc-btn-secondary" data-action="message" data-id="${b.id}"><i class="fa fa-comment"></i> Message</button>`;
    btns += `<button class="bc-btn bc-btn-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`;
  } else if (b.status === 'pending') {
    btns += `<button class="bc-btn bc-btn-danger" data-action="cancel" data-id="${b.id}">Cancel</button>`;
  } else if (b.status === 'completed') {
    btns += `<button class="bc-btn bc-btn-primary" data-action="review" data-id="${b.id}"><i class="fa fa-star"></i> Leave Review</button>`;
    btns += `<button class="bc-btn bc-btn-secondary" data-action="rebook" data-id="${b.id}">Book Again</button>`;
  }
  if (full) {
    btns += `<a href="artisan-profile.html" class="bc-btn bc-btn-secondary"><i class="fa fa-user"></i> View Profile</a>`;
  }
  return btns;
}

function attachBookingActions(container) {
  container.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const id     = btn.dataset.id;
      const booking = state.bookings.find(b => b.id === id);
      if (!booking) return;

      if (action === 'respond-offer') {
        // Customer opens negotiation modal to accept or counter the artisan's offer
        if (window.NegotiationModule) {
          NegotiationModule.openCustomerModal(booking, () => {
            renderOverview();
            renderBookings();
          });
        }
      } else if (action === 'pay-now') {
        // Price agreed — trigger Paystack escrow payment
        const payAmount = booking.agreedAmount || booking.amount;
        if (window.PaystackHelper) {
          const user = window.ArtizanAPI?.getStoredUser?.() || { email: 'customer@artizan.ng' };
          PaystackHelper.payForBooking({
            booking: { id: booking.id, total_amount_ngn: payAmount },
            customerEmail: user.email,
            onComplete: ({ success }) => {
              if (success) {
                booking.status = 'confirmed';
                showToast(`Payment of ₦${payAmount.toLocaleString()} successful! Booking confirmed.`, 'fa-circle-check');
              } else {
                showToast('Payment was not completed. Please try again.', 'fa-triangle-exclamation');
              }
              renderOverview();
              renderBookings();
            },
          });
        } else {
          // Demo mode — no Paystack loaded, simulate payment
          booking.status = 'confirmed';
          showToast(`Payment of ₦${payAmount.toLocaleString()} confirmed! (Demo mode)`, 'fa-circle-check');
          renderOverview();
          renderBookings();
        }
      } else if (action === 'confirm') {
        showConfirm(
          'Confirm job complete?',
          `This will release ₦${booking.amount.toLocaleString()} to ${booking.artisan}. This cannot be undone.`,
          () => {
            booking.status = 'completed';
            renderOverview(); renderBookings();
            showToast(`Payment released to ${booking.artisan}!`, 'success');
            setTimeout(() => openReviewModal(booking), 1000);
          }
        );
      } else if (action === 'cancel') {
        showConfirm('Cancel this booking?', 'The artisan will be notified and your payment will be refunded.', () => {
          booking.status = 'cancelled';
          renderOverview(); renderBookings();
          showToast('Booking cancelled. Refund initiated.', 'info');
        });
      } else if (action === 'dispute') {
        showConfirm('Raise a dispute?', 'Our team will review the situation and contact both parties within 24 hours.', () => {
          booking.status = 'disputed';
          renderOverview(); renderBookings();
          showToast('Dispute raised. Our team will be in touch shortly.', 'warning');
        });
      } else if (action === 'review') {
        openReviewModal(booking);
      } else if (action === 'rebook') {
        window.location.href = `artisan-profile.html#book`;
      } else if (action === 'message') {
        navigateTo('messages');
        const chat = DEMO_CHATS.find(c => c.artisan === booking.artisan);
        if (chat) setTimeout(() => openChat(chat.id), 200);
      }
    });
  });
}

function initBookingFilters() {
  document.querySelectorAll('.bf-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.bf-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.currentFilter = chip.dataset.filter;
      renderBookings();
    });
  });
}

// ══════════════════════════════════════════
//   CHAT
// ══════════════════════════════════════════
function renderChats() {
  const listEl = document.getElementById('chat-list');
  if (!listEl) return;

  if (DEMO_CHATS.length === 0) {
    listEl.innerHTML = `<p style="padding:20px;font-size:0.82rem;color:var(--text-muted)">No conversations yet. Conversations appear after a booking is confirmed.</p>`;
    return;
  }

  listEl.innerHTML = DEMO_CHATS.map(c => `
    <div class="chat-list-item ${state.activeChat === c.id ? 'active' : ''}" data-chat-id="${c.id}">
      <div class="cli-avatar" style="background:linear-gradient(135deg,${c.gradient[0]},${c.gradient[1]})">${c.initial}</div>
      <div class="cli-body">
        <p class="cli-name">${c.artisan}</p>
        <p class="cli-preview">${c.lastMsg}</p>
      </div>
      <div class="cli-meta">
        <span class="cli-time">Now</span>
        ${c.unread > 0 ? `<span class="cli-unread">${c.unread}</span>` : ''}
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.chat-list-item').forEach(item => {
    item.addEventListener('click', () => openChat(item.dataset.chatId));
  });
}

function openChat(chatId) {
  const chat = DEMO_CHATS.find(c => c.id === chatId);
  if (!chat) return;

  state.activeChat = chatId;
  chat.unread = 0;

  // Update list active state
  document.querySelectorAll('.chat-list-item').forEach(i => {
    i.classList.toggle('active', i.dataset.chatId === chatId);
    if (i.dataset.chatId === chatId) {
      const badge = i.querySelector('.cli-unread');
      if (badge) badge.remove();
    }
  });

  // Show chat window
  document.getElementById('chat-empty')?.style && (document.getElementById('chat-empty').style.display = 'none');
  const active = document.getElementById('chat-active');
  if (active) active.style.display = 'flex';

  // Header
  const header = document.getElementById('chat-header');
  if (header) {
    header.innerHTML = `
      <div class="ch-avatar" style="background:linear-gradient(135deg,${chat.gradient[0]},${chat.gradient[1]})">${chat.initial}</div>
      <div>
        <p class="ch-name">${chat.artisan}</p>
        <p class="ch-skill">${chat.skill}</p>
      </div>
      <a href="artisan-profile.html" style="margin-left:auto;font-size:0.78rem;color:var(--brand-purple)">View profile</a>
    `;
  }

  // Messages
  renderMessages(chat);
}

function renderMessages(chat) {
  const msgEl = document.getElementById('chat-messages');
  if (!msgEl) return;

  msgEl.innerHTML = chat.messages.map(m => `
    <div class="msg ${m.from === 'me' ? 'msg-out' : 'msg-in'}">
      ${m.text}
      <div class="msg-time">${m.time}</div>
    </div>
  `).join('');

  msgEl.scrollTop = msgEl.scrollHeight;
}

function initChat() {
  const input   = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send');

  function sendMessage() {
    const text = input?.value.trim();
    if (!text || !state.activeChat) return;

    const chat = DEMO_CHATS.find(c => c.id === state.activeChat);
    if (!chat) return;

    chat.messages.push({ from: 'me', text, time: 'Just now' });
    chat.lastMsg = text;
    if (input) input.value = '';

    renderMessages(chat);
    renderChats(); // update preview

    // Simulate reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Understood, I will take note of that.',
        'No problem at all!',
        'Thank you for letting me know.',
        'I will be there as discussed.',
        'Sounds good, see you then.',
      ];
      chat.messages.push({
        from: 'artisan',
        text: replies[Math.floor(Math.random() * replies.length)],
        time: 'Just now',
      });
      renderMessages(chat);
      renderChats();
    }, 1500);
  }

  sendBtn?.addEventListener('click', sendMessage);
  input?.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } });
}

// ══════════════════════════════════════════
//   SAVED ARTISANS
// ══════════════════════════════════════════
function renderSaved() {
  const grid = document.getElementById('saved-grid');
  if (!grid) return;

  if (state.saved.length === 0) {
    grid.innerHTML = emptyState('fa-bookmark', 'No saved artisans', 'Bookmark artisans you like to find them quickly.', 'discover.html', 'Browse Artisans');
    return;
  }

  grid.innerHTML = state.saved.map(a => `
    <div class="saved-card">
      <div class="sc-top">
        <div class="sc-avatar" style="background:linear-gradient(135deg,${a.gradient[0]},${a.gradient[1]})">${a.initial}</div>
        <div>
          <p class="sc-name">${a.name}</p>
          <p class="sc-skill">${a.skill}</p>
        </div>
      </div>
      <p class="sc-rating"><i class="fa fa-star"></i> ${a.rating} · ${a.jobs} jobs</p>
      <div class="sc-actions">
        <a href="artisan-profile.html?id=${a.id}" class="sc-book">Book Now</a>
        <button class="sc-remove" data-artisan-id="${a.id}" title="Remove"><i class="fa fa-bookmark-slash"></i></button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.sc-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.artisanId;
      showConfirm('Remove from saved?', 'This artisan will be removed from your saved list.', () => {
        state.saved = state.saved.filter(a => a.id !== id);
        renderSaved();
        showToast('Removed from saved artisans.', 'info');
      });
    });
  });
}

// ══════════════════════════════════════════
//   PROFILE
// ══════════════════════════════════════════
function renderProfile() {
  // Already pre-filled in loadUser()
}

function initProfileForm() {
  document.getElementById('profile-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const errEl = document.getElementById('pf-error');
    const sucEl = document.getElementById('pf-success');
    if (errEl) errEl.textContent = '';
    if (sucEl) sucEl.style.display = 'none';

    const newPw  = document.getElementById('pf-pw')?.value;
    const confPw = document.getElementById('pf-pw-confirm')?.value;

    if (newPw && newPw !== confPw) {
      if (errEl) errEl.textContent = 'Passwords do not match.';
      return;
    }
    if (newPw && newPw.length < 8) {
      if (errEl) errEl.textContent = 'New password must be at least 8 characters.';
      return;
    }

    // Simulate API save
    await new Promise(r => setTimeout(r, 600));
    if (sucEl) sucEl.style.display = 'flex';
    showToast('Profile updated successfully!', 'success');
    setTimeout(() => { if (sucEl) sucEl.style.display = 'none'; }, 4000);
  });

  document.getElementById('pf-delete-btn')?.addEventListener('click', () => {
    showConfirm(
      'Delete your account?',
      'This is permanent and cannot be undone. All your booking history will be lost.',
      () => {
        showToast('Account deletion requested. You will receive a confirmation email.', 'info');
      }
    );
  });
}

// ══════════════════════════════════════════
//   REVIEW MODAL
// ══════════════════════════════════════════
function initReviewModal() {
  const modal    = document.getElementById('review-modal');
  const closeBtn = document.getElementById('review-modal-close');
  const submitBtn= document.getElementById('review-submit');
  const stars    = document.querySelectorAll('.star-btn');
  const label    = document.getElementById('star-label');

  const LABELS = ['','Poor','Fair','Good','Very Good','Excellent'];

  stars.forEach(star => {
    star.addEventListener('mouseover', () => highlightStars(parseInt(star.dataset.val)));
    star.addEventListener('mouseout',  () => highlightStars(state.selectedRating));
    star.addEventListener('click',     () => {
      state.selectedRating = parseInt(star.dataset.val);
      highlightStars(state.selectedRating);
      if (label) label.textContent = LABELS[state.selectedRating];
    });
  });

  function highlightStars(n) {
    stars.forEach((s, i) => s.classList.toggle('lit', i < n));
  }

  closeBtn?.addEventListener('click', closeReviewModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeReviewModal(); });

  submitBtn?.addEventListener('click', async () => {
    if (state.selectedRating === 0) {
      showToast('Please select a star rating.', 'warning');
      return;
    }
    const comment = document.getElementById('review-comment')?.value.trim() || '';
    // POST /api/reviews/
    await new Promise(r => setTimeout(r, 500));
    closeReviewModal();
    showToast('Thank you! Your review has been submitted.', 'success');
    state.selectedRating = 0;
  });
}

function openReviewModal(booking) {
  state.reviewBookingId = booking.id;
  state.selectedRating  = 0;
  document.querySelectorAll('.star-btn').forEach(s => s.classList.remove('lit'));
  setText('star-label', 'Tap a star to rate');
  setText('review-artisan-name', `How was your experience with ${booking.artisan}?`);
  const comment = document.getElementById('review-comment');
  if (comment) comment.value = '';
  const modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'flex';
}

function closeReviewModal() {
  const modal = document.getElementById('review-modal');
  if (modal) modal.style.display = 'none';
}

// ══════════════════════════════════════════
//   CONFIRM MODAL
// ══════════════════════════════════════════
function initConfirmModal() {
  document.getElementById('confirm-no')?.addEventListener('click', closeConfirm);
  document.getElementById('confirm-modal')?.addEventListener('click', e => {
    if (e.target.id === 'confirm-modal') closeConfirm();
  });
  document.getElementById('confirm-yes')?.addEventListener('click', () => {
    state.confirmCallback?.();
    closeConfirm();
  });
}

function showConfirm(title, msg, callback) {
  setText('confirm-title', title);
  setText('confirm-msg', msg);
  state.confirmCallback = callback;
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'flex';
}

function closeConfirm() {
  const modal = document.getElementById('confirm-modal');
  if (modal) modal.style.display = 'none';
  state.confirmCallback = null;
}

// ══════════════════════════════════════════
//   TOAST
// ══════════════════════════════════════════
function showToast(message, type = 'info') {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;

  const icons  = { info: 'fa-circle-info', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', success: 'fa-circle-check' };
  const colors = { info: '#A5B4FC', error: '#FCA5A5', warning: '#FDE68A', success: '#6EE7B7' };

  const toast = document.createElement('div');
  toast.className = 'toast-item';
  toast.innerHTML = `<i class="fa ${icons[type]||icons.info}" style="color:${colors[type]}"></i><span>${message}</span>`;
  wrap.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'opacity 0.3s, transform 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ══════════════════════════════════════════
//   HELPERS
// ══════════════════════════════════════════
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setVal(id, val) {
  const el = document.getElementById(id);
  if (el) el.value = val;
}
function statusLabel(status) {
  const labels = { pending: 'Pending', confirmed: 'Confirmed', in_progress: 'In Progress', completed: 'Completed', cancelled: 'Cancelled', disputed: 'Disputed' };
  return labels[status] || status;
}
function emptyState(icon, title, msg, href, btnLabel) {
  return `
    <div class="empty-state">
      <i class="fa ${icon}"></i>
      <h4>${title}</h4>
      <p>${msg}</p>
      ${href ? `<a href="${href}">${btnLabel}</a>` : ''}
    </div>
  `;
}

// Expose for auth redirect check
window.AuthStorage = window.AuthStorage || { getUser: ()=>null, clear: ()=>{} };