'use client';
import { useEffect, useState, useCallback } from 'react';
import { supabaseBrowser } from '@/lib/supabase-browser';
import MediaUpload from '@/components/admin/MediaUpload';
import type { MenuCategory, MenuItem } from '@/lib/types';
import { Plus, Trash2, ChevronUp, ChevronDown, Star, Eye, EyeOff, X, GripVertical } from 'lucide-react';

function slugify(s: string) {
  return s.toLowerCase()
    .replace(/ğ/g, 'g').replace(/ü/g, 'u').replace(/ş/g, 's')
    .replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// Hata varsa uyarı göster, başarı/başarısızlık döndür
function chk(res: { error: unknown } | null | undefined, msg: string) {
  const err = (res as { error?: { message?: string } } | null)?.error;
  if (err) { alert(`${msg}: ${err.message ?? 'bilinmeyen hata'}`); return false; }
  return true;
}
const revalidate = () => fetch('/api/revalidate', { method: 'POST' }).catch(() => {});

export default function MenuAdmin() {
  const [cats, setCats] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [activeCat, setActiveCat] = useState<string>('');
  const [dragId, setDragId] = useState<string | null>(null);
  const sb = supabaseBrowser();

  const load = useCallback(async () => {
    const [c, i] = await Promise.all([
      sb.from('menu_categories').select('*').order('sort_order'),
      sb.from('menu_items').select('*, menu_item_images(id,item_id,url,sort_order)').order('sort_order'),
    ]);
    setCats((c.data ?? []) as MenuCategory[]);
    setItems((i.data ?? []) as MenuItem[]);
    setActiveCat((prev) => prev || c.data?.[0]?.id || '');
  }, []);
  useEffect(() => { load(); }, [load]);

  // ---- KATEGORİ ----
  async function addCategory() {
    const name = prompt('Kategori adı:');
    if (!name) return;
    const r = await sb.from('menu_categories').insert({ name, slug: slugify(name) + '-' + Date.now().toString(36), sort_order: cats.length + 1 });
    if (!chk(r, 'Kategori eklenemedi')) return;
    load();
  }
  async function renameCategory(c: MenuCategory) {
    const name = prompt('Yeni kategori adı:', c.name);
    if (!name || name === c.name) return;
    const r = await sb.from('menu_categories').update({ name }).eq('id', c.id);
    if (!chk(r, 'Kategori adı değiştirilemedi')) return;
    load(); revalidate();
  }
  async function deleteCategory(c: MenuCategory) {
    if (!confirm(`"${c.name}" kategorisi ve içindeki TÜM ürünler silinecek. Emin misiniz?`)) return;
    const r = await sb.from('menu_categories').delete().eq('id', c.id);
    if (!chk(r, 'Kategori silinemedi')) return;
    if (activeCat === c.id) setActiveCat('');
    load(); revalidate();
  }
  async function toggleCategory(c: MenuCategory) {
    const r = await sb.from('menu_categories').update({ is_active: !c.is_active }).eq('id', c.id);
    if (!chk(r, 'Kategori durumu değiştirilemedi')) return;
    load(); revalidate();
  }
  // Sıralamayı kalıcılaştır (sürükle-bırak ve oklar bunu kullanır)
  async function persistOrder(ordered: MenuCategory[]) {
    setCats(ordered); // anında UI
    const results = await Promise.all(
      ordered.map((c, idx) => sb.from('menu_categories').update({ sort_order: idx + 1 }).eq('id', c.id))
    );
    const bad = results.find((r) => r.error);
    if (bad) { chk(bad, 'Sıralama kaydedilemedi'); load(); return; }
    revalidate();
  }
  function moveCategory(c: MenuCategory, dir: -1 | 1) {
    const idx = cats.findIndex((x) => x.id === c.id);
    const j = idx + dir;
    if (j < 0 || j >= cats.length) return;
    const next = [...cats];
    [next[idx], next[j]] = [next[j], next[idx]];
    persistOrder(next);
  }
  function onDropRow(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const from = cats.findIndex((c) => c.id === dragId);
    const to = cats.findIndex((c) => c.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...cats];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setDragId(null);
    persistOrder(next);
  }

  // ---- ÜRÜN ----
  async function addItem() {
    if (!activeCat) return alert('Önce bir kategori seçin.');
    const list = items.filter((i) => i.category_id === activeCat);
    const r = await sb.from('menu_items').insert({ category_id: activeCat, name: 'Yeni Ürün', price: 0, sort_order: list.length + 1 });
    if (!chk(r, 'Ürün eklenemedi')) return;
    load(); revalidate();
  }
  async function saveItem(id: string, patch: Partial<MenuItem>) {
    const r = await sb.from('menu_items').update(patch).eq('id', id);
    if (!chk(r, 'Ürün kaydedilemedi')) return;
    load(); revalidate();
  }
  async function deleteItem(it: MenuItem) {
    if (!confirm(`"${it.name}" silinsin mi?`)) return;
    const r = await sb.from('menu_items').delete().eq('id', it.id);
    if (!chk(r, 'Ürün silinemedi')) return;
    load(); revalidate();
  }
  async function addItemImage(itemId: string, url: string, count: number) {
    const r = await sb.from('menu_item_images').insert({ item_id: itemId, url, sort_order: count + 1 });
    if (!chk(r, 'Fotoğraf eklenemedi')) return;
    load(); revalidate();
  }
  async function deleteItemImage(imgId: string) {
    const r = await sb.from('menu_item_images').delete().eq('id', imgId);
    if (!chk(r, 'Fotoğraf silinemedi')) return;
    load(); revalidate();
  }

  const catItems = items.filter((i) => i.category_id === activeCat);
  const cat = cats.find((c) => c.id === activeCat);

  return (
    <div>
      <h1 className="h-display text-3xl mb-8">Menü Yönetimi</h1>

      {/* Kategoriler */}
      <div className="bg-dark-2 border border-gold/15 rounded-2xl p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="eyebrow">Kategoriler <span className="text-muted2 normal-case tracking-normal">— sürükleyerek sırala</span></h2>
          <button onClick={addCategory} className="inline-flex items-center gap-1.5 font-sans text-sm text-gold border border-gold/40 rounded-lg px-3 py-1.5 hover:bg-gold hover:text-dark transition-colors">
            <Plus size={15} /> Kategori Ekle
          </button>
        </div>
        <div className="space-y-2">
          {cats.map((c, idx) => (
            <div key={c.id}
              draggable
              onDragStart={() => setDragId(c.id)}
              onDragEnd={() => setDragId(null)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); onDropRow(c.id); }}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 font-sans text-sm cursor-pointer transition-all ${activeCat === c.id ? 'bg-gold/15 border border-gold/40' : 'bg-dark-3 border border-transparent hover:border-gold/20'} ${dragId === c.id ? 'opacity-40' : ''}`}
              onClick={() => setActiveCat(c.id)}>
              <span className="cursor-grab active:cursor-grabbing text-muted2 hover:text-gold touch-none" title="Sürükle" onClick={(e) => e.stopPropagation()}><GripVertical size={16} /></span>
              <span className={`flex-1 ${c.is_active ? 'text-cream' : 'text-muted2 line-through'}`}>{c.name}</span>
              <span className="text-muted2 text-xs">{items.filter((i) => i.category_id === c.id).length} ürün</span>
              <button onClick={(e) => { e.stopPropagation(); moveCategory(c, -1); }} disabled={idx === 0} className="text-muted2 hover:text-gold disabled:opacity-20"><ChevronUp size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); moveCategory(c, 1); }} disabled={idx === cats.length - 1} className="text-muted2 hover:text-gold disabled:opacity-20"><ChevronDown size={16} /></button>
              <button onClick={(e) => { e.stopPropagation(); toggleCategory(c); }} title={c.is_active ? 'Gizle' : 'Yayınla'} className="text-muted2 hover:text-gold">{c.is_active ? <Eye size={15} /> : <EyeOff size={15} />}</button>
              <button onClick={(e) => { e.stopPropagation(); renameCategory(c); }} className="text-muted2 hover:text-gold text-xs underline">ad</button>
              <button onClick={(e) => { e.stopPropagation(); deleteCategory(c); }} className="text-red-400/70 hover:text-red-400"><Trash2 size={15} /></button>
            </div>
          ))}
          {!cats.length && <p className="text-muted2 font-sans text-sm py-3 text-center">Henüz kategori yok — "Kategori Ekle" ile başlayın.</p>}
        </div>
      </div>

      {/* Ürünler */}
      {cat && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="eyebrow">{cat.name} — Ürünler</h2>
            <button onClick={addItem} className="inline-flex items-center gap-1.5 font-sans text-sm bg-gold text-dark rounded-lg px-3 py-1.5 hover:bg-gold-light transition-colors">
              <Plus size={15} /> Ürün Ekle
            </button>
          </div>
          <div className="space-y-4">
            {catItems.map((it) => (
              <ItemEditor key={it.id} item={it} onSave={saveItem} onDelete={() => deleteItem(it)}
                onAddImage={(url) => addItemImage(it.id, url, it.menu_item_images?.length ?? 0)}
                onDeleteImage={deleteItemImage} />
            ))}
            {!catItems.length && <p className="text-muted2 font-sans text-sm py-6 text-center bg-dark-2 rounded-xl border border-gold/10">Bu kategoride ürün yok.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ItemEditor({ item, onSave, onDelete, onAddImage, onDeleteImage }: {
  item: MenuItem;
  onSave: (id: string, patch: Partial<MenuItem>) => void;
  onDelete: () => void;
  onAddImage: (url: string) => void;
  onDeleteImage: (id: string) => void;
}) {
  const [name, setName] = useState(item.name);
  const [desc, setDesc] = useState(item.description ?? '');
  const [price, setPrice] = useState(String(item.price));
  const dirty = name !== item.name || desc !== (item.description ?? '') || Number(price) !== Number(item.price);
  const imgs = (item.menu_item_images ?? []).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-dark-2 border border-gold/15 rounded-2xl p-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_120px] mb-3">
        <input value={name} onChange={(e) => setName(e.target.value)} className="input-dark" placeholder="Ürün adı" />
        <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" step="0.01" className="input-dark" placeholder="Fiyat ₺" />
      </div>
      <textarea value={desc} onChange={(e) => setDesc(e.target.value)} rows={2} className="input-dark resize-none mb-3" placeholder="Açıklama (opsiyonel)" />
      <div className="flex items-center gap-3 flex-wrap mb-3">
        <MediaUpload folder="menu" label="Fotoğraf Ekle" onUploaded={onAddImage} />
        {imgs.map((im) => (
          <div key={im.id} className="relative group">
            <img src={im.url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gold/20" />
            <button onClick={() => onDeleteImage(im.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <X size={13} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 flex-wrap font-sans text-xs">
        <button onClick={() => onSave(item.id, { is_featured: !item.is_featured })}
          className={`inline-flex items-center gap-1 rounded-pill px-3 py-1.5 border transition-colors ${item.is_featured ? 'bg-gold text-dark border-gold' : 'border-gold/30 text-gold'}`}>
          <Star size={13} /> {item.is_featured ? 'Öne Çıkan ✓' : 'Öne Çıkar'}
        </button>
        <button onClick={() => onSave(item.id, { is_active: !item.is_active })}
          className={`inline-flex items-center gap-1 rounded-pill px-3 py-1.5 border transition-colors ${item.is_active ? 'border-gold/30 text-gold' : 'border-red-400/40 text-red-400'}`}>
          {item.is_active ? <><Eye size={13} /> Yayında</> : <><EyeOff size={13} /> Gizli</>}
        </button>
        <span className="flex-1" />
        {dirty && (
          <button onClick={() => onSave(item.id, { name, description: desc, price: Number(price) })}
            className="bg-gold text-dark rounded-pill px-4 py-1.5 font-medium hover:bg-gold-light transition-colors">
            Kaydet
          </button>
        )}
        <button onClick={onDelete} className="inline-flex items-center gap-1 text-red-400/80 hover:text-red-400 px-2"><Trash2 size={14} /> Sil</button>
      </div>
    </div>
  );
}
