import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

// Admin bir şey kaydedince çağrılır; ana sayfa ve menü cache'ini anında tazeler.
export async function POST() {
  revalidatePath('/');
  revalidatePath('/menu');
  return NextResponse.json({ ok: true, revalidated: true });
}
