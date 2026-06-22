import type { Metadata, Viewport } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/site/Navbar';
import Footer from '@/components/site/Footer';
import { getContent } from '@/lib/content';
import { ldScript } from '@/lib/jsonld';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com'),
  title: { default: 'Le Balkon Lounge & Cafe | Aksaray', template: '%s' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48x48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#171614',
};

const cormorant = Cormorant_Garamond({ subsets: ['latin'], weight: ['400', '500', '600'], style: ['normal', 'italic'], variable: '--font-cormorant' });
const inter = Inter({ subsets: ['latin'], weight: ['400', '500'], variable: '--font-inter' });

export const revalidate = 60;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const c = await getContent();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://lebalkonaksaray.com';
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CafeOrCoffeeShop',
    name: c.site_name ?? 'Le Balkon Lounge & Cafe',
    url: base,
    telephone: c.phone,
    servesCuisine: ['Coffee', 'Desserts', 'Turkish'],
    address: { '@type': 'PostalAddress', streetAddress: c.address, addressLocality: 'Aksaray', addressCountry: 'TR' },
    sameAs: [c.instagram].filter(Boolean),
    openingHours: ['Mo-Fr 09:00-24:00', 'Sa-Su 09:00-01:00'],
    menu: `${base}/menu`,
    acceptsReservations: 'True',
  };
  return (
    <html lang="tr" className={`${cormorant.variable} ${inter.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldScript(jsonLd) }} />
        <Navbar siteName={c.site_name ?? 'LE BALKON'} />
        <main className="min-h-screen">{children}</main>
        <Footer content={c} />
      </body>
    </html>
  );
}
