'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import type { MenuCategory, MenuItem } from '@/lib/types';

const price = (p: number | string) => `${Number(p).toFixed(0)} ₺`;
const firstImg = (it?: MenuItem) =>
  it?.menu_item_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.url;

/* Masaüstü ürün satırı */
function DeskRow({ it }: { it: MenuItem }) {
  const img = firstImg(it);
  return (
    <div className="flex gap-4">
      {img && (
        <div className="relative w-24 h-24 md:w-28 md:h-28 rounded-xl overflow-hidden flex-shrink-0 border border-gold/15 bg-dark-2">
          <Image src={img} alt={it.name} fill sizes="112px" quality={75} className="object-cover" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-3">
          <h3 className="text-lg text-cream">{it.name}</h3>
          <span className="flex-1 dotted-line translate-y-[-4px]" />
          <span className="text-gold font-medium whitespace-nowrap">{price(it.price)}</span>
        </div>
        {it.description && <p className="mt-1.5 text-muted2 font-sans text-sm leading-relaxed">{it.description}</p>}
      </div>
    </div>
  );
}

export default function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? '');   // masaüstü
  const [mCat, setMCat] = useState<string | null>(null);           // mobil kategori
  const [mItem, setMItem] = useState<string | null>(null);         // mobil ürün detay
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const itemsOf = (cid: string) => items.filter((i) => i.category_id === cid);
  const cat = categories.find((c) => c.id === active);
  const list = itemsOf(active);
  const curCat = categories.find((c) => c.id === mCat);
  const curItem = items.find((i) => i.id === mItem);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mCat || mItem ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mCat, mItem]);

  /* ---------- MOBİL: ürün listesi (katman 2) ---------- */
  const itemsOverlay = curCat && !curItem && (
    <div className="md:hidden fixed inset-0 z-[2147483000] bg-dark overflow-y-auto overscroll-contain">
      <div className="container-site pt-[calc(env(safe-area-inset-top)+1.25rem)] pb-16 animate-menu">
        <button onClick={() => setMCat(null)}
          className="flex items-center gap-2 font-sans text-xs tracking-[0.14em] uppercase text-muted2 mb-5 active:opacity-70">
          <span className="text-gold text-base leading-none">←</span> Menü
        </button>
        <h2 className="font-heading font-medium text-[34px] leading-tight text-cream px-1">{curCat.name}</h2>
        {curCat.description && (
          <p className="font-sans text-xs tracking-wide text-muted2 px-1 pb-5 pt-1">{curCat.description}</p>
        )}
        <div>
          {itemsOf(curCat.id).map((it) => (
            <button key={it.id} onClick={() => setMItem(it.id)}
              className="w-full flex items-baseline justify-between gap-4 py-4 px-1 text-left border-t border-gold/10 active:bg-dark-2 transition-colors">
              <span className="flex-1 min-w-0">
                <span className="block font-heading font-medium text-xl text-cream mb-0.5">{it.name}</span>
                {it.description && <span className="block font-sans text-[12.5px] text-muted2 leading-relaxed">{it.description}</span>}
              </span>
              <span className="font-sans text-[15px] text-gold whitespace-nowrap">{price(it.price)}</span>
            </button>
          ))}
          {!itemsOf(curCat.id).length && (
            <p className="text-muted2 font-sans text-sm py-6">Bu kategoriye henüz ürün eklenmedi.</p>
          )}
        </div>
      </div>
    </div>
  );

  /* ---------- MOBİL: ürün detay (katman 3) ---------- */
  const detailOverlay = curItem && (
    <div className="md:hidden fixed inset-0 z-[2147483000] bg-dark overflow-y-auto overscroll-contain animate-menu">
      <div className="relative w-full h-80 bg-dark-2">
        {firstImg(curItem) ? (
          <Image src={firstImg(curItem)!} alt={curItem.name} fill sizes="100vw" quality={80} className="object-cover" priority />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-sans text-xs tracking-[0.2em] uppercase text-muted2">
            Le Balkon
          </div>
        )}
        <button onClick={() => setMItem(null)}
          className="absolute top-[calc(env(safe-area-inset-top)+1rem)] left-4 w-10 h-10 rounded-full bg-dark/60 backdrop-blur-md border border-gold/20 flex items-center justify-center text-cream text-lg active:opacity-70">
          ←
        </button>
      </div>
      <div className="container-site pt-7 pb-16">
        <div className="font-sans text-[10px] tracking-[0.24em] uppercase text-gold mb-2.5">{curCat?.name}</div>
        <div className="flex items-start justify-between gap-4">
          <h2 className="font-heading font-medium text-[36px] leading-[1.05] text-cream">{curItem.name}</h2>
          <span className="font-heading text-2xl text-gold whitespace-nowrap mt-1">{price(curItem.price)}</span>
        </div>
        <div className="h-px bg-gold/15 my-6" />
        {curItem.description && (
          <p className="font-sans text-sm leading-[1.85] text-muted2">{curItem.description}</p>
        )}
      </div>
    </div>
  );

  return (
    <div>
      {/* ===================== MOBİL: kategori kartları (katman 1) ===================== */}
      <div className="md:hidden">
        {categories.map((c) => {
          const count = itemsOf(c.id).length;
          return (
            <div key={c.id} className="mb-7">
              <button onClick={() => setMCat(c.id)} className="block w-full text-left active:opacity-90">
                <div className="relative w-full h-44 rounded-xl overflow-hidden border border-gold/10 bg-dark-2">
                  {c.image_url ? (
                    <Image src={c.image_url} alt={c.name} fill sizes="100vw" quality={75} className="object-cover" />
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
      {mounted && detailOverlay && createPortal(detailOverlay, document.body)}

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
            {list.map((it) => <DeskRow key={it.id} it={it} />)}
            {!list.length && (
              <p className="text-muted2 font-sans text-sm md:col-span-2 text-center py-10">Bu kategoriye henüz ürün eklenmedi.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
