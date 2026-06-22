'use client';
import { useState, useEffect } from 'react';
import type { MenuCategory, MenuItem } from '@/lib/types';

function ItemRow({ it }: { it: MenuItem }) {
  const imgs = (it.menu_item_images ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
  return (
    <div className="flex gap-4">
      {imgs[0] && (
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gold/10">
          <img src={imgs[0].url} alt={it.name} className="w-full h-full object-cover" loading="lazy" />
        </div>
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
            {imgs.slice(1, 4).map((im) => (
              <img key={im.id} src={im.url} alt="" className="w-10 h-10 rounded-lg object-cover border border-gold/10" loading="lazy" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function MenuBrowser({ categories, items }: { categories: MenuCategory[]; items: MenuItem[] }) {
  const [active, setActive] = useState(categories[0]?.id ?? '');     // masaüstü
  const [mobileCat, setMobileCat] = useState<string | null>(null);   // mobil: null = kategori listesi
  const cat = categories.find((c) => c.id === active);
  const list = items.filter((i) => i.category_id === active);

  const mCat = categories.find((c) => c.id === mobileCat);
  const mList = items.filter((i) => i.category_id === mobileCat);

  // Mobil detay açıkken arka plan kaymasın
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileCat ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileCat]);

  return (
    <div>
      {/* ===================== MOBİL ===================== */}
      {/* 1. katman: kategori listesi (normal akış) */}
      <div className="md:hidden">
        {categories.map((c) => {
          const count = items.filter((i) => i.category_id === c.id).length;
          return (
            <button
              key={c.id}
              onClick={() => setMobileCat(c.id)}
              className="w-full flex items-center justify-between gap-3 py-4 border-b border-gold/15 text-left active:bg-dark-2 transition-colors"
            >
              <span className="flex items-baseline gap-2 min-w-0">
                <span className="font-heading text-lg text-cream">{c.name}</span>
                <span className="font-sans text-xs text-muted2">{count}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="flex-shrink-0 text-gold">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          );
        })}
      </div>

      {/* 2. katman: tam ekran kategori detayı — başka hiçbir şey görünmez */}
      {mobileCat !== null && (
        <div className="md:hidden fixed inset-0 z-[60] bg-dark overflow-y-auto overscroll-contain">
          <div className="container-site pt-6 pb-16 min-h-full">
            <button
              onClick={() => setMobileCat(null)}
              className="flex items-center gap-1.5 font-sans text-sm text-gold mb-5 active:opacity-70"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Tüm Kategoriler
            </button>

            <h2 className="font-heading font-medium text-2xl text-cream">{mCat?.name}</h2>
            {mCat?.description && <p className="mt-2 text-muted2 font-sans text-sm italic">{mCat.description}</p>}
            <div className="mt-4 mb-7 h-px w-14 bg-gold/40" />

            <div className="space-y-6">
              {mList.map((it) => <ItemRow key={it.id} it={it} />)}
              {!mList.length && (
                <p className="text-muted2 font-sans text-sm py-6">Bu kategoriye henüz ürün eklenmedi.</p>
              )}
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
                  active === c.id
                    ? 'border-gold text-gold'
                    : 'border-transparent text-muted2 hover:text-cream hover:border-gold/40'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </nav>

        <div>
          <div className="mb-8">
            <h2 className="font-heading font-medium text-2xl md:text-3xl text-cream">{cat?.name}</h2>
            {cat?.description && <p className="mt-2 text-muted2 font-sans text-sm italic">{cat.description}</p>}
            <div className="mt-4 h-px w-14 bg-gold/40" />
          </div>
          <div className="grid gap-x-12 gap-y-6 md:grid-cols-2">
            {list.map((it) => <ItemRow key={it.id} it={it} />)}
            {!list.length && (
              <p className="text-muted2 font-sans text-sm md:col-span-2 text-center py-10">
                Bu kategoriye henüz ürün eklenmedi.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
