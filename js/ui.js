export function initClock() {
    const timeEl = document.getElementById("sidebar-time");
    if (!timeEl) return;
    
    const update = () => {
        const now = new Date();
        timeEl.textContent = new Intl.DateTimeFormat("id-ID", {
            timeZone: "Asia/Makassar",
            hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false
        }).format(now);
    };
    setInterval(update, 1000);
    update();
}

export function showFormStatus(text, colorClass) {
    const statusEl = document.getElementById("form-status");
    if (statusEl) {
        statusEl.className = `text-xs font-semibold py-1 ${colorClass}`;
        statusEl.textContent = text;
        statusEl.classList.remove("hidden");
        setTimeout(() => statusEl.classList.add("hidden"), 5000);
    }
}