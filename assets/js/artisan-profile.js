/* ══════════════════════════════════════════
   ARTIZAN — ARTISAN PROFILE JS
   artisan-profile.js
   Handles: profile data loading, portfolio
   lightbox, calendar, time slots, booking
   form, reviews, trust score animation,
   section nav, save/share, login modal
══════════════════════════════════════════ */

'use strict';

// ── DEMO ARTISAN DATA (replaced by API call when backend is live)
const DEMO_ARTISAN = {
  id: 'a1',
  name: 'Chukwudi Nwosu',
  initials: 'CN',
  skill: 'Plumbing',
  category: 'plumbing',
  location: 'Victoria Island, Lagos',
  distance: 0.6,
  rating: 4.9,
  jobs: 203,
  completion: 97,
  responseTime: '~45 min',
  priceFrom: 6500,
  isAvailable: true,
  trustScore: 94,
  trustBand: 'high',
  memberSince: 'January 2023',
  experience: '9 years',
  zones: 'VI, Lekki, Lagos Island, Ikoyi, Ajah',
  gradient: ['#059669', '#34D399'],
  bio: `I am a certified plumber with over 9 years of experience serving clients across Lagos Island, Victoria Island, and Lekki. I specialise in residential pipe installation, burst pipe repairs, bathroom plumbing, and drainage systems. I have worked on projects ranging from single-flat repairs to full plumbing installations for residential estates and commercial buildings.`,
  bio2: `I take pride in arriving on time, explaining the issue clearly before starting work, and cleaning up after every job. All my materials are sourced from trusted suppliers, and I offer a 30-day workmanship guarantee on all repairs.`,
  tags: ['Pipe Repair', 'Installation', 'Drainage', 'Bathroom Plumbing', 'Burst Pipes', 'Water Heaters'],
  portfolio: [
    { caption: 'Full bathroom plumbing installation — Lekki', skill: 'Installation', color: '#0077B6' },
    { caption: 'Burst pipe repair — Victoria Island',         skill: 'Pipe Repair',  color: '#059669' },
    { caption: 'Kitchen sink drainage fix — Ikoyi',           skill: 'Drainage',     color: '#7B2D8B' },
    { caption: 'Water heater installation — Lagos Island',     skill: 'Water Heater', color: '#E85D04' },
    { caption: 'Bathroom fitting — Ajah',                      skill: 'Installation', color: '#1447E6' },
    { caption: 'Estate plumbing survey — Lekki Phase 1',       skill: 'Survey',       color: '#D97706' },
    { caption: 'Underground pipe repair',                       skill: 'Pipe Repair',  color: '#059669' },
    { caption: 'Water tank installation — VI',                  skill: 'Installation', color: '#0077B6' },
  ],
  // Which days artisan is unavailable (0=Sun, 1=Mon ... 6=Sat)
  unavailableDays: [0], // Sundays off
  timeSlots: ['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'],
  bookedSlots: { /* '2025-06-15': ['9:00 AM', '2:00 PM'] */ },
  reviews: [
    { name: 'Folake Adeyemi',    initial: 'F', color: '#4F46E5', date: '2 weeks ago',  stars: 5, text: 'Chukwudi arrived on time and fixed my burst pipe in under an hour. He explained exactly what was wrong before starting and cleaned up everything after. Highly recommend!' },
    { name: 'Babatunde Ogunleye',initial: 'B', color: '#E85D04', date: '1 month ago',  stars: 5, text: 'I have used Chukwudi three times now. He is reliable, professional, and his prices are fair. The escrow payment through Artizan gave me real peace of mind the first time I booked.' },
    { name: 'Ngozi Eze',         initial: 'N', color: '#7B2D8B', date: '1 month ago',  stars: 5, text: 'Fixed a drainage problem that two other plumbers could not solve. Very knowledgeable.' },
    { name: 'Emeka Obi',         initial: 'E', color: '#059669', date: '2 months ago', stars: 4, text: 'Good work overall. Took slightly longer than expected but the quality of the repair was excellent. Would book again.' },
    { name: 'Amaka Nwosu',       initial: 'A', color: '#D97706', date: '2 months ago', stars: 5, text: 'Installed a new bathroom set in my flat. Very neat work. He even helped me choose the right fittings within my budget.' },
    { name: 'Tunde Williams',    initial: 'T', color: '#1447E6', date: '3 months ago', stars: 5, text: 'Professional and fast. Fixed our office water supply issue with minimum disruption. Cleaned up perfectly after.' },
  ],
};

// ── STATE
const state = {
  artisan: DEMO_ARTISAN,
  selectedDate: null,
  selectedSlot: null,
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(),
  lightboxIndex: 0,
  reviewsShown: 3,
  isSaved: false,
  isLoggedIn: false, // set to true when JWT token exists
};

// ── CHECK AUTH (JWT in memory or sessionStorage)
function checkAuth() {
  const token = sessionStorage.getItem('artizan_token');
  state.isLoggedIn = !!token;
}

// ── INIT
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  loadArtisanFromURL();
  renderProfile();
  renderPortfolio();
  renderCalendar();
  renderReviews();
  initTrustScoreAnimation();
  initSectionNav();
  initNavbar();
  initBookingForm();
  initSaveShare();
  initMobileBar();
});

// ── LOAD ARTISAN DATA (from URL param → API → fallback to demo)
async function loadArtisanFromURL() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;

  try {
    const res = await fetch(`/api/artisans/${id}/`);
    if (res.ok) {
      const data = await res.json();
      Object.assign(state.artisan, data);
      renderProfile();
      renderPortfolio();
      renderReviews();
    }
  } catch { /* use demo data */ }
}

// ── RENDER PROFILE HEADER
function renderProfile() {
  const a = state.artisan;

  // Avatar
  const avatar = document.getElementById('profile-avatar');
  if (avatar) {
    avatar.textContent = a.initials;
    avatar.style.background = `linear-gradient(135deg, ${a.gradient[0]}, ${a.gradient[1]})`;
  }

  // Availability
  const dot  = document.querySelector('.avail-dot');
  const text = document.querySelector('.avail-text');
  if (dot && text) {
    if (a.isAvailable) {
      dot.classList.remove('busy');
      text.textContent = 'Available now';
    } else {
      dot.classList.add('busy');
      text.textContent = 'Currently busy';
    }
  }

  // Text fields
  setText('profile-name', a.name);
  setText('profile-location', a.location);
  setText('profile-distance', `${a.distance}km away`);
  setText('stat-rating', a.rating.toFixed(1));
  setText('stat-jobs', a.jobs.toLocaleString());
  setText('stat-completion', `${a.completion}%`);
  setText('stat-response', a.responseTime);
  setText('price-amount', `₦${formatPrice(a.priceFrom)}`);
  setText('detail-exp', `${a.experience}`);
  setText('detail-zones', a.zones);
  setText('detail-member', a.memberSince);

  // Stars
  const stars = document.getElementById('qs-stars');
  if (stars) stars.textContent = '★'.repeat(Math.round(a.rating)) + '☆'.repeat(5 - Math.round(a.rating));

  // Page title
  document.title = `${a.name} — ${a.skill} · Artizan Lagos`;

  // Bio tags
  const tagsEl = document.getElementById('bio-tags');
  if (tagsEl) {
    tagsEl.innerHTML = a.tags.map(t => `<span>${t}</span>`).join('');
  }

  // Skill pill
  const skillEl = document.getElementById('profile-skill');
  if (skillEl) skillEl.innerHTML = `<i class="fa fa-wrench"></i> ${a.skill}`;

  // Sidebar price
  const bscAmount = document.querySelector('.bsc-amount');
  if (bscAmount) bscAmount.innerHTML = `<i class="fa fa-naira-sign"></i>${formatPrice(a.priceFrom)} <small>/ job</small>`;

  // Sidebar quick stats
  const qItems = document.querySelectorAll('.bsc-q-item span');
  if (qItems[0]) qItems[0].innerHTML = `<strong>${a.rating}</strong> (${a.jobs} reviews)`;
  if (qItems[1]) qItems[1].innerHTML = `<strong>${a.completion}%</strong> completion rate`;
  if (qItems[2]) qItems[2].innerHTML = `Responds in <strong>${a.responseTime}</strong>`;

  // BS name in summary
  setText('bs-artisan', a.name);
  setText('bs-service', a.skill);
  setText('bs-total', `₦${formatPrice(a.priceFrom)}`);

  // Trust score ring
  const trustNum = document.getElementById('ts-big-num');
  if (trustNum) trustNum.textContent = a.trustScore;
}

// ── PORTFOLIO
function renderPortfolio() {
  const grid = document.getElementById('portfolio-grid');
  const count = document.getElementById('portfolio-count');
  if (!grid) return;

  const items = state.artisan.portfolio;
  count && (count.textContent = `${items.length} photos`);

  grid.innerHTML = '';
  items.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'portfolio-item';
    div.innerHTML = `
      <div class="portfolio-placeholder" style="background:${item.color}22">
        <i class="fa fa-image" style="color:${item.color};font-size:${i===0?'3rem':'1.8rem'}"></i>
        <span style="color:${item.color};font-size:0.7rem;font-weight:600">${item.skill}</span>
      </div>
      <div class="portfolio-overlay">
        <i class="fa fa-expand"></i>
        <span>View photo</span>
      </div>
      <div class="portfolio-caption">${item.caption}</div>
    `;
    div.addEventListener('click', () => openLightbox(i));
    grid.appendChild(div);
  });

  initLightbox();
}

// ── LIGHTBOX
function initLightbox() {
  const dotsEl = document.getElementById('lb-dots');
  if (!dotsEl) return;

  const items = state.artisan.portfolio;
  dotsEl.innerHTML = items.map((_, i) =>
    `<button class="lb-dot${i===0?' active':''}" data-i="${i}" aria-label="Photo ${i+1}"></button>`
  ).join('');

  dotsEl.querySelectorAll('.lb-dot').forEach(dot => {
    dot.addEventListener('click', () => openLightbox(parseInt(dot.dataset.i, 10)));
  });

  document.getElementById('lb-close')?.addEventListener('click', closeLightbox);
  document.getElementById('lightbox-overlay')?.addEventListener('click', closeLightbox);
  document.getElementById('lb-prev')?.addEventListener('click', () => openLightbox(state.lightboxIndex - 1));
  document.getElementById('lb-next')?.addEventListener('click', () => openLightbox(state.lightboxIndex + 1));

  document.addEventListener('keydown', e => {
    if (!document.getElementById('lightbox').classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') openLightbox(state.lightboxIndex - 1);
    if (e.key === 'ArrowRight') openLightbox(state.lightboxIndex + 1);
  });
}

function openLightbox(index) {
  const items = state.artisan.portfolio;
  state.lightboxIndex = ((index % items.length) + items.length) % items.length;
  const item = items[state.lightboxIndex];

  const img = document.getElementById('lb-img');
  if (img) {
    img.style.background = `${item.color}22`;
    img.innerHTML = `
      <i class="fa fa-image" style="color:${item.color};font-size:3rem"></i>
      <p style="color:${item.color};font-size:0.8rem;margin-top:8px">${item.skill}</p>
    `;
  }
  setText('lb-skill-tag', item.skill);
  setText('lb-caption-full', item.caption);

  document.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === state.lightboxIndex));

  document.getElementById('lightbox').classList.add('open');
  document.getElementById('lightbox-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.getElementById('lightbox-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ── CALENDAR
function renderCalendar() {
  const wrap = document.getElementById('calendar-wrap');
  if (!wrap) return;

  const { calendarYear: yr, calendarMonth: mo } = state;
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const dayLabels  = ['Su','Mo','Tu','We','Th','Fr','Sa'];
  const today      = new Date();
  const firstDay   = new Date(yr, mo, 1).getDay();
  const daysInMonth = new Date(yr, mo + 1, 0).getDate();

  wrap.innerHTML = `
    <div class="cal-header">
      <span class="cal-title">${monthNames[mo]} ${yr}</span>
      <div class="cal-nav">
        <button class="cal-nav-btn" id="cal-prev"><i class="fa fa-chevron-left"></i></button>
        <button class="cal-nav-btn" id="cal-next"><i class="fa fa-chevron-right"></i></button>
      </div>
    </div>
    <div class="cal-grid">
      ${dayLabels.map(d => `<div class="cal-day-label">${d}</div>`).join('')}
      ${Array(firstDay).fill('<div class="cal-day cal-empty"></div>').join('')}
      ${Array.from({length: daysInMonth}, (_, i) => {
        const day   = i + 1;
        const date  = new Date(yr, mo, day);
        const dateStr = formatDateStr(yr, mo, day);
        const isPast  = date < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isToday = date.toDateString() === today.toDateString();
        const isUnavail = state.artisan.unavailableDays.includes(date.getDay());
        const isSelected = state.selectedDate === dateStr;
        const hasSlots = !isPast && !isUnavail;
        let cls = 'cal-day';
        if (isPast)     cls += ' cal-past';
        if (isToday)    cls += ' cal-today';
        if (isUnavail && !isPast) cls += ' cal-unavail';
        if (isSelected) cls += ' cal-selected';
        if (hasSlots)   cls += ' cal-has-slots';
        return `<div class="${cls}" data-date="${dateStr}">${day}</div>`;
      }).join('')}
    </div>
  `;

  // Nav buttons
  wrap.querySelector('#cal-prev')?.addEventListener('click', () => {
    state.calendarMonth--;
    if (state.calendarMonth < 0) { state.calendarMonth = 11; state.calendarYear--; }
    renderCalendar();
  });
  wrap.querySelector('#cal-next')?.addEventListener('click', () => {
    state.calendarMonth++;
    if (state.calendarMonth > 11) { state.calendarMonth = 0; state.calendarYear++; }
    renderCalendar();
  });

  // Day click
  wrap.querySelectorAll('.cal-day:not(.cal-empty):not(.cal-past):not(.cal-unavail)').forEach(day => {
    day.addEventListener('click', () => {
      state.selectedDate = day.dataset.date;
      renderCalendar(); // re-render to update selected
      renderTimeSlots();
      // Scroll to time slots
      document.getElementById('time-slots')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  });
}

function renderTimeSlots() {
  const slotsEl  = document.getElementById('time-slots');
  const slotsGrid = document.getElementById('slots-grid');
  const label    = document.getElementById('selected-date-label');
  if (!slotsEl || !slotsGrid) return;

  slotsEl.style.display = 'block';
  if (label) label.textContent = formatDateLabel(state.selectedDate);

  const booked = state.artisan.bookedSlots[state.selectedDate] || [];
  slotsGrid.innerHTML = state.artisan.timeSlots.map(slot => {
    const isBooked   = booked.includes(slot);
    const isSelected = state.selectedSlot === slot;
    return `
      <button class="slot-btn ${isBooked ? 'slot-booked' : ''} ${isSelected ? 'selected' : ''}"
        data-slot="${slot}" ${isBooked ? 'disabled' : ''}>
        ${slot}
      </button>
    `;
  }).join('');

  slotsGrid.querySelectorAll('.slot-btn:not(.slot-booked)').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedSlot = btn.dataset.slot;
      renderTimeSlots();
      updateBookingSummary();
    });
  });
}

function updateBookingSummary() {
  if (!state.selectedDate || !state.selectedSlot) return;
  const label = `${formatDateLabel(state.selectedDate)} at ${state.selectedSlot}`;
  setText('bs-datetime', label);
  const addr = document.getElementById('job-address')?.value.trim();
  if (addr) setText('bs-location', addr);
}

// ── REVIEWS
function renderReviews() {
  const listEl = document.getElementById('reviews-list');
  if (!listEl) return;

  const toShow = state.artisan.reviews.slice(0, state.reviewsShown);
  listEl.innerHTML = toShow.map((r, i) => `
    <div class="review-card" style="animation-delay:${i*60}ms">
      <div class="rc-header">
        <div class="rc-avatar" style="background:${r.color}">${r.initial}</div>
        <div>
          <p class="rc-name">${r.name}</p>
          <p class="rc-date">${r.date}</p>
        </div>
        <div class="rc-stars">${'★'.repeat(r.stars)}${'☆'.repeat(5-r.stars)}</div>
      </div>
      <p class="rc-text">${r.text}</p>
    </div>
  `).join('');

  // Load more
  const loadMoreBtn = document.getElementById('load-more-reviews');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = state.reviewsShown >= state.artisan.reviews.length ? 'none' : 'flex';
    loadMoreBtn.onclick = () => {
      state.reviewsShown += 3;
      renderReviews();
    };
  }
}

// ── TRUST SCORE RING ANIMATION
function initTrustScoreAnimation() {
  const fill = document.getElementById('ts-ring-fill');
  if (!fill) return;

  const score = state.artisan.trustScore;
  const circumference = 2 * Math.PI * 52; // 326.7

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const offset = circumference - (score / 100) * circumference;
        fill.style.strokeDashoffset = offset;
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const trustSection = document.getElementById('trust');
  if (trustSection) observer.observe(trustSection);

  // Also animate TC bars
  const barObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        document.querySelectorAll('.tc-fill').forEach(bar => {
          const w = bar.style.width;
          bar.style.width = '0';
          requestAnimationFrame(() => setTimeout(() => { bar.style.width = w; }, 100));
        });
        barObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });
  if (trustSection) barObserver.observe(trustSection);
}

// ── SECTION NAV (highlight active section on scroll)
function initSectionNav() {
  const sections = document.querySelectorAll('.ap-section[id]');
  const links    = document.querySelectorAll('.sn-link');

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.sn-link[data-section="${entry.target.id}"]`);
        active?.classList.add('active');
      }
    });
  }, { rootMargin: '-30% 0px -60% 0px' });

  sections.forEach(s => obs.observe(s));

  // Smooth scroll
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
}

// ── NAVBAR (show book button when hero is out of view)
function initNavbar() {
  const hero    = document.querySelector('.profile-hero');
  const bookBtn = document.getElementById('nav-book-btn');
  const nav     = document.getElementById('ap-nav');

  const obs = new IntersectionObserver(entries => {
    const visible = entries[0].isIntersecting;
    bookBtn?.classList.toggle('visible', !visible);
    nav?.classList.toggle('shadow', !visible);
  }, { threshold: 0 });

  if (hero) obs.observe(hero);
}

// ── BOOKING FORM
function initBookingForm() {
  const form = document.getElementById('booking-form');
  if (!form) return;

  // Update summary when address changes
  document.getElementById('job-address')?.addEventListener('input', () => {
    const addr = document.getElementById('job-address').value.trim();
    setText('bs-location', addr || '—');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('bf-error');
    const submitBtn = document.getElementById('bf-submit');
    const submitText = document.getElementById('bf-submit-text');
    if (errorEl) errorEl.textContent = '';

    const title   = document.getElementById('job-title')?.value.trim();
    const desc    = document.getElementById('job-desc')?.value.trim();
    const address = document.getElementById('job-address')?.value.trim();

    if (!title)   { showError('Please enter a job title.'); return; }
    if (!desc)    { showError('Please describe your job.'); return; }
    if (!address) { showError('Please enter your address.'); return; }
    if (!state.selectedDate) { showError('Please select a date from the calendar.'); return; }
    if (!state.selectedSlot) { showError('Please select a time slot.'); return; }

    // Check login
    if (!state.isLoggedIn) {
      showLoginModal();
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    submitText.textContent = 'Preparing payment...';

    try {
      // 1. Create booking via API
      const bookingRes = await fetch('/api/bookings/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('artizan_token')}`,
        },
        body: JSON.stringify({
          artisan_id: state.artisan.id,
          job_title: title,
          job_description: desc,
          address,
          scheduled_date: state.selectedDate,
          scheduled_time: state.selectedSlot,
        }),
      });

      if (!bookingRes.ok) throw new Error('Booking failed');
      const booking = await bookingRes.json();

      // 2. Initiate Paystack payment
      submitText.textContent = 'Opening payment...';
      initiatePayment(booking);

    } catch {
      // Demo mode: show Paystack popup directly
      showToast('Demo mode: opening payment...', 'info');
      initiatePayment({ id: 'demo', amount: state.artisan.priceFrom * 100 });
    }

    submitBtn.disabled = false;
    submitText.textContent = 'Proceed to Secure Payment';
  });

  function showError(msg) {
    const el = document.getElementById('bf-error');
    if (el) el.textContent = msg;
  }
}

// ── PAYSTACK PAYMENT
function initiatePayment(booking) {
  // Check if Paystack inline script is loaded
  if (typeof PaystackPop === 'undefined') {
    showToast('Payment gateway not loaded. Add Paystack inline script to enable live payments.', 'warning');
    return;
  }

  const handler = PaystackPop.setup({
    key: 'pk_test_YOUR_PAYSTACK_PUBLIC_KEY', // Replace with real key
    email: sessionStorage.getItem('userEmail') || 'user@example.com',
    amount: booking.amount || state.artisan.priceFrom * 100,
    currency: 'NGN',
    ref: `ARTIZAN-${booking.id}-${Date.now()}`,
    metadata: { booking_id: booking.id, artisan_id: state.artisan.id },
    callback: (response) => {
      // Payment successful — notify backend
      fetch(`/api/payments/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${sessionStorage.getItem('artizan_token')}` },
        body: JSON.stringify({ reference: response.reference, booking_id: booking.id }),
      }).then(() => {
        showToast('Booking confirmed! Chukwudi has been notified.', 'success');
        setTimeout(() => { window.location.href = 'customer-dashboard.html'; }, 2000);
      }).catch(() => {
        showToast('Payment received. Redirecting to dashboard...', 'success');
        setTimeout(() => { window.location.href = 'customer-dashboard.html'; }, 2000);
      });
    },
    onClose: () => { showToast('Payment cancelled.', 'info'); },
  });

  handler.openIframe();
}

// ── SAVE & SHARE
function initSaveShare() {
  const saveBtn  = document.getElementById('save-btn');
  const shareBtn = document.getElementById('share-btn');

  saveBtn?.addEventListener('click', () => {
    state.isSaved = !state.isSaved;
    saveBtn.classList.toggle('saved', state.isSaved);
    saveBtn.querySelector('i').className = state.isSaved ? 'fa fa-bookmark' : 'fa fa-bookmark';
    showToast(state.isSaved ? 'Artisan saved to your list!' : 'Removed from saved list.', state.isSaved ? 'success' : 'info');
  });

  shareBtn?.addEventListener('click', async () => {
    const data = {
      title: `${state.artisan.name} — ${state.artisan.skill} on Artizan`,
      text: `Check out ${state.artisan.name}, a verified ${state.artisan.skill} in Lagos with a ${state.artisan.rating}★ rating.`,
      url: window.location.href,
    };
    if (navigator.share) {
      try { await navigator.share(data); }
      catch { /* user cancelled */ }
    } else {
      navigator.clipboard?.writeText(window.location.href);
      showToast('Profile link copied to clipboard!', 'success');
    }
  });

  // Message buttons
  document.getElementById('message-btn')?.addEventListener('click', handleMessage);
  document.getElementById('sidebar-msg-btn')?.addEventListener('click', handleMessage);

  function handleMessage() {
    if (!state.isLoggedIn) { showLoginModal(); return; }
    showToast('Messaging available after making a booking.', 'info');
  }
}

// ── MOBILE BOOK BAR
function initMobileBar() {
  // Show/hide based on scroll
  const hero = document.querySelector('.profile-hero');
  const bar  = document.getElementById('mobile-book-bar');
  if (!hero || !bar) return;

  const obs = new IntersectionObserver(entries => {
    bar.style.display = entries[0].isIntersecting ? 'none' : 'flex';
  }, { threshold: 0 });
  obs.observe(hero);
}

// ── LOGIN MODAL
function showLoginModal() {
  const overlay = document.getElementById('login-modal-overlay');
  if (overlay) overlay.style.display = 'flex';
}

document.getElementById('login-modal-close')?.addEventListener('click', () => {
  const overlay = document.getElementById('login-modal-overlay');
  if (overlay) overlay.style.display = 'none';
});

document.getElementById('login-modal-overlay')?.addEventListener('click', (e) => {
  if (e.target === e.currentTarget) {
    e.currentTarget.style.display = 'none';
  }
});

// ── TOAST
function showToast(message, type = 'info') {
  document.querySelectorAll('.artizan-toast').forEach(t => t.remove());
  const icons  = { info:'fa-circle-info', error:'fa-circle-xmark', warning:'fa-triangle-exclamation', success:'fa-circle-check' };
  const colors = { info:'#4F46E5', error:'#DC2626', warning:'#D97706', success:'#059669' };
  const toast  = document.createElement('div');
  toast.className = 'artizan-toast';
  toast.innerHTML = `<i class="fa ${icons[type]||icons.info}" style="color:${colors[type]}"></i><span>${message}</span>`;
  toast.style.cssText = `
    position:fixed;bottom:90px;left:50%;transform:translateX(-50%) translateY(20px);
    background:#fff;border:1px solid #e5e5ea;border-radius:40px;
    padding:12px 20px;display:flex;align-items:center;gap:10px;
    font-family:'DM Sans',sans-serif;font-size:14px;font-weight:500;
    box-shadow:0 8px 24px rgba(0,0,0,0.12);z-index:9999;
    opacity:0;transition:opacity 0.3s ease,transform 0.3s ease;
  `;
  document.body.appendChild(toast);
  requestAnimationFrame(() => { toast.style.opacity='1'; toast.style.transform='translateX(-50%) translateY(0)'; });
  setTimeout(() => {
    toast.style.opacity='0'; toast.style.transform='translateX(-50%) translateY(10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// ── HELPERS
function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function formatPrice(n) {
  return n >= 1000 ? (n/1000).toFixed(n%1000===0?0:1)+'K' : n.toString();
}

function formatDateStr(y, m, d) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}

function formatDateLabel(str) {
  if (!str) return '—';
  const [y, m, d] = str.split('-').map(Number);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const days   = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const date   = new Date(y, m-1, d);
  return `${days[date.getDay()]}, ${d} ${months[m-1]} ${y}`;
}

// Expose for HTML onclick handlers
window.showToast = showToast;
