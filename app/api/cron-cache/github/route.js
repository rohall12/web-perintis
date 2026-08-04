import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

const redis = Redis.fromEnv();

export async function GET() {
  try {
    // 1. Ambil data langsung dari Redis (Super Cepat! ~10-20ms)
    let cachedData = await redis.get('github_repos_cache');

    // Jika cache ternyata masih kosong (misal baru pertama kali run)
    if (!cachedData) {
      return NextResponse.json({ message: 'Data cache belum tersedia.' }, { status: 404 });
    }

    // Jika data berupa string JSON, parse ke Object/Array
    const repos = typeof cachedData === 'string' ? JSON.parse(cachedData) : cachedData;

    return NextResponse.json({
      source: 'Upstash Redis Cache ⚡',
      data: repos,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}