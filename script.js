/**
 * RoniHalla Portfolio - Security, Anti-Spam & Visitor Telemetry System
 * Features: Deep Device Detection, IP Geolocation, Anti-Spam Honeypot, Session Cookies & Telegram Alerts.
 */

// CONFIGURASI BOT TELEGRAM (Ganti dengan Token & Chat ID milikmu)
const TELEGRAM_CONFIG = {
    BOT_TOKEN: '7823338870:AAEk1...', // <-- Masukkan Token Bot Telegram kamu di sini
    CHAT_ID: '6123456789'             <!-- Masukkan Chat ID Telegram kamu di sini
};

// ==========================================
// 1. DETEKSI SPESIFIKASI PERANGKAT & HARDWARE
// ==========================================
function getHardwareSpecs() {
    const ua = navigator.userAgent;
    let deviceType = "Desktop / Laptop PC";
    let osName = "Unknown OS";
    let browserName = "Unknown Browser";

    // 1. Deteksi Tipe Perangkat
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        deviceType = "Smartphone / Mobile HP";
    }

    // 2. Deteksi Sistem Operasi (OS)
    if (ua.indexOf("Win") !== -1) osName = "Windows PC";
    else if (ua.indexOf("Mac") !== -1) osName = "macOS / Apple";
    else if (ua.indexOf("Android") !== -1) osName = "Android OS";
    else if (ua.indexOf("iPhone") !== -1 || ua.indexOf("iPad") !== -1) osName = "iOS (iPhone/iPad)";
    else if (ua.indexOf("Linux") !== -1) osName = "Linux OS";

    // 3. Deteksi Browser
    if (ua.indexOf("Chrome") !== -1 && ua.indexOf("Edg") === -1) browserName = "Google Chrome";
    else if (ua.indexOf("Edg") !== -1) browserName = "Microsoft Edge";
    else if (ua.indexOf("Firefox") !== -1) browserName = "Mozilla Firefox";
    else if (ua.indexOf("Safari") !== -1 && ua.indexOf("Chrome") === -1) browserName = "Apple Safari";

    // 4. Deteksi GPU / Kartu Grafis
    let gpuName = "Tidak Terdeteksi";
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                gpuName = gl.getParameter(debugInfo.UNMASKED_RENDERER_GL_STRING);
            }
        }
    } catch (e) {
        gpuName = "Blocked / Disabled";
    }

    // 5. Informasi Hardware Tambahan
    const cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores` : 'N/A';
    const ramMemory = navigator.deviceMemory ? `± ${navigator.deviceMemory} GB` : 'N/A';
    const screenSize = `${window.screen.width} x ${window.screen.height} (DPR: ${window.devicePixelRatio || 1})`;
    const isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? "Ya (Touchscreen)" : "Tidak";

    return {
        deviceType,
        osName,
        browserName,
        gpuName,
        cpuCores,
        ramMemory,
        screenSize,
        isTouch,
        userAgent: ua
    };
}

// ==========================================
// 2. LAPORAN PENGUNJUNG KETIKA LOG IN / MASUK WEB
// ==========================================
async function sendVisitorTelemetry() {
    // Cek Session Cookie/Storage: Jangan kirim berulang jika user hanya melakukan Refresh halaman
    if (sessionStorage.getItem('visitor_telemetry_sent')) {
        console.log("Session active: Visitor telemetry already reported.");
        return;
    }

    try {
        // Ambil Data Geolocation dari IP API (Gratis & Tanpa Key)
        const ipRes = await fetch('https://ipwho.is/');
        const ipData = await ipRes.json();

        const specs = getHardwareSpecs();
        const currentTime = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' }) + ' WITA';

        // Format Pesan Laporan Lengkap untuk Telegram
        const messageText = `
🚨 *LAPORAN AKSES PENGUNJUNG BARU* 🚨
-------------------------------------------
📍 *INFORMASI LOKASI & JARINGAN:*
• *IP Address:* \`${ipData.ip || 'Tersembunyi'}\`
• *Lokasi:* ${ipData.city || '-'}, ${ipData.region || '-'}, ${ipData.country || '-'}
• *ISP / Provider:* ${ipData.connection?.isp || ipData.org || '-'}
• *Koordinat:* [Buka Google Maps](https://maps.google.com/?q=${ipData.latitude},${ipData.longitude})

💻 *SPESIFIKASI PERANGKAT & HARDWARE:*
• *Tipe Perangkat:* ${specs.deviceType}
• *Sistem Operasi:* ${specs.osName}
• *Browser:* ${specs.browserName}
• *Resolusi Layar:* ${specs.screenSize}
• *Layar Sentuh:* ${specs.isTouch}
• *CPU Cores:* ${specs.cpuCores}
• *Perkiraan RAM:* ${specs.ramMemory}
• *GPU / Grafis:* \`${specs.gpuName}\`

🛡️ *STATUS KEAMANAN & SAKSI:*
• *Waktu Masuk:* ${currentTime}
• *Status Cookie:* Session Created ✅
-------------------------------------------
🤖 *RoniHalla Security Shield*
`.trim();

        // Kirim Notifikasi ke Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown',
                disable_web_page_preview: true
            })
        });

        // Tanda sesi bahwa laporan sudah terkirim di browser ini
        sessionStorage.setItem('visitor_telemetry_sent', 'true');

    } catch (err) {
        console.error("Gagal mengirim telemetri pengunjung:", err);
    }
}

// ==========================================
// 3. FITUR ANTI-SPAM & FORM KIRIM PESAN
// ==========================================
let pageLoadTimestamp = Date.now(); // Catat waktu muat halaman untuk Time-Check Trap

function initFormProtection() {
    const form = document.getElementById('firebase-form');
    if (!form) return;

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        const statusEl = document.getElementById('form-status');
        const honeypotInput = document.getElementById('website_check_honeypot');
        const nameInput = document.getElementById('sender-name');
        const contactInput = document.getElementById('sender-contact');
        const messageInput = document.getElementById('sender-message');

        // 🛡️ FITUR 1: HONEYPOT CHECK (Jika field tersembunyi diisi, ini pasti BOT)
        if (honeypotInput && honeypotInput.value.trim() !== "") {
            console.warn("Anti-Spam Triggered: Honeypot field filled.");
            showStatus("Pesan terkirim!", "text-emerald-400"); // Pura-pura sukses agar bot bingung
            form.reset();
            return;
        }

        // 🛡️ FITUR 2: TIME-CHECK TRAP (Jika terisi < 2 detik sejak halaman dibuka, ini pasti BOT)
        if (Date.now() - pageLoadTimestamp < 2000) {
            showStatus("❌ Terlalu cepat! Harap isi form dengan wajar.", "text-red-500");
            return;
        }

        // 🛡️ FITUR 3: COOLDOWN / RATE-LIMITING (Maksimal 1 pesan per 30 detik)
        const lastSubmitted = localStorage.getItem('last_message_timestamp');
        if (lastSubmitted && Date.now() - parseInt(lastSubmitted) < 30000) {
            const secondsLeft = Math.ceil((30000 - (Date.now() - parseInt(lastSubmitted))) / 1000);
            showStatus(`⏳ Harap tunggu ${secondsLeft} detik lagi sebelum mengirim pesan baru.`, "text-amber-400");
            return;
        }

        // Validasi Sanitasi Input Dasar
        const senderName = sanitizeHTML(nameInput.value.trim());
        const senderContact = sanitizeHTML(contactInput.value.trim()) || 'Anonim';
        const senderMessage = sanitizeHTML(messageInput.value.trim());

        if (!senderName || !senderMessage) {
            showStatus("❌ Nama dan Pesan wajib diisi!", "text-red-500");
            return;
        }

        showStatus("⏳ Mengirim pesan...", "text-slate-300");

        try {
            const specs = getHardwareSpecs();
            const telegramMsg = `
📩 *PESAN MASUK DARI WEBSITE* 📩
-------------------------------------------
👤 *Nama:* ${senderName}
📞 *Kontak:* ${senderContact}
💬 *Pesan:*
"${senderMessage}"

💻 *INFOS PERANGKAT PENGIRIM:*
• *Device:* ${specs.deviceType} (${specs.osName})
• *Browser:* ${specs.browserName}
-------------------------------------------
`.trim();

            // Kirim Pesan ke Telegram Bot
            const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_CONFIG.BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CONFIG.CHAT_ID,
                    text: telegramMsg,
                    parse_mode: 'Markdown'
                })
            });

            if (res.ok) {
                showStatus("✅ Pesan berhasil terkirim!", "text-emerald-400");
                localStorage.setItem('last_message_timestamp', Date.now().toString());
                form.reset();
            } else {
                showStatus("❌ Gagal mengirim pesan. Coba lagi nanti.", "text-red-500");
            }

        } catch (err) {
            showStatus("❌ Terjadi kesalahan jaringan.", "text-red-500");
        }
    });
}

// Helper: Sanitasi Input untuk Mencegah XSS (Cross Site Scripting)
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Helper: Tampilkan Status Form
function showStatus(msg, colorClass) {
    const statusEl = document.getElementById('form-status');
    if (statusEl) {
        statusEl.className = `text-xs font-semibold py-1.5 px-3 rounded-lg bg-slate-900/80 border border-surfaceBorder ${colorClass}`;
        statusEl.innerText = msg;
        statusEl.classList.remove('hidden');
    }
}

// ==========================================
// 4. JAM AUTOMATIS REALTIME & ZONA WAKTU
// ==========================================
function updateRealtimeClock() {
    const timeEl = document.getElementById('sidebar-time');
    const tzEl = document.getElementById('sidebar-tz');

    if (timeEl) {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        
        timeEl.textContent = `${hours}:${minutes}:${seconds}`;
        if (tzEl) tzEl.textContent = "WITA (UTC+8)";
    }
}

// ==========================================
// INITIALIZATION ON PAGE LOAD
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Jalankan Telemetri Laporan Pengunjung
    sendVisitorTelemetry();

    // 2. Aktifkan Proteksi Form
    initFormProtection();

    // 3. Jalankan Jam Realtime setiap 1 detik
    setInterval(updateRealtimeClock, 1000);
    updateRealtimeClock();
});