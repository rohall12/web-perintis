module.exports = async (req, res) => {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // 1. OPSI UTAMA: Coba panggil Groq API dulu
  try {
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: message }],
      }),
    });

    if (groqResponse.ok) {
      const data = await groqResponse.json();
      const reply = data.choices[0]?.message?.content;
      if (reply) return res.status(200).json({ reply });
    }

    console.warn('Groq API gagal/rate limit. Mengalihkan ke OpenRouter...');
  } catch (err) {
    console.warn('Error koneksi Groq:', err.message);
  }

  // 2. OPSI CADANGAN: Fallback ke OpenRouter jika Groq gagal
  try {
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free', // Model gratis dari OpenRouter
        messages: [{ role: 'user', content: message }],
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
      error: `Kedua AI Service (Groq & OpenRouter) gagal dipanggil. Detail: ${error.message}`
    });
  }
};