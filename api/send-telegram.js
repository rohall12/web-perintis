export default async function handler(req, res) {
  // 1. Validasi Method Request
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Ambil data dari body request
  const { nama, kontak, pesan } = req.body || {};
  if (!nama || !pesan) {
    return res.status(400).json({ error: 'Nama dan pesan wajib diisi' });
  }

  // 3. Ambil dan bersihkan token & chat_id dari Environment Variables
  const rawToken = process.env.TELEGRAM_BOT_TOKEN;
  const rawChatId = process.env.TELEGRAM_CHAT_ID;

  // Pengecekan eksplisit jika Environment Variable belum diisi di Vercel
  if (!rawToken || !rawChatId) {
    console.error('ERROR: TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum diatur di Vercel Settings.');
    return res.status(500).json({ 
      error: 'Konfigurasi server belum lengkap: TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum dipasang di Vercel.' 
    });
  }

  // Menghapus spasi yang tidak sengaja terbawa saat copy-paste
  const token = rawToken.trim();
  const chatId = rawChatId.trim();

  // 4. Sanitisasi karakter Markdown agar Telegram tidak error saat membaca simbol khusus
  const cleanNama = nama.replace(/[*_`\[\]]/g, '');
  const cleanKontak = (kontak || 'Tidak diisi').replace(/[*_`\[\]]/g, '');
  const cleanPesan = pesan.replace(/[*_`\[\]]/g, '');

  const textMessage = `📬 *Pesan Baru dari Portfolio*\n\n` +
                      `👤 *Nama:* ${cleanNama}\n` +
                      `📞 *Kontak:* ${cleanKontak}\n` +
                      `💬 *Pesan:* ${cleanPesan}`;

  try {
    // 5. Kirim request ke Telegram API
    const telegramRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMessage,
        parse_mode: 'Markdown'
      })
    });

    const data = await telegramRes.json();

    if (telegramRes.ok && data.ok) {
      return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim' });
    } else {
      console.error('Telegram API Error Response:', data);
      return res.status(telegramRes.status || 500).json({ 
        error: data.description || 'Gagal mengirim pesan ke Telegram' 
      });
    }
  } catch (error) {
    console.error('Internal Server Error:', error);
    return res.status(500).json({ error: error.message || 'Terjadi kesalahan pada server' });
  }
}