export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

    if (!DISCORD_WEBHOOK_URL) {
        return res.status(500).json({ error: 'Discord Webhook URL belum diisi di Environment Variables!' });
    }

    const deviceData = req.body;

    // Ambil IP pengunjung dari request header Vercel
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Anonim';

    const discordEmbed = {
        username: "Device Tracker Bot 🚀",
        avatar_url: "https://cdn-icons-png.flaticon.com/512/681/681494.png",
        embeds: [{
            title: "🔔 Pengunjung Baru Masuk ke Web!",
            color: 3447003, // Warna Biru Elegan
            fields: [
                { name: "📱 Perangkat / Brand / Model", value: `\`${deviceData.deviceModel || 'Tidak Diketahui'}\``, inline: true },
                { name: "💻 Tipe Perangkat", value: deviceData.deviceType || 'Desktop/PC', inline: true },
                { name: "⚙️ Sistem Operasi (OS)", value: `\`${deviceData.osInfo || 'Tidak Diketahui'}\``, inline: true },
                { name: "🧠 Jumlah Core CPU", value: `\`${deviceData.cpuCores} Cores\``, inline: true },
                { name: "💾 Estimasi Ukuran RAM", value: `\`${deviceData.ramSize}\``, inline: true },
                { name: "📐 Resolusi & Skala Layar", value: `\`${deviceData.screenRes}\``, inline: true },
                { name: "🎮 GPU / Graphics Card", value: `\`${deviceData.gpuInfo || 'Tidak Diketahui'}\``, inline: false },
                { name: "🌐 IP Address Pengunjung", value: `\`${clientIp}\``, inline: true },
                { name: "🕒 Waktu Akses", value: new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) + ' WITA', inline: true },
                { name: "🔍 Full User Agent", value: `\`\`\`${deviceData.userAgent || '-'}\`\`\``, inline: false }
            ],
            footer: { text: "RoniHalla Portfolio Analytics System" },
            timestamp: new Date().toISOString()
        }]
    };

    try {
        await fetch(DISCORD_WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(discordEmbed)
        });

        return res.status(200).json({ success: true, message: 'Data perangkat berhasil dikirim ke Discord!' });
    } catch (err) {
        return res.status(500).json({ error: 'Gagal mengirim data ke Discord: ' + err.message });
    }
}