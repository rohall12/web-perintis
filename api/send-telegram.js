export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body;

  // Mengambil data dari Environment Variables Vercel
  const rawToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID;

  // Proteksi jika variabel belum diisi di Vercel
  if (!rawToken || rawToken.trim() === '') {
    return res.status(500).json({ error: 'TELEGRAM_BOT_TOKEN belum diisi atau tidak terbaca di Vercel!' });
  }

  if (!rawChatId || rawChatId.trim() === '') {
    return res.status(500).json({ error: 'TELEGRAM_ADMIN_CHAT_ID belum diisi atau tidak terbaca di Vercel!' });
  }

  // Bersihkan token dari kata "bot" jika tidak sengaja terikut di Vercel
  const botToken = rawToken.trim().replace(/^bot/i, '');
  const chatId = rawChatId.trim();

  const text = `📩 *Pesan Baru dari Website Portofolio*\n\n👤 *Nama:* ${name || 'Anonim'}\n📧 *Email:* ${email || '-'}\n💬 *Pesan:* ${message || '-'}`;

  // Konstruksi URL Telegram yang presisi
  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const telegramRes = await fetch(telegramUrl, {
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
      return res.status(telegramRes.status).json({
        error: `Telegram Error: ${data.description || 'Gagal mengirim pesan'}`,
        details: data
      });
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim ke Telegram!' });
  } catch (error) {
    return res.status(500).json({ error: `Server Error: ${error.message}` });
  }
}