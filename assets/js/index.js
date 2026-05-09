/* ARTIZAN — LANDING PAGE JS (index.js) */

'use strict';

// ── NAVBAR SCROLL BEHAVIOUR
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
}, { passive: true });

// ── HAMBURGER MENU
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  mobileMenu.classList.toggle('open');
  document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
});

function closeMobile() {
  hamburger.classList.remove('open');
  mobileMenu.classList.remove('open');
  document.body.style.overflow = '';
}

// Close mobile menu on outside click
document.addEventListener('click', (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    closeMobile();
  }
});

// ── GEOLOCATION — "Use my location"
const locateBtn = document.getElementById('locate-btn');
const locationInput = document.getElementById('location-input');

locateBtn.addEventListener('click', () => {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.', 'error');
    return;
  }
  locateBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i>';
  locateBtn.disabled = true;

  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords;
      // Reverse geocode using OpenStreetMap Nominatim (free, no key needed)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const data = await res.json();
        const area = data.address?.suburb || data.address?.city_district || data.address?.city || 'Your location';
        locationInput.value = area;
        // Store coords for the discover page
        sessionStorage.setItem('userLat', latitude);
        sessionStorage.setItem('userLng', longitude);
        sessionStorage.setItem('userArea', area);
      } catch {
        locationInput.value = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
      } finally {
        locateBtn.innerHTML = '<i class="fa fa-crosshairs"></i>';
        locateBtn.disabled = false;
      }
    },
    () => {
      showToast('Could not get your location. Please type it in.', 'error');
      locateBtn.innerHTML = '<i class="fa fa-crosshairs"></i>';
      locateBtn.disabled = false;
    },
    { timeout: 8000 }
  );
});

// ── SEARCH BUTTON
const searchBtn = document.getElementById('search-btn');
const skillSelect = document.getElementById('skill-select');

searchBtn.addEventListener('click', () => {
  const skill = skillSelect.value;
  const location = locationInput.value.trim();

  if (!skill) {
    showToast('Please select a skill category first.', 'warning');
    skillSelect.closest('.search-field').style.borderBottom = '2px solid #E85D04';
    setTimeout(() => skillSelect.closest('.search-field').style.borderBottom = '', 2000);
    return;
  }

  const params = new URLSearchParams();
  params.set('skill', skill);
  if (location) params.set('location', location);

  const lat = sessionStorage.getItem('userLat');
  const lng = sessionStorage.getItem('userLng');
  if (lat && lng) { params.set('lat', lat); params.set('lng', lng); }

  window.location.href = `discover.html?${params.toString()}`;
});

// Allow pressing Enter in location field to search
locationInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') searchBtn.click();
});

// ── ANIMATED STAT COUNTERS
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 1800;
  const start = performance.now();

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(eased * target);
    el.textContent = current >= 1000
      ? (current / 1000).toFixed(current % 1000 === 0 ? 0 : 1) + 'K'
      : current.toString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target >= 1000
      ? (target / 1000).toFixed(0) + 'K'
      : target.toString();
  }
  requestAnimationFrame(update);
}

// Trigger counters when hero stats are visible
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.stat-num').forEach(animateCounter);
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

const heroStats = document.querySelector('.hero-stats');
if (heroStats) statObserver.observe(heroStats);

// ── SCROLL REVEAL — fade in sections as they enter viewport
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.cat-card, .artisan-card, .hiw-step, .trust-feat, .testi-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  revealObserver.observe(el);
});

// ── HOW IT WORKS TABS
const tabs = document.querySelectorAll('.hiw-tab');
const customerContent = document.getElementById('hiw-customer');
const artisanContent  = document.getElementById('hiw-artisan');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    const target = tab.dataset.tab;
    if (target === 'customer') {
      customerContent.classList.remove('hidden');
      artisanContent.classList.add('hidden');
    } else {
      artisanContent.classList.remove('hidden');
      customerContent.classList.add('hidden');
    }
  });
});

// ── TESTIMONIAL CAROUSEL
const track      = document.getElementById('testimonials-track');
const dotsContainer = document.getElementById('testi-dots');
const prevBtn    = document.getElementById('testi-prev');
const nextBtn    = document.getElementById('testi-next');
const cards      = track ? track.querySelectorAll('.testi-card') : [];
let currentSlide = 0;

// Build dots
if (cards.length) {
  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className = 'testi-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', `Go to testimonial ${i + 1}`);
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });
}

function goToSlide(index) {
  currentSlide = Math.max(0, Math.min(index, cards.length - 1));
  const cardWidth = cards[0] ? cards[0].offsetWidth + 20 : 0;
  track.scrollTo({ left: currentSlide * cardWidth, behavior: 'smooth' });
  document.querySelectorAll('.testi-dot').forEach((d, i) => {
    d.classList.toggle('active', i === currentSlide);
  });
}

prevBtn?.addEventListener('click', () => goToSlide(currentSlide - 1));
nextBtn?.addEventListener('click', () => goToSlide(currentSlide + 1));

// Auto advance
let autoSlide = setInterval(() => goToSlide((currentSlide + 1) % cards.length), 5000);
track?.addEventListener('mouseenter', () => clearInterval(autoSlide));
track?.addEventListener('mouseleave', () => {
  autoSlide = setInterval(() => goToSlide((currentSlide + 1) % cards.length), 5000);
});

// ── TRUST SCORE BARS ANIMATION
const trustBars = document.querySelectorAll('.ts-fill');
const trustObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      trustBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        requestAnimationFrame(() => {
          setTimeout(() => { bar.style.width = width; }, 100);
        });
      });
      trustObserver.disconnect();
    }
  });
}, { threshold: 0.4 });

const tsCard = document.querySelector('.ts-card');
if (tsCard) trustObserver.observe(tsCard);

// ── TOAST NOTIFICATION
function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.artizan-toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = 'artizan-toast';

  const icons = { info: 'fa-circle-info', error: 'fa-circle-xmark', warning: 'fa-triangle-exclamation', success: 'fa-circle-check' };
  const colors = { info: '#4F46E5', error: '#DC2626', warning: '#D97706', success: '#059669' };

  toast.innerHTML = `<i class="fa ${icons[type] || icons.info}" style="color:${colors[type]}"></i><span>${message}</span>`;
  toast.style.cssText = `
    position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(20px);
    background:#fff; border:1px solid #e5e5ea; border-radius:40px;
    padding:12px 20px; display:flex; align-items:center; gap:10px;
    font-family:'DM Sans',sans-serif; font-size:14px; font-weight:500;
    box-shadow:0 8px 24px rgba(0,0,0,0.12); z-index:9999;
    opacity:0; transition:opacity 0.3s ease, transform 0.3s ease;
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

// ── SMOOTH SCROLL for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ── CATEGORY CARD HOVER — subtle tilt effect on desktop
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.cat-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-4px) rotateX(${-y * 6}deg) rotateY(${x * 6}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ── FETCH REAL FEATURED ARTISANS from API (when backend is live)
async function loadFeaturedArtisans() {
  try {
    const res = await fetch('/api/artisans/featured/');
    if (!res.ok) return; // Fall back to demo cards
    const data = await res.json();
    // TODO: render real artisan cards
    // renderArtisanCards(data.results);
  } catch {
    // Backend not live yet — demo cards already in HTML
  }
}
loadFeaturedArtisans();

// Expose closeMobile globally for inline onclick handlers
window.closeMobile = closeMobile;
window.showToast   = showToast;
