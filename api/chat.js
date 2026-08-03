const fs = require('fs');
const path = require('path');

// Fungsi membaca updates.json secara dinamis saat ada request
function getLatestUpdates() {
  try {
    const filePath = path.join(process.cwd(), 'updates.json');
    if (fs.existsSync(filePath)) {
      const fileData = fs.readFileSync(filePath, 'utf8');
      const updates = JSON.parse(fileData);
      return updates.map(item => `- [${item.date}] ${item.update}`).join('\n');
    }
  } catch (err) {
    console.error('Gagal membaca updates.json:', err.message);
  }
  return 'Belum ada catatan pembaruan terbaru.';
}

module.exports = async (req, res) => {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  // Ambil list update terbaru dari updates.json
  const webUpdatesText = getLatestUpdates();

  // Persona & Prompt
  const systemPrompt = {
    role: 'system',
    content: `Lu adalah asisten AI pribadi dari Roni (Roni Halla / Rohall) di situs "web ronihalla".

GAYA BAHASA & PERSONA:
- Bicara SANGAT SANTAI, CASUAL, dan NATURAL kaya temen sendiri lagi chat di WhatsApp / DM IG.
- Pakai kosa kata gaul/santai sehari-hari (contoh: "gw", "lu", "bree", "bro", "sih", "gitu", "anjay", "bebas", "palingan").
- Boleh pakai singkatan wajar orang chat (contoh: "yg", "aja", "buat", "gajadi", "bisa bgt").
- HINDARI gaya bahasa kaku, formal, atau bertele-tele kaya robot customer service (JANGAN pakai frasa kaya "Tentu!", "Saya adalah AI", "Ada yang bisa saya bantu?").
- Jawab langsung to the point, agak woles, tapi tetep ramah dan ngebantu.

INFORMASI WEB & UPDATE TERBARU:
Situs ini adalah web portofolio interaktif Roni.
Daftar update / pembaruan fitur web terbaru saat ini:
${webUpdatesText}

TUGAS:
1. Jawab pertanyaan soal Roni, skill, project, atau navigasi web.
2. Kalau ada yg nanya "ada update apa?", "fitur baru apa?", atau sejenisnya, jelasin update terbaru di atas pakai gaya bahasa santai lu sendiri.`
  };

  const payloadMessages = [
    systemPrompt,
    { role: 'user', content: message }
  ];

  // 1. OPSI UTAMA: Groq API
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
  } catch (err) {
    console.warn('Groq Error:', err.message);
  }

  // 2. OPSI CADANGAN: Fallback OpenRouter
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
    if (!openRouterResponse.ok) throw new Error(data.error?.message || 'OpenRouter Error');

    const reply = data.choices[0]?.message?.content;
    return res.status(200).json({ reply });

  } catch (error) {
    return res.status(500).json({ error: `Gagal memproses pesan: ${error.message}` });
  }
};