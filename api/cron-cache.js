import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  // 1. Cek Authorization Header dari Cron-job.org
  const authHeader = req.headers['authorization'];
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Akses Ditolak!' });
  }

  try {
    // 2. Fetch data dari API GitHub (Ganti 'username-kamu' pake username GitHub lu)
    const githubRes = await fetch('https://api.github.com/users/rohall12/repos?sort=updated', {
      headers: {
        'User-Agent': 'Shadow-System-App',
      },
    });

    if (!githubRes.ok) {
      throw new Error(`Gagal fetch dari GitHub: Status ${githubRes.status}`);
    }

    const reposData = await githubRes.json();

    // 3. Simpan data JSON ke Upstash Redis
    await redis.set('github_repos_cache', JSON.stringify(reposData));

    return res.status(200).json({
      success: true,
      message: 'Auto-Cache GitHub Berhasil Diperbarui! 🚀',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}