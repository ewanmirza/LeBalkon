import { getContent, getSeo } from '@/lib/content';
import SectionHeader from '@/components/site/SectionHeader';
import { Phone, MapPin, Clock, Instagram } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;
export async function generateMetadata(): Promise<Metadata> { return getSeo('/iletisim'); }

export default async function ContactPage() {
  const c = await getContent();
  return (
    <div className="container-site pt-32">
      <SectionHeader eyebrow="Bize Ulaşın" title="İletişim & Konum" />
      <div className="grid gap-10 md:grid-cols-2 max-w-5xl mx-auto">
        <div className="space-y-5 font-sans">
          <a href={`tel:${(c.phone ?? '').replace(/\s/g, '')}`} className="flex items-start gap-4 bg-dark-2 border border-gold/10 rounded-2xl p-6 hover:border-gold/40 transition-colors">
            <Phone className="text-gold mt-0.5" size={20} />
            <div><p className="eyebrow !text-[10px] mb-1">Telefon</p><p className="text-cream text-lg">{c.phone}</p></div>
          </a>
          <div className="flex items-start gap-4 bg-dark-2 border border-gold/10 rounded-2xl p-6">
            <MapPin className="text-gold mt-0.5" size={20} />
            <div><p className="eyebrow !text-[10px] mb-1">Adres</p><p className="text-cream text-lg">{c.address}</p></div>
          </div>
          <div className="flex items-start gap-4 bg-dark-2 border border-gold/10 rounded-2xl p-6">
            <Clock className="text-gold mt-0.5" size={20} />
            <div>
              <p className="eyebrow !text-[10px] mb-1">Çalışma Saatleri</p>
              <p className="text-cream">Hafta içi: {c.hours_week}</p>
              <p className="text-cream">Hafta sonu: {c.hours_weekend}</p>
            </div>
          </div>
          {c.instagram && (
            <a href={c.instagram} target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 bg-dark-2 border border-gold/10 rounded-2xl p-6 hover:border-gold/40 transition-colors">
              <Instagram className="text-gold mt-0.5" size={20} />
              <div><p className="eyebrow !text-[10px] mb-1">Instagram</p><p className="text-cream text-lg">@lebalkonaksaray</p></div>
            </a>
          )}
        </div>
        <div className="rounded-2xl overflow-hidden border border-gold/10 min-h-[420px] bg-dark-2">
          {c.map_embed
            ? <iframe src={c.map_embed} className="w-full h-full min-h-[420px]" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Le Balkon Konum" />
            : <div className="w-full h-full min-h-[420px] flex items-center justify-center text-muted2 font-sans text-sm px-8 text-center">Harita, admin panelindeki "Google Maps Embed URL" alanı doldurulunca görünecek.</div>}
        </div>
      </div>
    </div>
  );
}
