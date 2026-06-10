'use client';
import { useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function ReservationForm() {
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const today = new Date().toISOString().split('T')[0];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('sending');
    const f = new FormData(e.currentTarget);
    const { error } = await supabaseBrowser().from('reservations').insert({
      name: f.get('name'), phone: f.get('phone'), date: f.get('date'),
      time: f.get('time'), guests: Number(f.get('guests')), note: f.get('note') ?? '',
    });
    setState(error ? 'error' : 'done');
  }

  if (state === 'done') {
    return (
      <div className="border border-gold/30 rounded-2xl p-10 text-center">
        <p className="h-display text-3xl text-gold">Talebiniz alındı ✓</p>
        <p className="mt-3 text-cream/70 font-sans text-sm">Rezervasyonunuzu onaylamak için en kısa sürede sizi arayacağız.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 font-sans">
      <div className="grid gap-5 sm:grid-cols-2">
        <input name="name" required placeholder="Ad Soyad" className="input-dark" />
        <input name="phone" required type="tel" placeholder="Telefon (05XX...)" className="input-dark" />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <input name="date" required type="date" min={today} className="input-dark" />
        <input name="time" required type="time" className="input-dark" />
        <select name="guests" className="input-dark" defaultValue="2">
          {[1,2,3,4,5,6,7,8,10,12,15,20].map((n) => <option key={n} value={n}>{n} Kişi</option>)}
        </select>
      </div>
      <textarea name="note" rows={3} placeholder="Eklemek istedikleriniz (doğum günü, pencere kenarı vb.)" className="input-dark resize-none" />
      <button disabled={state === 'sending'} className="btn-gold-solid w-full disabled:opacity-50">
        {state === 'sending' ? 'Gönderiliyor…' : 'Rezervasyon Talebi Gönder'}
      </button>
      {state === 'error' && <p className="text-red-400 text-sm text-center">Bir sorun oluştu. Lütfen tekrar deneyin veya bizi arayın.</p>}
    </form>
  );
}
