// ==========================================
// 1. IMPORT FIREBASE SDK (MODULAR V10)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 2. FIREBASE CONFIGURATION
// ==========================================
// ⚠️ Ganti value di bawah ini dengan kredensial Firebase milikmu!
const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// ==========================================
// 3. HELPER FUNCTIONS: COOKIE MANAGEMENT
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


// ==========================================
// 4. JAM LOKAL LIVE (WITA)
// ==========================================
function updateLocalTime() {
    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const now = new Date();
        const timeString = now.toLocaleTimeString('id-ID', { 
            timeZone: 'Asia/Makassar', 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        timeEl.innerText = `(${timeString} WITA)`;
    }
}
setInterval(updateLocalTime, 1000);
updateLocalTime();


// ==========================================
// 5. ADVANCED HARDWARE & BROWSER DETECTION
// ==========================================
// A. Deteksi GPU / Kartu Grafis (WebGL)
function getGPUInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return "Tidak Terdeteksi";
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            let renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
            renderer = renderer.replace(/^ANGLE \((.*)\)$/, '$1');
            renderer = renderer.replace(/Direct3D11 vs_5_0 ps_5_0/i, '').trim();
            return renderer;
        }
    } catch (e) { }
    return "Standard GPU";
}

// B. Deteksi Browser Lengkap & Versi
function getBrowserDetail() {
    const ua = navigator.userAgent;
    let browserName = "Chrome";
    let fullVersion = "";

    if (/FBAN|FBAV/i.test(ua)) {
        browserName = "Facebook In-App Browser";
    } else if (/Instagram/i.test(ua)) {
        browserName = "Instagram In-App Browser";
    } else if (/TikTok/i.test(ua)) {
        browserName = "TikTok In-App Browser";
    } else if (/edg/i.test(ua)) {
        browserName = "Microsoft Edge";
    } else if (/samsungbrowser/i.test(ua)) {
        browserName = "Samsung Internet";
    } else if (/opera|opr/i.test(ua)) {
        browserName = "Opera";
    } else if (/chrome|crios/i.test(ua) && !/edg/i.test(ua)) {
        browserName = "Google Chrome";
    } else if (/firefox|fxios/i.test(ua)) {
        browserName = "Mozilla Firefox";
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
        browserName = "Apple Safari";
    } else if (/brave/i.test(ua) || (navigator.brave && typeof navigator.brave.isBrave === "function")) {
        browserName = "Brave Browser";
    } else if (/ucbrowser/i.test(ua)) {
        browserName = "UC Browser";
    }

    let match = ua.match(/(chrome|safari|firefox|msie|trident|edg|opr|samsungbrowser)\/?\s*(\d+)/i);
    if (match && match[2]) {
        fullVersion = ` v${match[2]}`;
    }

    return `${browserName}${fullVersion}`;
}

// C. Engine Deteksi Seri HP & Perangkat High-Entropy
async function getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceName = "Unknown Device";
    let osDetail = "Unknown OS";
    let gpu = getGPUInfo();
    let browser = getBrowserDetail();
    
    let ram = navigator.deviceMemory ? `~${navigator.deviceMemory} GB RAM` : "RAM tak terdeteksi";
    let cpuCores = navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} Cores CPU` : "CPU tak terdeteksi";
    let isTouch = ('ontouchstart' in window || navigator.maxTouchPoints > 0) ? "Touchscreen" : "Non-Touch";
    let screenSize = `${window.screen.width} x ${window.screen.height}`;

    // 1. Client Hints (Chromium Modern / Android Terbaru)
    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues([
                'model', 'platform', 'platformVersion', 'architecture', 'bitness'
            ]);

            if (hints.model && hints.model.trim() !== "") {
                deviceName = hints.model.trim();
            }

            if (hints.platform) {
                let pVer = hints.platformVersion ? hints.platformVersion.split('.')[0] : '';
                if (hints.platform === "Android") {
                    osDetail = `Android ${pVer || ''}`;
                } else if (hints.platform === "Windows") {
                    let winVer = parseInt(pVer) >= 13 ? "Windows 11" : "Windows 10";
                    osDetail = `${winVer} ${hints.bitness || '64'}-bit`;
                } else if (hints.platform === "macOS") {
                    osDetail = `macOS (${hints.architecture || 'Apple Silicon/Intel'})`;
                } else {
                    osDetail = hints.platform;
                }
            }
        } catch (e) {
            console.log("Client hints fallback active");
        }
    }

    // 2. Fallback Regex Brand & Seri HP / Laptop
    if (deviceName === "Unknown Device" || deviceName === "") {
        if (/iPhone/i.test(ua)) {
            if (gpu.includes("A17") || gpu.includes("A16")) {
                deviceName = "Apple iPhone (Series 14 Pro / 15)";
            } else if (gpu.includes("A15")) {
                deviceName = "Apple iPhone (Series 13 / 14)";
            } else {
                deviceName = "Apple iPhone";
            }
            osDetail = "iOS";
        } else if (/iPad/i.test(ua)) {
            deviceName = "Apple iPad";
            osDetail = "iPadOS";
        } else if (/SM-[A-Z0-9]+/i.test(ua)) {
            let model = ua.match(/(SM-[A-Z0-9]+)/i);
            deviceName = `Samsung Galaxy (${model[1]})`;
            osDetail = "Android";
        } else if (/Redmi|Xiaomi|POCO/i.test(ua)) {
            let model = ua.match(/(Redmi [A-Za-z0-9\s]+|POCO [A-Za-z0-9\s]+|Mi [A-Za-z0-9\s]+)/i);
            deviceName = model ? model[0] : "Xiaomi / Redmi / POCO";
            osDetail = "Android";
        } else if (/CPH[0-9]+|OPPO/i.test(ua)) {
            let model = ua.match(/(CPH[0-9]+)/i);
            deviceName = model ? `OPPO Smartphone (${model[1]})` : "OPPO Smartphone";
            osDetail = "Android";
        } else if (/V[0-9]{4}[A-Z]?|vivo/i.test(ua)) {
            deviceName = "Vivo Smartphone";
            osDetail = "Android";
        } else if (/Realme|RMX[0-9]+/i.test(ua)) {
            deviceName = "Realme Smartphone";
            osDetail = "Android";
        } else if (/Infinix|X[0-9]{3,4}/i.test(ua)) {
            deviceName = "Infinix Smartphone";
            osDetail = "Android";
        } else if (/Windows/i.test(ua)) {
            deviceName = isTouch.includes("Touch") ? "Windows Laptop (Touchscreen)" : "Windows PC / Laptop";
            osDetail = ua.includes("NT 10.0") ? "Windows 10/11" : "Windows OS";
        } else if (/Macintosh|Mac OS X/i.test(ua)) {
            deviceName = "Apple Mac / MacBook";
            osDetail = "macOS";
        } else if (/Linux/i.test(ua)) {
            deviceName = "Linux Desktop / Laptop";
            osDetail = "Linux OS";
        }
    }

    return {
        device: deviceName,
        os: osDetail,
        gpu: gpu,
        browser: browser,
        screen: screenSize,
        touch: isTouch,
        hardware: `${cpuCores} | ${ram}`
    };
}


// ==========================================
// 6. FORM PESAN (FIREBASE & TELEGRAM BOT)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('firebase-form');
    const statusTxt = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Proteksi Cooldown Anti-Spam (60 Detik)
            const COOLDOWN_MS = 60 * 1000;
            const lastSubmitTime = localStorage.getItem('last_message_submit');
            const now = Date.now();

            if (lastSubmitTime && (now - lastSubmitTime < COOLDOWN_MS)) {
                const remainingSec = Math.ceil((COOLDOWN_MS - (now - lastSubmitTime)) / 1000);
                statusTxt.classList.remove('hidden', 'text-gray-400', 'text-green-400');
                statusTxt.classList.add('text-amber-400');
                statusTxt.innerText = `🛡️ Anti-Spam: Tunggu ${remainingSec} detik lagi sebelum mengirim pesan baru.`;
                return;
            }

            const name = document.getElementById('sender-name').value;
            const contact = document.getElementById('sender-contact').value;
            const message = document.getElementById('sender-message').value;

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>Mengirim...</span> ⏳";
            statusTxt.classList.remove('hidden', 'text-green-400', 'text-red-400', 'text-amber-400');
            statusTxt.classList.add('text-gray-400');
            statusTxt.innerText = "Mengirim pesan ke Firebase & Telegram...";

            try {
                // A. Simpan ke Firestore Database
                await addDoc(collection(db, "pesan_pengunjung"), {
                    nama: name,
                    kontak: contact || "Tidak diisi",
                    pesan: message,
                    waktu: serverTimestamp()
                });

                // B. Kirim Notifikasi ke Telegram
                const info = await getDeviceInfo();
                const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
                const chatId = "5983713854"; 

                const telegramText = `📩 PESAN BARU DARI PORTFOLIO!\n\n` +
                                     `👤 Nama: ${name}\n` +
                                     `📧 Kontak: ${contact || "Tidak diisi"}\n` +
                                     `💬 Pesan:\n"${message}"\n\n` +
                                     `📱 Perangkat: ${info.device} (${info.os})\n` +
                                     `🎮 GPU: ${info.gpu}\n` +
                                     `🌐 Browser: ${info.browser}\n` +
                                     `⚡ Hardware: ${info.hardware}\n` +
                                     `⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`;

                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: telegramText })
                });

                localStorage.setItem('last_message_submit', Date.now());

                statusTxt.classList.remove('text-gray-400');
                statusTxt.classList.add('text-green-400');
                statusTxt.innerText = "✅ Pesan terkirim! Terimakasih sudah menghubungi gua.";
                
                form.reset();
            } catch (error) {
                console.error("Error Firebase/Telegram: ", error);
                statusTxt.classList.remove('text-gray-400');
                statusTxt.classList.add('text-red-400');
                statusTxt.innerText = "❌ Gagal mengirim pesan. Silakan coba lagi.";
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "<span>Kirim Pesan</span> 🚀";
            }
        });
    }
});


// ==========================================
// 7. COOKIE BANNER & CONSENT LOGIC
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const declineBtn = document.getElementById('cookie-decline-btn');

    const hasConsented = getCookie('cookie_consent');

    if (!hasConsented && cookieBanner) {
        setTimeout(() => {
            cookieBanner.classList.remove('hidden');
        }, 1000);
    }

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            setCookie('cookie_consent', 'accepted', 30);
            cookieBanner.classList.add('hidden');
        });
    }

    if (declineBtn) {
        declineBtn.addEventListener('click', () => {
            setCookie('cookie_consent', 'declined', 7);
            cookieBanner.classList.add('hidden');
        });
    }
});


// ==========================================
// 8. TRACKER PENGUNJUNG (TELEGRAM ALERT)
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const info = await getDeviceInfo();
    const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
    const chatId = "5983713854"; 

    // Cek Status Visitor dari Cookie
    let visitorStatus = getCookie('returning_visitor') ? '🔄 Pengunjung Lama' : '✨ Pengunjung Baru';
    setCookie('returning_visitor', 'true', 365);

    if (botToken && chatId) {
        const textMessage = `🚨 VISITOR ALERT!\n\n` +
                            `Status: ${visitorStatus}\n` +
                            `📱 Perangkat: ${info.device} (${info.os})\n` +
                            `🎮 GPU: ${info.gpu}\n` +
                            `🌐 Browser: ${info.browser}\n` +
                            `🖥️ Layar: ${info.screen} (${info.touch})\n` +
                            `⚡ Hardware: ${info.hardware}\n` +
                            `⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Makassar' })}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: textMessage })
        }).catch(err => console.log("Tracker active"));
    }
});


// ==========================================
// 9. GITHUB STATS FETCHING
// ==========================================
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/users/rohall12');
        const data = await response.json();
        
        const reposEl = document.getElementById('github-repos');
        const followersEl = document.getElementById('github-followers');
        if (reposEl) reposEl.innerText = data.public_repos;
        if (followersEl) followersEl.innerText = data.followers;
    } catch (error) {
        console.log("GitHub API Error:", error);
    }
}
window.addEventListener('DOMContentLoaded', fetchGitHubStats);


// ==========================================
// 10. SCROLL REVEAL ANIMATION
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const reveals = document.querySelectorAll('.reveal');
    const observerOptions = { root: null, threshold: 0.15, rootMargin: "0px 0px -50px 0px" };

    const revealOnScroll = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    reveals.forEach(el => revealOnScroll.observe(el));
});


// ==========================================
// 11. THEME ACCENT SWITCHER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themes = ['default', 'green', 'blue'];
    
    const savedTheme = localStorage.getItem('user_accent_theme') || 'default';
    if (savedTheme !== 'default') {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            let currentTheme = document.documentElement.getAttribute('data-theme') || 'default';
            let nextIndex = (themes.indexOf(currentTheme) + 1) % themes.length;
            let nextTheme = themes[nextIndex];

            if (nextTheme === 'default') {
                document.documentElement.removeAttribute('data-theme');
            } else {
                document.documentElement.setAttribute('data-theme', nextTheme);
            }

            localStorage.setItem('user_accent_theme', nextTheme);
        });
    }
});


// ==========================================
// 12. PWA PROMPT & SERVICE WORKER
// ==========================================
let deferredPrompt;
const pwaBtn = document.getElementById('pwa-install-btn');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaBtn) pwaBtn.classList.remove('hidden');
});

if (pwaBtn) {
    pwaBtn.addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response: ${outcome}`);
            deferredPrompt = null;
            pwaBtn.classList.add('hidden');
        }
    });
}

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(reg => console.log('SW Registered!', reg))
            .catch(err => console.log('SW Error:', err));
    });
}