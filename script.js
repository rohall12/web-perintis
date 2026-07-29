// ==========================================
// 1. CONFIG MAINTENANCE MODE
// ==========================================
const IS_MAINTENANCE = false; // Ubah ke 'true' jika ingin mengaktifkan mode maintenance

// ==========================================
// 2. FIREBASE CONFIGURATION
// ==========================================
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyDJE6Ua3tGM0ltnuBiXC5jvM-VLBZCmGqI",
    authDomain: "my-portofolio-c2eeb.firebaseapp.com",
    // ⚠️ PASTIKAN URL DI BAWAH INI SAMA PERSIS DENGAN YANG ADA DI FIREBASE CONSOLE KAMU!
    databaseURL: "https://my-portofolio-c2eeb-default-rtdb.asia-southeast1.firebasedatabase.app/", 
    projectId: "my-portofolio-c2eeb",
    storageBucket: "my-portofolio-c2eeb.firebasestorage.app",
    messagingSenderId: "686049637486",
    appId: "1:686049637486:web:1704c34bb302ec0a7c227f"
};

// Inisialisasi Firebase
let app, database;
try {
    app = initializeApp(firebaseConfig);
    database = getDatabase(app);
} catch (err) {
    console.error("Firebase Init Error:", err);
}

// ==========================================
// 3. MAIN EVENT LISTENER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Maintenance Handler
    const maintenanceScreen = document.getElementById("maintenance-screen");
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';

    if (IS_MAINTENANCE && !isPreview) {
        if (maintenanceScreen) {
            maintenanceScreen.classList.remove("hidden");
            document.body.classList.add("overflow-hidden");
        }
    } else {
        if (maintenanceScreen) {
            maintenanceScreen.classList.add("hidden");
            document.body.classList.remove("overflow-hidden");
        }
    }

    // Run Clock & Stats
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

    const sidebarTime = document.getElementById("sidebar-time");
    const topTime = document.getElementById("top-time");

    if (sidebarTime) sidebarTime.textContent = `${hours}:${minutes}:${seconds}`;
    if (topTime) topTime.textContent = `${hours}:${minutes} WITA`;
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
        console.error("GitHub API Error:", err);
    }
}

// Helper Timeout (Biar tidak gantung selamanya)
function timeoutPromise(ms) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error("Request Timeout")), ms));
}

// ==========================================
// 6. FORM PESAN DIRECT (ANTI-STUCK)
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

        // Visual State Loading
        if (statusEl) {
            statusEl.classList.remove("hidden", "text-emerald-400", "text-rose-500");
            statusEl.classList.add("text-amber-400");
            statusEl.textContent = "Sedang mengirim pesan...";
        }

        try {
            if (!database) throw new Error("Database belum siap");

            const messagesRef = ref(database, 'messages');

            // Kirim pesan dengan batas waktu maksimal 6 detik
            await Promise.race([
                push(messagesRef, {
                    name: name,
                    contact: contact || "Anonim",
                    message: message,
                    timestamp: serverTimestamp()
                }),
                timeoutPromise(6000)
            ]);

            // Visual State Sukses
            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-emerald-400");
                statusEl.textContent = "Pesan berhasil terkirim! Terima kasih, kawan. 👍";
            }

            form.reset();
        } catch (error) {
            console.error("Gagal mengirim pesan:", error);
            if (statusEl) {
                statusEl.classList.remove("text-amber-400");
                statusEl.classList.add("text-rose-500");
                statusEl.textContent = "Gagal terhubung. Cek URL database & Rules Firebase kamu!";
            }
        }
    });
}

// ==========================================
// 7. SIDEBAR & UI CONTROLS
// ==========================================
function setupUIControls() {
    const mobileToggle = document.getElementById("mobile-menu-toggle");
    const sidebarToggle = document.getElementById("sidebar-toggle");
    const sidebarNav = document.getElementById("sidebar-nav");

    const toggleSidebar = () => {
        if (sidebarNav) sidebarNav.classList.toggle("hidden");
    };

    if (mobileToggle) mobileToggle.addEventListener("click", toggleSidebar);
    if (sidebarToggle) sidebarToggle.addEventListener("click", toggleSidebar);
}