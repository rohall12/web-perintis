// ==========================================
// 1. CONFIG MAINTENANCE MODE
// ==========================================
// Ubah 'true' jadi 'false' kalau update web sudah selesai.
const IS_MAINTENANCE = true; 

// ==========================================
// 2. FIREBASE CONFIGURATION & INITIALIZATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// ==========================================
// 3. MAIN EVENT LISTENER (LOAD SCREEN)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // --- LOGIKA MAINTENANCE OVERLAY ---
    const maintenanceScreen = document.getElementById("maintenance-screen");
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';

    if (IS_MAINTENANCE && !isPreview) {
        if (maintenanceScreen) {
            maintenanceScreen.classList.remove("hidden");
            document.body.classList.add("overflow-hidden"); // Kunci scroll layar
        }
    } else {
        if (maintenanceScreen) {
            maintenanceScreen.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
        }
    }

    // --- INISIALISASI FITUR LAIN ---
    updateClock();
    setInterval(updateClock, 1000);
    fetchGitHubStats("rohall12");
    setupFormHandler();
    setupUIControls();
});

// ==========================================
// 4. JAM DIGITAL OTOMATIS
// ==========================================
function updateClock() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeFull = `${hours}:${minutes}:${seconds}`;
    const timeShort = `${hours}:${minutes}`;

    const sidebarTime = document.getElementById("sidebar-time");
    const topTime = document.getElementById("top-time");

    if (sidebarTime) sidebarTime.textContent = timeFull;
    if (topTime) topTime.textContent = `${timeShort} WITA`;
}

// ==========================================
// 5. GITHUB LIVE STATS API
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
        console.error("Gagal mengambil data GitHub:", err);
    }
}

// ==========================================
// 6. FORM PESAN DIRECT (FIREBASE REALTIME DB)
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
            const messagesRef = ref(database, 'messages');
            await push(messagesRef, {
                name: name,
                contact: contact || "Anonim",
                message: message,
                timestamp: serverTimestamp()
            });

            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-emerald-400");
                statusEl.textContent = "Pesan berhasil terkirim! Terima kasih, kawan. 👍";
            }

            form.reset();
        } catch (error) {
            console.error("Gagal menyimpan pesan:", error);
            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-rose-500");
                statusEl.textContent = "Gagal mengirim pesan. Coba lagi nanti ya.";
            }
        }
    });
}

// ==========================================
// 7. NAVIGASI MOBILE SIDEBAR & UI
// ==========================================
function setupUIControls() {
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarNav = document.getElementById("sidebar-nav");

    const toggleSidebar = () => {
        if (sidebarNav) {
            sidebarNav.classList.toggle("hidden");
        }
    };

    if (mobileToggle) mobileToggle.addEventListener("click", toggleSidebar);
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar);
}