'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { MenuCategory, MenuItem } from '@/lib/types';

const price = (p: number | string) => `${Number(p).toFixed(0)} ₺`;
const firstImg = (it?: MenuItem) =>
  it?.menu_item_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

/* Fotoğraflı ürün satırı (hem mobil hem masaüstü) */
function ItemCard({ it }: { it: MenuItem }) {
  const img = firstImg(it);
  return (
    <div className="flex gap-4 py-4 border-t border-gold/10 first:border-t-0">
      {img ? (
        <div className="relative w-28 h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gold/15 bg-dark-2">
          <Image src={img} alt={it.name} fill sizes="112px" quality={75} className="object-cover" />
        </div>
      ) : (
        <div className="w-28 h-28 rounded-xl flex-shrink-0 border border-gold/15 bg-dark-2 flex items-center justify-center font-sans text-[10px] tracking-[0.18em] uppercase text-muted2">
          Le Balkon
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-heading font-medium text-xl text-cream leading-tight">{it.name}</h3>
          <span className="font-sans text-[15px] text-gold whitespace-nowrap">{price(it.price)}</span>
        </div>
        {it.description && (
          <p className="mt-1.5 font-sans text-[12.5px] text-muted2 leading-relaxed">{it.description}</p>
        )}
      </div>
    </div>
  );
}

export default function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? '');   // masaüstü
  const [mCat, setMCat] = useState<string | null>(null);           // mobil kategori
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const itemsOf = (cid: string) => items.filter((i) => i.category_id === cid);
  const cat = categories.find((c) => c.id === active);
  const list = itemsOf(active);
  const curCat = categories.find((c) => c.id === mCat);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mCat ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mCat]);

  /* ---------- MOBİL: ürün listesi (fotoğraflı) ---------- */
  const itemsOverlay = curCat && (
    <div className="md:hidden fixed inset-0 z-[2147483000] bg-dark overflow-y-auto overscroll-contain">
      {/* sabit geri çubuğu */}
      <div className="sticky top-0 z-10 bg-dark/95 backdrop-blur-md border-b border-gold/15 pt-[calc(env(safe-area-inset-top)+0.5rem)]">
        <div className="container-site py-3 flex items-center justify-between">
          <button onClick={() => setMCat(null)} className="flex items-center gap-2 font-sans text-xs tracking-[0.14em] uppercase text-gold active:opacity-70">
            <span className="text-base leading-none">←</span> Menü
          </button>
          <span className="font-heading text-cream text-sm truncate max-w-[55%]">{curCat.name}</span>
        </div>
      </div>

      <div key={mCat} className="container-site pt-5 pb-16 animate-menu">
        {curCat.image_url && (
          <div className="relative w-full h-36 rounded-2xl overflow-hidden border border-gold/15 mb-5 bg-white">
            <Image src={curCat.image_url} alt={curCat.name} fill sizes="100vw" quality={75} className="object-contain p-2" />
          </div>
        )}
        <h2 className="font-heading font-medium text-[32px] leading-tight text-cream">{curCat.name}</h2>
        {curCat.description && (
          <p className="font-sans text-xs tracking-wide text-muted2 pt-1 pb-3">{curCat.description}</p>
        )}
        <div className="mt-3">
          {itemsOf(curCat.id).map((it) => <ItemCard key={it.id} it={it} />)}
          {!itemsOf(curCat.id).length && (
            <p className="text-muted2 font-sans text-sm py-6">Bu kategoriye henüz ürün eklenmedi.</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* ===================== MOBİL: kategori kartları ===================== */}
      <div className="md:hidden">
        {categories.map((c) => {
          const count = itemsOf(c.id).length;
          return (
            <div key={c.id} className="mb-7">
              <button onClick={() => setMCat(c.id)} className="block w-full text-left active:opacity-90">
                <div className={`relative w-full h-32 rounded-xl overflow-hidden border border-gold/10 ${c.image_url ? 'bg-white' : 'bg-dark-2'}`}>
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.name} fill sizes="100vw" quality={75} className="object-contain p-2" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-sans text-[11px] tracking-[0.2em] uppercase text-muted2">
                      Le Balkon
                    </div>
                  )}
                </div>
                <div className="flex items-baseline justify-between gap-3 pt-3.5 px-1">
                  <span className="font-heading font-medium text-[27px] leading-none text-cream">{c.name}</span>
                  <span className="flex items-baseline gap-2.5 flex-shrink-0">
                    <span className="font-sans text-xs text-muted2">{count}</span>
                    <span className="text-gold text-lg">→</span>
                  </span>
                </div>
                {c.description && (
                  <div className="font-sans text-xs tracking-wide text-muted2 px-1 pt-1.5">{c.description}</div>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {mounted && itemsOverlay && createPortal(itemsOverlay, document.body)}

      {/* ===================== MASAÜSTÜ: sol menü + içerik ===================== */}
      <div className="hidden md:grid md:grid-cols-[230px_1fr] md:gap-12 lg:gap-20">
        <nav>
          <div className="sticky top-28 border-l border-gold/15">
            {categories.map((c) => (
              <button key={c.id} onClick={() => setActive(c.id)}
                className={`block w-full text-left font-sans text-[12.5px] uppercase tracking-wide leading-snug py-2.5 pl-4 -ml-px border-l-2 transition-colors ${
                  active === c.id ? 'border-gold text-gold' : 'border-transparent text-muted2 hover:text-cream hover:border-gold/40'
                }`}>
                {c.name}
              </button>
            ))}
          </div>
        </nav>

        <div key={active} className="animate-menu">
          {cat?.image_url && (
            <div className="relative w-full h-52 rounded-2xl overflow-hidden border border-gold/15 mb-6 bg-white">
              <Image src={cat.image_url} alt={cat.name} fill sizes="(min-width: 768px) 70vw, 100vw" quality={75} className="object-contain p-4" />
            </div>
          )}
          <div className="mb-8">
            <h2 className="font-heading font-medium text-2xl md:text-3xl text-cream">{cat?.name}</h2>
            {cat?.description && <p className="mt-2 text-muted2 font-sans text-sm italic">{cat.description}</p>}
            <div className="mt-4 h-px w-14 bg-gold/40" />
          </div>
          <div className="grid gap-x-12 gap-y-2 md:grid-cols-2">
            {list.map((it) => <ItemCard key={it.id} it={it} />)}
            {!list.length && (
              <p className="text-muted2 font-sans text-sm md:col-span-2 text-center py-10">Bu kategoriye henüz ürün eklenmedi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
