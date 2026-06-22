/** @type {import('next').NextConfig} */
const securityHeaders = [
  // HTTPS'i zorunlu kıl (tarayıcı bir daha http denemez)
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  // Siteyi başka sitelerin iframe'ine gömmeyi engelle (clickjacking koruması)
  { key: 'X-Frame-Options', value: 'DENY' },
  // MIME-type tahminini kapat
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Referrer bilgisini kıs
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  // Kullanılmayan tarayıcı izinlerini kapat
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
];

const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async headers() {
    return [
      { source: '/(.*)', headers: securityHeaders },
    ];
  },
};

export default nextConfig;
