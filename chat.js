/* ============================================
   CHAT.JS — AI Chatbot Frontend Logic
   Handles chat UI, messaging, and LLM API calls
   ============================================ */

(function () {
  let chatMessages = [];
  let isStreaming = false;
  let portfolioData = null;

  // ─── Config ────────────────────────────────────
  const CHAT_CONFIG = {
    // Set your API endpoint here. For local dev, use a proxy or direct API call.
    // For production, use your serverless function endpoint: '/api/chat'
    // For direct DeepSeek (dev only — NOT recommended for production):
    apiEndpoint: '/api/chat',

    // Fallback: Direct API calls (set your key here for development only)
    // WARNING: Never expose API keys in production client-side code!
    directApi: {
      enabled: false, // Set to true for local development without a proxy
      provider: 'deepseek', // 'deepseek' or 'openrouter'
      deepseekKey: '', // Your DeepSeek API key (dev only)
      openrouterKey: '', // Your OpenRouter API key (dev only)
    },

    maxMessages: 20, // Max messages in context window
    maxTokens: 500,
    temperature: 0.7,
  };

  // ─── System Prompt Builder ─────────────────────
  function buildSystemPrompt(data) {
    return `Kamu adalah AI digital twin dari ${data.name} — seorang ${data.title}.
Kamu menjawab pertanyaan pengunjung portfolio tentang ${data.name.split(' ')[0]} dengan ramah, profesional, dan informatif.

## Aturan:
1. Jawab HANYA berdasarkan data yang diberikan di bawah. Jangan mengarang informasi.
2. Jika ditanya sesuatu yang tidak ada di data, bilang: "Maaf, saya tidak punya informasi tentang itu. Silakan hubungi ${data.name.split(' ')[0]} langsung melalui email ${data.email}."
3. Jawab dalam bahasa yang sama dengan pertanyaan (Indonesia/English).
4. Jaga jawaban singkat dan to the point (maks 3 paragraf).
5. Gunakan emoji secukupnya untuk kesan friendly 😊.
6. Jangan pernah mengaku sebagai manusia — kamu adalah AI assistant.
7. Jika ditanya "siapa kamu", jawab bahwa kamu adalah AI portfolio assistant dari ${data.name}.

## Data Portfolio ${data.name}:
- Nama: ${data.name}
- Title: ${data.title}
- Bio: ${data.bio}
- Lokasi: ${data.location}
- Email: ${data.email}
- Skills: ${JSON.stringify(data.skills)}
- Core Areas: ${data.core_areas.join(', ')}
- Projects: ${data.projects.map(p => `${p.name}: ${p.description}`).join('; ')}
- Experience: ${data.experience.map(e => `${e.role} di ${e.company} (${e.period}): ${e.description}`).join('; ')}
- Education: ${data.education.map(e => `${e.degree} - ${e.institution} (${e.period})`).join('; ')}
- Achievements: ${data.achievements.map(a => `${a.title} - ${a.event}`).join('; ')}`;
  }

  // ─── Load Data ─────────────────────────────────
  async function loadChatData() {
    try {
      const res = await fetch('data.json');
      portfolioData = await res.json();
    } catch (e) {
      console.error('Chat: Failed to load data.json', e);
    }
  }

  // ─── Chat UI ───────────────────────────────────
  function initChatUI() {
    const fab = document.getElementById('chat-fab');
    const drawer = document.getElementById('chat-drawer');
    const overlay = document.getElementById('chat-overlay');
    const closeBtn = document.getElementById('chat-close-btn');
    const sendBtn = document.getElementById('chat-send-btn');
    const input = document.getElementById('chat-input');

    if (!fab) return;

    fab.addEventListener('click', () => {
      drawer.classList.add('open');
      overlay.classList.add('show');
      input.focus();

      // Show welcome message on first open
      if (chatMessages.length === 0 && portfolioData) {
        addBotMessage(portfolioData.chat.welcome_message);
        showSuggestions();
      }
    });

    const closeChat = () => {
      drawer.classList.remove('open');
      overlay.classList.remove('show');
    };

    closeBtn.addEventListener('click', closeChat);
    overlay.addEventListener('click', closeChat);

    // Send message
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  function sendMessage() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg || isStreaming) return;

    addUserMessage(msg);
    input.value = '';

    // Remove suggestions
    const sugEl = document.querySelector('.chat-suggestions');
    if (sugEl) sugEl.remove();

    callLLM(msg);
  }

  function addUserMessage(text) {
    chatMessages.push({ role: 'user', content: text });
    appendMessageToUI('user', text);
  }

  function addBotMessage(text) {
    chatMessages.push({ role: 'assistant', content: text });
    appendMessageToUI('bot', text);
  }

  function appendMessageToUI(type, text) {
    const container = document.getElementById('chat-messages');
    const msgEl = document.createElement('div');
    msgEl.className = `chat-msg ${type}`;
    msgEl.textContent = text;
    container.appendChild(msgEl);
    container.scrollTop = container.scrollHeight;
  }

  function showSuggestions() {
    if (!portfolioData || !portfolioData.chat.suggested_questions) return;

    const container = document.getElementById('chat-messages');
    const sugWrap = document.createElement('div');
    sugWrap.className = 'chat-suggestions';

    portfolioData.chat.suggested_questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className = 'chat-suggestion-btn';
      btn.textContent = q;
      btn.addEventListener('click', () => {
        addUserMessage(q);
        sugWrap.remove();
        callLLM(q);
      });
      sugWrap.appendChild(btn);
    });

    container.appendChild(sugWrap);
    container.scrollTop = container.scrollHeight;
  }

  function showTypingIndicator() {
    const container = document.getElementById('chat-messages');
    const typing = document.createElement('div');
    typing.className = 'chat-msg bot typing';
    typing.id = 'typing-indicator';
    typing.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;
  }

  function removeTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
  }

  // ─── LLM API Call ──────────────────────────────
  async function callLLM(userMessage) {
    if (!portfolioData) {
      addBotMessage('Maaf, data portfolio belum dimuat. Coba refresh halaman.');
      return;
    }

    isStreaming = true;
    document.getElementById('chat-send-btn').disabled = true;
    showTypingIndicator();

    const systemPrompt = buildSystemPrompt(portfolioData);

    // Build messages array (limit to last N messages)
    const contextMessages = chatMessages.slice(-CHAT_CONFIG.maxMessages);
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages,
    ];

    try {
      let response;

      if (CHAT_CONFIG.directApi.enabled) {
        // Direct API call (development only)
        response = await callDirectAPI(apiMessages);
      } else {
        // Use serverless proxy
        response = await fetch(CHAT_CONFIG.apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: contextMessages }),
        });
      }

      removeTypingIndicator();

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.choices?.[0]?.message?.content
        || data.message?.content
        || 'Maaf, saya tidak bisa memproses permintaan Anda saat ini.';

      addBotMessage(botReply);

    } catch (error) {
      console.error('Chat API error:', error);
      removeTypingIndicator();

      // Fallback: offline response
      const offlineResponse = generateOfflineResponse(userMessage);
      addBotMessage(offlineResponse);
    }

    isStreaming = false;
    document.getElementById('chat-send-btn').disabled = false;
  }

  async function callDirectAPI(messages) {
    const config = CHAT_CONFIG.directApi;

    if (config.provider === 'deepseek' && config.deepseekKey) {
      return fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.deepseekKey}`,
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: messages,
          max_tokens: CHAT_CONFIG.maxTokens,
          temperature: CHAT_CONFIG.temperature,
          stream: false,
        }),
      });
    }

    if (config.provider === 'openrouter' && config.openrouterKey) {
      return fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openrouterKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Portfolio Chat',
        },
        body: JSON.stringify({
          model: 'openrouter/auto',
          messages: messages,
          max_tokens: CHAT_CONFIG.maxTokens,
          temperature: CHAT_CONFIG.temperature,
        }),
      });
    }

    throw new Error('No API key configured');
  }

  // ─── Offline Fallback ──────────────────────────
  function generateOfflineResponse(query) {
    if (!portfolioData) return 'Maaf, saya sedang offline. Silakan coba lagi nanti.';

    const q = query.toLowerCase();
    const d = portfolioData;

    if (q.includes('siapa') || q.includes('tentang') || q.includes('about') || q.includes('who')) {
      return `👋 ${d.greeting}! Saya adalah ${d.title}. ${d.bio}\n\n💡 Saat ini AI sedang offline, tapi Anda bisa menghubungi saya di ${d.email}`;
    }
    if (q.includes('skill') || q.includes('tech') || q.includes('bisa')) {
      return `🛠️ Core areas saya: ${d.core_areas.join(', ')}.\n\n💡 AI sedang offline — hubungi ${d.email} untuk detail lebih lanjut.`;
    }
    if (q.includes('project') || q.includes('buat') || q.includes('built')) {
      const projectList = d.projects.map(p => `• ${p.name}: ${p.description}`).join('\n');
      return `🚀 Project saya:\n${projectList}\n\n💡 AI sedang offline — cek section Projects untuk detail.`;
    }
    if (q.includes('kontak') || q.includes('contact') || q.includes('hubungi') || q.includes('email')) {
      return `📧 Anda bisa menghubungi saya di:\n• Email: ${d.email}\n• Phone: ${d.phone}\n• Lokasi: ${d.location}`;
    }
    if (q.includes('pengalaman') || q.includes('experience') || q.includes('kerja')) {
      const expList = d.experience.map(e => `• ${e.role} di ${e.company} (${e.period})`).join('\n');
      return `💼 Pengalaman kerja saya:\n${expList}`;
    }

    return `Terima kasih sudah bertanya! 😊\n\nSaat ini AI sedang offline. Anda bisa menghubungi ${d.name} langsung di ${d.email} atau cek section-section di portfolio ini untuk informasi lebih lengkap.`;
  }

  // ─── Init ──────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    loadChatData();
    initChatUI();
  });
})();
