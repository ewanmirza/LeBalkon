import { getSeo } from '@/lib/content';
import { supabaseServer } from '@/lib/supabase-server';
import SectionHeader from '@/components/site/SectionHeader';
import MenuBrowser from '@/components/site/MenuBrowser';
import type { Metadata } from 'next';
import { ldScript } from '@/lib/jsonld';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/menu'); }

export default async function MenuPage() {
  const sb = supabaseServer();
  const [cats, items] = await Promise.all([
    sb.from('menu_categories').select('*').eq('is_active', true).order('sort_order'),
    sb.from('menu_items').select('*, menu_item_images(id,url,sort_order)').eq('is_active', true).order('sort_order'),
  ]);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com';
  const menuJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    name: 'Le Balkon Menü',
    url: `${base}/menu`,
    hasMenuSection: (cats.data ?? []).map((cat) => ({
      '@type': 'MenuSection',
      name: cat.name,
      hasMenuItem: (items.data ?? []).filter((i) => i.category_id === cat.id).map((i) => ({
        '@type': 'MenuItem',
        name: i.name,
        description: i.description,
        offers: { '@type': 'Offer', price: Number(i.price).toFixed(2), priceCurrency: 'TRY' },
      })),
    })),
  };

  return (
    <div className="container-site pt-32">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(menuJsonLd) }} />
      <SectionHeader eyebrow="Lezzetlerimiz" title="Menü" sub="Tüm fiyatlarımız güncel olup TL cinsindendir." />
      <MenuBrowser categories={cats.data ?? []} items={items.data ?? []} />
    </div>
  );
}
