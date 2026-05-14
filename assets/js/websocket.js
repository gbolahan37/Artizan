/* ══════════════════════════════════════════
   ARTIZAN — WEBSOCKET CHAT CLIENT
   assets/js/websocket.js

   Manages a WebSocket connection to the
   Django Channels backend for real-time
   in-app messaging between customers and
   artisans.

   NOTE: Per Chapter 1.4 (Limitations), the
   current implementation uses a polling
   fallback (every 3 seconds) when
   WebSocket is unavailable. The WebSocket
   path matches the Django Channels routing:
     ws/chat/<booking_id>/

   USAGE:
     const chat = new ArtizanChat({
       bookingId: 'uuid-...',
       token:     'jwt-access-token',
       onMessage: (msg) => { ... },
       onStatus:  (status) => { ... },
     });
     chat.connect();
     chat.send('Hello!');
     chat.disconnect();
══════════════════════════════════════════ */

'use strict';

class ArtizanChat {
  constructor({ bookingId, token, onMessage, onStatus }) {
    this.bookingId   = bookingId;
    this.token       = token;
    this.onMessage   = onMessage  || (() => {});
    this.onStatus    = onStatus   || (() => {});

    this._ws         = null;
    this._pollTimer  = null;
    this._lastMsgId  = null;
    this._connected  = false;

    // WS URL: wss in production, ws in development
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    const host     = location.host;
    this._wsUrl    = `${protocol}://${host}/ws/chat/${this.bookingId}/?token=${this.token}`;

    // Polling fallback URL
    this._pollUrl  = `/api/v1/chat/${this.bookingId}/messages/`;
  }

  // ── CONNECT
  connect() {
    // Try WebSocket first
    if ('WebSocket' in window) {
      this._connectWS();
    } else {
      this._startPolling();
    }
  }

  _connectWS() {
    this.onStatus('connecting');
    try {
      this._ws = new WebSocket(this._wsUrl);

      this._ws.onopen = () => {
        this._connected = true;
        this.onStatus('connected');
        if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
      };

      this._ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this._lastMsgId = msg.id || this._lastMsgId;
          this.onMessage(msg);
        } catch (_) {}
      };

      this._ws.onerror = () => {
        // WebSocket unavailable — fall back to polling
        this._startPolling();
      };

      this._ws.onclose = (event) => {
        this._connected = false;
        this.onStatus('disconnected');
        // Auto-reconnect unless deliberately closed
        if (event.code !== 1000) {
          setTimeout(() => this.connect(), 3000);
        }
      };
    } catch (_) {
      this._startPolling();
    }
  }

  // ── POLLING FALLBACK (3 second interval)
  _startPolling() {
    this.onStatus('polling');
    if (this._pollTimer) return;
    this._fetchMessages();
    this._pollTimer = setInterval(() => this._fetchMessages(), 3000);
  }

  async _fetchMessages() {
    const token = this.token || (window.ArtizanAPI ? localStorage.getItem('artizan_access') : null);
    if (!token) return;

    const qs  = this._lastMsgId ? `?after=${this._lastMsgId}` : '';
    try {
      const res = await fetch(this._pollUrl + qs, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      const messages = Array.isArray(data) ? data : (data.results || []);
      messages.forEach(msg => {
        this._lastMsgId = msg.id;
        this.onMessage(msg);
      });
    } catch (_) {}
  }

  // ── SEND MESSAGE
  async send(content) {
    if (!content || !content.trim()) return false;

    // Prefer WebSocket if connected
    if (this._ws && this._ws.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'chat.message', content }));
      return true;
    }

    // Fallback: HTTP POST
    const token = this.token || localStorage.getItem('artizan_access');
    if (!token) return false;
    try {
      const res = await fetch(this._pollUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  // ── DISCONNECT
  disconnect() {
    if (this._pollTimer) { clearInterval(this._pollTimer); this._pollTimer = null; }
    if (this._ws) {
      this._ws.close(1000, 'Client disconnected');
      this._ws = null;
    }
    this._connected = false;
    this.onStatus('disconnected');
  }

  get isConnected() { return this._connected; }
}

/* ── SIMPLE CHAT MANAGER
   Manages multiple simultaneous booking chats
   (e.g. artisan dashboard has several conversations)
*/
class ArtizanChatManager {
  constructor() {
    this._chats = new Map();
  }

  open(bookingId, { token, onMessage, onStatus } = {}) {
    if (this._chats.has(bookingId)) return this._chats.get(bookingId);
    const chat = new ArtizanChat({ bookingId, token, onMessage, onStatus });
    chat.connect();
    this._chats.set(bookingId, chat);
    return chat;
  }

  close(bookingId) {
    const chat = this._chats.get(bookingId);
    if (chat) { chat.disconnect(); this._chats.delete(bookingId); }
  }

  closeAll() {
    this._chats.forEach(c => c.disconnect());
    this._chats.clear();
  }

  get(bookingId) {
    return this._chats.get(bookingId) || null;
  }
}

window.ArtizanChat        = ArtizanChat;
window.ArtizanChatManager = ArtizanChatManager;
