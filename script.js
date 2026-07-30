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

// 3. JAM REALTIME SIDEBAR (WITA)
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

// 4. DATA LIVE GITHUB ACTIVITY
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

// 5. PROSES PENGIRIMAN FORM (FIREBASE DB + TELEGRAM NOTIF)
const form = document.getElementById("firebase-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Proteksi Anti-Spam Honeypot
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

        // Ubah Status Tombol
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "MENGIRIM PESAN...";
        }

        try {
            const timestamp = new Date().toISOString();
            const localTimeString = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

            // A. Simpan Log ke Firebase Realtime Database
            const messagesRef = ref(db, "messages");
            const newMessageRef = push(messagesRef);
            await set(newMessageRef, {
                nama: name,
                kontak: contact,
                pesan: message,
                waktu: timestamp,
                waktuLokal: localTimeString
            });

            // B. Kirim Notifikasi Instan ke Telegram Bot
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

            // Sukses Reset Form & Beri Notifikasi Visual
            form.reset();
            showStatus("✅ Pesan berhasil terkirim ke Telegram & Database!", "text-emerald-400");

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