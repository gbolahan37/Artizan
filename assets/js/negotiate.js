/* ══════════════════════════════════════════
   ARTIZAN — PRICE NEGOTIATION MODULE
   assets/js/negotiate.js

   Handles the full negotiate-before-pay
   flow between customer and artisan.

   BOOKING STATUS LIFECYCLE:
     pending        → artisan received the request
     negotiating    → artisan sent a counter-offer
     offer_accepted → customer accepted the offer
     confirmed      → payment made, escrow active
     in_progress    → artisan started the job
     completed      → job done, payment released
     cancelled      → either side cancelled

   FLOW:
     [Customer submits booking]
         ↓
     STATUS: pending
         ↓
     [Artisan reviews → clicks "Negotiate"]
         ↓
     STATUS: negotiating  (artisan sets counter-price + note)
         ↓
     [Customer sees offer → Accept or Counter]
         ↓  Accept                  ↓ Counter
     STATUS: offer_accepted     STATUS: negotiating
         ↓                          ↓ (artisan reviews again)
     [Customer proceeds to Paystack escrow]
         ↓
     STATUS: confirmed

   USAGE:
     Include negotiate.js AFTER api.js on both dashboard pages:
       <script src="assets/js/api.js"></script>
       <script src="assets/js/negotiate.js"></script>
       <script src="assets/js/artisan-dashboard.js"></script>

     Then call the public methods:
       NegotiationModule.openArtisanModal(job, onUpdate)
       NegotiationModule.openCustomerModal(booking, onUpdate)
══════════════════════════════════════════ */

'use strict';

const NegotiationModule = (() => {

  /* ══════════════════════════════════════
     INTERNAL STATE
  ══════════════════════════════════════ */
  let _onUpdate = null; // callback to re-render the dashboard after a change

  /* ══════════════════════════════════════
     API CALLS (wired to ArtizanAPI)
     Falls back to local state update for demo
  ══════════════════════════════════════ */
  async function apiSendOffer(bookingId, payload) {
    if (window.ArtizanAPI) {
      return window.ArtizanAPI.sendNegotiationOffer(bookingId, payload);
    }
    // Demo fallback — just resolve successfully
    return { ok: true };
  }

  async function apiAcceptOffer(bookingId) {
    if (window.ArtizanAPI) {
      return window.ArtizanAPI.acceptNegotiationOffer(bookingId);
    }
    return { ok: true };
  }

  async function apiDeclineBooking(bookingId) {
    if (window.ArtizanAPI) {
      return window.ArtizanAPI.updateBookingStatus(bookingId, 'cancelled');
    }
    return { ok: true };
  }

  /* ══════════════════════════════════════
     MODAL HELPERS
  ══════════════════════════════════════ */
  function _createModal(id, html) {
    // Remove any existing instance of this modal
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const wrap = document.createElement('div');
    wrap.innerHTML = html;
    const modal = wrap.firstElementChild;
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
      if (e.target === modal) _closeModal(id);
    });

    // Animate in
    requestAnimationFrame(() => modal.classList.add('neg-modal-visible'));
    return modal;
  }

  function _closeModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.classList.remove('neg-modal-visible');
    setTimeout(() => modal.remove(), 250);
  }

  function _fmt(n) {
    return Number(n).toLocaleString('en-NG');
  }

  function _renderHistory(history) {
    if (!history || !history.length) return '';
    return `
      <div class="neg-history">
        <p class="neg-history-label">Negotiation history</p>
        ${history.map(h => `
          <div class="neg-history-item neg-from-${h.from}">
            <span class="neg-hi-who">${h.from === 'artisan' ? 'Artisan' : 'You'}</span>
            <span class="neg-hi-amount">₦${_fmt(h.amount)}</span>
            ${h.note ? `<span class="neg-hi-note">${h.note}</span>` : ''}
            <span class="neg-hi-time">${h.time}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ══════════════════════════════════════
     ARTISAN-SIDE MODAL
     Called from artisan-dashboard.js
     when artisan clicks "Review & Negotiate"
  ══════════════════════════════════════ */
  function openArtisanModal(job, onUpdate) {
    _onUpdate = onUpdate;
    const isCounter = job.status === 'negotiating' && job.lastOfferFrom === 'customer';

    const html = `
      <div class="neg-backdrop" id="neg-artisan-modal">
        <div class="neg-box">
          <button class="neg-close" onclick="NegotiationModule.closeArtisanModal()">
            <i class="fa fa-xmark"></i>
          </button>

          <!-- Header -->
          <div class="neg-header">
            <div class="neg-avatar" style="background:linear-gradient(135deg,${job.gradient[0]},${job.gradient[1]})">${job.initial}</div>
            <div class="neg-header-info">
              <p class="neg-customer-name">${job.customer}</p>
              <p class="neg-job-title">${job.job}</p>
              <p class="neg-address"><i class="fa fa-location-dot"></i> ${job.address}</p>
            </div>
          </div>

          <!-- Job detail card -->
          <div class="neg-detail-card">
            <div class="neg-detail-row">
              <span class="neg-detail-label"><i class="fa fa-calendar"></i> Requested date</span>
              <span class="neg-detail-val">${job.date}</span>
            </div>
            <div class="neg-detail-row">
              <span class="neg-detail-label"><i class="fa fa-naira-sign"></i> Customer's budget</span>
              <span class="neg-detail-val neg-original-price">₦${_fmt(job.amount)}</span>
            </div>
            ${job.customerNote ? `
            <div class="neg-detail-row neg-detail-note">
              <span class="neg-detail-label"><i class="fa fa-comment"></i> Customer's note</span>
              <span class="neg-detail-val">${job.customerNote}</span>
            </div>` : ''}
          </div>

          ${_renderHistory(job.negotiationHistory)}

          <!-- Action area -->
          <div class="neg-section-title">${isCounter ? 'Customer countered — your response' : 'Set your price'}</div>

          <div class="neg-amount-input-wrap">
            <span class="neg-currency-prefix"><i class="fa fa-naira-sign"></i></span>
            <input
              type="number"
              id="neg-artisan-amount"
              class="neg-amount-input"
              placeholder="Enter your price"
              value="${job.counterAmount || job.amount}"
              min="500"
            />
          </div>

          <div class="neg-note-wrap">
            <label class="neg-note-label">Add a note to the customer <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
            <textarea
              id="neg-artisan-note"
              class="neg-note-input"
              rows="2"
              placeholder="e.g. This price includes materials and labour. I can be there by 9am."
            ></textarea>
          </div>

          <div class="neg-error" id="neg-artisan-error"></div>

          <div class="neg-actions">
            <button class="neg-btn neg-btn-accept" onclick="NegotiationModule._artisanAccept('${job.id}')">
              <i class="fa fa-check"></i>
              ${isCounter ? 'Accept customer price' : 'Accept as is'}
            </button>
            <button class="neg-btn neg-btn-negotiate" onclick="NegotiationModule._artisanSendOffer('${job.id}')">
              <i class="fa fa-arrows-rotate"></i>
              Send counter-offer
            </button>
            <button class="neg-btn neg-btn-decline" onclick="NegotiationModule._artisanDecline('${job.id}')">
              <i class="fa fa-xmark"></i> Decline job
            </button>
          </div>

          <p class="neg-footer-note">
            <i class="fa fa-lock"></i>
            Escrow payment is only triggered after the customer accepts the final agreed price.
          </p>
        </div>
      </div>
    `;

    _createModal('neg-artisan-modal', html);
  }

  /* ══════════════════════════════════════
     ARTISAN MODAL ACTIONS
  ══════════════════════════════════════ */
  async function _artisanAccept(jobId) {
    // Artisan accepts the customer's original budget — move to offer_accepted
    const jobs = window._artizanJobs || [];
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      job.status = 'offer_accepted';
      job.agreedAmount = job.amount;
      job.negotiationHistory = job.negotiationHistory || [];
      job.negotiationHistory.push({
        from: 'artisan', amount: job.amount,
        note: 'Artisan accepted the original price.',
        time: 'Just now',
      });
    }
    await apiAcceptOffer(jobId);
    _closeModal('neg-artisan-modal');
    _showToast('You accepted the customer\'s price. Waiting for payment.', 'fa-circle-check', 'green');
    if (_onUpdate) _onUpdate();
  }

  async function _artisanSendOffer(jobId) {
    const amountInput = document.getElementById('neg-artisan-amount');
    const noteInput   = document.getElementById('neg-artisan-note');
    const errorEl     = document.getElementById('neg-artisan-error');

    const amount = parseFloat(amountInput?.value);
    if (!amount || amount < 500) {
      errorEl.textContent = 'Please enter a valid amount (minimum ₦500).';
      return;
    }
    errorEl.textContent = '';

    const note   = noteInput?.value?.trim() || '';
    const jobs   = window._artizanJobs || [];
    const job    = jobs.find(j => j.id === jobId);

    if (job) {
      job.status        = 'negotiating';
      job.counterAmount = amount;
      job.lastOfferFrom = 'artisan';
      job.negotiationHistory = job.negotiationHistory || [];
      job.negotiationHistory.push({
        from: 'artisan', amount, note, time: 'Just now',
      });
    }

    await apiSendOffer(jobId, { amount, note, from: 'artisan' });
    _closeModal('neg-artisan-modal');
    _showToast(`Counter-offer of ₦${_fmt(amount)} sent to customer.`, 'fa-arrows-rotate', 'purple');
    if (_onUpdate) _onUpdate();
  }

  async function _artisanDecline(jobId) {
    const jobs = window._artizanJobs || [];
    const job  = jobs.find(j => j.id === jobId);
    if (job) job.status = 'cancelled';

    await apiDeclineBooking(jobId);
    _closeModal('neg-artisan-modal');
    _showToast('Job request declined.', 'fa-circle-xmark', 'red');
    if (_onUpdate) _onUpdate();
  }

  function closeArtisanModal() {
    _closeModal('neg-artisan-modal');
  }

  /* ══════════════════════════════════════
     CUSTOMER-SIDE MODAL
     Called from customer-dashboard.js
     when customer sees a negotiating booking
  ══════════════════════════════════════ */
  function openCustomerModal(booking, onUpdate) {
    _onUpdate = onUpdate;

    const agreedAmount  = booking.counterAmount || booking.amount;
    const originalAmount = booking.amount;
    const priceDiff     = agreedAmount - originalAmount;
    const diffSign      = priceDiff >= 0 ? '+' : '';
    const diffColor     = priceDiff > 0 ? '#DC2626' : '#059669';
    const artisanNote   = booking.negotiationHistory?.slice(-1)[0]?.note || '';

    const html = `
      <div class="neg-backdrop" id="neg-customer-modal">
        <div class="neg-box">
          <button class="neg-close" onclick="NegotiationModule.closeCustomerModal()">
            <i class="fa fa-xmark"></i>
          </button>

          <!-- Header -->
          <div class="neg-header">
            <div class="neg-avatar" style="background:linear-gradient(135deg,${booking.gradient[0]},${booking.gradient[1]})">${booking.initial}</div>
            <div class="neg-header-info">
              <p class="neg-customer-name">${booking.artisan}</p>
              <p class="neg-job-title">${booking.job}</p>
            </div>
          </div>

          <!-- Offer breakdown -->
          <div class="neg-offer-banner">
            <div class="neg-offer-badge"><i class="fa fa-tag"></i> New price offer</div>
            <div class="neg-offer-amounts">
              <div class="neg-offer-original">
                <span class="neg-offer-label">Your budget</span>
                <span class="neg-offer-num neg-strikethrough">₦${_fmt(originalAmount)}</span>
              </div>
              <div class="neg-offer-arrow"><i class="fa fa-arrow-right"></i></div>
              <div class="neg-offer-new">
                <span class="neg-offer-label">Artisan's offer</span>
                <span class="neg-offer-num neg-offer-highlight">₦${_fmt(agreedAmount)}</span>
              </div>
            </div>
            ${priceDiff !== 0 ? `
            <p class="neg-offer-diff" style="color:${diffColor}">
              ${diffSign}₦${_fmt(Math.abs(priceDiff))} ${priceDiff > 0 ? 'more than your budget' : 'below your budget'}
            </p>` : ''}
            ${artisanNote ? `
            <div class="neg-artisan-note-box">
              <i class="fa fa-comment" style="color:var(--brand-purple)"></i>
              <p>"${artisanNote}"</p>
            </div>` : ''}
          </div>

          ${_renderHistory(booking.negotiationHistory)}

          <!-- Counter option -->
          <div class="neg-counter-toggle-row">
            <button class="neg-counter-toggle" id="neg-counter-toggle-btn" onclick="NegotiationModule._toggleCounterInput()">
              <i class="fa fa-arrows-rotate"></i> Send a counter-offer instead
            </button>
          </div>

          <div class="neg-counter-wrap" id="neg-counter-wrap" style="display:none">
            <div class="neg-amount-input-wrap">
              <span class="neg-currency-prefix"><i class="fa fa-naira-sign"></i></span>
              <input
                type="number"
                id="neg-customer-amount"
                class="neg-amount-input"
                placeholder="Your counter-offer"
                value="${originalAmount}"
                min="500"
              />
            </div>
            <div class="neg-note-wrap">
              <label class="neg-note-label">Add a note <span style="font-weight:400;color:var(--text-muted)">(optional)</span></label>
              <textarea
                id="neg-customer-note"
                class="neg-note-input"
                rows="2"
                placeholder="e.g. I can meet you halfway at ₦7,500."
              ></textarea>
            </div>
          </div>

          <div class="neg-error" id="neg-customer-error"></div>

          <div class="neg-actions">
            <button class="neg-btn neg-btn-accept neg-btn-pay" onclick="NegotiationModule._customerAccept('${booking.id}', ${agreedAmount})">
              <i class="fa fa-lock"></i>
              Accept & Pay ₦${_fmt(agreedAmount)}
            </button>
            <button class="neg-btn neg-btn-negotiate" id="neg-send-counter-btn" onclick="NegotiationModule._customerCounter('${booking.id}')" style="display:none">
              <i class="fa fa-paper-plane"></i>
              Send counter-offer
            </button>
            <button class="neg-btn neg-btn-decline" onclick="NegotiationModule._customerDecline('${booking.id}')">
              <i class="fa fa-xmark"></i> Cancel booking
            </button>
          </div>

          <p class="neg-footer-note">
            <i class="fa fa-lock"></i>
            Accepting will open the secure Paystack payment page. Your money is held in escrow until the job is done.
          </p>
        </div>
      </div>
    `;

    _createModal('neg-customer-modal', html);
  }

  /* ══════════════════════════════════════
     CUSTOMER MODAL ACTIONS
  ══════════════════════════════════════ */
  function _toggleCounterInput() {
    const wrap    = document.getElementById('neg-counter-wrap');
    const sendBtn = document.getElementById('neg-send-counter-btn');
    const togBtn  = document.getElementById('neg-counter-toggle-btn');
    const isOpen  = wrap.style.display !== 'none';

    wrap.style.display    = isOpen ? 'none' : 'block';
    sendBtn.style.display = isOpen ? 'none' : 'inline-flex';
    togBtn.innerHTML = isOpen
      ? '<i class="fa fa-arrows-rotate"></i> Send a counter-offer instead'
      : '<i class="fa fa-chevron-up"></i> Hide counter-offer';
  }

  async function _customerAccept(bookingId, agreedAmount) {
    const bookings = window._customerBookings || [];
    const booking  = bookings.find(b => b.id === bookingId);

    if (booking) {
      booking.status       = 'offer_accepted';
      booking.agreedAmount = agreedAmount;
      booking.amount       = agreedAmount;
    }

    await apiAcceptOffer(bookingId);
    _closeModal('neg-customer-modal');

    // Trigger Paystack payment
    if (window.PaystackHelper) {
      const user  = window.ArtizanAPI?.getStoredUser?.() || { email: 'customer@artizan.ng' };
      PaystackHelper.payForBooking({
        booking:       { id: bookingId, total_amount_ngn: agreedAmount },
        customerEmail: user.email,
        onComplete:    ({ success, reference }) => {
          if (success) {
            if (booking) booking.status = 'confirmed';
            _showToast('Payment successful! Booking confirmed. The artisan has been notified.', 'fa-circle-check', 'green');
          } else {
            _showToast('Payment was not completed. You can try again from your bookings.', 'fa-triangle-exclamation', 'red');
          }
          if (_onUpdate) _onUpdate();
        },
      });
    } else {
      // Demo mode — no Paystack loaded
      if (booking) booking.status = 'confirmed';
      _showToast('Offer accepted! In production this opens the Paystack payment page.', 'fa-circle-check', 'green');
      if (_onUpdate) _onUpdate();
    }
  }

  async function _customerCounter(bookingId) {
    const amountInput = document.getElementById('neg-customer-amount');
    const noteInput   = document.getElementById('neg-customer-note');
    const errorEl     = document.getElementById('neg-customer-error');

    const amount = parseFloat(amountInput?.value);
    if (!amount || amount < 500) {
      errorEl.textContent = 'Please enter a valid counter-offer (minimum ₦500).';
      return;
    }
    errorEl.textContent = '';

    const note     = noteInput?.value?.trim() || '';
    const bookings = window._customerBookings || [];
    const booking  = bookings.find(b => b.id === bookingId);

    if (booking) {
      booking.status        = 'negotiating';
      booking.counterAmount = amount;
      booking.lastOfferFrom = 'customer';
      booking.negotiationHistory = booking.negotiationHistory || [];
      booking.negotiationHistory.push({
        from: 'customer', amount, note, time: 'Just now',
      });
    }

    await apiSendOffer(bookingId, { amount, note, from: 'customer' });
    _closeModal('neg-customer-modal');
    _showToast(`Counter-offer of ₦${_fmt(amount)} sent to the artisan.`, 'fa-arrows-rotate', 'purple');
    if (_onUpdate) _onUpdate();
  }

  async function _customerDecline(bookingId) {
    const bookings = window._customerBookings || [];
    const booking  = bookings.find(b => b.id === bookingId);
    if (booking) booking.status = 'cancelled';

    await apiDeclineBooking(bookingId);
    _closeModal('neg-customer-modal');
    _showToast('Booking cancelled.', 'fa-circle-xmark', 'red');
    if (_onUpdate) _onUpdate();
  }

  function closeCustomerModal() {
    _closeModal('neg-customer-modal');
  }

  /* ══════════════════════════════════════
     SHARED TOAST HELPER
     (works even if the dashboard's own
      showToast hasn't loaded yet)
  ══════════════════════════════════════ */
  function _showToast(msg, icon, type) {
    // Prefer the dashboard's own showToast if available
    if (typeof showToast === 'function') {
      showToast(msg, icon);
      return;
    }
    let wrap = document.getElementById('toast-wrap');
    if (!wrap) {
      wrap = document.createElement('div');
      wrap.id = 'toast-wrap';
      wrap.className = 'toast-wrap';
      document.body.appendChild(wrap);
    }
    const colors = { green: '#059669', purple: '#4F46E5', red: '#DC2626' };
    const item = document.createElement('div');
    item.className = 'toast-item';
    item.style.borderLeft = `3px solid ${colors[type] || colors.green}`;
    item.innerHTML = `<i class="fa ${icon}" style="color:${colors[type] || colors.green}"></i><span>${msg}</span>`;
    wrap.appendChild(item);
    setTimeout(() => item.remove(), 4500);
  }

  /* ══════════════════════════════════════
     STATUS LABEL HELPER
     (shared utility for both dashboards)
  ══════════════════════════════════════ */
  function statusLabel(status) {
    const map = {
      pending:        'Pending',
      negotiating:    'Negotiating',
      offer_accepted: 'Price Agreed',
      confirmed:      'Confirmed',
      in_progress:    'In Progress',
      completed:      'Completed',
      cancelled:      'Cancelled',
      disputed:       'Disputed',
    };
    return map[status] || status;
  }

  function statusClass(status) {
    const map = {
      pending:        'status-pending',
      negotiating:    'status-negotiating',
      offer_accepted: 'status-offer-accepted',
      confirmed:      'status-confirmed',
      in_progress:    'status-in_progress',
      completed:      'status-completed',
      cancelled:      'status-cancelled',
      disputed:       'status-disputed',
    };
    return map[status] || 'status-pending';
  }

  /* ══════════════════════════════════════
     PUBLIC API
  ══════════════════════════════════════ */
  return {
    openArtisanModal,
    openCustomerModal,
    closeArtisanModal,
    closeCustomerModal,
    statusLabel,
    statusClass,
    // Expose internal action handlers so inline onclick attributes work
    _artisanAccept,
    _artisanSendOffer,
    _artisanDecline,
    _customerAccept,
    _customerCounter,
    _customerDecline,
    _toggleCounterInput,
  };

})();

window.NegotiationModule = NegotiationModule;
