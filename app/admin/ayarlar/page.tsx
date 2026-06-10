'use client';
import { useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function SettingsAdmin() {
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  async function changePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setMsg('');
    const f = new FormData(e.currentTarget);
    const pw = String(f.get('password'));
    if (pw.length < 8) { setMsg('Şifre en az 8 karakter olmalı.'); setLoading(false); return; }
    const { error } = await supabaseBrowser().auth.updateUser({ password: pw });
    setMsg(error ? 'Hata: ' + error.message : 'Şifreniz güncellendi ✓');
    setLoading(false);
  }

  return (
    <div className="max-w-xl">
      <h1 className="h-display text-3xl mb-8">Ayarlar</h1>
      <div className="bg-dark-2 border border-gold/15 rounded-2xl p-6 font-sans mb-6">
        <h2 className="text-cream font-medium mb-4">Şifre Değiştir</h2>
        <form onSubmit={changePassword} className="space-y-4">
          <input name="password" type="password" required placeholder="Yeni şifre (en az 8 karakter)" className="input-dark" />
          <button disabled={loading} className="btn-gold-solid !py-2.5 text-sm disabled:opacity-50">Güncelle</button>
          {msg && <p className="text-sm text-gold">{msg}</p>}
        </form>
      </div>
      <div className="bg-dark-2 border border-gold/15 rounded-2xl p-6 font-sans text-sm text-cream/70 leading-relaxed">
        <h2 className="text-cream font-medium mb-3">İletişim bilgileri nerede?</h2>
        <p>Telefon, adres, çalışma saatleri, Instagram ve harita linki <Link href="/admin/icerik" className="text-gold underline">Site İçeriği</Link> sayfasındaki "İletişim" ve "Sosyal Medya" bölümlerinden düzenlenir.</p>
      </div>
    </div>
  );
}
