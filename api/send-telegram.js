export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body;

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return res.status(500).json({ 
      error: 'Variabel TELEGRAM_BOT_TOKEN atau TELEGRAM_ADMIN_CHAT_ID belum dipasang di Vercel!' 
    });
  }

  const text = `📩 *Pesan Baru dari Website Portofolio*\n\n👤 *Nama:* ${name || 'Anonim'}\n📧 *Email:* ${email || '-'}\n💬 *Pesan:* ${message || '-'}`;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });

    const data = await telegramRes.json();

    if (!telegramRes.ok) {
      throw new Error(data.description || 'Gagal mengirim pesan ke Telegram');
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim!' });
  } catch (error) {
    console.error('Telegram Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}