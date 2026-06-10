'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabaseBrowser } from '@/lib/supabase-browser';
import { LayoutDashboard, FileText, UtensilsCrossed, Images, Megaphone, CalendarCheck, Search, Settings, LogOut, Menu as MenuIcon, X } from 'lucide-react';

const nav = [
  { href: '/admin', label: 'Panel', icon: LayoutDashboard },
  { href: '/admin/icerik', label: 'Site İçeriği', icon: FileText },
  { href: '/admin/menu', label: 'Menü Yönetimi', icon: UtensilsCrossed },
  { href: '/admin/galeri', label: 'Galeri', icon: Images },
  { href: '/admin/duyurular', label: 'Duyurular', icon: Megaphone },
  { href: '/admin/rezervasyonlar', label: 'Rezervasyonlar', icon: CalendarCheck },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/ayarlar', label: 'Ayarlar', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/admin/login';

  useEffect(() => {
    const sb = supabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session);
      setReady(true);
      if (!data.session && !isLogin) router.replace('/admin/login');
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setAuthed(!!session);
      if (!session && !isLogin) router.replace('/admin/login');
    });
    return () => sub.subscription.unsubscribe();
  }, [pathname, isLogin, router]);

  useEffect(() => setOpen(false), [pathname]);

  if (isLogin) return <div className="min-h-screen bg-dark">{children}</div>;
  if (!ready) return <div className="min-h-screen bg-dark flex items-center justify-center text-gold font-sans">Yükleniyor…</div>;
  if (!authed) return null;

  async function logout() {
    await supabaseBrowser().auth.signOut();
    router.replace('/admin/login');
  }

  return (
    <div className="min-h-screen bg-dark flex">
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-4 right-4 z-50 bg-dark-2 border border-gold/20 rounded-lg p-2 text-gold">
        {open ? <X size={20} /> : <MenuIcon size={20} />}
      </button>
      <aside className={`fixed lg:sticky top-0 h-screen w-64 bg-dark-2 border-r border-gold/10 flex flex-col z-40 transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gold/10">
          <p className="font-heading text-lg text-gold tracking-[0.1em] uppercase">Le Balkon</p>
          <p className="font-sans text-xs text-muted2 mt-1">Yönetim Paneli</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = pathname === n.href;
            return (
              <Link key={n.href} href={n.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 font-sans text-sm transition-colors ${active ? 'bg-gold text-dark font-medium' : 'text-cream/70 hover:bg-dark-3 hover:text-cream'}`}>
                <Icon size={17} /> {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-gold/10">
          <Link href="/" target="_blank" className="block text-center font-sans text-xs text-muted2 hover:text-gold py-2 transition-colors">Siteyi Görüntüle ↗</Link>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 font-sans text-sm text-red-400 hover:bg-red-400/10 transition-colors">
            <LogOut size={16} /> Çıkış Yap
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 md:p-10 max-w-5xl">{children}</main>
    </div>
  );
}
