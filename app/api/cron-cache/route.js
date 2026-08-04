import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Inisialisasi koneksi Redis
const redis = Redis.fromEnv();

export async function GET(request) {
  // 1. Keamanan: Cek Authorization Header dari Cron-job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: 'Akses Ditolak!' }, { status: 401 });
  }

  try {
    // 2. Fetch data dari API GitHub (Ganti 'username-kamu' pake username GitHub lu)
    const githubRes = await fetch('https://api.github.com/users/username-kamu/repos?sort=updated', {
      headers: {
        'User-Agent': 'Shadow-System-App',
      },
    });

    if (!githubRes.ok) throw new Error('Gagal fetch dari GitHub');

    const reposData = await githubRes.json();

    // 3. Simpan data ke Redis dengan key 'github_repos_cache'
    // Data ini kita simpan tanpa batas waktu (atau bisa set 'ex' expired kalau mau)
    await redis.set('github_repos_cache', JSON.stringify(reposData));

    return NextResponse.json({
      success: true,
      message: 'Auto-Cache GitHub Berhasil Diperbarui! 🚀',
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}