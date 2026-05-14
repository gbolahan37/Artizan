/* ══════════════════════════════════════════
   ARTIZAN — PAYSTACK HELPER
   assets/js/paystack.js
   Wrapper around Paystack Popup JS SDK
   for escrow payment initiation and
   webhook-based verification flow.

   USAGE:
     PaystackHelper.pay({
       email:      'customer@email.com',
       amount:     650000,           // in kobo (₦6,500 = 650000)
       reference:  'artizan_b1_...',
       metadata:   { booking_id, artisan_id },
       onSuccess:  (ref) => { ... },
       onCancel:   ()    => { ... },
     });
══════════════════════════════════════════ */

'use strict';

const PaystackHelper = (() => {

  /* ── CONFIG
     Replace PUBLIC_KEY with your Paystack test/live public key.
     Store it in a meta tag to avoid hardcoding:
       <meta name="paystack-pk" content="pk_test_xxxx">
  */
  const PUBLIC_KEY = (() => {
    const meta = document.querySelector('meta[name="paystack-pk"]');
    return meta ? meta.getAttribute('content') : 'pk_test_REPLACE_WITH_YOUR_KEY';
  })();

  /* ── GENERATE REFERENCE
     Format: artizan_<booking_id_prefix>_<timestamp>
  */
  function generateReference(bookingId) {
    const prefix = String(bookingId).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12);
    const ts = Date.now().toString(36).toUpperCase();
    return `artizan_${prefix}_${ts}`;
  }

  /* ── LOAD PAYSTACK SCRIPT LAZILY ── */
  function loadScript() {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload  = resolve;
      script.onerror = () => reject(new Error('Failed to load Paystack SDK'));
      document.head.appendChild(script);
    });
  }

  /* ── MAIN PAY FUNCTION ── */
  async function pay({
    email,
    amount,        // amount in NAIRA (not kobo) — converted internally
    bookingId,
    reference,
    metadata = {},
    onSuccess,
    onCancel,
  }) {
    await loadScript();

    const ref = reference || generateReference(bookingId || 'booking');
    const amountKobo = Math.round(amount * 100);  // Paystack uses kobo

    const handler = window.PaystackPop.setup({
      key:       PUBLIC_KEY,
      email,
      amount:    amountKobo,
      currency:  'NGN',
      ref,
      metadata: {
        custom_fields: [
          { display_name: 'Platform', variable_name: 'platform', value: 'Artizan' },
          { display_name: 'Booking ID', variable_name: 'booking_id', value: bookingId || '' },
          ...Object.entries(metadata).map(([k, v]) => ({
            display_name: k.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
            variable_name: k,
            value: String(v),
          })),
        ],
      },
      callback(response) {
        // Called by Paystack when payment is completed in popup
        // response.reference is the transaction reference
        if (typeof onSuccess === 'function') {
          onSuccess(response.reference);
        }
      },
      onClose() {
        // Called when popup is closed without completing payment
        if (typeof onCancel === 'function') {
          onCancel();
        }
      },
    });

    handler.openIframe();
    return ref;
  }

  /* ── VERIFY REFERENCE (calls backend, which calls Paystack server-side) ── */
  async function verify(reference) {
    if (!window.ArtizanAPI) {
      console.error('ArtizanAPI not loaded. Include api.js before paystack.js.');
      return false;
    }
    const result = await window.ArtizanAPI.confirmPayment(reference);
    return result && result.ok;
  }

  /* ── FULL BOOKING PAYMENT FLOW ── */
  async function payForBooking({
    booking,          // { id, total_amount_ngn }
    customerEmail,
    onComplete,       // called with { success: bool, reference }
  }) {
    try {
      const ref = await pay({
        email:     customerEmail,
        amount:    booking.total_amount_ngn,
        bookingId: booking.id,
        metadata:  { booking_id: booking.id },
        onSuccess: async (reference) => {
          // Verify with backend (which also triggers Termii SMS to artisan)
          const verified = await verify(reference);
          if (typeof onComplete === 'function') {
            onComplete({ success: verified, reference });
          }
        },
        onCancel: () => {
          if (typeof onComplete === 'function') {
            onComplete({ success: false, reference: null });
          }
        },
      });
      return ref;
    } catch (err) {
      console.error('Paystack error:', err);
      if (typeof onComplete === 'function') {
        onComplete({ success: false, reference: null, error: err.message });
      }
      return null;
    }
  }

  return { pay, verify, payForBooking, generateReference };
})();

window.PaystackHelper = PaystackHelper;
