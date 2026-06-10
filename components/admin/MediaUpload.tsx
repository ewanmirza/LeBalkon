'use client';
import { useState, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { Upload } from 'lucide-react';

export default function MediaUpload({ onUploaded, accept = 'image/*', folder = 'genel', label = 'Dosya Yükle' }:
  { onUploaded: (url: string) => void; accept?: string; folder?: string; label?: string }) {
  const [busy, setBusy] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const sb = supabaseBrowser();
    const ext = file.name.split('.').pop();
    const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from('media').upload(path, file, { cacheControl: '31536000' });
    if (!error) {
      const { data } = sb.storage.from('media').getPublicUrl(path);
      onUploaded(data.publicUrl);
    } else {
      alert('Yükleme başarısız: ' + error.message);
    }
    setBusy(false);
    if (ref.current) ref.current.value = '';
  }

  return (
    <label className="inline-flex items-center gap-2 font-sans text-sm text-gold border border-gold/40 rounded-lg px-4 py-2 cursor-pointer hover:bg-gold hover:text-dark transition-colors">
      <Upload size={15} /> {busy ? 'Yükleniyor…' : label}
      <input ref={ref} type="file" accept={accept} onChange={handle} className="hidden" disabled={busy} />
    </label>
  );
}
