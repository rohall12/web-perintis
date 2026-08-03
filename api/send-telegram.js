export default async function handler(req, res) {
  // Set CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, message } = req.body;

  // Read environment variables
  const rawToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  // 1. Cek apakah Environment Variable benar-benar terbaca di Vercel
  if (!rawToken || rawToken.trim() === '') {
    return res.status(500).json({
      error: 'DIAGNOSTIC ERROR: TELEGRAM_BOT_TOKEN tidak terbaca di Vercel (kosong/undefined). Pastikan nama variabel di Vercel Settings persis "TELEGRAM_BOT_TOKEN".'
    });
  }

  if (!rawChatId || rawChatId.trim() === '') {
    return res.status(500).json({
      error: 'DIAGNOSTIC ERROR: TELEGRAM_ADMIN_CHAT_ID tidak terbaca di Vercel (kosong/undefined).'
    });
  }

  // Clean values
  const botToken = rawToken.trim().replace(/^bot/i, '');
  const chatId = rawChatId.trim();

  const text = `📩 *Pesan Baru dari Website Portofolio*\n\n👤 *Nama:* ${name || 'Anonim'}\n📧 *Email:* ${email || '-'}\n💬 *Pesan:* ${message || '-'}`;

  const apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  try {
    const telegramRes = await fetch(apiUrl, {
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
        error: `Telegram Response Error (${telegramRes.status})`,
        telegram_response: data,
        called_url_snippet: `https://api.telegram.org/bot${botToken.substring(0, 5)}.../sendMessage`
      });
    }

    return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim ke Telegram!' });
  } catch (error) {
    return res.status(500).json({ error: `Server catch error: ${error.message}` });
  }
}