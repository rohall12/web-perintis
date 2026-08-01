var admin = require("firebase-admin");

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body } = req.body;

  try {
    const snapshot = await db.collection('fcm_tokens').get();

    if (snapshot.empty) {
      return res.status(400).json({ error: 'Belum ada perangkat terdaftar!' });
    }

    let tokens = [];
    snapshot.forEach(doc => {
      tokens.push(doc.data().token);
    });

    tokens = [...new Set(tokens)]; // Hapus duplikat

    var message = {
      notification: {
        title: title || "Broadcast RoniHalla!",
        body: body || "Notifikasi massal dari Vercel!",
      },
      tokens: tokens, // Kirim ke banyak perangkat sekaligus
    };

    const response = await admin.messaging().sendEachForMulticast(message);

    return res.status(200).json({ 
      success: true, 
      message: `Disebar ke ${response.successCount} perangkat!` 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}