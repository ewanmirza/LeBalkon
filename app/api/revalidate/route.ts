import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

function refresh() {
  revalidatePath('/');
  revalidatePath('/menu');
  return NextResponse.json({ ok: true, revalidated: true, at: Date.now() });
}

// Admin kaydedince otomatik çağrılır.
export async function POST() {
  return refresh();
}

// Tarayıcıda https://www.lebalkonaksaray.com/api/revalidate açınca da çalışır
// (doğrudan SQL ile veri değiştirdiğinde elle tazelemek için).
export async function GET() {
  return refresh();
}
