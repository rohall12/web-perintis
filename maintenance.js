// ===================================================
// PENGATURAN MODE MAINTENANCE
// true  = Aktifkan Maintenance (Web ditutup)
// false = Matikan Maintenance (Web terbuka/LIVE)
// ===================================================
const IS_MAINTENANCE = false; 

document.addEventListener("DOMContentLoaded", () => {
    const maintenanceScreen = document.getElementById("maintenance-screen");
    if (maintenanceScreen) {
        if (IS_MAINTENANCE) {
            maintenanceScreen.style.setProperty("display", "flex", "important");
        } else {
            maintenanceScreen.style.setProperty("display", "none", "important");
        }
    }
});