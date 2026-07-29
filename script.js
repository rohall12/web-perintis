// ==========================================
// 1. TELEGRAM BOT & FIREBASE CONFIG
// ==========================================
const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
const TELEGRAM_CHAT_ID = "5983713854"; 

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
// 2. MAIN INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    updateClock();
    setInterval(updateClock, 1000);
    fetchGitHubStats("rohall12");
    setupFormHandler();
    setupUIControls();
    setupThemeToggle();
    setupCookieConsent();
    trackVisitor();
});

// ==========================================
// 3. CLOCK & TIMEZONE
// ==========================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const sidebarTime = document.getElementById("sidebar-time");
    const topTime = document.getElementById("top-time");
    const sidebarTz = document.getElementById("sidebar-tz");

    if (sidebarTime) sidebarTime.textContent = `${hours}:${minutes}:${seconds}`;
    if (topTime) topTime.textContent = `${hours}:${minutes} WITA`;

    // Deteksi Zona Waktu Lokal Pengunjung
    if (sidebarTz) {
        try {
            const tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
            sidebarTz.textContent = `${tzName}`;
        } catch(e) {}
    }
}

// ==========================================
// 4. THEME TOGGLE (DARK / LIGHT)
// ==========================================
function setupThemeToggle() {
    const toggleBtn = document.getElementById("theme-toggle");
    const themeIcon = document.getElementById("theme-icon");
    const htmlEl = document.documentElement;

    // Load saved preference
    const savedTheme = localStorage.getItem("theme") || "dark";
    if (savedTheme === "light") {
        htmlEl.classList.remove("dark");
        if (themeIcon) themeIcon.className = "fa-solid fa-moon text-sm";
    } else {
        htmlEl.classList.add("dark");
        if (themeIcon) themeIcon.className = "fa-solid fa-sun text-sm";
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            if (htmlEl.classList.contains("dark")) {
                htmlEl.classList.remove("dark");
                localStorage.setItem("theme", "light");
                if (themeIcon) themeIcon.className = "fa-solid fa-moon text-sm";
            } else {
                htmlEl.classList.add("dark");
                localStorage.setItem("theme", "dark");
                if (themeIcon) themeIcon.className = "fa-solid fa-sun text-sm";
            }
        });
    }
}

// ==========================================
// 5. COOKIE CONSENT BAR
// ==========================================
function setupCookieConsent() {
    const cookieBar = document.getElementById("cookie-consent");
    const acceptBtn = document.getElementById("cookie-accept");
    const rejectBtn = document.getElementById("cookie-reject");

    if (!cookieBar) return;

    if (localStorage.getItem("cookie_consent")) {
        cookieBar.classList.add("hidden");
    }

    if (acceptBtn) {
        acceptBtn.addEventListener("click", () => {
            localStorage.setItem("cookie_consent", "accepted");
            cookieBar.classList.add("hidden");
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener("click", () => {
            localStorage.setItem("cookie_consent", "rejected");
            cookieBar.classList.add("hidden");
        });
    }
}

// ==========================================
// 6. GITHUB LIVE STATS API
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

// ==========================================
// 7. VISITOR TRACKER (GPS + IP FALLBACK)
// ==========================================
async function getRealLocationFromCoords(lat, lon) {
    try {
        const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=id`);
        if (res.ok) {
            const data = await res.json();
            const city = data.city || data.locality || "";
            const district = data.localityInfo?.administrative?.[3]?.name || data.localityInfo?.administrative?.[2]?.name || "";
            const province = data.principalSubdivision || "";
            
            let locParts = [];
            if (district) locParts.push(district);
            if (city) locParts.push(city);
            if (province) locParts.push(province);

            return {
                text: locParts.join(", ") || `${lat}, ${lon}`,
                mapsUrl: `https://www.google.com/maps?q=${lat},${lon}`
            };
        }
    } catch (e) {
        console.error("Error reverse geocode:", e);
    }
    return {
        text: `${lat}, ${lon}`,
        mapsUrl: `https://www.google.com/maps?q=${lat},${lon}`
    };
}

async function sendToTelegram(messageText) {
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown',
                disable_web_page_preview: false
            })
        });
    } catch (err) {
        console.error("Gagal kirim Telegram:", err);
    }
}

async function trackVisitor() {
    if (sessionStorage.getItem("visited_session")) return;
    sessionStorage.setItem("visited_session", "true");

    try {
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

        let browser = "Google Chrome 🌐";
        if (ua.includes("Firefox")) browser = "Firefox 🦊";
        else if (ua.includes("Safari") && !ua.includes("Chrome")) browser = "Safari 🧭";
        else if (ua.includes("Edg")) browser = "Microsoft Edge 🌊";

        const referrer = document.referrer || "Direct Link 🔗";
        const screenSize = `${window.screen.width} x ${window.screen.height} px`;
        const language = navigator.language || "id-ID";

        let ipAddress = "Hidden";
        let provider = "-";
        let ipLocationFallback = "Mencari...";

        try {
            const ipRes = await fetch("https://ipapi.co/json/");
            if (ipRes.ok) {
                const ipData = await ipRes.json();
                ipAddress = ipData.ip || "Hidden";
                provider = ipData.org || "-";
                ipLocationFallback = `${ipData.city || '-'}, ${ipData.region || '-'}`;
            }
        } catch (e) {}

        const buildMessage = (locationString, mapsLink = "") => {
            return `👁️ *PENGUNJUNG BARU MASUK WEB!*

📍 *LOKASI & JARINGAN*
• *IP Address:* \`${ipAddress}\`
• *Lokasi:* ${locationString}${mapsLink ? `\n• *Google Maps Pin:* ${mapsLink}` : ''}
• *Provider/ISP:* ${provider}

💻 *SPESIFIKASI*
• *Tipe:* ${deviceType}
• *OS:* ${os}
• *Browser:* ${browser}
• *Layar:* ${screenSize}

🌐 *SUMBER*
• *Masuk Lewat:* ${referrer}
• *Waktu:* ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })} WITA`;
        };

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude;
                    const lon = position.coords.longitude;
                    const geoData = await getRealLocationFromCoords(lat, lon);
                    sendToTelegram(buildMessage(`🎯 *${geoData.text}* (GPS)`, geoData.mapsUrl));
                },
                () => {
                    sendToTelegram(buildMessage(`${ipLocationFallback} (IP)`));
                },
                { enableHighAccuracy: true, timeout: 6000, maximumAge: 0 }
            );
        } else {
            sendToTelegram(buildMessage(`${ipLocationFallback} (IP)`));
        }
    } catch (err) {
        console.error("Visitor tracking error:", err);
    }
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
            await push(messagesRef, {
                name: name,
                contact: contact || "Anonim",
                message: message,
                timestamp: serverTimestamp()
            });

            const telegramText = `📩 *PESAN BARU DARI PORTFOLIO!*\n\n👤 *Nama:* ${name}\n📱 *Kontak:* ${contact || '-'}\n💬 *Pesan:* ${message}`;
            await sendToTelegram(telegramText);

            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-emerald-400");
                statusEl.textContent = "Pesan berhasil dikirim.";
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
// 9. UI CONTROLS & MOBILE MENU
// ==========================================
function setupUIControls() {
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const mobileMenu = document.getElementById("mobile-menu");

    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener("click", () => {
            mobileMenu.classList.toggle("hidden");
        });
    }
}