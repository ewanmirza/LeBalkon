'use client';
import { useState } from 'react';
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
  const [active, setActive] = useState(categories[0]?.id ?? '');
  const [open, setOpen] = useState(categories[0]?.id ?? ''); // mobil akordeon
  const cat = categories.find((c) => c.id === active);
  const list = items.filter((i) => i.category_id === active);

  return (
    <div>
      {/* ===================== MOBİL: akordeon ===================== */}
      <div className="md:hidden">
        {categories.map((c) => {
          const isOpen = open === c.id;
          const clist = items.filter((i) => i.category_id === c.id);
          return (
            <div key={c.id} className="border-b border-gold/15">
              <button
                onClick={() => setOpen(isOpen ? '' : c.id)}
                className="w-full flex items-center justify-between gap-3 py-4 text-left"
                aria-expanded={isOpen}
              >
                <span className="flex items-baseline gap-2 min-w-0">
                  <span className={`font-sans text-sm uppercase tracking-wide ${isOpen ? 'text-gold' : 'text-cream'}`}>
                    {c.name}
                  </span>
                  <span className="font-sans text-xs text-muted2">{clist.length}</span>
                </span>
                <svg
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  className={`flex-shrink-0 text-gold transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              {isOpen && (
                <div className="pb-6 pt-1 space-y-5">
                  {c.description && (
                    <p className="text-muted2 font-sans text-sm italic">{c.description}</p>
                  )}
                  {clist.map((it) => <ItemRow key={it.id} it={it} />)}
                  {!clist.length && (
                    <p className="text-muted2 font-sans text-sm py-4">Bu kategoriye henüz ürün eklenmedi.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ===================== MASAÜSTÜ: sol menü + içerik ===================== */}
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
