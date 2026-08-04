import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  try {
    // 1. Ambil data dari Upstash Redis dalam hitungan milidetik
    let cachedData = await redis.get('github_repos_cache');

    // 2. Jika cache belum ada/kosong
    if (!cachedData) {
      return res.status(404).json({
        success: false,
        message: 'Data cache belum tersedia.',
      });
    }

    // 3. Parse data jika tersimpan dalam bentuk string JSON
    const repos = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;

    // 4. Kirim respon balik ke Frontend
    return res.status(200).json({
      success: true,
      source: 'Upstash Redis Cache ⚡',
      data: repos,
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}