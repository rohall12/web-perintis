// ==========================================
// 1. IMPORT FIREBASE SDK
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==========================================
// 2. HELPER COOKIES
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
// 3. DIGITAL CLOCK & TIMEZONE AUTOMATION
// ==========================================
function updateRealtimeClock() {
    const sidebarTime = document.getElementById('sidebar-time');
    const sidebarTimezone = document.getElementById('sidebar-timezone');
    const topTime = document.getElementById('top-time');

    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    let tzName = "WITA";
    try {
        const parts = new Intl.DateTimeFormat('id-ID', { timeZoneName: 'short' }).formatToParts(now);
        const tzPart = parts.find(p => p.type === 'timeZoneName');
        if (tzPart) tzName = tzPart.value;
    } catch (e) {}

    if (sidebarTime) sidebarTime.innerText = `${hours}:${minutes}:${seconds}`;
    if (sidebarTimezone) sidebarTimezone.innerText = `${tzName} (UTC+8)`;
    if (topTime) topTime.innerText = `${hours}:${minutes} ${tzName}`;
}
setInterval(updateRealtimeClock, 1000);
updateRealtimeClock();

// ==========================================
// 4. MOBILE SIDEBAR TOGGLE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const topToggleBtn = document.getElementById('sidebar-toggle');
    const nav = document.getElementById('sidebar-nav');

    function toggleMenu() {
        if (nav) nav.classList.toggle('hidden');
    }

    if (toggleBtn) toggleBtn.addEventListener('click', toggleMenu);
    if (topToggleBtn) topToggleBtn.addEventListener('click', toggleMenu);
});

// ==========================================
// 5. DEVICE DETECTION ENGINE
// ==========================================
function getGPUInfo() {
    try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        if (!gl) return "Standard GPU";
        const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
        if (debugInfo) {
            return gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
        }
    } catch (e) {}
    return "Standard GPU";
}

async function getDeviceInfo() {
    const ua = navigator.userAgent;
    let deviceName = "PC / Laptop";
    if (/iPhone/i.test(ua)) deviceName = "Apple iPhone";
    else if (/Android/i.test(ua)) deviceName = "Android Smartphone";

    return {
        device: deviceName,
        gpu: getGPUInfo(),
        browser: navigator.userAgentData ? navigator.userAgentData.brands[0]?.brand : "Browser"
    };
}

// ==========================================
// 6. FORM PESAN DIRECT (FIREBASE & TELEGRAM)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('firebase-form');
    const statusTxt = document.getElementById('form-status');
    const btnSubmit = document.getElementById('btn-submit');

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('sender-name').value;
            const contact = document.getElementById('sender-contact').value;
            const message = document.getElementById('sender-message').value;

            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>MENGIRIM...</span> ⏳";

            try {
                await addDoc(collection(db, "pesan_pengunjung"), {
                    nama: name,
                    kontak: contact,
                    pesan: message,
                    waktu: serverTimestamp()
                });

                const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
                const chatId = "5983713854"; 

                const telegramText = `📩 PESAN BARU DARI PORTFOLIO!\n\n` +
                                     `👤 Nama: ${name}\n` +
                                     `📧 Kontak: ${contact}\n` +
                                     `💬 Pesan:\n"${message}"\n\n` +
                                     `⏰ Waktu: ${new Date().toLocaleString('id-ID')}`;

                await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ chat_id: chatId, text: telegramText })
                });

                statusTxt.classList.remove('hidden', 'text-red-500');
                statusTxt.classList.add('text-emerald-400');
                statusTxt.innerText = "✅ Pesan berhasil terkirim!";
                form.reset();
            } catch (err) {
                statusTxt.classList.remove('hidden', 'text-emerald-400');
                statusTxt.classList.add('text-red-500');
                statusTxt.innerText = "❌ Gagal mengumpulkan pesan.";
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "<span>KIRIM PESAN</span> ✈️";
            }
        });
    }
});

// ==========================================
// 7. VISITOR TRACKER TELEGRAM
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
    const info = await getDeviceInfo();
    const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
    const chatId = "5983713854"; 

    if (botToken && chatId) {
        const textMessage = `🚨 VISITOR ALERT (CYBERPUNK UI)!\n\n` +
                            `📱 Perangkat: ${info.device}\n` +
                            `🎮 GPU: ${info.gpu}\n` +
                            `⏰ Waktu: ${new Date().toLocaleString('id-ID')}`;
        
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: textMessage })
        }).catch(() => {});
    }
});

// ==========================================
// 8. GITHUB API LIVE STATS
// ==========================================
async function fetchGitHubStats() {
    try {
        const res = await fetch('https://api.github.com/users/rohall12');
        const data = await res.json();
        
        const repos = document.getElementById('github-repos');
        const followers = document.getElementById('github-followers');
        if (repos) repos.innerText = data.public_repos ?? 2;
        if (followers) followers.innerText = data.followers ?? 0;
    } catch (e) {}
}
window.addEventListener('DOMContentLoaded', fetchGitHubStats);

// ==========================================
// 9. COOKIE BANNER
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptBtn = document.getElementById('cookie-accept-btn');
    const declineBtn = document.getElementById('cookie-decline-btn');

    if (!getCookie('cookie_consent') && cookieBanner) {
        setTimeout(() => cookieBanner.classList.remove('hidden'), 1000);
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