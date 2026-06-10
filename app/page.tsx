import Link from 'next/link';
import { getContent, getSeo } from '@/lib/content';
import { supabaseServer } from '@/lib/supabase-server';
import SectionHeader from '@/components/site/SectionHeader';
import { CalendarDays, ArrowRight, Music } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/'); }

export default async function Home() {
  const sb = supabaseServer();
  const [c, featured, anns, gallery] = await Promise.all([
    getContent(),
    sb.from('menu_items').select('*, menu_item_images(url,sort_order)').eq('is_featured', true).eq('is_active', true).order('sort_order').limit(6),
    sb.from('announcements').select('*').eq('is_published', true).order('is_pinned', { ascending: false }).order('created_at', { ascending: false }).limit(3),
    sb.from('gallery_items').select('*').eq('is_active', true).eq('type', 'image').order('sort_order').limit(6),
  ]);

  const pinned = anns.data?.find((a) => a.is_pinned);

  return (
    <>
      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden">
        {c.hero_video ? (
          <video src={c.hero_video} autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover opacity-40" />
        ) : c.hero_image ? (
          <img src={c.hero_image} alt={c.site_name} className="absolute inset-0 w-full h-full object-cover opacity-35" />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(191,161,118,0.12),transparent_60%)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-dark/40 via-transparent to-dark" />
        <div className="relative z-10 text-center px-6 animate-fadeUp">
          <p className="eyebrow mb-5">{c.site_tagline}</p>
          <h1 className="h-display text-5xl md:text-7xl leading-tight max-w-3xl mx-auto">{c.hero_title}</h1>
          <p className="mt-6 text-cream/70 font-sans text-base md:text-lg max-w-xl mx-auto leading-relaxed">{c.hero_subtitle}</p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link href="/menu" className="btn-gold-solid">Menüyü Keşfet</Link>
            <Link href="/rezervasyon" className="btn-gold">Masa Ayırt</Link>
          </div>
        </div>
      </section>

      {/* SABİTLENMİŞ DUYURU BANDI */}
      {pinned && (
        <Link href={`/duyurular/${pinned.slug}`} className="block bg-gold text-dark">
          <div className="container-site py-3 flex items-center justify-center gap-3 font-sans text-sm font-medium">
            <Music size={16} /> {pinned.title}
            {pinned.event_date && <span>· {new Date(pinned.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>}
            <ArrowRight size={15} />
          </div>
        </Link>
      )}

      {/* ÖNE ÇIKANLAR */}
      {!!featured.data?.length && (
        <section className="container-site pt-24">
          <SectionHeader eyebrow="Menüden Seçmeler" title="Öne Çıkan Lezzetler" sub="Misafirlerimizin en sevdikleri — tamamı menü sayfasında." />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.data.map((it) => {
              const img = it.menu_item_images?.sort((a: any, b: any) => a.sort_order - b.sort_order)[0]?.url;
              return (
                <div key={it.id} className="group bg-dark-2 border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-colors">
                  {img && <div className="aspect-[4/3] overflow-hidden"><img src={img} alt={it.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                  <div className="p-5">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="text-xl text-cream">{it.name}</h3>
                      <span className="flex-1 dotted-line translate-y-[-4px]" />
                      <span className="text-gold font-medium">{Number(it.price).toFixed(0)} ₺</span>
                    </div>
                    {it.description && <p className="mt-2 text-muted2 font-sans text-sm">{it.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-10"><Link href="/menu" className="btn-gold">Tüm Menü</Link></div>
        </section>
      )}

      {/* HAKKIMIZDA ÖZET */}
      <section className="container-site pt-24 grid gap-10 md:grid-cols-2 items-center">
        <div>
          <p className="eyebrow">Le Balkon</p>
          <h2 className="h-display text-4xl md:text-5xl mt-3">{c.about_title}</h2>
          <p className="mt-5 text-cream/75 font-sans text-[15px] leading-relaxed">{c.about_text}</p>
          <Link href="/hakkimizda" className="btn-gold mt-7">Devamını Oku</Link>
        </div>
        <div className="rounded-2xl overflow-hidden shadow-image aspect-[4/3] bg-dark-2 border border-gold/10">
          {c.about_image ? <img src={c.about_image} alt={c.about_title} className="w-full h-full object-cover" />
            : <div className="w-full h-full flex items-center justify-center text-muted2 font-sans text-sm">Görsel admin panelinden eklenecek</div>}
        </div>
      </section>

      {/* DUYURULAR */}
      {!!anns.data?.length && (
        <section className="container-site pt-24">
          <SectionHeader eyebrow="Neler Oluyor" title="Duyurular & Etkinlikler" />
          <div className="grid gap-6 md:grid-cols-3">
            {anns.data.map((a) => (
              <Link key={a.id} href={`/duyurular/${a.slug}`} className="bg-dark-2 border border-gold/10 rounded-2xl p-6 hover:border-gold/40 transition-colors block">
                {a.event_date && (
                  <p className="flex items-center gap-2 text-gold font-sans text-xs mb-3">
                    <CalendarDays size={14} />
                    {new Date(a.event_date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <h3 className="text-2xl text-cream">{a.title}</h3>
                <p className="mt-3 text-muted2 font-sans text-sm leading-relaxed line-clamp-3">{a.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* GALERİ ÖNİZLEME */}
      {!!gallery.data?.length && (
        <section className="container-site pt-24">
          <SectionHeader eyebrow="Mekândan Kareler" title="Galeri" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.data.map((g) => (
              <div key={g.id} className="aspect-square rounded-xl overflow-hidden">
                <img src={g.url} alt={g.title || 'Le Balkon'} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
          <div className="text-center mt-10"><Link href="/galeri" className="btn-gold">Tüm Galeri</Link></div>
        </section>
      )}
    </>
  );
}
