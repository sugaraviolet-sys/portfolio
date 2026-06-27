// Vercel Serverless Function — AI Chat Proxy
// Deploy: place in /api/chat.js, Vercel auto-detects it as a function
// Set env vars: DEEPSEEK_API_KEY, OPENROUTER_API_KEY (optional)

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  // Simple rate limiting (in-memory, resets on cold start)
  const clientIP = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';
  if (isRateLimited(clientIP)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a moment.' });
  }

  try {
    // Load portfolio data for system prompt context
    const portfolioData = await loadPortfolioData(req);
    const systemPrompt = buildSystemPrompt(portfolioData);

    // Prepend system message
    const fullMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.slice(-15), // Keep last 15 messages for context
    ];

    // Try DeepSeek first, fallback to OpenRouter
    let result;
    try {
      result = await callDeepSeek(fullMessages);
    } catch (deepseekError) {
      console.error('DeepSeek failed, trying OpenRouter:', deepseekError.message);
      try {
        result = await callOpenRouter(fullMessages);
      } catch (openrouterError) {
        console.error('OpenRouter also failed:', openrouterError.message);
        throw new Error('All LLM providers failed');
      }
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Chat API error:', error);
    return res.status(500).json({
      choices: [{
        message: {
          content: 'Maaf, AI sedang tidak tersedia saat ini. Silakan hubungi saya langsung melalui email. 😊'
        }
      }]
    });
  }
}

// ─── LLM Providers ─────────────────────────────

async function callDeepSeek(messages) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error('DEEPSEEK_API_KEY not configured');

  const response = await fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errText}`);
  }

  return await response.json();
}

async function callOpenRouter(messages) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not configured');

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.SITE_URL || 'https://indrasugara.com',
      'X-Title': 'Indra Sugara Portfolio',
    },
    body: JSON.stringify({
      model: 'openrouter/auto',
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error ${response.status}: ${errText}`);
  }

  return await response.json();
}

// ─── System Prompt Builder ──────────────────────

function buildSystemPrompt(data) {
  if (!data) {
    return 'You are a helpful portfolio assistant. Answer questions about the portfolio owner.';
  }

  return `Kamu adalah AI digital twin dari ${data.name} — seorang ${data.title}.
Kamu menjawab pertanyaan pengunjung portfolio tentang ${data.name.split(' ')[0]} dengan ramah, profesional, dan informatif.

## Aturan:
1. Jawab HANYA berdasarkan data yang diberikan di bawah. Jangan mengarang informasi.
2. Jika ditanya sesuatu yang tidak ada di data, bilang: "Maaf, saya tidak punya informasi tentang itu. Silakan hubungi ${data.name.split(' ')[0]} langsung melalui email ${data.email}."
3. Jawab dalam bahasa yang sama dengan pertanyaan (Indonesia/English).
4. Jaga jawaban singkat (maks 3 paragraf).
5. Gunakan emoji secukupnya untuk kesan friendly.
6. Jangan pernah mengaku sebagai manusia — kamu adalah AI assistant.

## Data Portfolio:
- Nama: ${data.name}
- Title: ${data.title}
- Subtitle: ${data.subtitle}
- Bio: ${data.bio}
- Lokasi: ${data.location}
- Email: ${data.email}
- Phone: ${data.phone}
- Core Areas: ${(data.core_areas || []).join(', ')}
- Skills Programming: ${(data.skills?.programming || []).map(s => s.name).join(', ')}
- Skills Frontend: ${(data.skills?.frontend || []).map(s => s.name).join(', ')}
- Skills Backend: ${(data.skills?.backend || []).map(s => s.name).join(', ')}
- Skills Cloud: ${(data.skills?.cloud || []).map(s => s.name).join(', ')}
- Tools: ${(data.skills?.tools || []).join(', ')}
- Projects: ${(data.projects || []).map(p => `${p.name} (${p.tech_stack.map(t => t.name).join(', ')}): ${p.description}`).join(' | ')}
- Experience: ${(data.experience || []).map(e => `${e.role} di ${e.company} (${e.period})`).join(' | ')}
- Education: ${(data.education || []).map(e => `${e.degree} - ${e.institution} (${e.period}, ${e.score})`).join(' | ')}
- Achievements: ${(data.achievements || []).map(a => `${a.title} (${a.event})`).join(' | ')}`;
}

// ─── Load Portfolio Data ────────────────────────

async function loadPortfolioData(req) {
  try {
    // Try to load data.json from the same deployment
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.headers.host;
    const url = `${protocol}://${host}/data.json`;

    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.warn('Could not load data.json from deployment, using minimal context');
  }
  return null;
}

// ─── Rate Limiting ──────────────────────────────

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX = 10; // max 10 requests per minute

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  if (now - record.start > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, start: now });
    return false;
  }

  record.count++;
  if (record.count > RATE_LIMIT_MAX) {
    return true;
  }

  return false;
}
