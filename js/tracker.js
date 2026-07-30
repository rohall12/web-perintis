import { sendTelegramMessage } from './telegram.js';

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax";
}

function getDeviceInfo() {
    const ua = navigator.userAgent;
    let browser = "Lainnya", os = "Tidak Diketahui", deviceType = "PC / Desktop";

    if (/Mobi|Android|iPhone|iPod/i.test(ua)) deviceType = "Smartphone / HP";
    else if (/Tablet|iPad/i.test(ua)) deviceType = "Tablet";

    if (/edg/i.test(ua)) browser = "Microsoft Edge";
    else if (/chrome|crios/i.test(ua)) browser = "Google Chrome";
    else if (/firefox|fxios/i.test(ua)) browser = "Mozilla Firefox";
    else if (/safari/i.test(ua)) browser = "Safari";

    if (/windows/i.test(ua)) os = "Windows";
    else if (/android/i.test(ua)) os = "Android";
    else if (/iphone|ipad|ipod/i.test(ua)) os = "iOS";
    else if (/linux/i.test(ua)) os = "Linux";

    return { browser, os, deviceType };
}

export async function trackVisitor() {
    if (sessionStorage.getItem("visitor_reported_session")) return;

    let visitorCookie = getCookie("user_device_id");
    let statusPerangkat = "Perangkat Lama (Pernah Berkunjung)";

    if (!visitorCookie) {
        statusPerangkat = "Perangkat Baru (Pertama Kali Masuk)";
        visitorCookie = "dev_" + Math.random().toString(36).substring(2, 11);
        setCookie("user_device_id", visitorCookie, 365);
    }

    const device = getDeviceInfo();
    const localTimeString = new Date().toLocaleString("id-ID", { timeZone: "Asia/Makassar" });

    let ip = "N/A", lokasi = "N/A", isp = "N/A";
    try {
        const ipRes = await fetch("https://ipapi.co/json/");
        if (ipRes.ok) {
            const ipData = await ipRes.json();
            ip = ipData.ip || "N/A";
            lokasi = `${ipData.city || ''}, ${ipData.region || ''}, ${ipData.country_name || ''}`;
            isp = ipData.org || ipData.asn || "N/A";
        }
    } catch (e) {}

    const msg = `🔔 *PENGUNJUNG BARU MASUK WEB!*\n\n` +
                `📱 *Status Perangkat:* ${statusPerangkat}\n` +
                `🆔 *ID Cookie:* \`${visitorCookie}\` \n\n` +
                `💻 *Tipe Perangkat:* ${device.deviceType}\n` +
                `🌐 *Browser:* ${device.browser}\n` +
                `⚙️ *OS:* ${device.os}\n\n` +
                `📍 *IP:* \`${ip}\` \n` +
                `🗺️ *Lokasi:* ${lokasi}\n` +
                `📡 *ISP:* ${isp}\n\n` +
                `⏰ *Waktu Akses:* ${localTimeString} WITA`;

    const success = await sendTelegramMessage(msg);
    if (success) sessionStorage.setItem("visitor_reported_session", "true");
}

export { getCookie };