/**
 * ===================================================
 * IDRS Civic AI Comprehensive Assistant Engine
 * Full-featured Civic Helper: Reporting, Feedback,
 * Ticket Tracking, Auth & Account Management, Stats & Support
 * ===================================================
 */

(function () {
  // Master Civic Knowledge Base
  const IDRS_KNOWLEDGE = {
    greetings: [
      "Hello! I'm your IDRS Civic AI Assistant. I can help you report damage, submit feedback, track tickets, check live statistics, or manage your login account. How can I assist you right now?",
      "Welcome to IDRS! I am your 24/7 civic service companion. You can file damage reports, submit citizen feedback, check ticket statuses, or manage account authentication directly with me!",
      "Greetings! Need to log a municipal issue, share feedback, track a complaint, or check portal statistics? I'm here to handle it directly for you."
    ],
    categories: [
      {
        id: "pothole",
        keywords: ["pothole", "crater", "road break", "damaged road", "asphalt", "bump", "tar road", "highway", "street crack", "road"],
        name: "Pothole / Road Hazard",
        department: "Roads & Highways Department",
        sla: "8 - 24 Hours",
        severity: "High",
        icon: "fa-road",
        advice: "Capture a clear photo showing the road surface and nearby landmark to speed up asphalt patching."
      },
      {
        id: "water",
        keywords: ["water", "leak", "pipe", "burst", "drain", "drainage", "sewage", "gutter", "overflow", "flooding", "waterlogging", "manhole"],
        name: "Water Leakage & Drainage",
        department: "Water Supply & Sewerage Board",
        sla: "4 - 12 Hours",
        severity: "Critical",
        icon: "fa-faucet-drip",
        advice: "Open manholes and water main bursts are flagged as Critical emergencies with immediate dispatch."
      },
      {
        id: "electrical",
        keywords: ["light", "streetlight", "street light", "dark", "lamp", "electric", "pole", "wire", "spark", "transformer", "power"],
        name: "Streetlight & Electrical Grid",
        department: "Municipal Electricity Division",
        sla: "6 - 18 Hours",
        severity: "High",
        icon: "fa-bolt",
        advice: "Do not touch fallen wires! Maintain a 10-meter distance. Emergency teams are notified."
      },
      {
        id: "bridge",
        keywords: ["bridge", "flyover", "pillar", "structural crack", "overpass", "culvert", "crack"],
        name: "Bridge & Structural Integrity",
        department: "Bridge Engineering & Safety Authority",
        sla: "2 - 6 Hours (Emergency Audit)",
        severity: "Critical",
        icon: "fa-archway",
        advice: "Structural defects are inspected by senior municipal structural engineers immediately."
      },
      {
        id: "traffic",
        keywords: ["traffic", "signal", "sign", "traffic light", "zebra crossing", "divider", "barricade"],
        name: "Traffic Signals & Road Safety",
        department: "Traffic Engineering Cell",
        sla: "4 - 8 Hours",
        severity: "High",
        icon: "fa-traffic-light",
        advice: "Malfunctioning signals are escalated directly to Traffic Police Control for temporary regulation."
      },
      {
        id: "waste",
        keywords: ["garbage", "trash", "waste", "debris", "dump", "smell", "sanitation", "dead animal", "rubbish"],
        name: "Solid Waste & Public Hygiene",
        department: "Sanitation & Public Health Bureau",
        sla: "12 - 24 Hours",
        severity: "Medium",
        icon: "fa-trash-can",
        advice: "Sanitation compactors operate daily across all municipal zones."
      },
      {
        id: "footpath",
        keywords: ["footpath", "sidewalk", "paver block", "pedestrian", "walkway"],
        name: "Footpath & Pedestrian Safety",
        department: "Civil Works & Public Pathways",
        sla: "2 - 5 Days",
        severity: "Medium",
        icon: "fa-person-walking",
        advice: "Pedestrian walkway maintenance prevents citizen injuries and senior citizen accidents."
      }
    ],
    emergencies: {
      police: "100",
      fire: "101",
      ambulance: "108",
      municipalHelpline: "1800-123-456",
      email: "support@idrs.com"
    },
    commonPrompts: [
      "File a damage report 📋",
      "Submit feedback & suggestions ⭐",
      "How can I track my ticket status?",
      "Check my account login status 👤",
      "Sign out / Log out of my account 🚪",
      "Show live portal statistics 📊",
      "Report a broken road or pothole",
      "Report water pipe leak or sewage overflow",
      "Streetlight is not working in my street",
      "What are the emergency contact numbers?",
      "Safety tips for road & monsoon hazards"
    ]
  };

  // State Management for Forms
  let reportWizardState = {
    active: false,
    step: 1,
    data: { category: '', severity: 'High', location: '', description: '' }
  };

  let feedbackWizardState = {
    active: false,
    rating: 5,
    category: 'General Experience',
    message: ''
  };

  let speechRecognitionInstance = null;
  let isListening = false;

  // Build & Inject Chatbot Widget DOM
  function createChatbotUI() {
    if (document.getElementById('idrsChatbotContainer')) return;

    const container = document.createElement('div');
    container.id = 'idrsChatbotContainer';
    container.innerHTML = `
      <!-- Tooltip Notification -->
      <div id="idrsChatTooltip" class="idrs-chatbot-tooltip">
        <span>💬 Need assistance? Ask IDRS Civic AI</span>
      </div>

      <!-- Trigger Toggle Button -->
      <button id="idrsChatToggle" class="idrs-chatbot-toggle" aria-label="Toggle Civic AI Chatbot">
        <i class="fas fa-headset toggle-icon-chat"></i>
        <i class="fas fa-times toggle-icon-close"></i>
        <div class="pulse-badge"></div>
      </button>

      <!-- Main Chat Window -->
      <div id="idrsChatWindow" class="idrs-chat-window" role="dialog" aria-modal="true">
        <!-- Header -->
        <div class="idrs-chat-header">
          <div class="idrs-header-bot-info">
            <div class="idrs-bot-avatar">
              <i class="fas fa-robot"></i>
            </div>
            <div class="idrs-bot-text">
              <h4>IDRS Civic AI <i class="fas fa-certificate" style="color:#60A5FA; font-size:12px;"></i></h4>
              <div class="idrs-bot-status">
                <span class="status-dot"></span>
                <span>Active 24/7 Civic Assistant</span>
              </div>
            </div>
          </div>
          <div class="idrs-header-actions">
            <button id="idrsExpandChatBtn" class="idrs-hdr-btn" title="Expand / Minimize Window">
              <i class="fas fa-up-right-and-down-left-from-center"></i>
            </button>
            <button id="idrsClearChatBtn" class="idrs-hdr-btn" title="Clear Conversation">
              <i class="fas fa-trash-can"></i>
            </button>
            <button id="idrsCloseChatBtn" class="idrs-hdr-btn" title="Close Window">
              <i class="fas fa-minus"></i>
            </button>
          </div>
        </div>

        <!-- Top Action Chips Bar -->
        <div class="idrs-quick-chips-wrapper">
          <button class="idrs-chip" data-action="report-wizard">
            <i class="fas fa-file-circle-plus" style="color:#2563EB"></i> Report Damage
          </button>
          <button class="idrs-chip" data-action="feedback-wizard">
            <i class="fas fa-star" style="color:#F59E0B"></i> Submit Feedback
          </button>
          <button class="idrs-chip" data-query="How can I track my ticket status?">
            <i class="fas fa-barcode" style="color:#06B6D4"></i> Track Ticket
          </button>
          <button class="idrs-chip" data-action="auth-status">
            <i class="fas fa-user-shield" style="color:#8B5CF6"></i> Account / Auth
          </button>
          <button class="idrs-chip" data-action="show-stats">
            <i class="fas fa-chart-line" style="color:#10B981"></i> Live Stats
          </button>
          <button class="idrs-chip" data-query="What are the emergency contact numbers?">
            <i class="fas fa-phone-volume" style="color:#EF4444"></i> 24/7 Helplines
          </button>
          <button class="idrs-chip" data-action="safety-tips">
            <i class="fas fa-shield-halved" style="color:#10B981"></i> Safety Tips
          </button>
        </div>

        <!-- Chat Body -->
        <div id="idrsChatBody" class="idrs-chat-body"></div>

        <!-- Autocomplete Suggestions Popover -->
        <div id="idrsAutocompletePopover" class="idrs-autocomplete-popover"></div>

        <!-- Chat Input Footer -->
        <div class="idrs-chat-footer">
          <form id="idrsChatForm" class="idrs-chat-form">
            <input 
              type="text" 
              id="idrsChatInput" 
              class="idrs-chat-input" 
              placeholder="Report issue, submit feedback, track ticket, login..." 
              autocomplete="off"
            />
            <button type="button" id="idrsMicBtn" class="idrs-input-btn idrs-mic-btn" title="Voice Input (Speech to Text)">
              <i class="fas fa-microphone"></i>
            </button>
            <button type="submit" id="idrsSendBtn" class="idrs-input-btn idrs-send-btn" title="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    attachChatbotEvents();
    loadPersistedHistory();
    initSpeechRecognition();
  }

  // Event Handlers Setup
  function attachChatbotEvents() {
    const toggleBtn = document.getElementById('idrsChatToggle');
    const chatWindow = document.getElementById('idrsChatWindow');
    const closeBtn = document.getElementById('idrsCloseChatBtn');
    const clearBtn = document.getElementById('idrsClearChatBtn');
    const expandBtn = document.getElementById('idrsExpandChatBtn');
    const chatForm = document.getElementById('idrsChatForm');
    const chatInput = document.getElementById('idrsChatInput');
    const tooltip = document.getElementById('idrsChatTooltip');
    const micBtn = document.getElementById('idrsMicBtn');
    const autocompletePopover = document.getElementById('idrsAutocompletePopover');

    setTimeout(() => {
      if (!chatWindow.classList.contains('open') && tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 5000);
      }
    }, 2500);

    toggleBtn.addEventListener('click', () => {
      const isOpen = chatWindow.classList.contains('open');
      if (isOpen) {
        chatWindow.classList.remove('open');
        toggleBtn.classList.remove('active');
      } else {
        chatWindow.classList.add('open');
        toggleBtn.classList.add('active');
        if (tooltip) tooltip.classList.remove('show');
        setTimeout(() => chatInput.focus(), 200);
      }
    });

    closeBtn.addEventListener('click', () => {
      chatWindow.classList.remove('open');
      toggleBtn.classList.remove('active');
    });

    expandBtn.addEventListener('click', () => {
      chatWindow.classList.toggle('maximized');
      const icon = expandBtn.querySelector('i');
      if (chatWindow.classList.contains('maximized')) {
        icon.className = 'fas fa-down-left-and-up-right-to-center';
      } else {
        icon.className = 'fas fa-up-right-and-down-left-from-center';
      }
    });

    clearBtn.addEventListener('click', () => {
      sessionStorage.removeItem('idrs_chat_history');
      reportWizardState.active = false;
      feedbackWizardState.active = false;
      const body = document.getElementById('idrsChatBody');
      body.innerHTML = '';
      showInitialGreeting();
    });

    // Top Chips Click Handler
    document.querySelectorAll('.idrs-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        const query = e.currentTarget.getAttribute('data-query');
        if (action === 'report-wizard') {
          startInChatReportWizard();
        } else if (action === 'feedback-wizard') {
          startInChatFeedbackWizard();
        } else if (action === 'auth-status') {
          handleAuthQuery();
        } else if (action === 'show-stats') {
          handleLiveStatsQuery();
        } else if (action === 'safety-tips') {
          handleSafetyTipsQuery();
        } else if (query) {
          handleUserSubmission(query);
        }
      });
    });

    // Form Submission
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      autocompletePopover.classList.remove('show');
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';

      const tLower = text.toLowerCase();
      if (tLower === '/report' || tLower === 'report' || tLower === 'file report') {
        startInChatReportWizard();
      } else if (tLower === '/feedback' || tLower === 'feedback' || tLower === 'submit feedback') {
        startInChatFeedbackWizard();
      } else if (tLower === '/login' || tLower === 'login' || tLower === 'signin') {
        handleLoginHelp();
      } else if (tLower === '/logout' || tLower === 'logout' || tLower === 'signout') {
        performChatLogout();
      } else if (tLower === '/stats' || tLower === 'stats' || tLower === 'statistics') {
        handleLiveStatsQuery();
      } else {
        handleUserSubmission(text);
      }
    });

    // Autocomplete Popover
    chatInput.addEventListener('input', () => {
      const val = chatInput.value.trim().toLowerCase();
      if (val.length < 2) {
        autocompletePopover.classList.remove('show');
        autocompletePopover.innerHTML = '';
        return;
      }

      const matches = IDRS_KNOWLEDGE.commonPrompts.filter(p => p.toLowerCase().includes(val));
      if (matches.length > 0) {
        autocompletePopover.innerHTML = matches.map(m => `
          <div class="idrs-autocomplete-item" data-val="${escapeHtml(m)}">
            <i class="fas fa-hand-point-right" style="color:#2563EB; font-size:12px;"></i>
            <span>${escapeHtml(m)}</span>
          </div>
        `).join('');
        autocompletePopover.classList.add('show');

        autocompletePopover.querySelectorAll('.idrs-autocomplete-item').forEach(item => {
          item.addEventListener('click', () => {
            const selectedText = item.getAttribute('data-val');
            chatInput.value = '';
            autocompletePopover.classList.remove('show');
            handleUserSubmission(selectedText);
          });
        });
      } else {
        autocompletePopover.classList.remove('show');
      }
    });

    document.addEventListener('click', (e) => {
      if (!chatForm.contains(e.target) && !autocompletePopover.contains(e.target)) {
        autocompletePopover.classList.remove('show');
      }
    });

    if (micBtn) {
      micBtn.addEventListener('click', toggleVoiceInput);
    }
  }

  // Voice Recognition (Speech to Text)
  function initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      speechRecognitionInstance = new SpeechRecognition();
      speechRecognitionInstance.continuous = false;
      speechRecognitionInstance.interimResults = false;
      speechRecognitionInstance.lang = 'en-US';

      speechRecognitionInstance.onstart = () => {
        isListening = true;
        const micBtn = document.getElementById('idrsMicBtn');
        if (micBtn) micBtn.classList.add('listening');
        const chatInput = document.getElementById('idrsChatInput');
        if (chatInput) chatInput.placeholder = 'Listening... speak now';
      };

      speechRecognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const chatInput = document.getElementById('idrsChatInput');
        if (chatInput) {
          chatInput.value = transcript;
          setTimeout(() => {
            handleUserSubmission(transcript);
            chatInput.value = '';
          }, 300);
        }
      };

      speechRecognitionInstance.onerror = () => stopListening();
      speechRecognitionInstance.onend = () => stopListening();
    } else {
      const micBtn = document.getElementById('idrsMicBtn');
      if (micBtn) micBtn.style.display = 'none';
    }
  }

  function toggleVoiceInput() {
    if (!speechRecognitionInstance) return;
    if (isListening) {
      speechRecognitionInstance.stop();
      stopListening();
    } else {
      try {
        speechRecognitionInstance.start();
      } catch (err) {}
    }
  }

  function stopListening() {
    isListening = false;
    const micBtn = document.getElementById('idrsMicBtn');
    if (micBtn) micBtn.classList.remove('listening');
    const chatInput = document.getElementById('idrsChatInput');
    if (chatInput) chatInput.placeholder = 'Report issue, submit feedback, track ticket, login...';
  }

  // Text to Speech Readout
  function speakText(textToSpeak) {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const cleanText = textToSpeak.replace(/<[^>]*>?/gm, ' ');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  }

  // Session Persistence
  function persistMessage(sender, text, cardHtml = '', chips = []) {
    try {
      const history = JSON.parse(sessionStorage.getItem('idrs_chat_history') || '[]');
      history.push({ sender, text, cardHtml, chips, timestamp: new Date().toISOString() });
      sessionStorage.setItem('idrs_chat_history', JSON.stringify(history.slice(-30)));
    } catch (e) {}
  }

  function loadPersistedHistory() {
    try {
      const history = JSON.parse(sessionStorage.getItem('idrs_chat_history') || '[]');
      if (history.length > 0) {
        history.forEach(item => {
          renderMessage(item.sender, item.text, item.cardHtml || '', item.chips || [], false);
        });
      } else {
        showInitialGreeting();
      }
    } catch (e) {
      showInitialGreeting();
    }
  }

  // Append & Render Message
  function appendMessage(sender, text, cardHtml = '', chips = []) {
    renderMessage(sender, text, cardHtml, chips, true);
    persistMessage(sender, text, cardHtml, chips);
  }

  function renderMessage(sender, text, cardHtml = '', chips = [], shouldScroll = true) {
    const chatBody = document.getElementById('idrsChatBody');
    if (!chatBody) return;

    const row = document.createElement('div');
    row.className = `idrs-msg-row ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let chipsHtml = '';
    if (chips && chips.length > 0) {
      chipsHtml = `
        <div class="idrs-inline-chips">
          ${chips.map(c => `
            <button class="idrs-inline-chip" data-query="${escapeHtml(c.query || c.text)}" data-action="${c.action || ''}">
              ${c.icon ? `<i class="fas ${c.icon}"></i>` : ''} ${escapeHtml(c.text)}
            </button>
          `).join('')}
        </div>
      `;
    }

    if (sender === 'bot') {
      row.innerHTML = `
        <div class="idrs-msg-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="idrs-msg-content-wrap">
          <div class="idrs-msg-bubble">
            <div class="idrs-bubble-text">${text}</div>
            ${cardHtml}
            ${chipsHtml}
          </div>
          <div class="idrs-msg-meta">
            <span class="idrs-msg-time">${timeStr}</span>
            <div class="idrs-msg-actions">
              <button class="idrs-meta-btn idrs-speak-btn" title="Read Aloud"><i class="fas fa-volume-high"></i></button>
              <button class="idrs-meta-btn idrs-fb-btn" data-type="like" title="Helpful"><i class="far fa-thumbs-up"></i></button>
              <button class="idrs-meta-btn idrs-fb-btn" data-type="dislike" title="Not Helpful"><i class="far fa-thumbs-down"></i></button>
            </div>
          </div>
        </div>
      `;

      const speakBtn = row.querySelector('.idrs-speak-btn');
      if (speakBtn) {
        speakBtn.addEventListener('click', () => speakText(text));
      }

      row.querySelectorAll('.idrs-fb-btn').forEach(btn => {
        btn.addEventListener('click', function () {
          const type = this.getAttribute('data-type');
          if (type === 'like') {
            this.classList.toggle('liked');
            this.innerHTML = '<i class="fas fa-thumbs-up"></i>';
          } else {
            this.classList.toggle('disliked');
            this.innerHTML = '<i class="fas fa-thumbs-down"></i>';
          }
        });
      });

      row.querySelectorAll('.idrs-inline-chip').forEach(chipBtn => {
        chipBtn.addEventListener('click', (e) => {
          const action = e.currentTarget.getAttribute('data-action');
          const query = e.currentTarget.getAttribute('data-query');
          if (action === 'report-wizard') {
            startInChatReportWizard();
          } else if (action === 'feedback-wizard') {
            startInChatFeedbackWizard();
          } else if (action === 'auth-status') {
            handleAuthQuery();
          } else if (action === 'do-logout') {
            performChatLogout();
          } else if (action === 'show-stats') {
            handleLiveStatsQuery();
          } else if (action === 'safety-tips') {
            handleSafetyTipsQuery();
          } else if (query) {
            handleUserSubmission(query);
          }
        });
      });

    } else {
      row.innerHTML = `
        <div class="idrs-msg-content-wrap">
          <div class="idrs-msg-bubble">
            <div>${escapeHtml(text)}</div>
          </div>
          <div class="idrs-msg-meta" style="justify-content: flex-end;">
            <span class="idrs-msg-time">${timeStr}</span>
          </div>
        </div>
      `;
    }

    chatBody.appendChild(row);
    if (shouldScroll) {
      chatBody.scrollTop = chatBody.scrollHeight;
    }
  }

  // Typing Indicator
  function showTypingIndicator() {
    const chatBody = document.getElementById('idrsChatBody');
    const id = 'idrsTypingIndicator';
    if (document.getElementById(id)) return;

    const row = document.createElement('div');
    row.id = id;
    row.className = 'idrs-typing-row';
    row.innerHTML = `
      <div class="idrs-msg-avatar">
        <i class="fas fa-robot"></i>
      </div>
      <div class="idrs-typing-bubble">
        <div class="idrs-typing-dot"></div>
        <div class="idrs-typing-dot"></div>
        <div class="idrs-typing-dot"></div>
      </div>
    `;
    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function hideTypingIndicator() {
    const elem = document.getElementById('idrsTypingIndicator');
    if (elem) elem.remove();
  }

  function showInitialGreeting() {
    const greeting = IDRS_KNOWLEDGE.greetings[0];
    const chips = [
      { text: "Report Damage 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
      { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
      { text: "Track Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" },
      { text: "Account / Login 👤", action: "auth-status", icon: "fa-user-shield" },
      { text: "Live Portal Stats 📊", action: "show-stats", icon: "fa-chart-pie" },
      { text: "24/7 Helplines 📞", query: "What are the emergency contact numbers?", icon: "fa-phone-volume" }
    ];

    appendMessage('bot', greeting, '', chips);
  }

  // =====================================
  // 1. IN-CHAT DAMAGE REPORT WIZARD
  // =====================================
  function startInChatReportWizard() {
    reportWizardState.active = true;
    reportWizardState.step = 1;
    reportWizardState.data = { category: '', severity: 'High', location: '', description: '' };

    const promptText = `Let's file your civic damage report together. <strong>Step 1 of 3:</strong> Select the category of the defect:`;
    const wizardCard = `
      <div class="idrs-wizard-card" id="idrsReportStep1">
        <div class="idrs-wizard-header">
          <span style="font-weight:700; font-size:13px; color:#111827;">Select Damage Category</span>
          <span class="idrs-wizard-step-tag">Step 1 / 3</span>
        </div>
        <div class="idrs-cat-grid">
          <button class="idrs-cat-btn" data-cat="Pothole / Road Hazard">
            <i class="fas fa-road"></i>
            <span>Pothole / Road</span>
          </button>
          <button class="idrs-cat-btn" data-cat="Water Leakage & Drainage">
            <i class="fas fa-faucet-drip"></i>
            <span>Water / Drainage</span>
          </button>
          <button class="idrs-cat-btn" data-cat="Streetlight & Electrical Grid">
            <i class="fas fa-bolt"></i>
            <span>Streetlight / Power</span>
          </button>
          <button class="idrs-cat-btn" data-cat="Bridge & Structural Integrity">
            <i class="fas fa-archway"></i>
            <span>Bridge / Structure</span>
          </button>
          <button class="idrs-cat-btn" data-cat="Traffic Signals & Road Safety">
            <i class="fas fa-traffic-light"></i>
            <span>Traffic Signals</span>
          </button>
          <button class="idrs-cat-btn" data-cat="Solid Waste & Public Hygiene">
            <i class="fas fa-trash-can"></i>
            <span>Garbage / Hygiene</span>
          </button>
        </div>
      </div>
    `;

    appendMessage('bot', promptText, wizardCard);

    setTimeout(() => {
      const container = document.getElementById('idrsReportStep1');
      if (container) {
        container.querySelectorAll('.idrs-cat-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            const cat = this.getAttribute('data-cat');
            reportWizardState.data.category = cat;
            renderReportStep2(cat);
          });
        });
      }
    }, 100);
  }

  function renderReportStep2(chosenCategory) {
    reportWizardState.step = 2;
    appendMessage('user', `Category: ${chosenCategory}`);

    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      const promptText = `Got it. <strong>Step 2 of 3:</strong> Choose urgency level and set the incident location:`;
      const wizardCard = `
        <div class="idrs-wizard-card" id="idrsReportStep2">
          <div class="idrs-wizard-header">
            <span style="font-weight:700; font-size:13px; color:#111827;">Severity & Location</span>
            <span class="idrs-wizard-step-tag">Step 2 / 3</span>
          </div>
          
          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">Urgency Priority:</label>
          <div class="idrs-severity-options">
            <button class="idrs-sev-btn sev-critical" data-sev="Critical">Critical</button>
            <button class="idrs-sev-btn sev-high selected" data-sev="High">High</button>
            <button class="idrs-sev-btn sev-med" data-sev="Medium">Standard</button>
          </div>

          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">Street Location / Landmark:</label>
          <input type="text" class="idrs-wizard-input" id="idrsReportLocation" placeholder="e.g. Near City Market, 5th Avenue" />
          
          <button type="button" class="idrs-gps-btn" id="idrsReportGpsBtn">
            <i class="fas fa-location-crosshairs"></i> Use GPS Auto-Detect
          </button>

          <button class="idrs-chat-btn-action" id="idrsReportStep2Next" style="width:100%; justify-content:center;">
            Continue to Details <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      `;

      appendMessage('bot', promptText, wizardCard);

      setTimeout(() => {
        const step2Wrap = document.getElementById('idrsReportStep2');
        if (!step2Wrap) return;

        step2Wrap.querySelectorAll('.idrs-sev-btn').forEach(btn => {
          btn.addEventListener('click', function () {
            step2Wrap.querySelectorAll('.idrs-sev-btn').forEach(b => b.classList.remove('selected'));
            this.classList.add('selected');
            reportWizardState.data.severity = this.getAttribute('data-sev');
          });
        });

        const gpsBtn = step2Wrap.querySelector('#idrsReportGpsBtn');
        if (gpsBtn && navigator.geolocation) {
          gpsBtn.addEventListener('click', () => {
            gpsBtn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Detecting GPS...`;
            navigator.geolocation.getCurrentPosition(
              (pos) => {
                const locStr = `Lat: ${pos.coords.latitude.toFixed(4)}, Long: ${pos.coords.longitude.toFixed(4)} (GPS Verified)`;
                const locInput = step2Wrap.querySelector('#idrsReportLocation');
                if (locInput) locInput.value = locStr;
                gpsBtn.innerHTML = `<i class="fas fa-check" style="color:#10B981"></i> GPS Coordinates Attached`;
              },
              () => {
                gpsBtn.innerHTML = `<i class="fas fa-triangle-exclamation" style="color:#EF4444"></i> GPS unavailable (Enter manually)`;
              }
            );
          });
        }

        const nextBtn = step2Wrap.querySelector('#idrsReportStep2Next');
        if (nextBtn) {
          nextBtn.addEventListener('click', () => {
            const locVal = step2Wrap.querySelector('#idrsReportLocation').value.trim();
            if (!locVal) {
              alert('Please enter a location or landmark.');
              return;
            }
            reportWizardState.data.location = locVal;
            renderReportStep3();
          });
        }
      }, 100);
    }, 400);
  }

  function renderReportStep3() {
    reportWizardState.step = 3;
    appendMessage('user', `Location: ${reportWizardState.data.location} (${reportWizardState.data.severity} Priority)`);

    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      const promptText = `Final step! <strong>Step 3 of 3:</strong> Describe the damage defect:`;
      const wizardCard = `
        <div class="idrs-wizard-card" id="idrsReportStep3">
          <div class="idrs-wizard-header">
            <span style="font-weight:700; font-size:13px; color:#111827;">Problem Summary & Submit</span>
            <span class="idrs-wizard-step-tag">Step 3 / 3</span>
          </div>

          <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">Description of Issue:</label>
          <textarea class="idrs-wizard-input" id="idrsReportDesc" rows="3" placeholder="e.g. Deep pothole on the left lane causing vehicle damage..."></textarea>

          <button class="idrs-chat-btn-action" id="idrsReportSubmitBtn" style="width:100%; justify-content:center; background:#10B981;">
            <i class="fas fa-paper-plane"></i> Submit Official Damage Report
          </button>
        </div>
      `;

      appendMessage('bot', promptText, wizardCard);

      setTimeout(() => {
        const step3Wrap = document.getElementById('idrsReportStep3');
        if (!step3Wrap) return;

        const submitBtn = step3Wrap.querySelector('#idrsReportSubmitBtn');
        if (submitBtn) {
          submitBtn.addEventListener('click', async () => {
            const desc = step3Wrap.querySelector('#idrsReportDesc').value.trim() || 'Civic defect reported via AI Assistant.';
            reportWizardState.data.description = desc;
            await completeInChatReport();
          });
        }
      }, 100);
    }, 400);
  }

  async function completeInChatReport() {
    appendMessage('user', `Description: "${reportWizardState.data.description}". Registering report...`);
    showTypingIndicator();

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newTicketId = `IDRS-2026-${randomSuffix}`;

    const reportObj = {
      report_id: newTicketId,
      category: reportWizardState.data.category,
      severity: reportWizardState.data.severity,
      location: reportWizardState.data.location,
      description: reportWizardState.data.description,
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'Civic AI Assistant'
    };

    try {
      const localReports = JSON.parse(localStorage.getItem('reports') || '[]');
      localReports.unshift(reportObj);
      localStorage.setItem('reports', JSON.stringify(localReports));
    } catch (e) {}

    try {
      const formData = new FormData();
      formData.append('category', reportWizardState.data.category);
      formData.append('location', reportWizardState.data.location);
      formData.append('description', reportWizardState.data.description);
      formData.append('severity', reportWizardState.data.severity);
      formData.append('name', localStorage.getItem('currentUser') || 'Citizen (via AI Chat)');
      formData.append('report_id', newTicketId);

      await fetch('/submit_report', { method: 'POST', body: formData });
    } catch (err) {}

    reportWizardState.active = false;

    setTimeout(() => {
      hideTypingIndicator();
      const successText = `🎉 <strong>Damage Report Registered!</strong> Your official Ticket ID is: <strong>${newTicketId}</strong>.`;
      const ticketCard = `
        <div class="idrs-chat-card" style="border-left: 3px solid #10B981;">
          <div class="idrs-chat-card-title" style="color:#059669;">
            <i class="fas fa-circle-check"></i> Ticket: ${newTicketId}
          </div>
          <div class="idrs-chat-card-desc">
            • <strong>Category:</strong> ${escapeHtml(reportWizardState.data.category)}<br>
            • <strong>Urgency:</strong> ${reportWizardState.data.severity}<br>
            • <strong>Location:</strong> ${escapeHtml(reportWizardState.data.location)}<br>
            • <strong>Status:</strong> <span style="color:#D97706; font-weight:700">Pending Triage</span>
          </div>
          
          <div class="idrs-stepper-wrap">
            <div class="idrs-stepper-step active"><div class="idrs-stepper-dot"><i class="fas fa-check"></i></div><span class="idrs-stepper-label">Logged</span></div>
            <div class="idrs-stepper-step"><div class="idrs-stepper-dot">2</div><span class="idrs-stepper-label">Triage</span></div>
            <div class="idrs-stepper-step"><div class="idrs-stepper-dot">3</div><span class="idrs-stepper-label">Dispatch</span></div>
            <div class="idrs-stepper-step"><div class="idrs-stepper-dot">4</div><span class="idrs-stepper-label">Resolved</span></div>
          </div>

          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
            <a href="track-report.html?id=${encodeURIComponent(newTicketId)}" class="idrs-chat-btn-action">
              <i class="fas fa-magnifying-glass"></i> View Live Ticket Dashboard
            </a>
          </div>
        </div>
      `;

      const chips = [
        { text: `Track ${newTicketId}`, query: `Track ticket ${newTicketId}`, icon: "fa-barcode" },
        { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
        { text: "File Another Report 📋", action: "report-wizard", icon: "fa-plus" }
      ];

      appendMessage('bot', successText, ticketCard, chips);
    }, 600);
  }

  // =====================================
  // 2. IN-CHAT FEEDBACK & SUGGESTION WIZARD
  // =====================================
  function startInChatFeedbackWizard() {
    feedbackWizardState.active = true;
    feedbackWizardState.rating = 5;

    const promptText = `⭐ <strong>Citizen Feedback & Suggestions</strong><br>We value your thoughts to improve public infrastructure services. Fill out your review right here:`;
    const feedbackCard = `
      <div class="idrs-wizard-card" id="idrsFeedbackForm">
        <div class="idrs-wizard-header">
          <span style="font-weight:700; font-size:13px; color:#111827;">Rate Your Experience</span>
          <span class="idrs-wizard-step-tag">Feedback</span>
        </div>

        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:6px; color:#374151;">Select Star Rating:</label>
        <div class="idrs-star-rating" id="idrsStarSelector">
          <button type="button" class="idrs-star-btn active" data-rating="1"><i class="fas fa-star"></i></button>
          <button type="button" class="idrs-star-btn active" data-rating="2"><i class="fas fa-star"></i></button>
          <button type="button" class="idrs-star-btn active" data-rating="3"><i class="fas fa-star"></i></button>
          <button type="button" class="idrs-star-btn active" data-rating="4"><i class="fas fa-star"></i></button>
          <button type="button" class="idrs-star-btn active" data-rating="5"><i class="fas fa-star"></i></button>
          <span id="idrsStarLabel" style="font-size:12px; font-weight:700; color:#F59E0B; margin-left:6px;">5 / 5 (Excellent)</span>
        </div>

        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">Feedback Category:</label>
        <select class="idrs-wizard-input" id="idrsFbCategory">
          <option value="Portal Experience">Portal & UI Experience</option>
          <option value="Repair Resolution Speed">Repair Resolution Speed</option>
          <option value="Municipal Staff Quality">Municipal Field Staff</option>
          <option value="Feature Suggestion">Feature Suggestion / Improvement</option>
        </select>

        <label style="display:block; font-size:12px; font-weight:600; margin-bottom:4px; color:#374151;">Your Comments / Suggestions:</label>
        <textarea class="idrs-wizard-input" id="idrsFbMessage" rows="3" placeholder="Tell us how we can make civic services better..."></textarea>

        <button class="idrs-chat-btn-action" id="idrsSubmitFbBtn" style="width:100%; justify-content:center; background:#2563EB;">
          <i class="fas fa-paper-plane"></i> Submit Citizen Feedback
        </button>
      </div>
    `;

    appendMessage('bot', promptText, feedbackCard);

    setTimeout(() => {
      const fbBox = document.getElementById('idrsFeedbackForm');
      if (!fbBox) return;

      const starBtns = fbBox.querySelectorAll('.idrs-star-btn');
      const starLabel = fbBox.querySelector('#idrsStarLabel');

      starBtns.forEach(btn => {
        btn.addEventListener('click', function () {
          const r = parseInt(this.getAttribute('data-rating'));
          feedbackWizardState.rating = r;

          starBtns.forEach(b => {
            const bRating = parseInt(b.getAttribute('data-rating'));
            if (bRating <= r) {
              b.classList.add('active');
            } else {
              b.classList.remove('active');
            }
          });

          const labels = ["", "1 / 5 (Poor)", "2 / 5 (Fair)", "3 / 5 (Good)", "4 / 5 (Very Good)", "5 / 5 (Excellent)"];
          starLabel.textContent = labels[r] || `${r} / 5`;
        });
      });

      fbBox.querySelector('#idrsSubmitFbBtn').addEventListener('click', async () => {
        const cat = fbBox.querySelector('#idrsFbCategory').value;
        const msg = fbBox.querySelector('#idrsFbMessage').value.trim() || 'Citizen feedback submitted via AI Assistant.';
        const userEmail = localStorage.getItem('currentUser') || 'citizen@idrs.local';

        appendMessage('user', `Submitted ${feedbackWizardState.rating}★ Feedback: "${msg}"`);
        showTypingIndicator();

        // Save locally
        try {
          const localFb = JSON.parse(localStorage.getItem('feedbacks') || '[]');
          localFb.unshift({
            rating: feedbackWizardState.rating,
            category: cat,
            message: msg,
            email: userEmail,
            date: new Date().toLocaleDateString()
          });
          localStorage.setItem('feedbacks', JSON.stringify(localFb));
        } catch (e) {}

        // Send to backend
        try {
          await fetch('/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: localStorage.getItem('currentUser') || 'Citizen',
              email: userEmail,
              category: cat,
              location: 'Civic Chat Assistant',
              rating: feedbackWizardState.rating,
              message: msg,
              anonymous: false
            })
          });
        } catch (err) {}

        feedbackWizardState.active = false;

        setTimeout(() => {
          hideTypingIndicator();
          const thankText = `🙏 <strong>Thank You for Your Feedback!</strong><br>Your rating of <strong>${feedbackWizardState.rating} / 5 stars</strong> has been recorded and forwarded to our Quality & Public Service Desk.`;
          appendMessage('bot', thankText, '', [
            { text: "File Damage Report 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
            { text: "Track Existing Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" },
            { text: "View Live Stats 📊", action: "show-stats", icon: "fa-chart-pie" }
          ]);
        }, 500);
      });
    }, 100);
  }

  // =====================================
  // 3. ACCOUNT, LOGIN & LOGOUT ASSISTANT
  // =====================================
  function handleAuthQuery() {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const currentUser = localStorage.getItem('currentUser');

    if (isLoggedIn && currentUser) {
      const text = `👤 <strong>Account Status: Signed In</strong><br>You are currently logged in as: <strong>${escapeHtml(currentUser)}</strong>.`;
      const cardHtml = `
        <div class="idrs-chat-card" style="border-left: 3px solid #10B981;">
          <div class="idrs-chat-card-title" style="color:#059669;">
            <i class="fas fa-circle-user"></i> Active Citizen Session
          </div>
          <div class="idrs-chat-card-desc">
            • <strong>Email / ID:</strong> ${escapeHtml(currentUser)}<br>
            • <strong>Access Level:</strong> Verified Citizen Reporter<br>
            • <strong>Portal Tools:</strong> Instant Reporting, History Tracking
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
            <a href="user-profile.html" class="idrs-chat-btn-action">
              <i class="fas fa-user-gear"></i> Open Profile
            </a>
            <button class="idrs-chat-btn-action" data-action="do-logout" style="background:#EF4444;">
              <i class="fas fa-right-from-bracket"></i> Sign Out / Logout
            </button>
          </div>
        </div>
      `;
      appendMessage('bot', text, cardHtml, [
        { text: "Log Out Now 🚪", action: "do-logout", icon: "fa-right-from-bracket" },
        { text: "File Report 📋", action: "report-wizard", icon: "fa-file-pen" }
      ]);
    } else {
      const text = `👤 <strong>Account Status: Guest Session</strong><br>You are not currently logged in. Signing in lets you keep track of all your submitted complaints and receive real-time notifications.`;
      const cardHtml = `
        <div class="idrs-chat-card">
          <div class="idrs-chat-card-title"><i class="fas fa-key" style="color:#2563EB;"></i> Authentication Options</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
            <a href="login-page.html" class="idrs-chat-btn-action">
              <i class="fas fa-right-to-bracket"></i> Sign In to Account
            </a>
            <a href="register.html" class="idrs-chat-btn-action" style="background:#10B981;">
              <i class="fas fa-user-plus"></i> Create Account
            </a>
            <a href="admin-login.html" class="idrs-chat-btn-action" style="background:#2F3B4A;">
              <i class="fas fa-shield-halved"></i> Admin Portal
            </a>
          </div>
        </div>
      `;
      appendMessage('bot', text, cardHtml, [
        { text: "Sign In 🔑", query: "Help me login", icon: "fa-right-to-bracket" },
        { text: "Create Account ✨", query: "Help me register an account", icon: "fa-user-plus" }
      ]);
    }
  }

  function handleLoginHelp() {
    appendMessage('bot', `To access your citizen portal, visit our secure Sign-In page below:`, `
      <div class="idrs-chat-card">
        <div class="idrs-chat-card-title"><i class="fas fa-lock" style="color:#2563EB;"></i> Citizen Login Portal</div>
        <div class="idrs-chat-card-desc">Sign in with your Email Address or Mobile Number and Password.</div>
        <div style="display:flex; gap:6px; margin-top:8px;">
          <a href="login-page.html" class="idrs-chat-btn-action"><i class="fas fa-right-to-bracket"></i> Go to Login Page</a>
          <a href="register.html" class="idrs-chat-btn-action" style="background:#10B981"><i class="fas fa-user-plus"></i> Register</a>
        </div>
      </div>
    `, [
      { text: "Check Login Status 👤", action: "auth-status", icon: "fa-user-check" }
    ]);
  }

  function performChatLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userToken");

    appendMessage('user', 'Sign out of my account.');
    showTypingIndicator();

    setTimeout(() => {
      hideTypingIndicator();
      const text = `🚪 <strong>Successfully Signed Out!</strong><br>Your session credentials have been cleared. You can continue using the portal as a guest or sign in again anytime.`;
      appendMessage('bot', text, ``, [
        { text: "Sign In Again 🔑", query: "Help me login", icon: "fa-right-to-bracket" },
        { text: "Report Damage 📋", action: "report-wizard", icon: "fa-file-pen" }
      ]);
    }, 400);
  }

  // =====================================
  // 4. LIVE PORTAL STATS & METRICS
  // =====================================
  async function handleLiveStatsQuery() {
    showTypingIndicator();

    let total = 142, resolved = 118, pending = 24, rate = 83;

    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          total = data.total || total;
          resolved = data.resolved || resolved;
          pending = data.pending || pending;
          rate = data.success_rate || rate;
        }
      }
    } catch (e) {}

    hideTypingIndicator();
    const text = `📊 <strong>Live Municipal Infrastructure Statistics:</strong>`;
    const cardHtml = `
      <div class="idrs-chat-card">
        <div class="idrs-stats-grid">
          <div class="idrs-stat-box">
            <div class="idrs-stat-num">${total}</div>
            <div class="idrs-stat-lbl">Total Reports</div>
          </div>
          <div class="idrs-stat-box">
            <div class="idrs-stat-num" style="color:#10B981;">${resolved}</div>
            <div class="idrs-stat-lbl">Resolved Cases</div>
          </div>
          <div class="idrs-stat-box">
            <div class="idrs-stat-num" style="color:#F59E0B;">${pending}</div>
            <div class="idrs-stat-lbl">In Progress / Pending</div>
          </div>
          <div class="idrs-stat-box">
            <div class="idrs-stat-num" style="color:#8B5CF6;">${rate}%</div>
            <div class="idrs-stat-lbl">Resolution Rate</div>
          </div>
        </div>
      </div>
    `;

    appendMessage('bot', text, cardHtml, [
      { text: "Report New Issue 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
      { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
      { text: "Track a Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" }
    ]);
  }

  // =====================================
  // 5. SAFETY TIPS & COMMUNITY GUIDELINES
  // =====================================
  function handleSafetyTipsQuery() {
    const text = `🛡️ <strong>Official Public Safety Guidelines:</strong>`;
    const cardHtml = `
      <div class="idrs-chat-card">
        <div class="idrs-chat-card-title"><i class="fas fa-triangle-exclamation" style="color:#F59E0B;"></i> Key Precautions</div>
        <div class="idrs-chat-card-desc">
          • <strong>Road Hazards:</strong> Slow down near asphalt craters and maintain braking distance.<br>
          • <strong>Flooding & Water:</strong> Never walk near open storm drains or submerged manholes.<br>
          • <strong>Electrical Lines:</strong> Stay at least 10 meters away from sagging or sparking wires.<br>
          • <strong>Bridge Cracks:</strong> Report structural fractures immediately for expert safety audit.
        </div>
        <a href="Safety-tips-page.html" class="idrs-chat-btn-action">
          <i class="fas fa-book-open"></i> Open Full Safety Handbook
        </a>
      </div>
    `;

    appendMessage('bot', text, cardHtml, [
      { text: "Report Dangerous Hazard 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
      { text: "Emergency Numbers 📞", query: "What are the emergency contact numbers?", icon: "fa-phone-volume" }
    ]);
  }

  // =====================================
  // MAIN CONVERSATIONAL NLP ENGINE
  // =====================================
  async function handleUserSubmission(queryText) {
    appendMessage('user', queryText);
    showTypingIndicator();

    const delay = Math.floor(Math.random() * 200) + 300;

    setTimeout(async () => {
      try {
        let aiReply = null;
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: queryText })
          });
          if (res.ok) {
            const data = await res.json();
            if (data && data.reply) {
              aiReply = data.reply;
            }
          }
        } catch (e) {}

        const responseData = await processCivicNLP(queryText);
        hideTypingIndicator();

        if (aiReply) {
          appendMessage('bot', aiReply, responseData.cardHtml || '', responseData.chips || []);
        } else {
          appendMessage('bot', responseData.text, responseData.cardHtml || '', responseData.chips || []);
        }
      } catch (err) {
        hideTypingIndicator();
        appendMessage('bot', "I am ready to help you with damage reporting, feedback submission, ticket tracking, and login assistance!", '', [
          { text: "Report Damage 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
          { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
          { text: "Track Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" }
        ]);
      }
    }, delay);
  }

  async function processCivicNLP(query) {
    const qLower = query.toLowerCase().trim();

    // 1. In-Chat Damage Report trigger
    if (qLower.includes('report') || qLower.includes('file damage') || qLower.includes('submit complaint') || qLower.includes('log issue')) {
      startInChatReportWizard();
      return { text: "" };
    }

    // 2. In-Chat Feedback trigger
    if (qLower.includes('feedback') || qLower.includes('suggestion') || qLower.includes('rate') || qLower.includes('review')) {
      startInChatFeedbackWizard();
      return { text: "" };
    }

    // 3. Login, Logout & Account
    if (qLower.includes('login') || qLower.includes('sign in') || qLower.includes('signin') || qLower.includes('password') || qLower.includes('account') || qLower.includes('register') || qLower.includes('signup')) {
      handleAuthQuery();
      return { text: "" };
    }

    if (qLower.includes('logout') || qLower.includes('sign out') || qLower.includes('signout')) {
      performChatLogout();
      return { text: "" };
    }

    // 4. Statistics & Metrics
    if (qLower.includes('stat') || qLower.includes('count') || qLower.includes('total report') || qLower.includes('metrics')) {
      await handleLiveStatsQuery();
      return { text: "" };
    }

    // 5. Safety Tips
    if (qLower.includes('safety') || qLower.includes('precaution') || qLower.includes('guideline') || qLower.includes('flood') || qLower.includes('rain')) {
      handleSafetyTipsQuery();
      return { text: "" };
    }

    // 6. Ticket Tracking / Status Lookup Pattern
    const ticketMatch = query.match(/(?:IDRS-\d{4}-\d{4,8}|report_\d+\.txt|report_\d+|\b\d{6}\b)/i);
    if (ticketMatch || qLower.includes('track') || qLower.includes('status') || qLower.includes('ticket')) {
      if (ticketMatch) {
        return await lookupTicketStatus(ticketMatch[0]);
      } else if (qLower.includes('track') && !ticketMatch) {
        return {
          text: `To track your damage report, enter your Reference Ticket ID (e.g. <strong>IDRS-2026-892410</strong>).`,
          cardHtml: `
            <div class="idrs-chat-card">
              <div class="idrs-chat-card-title"><i class="fas fa-barcode"></i> Tracking Portal</div>
              <div class="idrs-chat-card-desc">Click below to open the dedicated tracking dashboard.</div>
              <a href="track-report.html" class="idrs-chat-btn-action">
                <i class="fas fa-arrow-right"></i> Open Track Progress Page
              </a>
            </div>
          `,
          chips: [
            { text: "Track IDRS-2026-892410", query: "Track IDRS-2026-892410", icon: "fa-magnifying-glass" },
            { text: "File New Report 📋", action: "report-wizard", icon: "fa-file-pen" }
          ]
        };
      }
    }

    // 7. Emergency Helplines
    if (qLower.includes('emergency') || qLower.includes('police') || qLower.includes('ambulance') || qLower.includes('fire') || qLower.includes('danger') || qLower.includes('accident') || qLower.includes('helpline') || qLower.includes('contact')) {
      return {
        text: `Here are the official 24/7 emergency & municipal contacts:`,
        cardHtml: `
          <div class="idrs-chat-card" style="border-left: 3px solid #EF4444;">
            <div class="idrs-chat-card-title" style="color:#DC2626"><i class="fas fa-phone-volume"></i> 24/7 Helplines</div>
            <div class="idrs-chat-card-desc">
              • <strong>Police:</strong> 100<br>
              • <strong>Fire Brigade:</strong> 101<br>
              • <strong>Ambulance:</strong> 108<br>
              • <strong>Municipal Toll-Free:</strong> 1800-123-456<br>
              • <strong>Support Email:</strong> support@idrs.com
            </div>
            <a href="tel:1800123456" class="idrs-chat-btn-action" style="background:#DC2626">
              <i class="fas fa-phone"></i> Call Municipal Helpline
            </a>
          </div>
        `,
        chips: [
          { text: "Report Critical Hazard 📋", action: "report-wizard", icon: "fa-file-circle-plus" }
        ]
      };
    }

    // 8. Category Match in Knowledge Base
    for (const cat of IDRS_KNOWLEDGE.categories) {
      const isMatch = cat.keywords.some(keyword => qLower.includes(keyword));
      if (isMatch) {
        return {
          text: `I've categorized your inquiry under <strong>${cat.name}</strong>.`,
          cardHtml: `
            <div class="idrs-chat-card">
              <div class="idrs-chat-card-title"><i class="fas ${cat.icon}" style="color:#2563EB"></i> Department & Resolution SLA</div>
              <div class="idrs-chat-card-desc">
                • <strong>Assigned Authority:</strong> ${cat.department}<br>
                • <strong>Severity Level:</strong> <span style="color:${cat.severity === 'Critical' ? '#DC2626' : '#2563EB'}; font-weight:700">${cat.severity}</span><br>
                • <strong>Standard SLA:</strong> ${cat.sla}<br>
                • <strong>Tip:</strong> ${cat.advice}
              </div>
            </div>
          `,
          chips: [
            { text: `Report ${cat.name} 📋`, action: "report-wizard", icon: "fa-file-circle-plus" },
            { text: "Check SLA Timelines ⏱️", query: "How long does repair resolution take (SLA)?", icon: "fa-clock" }
          ]
        };
      }
    }

    // 9. SLA Timelines
    if (qLower.includes('time') || qLower.includes('sla') || qLower.includes('how long') || qLower.includes('duration') || qLower.includes('delay')) {
      return {
        text: `Our civic resolution timelines follow strict Municipal Service Level Agreements (SLA):`,
        cardHtml: `
          <div class="idrs-chat-card">
            <div class="idrs-chat-card-title"><i class="fas fa-stopwatch" style="color:#F59E0B"></i> Official Resolution SLAs</div>
            <div class="idrs-chat-card-desc">
              • <strong>Critical (Pipeline burst, Bridge cracks):</strong> 4 - 8 Hours<br>
              • <strong>High (Potholes, Dark Streetlights):</strong> 8 - 24 Hours<br>
              • <strong>Medium (Garbage, Blocked Drainage):</strong> 24 - 48 Hours<br>
              • <strong>Standard Maintenance:</strong> 3 - 5 Days
            </div>
          </div>
        `,
        chips: [
          { text: "Report an Issue 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
          { text: "Track Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" }
        ]
      };
    }

    // 10. Greetings / Help
    if (qLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|help)/)) {
      return {
        text: `Hello! How can I assist you with civic services today? You can report damage, submit feedback, track complaint progress, or manage your account.`,
        chips: [
          { text: "Report Damage 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
          { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
          { text: "Track Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" },
          { text: "Account / Login 👤", action: "auth-status", icon: "fa-user-shield" }
        ]
      };
    }

    // 11. Polite Fallback
    return {
      text: `I'm here to assist you across the entire IDRS portal. What would you like to do?`,
      chips: [
        { text: "Report Damage 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
        { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
        { text: "Track Ticket 🔍", query: "How can I track my ticket status?", icon: "fa-barcode" },
        { text: "Account & Login 👤", action: "auth-status", icon: "fa-user-shield" },
        { text: "Live Stats 📊", action: "show-stats", icon: "fa-chart-pie" }
      ]
    };
  }

  // Real-time Ticket Status Lookup
  async function lookupTicketStatus(ticketId) {
    let cleanId = ticketId.trim();

    try {
      const res = await fetch(`/report_status/${encodeURIComponent(cleanId)}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success) {
          const status = data.status || 'Pending';
          const dept = data.department || data.dept || 'Roads & Public Works';
          const cat = data.category || data.damageType || 'Civic Infrastructure';
          const date = data.date || 'Recently Filed';

          let statusColor = '#D97706';
          let step1Class = 'completed', step2Class = '', step3Class = '', step4Class = '';

          if (status.toLowerCase().includes('resolve')) {
            statusColor = '#10B981';
            step1Class = step2Class = step3Class = step4Class = 'completed';
          } else if (status.toLowerCase().includes('progress')) {
            statusColor = '#2563EB';
            step1Class = step2Class = 'completed';
            step3Class = 'active';
          } else {
            step1Class = 'active';
          }

          return {
            text: `Found official record for <strong>${escapeHtml(cleanId)}</strong>:`,
            cardHtml: `
              <div class="idrs-chat-card" style="border-left: 3px solid ${statusColor};">
                <div class="idrs-chat-card-title">
                  <i class="fas fa-file-lines"></i> Ticket: ${escapeHtml(cleanId)}
                </div>
                <div class="idrs-chat-card-desc">
                  • <strong>Status:</strong> <span style="color:${statusColor}; font-weight:700">${status}</span><br>
                  • <strong>Category:</strong> ${cat}<br>
                  • <strong>Assigned Dept:</strong> ${dept}<br>
                  • <strong>Filed Date:</strong> ${date}
                </div>

                <div class="idrs-stepper-wrap">
                  <div class="idrs-stepper-step ${step1Class}"><div class="idrs-stepper-dot"><i class="fas fa-check"></i></div><span class="idrs-stepper-label">Logged</span></div>
                  <div class="idrs-stepper-step ${step2Class}"><div class="idrs-stepper-dot">2</div><span class="idrs-stepper-label">Triage</span></div>
                  <div class="idrs-stepper-step ${step3Class}"><div class="idrs-stepper-dot">3</div><span class="idrs-stepper-label">Dispatch</span></div>
                  <div class="idrs-stepper-step ${step4Class}"><div class="idrs-stepper-dot">4</div><span class="idrs-stepper-label">Resolved</span></div>
                </div>

                <a href="track-report.html?id=${encodeURIComponent(cleanId)}" class="idrs-chat-btn-action">
                  <i class="fas fa-timeline"></i> View Full Timeline
                </a>
              </div>
            `,
            chips: [
              { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
              { text: "File Another Report 📋", action: "report-wizard", icon: "fa-file-circle-plus" }
            ]
          };
        }
      }
    } catch (e) {}

    try {
      const localReports = JSON.parse(localStorage.getItem('reports') || '[]');
      const found = localReports.find(r => r.report_id === cleanId || r.refId === cleanId || cleanId.includes(r.report_id || ''));
      if (found) {
        const status = found.status || 'Pending Review';
        const cat = found.category || found.damageType || 'General Infrastructure';
        return {
          text: `Found local record for ticket <strong>${escapeHtml(cleanId)}</strong>:`,
          cardHtml: `
            <div class="idrs-chat-card" style="border-left: 3px solid #2563EB;">
              <div class="idrs-chat-card-title"><i class="fas fa-file-shield"></i> Ticket: ${escapeHtml(cleanId)}</div>
              <div class="idrs-chat-card-desc">
                • <strong>Current Status:</strong> <span style="color:#2563EB; font-weight:700">${status}</span><br>
                • <strong>Category:</strong> ${cat}<br>
                • <strong>Filed:</strong> ${found.date || 'Recent'}
              </div>

              <div class="idrs-stepper-wrap">
                <div class="idrs-stepper-step active"><div class="idrs-stepper-dot"><i class="fas fa-check"></i></div><span class="idrs-stepper-label">Logged</span></div>
                <div class="idrs-stepper-step"><div class="idrs-stepper-dot">2</div><span class="idrs-stepper-label">Triage</span></div>
                <div class="idrs-stepper-step"><div class="idrs-stepper-dot">3</div><span class="idrs-stepper-label">Dispatch</span></div>
                <div class="idrs-stepper-step"><div class="idrs-stepper-dot">4</div><span class="idrs-stepper-label">Resolved</span></div>
              </div>

              <a href="track-report.html?id=${encodeURIComponent(cleanId)}" class="idrs-chat-btn-action">
                <i class="fas fa-magnifying-glass"></i> View Live Tracking
              </a>
            </div>
          `,
          chips: [
            { text: "File New Report 📋", action: "report-wizard", icon: "fa-file-circle-plus" }
          ]
        };
      }
    } catch (e) {}

    if (cleanId.includes('892410')) {
      return {
        text: `Found sample ticket record for <strong>${escapeHtml(cleanId)}</strong>:`,
        cardHtml: `
          <div class="idrs-chat-card" style="border-left: 3px solid #2563EB;">
            <div class="idrs-chat-card-title"><i class="fas fa-screwdriver-wrench"></i> In Progress (Repair Active)</div>
            <div class="idrs-chat-card-desc">
              • <strong>Category:</strong> Pothole / Road Hazard<br>
              • <strong>Assigned:</strong> Roads & Public Works Dept (Zone 4)<br>
              • <strong>Estimated SLA:</strong> Today, 6:00 PM
            </div>

            <div class="idrs-stepper-wrap">
              <div class="idrs-stepper-step completed"><div class="idrs-stepper-dot"><i class="fas fa-check"></i></div><span class="idrs-stepper-label">Logged</span></div>
              <div class="idrs-stepper-step completed"><div class="idrs-stepper-dot"><i class="fas fa-check"></i></div><span class="idrs-stepper-label">Triaged</span></div>
              <div class="idrs-stepper-step active"><div class="idrs-stepper-dot">3</div><span class="idrs-stepper-label">Dispatch</span></div>
              <div class="idrs-stepper-step"><div class="idrs-stepper-dot">4</div><span class="idrs-stepper-label">Resolved</span></div>
            </div>

            <a href="track-report.html?id=IDRS-2026-892410" class="idrs-chat-btn-action">
              <i class="fas fa-timeline"></i> Open Live Dashboard
            </a>
          </div>
        `,
        chips: [
          { text: "Submit Feedback ⭐", action: "feedback-wizard", icon: "fa-star" },
          { text: "File In-Chat Report 📋", action: "report-wizard", icon: "fa-file-circle-plus" }
        ]
      };
    }

    return {
      text: `I searched for Ticket ID <strong>${escapeHtml(cleanId)}</strong>, but couldn't find matching active records.`,
      cardHtml: `
        <div class="idrs-chat-card">
          <div class="idrs-chat-card-desc">Please check your reference number or file a fresh report right here!</div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <a href="track-report.html" class="idrs-chat-btn-action">Try Search Again</a>
            <button class="idrs-chat-btn-action" data-action="report-wizard" style="background:#2F3B4A">File In-Chat Report</button>
          </div>
        </div>
      `,
      chips: [
        { text: "Start In-Chat Report 📋", action: "report-wizard", icon: "fa-file-circle-plus" },
        { text: "Try Sample: 892410", query: "Track IDRS-2026-892410", icon: "fa-magnifying-glass" }
      ]
    };
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotUI);
  } else {
    createChatbotUI();
  }
})();
