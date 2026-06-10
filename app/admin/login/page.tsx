'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError('');
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().auth.signInWithPassword({
      email: String(f.get('email')), password: String(f.get('password')),
    });
    if (error) { setError('E-posta veya şifre hatalı.'); setLoading(false); }
    else router.replace('/admin');
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-sm bg-dark-2 border border-gold/15 rounded-2xl p-8 space-y-5">
        <div className="text-center mb-2">
          <p className="font-heading text-2xl text-gold tracking-[0.1em] uppercase">Le Balkon</p>
          <p className="font-sans text-xs text-muted2 mt-1">Yönetim Paneli Girişi</p>
        </div>
        <input name="email" type="email" required placeholder="E-posta" className="input-dark" />
        <input name="password" type="password" required placeholder="Şifre" className="input-dark" />
        {error && <p className="text-red-400 font-sans text-sm text-center">{error}</p>}
        <button disabled={loading} className="btn-gold-solid w-full disabled:opacity-50">
          {loading ? 'Giriş yapılıyor…' : 'Giriş Yap'}
        </button>
      </form>
    </div>
  );
}
