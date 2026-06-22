import { supabaseServer } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { CalendarDays, ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import { ldScript } from '@/lib/jsonld';

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = supabaseServer();
  const { data } = await sb.from('announcements').select('title,summary,image_url').eq('slug', params.slug).eq('is_published', true).single();
  if (!data) return {};
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com';
  return {
    title: `${data.title} | Le Balkon Aksaray`,
    description: data.summary,
    alternates: { canonical: `${base}/duyurular/${params.slug}` },
    openGraph: { title: data.title, description: data.summary, images: data.image_url ? [{ url: data.image_url }] : [], type: 'article' },
  };
}

export default async function AnnouncementDetail({ params }: { params: { slug: string } }) {
  const sb = supabaseServer();
  const { data: a } = await sb.from('announcements').select('*').eq('slug', params.slug).eq('is_published', true).single();
  if (!a) notFound();

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com';
  const jsonLd = a.event_date ? {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: a.title,
    description: a.summary,
    startDate: a.event_date,
    image: a.image_url || undefined,
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: 'Le Balkon Lounge & Cafe', address: { '@type': 'PostalAddress', addressLocality: 'Aksaray', addressCountry: 'TR' } },
    organizer: { '@type': 'Organization', name: 'Le Balkon Lounge & Cafe', url: base },
  } : null;

  return (
    <article className="container-site pt-32 max-w-3xl">
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }} />}
      <Link href="/duyurular" className="inline-flex items-center gap-2 text-gold font-sans text-sm hover:text-cream transition-colors mb-8">
        <ArrowLeft size={15} /> Tüm Duyurular
      </Link>
      {a.event_date && (
        <p className="flex items-center gap-2 text-gold font-sans text-sm mb-4">
          <CalendarDays size={15} />
          {new Date(a.event_date).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
      <h1 className="h-display text-4xl md:text-5xl">{a.title}</h1>
      {a.image_url && <div className="rounded-2xl overflow-hidden mt-8 shadow-image"><img src={a.image_url} alt={a.title} className="w-full" /></div>}
      <div className="mt-8 text-cream/80 font-sans text-[15px] leading-loose whitespace-pre-line">{a.content || a.summary}</div>
      <div className="mt-12 border border-gold/20 rounded-2xl p-7 text-center">
        <p className="text-xl text-cream mb-4">Yerinizi şimdiden ayırtın</p>
        <Link href="/rezervasyon" className="btn-gold-solid">Rezervasyon Yap</Link>
      </div>
    </article>
  );
}
