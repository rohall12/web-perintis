import admin from 'firebase-admin';

if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined
            })
        });
    } catch (error) {
        console.error('Firebase admin initialization error', error);
    }
}

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { title, body } = req.body;
        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required' });
        }

        const db = admin.firestore();
        const tokensSnapshot = await db.collection('fcm_tokens').get();

        if (tokensSnapshot.empty) {
            return res.status(404).json({ error: 'No device tokens found for broadcast.' });
        }

        const tokens = [];
        tokensSnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.token) tokens.push(data.token);
        });

        if (tokens.length === 0) {
            return res.status(404).json({ error: 'Valid tokens array is empty.' });
        }

        const message = {
            notification: { title, body },
            tokens: tokens,
        };

        const response = await admin.messaging().sendEachForMulticast(message);
        
        return res.status(200).json({ 
            success: true, 
            successCount: response.successCount, 
            failureCount: response.failureCount 
        });

    } catch (error) {
        console.error('Broadcast error:', error);
        return res.status(500).json({ error: error.message });
    }
}