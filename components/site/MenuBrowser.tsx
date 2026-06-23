'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import type { MenuCategory, MenuItem } from '@/lib/types';

function ItemRow({ it, onOpen }: { it: MenuItem; onOpen: (url: string, name: string) => void }) {
  const imgs = (it.menu_item_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="flex gap-4">
      {imgs[0] && (
        <button
          onClick={() => onOpen(imgs[0].url, it.name)}
          className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gold/15 bg-dark-2 active:opacity-80 transition-opacity"
          aria-label={`${it.name} fotoğrafını büyüt`}
        >
          <Image src={imgs[0].url} alt={it.name} fill sizes="112px" quality={75} className="object-cover" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="text-lg text-cream">{it.name}</h3>
          <span className="flex-1 dotted-line translate-y-[-4px]" />
          <span className="text-gold font-medium whitespace-nowrap">{Number(it.price).toFixed(0)} ₺</span>
        </div>
        {it.description && (
          <p className="mt-1.5 text-muted2 font-sans text-sm leading-relaxed">{it.description}</p>
        )}
        {imgs.length > 1 && (
          <div className="flex gap-2 mt-2">
            {imgs.slice(1, 5).map((im) => (
              <button key={im.id} onClick={() => onOpen(im.url, it.name)} className="active:opacity-80">
                <Image src={im.url} alt="" width={48} height={48} quality={70}
                  className="w-12 h-12 rounded-lg object-cover border border-gold/10" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Lightbox({ url, name, onClose }: { url: string; name: string; onClose: () => void }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-[120] bg-black/92 flex items-center justify-center p-4 animate-page"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white/80 hover:text-white p-2 z-10"
        aria-label="Kapat"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      <div className="relative max-w-[92vw] max-h-[88vh]" onClick={(e) => e.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={name} className="max-w-[92vw] max-h-[88vh] object-contain rounded-xl" />

        {/* Balkon filigranı */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden rounded-xl">
          <div className="rotate-[-25deg] select-none">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="whitespace-nowrap text-white/15 font-heading tracking-[0.3em] text-xl md:text-3xl py-3">
                LE BALKON&nbsp;&nbsp;·&nbsp;&nbsp;LE BALKON&nbsp;&nbsp;·&nbsp;&nbsp;LE BALKON&nbsp;&nbsp;·&nbsp;&nbsp;LE BALKON
              </div>
            ))}
          </div>
        </div>

        <p className="absolute bottom-3 left-0 right-0 text-center text-white/85 font-heading text-lg drop-shadow">{name}</p>
      </div>
    </div>
  );
}

export default function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? '');
  const [mobileCat, setMobileCat] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const openImg = (url: string, name: string) => setLightbox({ url, name });

  const cat = categories.find((c) => c.id === active);
  const list = items.filter((i) => i.category_id === active);
  const mCat = categories.find((c) => c.id === mobileCat);
  const mList = items.filter((i) => i.category_id === mobileCat);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileCat || lightbox ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileCat, lightbox]);

  return (
    <div>
      {/* ===================== MOBİL ===================== */}
      <div className="md:hidden">
        {categories.map((c) => {
          const count = items.filter((i) => i.category_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setMobileCat(c.id)}
              className="w-full flex items-center gap-4 py-3 border-b border-gold/15 text-left active:bg-dark-2 transition-colors"
            >
              {c.image_url ? (
                <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-gold/15 bg-dark-2">
                  <Image src={c.image_url} alt={c.name} fill sizes="56px" quality={70} className="object-cover" />
                </div>
              ) : (
                <div className="w-14 h-14 rounded-xl flex-shrink-0 border border-gold/15 bg-dark-2 flex items-center justify-center">
                  <span className="font-heading text-gold/70 text-lg">{c.name.charAt(0)}</span>
                </div>
              )}
              <span className="flex-1 flex items-baseline gap-2 min-w-0">
                <span className="font-heading text-lg text-cream truncate">{c.name}</span>
                <span className="font-sans text-xs text-muted2">{count}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-gold">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>

      {mobileCat !== null && (
        <div className="md:hidden fixed inset-0 z-[110] bg-dark overflow-y-auto overscroll-contain">
          <div key={mobileCat} className="container-site pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-16 min-h-full animate-menu">
            <button onClick={() => setMobileCat(null)} className="flex items-center gap-1.5 font-sans text-sm text-gold mb-5 active:opacity-70">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tüm Kategoriler
            </button>

            {mCat?.image_url && (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-gold/15 mb-5 bg-dark-2">
                <Image src={mCat.image_url} alt={mCat.name} fill sizes="100vw" quality={75} className="object-cover" />
              </div>
            )}

            <h2 className="font-heading font-medium text-2xl text-cream">{mCat?.name}</h2>
            {mCat?.description && <p className="mt-2 text-muted2 font-sans text-sm italic">{mCat.description}</p>}
            <div className="mt-4 mb-7 h-px w-14 bg-gold/40" />

            <div className="space-y-6">
              {mList.map((it) => <ItemRow key={it.id} it={it} onOpen={openImg} />)}
              {!mList.length && <p className="text-muted2 font-sans text-sm py-6">Bu kategoriye henüz ürün eklenmedi.</p>}
            </div>
          </div>
        </div>
      )}

      {/* ===================== MASAÜSTÜ ===================== */}
      <div className="hidden md:grid md:grid-cols-[230px_1fr] md:gap-12 lg:gap-20">
        <nav>
          <div className="sticky top-28 border-l border-gold/15">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setActive(c.id)}
                className={`block w-full text-left font-sans text-[12.5px] uppercase tracking-wide leading-snug py-2.5 pl-4 -ml-px border-l-2 transition-colors ${
                  active === c.id ? 'border-gold text-gold' : 'border-transparent text-muted2 hover:text-cream hover:border-gold/40'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </nav>

        <div key={active} className="animate-menu">
          {cat?.image_url && (
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gold/15 mb-6 bg-dark-2">
              <Image src={cat.image_url} alt={cat.name} fill sizes="(min-width: 768px) 70vw, 100vw" quality={75} className="object-cover" />
            </div>
          )}
          <div className="mb-8">
            <h2 className="font-heading font-medium text-2xl md:text-3xl text-cream">{cat?.name}</h2>
            {cat?.description && <p className="mt-2 text-muted2 font-sans text-sm italic">{cat.description}</p>}
            <div className="mt-4 h-px w-14 bg-gold/40" />
          </div>
          <div className="grid gap-x-12 gap-y-7 md:grid-cols-2">
            {list.map((it) => <ItemRow key={it.id} it={it} onOpen={openImg} />)}
            {!list.length && (
              <p className="text-muted2 font-sans text-sm md:col-span-2 text-center py-10">Bu kategoriye henüz ürün eklenmedi.</p>
            )}
          </div>
        </div>
      </div>

      {lightbox && <Lightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </div>
  );
}
