// Import Firebase SDK (Versi CDN Module)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// 1. CONFIG FIREBASE TERHUBUNG
const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    databaseURL: "https://my-portofolio-c2eeb-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f",
    measurementId: "G-SQ8F1Z00SS"
};

// 2. CONFIG TELEGRAM BOT TERHUBUNG
const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew";
const TELEGRAM_CHAT_ID = "5983713854";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    // Jam Realtime Sidebar
    updateSidebarTime();
    setInterval(updateSidebarTime, 1000);

    // Ambil Data Live GitHub
    fetchGitHubStats();

    // Event Listener Form Kirim Pesan
    const form = document.getElementById("firebase-form");
    if (form) {
        form.addEventListener("submit", handleFormSubmit);
    }
});

// FUNGSI UTAMA KIRIM PESAN (FIREBASE & TELEGRAM)
async function handleFormSubmit(e) {
    e.preventDefault();

    const statusDiv = document.getElementById("form-status");
    const submitBtn = e.target.querySelector("button[type='submit']");

    // 1. Jebakan Anti-Spam Honeypot
    const honeypot = document.getElementById("website_check_honeypot")?.value;
    if (honeypot && honeypot.trim() !== "") {
        console.warn("Spam terdeteksi via Honeypot!");
        return; // Hentikan pengiriman jika diisi bot
    }

    const name = document.getElementById("sender-name").value.trim();
    const contact = document.getElementById("sender-contact").value.trim() || "Anonim";
    const message = document.getElementById("sender-message").value.trim();

    if (!name || !message) {
        showStatus(statusDiv, "Nama dan pesan wajib diisi!", "text-red-500");
        return;
    }

    // Indicator Loading
    submitBtn.disabled = true;
    submitBtn.innerText = "MENGIRIM...";
    showStatus(statusDiv, "Sedang mengirim pesan...", "text-yellow-500");

    try {
        // A. SIMPAN KE FIREBASE REALTIME DATABASE
        const messagesRef = ref(database, 'messages');
        await push(messagesRef, {
            name: name,
            contact: contact,
            message: message,
            timestamp: serverTimestamp()
        });

        // B. KIRIM NOTIFIKASI LANGSUNG KE TELEGRAM BOT
        const telegramText = `📩 <b>PESAN BARU DARI WEB PORTOFOLIO!</b>\n\n👤 <b>Nama:</b> ${name}\n📞 <b>Kontak:</b> ${contact}\n💬 <b>Pesan:</b>\n${message}`;
        
        await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramText,
                parse_mode: 'HTML'
            })
        });

        showStatus(statusDiv, "✓ Pesan berhasil terkirim ke Firebase & Telegram!", "text-emerald-500");
        form.reset();
    } catch (error) {
        console.error("Error sending message:", error);
        showStatus(statusDiv, "Gagal mengirim pesan. Cek koneksi atau konsol browser.", "text-red-500");
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerText = "KIRIM PESAN";
    }
}

function showStatus(el, message, colorClass) {
    if (!el) return;
    el.className = `text-xs font-semibold py-1 block ${colorClass}`;
    el.innerText = message;
}

// FUNGSI LIVE DATA GITHUB
async function fetchGitHubStats() {
    try {
        const response = await fetch("https://api.github.com/users/rohall12");
        if (response.ok) {
            const data = await response.json();
            const reposEl = document.getElementById("github-repos");
            const followersEl = document.getElementById("github-followers");

            if (reposEl) reposEl.innerText = data.public_repos ?? 0;
            if (followersEl) followersEl.innerText = data.followers ?? 0;
        }
    } catch (err) {
        console.error("Gagal mengambil data GitHub:", err);
    }
}

// FUNGSI JAM SIDEBAR (WITA / UTC+8)
function updateSidebarTime() {
    const timeEl = document.getElementById("sidebar-time");
    if (timeEl) {
        const now = new Date();
        timeEl.innerText = now.toLocaleTimeString("id-ID", { timeZone: "Asia/Makassar", hour12: false });
    }
}