// 1. IMPORT FIREBASE SDK (MODULAR V10)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 2. PASTE CONFIG FIREBASE KAMU DI SINI
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

// 3. LOGIKA KIRIM PESAN KE FIRESTORE DATABASE
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

            // Tampilkan efek loading
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>Mengirim...</span> ⏳";
            statusTxt.classList.remove('hidden', 'text-green-400', 'text-red-400');
            statusTxt.classList.add('text-gray-400');
            statusTxt.innerText = "Sedang menghubungkan ke server Firebase...";

            try {
                // Simpan data ke koleksi 'pesan_pengunjung' di Firestore
                await addDoc(collection(db, "pesan_pengunjung"), {
                    nama: name,
                    kontak: contact || "Tidak diisi",
                    pesan: message,
                    waktu: serverTimestamp()
                });

                // Notifikasi sukses
                statusTxt.classList.remove('text-gray-400');
                statusTxt.classList.add('text-green-400');
                statusTxt.innerText = "✅ Pesan kamu berhasil terkirim dan tersimpan di Firebase!";
                
                // Reset form
                form.reset();
            } catch (error) {
                console.error("Error Firebase: ", error);
                statusTxt.classList.remove('text-gray-400');
                statusTxt.classList.add('text-red-400');
                statusTxt.innerText = "❌ Gagal mengirim pesan. Pastikan konfigurasi Firebase sudah benar.";
            } finally {
                btnSubmit.disabled = false;
                btnSubmit.innerHTML = "<span>Kirim Pesan ke Firebase</span> 🚀";
            }
        });
    }
});


// --- JAVASCRIPT FETCH API GITHUB ---
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/users/rohall12');
        const data = await response.json();
        
        const reposEl = document.getElementById('github-repos');
        const followersEl = document.getElementById('github-followers');
        if (reposEl) reposEl.innerText = data.public_repos;
        if (followersEl) followersEl.innerText = data.followers;
    } catch (error) {
        console.log("Gagal mengambil data GitHub:", error);
    }
}
window.addEventListener('DOMContentLoaded', fetchGitHubStats);


// --- SKRIP TRACKER MULTI-DEVICE TELEGRAM ---
window.addEventListener('DOMContentLoaded', async () => {
    let ua = navigator.userAgent;
    let browser = "Google Chrome";
    if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
    else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = "Apple Safari";
    else if (/edge|edg/i.test(ua)) browser = "Microsoft Edge";

    let deviceName = "Perangkat Android";
    let androidVersion = "Android";

    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']);
            if (hints.platformVersion) {
                let majorVer = hints.platformVersion.split('.')[0];
                androidVersion = `Android ${majorVer}`;
            }
            if (hints.model) deviceName = hints.model.trim();
        } catch (e) {
            console.log("Client hints fallback active");
        }
    }

    if (deviceName === "Perangkat Android" || deviceName === "") {
        if (/iphone/i.test(ua)) {
            deviceName = "Apple iPhone";
            androidVersion = "iOS";
        } else if (/windows/i.test(ua)) {
            deviceName = "Windows PC";
            androidVersion = "Windows OS";
        }
    }

    const finalDeviceString = `📱 ${deviceName} - ${androidVersion} (${browser})`;
    const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
    const chatId = "5983713854"; 

    if (botToken && chatId) {
        const textMessage = `🚨 Pengunjung Baru Web Roni!\n\nPerangkat: ${finalDeviceString}\n⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ chat_id: chatId, text: textMessage })
        }).catch(err => console.log("Tracker active"));
    }
});