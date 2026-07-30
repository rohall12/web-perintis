import { saveMessageToFirebase } from './firebase.js';
import { sendTelegramMessage } from './telegram.js';
import { trackVisitor, getCookie } from './tracker.js';
import { fetchGitHubData } from './github.js';
import { initClock, showFormStatus } from './ui.js';

// 1. Jalankan Modul Otomatis
initClock();
fetchGitHubData();
trackVisitor();

// 2. Event Listener Form Kirim Pesan
const form = document.getElementById("firebase-form");
if (form) {
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // Anti-Spam Honeypot Check
        const honeypot = document.getElementById("website_check_honeypot");
        if (honeypot && honeypot.value !== "") return;

        const nameInput = document.getElementById("sender-name");
        const contactInput = document.getElementById("sender-contact");
        const messageInput = document.getElementById("sender-message");
        const submitBtn = form.querySelector("button[type='submit']");

        const name = nameInput ? nameInput.value.trim() : "";
        const contact = contactInput && contactInput.value.trim() !== "" ? contactInput.value.trim() : "Anonim";
        const message = messageInput ? messageInput.value.trim() : "";

        if (!name || !message) {
            showFormStatus("Mohon isi nama dan pesan kamu!", "text-red-500");
            return;
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = "MENGIRIM PESAN...";
        }

        try {
            const timestamp = new Date().toISOString();
            const localTime = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

            // Simpan Firebase
            await saveMessageToFirebase({
                nama: name,
                kontak: contact,
                pesan: message,
                waktu: timestamp,
                waktuLokal: localTime,
                deviceId: getCookie("user_device_id") || "N/A"
            });

            // Kirim Telegram Notif
            const telegramMsg = `📬 *PESAN BARU DARI WEBSITE!*\n\n` +
                                `👤 *Nama:* ${name}\n` +
                                `📱 *Kontak:* ${contact}\n` +
                                `💬 *Pesan:* ${message}\n\n` +
                                `⏰ *Waktu:* ${localTime} WITA`;

            await sendTelegramMessage(telegramMsg);

            form.reset();
            showFormStatus("✅ Pesan berhasil terkirim!", "text-emerald-400");
        } catch (err) {
            console.error("Submit Error:", err);
            showFormStatus("❌ Gagal mengirim pesan.", "text-red-500");
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "KIRIM PESAN";
            }
        }
    });
}