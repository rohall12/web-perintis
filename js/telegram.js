import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from './config.js';

export async function sendTelegramMessage(text) {
    try {
        const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: text,
                parse_mode: "Markdown"
            })
        });
        return res.ok;
    } catch (err) {
        console.error("Telegram API Error:", err);
        return false;
    }
}