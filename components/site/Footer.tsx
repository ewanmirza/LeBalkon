import Link from 'next/link';
import { Instagram, Phone, MapPin, Clock } from 'lucide-react';

export default function Footer({ content }: { content: Record<string, string> }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gold/10 bg-dark-2 mt-24">
      <div className="container-site py-14 grid gap-10 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl text-gold tracking-[0.1em] uppercase">{content.site_name ?? 'Le Balkon'}</p>
          <p className="mt-3 text-muted2 font-sans text-sm leading-relaxed">{content.footer_text}</p>
          {content.instagram && (
            <a href={content.instagram} target="_blank" rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-gold hover:text-cream font-sans text-sm transition-colors">
              <Instagram size={16} /> Instagram
            </a>
          )}
        </div>
        <div className="font-sans text-sm space-y-3">
          <p className="eyebrow mb-4">İletişim</p>
          <p className="flex items-center gap-2 text-cream/80"><Phone size={15} className="text-gold" /> {content.phone}</p>
          <p className="flex items-center gap-2 text-cream/80"><MapPin size={15} className="text-gold" /> {content.address}</p>
          <p className="flex items-center gap-2 text-cream/80"><Clock size={15} className="text-gold" /> Hafta içi {content.hours_week} · Hafta sonu {content.hours_weekend}</p>
        </div>
        <div className="font-sans text-sm">
          <p className="eyebrow mb-4">Sayfalar</p>
          <div className="grid grid-cols-2 gap-2">
            {[['Menü', '/menu'], ['Hakkımızda', '/hakkimizda'], ['Galeri', '/galeri'], ['Duyurular', '/duyurular'], ['İletişim', '/iletisim'], ['Rezervasyon', '/rezervasyon']].map(([t, h]) => (
              <Link key={h} href={h} className="text-cream/70 hover:text-gold transition-colors">{t}</Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-gold/10 py-5 text-center font-sans text-xs text-muted2">
        © {year} {content.site_name ?? 'Le Balkon Lounge & Cafe'} · Aksaray
      </div>
    </footer>
  );
}
