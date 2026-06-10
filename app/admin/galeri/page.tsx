'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MediaUpload from '@/components/admin/MediaUpload';
import type { GalleryItem } from '@/lib/types';
import { Trash2, ChevronUp, ChevronDown, Eye, EyeOff } from 'lucide-react';

export default function GalleryAdmin() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const sb = supabaseBrowser();

  const load = useCallback(async () => {
    const { data } = await sb.from('gallery_items').select('*').order('sort_order');
    setItems((data ?? []) as GalleryItem[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function add(type: 'image' | 'video', url: string) {
    await sb.from('gallery_items').insert({ type, url, sort_order: items.length + 1 });
    load();
  }
  async function del(it: GalleryItem) {
    if (!confirm('Bu öğe galeriden silinsin mi?')) return;
    await sb.from('gallery_items').delete().eq('id', it.id);
    load();
  }
  async function move(it: GalleryItem, dir: -1 | 1) {
    const idx = items.findIndex((x) => x.id === it.id);
    const other = items[idx + dir];
    if (!other) return;
    await Promise.all([
      sb.from('gallery_items').update({ sort_order: other.sort_order }).eq('id', it.id),
      sb.from('gallery_items').update({ sort_order: it.sort_order }).eq('id', other.id),
    ]);
    load();
  }
  async function toggle(it: GalleryItem) {
    await sb.from('gallery_items').update({ is_active: !it.is_active }).eq('id', it.id);
    load();
  }
  async function setTitle(it: GalleryItem) {
    const title = prompt('Başlık (opsiyonel):', it.title);
    if (title === null) return;
    await sb.from('gallery_items').update({ title }).eq('id', it.id);
    load();
  }

  return (
    <div>
      <h1 className="h-display text-3xl mb-2">Galeri</h1>
      <p className="font-sans text-sm text-muted2 mb-6">Instagram'daki fotoğraflarınızı telefonunuza kaydedip buradan yükleyebilirsiniz.</p>
      <div className="flex gap-3 mb-8">
        <MediaUpload folder="galeri" label="Fotoğraf Yükle" accept="image/*" onUploaded={(u) => add('image', u)} />
        <MediaUpload folder="galeri" label="Video Yükle" accept="video/*" onUploaded={(u) => add('video', u)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((it, idx) => (
          <div key={it.id} className={`bg-dark-2 border rounded-xl overflow-hidden ${it.is_active ? 'border-gold/15' : 'border-red-400/30 opacity-60'}`}>
            {it.type === 'video'
              ? <video src={it.url} className="w-full aspect-square object-cover" muted />
              : <img src={it.url} alt={it.title} className="w-full aspect-square object-cover" />}
            <div className="flex items-center gap-1 p-2 font-sans text-xs">
              <button onClick={() => setTitle(it)} className="flex-1 text-left text-muted2 hover:text-cream truncate px-1">{it.title || 'Başlık ekle…'}</button>
              <button onClick={() => move(it, -1)} disabled={idx === 0} className="text-muted2 hover:text-gold disabled:opacity-20 p-1"><ChevronUp size={15} /></button>
              <button onClick={() => move(it, 1)} disabled={idx === items.length - 1} className="text-muted2 hover:text-gold disabled:opacity-20 p-1"><ChevronDown size={15} /></button>
              <button onClick={() => toggle(it)} className="text-muted2 hover:text-gold p-1">{it.is_active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <button onClick={() => del(it)} className="text-red-400/70 hover:text-red-400 p-1"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
      {!items.length && <p className="text-muted2 font-sans text-sm text-center py-10">Galeri boş — yukarıdan fotoğraf veya video yükleyin.</p>}
    </div>
  );
}
