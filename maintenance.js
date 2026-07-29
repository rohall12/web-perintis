// SETTING MODE MAINTENANCE (false = MATI / WEBSITE LIVE)
const IS_MAINTENANCE = false; 

document.addEventListener("DOMContentLoaded", () => {
    const maintenanceScreen = document.getElementById("maintenance-screen");
    if (maintenanceScreen) {
        if (IS_MAINTENANCE) {
            maintenanceScreen.classList.remove("hidden");
        } else {
            maintenanceScreen.classList.add("hidden");
        }
    }
});