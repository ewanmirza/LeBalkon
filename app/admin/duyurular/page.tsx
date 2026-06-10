'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MediaUpload from '@/components/admin/MediaUpload';
import type { Announcement } from '@/lib/types';
import { Plus, Trash2, Pin, Eye, EyeOff, Music } from 'lucide-react';

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function AnnouncementsAdmin() {
  const [list, setList] = useState<Announcement[]>([]);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const sb = supabaseBrowser();

  const load = useCallback(async () => {
    const { data } = await sb.from('announcements').select('*').order('created_at', { ascending: false });
    setList((data ?? []) as Announcement[]);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function create() {
    const { data } = await sb.from('announcements')
      .insert({ title: 'Yeni Duyuru', slug: 'yeni-duyuru-' + Date.now().toString(36), is_published: false })
      .select().single();
    if (data) { setEditing(data as Announcement); load(); }
  }
  async function del(a: Announcement) {
    if (!confirm(`"${a.title}" silinsin mi?`)) return;
    await sb.from('announcements').delete().eq('id', a.id);
    if (editing?.id === a.id) setEditing(null);
    load();
  }
  async function quickToggle(a: Announcement, field: 'is_published' | 'is_pinned') {
    await sb.from('announcements').update({ [field]: !a[field], updated_at: new Date().toISOString() }).eq('id', a.id);
    load();
  }
  async function save(a: Announcement) {
    const slug = slugify(a.title) || a.slug;
    const { error } = await sb.from('announcements').update({
      title: a.title, slug, summary: a.summary, content: a.content,
      image_url: a.image_url, event_date: a.event_date || null,
      is_published: a.is_published, is_pinned: a.is_pinned,
      updated_at: new Date().toISOString(),
    }).eq('id', a.id);
    if (error) alert('Kaydedilemedi: ' + error.message);
    else { setEditing(null); load(); }
  }

  if (editing) return <Editor a={editing} onChange={setEditing} onSave={save} onCancel={() => setEditing(null)} />;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h1 className="h-display text-3xl">Duyurular & Etkinlikler</h1>
        <button onClick={create} className="inline-flex items-center gap-1.5 font-sans text-sm bg-gold text-dark rounded-lg px-4 py-2 hover:bg-gold-light transition-colors">
          <Plus size={15} /> Yeni Duyuru
        </button>
      </div>
      <p className="font-sans text-sm text-muted2 mb-8 flex items-center gap-1.5">
        <Music size={14} className="text-gold" /> Canlı müzik gecesi için tarih-saat girin; sabitlerseniz anasayfada bant olarak görünür.
      </p>
      <div className="space-y-3">
        {list.map((a) => (
          <div key={a.id} className="bg-dark-2 border border-gold/15 rounded-xl p-4 flex items-center gap-3 font-sans text-sm">
            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setEditing(a)}>
              <p className="text-cream truncate">{a.title}</p>
              <p className="text-muted2 text-xs mt-0.5">
                {a.event_date ? new Date(a.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' }) : 'Genel duyuru'}
                {' · '}{a.is_published ? 'Yayında' : 'Taslak'}
              </p>
            </div>
            <button onClick={() => quickToggle(a, 'is_pinned')} title="Sabitle" className={a.is_pinned ? 'text-gold' : 'text-muted2 hover:text-gold'}><Pin size={16} /></button>
            <button onClick={() => quickToggle(a, 'is_published')} title="Yayınla/Gizle" className={a.is_published ? 'text-gold' : 'text-muted2 hover:text-gold'}>
              {a.is_published ? <Eye size={16} /> : <EyeOff size={16} />}
            </button>
            <button onClick={() => setEditing(a)} className="text-gold underline text-xs px-1">düzenle</button>
            <button onClick={() => del(a)} className="text-red-400/70 hover:text-red-400"><Trash2 size={15} /></button>
          </div>
        ))}
        {!list.length && <p className="text-muted2 font-sans text-sm text-center py-10">Henüz duyuru yok.</p>}
      </div>
    </div>
  );
}

function Editor({ a, onChange, onSave, onCancel }: {
  a: Announcement; onChange: (a: Announcement) => void; onSave: (a: Announcement) => void; onCancel: () => void;
}) {
  const dt = a.event_date ? new Date(a.event_date).toISOString().slice(0, 16) : '';
  return (
    <div>
      <h1 className="h-display text-3xl mb-8">Duyuru Düzenle</h1>
      <div className="space-y-5 font-sans max-w-2xl">
        <div>
          <label className="text-sm text-cream font-medium">Başlık</label>
          <input value={a.title} onChange={(e) => onChange({ ...a, title: e.target.value })} className="input-dark mt-2" />
        </div>
        <div>
          <label className="text-sm text-cream font-medium">Kısa Özet <span className="text-muted2">(listede görünür)</span></label>
          <textarea value={a.summary} onChange={(e) => onChange({ ...a, summary: e.target.value })} rows={2} className="input-dark mt-2 resize-none" />
        </div>
        <div>
          <label className="text-sm text-cream font-medium">Detaylı İçerik</label>
          <textarea value={a.content} onChange={(e) => onChange({ ...a, content: e.target.value })} rows={7} className="input-dark mt-2 resize-y" />
        </div>
        <div>
          <label className="text-sm text-cream font-medium">Etkinlik Tarihi & Saati <span className="text-muted2">(canlı müzik vb. — genel duyuruysa boş bırakın)</span></label>
          <input type="datetime-local" value={dt}
            onChange={(e) => onChange({ ...a, event_date: e.target.value ? new Date(e.target.value).toISOString() : null })}
            className="input-dark mt-2" />
        </div>
        <div>
          <label className="text-sm text-cream font-medium block mb-2">Görsel</label>
          <div className="flex items-center gap-4">
            <MediaUpload folder="duyurular" label="Görsel Yükle" onUploaded={(url) => onChange({ ...a, image_url: url })} />
            {a.image_url && <img src={a.image_url} alt="" className="h-16 rounded-lg border border-gold/20" />}
          </div>
        </div>
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={a.is_published} onChange={(e) => onChange({ ...a, is_published: e.target.checked })} className="accent-[#BFA176]" />
            Yayında
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={a.is_pinned} onChange={(e) => onChange({ ...a, is_pinned: e.target.checked })} className="accent-[#BFA176]" />
            Anasayfada sabitle
          </label>
        </div>
        <div className="flex gap-3 pt-2">
          <button onClick={() => onSave(a)} className="btn-gold-solid !py-2.5">Kaydet</button>
          <button onClick={onCancel} className="btn-gold !py-2.5">Vazgeç</button>
        </div>
      </div>
    </div>
  );
}
