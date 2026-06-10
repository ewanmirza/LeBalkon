'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabase-browser';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ items: 0, cats: 0, gallery: 0, anns: 0, newRes: 0 });

  useEffect(() => {
    const sb = supabaseBrowser();
    Promise.all([
      sb.from('menu_items').select('id', { count: 'exact', head: true }),
      sb.from('menu_categories').select('id', { count: 'exact', head: true }),
      sb.from('gallery_items').select('id', { count: 'exact', head: true }),
      sb.from('announcements').select('id', { count: 'exact', head: true }),
      sb.from('reservations').select('id', { count: 'exact', head: true }).eq('status', 'yeni'),
    ]).then(([a, b, c, d, e]) => setStats({
      items: a.count ?? 0, cats: b.count ?? 0, gallery: c.count ?? 0, anns: d.count ?? 0, newRes: e.count ?? 0,
    }));
  }, []);

  const cards = [
    { label: 'Menü Ürünü', value: stats.items, href: '/admin/menu' },
    { label: 'Kategori', value: stats.cats, href: '/admin/menu' },
    { label: 'Galeri Öğesi', value: stats.gallery, href: '/admin/galeri' },
    { label: 'Duyuru', value: stats.anns, href: '/admin/duyurular' },
    { label: 'Yeni Rezervasyon', value: stats.newRes, href: '/admin/rezervasyonlar', hot: stats.newRes > 0 },
  ];

  return (
    <div>
      <h1 className="h-display text-3xl mb-8">Panel</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}
            className={`rounded-2xl border p-6 transition-colors ${c.hot ? 'border-gold bg-gold/10' : 'border-gold/15 bg-dark-2 hover:border-gold/40'}`}>
            <p className="font-heading text-4xl text-gold">{c.value}</p>
            <p className="font-sans text-sm text-cream/70 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>
      <div className="mt-10 bg-dark-2 border border-gold/15 rounded-2xl p-6 font-sans text-sm text-cream/70 leading-relaxed">
        <p className="text-gold font-medium mb-2">Hızlı başlangıç</p>
        <p>• <strong className="text-cream">Site İçeriği</strong>: anasayfa metinleri, hero görseli/videosu, hakkımızda yazısı.</p>
        <p>• <strong className="text-cream">Menü Yönetimi</strong>: kategori ve ürün ekle/sil, fiyat güncelle, her ürüne birden fazla fotoğraf.</p>
        <p>• <strong className="text-cream">Duyurular</strong>: canlı müzik geceleri için tarih saatli etkinlik duyurusu yayınla, istersen sabitle.</p>
      </div>
    </div>
  );
}
