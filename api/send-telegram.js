export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nama, kontak, pesan } = req.body;
  if (!nama || !pesan) {
    return res.status(400).json({ error: 'Nama dan pesan wajib diisi' });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const textMessage = `📬 *Pesan Baru dari Portfolio*\n\n` +
                      `👤 *Nama:* ${nama}\n` +
                      `📞 *Kontak:* ${kontak || 'Tidak diisi'}\n` +
                      `💬 *Pesan:* ${pesan}`;

  try {
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMessage,
        parse_mode: 'Markdown'
      })
    });

    if (telegramRes.ok) {
      return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim' });
    } else {
      const errData = await telegramRes.json();
      return res.status(500).json({ error: errData.description || 'Gagal mengirim ke Telegram' });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}