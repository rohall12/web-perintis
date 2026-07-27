// --- JAVASCRIPT FETCH API GITHUB ---
async function fetchGitHubStats() {
    try {
        const response = await fetch('https://api.github.com/users/rohall12');
        const data = await response.json();
        
        document.getElementById('github-repos').innerText = data.public_repos;
        document.getElementById('github-followers').innerText = data.followers;
    } catch (error) {
        console.log("Gagal mengambil data GitHub:", error);
        document.getElementById('github-repos').innerText = "0";
        document.getElementById('github-followers').innerText = "0";
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
    else if (/opr|opera/i.test(ua)) browser = "Opera";
    else if (/samsungbrowser/i.test(ua)) browser = "Samsung Internet";

    let deviceName = "Perangkat Android";
    let androidVersion = "Android";

    if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
        try {
            const hints = await navigator.userAgentData.getHighEntropyValues(['model', 'platformVersion']);
            if (hints.platformVersion) {
                let majorVer = hints.platformVersion.split('.')[0];
                androidVersion = `Android ${majorVer}`;
            }
            if (hints.model) {
                deviceName = hints.model.trim();
            }
        } catch (e) {
            console.log("Client hints fallback active");
        }
    }

    if (deviceName === "Perangkat Android" || deviceName === "") {
        if (/SM-[A-Z0-9]+/i.test(ua)) {
            let matchModel = ua.match(/(SM-[A-Z0-9]+)/i);
            deviceName = `Samsung ${matchModel[1]}`;
        } else if (/samsung/i.test(ua)) {
            deviceName = "Samsung Galaxy";
        } else if (/oppo/i.test(ua)) {
            deviceName = "Oppo Smartphone";
        } else if (/vivo/i.test(ua)) {
            deviceName = "Vivo Smartphone";
        } else if (/xiaomi|redmi|poco/i.test(ua)) {
            deviceName = "Xiaomi / Redmi";
        } else if (/iphone/i.test(ua)) {
            deviceName = "Apple iPhone";
            androidVersion = "iOS";
        } else if (/windows/i.test(ua)) {
            deviceName = "Windows PC";
            androidVersion = "Windows OS";
        } else {
            let androidMatch = ua.match(/Android\s([0-9.]+)/i);
            if (androidMatch) {
                androidVersion = `Android ${androidMatch[1]}`;
            }
        }
    }

    const finalDeviceString = `📱 ${deviceName} - ${androidVersion} (${browser})`;
    const botToken = "8886940858:AAEMAdvWAyfK0vi6Rpx-qmME3pvwyM8Q6Ew"; 
    const chatId = "5983713854"; 

    if (botToken && chatId) {
        const textMessage = `🚨 Pengunjung Baru Web Roni!\n\nPerangkat: ${finalDeviceString}\n⏰ Waktu: ${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}`;
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

        fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: textMessage
            })
        }).catch(err => console.log("Tracker active"));
    }
});