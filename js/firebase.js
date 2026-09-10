import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, set } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";
import { FIREBASE_CONFIG } from './config.js';

const app = initializeApp(FIREBASE_CONFIG);
export const db = getDatabase(app);

export async function saveMessageToFirebase(data) {
    const messagesRef = ref(db, "messages");
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, data);
}