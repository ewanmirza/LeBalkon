'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import type { Reservation } from '@/lib/types';
import { Phone, Trash2 } from 'lucide-react';

const statusColors: Record<string, string> = {
  yeni: 'bg-gold/20 text-gold border-gold/40',
  onaylandi: 'bg-green-500/15 text-green-400 border-green-500/40',
  iptal: 'bg-red-500/15 text-red-400 border-red-500/40',
};

export default function ReservationsAdmin() {
  const [list, setList] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState('hepsi');
  const sb = supabaseBrowser();

  const load = useCallback(async () => {
    const { data } = await sb.from('reservations').select('*').order('date', { ascending: true }).order('time');
    setList((data ?? []) as Reservation[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function setStatus(id: string, status: string) {
    await sb.from('reservations').update({ status }).eq('id', id);
    load();
  }
  async function del(r: Reservation) {
    if (!confirm('Rezervasyon kaydı silinsin mi?')) return;
    await sb.from('reservations').delete().eq('id', r.id);
    load();
  }

  const shown = list.filter((r) => filter === 'hepsi' || r.status === filter);

  return (
    <div>
      <h1 className="h-display text-3xl mb-6">Rezervasyonlar</h1>
      <div className="flex gap-2 mb-6 font-sans text-sm">
        {['hepsi', 'yeni', 'onaylandi', 'iptal'].map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={`rounded-pill px-4 py-1.5 border capitalize transition-colors ${filter === f ? 'bg-gold text-dark border-gold' : 'border-gold/30 text-gold'}`}>
            {f === 'onaylandi' ? 'Onaylandı' : f === 'hepsi' ? 'Hepsi' : f === 'iptal' ? 'İptal' : 'Yeni'}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {shown.map((r) => (
          <div key={r.id} className="bg-dark-2 border border-gold/15 rounded-xl p-4 font-sans text-sm">
            <div className="flex items-center gap-3 flex-wrap">
              <span className={`rounded-pill border px-3 py-0.5 text-xs ${statusColors[r.status] ?? statusColors.yeni}`}>
                {r.status === 'onaylandi' ? 'Onaylandı' : r.status === 'iptal' ? 'İptal' : 'Yeni'}
              </span>
              <p className="text-cream font-medium">{r.name}</p>
              <a href={`tel:${r.phone}`} className="inline-flex items-center gap-1 text-gold hover:underline"><Phone size={13} /> {r.phone}</a>
              <span className="text-cream/80">{new Date(r.date + 'T00:00').toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })} · {r.time} · {r.guests} kişi</span>
              <span className="flex-1" />
              {r.status !== 'onaylandi' && <button onClick={() => setStatus(r.id, 'onaylandi')} className="text-green-400 text-xs underline">Onayla</button>}
              {r.status !== 'iptal' && <button onClick={() => setStatus(r.id, 'iptal')} className="text-red-400 text-xs underline">İptal Et</button>}
              <button onClick={() => del(r)} className="text-red-400/60 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
            {r.note && <p className="text-muted2 mt-2 text-xs">Not: {r.note}</p>}
          </div>
        ))}
        {!shown.length && <p className="text-muted2 font-sans text-sm text-center py-10">Bu filtrede rezervasyon yok.</p>}
      </div>
    </div>
  );
}
