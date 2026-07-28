// ==========================================
// 1. IMPORT FIREBASE SDK (MODULAR V10)
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ==========================================
// 2. FIREBASE CONFIGURATION
// ==========================================
// ⚠️ Masukkan kredensial Firebase milikmu di bawah ini:
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
// 4. JAM LOKAL DENGAN AUTO-DETEKSI ZONA WAKTU (WITA/WIB/WIT/DLL)
// ==========================================
function updateLocalTime() {
    const timeEl = document.getElementById('local-time');
    if (timeEl) {
        const now = new Date();
        
        // Mengambil jam & menit format 24 jam lokal pengunjung
        const timeString = now.toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false
        }).replace('.', ':');
        
        // Deteksi singkatan zona waktu secara otomatis (WITA / WIB / WIT / dll)
        let tzName = "";
        try {
            const parts = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' }).formatToParts(now);
            const tzPart = parts.find(p => p.type === 'timeZoneName');
            if (tzPart) tzName = tzPart.value;
        } catch (e) {
            tzName = "";
        }

        timeEl.innerText = `${timeString} ${tzName}`.trim();
    }
}
setInterval(updateLocalTime, 1000);
updateLocalTime();


// ==========================================
// 5. LOGIC SIDEBAR MENU (OPEN / CLOSE / OVERLAY)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const openBtn = document.getElementById('sidebar-toggle');
    const closeBtn = document.getElementById('sidebar-close');
    const sidebarLinks = document.querySelectorAll('.sidebar-link');

    function openSidebar() {
        overlay.classList.remove('hidden');
        setTimeout(() => overlay.classList.remove('opacity-0'), 10);
        sidebar.classList.remove('-translate-x-full');
    }

    function closeSidebar() {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('opacity-0');
        setTimeout(() => overlay.classList.add('hidden'), 300);
    }

    if (openBtn) openBtn.addEventListener('click', openSidebar);
    if (closeBtn) closeBtn.addEventListener('click', closeSidebar);
    if (overlay) overlay.addEventListener('click', closeSidebar);

    // Otomatis tutup sidebar saat link menu diklik
    sidebarLinks.forEach(link => {
        link.addEventListener('click', closeSidebar);
    });
});


// ==========================================
// 6. HARDWARE & BROWSER DETECTION ENGINE
// ==========================================
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
        } catch (e) { }
    }

    if (deviceName === "Unknown Device" || deviceName === "") {
        if (/iPhone/i.test(ua)) {
            deviceName = "Apple iPhone";
            osDetail = "iOS";
        } else if (/iPad/i.test(ua)) {
            deviceName = "Apple iPad";
            osDetail = "iPadOS";
        } else if (/SM-[A-Z0-9]+/i.test(ua)) {
            let model = ua.match(/(SM-[A-Z0-9]+)/i);
            deviceName = `Samsung Galaxy (${model[1]})`;
            osDetail = "Android";
        } else if (/Redmi|Xiaomi|POCO/i.test(ua)) {
            deviceName = "Xiaomi / Redmi / POCO";
            osDetail = "Android";
        } else if (/Windows/i.test(ua)) {
            deviceName = "Windows PC / Laptop";
            osDetail = "Windows OS";
        } else if (/Macintosh/i.test(ua)) {
            deviceName = "Apple Mac / MacBook";
            osDetail = "macOS";
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
// 7. FORM PESAN (FIREBASE & TELEGRAM)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('firebase-form');
    const statusTxt = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

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
                await addDoc(collection(db, "pesan_pengunjung"), {
                    nama: name,
                    kontak: contact || "Tidak diisi",
                    pesan: message,
                    waktu: serverTimestamp()
                });

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
                                     `⏰ Waktu: ${new Date().toLocaleString('id-ID')}`;

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
// 8. COOKIE BANNER LOGIC
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
// 9. TRACKER PENGUNJUNG
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const info = await getDeviceInfo();
    const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
    const chatId = "5983713854"; 

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
                            `⏰ Waktu: ${new Date().toLocaleString('id-ID')}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: textMessage })
        }).catch(err => console.log("Tracker active"));
    }
});


// ==========================================
// 10. GITHUB STATS
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
// 11. SCROLL REVEAL & THEME SWITCHER
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

    // Theme Switcher
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
// 12. PWA & GLITCH BUTTON TRIGGER
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
            deferredPrompt = null;
            pwaBtn.classList.add('hidden');
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const glitchBtns = document.querySelectorAll('.glitch-btn');
    glitchBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            btn.classList.add('glitch-trigger');
            setTimeout(() => {
                btn.classList.remove('glitch-trigger');
            }, 300);
        });
    });
});