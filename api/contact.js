export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, message } = req.body;

    if (!name || !message) {
        return res.status(400).json({ error: 'Nama dan pesan wajib diisi!' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!webhookUrl) {
        return res.status(500).json({ error: 'DISCORD_WEBHOOK_URL belum diset di Vercel' });
    }

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
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
            })
        });

        if (!response.ok) throw new Error('Gagal ngirim ke Discord');

        return res.status(200).json({ success: true, message: 'Pesan terkirim!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}