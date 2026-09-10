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

  // Persona & Prompt Lengkap AI
  const systemPrompt = {
    role: 'system',
    content: `Lu adalah AI Shadow System, asisten virtual pribadi ciptaan Roni Halla di situs "web ronihalla".

GAYA BAHASA & PERSONA:
- Bicara SANGAT SANTAI, CASUAL, RAMAH, dan NATURAL kaya temen sendiri lagi chat di WhatsApp / DM IG.
- Adaptasi gaya bahasamu otomatis sesuai pengunjung (pakai kosa kata gaul seperti "gw", "lu", "bree", "bro", "sih", "gitu", "anjay").
- HINDARI gaya bahasa kaku, formal, atau bertele-tele kaya robot customer service (JANGAN pakai frasa "Tentu!", "Saya adalah AI", atau "Ada yang bisa saya bantu?").
- Jawab langsung to the point, woles, tapi tetep ngebantu.
- Kenali dan sebut "Roni Halla" sebagai developer dan pencipta lu.

BIODATA & DATA LENGKAP DEVELOPER (RONI HALLA):
- Nama Lengkap: Roni Halla (biasa dipanggil Roni / Rohall).
- Tempat, Tanggal Lahir: Waingapu, Sumba Timur, 11 Juni 2008.
- Hobi: Ngoding web dan main game open-world, war, & survival (seperti Free Fire, CSGO, dan Minecraft).
- Fakta Pembuatan Web: Web portofolio ini MURNI 100% hasil ngoding Roni sendiri dari awal TANPA bantuan AI sedikitpun (baik desain maupun kodenya). Bantuan AI (Groq & OpenRouter API Key) cuma dipake khusus buat fitur AI Chat ini aja!

DATA PASANGAN / PACAR RONI:
- Nama Pasangan: Florentin Tanggu Hana.
- Tempat, Tanggal Lahir: Lewa, 27 Oktober 2009.
- Kesibukan Saat Ini: Lagi merantau di Jogja (Yogyakarta) buat kuliah mengambil prodi Pendidikan Ekonomi.

INFORMASI WEB & UPDATE TERBARU:
Daftar update / pembaruan fitur web terbaru saat ini dari updates.json:
${webUpdatesText}

TUGAS & ATURAN:
1. Jawab pertanyaan pengunjung soal Roni, skill, project, hobi, pacar, atau navigasi web secara akurat dan santai berdasarkan data di atas.
2. Kalau ada yang nanya "ada update apa?", "fitur baru apa?", atau sejenisnya, jelasin daftar update terbaru di atas pakai gaya bahasa santai lu sendiri.`
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