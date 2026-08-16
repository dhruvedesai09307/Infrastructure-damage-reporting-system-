/**
 * ===================================================
 * IDRS Civic AI Chatbot Assistant - JavaScript Engine
 * ===================================================
 */

(function () {
  // Knowledge Base & Rule Matrix
  const IDRS_KNOWLEDGE = {
    greetings: [
      "Hello! I am your IDRS Civic AI Assistant. How can I help you report or track damage today?",
      "Hi there! Welcome to the Civic Infrastructure Portal. Ask me anything about reporting issues, tracking tickets, or emergency services.",
      "Greetings! Need assistance with a damaged road, water leakage, or tracking a complaint? I'm here to help."
    ],
    categories: [
      {
        keywords: ["pothole", "crater", "road break", "damaged road", "asphalt", "bump", "tar road", "highway", "street crack"],
        name: "Pothole / Road Hazard",
        department: "Roads & Highways Department",
        sla: "8 - 24 Hours",
        severity: "High",
        advice: "Please capture a clear photo showing the road surface and nearby landmark to speed up asphalt patching."
      },
      {
        keywords: ["water", "leak", "pipe", "burst", "drain", "drainage", "sewage", "gutter", "overflow", "flooding", "waterlogging", "manhole"],
        name: "Water Leakage & Drainage",
        department: "Water Supply & Sewerage Board",
        sla: "4 - 12 Hours",
        severity: "Critical",
        advice: "Open manholes and water main bursts are flagged as Critical emergencies. Nearby power lines will be isolated."
      },
      {
        keywords: ["light", "streetlight", "street light", "dark", "lamp", "electric", "pole", "wire", "spark", "transformer", "power"],
        name: "Streetlight & Electrical Grid",
        department: "Municipal Electricity Division",
        sla: "6 - 18 Hours",
        severity: "High",
        advice: "Do not touch fallen wires! Maintain a 10-meter distance. Our quick response team will be dispatched."
      },
      {
        keywords: ["bridge", "flyover", "pillar", "structural crack", "overpass", "culvert"],
        name: "Bridge & Structural Integrity",
        department: "Bridge Engineering & Safety Authority",
        sla: "2 - 6 Hours (Emergency Audit)",
        severity: "Critical",
        advice: "Structural defects are inspected by senior municipal structural engineers immediately."
      },
      {
        keywords: ["traffic", "signal", "sign", "traffic light", "zebra crossing", "divider", "barricade"],
        name: "Traffic Signals & Road Safety",
        department: "Traffic Engineering Cell",
        sla: "4 - 8 Hours",
        severity: "High",
        advice: "Malfunctioning signals are escalated directly to Traffic Police Control for temporary manual regulation."
      },
      {
        keywords: ["garbage", "trash", "waste", "debris", "dump", "smell", "sanitation", "dead animal"],
        name: "Solid Waste & Public Hygiene",
        department: "Sanitation & Public Health Bureau",
        sla: "12 - 24 Hours",
        severity: "Medium",
        advice: "Sanitation compactors operate daily in municipal zones."
      },
      {
        keywords: ["footpath", "sidewalk", "paver block", "pedestrian", "walkway"],
        name: "Footpath & Pedestrian Safety",
        department: "Civil Works & Public Pathways",
        sla: "2 - 5 Days",
        severity: "Medium",
        advice: "Pedestrian walkway maintenance helps prevent senior citizen accidents."
      }
    ],
    emergencies: {
      police: "100",
      fire: "101",
      ambulance: "108",
      municipalHelpline: "1800-123-456",
      email: "support@idrs.com"
    }
  };

  // Build & Inject Chatbot Widget DOM
  function createChatbotUI() {
    // Check if already injected
    if (document.getElementById('idrsChatbotContainer')) return;

    const container = document.createElement('div');
    container.id = 'idrsChatbotContainer';
    container.innerHTML = `
      <!-- Tooltip Notification -->
      <div id="idrsChatTooltip" class="idrs-chatbot-tooltip">
        <span>💬 Need help? Ask IDRS Assistant</span>
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
              <h4>IDRS Civic AI</h4>
              <div class="idrs-bot-status">
                <span class="status-dot"></span>
                <span>Active 24/7 Support</span>
              </div>
            </div>
          </div>
          <div class="idrs-header-actions">
            <button id="idrsClearChatBtn" class="idrs-hdr-btn" title="Clear Conversation">
              <i class="fas fa-trash-can"></i>
            </button>
            <button id="idrsCloseChatBtn" class="idrs-hdr-btn" title="Close">
              <i class="fas fa-minus"></i>
            </button>
          </div>
        </div>

        <!-- Quick Action Chips -->
        <div class="idrs-quick-chips-wrapper">
          <button class="idrs-chip" data-query="How do I report a damage?">
            <i class="fas fa-file-circle-plus"></i> Report Issue
          </button>
          <button class="idrs-chip" data-query="How can I track my ticket status?">
            <i class="fas fa-barcode"></i> Track Ticket
          </button>
          <button class="idrs-chip" data-query="I have a broken road or pothole problem">
            <i class="fas fa-road"></i> Pothole / Road
          </button>
          <button class="idrs-chip" data-query="Water pipe leakage or drainage overflow">
            <i class="fas fa-faucet-drip"></i> Water Leak
          </button>
          <button class="idrs-chip" data-query="What are the emergency contact numbers?">
            <i class="fas fa-phone-volume"></i> Emergency Helplines
          </button>
          <button class="idrs-chip" data-query="How long does resolution take (SLA)?">
            <i class="fas fa-clock"></i> Timelines & SLA
          </button>
        </div>

        <!-- Chat Body -->
        <div id="idrsChatBody" class="idrs-chat-body">
          <!-- Initial bot greeting is dynamically appended -->
        </div>

        <!-- Chat Input Footer -->
        <div class="idrs-chat-footer">
          <form id="idrsChatForm" class="idrs-chat-form">
            <input 
              type="text" 
              id="idrsChatInput" 
              class="idrs-chat-input" 
              placeholder="Describe your issue or enter Ticket ID..." 
              autocomplete="off"
            />
            <button type="submit" id="idrsSendBtn" class="idrs-send-btn" title="Send message">
              <i class="fas fa-paper-plane"></i>
            </button>
          </form>
        </div>
      </div>
    `;

    document.body.appendChild(container);
    attachChatbotEvents();
    showInitialGreeting();
  }

  // Event Handlers
  function attachChatbotEvents() {
    const toggleBtn = document.getElementById('idrsChatToggle');
    const chatWindow = document.getElementById('idrsChatWindow');
    const closeBtn = document.getElementById('idrsCloseChatBtn');
    const clearBtn = document.getElementById('idrsClearChatBtn');
    const chatForm = document.getElementById('idrsChatForm');
    const chatInput = document.getElementById('idrsChatInput');
    const tooltip = document.getElementById('idrsChatTooltip');

    // Show tooltip after 2.5 seconds
    setTimeout(() => {
      if (!chatWindow.classList.contains('open') && tooltip) {
        tooltip.classList.add('show');
        setTimeout(() => tooltip.classList.remove('show'), 5000);
      }
    }, 2500);

    // Toggle Chat Window
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

    clearBtn.addEventListener('click', () => {
      const body = document.getElementById('idrsChatBody');
      body.innerHTML = '';
      showInitialGreeting();
    });

    // Quick Chips Clicks
    document.querySelectorAll('.idrs-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const query = e.currentTarget.getAttribute('data-query');
        if (query) {
          handleUserSubmission(query);
        }
      });
    });

    // Form Submission
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      chatInput.value = '';
      handleUserSubmission(text);
    });
  }

  // Append User Message to UI
  function appendMessage(sender, text, cardHtml = '') {
    const chatBody = document.getElementById('idrsChatBody');
    if (!chatBody) return;

    const row = document.createElement('div');
    row.className = `idrs-msg-row ${sender === 'user' ? 'user-msg' : 'bot-msg'}`;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (sender === 'bot') {
      row.innerHTML = `
        <div class="idrs-msg-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div>
          <div class="idrs-msg-bubble">
            <div>${text}</div>
            ${cardHtml}
          </div>
          <div class="idrs-msg-time">${timeStr}</div>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div>
          <div class="idrs-msg-bubble">
            <div>${escapeHtml(text)}</div>
          </div>
          <div class="idrs-msg-time">${timeStr}</div>
        </div>
      `;
    }

    chatBody.appendChild(row);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  // Show Typing Indicator
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
    const introCard = `
      <div class="idrs-chat-card">
        <div class="idrs-chat-card-title">
          <i class="fas fa-shield-alt" style="color:#2563EB"></i> IDRS Quick Actions
        </div>
        <div class="idrs-chat-card-desc">
          Tell me your problem in natural language (e.g. <em>"broken water pipe in zone 2"</em>) or paste a Ticket ID to track progress.
        </div>
        <div style="display:flex; gap:6px; margin-top:8px; flex-wrap:wrap;">
          <a href="report.html" class="idrs-chat-btn-action">
            <i class="fas fa-plus-circle"></i> File Damage Report
          </a>
          <a href="track-report.html" class="idrs-chat-btn-action" style="background:#2F3B4A">
            <i class="fas fa-magnifying-glass"></i> Track Ticket
          </a>
        </div>
      </div>
    `;
    appendMessage('bot', greeting, introCard);
  }

  // NLP & Response Generation Engine
  async function handleUserSubmission(queryText) {
    appendMessage('user', queryText);
    showTypingIndicator();

    // Natural typing delay
    const delay = Math.floor(Math.random() * 200) + 300;

    setTimeout(async () => {
      try {
        // Try backend AI route if active
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
          appendMessage('bot', aiReply, responseData.cardHtml || '');
        } else {
          appendMessage('bot', responseData.text, responseData.cardHtml || '');
        }
      } catch (err) {
        hideTypingIndicator();
        appendMessage('bot', "I'm having a slight trouble connecting, but you can always directly submit a damage report or track existing complaints.", `
          <div class="idrs-chat-card">
            <a href="report.html" class="idrs-chat-btn-action">Report Damage</a>
          </div>
        `);
      }
    }, delay);
  }

  async function processCivicNLP(query) {
    const qLower = query.toLowerCase().trim();

    // 1. Ticket Tracking / Status Lookup Pattern (IDRS-..., report_..., or 6-digit number)
    const ticketMatch = query.match(/(?:IDRS-\d{4}-\d{4,8}|report_\d+\.txt|report_\d+|\b\d{6}\b)/i);
    if (ticketMatch || qLower.includes('track') || qLower.includes('status') || qLower.includes('complaint id') || qLower.includes('ticket')) {
      if (ticketMatch) {
        const ticketId = ticketMatch[0];
        const statusResult = await lookupTicketStatus(ticketId);
        return statusResult;
      } else if (qLower.includes('track') && !ticketMatch) {
        return {
          text: `To track your damage report, enter your Reference Ticket ID (e.g. <strong>IDRS-2026-892410</strong> or <strong>report_1.txt</strong>).`,
          cardHtml: `
            <div class="idrs-chat-card">
              <div class="idrs-chat-card-title"><i class="fas fa-barcode"></i> Tracking Portal</div>
              <div class="idrs-chat-card-desc">Click below to open the live tracking dashboard.</div>
              <a href="track-report.html" class="idrs-chat-btn-action">
                <i class="fas fa-arrow-right"></i> Open Track Progress Page
              </a>
            </div>
          `
        };
      }
    }

    // 2. Emergency Helplines
    if (qLower.includes('emergency') || qLower.includes('police') || qLower.includes('ambulance') || qLower.includes('fire') || qLower.includes('danger') || qLower.includes('accident') || qLower.includes('helpline') || qLower.includes('contact')) {
      return {
        text: `Here are the official 24/7 emergency & municipal contacts for civic emergencies:`,
        cardHtml: `
          <div class="idrs-chat-card" style="border-left: 3px solid #EF4444;">
            <div class="idrs-chat-card-title" style="color:#DC2626"><i class="fas fa-phone-volume"></i> Emergency Numbers</div>
            <div class="idrs-chat-card-desc">
              • <strong>Police:</strong> 100<br>
              • <strong>Fire Brigade:</strong> 101<br>
              • <strong>Ambulance:</strong> 108<br>
              • <strong>Municipal Toll-Free:</strong> 1800-123-456<br>
              • <strong>Email:</strong> support@idrs.com
            </div>
            <a href="tel:1800123456" class="idrs-chat-btn-action" style="background:#DC2626">
              <i class="fas fa-phone"></i> Call Municipal Helpline
            </a>
          </div>
        `
      };
    }

    // 3. Category Match in Knowledge Base
    for (const cat of IDRS_KNOWLEDGE.categories) {
      const isMatch = cat.keywords.some(keyword => qLower.includes(keyword));
      if (isMatch) {
        const encodedCat = encodeURIComponent(cat.name);
        return {
          text: `I've categorized your problem under <strong>${cat.name}</strong>.`,
          cardHtml: `
            <div class="idrs-chat-card">
              <div class="idrs-chat-card-title"><i class="fas fa-building-circle-check" style="color:#2563EB"></i> Department & SLA</div>
              <div class="idrs-chat-card-desc">
                • <strong>Assigned Authority:</strong> ${cat.department}<br>
                • <strong>Severity Level:</strong> <span style="color:${cat.severity === 'Critical' ? '#DC2626' : '#2563EB'}; font-weight:700">${cat.severity}</span><br>
                • <strong>Resolution SLA:</strong> ${cat.sla}<br>
                • <strong>Guideline:</strong> ${cat.advice}
              </div>
              <a href="report.html?category=${encodedCat}" class="idrs-chat-btn-action">
                <i class="fas fa-file-pen"></i> Submit Report For This Issue
              </a>
            </div>
          `
        };
      }
    }

    // 4. How to Report / Upload Photos / General Guidance
    if (qLower.includes('how to report') || qLower.includes('submit') || qLower.includes('file report') || qLower.includes('step') || qLower.includes('guide')) {
      return {
        text: `Submitting a report is simple and takes less than 2 minutes:`,
        cardHtml: `
          <div class="idrs-chat-card">
            <div class="idrs-chat-card-title"><i class="fas fa-list-check" style="color:#10B981"></i> 4 Simple Steps</div>
            <div class="idrs-chat-card-desc">
              1. <strong>Select Category:</strong> Choose road, water, bridge, electrical, etc.<br>
              2. <strong>Upload Photo:</strong> Take a clear photo in daylight.<br>
              3. <strong>Pin Location:</strong> Enter address or use GPS assistance.<br>
              4. <strong>Get Ticket ID:</strong> Save your unique ID to track status.
            </div>
            <a href="report.html" class="idrs-chat-btn-action">
              <i class="fas fa-plus"></i> Go to Report Page
            </a>
          </div>
        `
      };
    }

    // 5. Image requirements
    if (qLower.includes('photo') || qLower.includes('image') || qLower.includes('upload') || qLower.includes('format') || qLower.includes('camera')) {
      return {
        text: `You can upload up to 5 photos per report in <strong>JPG, JPEG, or PNG</strong> format (up to 10MB each). Clear daylight photos showing the surrounding landmark help field crews resolve the complaint much faster.`
      };
    }

    // 6. SLA & Timelines
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
        `
      };
    }

    // 7. Feedback / Suggestions
    if (qLower.includes('feedback') || qLower.includes('suggestion') || qLower.includes('complaint about') || qLower.includes('rating')) {
      return {
        text: `We value citizen feedback to improve infrastructure services. You can submit your feedback directly on our Feedback page.`,
        cardHtml: `
          <div class="idrs-chat-card">
            <a href="feedback-and-suggestion-page.html" class="idrs-chat-btn-action">
              <i class="fas fa-comment-dots"></i> Open Feedback Form
            </a>
          </div>
        `
      };
    }

    // 8. Polite / Casual Greetings
    if (qLower.match(/^(hi|hello|hey|good morning|good afternoon|good evening|namaste|help)/)) {
      return {
        text: `Hello! How can I assist you with civic infrastructure reporting today? You can ask me how to report a defect, check complaint progress, or find emergency contacts.`
      };
    }

    if (qLower.includes('thank') || qLower.includes('thanks') || qLower.includes('bye') || qLower.includes('great')) {
      return {
        text: `You're very welcome! If you spot any civic damage or road hazard in your area, remember to report it on IDRS to keep our city safe.`
      };
    }

    // 9. Generic Intelligent Fallback with Smart Actions
    return {
      text: `I understand you're inquiring about: <em>"${escapeHtml(query)}"</em>.<br><br>Would you like to file a new damage report or check the status of an existing ticket?`,
      cardHtml: `
        <div class="idrs-chat-card">
          <div class="idrs-chat-card-title"><i class="fas fa-hand-holding-hand" style="color:#2563EB"></i> Recommended Options</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
            <a href="report.html" class="idrs-chat-btn-action">
              <i class="fas fa-file-pen"></i> Submit Damage Report
            </a>
            <a href="track-report.html" class="idrs-chat-btn-action" style="background:#2F3B4A">
              <i class="fas fa-barcode"></i> Track Complaint
            </a>
            <a href="feedback-and-suggestion-page.html" class="idrs-chat-btn-action" style="background:#4B5563">
              <i class="fas fa-envelope"></i> Contact Support
            </a>
          </div>
        </div>
      `
    };
  }

  // Real-time Ticket Status Lookup
  async function lookupTicketStatus(ticketId) {
    let cleanId = ticketId.trim();

    // Check backend server first
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
          if (status.toLowerCase().includes('resolve')) statusColor = '#10B981';
          if (status.toLowerCase().includes('progress')) statusColor = '#2563EB';

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
                <a href="track-report.html?id=${encodeURIComponent(cleanId)}" class="idrs-chat-btn-action">
                  <i class="fas fa-timeline"></i> View Full Resolution Timeline
                </a>
              </div>
            `
          };
        }
      }
    } catch (e) {
      console.warn('Backend server lookup check:', e);
    }

    // Check localStorage fallback
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
              <a href="track-report.html?id=${encodeURIComponent(cleanId)}" class="idrs-chat-btn-action">
                <i class="fas fa-magnifying-glass"></i> View Live Tracking
              </a>
            </div>
          `
        };
      }
    } catch (e) {}

    // Demo Sample Tickets support
    if (cleanId.includes('892410')) {
      return {
        text: `Found sample ticket record for <strong>${escapeHtml(cleanId)}</strong>:`,
        cardHtml: `
          <div class="idrs-chat-card" style="border-left: 3px solid #2563EB;">
            <div class="idrs-chat-card-title"><i class="fas fa-screwdriver-wrench"></i> In Progress (Repair Active)</div>
            <div class="idrs-chat-card-desc">
              • <strong>Category:</strong> Pothole / Road Hazard<br>
              • <strong>Assigned:</strong> Roads & Public Works Dept (Zone 4)<br>
              • <strong>Inspector:</strong> Inspector R. K. Patel<br>
              • <strong>Estimated SLA:</strong> Today, 6:00 PM (On Schedule)
            </div>
            <a href="track-report.html?id=IDRS-2026-892410" class="idrs-chat-btn-action">
              <i class="fas fa-timeline"></i> Open Live Dashboard
            </a>
          </div>
        `
      };
    } else if (cleanId.includes('471029')) {
      return {
        text: `Found sample ticket record for <strong>${escapeHtml(cleanId)}</strong>:`,
        cardHtml: `
          <div class="idrs-chat-card" style="border-left: 3px solid #10B981;">
            <div class="idrs-chat-card-title" style="color:#10B981"><i class="fas fa-circle-check"></i> Case Resolved</div>
            <div class="idrs-chat-card-desc">
              • <strong>Category:</strong> Streetlight Malfunction<br>
              • <strong>Resolution:</strong> New LED Fixture Installed & Audited<br>
              • <strong>Completed On:</strong> August 12, 2026
            </div>
            <a href="track-report.html?id=IDRS-2026-471029" class="idrs-chat-btn-action">
              <i class="fas fa-clipboard-check"></i> View Case Certificate
            </a>
          </div>
        `
      };
    }

    return {
      text: `I searched for Ticket ID <strong>${escapeHtml(cleanId)}</strong>, but could not find matching active records.`,
      cardHtml: `
        <div class="idrs-chat-card">
          <div class="idrs-chat-card-desc">Please double check your reference number or file a fresh report if needed.</div>
          <div style="display:flex; gap:6px; margin-top:6px;">
            <a href="track-report.html" class="idrs-chat-btn-action">Try Search Again</a>
            <a href="report.html" class="idrs-chat-btn-action" style="background:#2F3B4A">File New Report</a>
          </div>
        </div>
      `
    };
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
  }

  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createChatbotUI);
  } else {
    createChatbotUI();
  }
})();
