// ==========================================
// CONFIG TELEGRAM BOT
// ==========================================
const TELEGRAM_BOT_TOKEN = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; // Bot Token kamu
const TELEGRAM_CHAT_ID = "5983713854";                   // Chat ID Telegram kamu

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
// 2. DETEKSI SPESIFIKASI PERANGKAT & OS AKURAT
// ------------------------------------------
async function getDeviceSpecs() {
    const ua = navigator.userAgent;
    let os = "Desktop / PC";
    let deviceType = "Laptop / PC";
    let browser = "Google Chrome";
    let modelName = "";

    // 1. Deteksi Browser
    if (/Edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/OPR|Opera/i.test(ua)) browser = "Opera";
    else if (/SamsungBrowser/i.test(ua)) browser = "Samsung Internet";
    else if (/Chrome/i.test(ua)) browser = "Google Chrome";
    else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = "Safari";
    else if (/Firefox/i.test(ua)) browser = "Mozilla Firefox";

    // 2. High Entropy Client Hints (Akurasi Android 12+ & Model Perangkat)
    let clientHintAndroidVer = null;
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const uaData = await navigator.userAgentData.getHighEntropyValues(["platformVersion", "model"]);
            if (uaData.model) modelName = uaData.model;
            
            if (uaData.platform === "Android" && uaData.platformVersion) {
                const major = parseInt(uaData.platformVersion.split('.')[0], 10);
                // Pemetaan Chromium Client Hints Platform Version ke Versi Android Asli
                if (major >= 11) {
                    clientHintAndroidVer = `${major}`;
                } else if (major === 4 || major === 5 || major === 6) {
                    clientHintAndroidVer = `${major + 8}`; // Offset versi Chrome lama
                }
            }
        } catch (e) {
            console.log("Client Hints error/unsupported:", e);
        }
    }

    // 3. Deteksi Tipe Perangkat & OS
    const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const screenWidth = window.screen.width;

    if (/Android/i.test(ua)) {
        // Ambil versi dari UserAgent fallback
        const uaMatch = ua.match(/Android\s([0-9\.]+)/);
        let androidVer = uaMatch ? uaMatch[1] : "12";

        // Jika UA memberikan nilai default "10", prioritaskan hasil dari Client Hints
        if ((androidVer === "10" || !androidVer) && clientHintAndroidVer) {
            androidVer = clientHintAndroidVer;
        }

        os = `Android ${androidVer}`;

        // Bedakan HP dan Tablet secara tegas
        const isTablet = /Tablet/i.test(ua) || (screenWidth >= 768 && isTouch);
        deviceType = isTablet ? "Tablet" : "HP";

        // Ekstrak model HP jika ada
        const modelMatch = ua.match(/;\s?([^;]+)\sBuild\//);
        if (modelMatch && modelMatch[1]) {
            modelName = modelMatch[1].trim();
        }

        if (modelName) {
            deviceType += ` (${modelName})`;
        }

    } else if (/iPhone/i.test(ua)) {
        const match = ua.match(/OS\s([0-9\_]+)/);
        os = `iOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        deviceType = "HP (iPhone)";
    } else if (/iPad/i.test(ua)) {
        const match = ua.match(/OS\s([0-9\_]+)/);
        os = `iOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        deviceType = "Tablet (iPad)";
    } else if (/Windows NT 10.0/i.test(ua)) {
        os = "Windows 10 / 11";
        deviceType = "Laptop / PC";
    } else if (/Mac OS X/i.test(ua)) {
        const match = ua.match(/Mac OS X\s([0-9\_]+)/);
        os = `macOS ${match ? match[1].replace(/_/g, '.') : ''}`;
        deviceType = "Laptop / Mac";
    } else if (/Linux/i.test(ua)) {
        os = "Linux";
        deviceType = "Laptop / PC";
    }

    const screenSize = `${window.screen.width} x ${window.screen.height} px`;

    return { deviceType, os, browser, screenSize };
}

// ------------------------------------------
// 3. MULTI-SERVICE DETEKSI IP, LOKASI & ISP
// ------------------------------------------
async function getLocationData() {
    // Layanan 1: ipwho.is (Sangat Akurat, Gratis HTTPS, Bebas CORS)
    try {
        const res = await fetch("https://ipwho.is/", { cache: "no-cache" });
        if (res.ok) {
            const data = await res.json();
            if (data.success) {
                return {
                    ip: data.ip || "Terdeteksi",
                    city: data.city || "Tidak Terdeteksi",
                    region: data.region || "",
                    country: data.country || "Indonesia",
                    isp: data.connection?.isp || data.connection?.org || "Tidak Diketahui"
                };
            }
        }
    } catch (e) {
        console.warn("ipwho.is gagal, mencoba fallback service 2...");
    }

    // Layanan 2 (Fallback): ipapi.co
    try {
        const res = await fetch("https://ipapi.co/json/");
        if (res.ok) {
            const data = await res.json();
            return {
                ip: data.ip || "Terdeteksi",
                city: data.city || "Tidak Terdeteksi",
                region: data.region || "",
                country: data.country_name || "Indonesia",
                isp: data.org || "Tidak Diketahui"
            };
        }
    } catch (e) {
        console.warn("ipapi.co gagal, mencoba fallback service 3...");
    }

    // Layanan 3 (Fallback): ip-api.com
    try {
        const res = await fetch("https://ip-api.com/json/?fields=status,country,regionName,city,isp,query");
        if (res.ok) {
            const data = await res.json();
            if (data.status === "success") {
                return {
                    ip: data.query || "Terdeteksi",
                    city: data.city || "Tidak Terdeteksi",
                    region: data.regionName || "",
                    country: data.country || "Indonesia",
                    isp: data.isp || "Tidak Diketahui"
                };
            }
        }
    } catch (e) {}

    return {
        ip: "Gagal memuat IP",
        city: "Tidak Terdeteksi",
        region: "",
        country: "Indonesia",
        isp: "Tidak Diketahui"
    };
}

// ------------------------------------------
// 4. FORM KIRIM PESAN & BOT TELEGRAM (NEW FORMAT)
// ------------------------------------------
function initContactForm() {
    const form = document.getElementById("firebase-form");
    const statusDiv = document.getElementById("form-status");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // HONEYPOT ANTI-SPAM
        const honeypot = document.getElementById("website_check_honeypot");
        if (honeypot && honeypot.value !== "") {
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

        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner animate-spin"></i> Mengirim...';
        statusDiv.classList.add("hidden");

        // Ambil Spek Perangkat & Lokasi (Paralel)
        const [specs, location] = await Promise.all([
            getDeviceSpecs(),
            getLocationData()
        ]);

        // Format Waktu Kirim (WITA)
        const now = new Date();
        const timeFormatted = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Makassar",
            dateStyle: "full",
            timeStyle: "medium"
        }).format(now);

        // FORMAT LAPORAN TELEGRAM DENGAN EMBLEM MODERN & RAPI
        const telegramMessage = `
⚡ <b>PESAN BARU MASUK!</b> ⚡
━━━━━━━━━━━━━━━━━━━━━
👤 <b>Pengirim:</b> ${escapeHtml(name)}
📱 <b>Kontak:</b> ${escapeHtml(contact)}
💬 <b>Isi Pesan:</b>
<i>"${escapeHtml(message)}"</i>

━━━━━━━━━━━━━━━━━━━━━
📊 <b>DETEKSI PERANGKAT & LOKASI</b>

⏰ <b>Waktu Login:</b> ${timeFormatted} WITA
📱 <b>Tipe Perangkat:</b> ${specs.deviceType}
💻 <b>Sistem Operasi:</b> ${specs.os}
🌐 <b>Browser:</b> ${specs.browser}
🖥️ <b>Resolusi Layar:</b> ${specs.screenSize}

📍 <b>Lokasi:</b> ${location.city}${location.region ? ', ' + location.region : ''}, ${location.country}
🌐 <b>IP Address:</b> <code>${location.ip}</code>
📡 <b>ISP / Provider:</b> ${location.isp}
━━━━━━━━━━━━━━━━━━━━━
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

// Helper Sanitasi HTML agar Telegram tidak Error
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