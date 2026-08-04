export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ error: 'Nama dan pesan wajib diisi!' });
    }

    const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!TELEGRAM_TOKEN || !TELEGRAM_CHAT_ID) {
        return res.status(500).json({ error: 'Konfigurasi Telegram belum diset di Environment Variables!' });
    }

    const telegramMsg = `📩 *Pesan Baru dari Web Portofolio*\n\n👤 *Nama:* ${name}\n📧 *Kontak:* ${email || 'Tidak diisi'}\n💬 *Pesan:* ${message}`;

    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMsg,
                parse_mode: 'Markdown'
            })
        });

        return res.status(200).json({ success: true, message: 'Pesan berhasil dikirim ke Telegram!' });
    } catch (err) {
        return res.status(500).json({ error: 'Gagal mengirim pesan ke Telegram: ' + err.message });
    }
}