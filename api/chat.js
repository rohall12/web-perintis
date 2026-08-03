module.exports = async (req, res) => {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // System Prompt untuk memberi konteks & persona pada AI
  const systemPrompt = {
    role: 'system',
    content: `Kamu adalah AI Assistant di website portofolio milik Roni (Roni Halla / Rohall).
Website ini ("web ronihalla" / "web-perintis") adalah situs portofolio interaktif Roni.

Fungsi utama website ini:
1. Menampilkan profil, skill/keahlian, dan daftar project yang pernah dibuat Roni.
2. Memfasilitasi pengunjung untuk berdiskusi, bertanya tentang project, skill, latar belakang Roni, maupun topik pemrograman & teknologi.
3. Menampilkan informasi kontak dan tautan media sosial Roni.

Instruksi gaya bahasa:
- Gunakan bahasa Indonesia yang santai, akrab, ramah, dan responsif (boleh gunakan panggilan "bree" atau "bro" jika pengguna menyapa secara santai).
- Jika pengguna bertanya cara menggunakan web ini, jelaskan navigasinya (melihat project, skill, kontak, dan menggunakan fitur chat ini untuk berdiskusi/bertanya).`
  };

  const payloadMessages = [
    systemPrompt,
    { role: 'user', content: message }
  ];

  // 1. OPSI UTAMA: Call Groq API
  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: payloadMessages,
      }),
    });

    if (groqResponse.ok) {
      const data = await groqResponse.json();
      const reply = data.choices[0]?.message?.content;
      if (reply) return res.status(200).json({ reply });
    }

    console.warn('Groq API gagal/rate limit. Beralih ke OpenRouter...');
  } catch (err) {
    console.warn('Error koneksi Groq:', err.message);
  }

  // 2. OPSI CADANGAN: Fallback ke OpenRouter
  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: payloadMessages,
      }),
    });

    const data = await openRouterResponse.json();

    if (!openRouterResponse.ok) {
      throw new Error(data.error?.message || 'Gagal terhubung ke OpenRouter API');
    }

    const reply = data.choices[0]?.message?.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({
      error: `Gagal memproses pesan. Detail: ${error.message}`
    });
  }
};