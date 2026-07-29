/**
 * ==========================================
 * MAINTENANCE & AUTO-UPDATE SYSTEM (maintenance.js)
 * ==========================================
 */
const MAINTENANCE_CONFIG = {
    isMaintenance: true, // Ubah ke 'true' jika ingin mengaktifkan mode maintenance website
    versionEndpoint: "./version.json",
    checkInterval: 5 * 60 * 1000 // Cek pembaruan setiap 5 menit (sangat hemat resource)
};

(function () {
    // 1. Logika Maintenance Mode
    const urlParams = new URLSearchParams(window.location.search);
    const isPreview = urlParams.get('preview') === 'true';

    if (MAINTENANCE_CONFIG.isMaintenance && !isPreview) {
        document.addEventListener("DOMContentLoaded", () => {
            const maintenanceScreen = document.getElementById("maintenance-screen");
            if (maintenanceScreen) {
                maintenanceScreen.classList.remove("hidden");
                document.body.classList.add("overflow-hidden");
            }
        });
    }

    // 2. Version Detection & Auto-Update / Cache Busting
    async function checkForUpdates() {
        try {
            // Tambahkan timestamp agar browser tidak mengambil data dari cache lama untuk file version.json
            const response = await fetch(MAINTENANCE_CONFIG.versionEndpoint + "?t=" + Date.now(), {
                cache: "no-store"
            });
            if (!response.ok) return;
            
            const data = await response.json();
            const latestVersion = data.version;
            const storedVersion = localStorage.getItem("app_version");

            if (!storedVersion) {
                // Simpan versi awal saat pertama kali pengunjung buka web
                localStorage.setItem("app_version", latestVersion);
            } else if (storedVersion !== latestVersion) {
                // Versi server berbeda! Berarti ada update baru dari developer
                console.log(`Pembaruan terdeteksi: Versi lama (${storedVersion}) -> Versi baru (${latestVersion})`);
                localStorage.setItem("app_version", latestVersion);

                // Proteksi anti-infinite loop menggunakan sessionStorage
                if (!sessionStorage.getItem("just_reloaded_for_update")) {
                    sessionStorage.setItem("just_reloaded_for_update", "true");
                    
                    // Reload otomatis agar browser memuat asset, CSS, dan JS versi terbaru tanpa clear cache manual
                    window.location.reload(true);
                }
            } else {
                // Jika versi sudah sinkron, bersihkan flag reload
                sessionStorage.removeItem("just_reloaded_for_update");
            }
        } catch (err) {
            console.error("Gagal memeriksa versi website:", err);
        }
    }

    // Jalankan pengecekan saat halaman selesai dimuat
    window.addEventListener("load", () => {
        checkForUpdates();

        // Pengecekan berkala secara efisien (hanya saat tab aktif/dilihat user)
        setInterval(() => {
            if (document.visibilityState === "visible") {
                checkForUpdates();
            }
        }, MAINTENANCE_CONFIG.checkInterval);
    });
})();