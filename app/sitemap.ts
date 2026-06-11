import { MetadataRoute } from 'next';
import { supabaseServer } from '@/lib/supabase-server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com').replace(/\/+$/, '');
  const sb = supabaseServer();
  const { data: anns } = await sb.from('announcements').select('slug,updated_at').eq('is_published', true);
  const staticPages = ['', '/menu', '/hakkimizda', '/galeri', '/duyurular', '/iletisim', '/rezervasyon'].map((p) => ({
    url: `${base}${p}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: p === '' ? 1 : 0.8,
  }));
  const annPages = (anns ?? []).map((a) => ({
    url: `${base}/duyurular/${a.slug}`,
    lastModified: new Date(a.updated_at),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }));
  return [...staticPages, ...annPages];
}
