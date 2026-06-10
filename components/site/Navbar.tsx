'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

const links = [
  { label: 'Anasayfa', href: '/' },
  { label: 'Menü', href: '/menu' },
  { label: 'Hakkımızda', href: '/hakkimizda' },
  { label: 'Galeri', href: '/galeri' },
  { label: 'Duyurular', href: '/duyurular' },
  { label: 'İletişim', href: '/iletisim' },
];

export default function Navbar({ siteName }: { siteName: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);
  useEffect(() => setOpen(false), [pathname]);

  if (pathname?.startsWith('/admin')) return null;

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-[100] h-16 flex items-center justify-between px-6 md:px-12 transition-all duration-300 ${scrolled || open ? 'bg-dark/95 backdrop-blur-xl border-b border-gold/10' : 'bg-transparent'}`}>
        <div className="hidden lg:flex items-center gap-7">
          {links.map((l) => (
            <Link key={l.href} href={l.href}
              className={`font-sans text-[14px] font-medium tracking-wide transition-colors duration-300 ${pathname === l.href ? 'text-cream' : 'text-gold hover:text-cream'}`}>
              {l.label}
            </Link>
          ))}
        </div>
        <button className="lg:hidden text-gold" onClick={() => setOpen(!open)} aria-label="Menüyü aç">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
        <Link href="/" className="absolute left-1/2 -translate-x-1/2 font-heading text-lg md:text-xl font-semibold text-gold tracking-[0.12em] uppercase select-none whitespace-nowrap">
          {siteName}
        </Link>
        <Link href="/rezervasyon" className="hidden lg:block btn-gold !py-2.5 !px-6">Rezervasyon</Link>
      </nav>
      {open && (
        <div className="fixed inset-0 z-[99] bg-dark flex flex-col items-center justify-center gap-7 lg:hidden">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="font-heading text-2xl text-gold hover:text-cream transition-colors">{l.label}</Link>
          ))}
          <Link href="/rezervasyon" className="btn-gold mt-3">Rezervasyon</Link>
        </div>
      )}
    </>
  );
}
