'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MediaUpload from '@/components/admin/MediaUpload';
import type { SeoPage } from '@/lib/types';

const pageNames: Record<string, string> = {
  '/': 'Anasayfa', '/menu': 'Menü', '/hakkimizda': 'Hakkımızda', '/galeri': 'Galeri',
  '/duyurular': 'Duyurular', '/iletisim': 'İletişim', '/rezervasyon': 'Rezervasyon',
};

export default function SeoAdmin() {
  const [pages, setPages] = useState<SeoPage[]>([]);
  const sb = supabaseBrowser();

  useEffect(() => {
    sb.from('seo_pages').select('*').then(({ data }) => setPages((data ?? []) as SeoPage[]));
  }, []);

  async function save(p: SeoPage) {
    const { error } = await sb.from('seo_pages').update({
      title: p.title, description: p.description, keywords: p.keywords,
      og_image: p.og_image, updated_at: new Date().toISOString(),
    }).eq('path', p.path);
    if (error) alert('Kaydedilemedi: ' + error.message);
  }
  function update(path: string, patch: Partial<SeoPage>) {
    setPages((ps) => ps.map((p) => (p.path === path ? { ...p, ...patch } : p)));
  }

  return (
    <div>
      <h1 className="h-display text-3xl mb-2">SEO Yönetimi</h1>
      <p className="font-sans text-sm text-muted2 mb-8">Her sayfanın Google'da görünen başlığı, açıklaması ve paylaşım görseli. Duyuru detayları kendi başlığını otomatik kullanır; sitemap.xml otomatik üretilir.</p>
      <div className="space-y-6">
        {pages.map((p) => (
          <div key={p.path} className="bg-dark-2 border border-gold/15 rounded-2xl p-5 font-sans">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-cream font-medium">{pageNames[p.path] ?? p.path}</h2>
              <code className="text-muted2 text-xs">{p.path}</code>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted2">Başlık (50–60 karakter ideal) — şu an {p.title.length}</label>
                <input value={p.title} onChange={(e) => update(p.path, { title: e.target.value })} className="input-dark mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted2">Açıklama (140–160 karakter ideal) — şu an {p.description.length}</label>
                <textarea value={p.description} onChange={(e) => update(p.path, { description: e.target.value })} rows={2} className="input-dark mt-1 resize-none" />
              </div>
              <div>
                <label className="text-xs text-muted2">Anahtar kelimeler (virgülle)</label>
                <input value={p.keywords} onChange={(e) => update(p.path, { keywords: e.target.value })} className="input-dark mt-1" />
              </div>
              <div className="flex items-center gap-4">
                <MediaUpload folder="seo" label="OG Görseli (1200×630)" onUploaded={(url) => { update(p.path, { og_image: url }); save({ ...p, og_image: url }); }} />
                {p.og_image && <img src={p.og_image} alt="" className="h-12 rounded border border-gold/20" />}
              </div>
              <button onClick={() => save(p)} className="btn-gold-solid !py-2 !px-5 text-sm">Kaydet</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
