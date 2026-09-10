// ==========================================
// TELEGRAM BOT & DEVICE DETECTOR MODULE
// ==========================================

const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew";
const TELEGRAM_CHAT_ID = "5983713854";

document.addEventListener("DOMContentLoaded", () => {
    initContactForm();
});

// Deteksi Spesifikasi Perangkat Pengguna
async function getDeviceSpecs() {
    const ua = navigator.userAgent;
    let os = "Desktop / PC";
    let deviceType = "Laptop / PC";
    let browser = "Google Chrome";
    let modelName = "";

    if (/Edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/OPR|Opera/i.test(ua)) browser = "Opera";
    else if (/Chrome/i.test(ua)) browser = "Google Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Mozilla Firefox";

    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const uaData = await navigator.userAgentData.getHighEntropyValues(["platformVersion", "model"]);
            if (uaData.model) modelName = uaData.model;
        } catch (e) {}
    }

    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const screenWidth = window.screen.width;

    if (/Android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9\.]+)/);
        os = `Android ${match ? match[1] : '12'}`;
        deviceType = (screenWidth >= 768 && isTouch) ? "Tablet" : "HP";
        if (modelName) deviceType += ` (${modelName})`;
    } else if (/iPhone/i.test(ua)) {
        const match = ua.match(/OS\s([0-9\_]+)/);
        os = `iOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        deviceType = "HP (iPhone)";
    } else if (/Windows NT 10.0/i.test(ua)) {
        os = "Windows 10 / 11";
    } else if (/Mac OS X/i.test(ua)) {
        os = "macOS";
    }

    return {
        deviceType,
        os,
        browser,
        screenSize: `${window.screen.width} x ${window.screen.height} px`
    };
}

// Deteksi Lokasi & IP Pengguna
async function getLocationData() {
    try {
        const res = await fetch("https://ipwho.is/");
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                return {
                    ip: data.ip,
                    city: data.city || "Tidak Terdeteksi",
                    region: data.region || "",
                    country: data.country || "Indonesia",
                    isp: data.connection?.isp || "Tidak Diketahui"
                };
            }
        }
    } catch (e) {}
    return { ip: "Terdeteksi", city: "Indonesia", region: "", country: "Indonesia", isp: "Tidak Diketahui" };
}

// Handler Form Kontak & Pengiriman ke Telegram
function initContactForm() {
    const form = document.getElementById("telegram-form");
    const statusDiv = document.getElementById("form-status");
    if (!form) return;

    const showSuccess = () => {
        statusDiv.className = "glitch-box w-full my-2";
        statusDiv.innerHTML = `
            <div class="flex items-center justify-center relative z-10">
                <span class="glitch-text text-xs" data-text="Pesan kamu berhasil terkirim!">Pesan kamu berhasil terkirim!</span>
            </div>
        `;
        statusDiv.classList.remove("hidden");
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Cek honeypot anti-spam
        const honeypot = document.getElementById("honeypot_check");
        if (honeypot && honeypot.value !== "") {
            showSuccess();
            form.reset();
            return;
        }

        const name = document.getElementById("sender-name").value.trim();
        const contact = document.getElementById("sender-contact").value.trim() || "Anonim";
        const message = document.getElementById("sender-message").value.trim();
        const submitBtn = form.querySelector("button[type='submit']");

        if (!name || !message) return;

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> MENGIRIM...';
        statusDiv.className = "hidden";

        const [specs, loc] = await Promise.all([getDeviceSpecs(), getLocationData()]);
        const nowTime = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Makassar",
            dateStyle: "full",
            timeStyle: "medium"
        }).format(new Date());

        const telegramMsg = `
⚡ <b>PESAN BARU MASUK!</b> ⚡
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Pengirim:</b> ${escapeHtml(name)}
📱 <b>Kontak:</b> ${escapeHtml(contact)}
💬 <b>Isi Pesan:</b>
<i>"${escapeHtml(message)}"</i>

━━━━━━━━━━━━━━━━━━━━━
📊 <b>DETEKSI PERANGKAT & LOKASI</b>
⏰ <b>Waktu:</b> ${nowTime} WITA
📱 <b>Tipe Perangkat:</b> ${specs.deviceType}
💻 <b>OS:</b> ${specs.os}
🌐 <b>Browser:</b> ${specs.browser}
🖥️ <b>Resolusi:</b> ${specs.screenSize}
📍 <b>Lokasi:</b> ${loc.city}, ${loc.country}
🌐 <b>IP:</b> <code>${loc.ip}</code>
📡 <b>ISP:</b> ${loc.isp}
━━━━━━━━━━━━━━━━━━━━━
        `.trim();

        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramMsg,
                    parse_mode: "HTML"
                })
            });
            const resJson = await response.json();
            if (resJson.ok) {
                showSuccess();
                form.reset();
            } else {
                throw new Error("Gagal kirim");
            }
        } catch (err) {
            statusDiv.className = "text-xs font-bold py-3 px-4 bg-red-950/80 border border-red-700 text-red-400 rounded-xl my-2";
            statusDiv.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Gagal mengirim pesan. Cek koneksi internet atau konsol browser.';
            statusDiv.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}