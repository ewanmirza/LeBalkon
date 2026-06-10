'use client';
import { useEffect, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MediaUpload from '@/components/admin/MediaUpload';
import type { SiteContent } from '@/lib/types';

const sectionNames: Record<string, string> = {
  genel: 'Genel', anasayfa: 'Anasayfa', hakkimizda: 'Hakkımızda', iletisim: 'İletişim', sosyal: 'Sosyal Medya',
};

export default function ContentAdmin() {
  const [rows, setRows] = useState<SiteContent[]>([]);
  const [saving, setSaving] = useState('');
  const sb = supabaseBrowser();

  useEffect(() => {
    sb.from('site_content').select('*').order('section').then(({ data }) => setRows((data ?? []) as SiteContent[]));
  }, []);

  async function save(key: string, value: string) {
    setSaving(key);
    await sb.from('site_content').update({ value, updated_at: new Date().toISOString() }).eq('key', key);
    setRows((r) => r.map((x) => (x.key === key ? { ...x, value } : x)));
    setSaving('');
  }

  const sections = Array.from(new Set(rows.map((r) => r.section)));

  return (
    <div>
      <h1 className="h-display text-3xl mb-2">Site İçeriği</h1>
      <p className="font-sans text-sm text-muted2 mb-8">Sitedeki tüm metinler, fotoğraflar ve videolar. Değişiklikler 1 dakika içinde yayına yansır.</p>
      {sections.map((sec) => (
        <div key={sec} className="mb-10">
          <h2 className="eyebrow mb-4">{sectionNames[sec] ?? sec}</h2>
          <div className="space-y-5">
            {rows.filter((r) => r.section === sec).map((r) => (
              <ContentField key={r.key} row={r} onSave={save} saving={saving === r.key} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContentField({ row, onSave, saving }: { row: SiteContent; onSave: (k: string, v: string) => void; saving: boolean }) {
  const [val, setVal] = useState(row.value);
  const dirty = val !== row.value;

  return (
    <div className="bg-dark-2 border border-gold/15 rounded-xl p-5">
      <label className="font-sans text-sm text-cream font-medium">{row.label}</label>
      <div className="mt-3 flex flex-col gap-3">
        {row.type === 'longtext' ? (
          <textarea value={val} onChange={(e) => setVal(e.target.value)} rows={4} className="input-dark resize-y" />
        ) : (
          <input value={val} onChange={(e) => setVal(e.target.value)} className="input-dark" />
        )}
        {(row.type === 'image' || row.type === 'video') && (
          <div className="flex items-center gap-4 flex-wrap">
            <MediaUpload
              accept={row.type === 'video' ? 'video/*' : 'image/*'}
              folder="icerik"
              label={row.type === 'video' ? 'Video Yükle' : 'Fotoğraf Yükle'}
              onUploaded={(url) => { setVal(url); onSave(row.key, url); }}
            />
            {val && (row.type === 'image'
              ? <img src={val} alt="" className="h-16 rounded-lg border border-gold/20" />
              : <video src={val} className="h-16 rounded-lg border border-gold/20" />)}
          </div>
        )}
        {dirty && (
          <button onClick={() => onSave(row.key, val)} disabled={saving} className="btn-gold-solid !py-2 !px-5 self-start text-sm disabled:opacity-50">
            {saving ? 'Kaydediliyor…' : 'Kaydet'}
          </button>
        )}
      </div>
    </div>
  );
}
