// ==========================================
// CONFIG TELEGRAM BOT
// ==========================================
const TELEGRAM_BOT_TOKEN = "7953282200:AAFn_O1M7yG0u6-P89zJpZAn-c_R9yK-m30"; // Masukkan Bot Token kamu jika berbeda
const TELEGRAM_CHAT_ID = "5806307137";                   // Masukkan Chat ID Telegram kamu

document.addEventListener("DOMContentLoaded", () => {
    initClock();
    initGitHubActivity();
    initContactForm();
});

// ------------------------------------------
// 1. FUNGSI JAM REALTIME WITA (UTC+8)
// ------------------------------------------
function initClock() {
    const timeEl = document.getElementById("sidebar-time");
    if (!timeEl) return;

    function updateTime() {
        const now = new Date();
        const options = {
            timeZone: "Asia/Makassar",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false
        };
        timeEl.textContent = new Intl.DateTimeFormat("id-ID", options).format(now);
    }

    updateTime();
    setInterval(updateTime, 1000);
}

// ------------------------------------------
// 2. FUNGSI DETEKSI PERANGKAT, OS, BROWSER
// ------------------------------------------
function getDeviceSpecs() {
    const ua = navigator.userAgent;
    let os = "Desktop / Non-Mobile";
    let browser = "Browser Lain";
    let deviceType = "Desktop";

    // Deteksi Tipe Perangkat
    if (/Mobi|Android|iPhone|iPad|iPod/i.test(ua)) {
        deviceType = "Mobile / Tablet";
    }

    // Deteksi OS & Versi
    if (/Android/i.test(ua)) {
        const match = ua.match(/Android\s([0-9\.]+)/);
        os = `Android ${match ? match[1] : ''}`;
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
        const match = ua.match(/OS\s([0-9\_]+)/);
        os = `iOS ${match ? match[1].replace(/_/g, '.') : ''}`;
    } else if (/Windows NT 10.0/i.test(ua)) {
        os = "Windows 10 / 11";
    } else if (/Windows NT 6.3/i.test(ua)) {
        os = "Windows 8.1";
    } else if (/Windows NT 6.1/i.test(ua)) {
        os = "Windows 7";
    } else if (/Mac OS X/i.test(ua)) {
        const match = ua.match(/Mac OS X\s([0-9\_]+)/);
        os = `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
    } else if (/Linux/i.test(ua)) {
        os = "Linux";
    }

    // Deteksi Browser
    if (/Chrome/i.test(ua) && !/Edg/i.test(ua) && !/OPR/i.test(ua)) {
        browser = "Chrome";
    } else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) {
        browser = "Safari";
    } else if (/Firefox/i.test(ua)) {
        browser = "Firefox";
    } else if (/Edg/i.test(ua)) {
        browser = "Edge";
    } else if (/OPR|Opera/i.test(ua)) {
        browser = "Opera";
    } else if (/SamsungBrowser/i.test(ua)) {
        browser = "Samsung Internet";
    }

    const screenSize = `${window.screen.width} x ${window.screen.height} px`;

    return { deviceType, os, browser, screenSize };
}

// ------------------------------------------
// 3. FUNGSI AMBIL LOKASI & IP ADDRESS (API)
// ------------------------------------------
async function getLocationData() {
    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Gagal mengambil data IP");
        const data = await response.json();
        return {
            ip: data.ip || "Tidak terdeteksi",
            city: data.city || "Tidak terdeteksi",
            region: data.region || "",
            country: data.country_name || "Indonesia",
            isp: data.org || "Tidak diketahui"
        };
    } catch (error) {
        return {
            ip: "Tidak terdeteksi",
            city: "Tidak terdeteksi",
            region: "",
            country: "Indonesia",
            isp: "-"
        };
    }
}

// ------------------------------------------
// 4. FORM KIRIM PESAN & BOT TELEGRAM
// ------------------------------------------
function initContactForm() {
    const form = document.getElementById("firebase-form");
    const statusDiv = document.getElementById("form-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // CHECK ANTI-SPAM HONEYPOT TRAP
        const honeypot = document.getElementById("website_check_honeypot");
        if (honeypot && honeypot.value !== "") {
            // Jika bot spam mengisi input tersembunyi ini, abaikan secara diam-diam
            statusDiv.className = "text-xs font-semibold py-1 text-emerald-400";
            statusDiv.textContent = "Pesan kamu berhasil terkirim!";
            statusDiv.classList.remove("hidden");
            form.reset();
            return;
        }

        const nameInput = document.getElementById("sender-name");
        const contactInput = document.getElementById("sender-contact");
        const messageInput = document.getElementById("sender-message");
        const submitBtn = form.querySelector("button[type='submit']");

        const name = nameInput.value.trim();
        const contact = contactInput.value.trim() || "Anonim";
        const message = messageInput.value.trim();

        if (!name || !message) return;

        // Visual feedback tombol kirim
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Mengirim...';
        statusDiv.classList.add("hidden");

        // Ambil Spek Perangkat & Lokasi
        const specs = getDeviceSpecs();
        const location = await getLocationData();

        // Format Waktu Kirim (WITA)
        const now = new Date();
        const timeFormatted = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Makassar",
            dateStyle: "full",
            timeStyle: "medium"
        }).format(now);

        // Susun teks pesan Telegram
        const telegramMessage = `
📩 <b>PESAN BARU DARI WEB PORTOFOLIO!</b>

👤 <b>Nama:</b> ${escapeHtml(name)}
📞 <b>Kontak:</b> ${escapeHtml(contact)}
💬 <b>Pesan:</b> ${escapeHtml(message)}

────────────────────────
📊 <b>DATA PERANGKAT & LOKASI:</b>
⏰ <b>Waktu:</b> ${timeFormatted} WITA
📱 <b>Tipe:</b> ${specs.deviceType}
💻 <b>Sistem Operasi:</b> ${specs.os}
🌐 <b>Browser:</b> ${specs.browser}
🖥️ <b>Layar:</b> ${specs.screenSize}
📍 <b>Lokasi:</b> ${location.city}${location.region ? ', ' + location.region : ''}, ${location.country}
🌐 <b>IP Address:</b> ${location.ip}
📡 <b>ISP/Provider:</b> ${location.isp}
        `.trim();

        try {
            const teleUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
            const response = await fetch(teleUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: telegramMessage,
                    parse_mode: "HTML"
                })
            });

            const result = await response.json();

            if (result.ok) {
                statusDiv.className = "text-xs font-semibold py-1 text-emerald-400";
                statusDiv.textContent = "✅ Pesan kamu berhasil terkirim!";
                statusDiv.classList.remove("hidden");
                form.reset();
            } else {
                throw new Error(result.description || "Gagal ke Telegram");
            }
        } catch (err) {
            console.error("Telegram Send Error:", err);
            statusDiv.className = "text-xs font-semibold py-1 text-red-500";
            statusDiv.textContent = "❌ Gagal mengirim pesan. Cek koneksi internet kamu.";
            statusDiv.classList.remove("hidden");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
}

// Helper Sanitasi HTML agar pesan Telegram tidak error
function escapeHtml(str) {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// ------------------------------------------
// 5. FETCH GITHUB PUBLIC STATS
// ------------------------------------------
async function initGitHubActivity() {
    const reposEl = document.getElementById("github-repos");
    const followersEl = document.getElementById("github-followers");

    if (!reposEl || !followersEl) return;

    try {
        const res = await fetch("https://api.github.com/users/rohall12");
        if (!res.ok) return;
        const data = await res.json();

        reposEl.textContent = data.public_repos ?? "2";
        followersEl.textContent = data.followers ?? "0";
    } catch (e) {
        console.log("GitHub API Offline, menggunakan fallback data.");
    }
}