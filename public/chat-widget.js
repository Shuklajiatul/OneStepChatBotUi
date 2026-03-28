(function () {
    'use strict';

    // ─── Configuration ────
    const CONFIG = Object.assign(
        {
            flowId: '',
            serverUrl: '',
            title: 'Chat with us',
            subtitle: 'We typically reply instantly',
            primaryColor: '#e85d04',
            position: 'bottom-right',
            greeting: 'Hi there! 👋 How can we help you today?',
        },
        window.ChatWidgetConfig || {}
    );

    if (!CONFIG.flowId || !CONFIG.serverUrl) {
        console.error('[ChatWidget] flowId and serverUrl are required in window.ChatWidgetConfig');
        return;
    }

    // Normalize serverUrl — remove trailing slash
    CONFIG.serverUrl = CONFIG.serverUrl.replace(/\/+$/, '');

    // ─── State ───
    let isOpen = false;
    let sessionId = null;
    let messages = [];
    let isLoading = false;
    let isSessionStarting = false;

    // ─── Styles ───────────────────────────────────────────────────
    const WIDGET_STYLES = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

    :host {
      all: initial;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .cw-container {
      position: fixed;
      ${CONFIG.position === 'bottom-left' ? 'left: 24px;' : 'right: 24px;'}
      bottom: 24px;
      z-index: 2147483647;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    /* ── Floating Button ── */
    .cw-fab {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor};
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }
    .cw-fab:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.15);
    }
    .cw-fab:active { transform: scale(0.95); }

    .cw-fab svg {
      width: 28px;
      height: 28px;
      fill: white;
      transition: transform 0.3s ease, opacity 0.2s ease;
    }
    .cw-fab .cw-icon-close { position: absolute; }
    .cw-fab.open .cw-icon-chat { transform: rotate(90deg); opacity: 0; }
    .cw-fab.open .cw-icon-close { transform: rotate(0deg); opacity: 1; }
    .cw-fab:not(.open) .cw-icon-close { transform: rotate(-90deg); opacity: 0; }

    /* Pulse ring on fab */
    .cw-fab::after {
      content: '';
      position: absolute;
      inset: -4px;
      border-radius: 50%;
      border: 2px solid ${CONFIG.primaryColor};
      opacity: 0;
      animation: cw-pulse 2s ease-out infinite;
    }
    .cw-fab.open::after { animation: none; opacity: 0; }

    @keyframes cw-pulse {
      0% { transform: scale(1); opacity: 0.5; }
      100% { transform: scale(1.35); opacity: 0; }
    }

    /* ── Chat Window ── */
    .cw-window {
      position: absolute;
      ${CONFIG.position === 'bottom-left' ? 'left: 0;' : 'right: 0;'}
      bottom: 76px;
      width: 380px;
      height: 540px;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 12px 48px rgba(0,0,0,0.15), 0 4px 16px rgba(0,0,0,0.08);
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: scale(0.85) translateY(20px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
      transform-origin: bottom ${CONFIG.position === 'bottom-left' ? 'left' : 'right'};
    }
    .cw-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Header ── */
    .cw-header {
      background: ${CONFIG.primaryColor};
      color: white;
      padding: 18px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }
    .cw-header-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: rgba(255,255,255,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .cw-header-avatar svg {
      width: 22px;
      height: 22px;
      fill: white;
    }
    .cw-header-info { flex: 1; }
    .cw-header-title {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }
    .cw-header-subtitle {
      font-size: 12px;
      opacity: 0.85;
      margin-top: 2px;
      font-weight: 400;
    }
    .cw-header-status {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11px;
      opacity: 0.9;
    }
    .cw-header-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #4ade80;
      animation: cw-dot-pulse 2s ease-in-out infinite;
    }
    @keyframes cw-dot-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    /* ── Messages Area ── */
    .cw-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f8f9fb;
      scroll-behavior: smooth;
    }
    .cw-messages::-webkit-scrollbar { width: 5px; }
    .cw-messages::-webkit-scrollbar-track { background: transparent; }
    .cw-messages::-webkit-scrollbar-thumb {
      background: rgba(0,0,0,0.15);
      border-radius: 10px;
    }

    /* ── Message Bubble ── */
    .cw-msg {
      display: flex;
      gap: 8px;
      max-width: 85%;
      animation: cw-msg-in 0.3s ease-out;
    }
    .cw-msg.bot { align-self: flex-start; }
    .cw-msg.user { align-self: flex-end; flex-direction: row-reverse; }

    @keyframes cw-msg-in {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .cw-msg-avatar {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      font-size: 12px;
      font-weight: 700;
    }
    .cw-msg.bot .cw-msg-avatar { background: ${CONFIG.primaryColor}15; color: ${CONFIG.primaryColor}; }
    .cw-msg.user .cw-msg-avatar { background: #e5e7ec; color: #6b7280; }

    .cw-msg-bubble {
      padding: 10px 14px;
      border-radius: 16px;
      font-size: 14px;
      line-height: 1.5;
      word-break: break-word;
    }
    .cw-msg.bot .cw-msg-bubble {
      background: #ffffff;
      color: #1f2937;
      border: 1px solid #e5e7eb;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .cw-msg.user .cw-msg-bubble {
      background: ${CONFIG.primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
    }

    .cw-msg-time {
      font-size: 10px;
      color: #9ca3af;
      margin-top: 4px;
      padding: 0 4px;
    }
    .cw-msg.user .cw-msg-time { text-align: right; }

    /* ── Typing Indicator ── */
    .cw-typing {
      display: flex;
      align-items: center;
      gap: 8px;
      align-self: flex-start;
      animation: cw-msg-in 0.3s ease-out;
    }
    .cw-typing-dots {
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      border-bottom-left-radius: 4px;
      padding: 12px 16px;
      display: flex;
      gap: 4px;
    }
    .cw-typing-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #9ca3af;
      animation: cw-bounce 1.4s infinite;
    }
    .cw-typing-dot:nth-child(2) { animation-delay: 0.2s; }
    .cw-typing-dot:nth-child(3) { animation-delay: 0.4s; }

    @keyframes cw-bounce {
      0%, 60%, 100% { transform: translateY(0); }
      30% { transform: translateY(-6px); }
    }

    /* ── Welcome Screen ── */
    .cw-welcome {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px 24px;
      text-align: center;
      background: linear-gradient(135deg, #f8f9fb 0%, #eff1f5 100%);
    }
    .cw-welcome-icon {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: ${CONFIG.primaryColor}12;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
    .cw-welcome-icon svg { width: 32px; height: 32px; fill: ${CONFIG.primaryColor}; }
    .cw-welcome-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin-bottom: 8px;
    }
    .cw-welcome-text {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 24px;
      line-height: 1.5;
    }
    .cw-welcome-btn {
      background: ${CONFIG.primaryColor};
      color: white;
      border: none;
      border-radius: 12px;
      padding: 12px 28px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      box-shadow: 0 4px 14px ${CONFIG.primaryColor}40;
    }
    .cw-welcome-btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 6px 20px ${CONFIG.primaryColor}50;
    }
    .cw-welcome-btn:active { transform: translateY(0); }

    /* ── Input Area ── */
    .cw-input-area {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 12px 16px;
      border-top: 1px solid #e5e7eb;
      background: #ffffff;
      flex-shrink: 0;
    }
    .cw-input {
      flex: 1;
      border: 1px solid #e5e7eb;
      border-radius: 24px;
      padding: 10px 16px;
      font-size: 14px;
      font-family: inherit;
      outline: none;
      background: #f9fafb;
      transition: border-color 0.2s ease, background 0.2s ease;
      color: #1f2937;
    }
    .cw-input::placeholder { color: #9ca3af; }
    .cw-input:focus {
      border-color: ${CONFIG.primaryColor};
      background: #ffffff;
      box-shadow: 0 0 0 3px ${CONFIG.primaryColor}15;
    }
    .cw-send-btn {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: ${CONFIG.primaryColor};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;
    }
    .cw-send-btn:hover { transform: scale(1.05); }
    .cw-send-btn:active { transform: scale(0.95); }
    .cw-send-btn:disabled {
      background: #d1d5db;
      cursor: not-allowed;
      transform: none;
    }
    .cw-send-btn svg { width: 18px; height: 18px; fill: white; }

    /* ── Powered By ── */
    .cw-powered {
      text-align: center;
      padding: 6px;
      font-size: 10px;
      color: #9ca3af;
      background: #ffffff;
      border-top: 1px solid #f3f4f6;
    }
    .cw-powered a { color: #6b7280; text-decoration: none; font-weight: 600; }
    .cw-powered a:hover { color: ${CONFIG.primaryColor}; }

    /* ── Responsive ── */
    @media (max-width: 440px) {
      .cw-window {
        width: calc(100vw - 24px);
        height: calc(100vh - 100px);
        bottom: 72px;
        right: 12px;
        left: 12px;
        border-radius: 12px;
      }
      .cw-container { right: 12px; bottom: 12px; }
    }
  `;

    // ─── SVG Icons ───
    const ICONS = {
        chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.17L4 17.17V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>',
        close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
        send: '<svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>',
        bot: '<svg viewBox="0 0 24 24"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.07A7.002 7.002 0 0 1 14 23h-4a7.002 7.002 0 0 1-6.93-6H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2zm-4 13a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm8 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"/></svg>',
        wave: '<svg viewBox="0 0 24 24"><path d="M7.03 4.95L3.5 8.47c-3.27 3.26-3.27 8.58 0 11.85 3.27 3.27 8.58 3.27 11.85 0l4.88-4.87a1.5 1.5 0 0 0-2.12-2.12l-2.83 2.83a1 1 0 0 1-1.42-1.42l4.95-4.95a1.5 1.5 0 0 0-2.12-2.12l-3.54 3.54a1 1 0 0 1-1.42-1.42l4.95-4.95a1.5 1.5 0 0 0-2.12-2.12L11.6 6.7a1 1 0 0 1-1.42-1.42l2.12-2.12a1.5 1.5 0 0 0-2.12-2.12L7.03 4.95z"/></svg>',
    };

    // ─── Shadow DOM Setup ───
    const host = document.createElement('div');
    host.id = 'chat-widget-host';
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = WIDGET_STYLES;
    shadow.appendChild(styleEl);

    // ─── DOM Construction ───
    const container = document.createElement('div');
    container.className = 'cw-container';
    container.innerHTML = `
    <!-- Chat Window -->
    <div class="cw-window" id="cw-window">
      <!-- Header -->
      <div class="cw-header">
        <div class="cw-header-avatar">
          ${ICONS.bot}
        </div>
        <div class="cw-header-info">
          <div class="cw-header-title">${CONFIG.title}</div>
          <div class="cw-header-subtitle">
            <span class="cw-header-status">
              <span class="cw-header-dot"></span>
              ${CONFIG.subtitle}
            </span>
          </div>
        </div>
      </div>

      <!-- Body (welcome or messages) -->
      <div id="cw-body"></div>

      <!-- Input (hidden until session starts) -->
      <div class="cw-input-area" id="cw-input-area" style="display:none;">
        <input class="cw-input" id="cw-input" placeholder="Type a message..." autocomplete="off" />
        <button class="cw-send-btn" id="cw-send-btn" disabled>
          ${ICONS.send}
        </button>
      </div>

      <div class="cw-powered">
        Powered by <a href="#">Slash ChatBot</a>
      </div>
    </div>

    <!-- FAB Button -->
    <button class="cw-fab" id="cw-fab" aria-label="Open chat">
      <span class="cw-icon-chat">${ICONS.chat}</span>
      <span class="cw-icon-close">${ICONS.close}</span>
    </button>
  `;
    shadow.appendChild(container);

    // ─── DOM References ────
    const fab = shadow.getElementById('cw-fab');
    const window_ = shadow.getElementById('cw-window');
    const body_ = shadow.getElementById('cw-body');
    const inputArea = shadow.getElementById('cw-input-area');
    const input_ = shadow.getElementById('cw-input');
    const sendBtn = shadow.getElementById('cw-send-btn');

    // ─── Render Functions ───

    function renderWelcome() {
        body_.className = 'cw-welcome';
        body_.innerHTML = `
      <div class="cw-welcome-icon">${ICONS.wave}</div>
      <div class="cw-welcome-title">${CONFIG.title}</div>
      <div class="cw-welcome-text">${CONFIG.greeting}</div>
      <button class="cw-welcome-btn" id="cw-start-btn">
        Start Conversation
      </button>
    `;
        inputArea.style.display = 'none';

        shadow.getElementById('cw-start-btn').addEventListener('click', startSession);
    }

    function renderMessages() {
        body_.className = 'cw-messages';
        inputArea.style.display = 'flex';

        let html = '';
        for (const msg of messages) {
            const role = msg.role;
            const time = formatTime(msg.timestamp);
            html += `
        <div class="cw-msg ${role}">
          <div class="cw-msg-avatar">${role === 'bot' ? '🤖' : '👤'}</div>
          <div>
            <div class="cw-msg-bubble">${escapeHtml(msg.content)}</div>
            <div class="cw-msg-time">${time}</div>
          </div>
        </div>
      `;
        }

        if (isLoading) {
            html += `
        <div class="cw-typing">
          <div class="cw-msg-avatar" style="background:${CONFIG.primaryColor}15;color:${CONFIG.primaryColor};">🤖</div>
          <div class="cw-typing-dots">
            <div class="cw-typing-dot"></div>
            <div class="cw-typing-dot"></div>
            <div class="cw-typing-dot"></div>
          </div>
        </div>
      `;
        }

        body_.innerHTML = html;
        scrollToBottom();
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            body_.scrollTop = body_.scrollHeight;
        });
    }

    // ─── API Calls ────

    async function startSession() {
        if (isSessionStarting) return;
        isSessionStarting = true;

        const startBtn = shadow.getElementById('cw-start-btn');
        if (startBtn) {
            startBtn.disabled = true;
            startBtn.textContent = 'Connecting...';
        }

        try {
            const res = await fetch(`${CONFIG.serverUrl}/chat/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ flow_id: CONFIG.flowId }),
            });
            const data = await res.json();

            if (data.success && data.session_id) {
                sessionId = data.session_id;
                messages = (data.messages || []).map(m => ({
                    role: m.sender === 'bot' ? 'bot' : 'user',
                    content: m.message_text || m.text || '',
                    timestamp: m.timestamp || new Date().toISOString(),
                }));
                renderMessages();
                input_.focus();
            } else {
                console.error('[ChatWidget] Failed to start session:', data);
                alert('Failed to start chat. Please try again.');
                renderWelcome();
            }
        } catch (err) {
            console.error('[ChatWidget] Error starting session:', err);
            alert('Could not connect to chat. Please try again.');
            renderWelcome();
        } finally {
            isSessionStarting = false;
        }
    }

    async function sendMessage(text) {
        if (!text.trim() || !sessionId || isLoading) return;

        // Add user message
        messages.push({
            role: 'user',
            content: text,
            timestamp: new Date().toISOString(),
        });
        isLoading = true;
        renderMessages();

        input_.value = '';
        updateSendBtn();

        try {
            const res = await fetch(`${CONFIG.serverUrl}/chat/${sessionId}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();

            if (data.success && data.messages) {
                for (const m of data.messages) {
                    messages.push({
                        role: m.sender === 'bot' ? 'bot' : 'user',
                        content: m.message_text || m.text || '',
                        timestamp: m.timestamp || new Date().toISOString(),
                    });
                }
            }
        } catch (err) {
            console.error('[ChatWidget] Error sending message:', err);
            messages.push({
                role: 'bot',
                content: 'Sorry, something went wrong. Please try again.',
                timestamp: new Date().toISOString(),
            });
        } finally {
            isLoading = false;
            renderMessages();
        }
    }

    // ─── Helpers ────

    function formatTime(dateStr) {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr);
            return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        } catch {
            return '';
        }
    }

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    }

    function updateSendBtn() {
        sendBtn.disabled = !input_.value.trim() || isLoading;
    }

    // ─── Event Listeners ────

    fab.addEventListener('click', () => {
        isOpen = !isOpen;
        fab.classList.toggle('open', isOpen);
        window_.classList.toggle('open', isOpen);

        if (isOpen && !sessionId) {
            renderWelcome();
        }
        if (isOpen && sessionId) {
            input_.focus();
            scrollToBottom();
        }
    });

    input_.addEventListener('input', updateSendBtn);

    input_.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input_.value.trim() && !isLoading) {
                sendMessage(input_.value);
            }
        }
    });

    sendBtn.addEventListener('click', () => {
        if (input_.value.trim() && !isLoading) {
            sendMessage(input_.value);
        }
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            isOpen = false;
            fab.classList.remove('open');
            window_.classList.remove('open');
        }
    });

})();
