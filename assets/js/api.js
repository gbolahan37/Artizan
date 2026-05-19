/* ══════════════════════════════════════════
   ARTIZAN — API CLIENT
   assets/js/api.js
   Centralised fetch wrapper for all
   Artizan REST API calls.
   Base URL: /api/v1 (Django backend)
══════════════════════════════════════════ */

'use strict';

const API_BASE = '/api/v1';  // Update to full URL in production, e.g. https://api.artizan.ng/api/v1

// ── TOKEN MANAGEMENT
const TokenStore = {
  get access()  { return localStorage.getItem('artizan_access'); },
  get refresh() { return localStorage.getItem('artizan_refresh'); },
  set(access, refresh) {
    localStorage.setItem('artizan_access', access);
    if (refresh) localStorage.setItem('artizan_refresh', refresh);
  },
  clear() {
    localStorage.removeItem('artizan_access');
    localStorage.removeItem('artizan_refresh');
  },
};

// ── CORE FETCH WRAPPER
async function apiFetch(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach JWT if available
  if (TokenStore.access) {
    headers['Authorization'] = `Bearer ${TokenStore.access}`;
  }

  const res = await fetch(API_BASE + path, {
    ...options,
    headers,
  });

  // Attempt token refresh on 401
  if (res.status === 401 && TokenStore.refresh) {
    const refreshed = await refreshToken();
    if (refreshed) {
      // Retry original request once with new token
      headers['Authorization'] = `Bearer ${TokenStore.access}`;
      return fetch(API_BASE + path, { ...options, headers });
    } else {
      // Refresh failed — redirect to appropriate login
      TokenStore.clear();
      const role = localStorage.getItem('artizan_role');
      window.location.href = role === 'artisan' ? 'artisan-login.html' : 'customer-login.html';
      return null;
    }
  }

  return res;
}

// ── REFRESH TOKEN
async function refreshToken() {
  try {
    const res = await fetch(API_BASE + '/auth/token/refresh/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: TokenStore.refresh }),
    });
    if (res.ok) {
      const data = await res.json();
      TokenStore.set(data.access);
      return true;
    }
  } catch (_) {}
  return false;
}

// ── CONVENIENCE METHODS
const API = {
  // ── AUTH
  async login(email, password) {
    const res = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (!res) return null;
    const data = await res.json();
    if (res.ok) {
      TokenStore.set(data.access, data.refresh);
      localStorage.setItem('artizan_role', data.role);
      localStorage.setItem('artizan_user', JSON.stringify(data.user));
    }
    return { ok: res.ok, status: res.status, data };
  },

  async logout() {
    await apiFetch('/auth/logout/', {
      method: 'POST',
      body: JSON.stringify({ refresh: TokenStore.refresh }),
    });
    TokenStore.clear();
    localStorage.removeItem('artizan_role');
    localStorage.removeItem('artizan_user');
  },

  async register(payload) {
    const res = await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  // ── ARTISAN DISCOVERY
  async discoverArtisans(params = {}) {
    // params: { lat, lng, radius_km, skill_category, page }
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch('/artisans/discover/?' + qs);
    if (!res || !res.ok) return null;
    return res.json();
  },

  async getArtisanProfile(artisanId) {
    const res = await apiFetch(`/artisans/${artisanId}/`);
    if (!res || !res.ok) return null;
    return res.json();
  },

  async updateArtisanProfile(payload) {
    const res = await apiFetch('/artisans/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── KYC
  async uploadKYC(file, docType) {
    const form = new FormData();
    form.append('id_document', file);
    form.append('doc_type', docType);
    const res = await apiFetch('/artisans/kyc/', {
      method: 'POST',
      headers: {}, // let browser set multipart boundary
      body: form,
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── PORTFOLIO
  async uploadPortfolioPhoto(file, caption) {
    const form = new FormData();
    form.append('image', file);
    form.append('caption', caption);
    const res = await apiFetch('/artisans/portfolio/', {
      method: 'POST',
      headers: {},
      body: form,
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  async deletePortfolioPhoto(photoId) {
    const res = await apiFetch(`/artisans/portfolio/${photoId}/`, { method: 'DELETE' });
    return res && res.ok;
  },

  // ── AVAILABILITY
  async getAvailability() {
    const res = await apiFetch('/artisans/me/availability/');
    if (!res || !res.ok) return null;
    return res.json();
  },

  async setAvailability(slots) {
    // slots: [{ day_of_week, start_time, end_time, is_active }]
    const res = await apiFetch('/artisans/me/availability/', {
      method: 'PUT',
      body: JSON.stringify({ slots }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  async toggleAvailable(isAvailable) {
    const res = await apiFetch('/artisans/me/toggle-available/', {
      method: 'POST',
      body: JSON.stringify({ is_available: isAvailable }),
    });
    if (!res) return null;
    return { ok: res.ok };
  },

  // ── BOOKINGS (shared)
  async getBookings(params = {}) {
    const qs = new URLSearchParams(params).toString();
    const res = await apiFetch('/bookings/?' + qs);
    if (!res || !res.ok) return null;
    return res.json();
  },

  async createBooking(payload) {
    const res = await apiFetch('/bookings/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    return { ok: res.ok, status: res.status, data: await res.json() };
  },

  async updateBookingStatus(bookingId, status) {
    const res = await apiFetch(`/bookings/${bookingId}/status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  async cancelBooking(bookingId) {
    return this.updateBookingStatus(bookingId, 'cancelled');
  },

  // ── PAYMENTS
  async initiatePayment(bookingId) {
    const res = await apiFetch('/payments/initiate/', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  async confirmPayment(reference) {
    const res = await apiFetch('/payments/confirm/', {
      method: 'POST',
      body: JSON.stringify({ reference }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  async releasePayment(bookingId) {
    const res = await apiFetch('/payments/release/', {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId }),
    });
    if (!res) return null;
    return { ok: res.ok };
  },

  async requestWithdrawal(amount) {
    const res = await apiFetch('/payments/withdraw/', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── MESSAGES
  async getMessages(bookingId) {
    const res = await apiFetch(`/chat/${bookingId}/messages/`);
    if (!res || !res.ok) return null;
    return res.json();
  },

  async sendMessage(bookingId, content) {
    const res = await apiFetch(`/chat/${bookingId}/messages/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── REVIEWS
  async submitReview(bookingId, score, comment) {
    const res = await apiFetch('/reviews/', {
      method: 'POST',
      body: JSON.stringify({ booking: bookingId, score, comment }),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── CUSTOMER PROFILE
  async getCustomerProfile() {
    const res = await apiFetch('/customers/me/');
    if (!res || !res.ok) return null;
    return res.json();
  },

  async updateCustomerProfile(payload) {
    const res = await apiFetch('/customers/me/', {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!res) return null;
    return { ok: res.ok, data: await res.json() };
  },

  // ── NOTIFICATIONS
  async getNotifications() {
    const res = await apiFetch('/notifications/');
    if (!res || !res.ok) return null;
    return res.json();
  },

  async markNotificationsRead() {
    const res = await apiFetch('/notifications/mark-read/', { method: 'POST' });
    return res && res.ok;
  },

  // ── SKILL CATEGORIES
  async getSkillCategories() {
    const res = await apiFetch('/skill-categories/');
    if (!res || !res.ok) return null;
    return res.json();
  },

  // ── HELPERS
  getStoredUser() {
    const raw = localStorage.getItem('artizan_user');
    try { return raw ? JSON.parse(raw) : null; } catch (_) { return null; }
  },

  getStoredRole() {
    return localStorage.getItem('artizan_role') || null;
  },

  isLoggedIn() {
    return !!TokenStore.access;
  },
};

// ── NETWORK ERROR TOAST
// Shown on any page when a fetch() call fails completely (no connection / server down)
// Uses the dashboard toast system if present, otherwise renders its own minimal toast
let _networkToastDebounce = null;
function _showNetworkToast() {
  // Debounce — don't spam if multiple requests fail at once
  if (_networkToastDebounce) return;
  _networkToastDebounce = setTimeout(() => { _networkToastDebounce = null; }, 5000);

  // Use dashboard showToast if available
  if (typeof showToast === 'function') {
    showToast('No connection — check your network and try again.', 'fa-wifi');
    return;
  }

  // Fallback: inject a self-contained toast
  let wrap = document.getElementById('api-toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.id = 'api-toast-wrap';
    wrap.style.cssText = `
      position:fixed;bottom:24px;left:50%;transform:translateX(-50%);
      z-index:9999;display:flex;flex-direction:column;gap:8px;
      pointer-events:none;width:max-content;max-width:calc(100vw - 32px)
    `;
    document.body.appendChild(wrap);
  }

  const toast = document.createElement('div');
  toast.style.cssText = `
    display:flex;align-items:center;gap:10px;
    padding:12px 18px;border-radius:12px;
    background:#1F2937;color:#F9FAFB;
    font-size:13px;font-weight:500;font-family:inherit;
    box-shadow:0 4px 20px rgba(0,0,0,0.25);
    border-left:3px solid #EF9F27;
    animation:toastIn 0.25s ease;
    pointer-events:auto;
  `;
  toast.innerHTML = `
    <i class="fa fa-wifi" style="color:#EF9F27;font-size:14px"></i>
    <span>No connection — check your network and try again.</span>
  `;

  // Inject minimal keyframe if not already present
  if (!document.getElementById('api-toast-style')) {
    const style = document.createElement('style');
    style.id = 'api-toast-style';
    style.textContent = `@keyframes toastIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style);
  }

  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 5000);
}

// Expose globally
window.ArtizanAPI = API;
