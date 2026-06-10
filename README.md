# Le Balkon Lounge & Cafe — Web Sitesi

Next.js 14 + Supabase + Vercel. Çok sayfalı site + kapsamlı yönetim paneli.

## Sayfalar
- `/` anasayfa (hero, öne çıkan menü, duyuru bandı, galeri önizleme)
- `/menu` kategorili menü (JSON-LD Menu şeması ile)
- `/hakkimizda`, `/galeri` (foto+video), `/duyurular` + detay (Event şeması), `/iletisim`, `/rezervasyon`
- `/admin` yönetim paneli (Supabase Auth ile korumalı)

## Admin paneli neler yapabilir?
- **Site İçeriği**: tüm metinler, hero görseli/videosu, hakkımızda görseli, iletişim bilgileri, harita
- **Menü**: kategori ekle/sil/sırala/gizle, ürün ekle/sil, fiyat, açıklama, ürün başına **birden fazla fotoğraf**, öne çıkarma
- **Galeri**: fotoğraf + video yükle, sırala, gizle
- **Duyurular**: canlı müzik etkinliği (tarih-saatli), yayınla/taslak, anasayfaya sabitleme (altın bant)
- **Rezervasyonlar**: gelen talepleri gör, onayla/iptal et, tek dokunuşla ara
- **SEO**: sayfa bazlı başlık/açıklama/anahtar kelime/OG görseli (karakter sayacıyla)
- **Ayarlar**: admin şifresi değiştirme

## Kurulum (1 kez)
1. **Supabase**: yeni proje aç → SQL Editor → `supabase/schema.sql` içeriğini yapıştır, çalıştır.
2. **Admin kullanıcısı**: Supabase → Authentication → Users → "Add user" → e-posta + şifre gir ("Auto confirm" işaretle).
3. **Yerel/.env**: `.env.local.example` → `.env.local` kopyala, Supabase Project URL + anon key gir.
4. **Vercel**: repo'yu import et → Environment Variables'a aynı 3 değişkeni ekle → Deploy.
   - `NEXT_PUBLIC_SITE_URL` = gerçek alan adınız (sitemap/canonical için önemli).
5. Google Search Console'a alan adını ekleyip `https://alanadi.com/sitemap.xml` gönder.

## Notlar
- İçerik değişiklikleri 60 sn'lik ISR cache nedeniyle en geç 1 dk içinde yayına yansır.
- Fotoğraflar Supabase Storage `media` bucket'ında tutulur (panel otomatik yükler).
- Google Maps embed: Maps'te mekânı aç → Paylaş → "Harita yerleştir" → iframe içindeki `src` URL'sini panele yapıştır.
