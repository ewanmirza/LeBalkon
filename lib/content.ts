import { supabaseServer } from './supabase-server';
import type { Metadata } from 'next';

export async function getContent(): Promise<Record<string, string>> {
  const sb = supabaseServer();
  const { data } = await sb.from('site_content').select('key,value');
  return Object.fromEntries((data ?? []).map((r) => [r.key, r.value]));
}

export async function getSeo(path: string): Promise<Metadata> {
  const sb = supabaseServer();
  const { data } = await sb.from('seo_pages').select('*').eq('path', path).single();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com';
  if (!data) return {};
  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords,
    alternates: { canonical: `${base}${path === '/' ? '' : path}` },
    openGraph: {
      title: data.title,
      description: data.description,
      url: `${base}${path === '/' ? '' : path}`,
      siteName: 'Le Balkon Lounge & Cafe',
      images: data.og_image ? [{ url: data.og_image }] : [],
      locale: 'tr_TR',
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title: data.title, description: data.description },
  };
}
