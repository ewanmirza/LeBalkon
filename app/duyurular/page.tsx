import Link from 'next/link';
import { getSeo } from '@/lib/content';
import { supabaseServer } from '@/lib/supabase-server';
import SectionHeader from '@/components/site/SectionHeader';
import { CalendarDays, Pin } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/duyurular'); }

export default async function AnnouncementsPage() {
  const sb = supabaseServer();
  const { data } = await sb.from('announcements').select('*').eq('is_published', true)
    .order('is_pinned', { ascending: false }).order('created_at', { ascending: false });
  const items = data ?? [];
  return (
    <div className="container-site pt-32">
      <SectionHeader eyebrow="Neler Oluyor" title="Duyurular & Etkinlikler" sub="Canlı müzik geceleri, kampanyalar ve tüm gelişmeler." />
      {!items.length && <p className="text-center text-muted2 font-sans">Şu anda yayında duyuru bulunmuyor.</p>}
      <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
        {items.map((a) => (
          <Link key={a.id} href={`/duyurular/${a.slug}`}
            className="bg-dark-2 border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/40 transition-colors block">
            {a.image_url && <div className="aspect-[16/9] overflow-hidden"><img src={a.image_url} alt={a.title} className="w-full h-full object-cover" loading="lazy" /></div>}
            <div className="p-6">
              <div className="flex items-center gap-3 font-sans text-xs text-gold mb-3">
                {a.is_pinned && <span className="inline-flex items-center gap-1"><Pin size={12} /> Sabitlenmiş</span>}
                {a.event_date && (
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={13} />
                    {new Date(a.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
              <h3 className="text-2xl text-cream">{a.title}</h3>
              <p className="mt-3 text-muted2 font-sans text-sm leading-relaxed line-clamp-3">{a.summary}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
