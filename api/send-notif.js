var admin = require("firebase-admin");

// Inisialisasi Firebase Admin pakai environment variables dari Vercel
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export default async function handler(req, res) {
  // Hanya izinkan metode POST
  if (req.method !== 'POST') {
    return res.status(405.0).json({ error: 'Method not allowed' });
  }

  const { token, title, body } = req.body;

  if (!token) {
    return res.status(400.0).json({ error: 'FCM Token wajib diisi!' });
  }

  var message = {
    notification: {
      title: title || "Update Terbaru RoniHalla!",
      body: body || "Ada info seru nih di web portofolio!",
    },
    token: token,
  };

  try {
    // Tembak notifikasi secara instan langsung ke perangkat target!
    var response = await admin.messaging().send(message);
    return res.status(200.0).json({ success: true, messageId: response });
  } catch (error) {
    return res.status(500.0).json({ error: error.message });
  }
}