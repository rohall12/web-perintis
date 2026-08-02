const admin = require('firebase-admin');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inisialisasi Firebase Admin dengan kredensial lu yang udah fix
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: "my-portofolio-c2eeb",
        clientEmail: "firebase-adminsdk-fbsvc@my-portofolio-c2eeb.iam.gserviceaccount.com",
        privateKey: `-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQD4jlSQc+tR9NO5\nIX0QHElc2W2eqIv4Tqs0DjbeuN0/YNOak+NtMNlFocpK6To7QnRbYUkHXlN5r5he\nlYnawMYUPxJI11kj8P2R2Q6+AJ6UqN1FP8lgpE7kyEh2MEbuGXM4X8IrY6OeHo22\n4qDXSm4cJjuvevMwCTbiQ6adXfbfsWfmHDEoUdACRHEkIMjCUEddIQqU7b2gB7tJ\njV9mtbPmJVP33SVeHSp6RwsP8XdzwaS4M3HlzX0DEDTPwq2VpMhID7AzoTh69afM\nHfSkN3TWaWZkvGL5YVKGOoFcgnYcM9gkKaMwX7HoGSQRiNDn1/tLAYs2orOu9L71\nL6jTAhOxAgMBAAECggEAD+7mzJpDtN2gB2N2Tga0LLmq6WNmUpjvaF87ZPhehXIu\nal+t0elyWiB6lGYCQ7t5NETmnqxtJzUqjDCjlURrhi97W3RDjHZluNhcVbF6OO8g\nvRBPV0y9GnUc0Qe7+kYjINNhofCpk8ijXryFITvuFkucop178qG6lRNPXlHgUhs/\nxX1PB7FWhbouYtcv4qXhunqgoEM4vYOI3fKiAvxxm+WAwFWE98yqg6DSKlY1+Bic\nOoMOnSZ0F/L2yS1WqKhPTwVG2sIoNbL2flkYOK8YN4o/mPTiQp6XrFlC2EGiq6aB\nWgmIxwFo4bvJrO2XS4kAJEKseUjIzYBmTmF75n8wyQKBgQD+NBGtbbTBv8Vhgfjg\nVMQk9sxENbC6EqS0SfcBiLyfxkx0uQY+hSmP+1sXnqoucrd2eFiU5YxvZ+QsCXa6\ndXeQDuhenTPV9LUd8sIRiGL9ihygGAG0zVVhE4nrJt5oNoBz1JcDegDr8AYj4FgW\LIcZTjQLbC7OxwBH6OoS2ATAuQKBgQD6UAsbhUWjLvoNuGC7daSrLeAD1yG2322X\nfnyZzkERmvQ7H8aqryQqaKjbkZzSHUVr01NdQj5nHpmXMkh0tNrb5nVJUDpt1Ecf\ngRpYn0XKTr8/9hgyRgt7yLhj2EXUKH2+wKlq6p59JEfWfbmb0mKU30xO3o2x/ecG\nbbqeiRY+uQKBgQCHflF901/pdcJLeu+hAw2ZdkLiiIuuYomP32zdUHjZ4OSXwpdl\nc6z3pc6kBFpJb7QCXZs5ojD8oK+qGVFDiaE1E/0fkUMz4782O1Ld7Yh2A8vGOYWP\nTXMYz0VQJeOeQI6vLr1fiQQ8vi9HqCjLiOhpwJlVDVDVvpSTv74kVSgTYQKBgGJK\n4kG5UMImpUyT9XBHXxVVG12GsheEnx1ZLwaappSKO5OoA7RsuA/rLzuhb2pW0jbo\nMhkx9R07N+bWePtTNYoacj4Kwhb0v8UQRk88pAQwbgto0NGVDdda14VlnO4VxGMO\ndrikTv4nLAp/Lk6RC+MX2Hg0DoIxiPHOTvUIMfMJAoGBAJTC1uv6FxEsNiiCR28W\nPwnY4UQLlz/JbCErTJps/qylRjLmq4Pw6bCERJM3qo4IQ3yB2quGDOV1oPYDZj05\nQRIMzkCf5BaLoumJVYnnTlYezGzOvDiAp0u0h2BNTjT1Co0DsC97WD7DA+4+zZtv\nNVZlpo9KgHXp0mMHR/Zy119Z\n-----END PRIVATE KEY-----`
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

const db = admin.firestore();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'Pesan kosong' });

    // SISTEM ANTI-SPAM (Backend Rate Limiting)
    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown_ip';
    const safeIpId = clientIp.replace(/\./g, '_').replace(/:/g, '_'); 
    
    const rateLimitRef = db.collection('rate_limits').doc(safeIpId);
    const rateLimitDoc = await rateLimitRef.get();
    
    const NOW = Date.now();
    const ONE_HOUR = 60 * 60 * 1000;
    const MAX_REQUESTS_PER_HOUR = 15; // Maksimal 15 pesan per jam

    if (rateLimitDoc.exists) {
      const data = rateLimitDoc.data();
      const timePassed = NOW - data.lastRequest;

      if (timePassed < ONE_HOUR) {
        if (data.requestCount >= MAX_REQUESTS_PER_HOUR) {
          return res.status(429).json({ error: 'Too many requests. Coba lagi nanti.' });
        }
        await rateLimitRef.update({ 
          requestCount: admin.firestore.FieldValue.increment(1),
          lastRequest: NOW 
        });
      } else {
        await rateLimitRef.set({ requestCount: 1, lastRequest: NOW });
      }
    } else {
      await rateLimitRef.set({ requestCount: 1, lastRequest: NOW });
    }

    // PANGGIL GEMINI AI
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const promptContext = `Kamu adalah asisten AI di website portofolio milik Roni Halla. Tugasmu menjawab pertanyaan pengunjung dengan gaya bahasa santai, ramah, dan profesional. Jawab pertanyaan ini dengan singkat dan padat (maksimal 3-4 kalimat): "${message}"`;

    const result = await model.generateContent(promptContext);
    const aiResponse = await result.response.text();

    return res.status(200).json({ success: true, reply: aiResponse });

  } catch (error) {
    console.error('Chat API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
