export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ error: 'Nama dan pesan wajib diisi!' });
    }

    const discordUrl = process.env.DISCORD_WEBHOOK_URL;
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;

    // Array untuk menampung proses pengiriman paralel
    const sendPromises = [];

    // 1. Logika Pengiriman ke Discord
    if (discordUrl) {
        const discordPayload = {
            username: "Portofolio Notifier 🚀",
            embeds: [{
                title: "📩 Pesan Baru Masuk!",
                color: 3447003,
                fields: [
                    { name: "👤 Pengirim", value: name, inline: true },
                    { name: "✉️ Email", value: email || "Tidak diisi", inline: true },
                    { name: "💬 Pesan", value: message }
                ],
                footer: { text: "Roni Halla Portfolio System" },
                timestamp: new Date().toISOString()
            }]
        };

        sendPromises.push(
            fetch(discordUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(discordPayload)
            })
        );
    }

    // 2. Logika Pengiriman ke Telegram
    if (telegramToken && telegramChatId) {
        const telegramText = `📩 *Pesan Baru dari Web Portofolio*\n\n👤 *Nama:* ${name}\n✉️ *Email:* ${email || 'Tidak diisi'}\n💬 *Pesan:*\n${message}`;
        const telegramUrl = `https://api.telegram.org/bot${telegramToken}/sendMessage`;

        sendPromises.push(
            fetch(telegramUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: telegramChatId,
                    text: telegramText,
                    parse_mode: 'Markdown'
                })
            })
        );
    }

    try {
        // Jalankan pengiriman ke Telegram & Discord secara bersamaan
        await Promise.all(sendPromises);
        return res.status(200).json({ success: true, message: 'Pesan berhasil terkirim ke Telegram & Discord!' });
    } catch (error) {
        return res.status(500).json({ error: 'Gagal mengirim notifikasi: ' + error.message });
    }
}