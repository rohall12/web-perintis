// ==========================================
// 1. CONFIG MAINTENANCE MODE
// ==========================================
const IS_MAINTENANCE = false; // Ubah ke 'true' jika ingin mengaktifkan mode maintenance

// ==========================================
// 2. TELEGRAM BOT CONFIG
// ==========================================
const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
const TELEGRAM_CHAT_ID = "5983713854"; 

// ==========================================
// 3. FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    databaseURL: "https://my-portofolio-c2eeb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f"
};

let app, database;
try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
} catch (err) {
    console.error("Firebase Init Error:", err);
}

// ==========================================
// 4. MAIN EVENT LISTENER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Maintenance Handler
    const maintenanceScreen = document.getElementById("maintenance-screen");
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';

    if (IS_MAINTENANCE && !isPreview) {
        if (maintenanceScreen) {
            maintenanceScreen.classList.remove("hidden");
            document.body.classList.add("overflow-hidden");
        }
    } else {
        if (maintenanceScreen) {
            maintenanceScreen.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
        }
    }

    // Jalankan Jam, GitHub Stats, Form Handler, UI, dan Visitor Tracking
    updateClock();
    setInterval(updateClock, 1000);
    fetchGitHubStats("rohall12");
    setupFormHandler();
    setupUIControls();
    
    // Kirim notifikasi pengunjung masuk (Visitor Tracker)
    trackVisitor();
});

// ==========================================
// 5. VISITOR TRACKER (TELEGRAM NOTIFICATION)
// ==========================================
async function trackVisitor() {
    // Hindari spam kirim notif berulang saat user me-refresh di tab yang sama
    if (sessionStorage.getItem("visited_session")) return;
    sessionStorage.setItem("visited_session", "true");

    try {
        // Deteksi Tipe Perangkat & Sistem Operasi
        const ua = navigator.userAgent;
        let deviceType = "Desktop/Laptop 💻";
        if (/mobile/i.test(ua)) deviceType = "Smartphone / HP 📱";
        if (/tablet|ipad/i.test(ua)) deviceType = "Tablet 📟";

        let os = "Unknown OS";
        if (ua.includes("Win")) os = "Windows 🪟";
        else if (ua.includes("Android")) os = "Android 🤖";
        else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS / Apple 🍎";
        else if (ua.includes("Mac")) os = "macOS 🍏";
        else if (ua.includes("Linux")) os = "Linux 🐧";

        // Deteksi Browser
        let browser = "Unknown Browser";
        if (ua.includes("Chrome") && !ua.includes("Edg")) browser = "Google Chrome 🌐";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari 🧭";
        else if (ua.includes("Firefox")) browser = "Firefox 🦊";
        else if (ua.includes("Edg")) browser = "Microsoft Edge 🌊";

        // Deteksi Media / Asal Link (Referrer)
        const referrer = document.referrer;
        let mediaSource = "Direct Link / Pengetikan Langsung 🔗";
        if (referrer) {
            if (referrer.includes("whatsapp")) mediaSource = "WhatsApp 💬";
            else if (referrer.includes("instagram")) mediaSource = "Instagram 📷";
            else if (referrer.includes("facebook")) mediaSource = "Facebook 📘";
            else if (referrer.includes("tiktok")) mediaSource = "TikTok 🎵";
            else if (referrer.includes("google")) mediaSource = "Pencarian Google 🔍";
            else if (referrer.includes("t.co") || referrer.includes("twitter")) mediaSource = "Twitter / X 🐦";
            else mediaSource = referrer;
        }

        // Resolusi Layar & Bahasa Perangkat
        const screenSize = `${window.screen.width} x ${window.screen.height} px`;
        const language = navigator.language || navigator.userLanguage;

        // Ambil Data IP & Lokasi Pengunjung
        let ipInfo = { ip: "Tidak Terdeteksi", city: "-", region: "-", country_name: "-", org: "-" };
        try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
                ipInfo = await ipRes.json();
            }
        } catch (e) {
            console.log("Gagal mengambil data lokasi IP:", e);
        }

        // Format Pesan Telegram
        const messageText = 
`👁️ *PENGUNJUNG BARU MASUK WEB!*

📍 *LOKASI & JARINGAN*
• *IP Address:* \`${ipInfo.ip || 'Hidden'}\`
• *Lokasi:* ${ipInfo.city || '-'}, ${ipInfo.region || '-'}, ${ipInfo.country_name || '-'}
• *Provider/ISP:* ${ipInfo.org || '-'}

💻 *SPESIFIKASI PERANGKAT*
• *Tipe:* ${deviceType}
• *Sistem Operasi:* ${os}
• *Browser:* ${browser}
• *Ukuran Layar:* ${screenSize}
• *Bahasa HP/PC:* ${language}

🌐 *SUMBER / MEDIA*
• *Masuk Lewat:* ${mediaSource}
• *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`;

        // Kirim Notifikasi ke Bot Telegram
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });

    } catch (err) {
        console.error("Gagal mengirim tracking visitor:", err);
    }
}

// ==========================================
// 6. JAM DIGITAL OTOMATIS
// ==========================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const sidebarTime = document.getElementById("sidebar-time");
    const topTime = document.getElementById("top-time");

    if (sidebarTime) sidebarTime.textContent = `${hours}:${minutes}:${seconds}`;
    if (topTime) topTime.textContent = `${hours}:${minutes} WITA`;
}

// ==========================================
// 7. GITHUB LIVE STATS API
// ==========================================
async function fetchGitHubStats(username) {
    try {
        const response = await fetch(`https://api.github.com/users/${username}`);
        if (response.ok) {
            const data = await response.json();
            const reposEl = document.getElementById("github-repos");
            const followersEl = document.getElementById("github-followers");
            
            if (reposEl) reposEl.textContent = data.public_repos;
            if (followersEl) followersEl.textContent = data.followers;
        }
    } catch (err) {
        console.error("GitHub API Error:", err);
    }
}

function timeoutPromise(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), ms));
}

// ==========================================
// 8. FORM PESAN DIRECT (FIREBASE + TELEGRAM)
// ==========================================
function setupFormHandler() {
    const form = document.getElementById("firebase-form");
    const statusEl = document.getElementById("form-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("sender-name").value.trim();
        const contact = document.getElementById("sender-contact").value.trim();
        const message = document.getElementById("sender-message").value.trim();

        if (!name || !message) return;

        if (statusEl) {
            statusEl.classList.remove("hidden", "text-emerald-400", "text-rose-500");
            statusEl.classList.add("text-amber-400");
            statusEl.textContent = "Sedang mengirim pesan...";
        }

        try {
            if (!database) throw new Error("Database belum siap");

            const messagesRef = ref(database, 'messages');

            // 1. Simpan ke Firebase Database
            await Promise.race([
                push(messagesRef, {
                    name: name,
                    contact: contact || "Anonim",
                    message: message,
                    timestamp: serverTimestamp()
                }),
                timeoutPromise(6000)
            ]);

            // 2. Kirim Notifikasi Pesan Direct ke Telegram
            const telegramText = `📩 *PESAN BARU DARI PORTFOLIO!*\n\n👤 *Nama:* ${name}\n📱 *Kontak:* ${contact || '-'}\n💬 *Pesan:* ${message}`;
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramText,
                    parse_mode: 'Markdown'
                })
            }).catch(err => console.log("Telegram Error Ignored:", err));

            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-emerald-400");
                statusEl.textContent = "Pesan berhasil terkirim! Terima kasih, kawan. 👍";
            }

            form.reset();
        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-rose-500");
                statusEl.textContent = "Gagal terhubung. Coba lagi nanti ya!";
            }
        }
    });
}

// ==========================================
// 9. SIDEBAR & UI CONTROLS
// ==========================================
function setupUIControls() {
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarNav = document.getElementById("sidebar-nav");

    const toggleSidebar = () => {
        if (sidebarNav) sidebarNav.classList.toggle("hidden");
    };

    if (mobileToggle) mobileToggle.addEventListener("click", toggleSidebar);
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar);
}