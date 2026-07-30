import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. KONFIGURASI FIREBASE REALTIME DATABASE
const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    databaseURL: "https://my-portofolio-c2eeb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.appspot.com"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// 2. KONFIGURASI TELEGRAM BOT
const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew";
const TELEGRAM_CHAT_ID = "5983713854";

// ==========================================
// 3. FUNGSI COOKIE MANAGEMENT & DEVICE DETECT
// ==========================================
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

// Deteksi Spesifikasi Perangkat, Browser & OS
function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Lainnya / Browser Khusus";
    let os = "Tidak Diketahui";
    let deviceType = "PC / Laptop / Desktop";

    // Deteksi Tipe Perangkat
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
        deviceType = "Smartphone / HP";
    } else if (/Tablet|iPad/i.test(ua)) {
        deviceType = "Tablet";
    }

    // Deteksi Browser
    if (/edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) browser = "Google Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Safari";
    else if (/opera|opr/i.test(ua)) browser = "Opera";

    // Deteksi Sistem Operasi (OS)
    if (/windows/i.test(ua)) os = "Windows";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS (iPhone/iPad)";
    else if (/macintosh|mac os x/i.test(ua)) os = "macOS";
    else if (/linux/i.test(ua)) os = "Linux";

    return { browser, os, deviceType };
}

// ==========================================
// 4. SISTEM TRACKING PENGUNJUNG KETIKA MASUK WEB
// ==========================================
async function trackVisitor() {
    // Mencegah spaming laporan jika pengunjung hanya merefresh halaman dalam jangka pendek
    const sessionActive = sessionStorage.getItem("visitor_reported_session");
    
    // Cek Cookie Perangkat Baru vs Perangkat Lama
    let visitorCookie = getCookie("user_device_id");
    let statusPerangkat = "Perangkat Lama (Pernah Berkunjung)";
    
    if (!visitorCookie) {
        statusPerangkat = "Perangkat Baru (Pertama Kali Masuk)";
        // Generate ID Perangkat unik dan simpan di Cookie selama 365 hari
        visitorCookie = "dev_" + Math.random().toString(36).substring(2, 11);
        setCookie("user_device_id", visitorCookie, 365);
    }

    if (sessionActive) return; // Jika sudah dilaporkan dalam sesi aktif ini, hentikan agar bot tidak spam refresh

    const device = getDeviceInfo();
    const localTimeString = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

    let ip = "Tidak Diketahui";
    let lokasi = "Tidak Diketahui";
    let isp = "Tidak Diketahui";

    // Ambil Data IP & Lokasi Realtime
    try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
            const ipData = await ipRes.json();
            ip = ipData.ip || "N/A";
            lokasi = `${ipData.city || ''}, ${ipData.region || ''}, ${ipData.country_name || ''}`;
            isp = ipData.org || ipData.asn || "N/A";
        }
    } catch (err) {
        console.warn("Gagal mengambil lokasi via IP:", err);
    }

    // Format Pesan Telegram Laporan Pengunjung
    const reportTelegram = `🔔 *PENGUNJUNG BARU MASUK WEB!*\n\n` +
                           `📱 *Status Perangkat:* ${statusPerangkat}\n` +
                           `🆔 *ID Cookie Perangkat:* \`${visitorCookie}\` \n\n` +
                           `💻 *Tipe Perangkat:* ${device.deviceType}\n` +
                           `🌐 *Browser:* ${device.browser}\n` +
                           `⚙️ *Sistem Operasi:* ${device.os}\n\n` +
                           `📍 *IP Address:* \`${ip}\` \n` +
                           `🗺️ *Lokasi Realtime:* ${lokasi}\n` +
                           `📡 *ISP / Jaringan:* ${isp}\n\n` +
                           `⏰ *Waktu Akses:* ${localTimeString} WITA`;

    // Kirim Laporan Pengunjung ke Bot Telegram
    try {
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: reportTelegram,
                parse_mode: "Markdown"
            })
        });
        // Tandai sesi aktif di sessionStorage
        sessionStorage.setItem("visitor_reported_session", "true");
    } catch (error) {
        console.error("Gagal mengirim notifikasi visitor:", error);
    }
}

// Jalankan Tracking Pengunjung
trackVisitor();

// ==========================================
// 5. JAM REALTIME SIDEBAR (WITA)
// ==========================================
function updateClock() {
    const timeElement = document.getElementById("sidebar-time");
    if (timeElement) {
        const now = new Date();
        const options = { timeZone: "Asia/Makassar", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };
        timeElement.textContent = new Intl.DateTimeFormat("id-ID", options).format(now);
    }
}
setInterval(updateClock, 1000);
updateClock();

// ==========================================
// 6. DATA LIVE GITHUB ACTIVITY
// ==========================================
async function fetchGitHubData() {
    try {
        const response = await fetch("https://api.github.com/users/rohall12");
        if (response.ok) {
            const data = await response.json();
            const reposEl = document.getElementById("github-repos");
            const followersEl = document.getElementById("github-followers");
            if (reposEl) reposEl.textContent = data.public_repos;
            if (followersEl) followersEl.textContent = data.followers;
        }
    } catch (error) {
        console.error("Gagal mengambil data GitHub:", error);
    }
}
fetchGitHubData();

// ==========================================
// 7. PROSES PENGIRIMAN FORM (FIREBASE DB + TELEGRAM NOTIF)
// ==========================================
const form = document.getElementById("firebase-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Anti-Spam Honeypot Trap
        const honeypot = document.getElementById("website_check_honeypot");
        if (honeypot && honeypot.value !== "") {
            console.warn("Spam terdeteksi via Honeypot.");
            return;
        }

        const nameInput = document.getElementById("sender-name");
        const contactInput = document.getElementById("sender-contact");
        const messageInput = document.getElementById("sender-message");
        const submitBtn = form.querySelector("button[type='submit']");

        const name = nameInput ? nameInput.value.trim() : "";
        const contact = contactInput && contactInput.value.trim() !== "" ? contactInput.value.trim() : "Anonim";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!name || !message) {
            showStatus("Mohon isi nama dan pesan kamu!", "text-red-500");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "MENGIRIM PESAN...";
        }

        try {
            const timestamp = new Date().toISOString();
            const localTimeString = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

            // A. Simpan ke Firebase Realtime Database
            const messagesRef = ref(db, "messages");
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, {
                nama: name,
                kontak: contact,
                pesan: message,
                waktu: timestamp,
                waktuLokal: localTimeString,
                deviceId: getCookie("user_device_id") || "N/A"
            });

            // B. Kirim Notifikasi Instan Pesan ke Telegram Bot
            const telegramMessage = `📬 *PESAN BARU DARI WEBSITE!*\n\n` +
                                   `👤 *Nama:* ${name}\n` +
                                   `📱 *Kontak:* ${contact}\n` +
                                   `💬 *Pesan:* ${message}\n\n` +
                                   `⏰ *Waktu:* ${localTimeString} WITA`;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramMessage,
                    parse_mode: "Markdown"
                })
            });

            form.reset();
            showStatus("✅ Pesan berhasil terkirim!", "text-emerald-400");

        } catch (error) {
            console.error("Error mengirim pesan:", error);
            showStatus("❌ Gagal mengirim pesan. Silakan coba lagi.", "text-red-500");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "KIRIM PESAN";
            }
        }
    });
}

function showStatus(text, colorClass) {
    const statusEl = document.getElementById("form-status");
    if (statusEl) {
        statusEl.className = `text-xs font-semibold py-1 ${colorClass}`;
        statusEl.textContent = text;
        statusEl.classList.remove("hidden");
        setTimeout(() => {
            statusEl.classList.add("hidden");
        }, 5000);
    }
}