-- =============================================================
-- LE BALKON LOUNGE & CAFE — Supabase Şeması
-- Supabase Dashboard > SQL Editor'de tek seferde çalıştırın.
-- =============================================================

-- 1) SİTE İÇERİĞİ (tüm metin / fotoğraf / video alanları key-value)
create table if not exists site_content (
  key text primary key,
  value text not null default '',
  type text not null default 'text', -- text | longtext | image | video | url
  label text not null default '',
  section text not null default 'genel',
  updated_at timestamptz default now()
);

-- 2) SAYFA BAZLI SEO
create table if not exists seo_pages (
  path text primary key,           -- '/', '/menu', '/galeri' ...
  title text not null,
  description text not null default '',
  keywords text not null default '',
  og_image text not null default '',
  updated_at timestamptz default now()
);

-- 3) MENÜ
create table if not exists menu_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text default '',
  image_url text default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

create table if not exists menu_items (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references menu_categories(id) on delete cascade,
  name text not null,
  description text default '',
  price numeric(10,2) not null default 0,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz default now()
);

create table if not exists menu_item_images (
  id uuid primary key default gen_random_uuid(),
  item_id uuid not null references menu_items(id) on delete cascade,
  url text not null,
  sort_order int not null default 0
);

-- 4) GALERİ (fotoğraf + video)
create table if not exists gallery_items (
  id uuid primary key default gen_random_uuid(),
  type text not null default 'image', -- image | video
  url text not null,
  title text default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now()
);

-- 5) DUYURULAR / ETKİNLİKLER (canlı müzik vb.)
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  summary text default '',
  content text default '',
  image_url text default '',
  event_date timestamptz,          -- canlı müzik tarihi; boşsa genel duyuru
  is_published boolean not null default false,
  is_pinned boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 6) REZERVASYONLAR
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  date date not null,
  time text not null,
  guests int not null default 2,
  note text default '',
  status text not null default 'yeni', -- yeni | onaylandi | iptal
  created_at timestamptz default now()
);

-- =============================================================
-- RLS: herkese yayınlanmış içerik okuma, sadece giriş yapan admin yazma
-- =============================================================
alter table site_content enable row level security;
alter table seo_pages enable row level security;
alter table menu_categories enable row level security;
alter table menu_items enable row level security;
alter table menu_item_images enable row level security;
alter table gallery_items enable row level security;
alter table announcements enable row level security;
alter table reservations enable row level security;

create policy "public read content" on site_content for select using (true);
create policy "public read seo" on seo_pages for select using (true);
create policy "public read categories" on menu_categories for select using (true);
create policy "public read items" on menu_items for select using (true);
create policy "public read item images" on menu_item_images for select using (true);
create policy "public read gallery" on gallery_items for select using (true);
create policy "public read announcements" on announcements for select using (is_published = true);
create policy "public insert reservations" on reservations for insert with check (true);

create policy "auth all content" on site_content for all using (auth.role() = 'authenticated');
create policy "auth all seo" on seo_pages for all using (auth.role() = 'authenticated');
create policy "auth all categories" on menu_categories for all using (auth.role() = 'authenticated');
create policy "auth all items" on menu_items for all using (auth.role() = 'authenticated');
create policy "auth all item images" on menu_item_images for all using (auth.role() = 'authenticated');
create policy "auth all gallery" on gallery_items for all using (auth.role() = 'authenticated');
create policy "auth all announcements" on announcements for all using (auth.role() = 'authenticated');
create policy "auth all reservations" on reservations for all using (auth.role() = 'authenticated');

-- =============================================================
-- STORAGE: "media" bucket (public)
-- =============================================================
insert into storage.buckets (id, name, public) values ('media', 'media', true)
on conflict (id) do nothing;

create policy "public read media" on storage.objects for select using (bucket_id = 'media');
create policy "auth upload media" on storage.objects for insert with check (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "auth update media" on storage.objects for update using (bucket_id = 'media' and auth.role() = 'authenticated');
create policy "auth delete media" on storage.objects for delete using (bucket_id = 'media' and auth.role() = 'authenticated');

-- =============================================================
-- BAŞLANGIÇ VERİSİ
-- =============================================================
insert into site_content (key, value, type, label, section) values
('site_name', 'Le Balkon Lounge & Cafe', 'text', 'Site Adı', 'genel'),
('site_tagline', 'Aksaray''ın balkonunda kahve, lezzet ve müzik', 'text', 'Slogan', 'genel'),
('hero_title', 'Şehrin Üzerinde Bir Mola', 'text', 'Hero Başlık', 'anasayfa'),
('hero_subtitle', 'Özenle hazırlanan kahveler, zengin menü ve canlı müzik eşliğinde Aksaray''ın en keyifli balkonu.', 'longtext', 'Hero Alt Metin', 'anasayfa'),
('hero_image', '', 'image', 'Hero Görseli', 'anasayfa'),
('hero_video', '', 'video', 'Hero Video (opsiyonel)', 'anasayfa'),
('about_title', 'Hikâyemiz', 'text', 'Hakkımızda Başlık', 'hakkimizda'),
('about_text', 'Le Balkon, Aksaray''ın kalbinde dostlarınızla buluşabileceğiniz, kahvenin ve sohbetin tadını çıkarabileceğiniz bir yaşam alanıdır. Taze çekilmiş kahvelerimiz, el yapımı tatlılarımız ve sıcak atmosferimizle her ziyaretinizi özel kılmayı amaçlıyoruz.', 'longtext', 'Hakkımızda Metni', 'hakkimizda'),
('about_image', '', 'image', 'Hakkımızda Görseli', 'hakkimizda'),
('phone', '+90 5XX XXX XX XX', 'text', 'Telefon', 'iletisim'),
('address', 'Aksaray Merkez, Aksaray', 'text', 'Adres', 'iletisim'),
('map_embed', '', 'longtext', 'Google Maps Embed URL', 'iletisim'),
('hours_week', '09:00 – 24:00', 'text', 'Hafta İçi Saatler', 'iletisim'),
('hours_weekend', '09:00 – 01:00', 'text', 'Hafta Sonu Saatler', 'iletisim'),
('instagram', 'https://www.instagram.com/lebalkonaksaray', 'url', 'Instagram', 'sosyal'),
('whatsapp', '', 'url', 'WhatsApp Linki', 'sosyal'),
('footer_text', 'Aksaray''ın balkonunda buluşalım.', 'text', 'Footer Metni', 'genel')
on conflict (key) do nothing;

insert into seo_pages (path, title, description, keywords) values
('/', 'Le Balkon Lounge & Cafe | Aksaray Cafe, Nargile ve Canlı Müzik', 'Aksaray''ın en keyifli cafe & lounge mekânı. Özel kahveler, zengin menü, nargile ve canlı müzik geceleri. Rezervasyon için hemen arayın.', 'aksaray cafe, aksaray lounge, aksaray nargile, aksaray canlı müzik, le balkon'),
('/menu', 'Menü | Le Balkon Lounge & Cafe Aksaray', 'Le Balkon menüsü: sıcak ve soğuk kahveler, serinletici içecekler, tatlılar, atıştırmalıklar ve nargile çeşitleri. Güncel fiyatlarla.', 'aksaray cafe menü, le balkon menü, aksaray kahve fiyatları'),
('/hakkimizda', 'Hakkımızda | Le Balkon Lounge & Cafe Aksaray', 'Le Balkon''un hikâyesi: Aksaray''ın kalbinde kahve, lezzet ve müziğin buluştuğu yaşam alanı.', 'le balkon aksaray, aksaray cafe hakkında'),
('/galeri', 'Galeri | Le Balkon Lounge & Cafe Aksaray', 'Le Balkon''dan kareler: mekânımız, lezzetlerimiz ve canlı müzik gecelerimizden fotoğraf ve videolar.', 'le balkon galeri, aksaray cafe fotoğrafları'),
('/duyurular', 'Duyurular & Etkinlikler | Le Balkon Aksaray', 'Canlı müzik geceleri, özel etkinlikler ve kampanyalar. Le Balkon''daki tüm güncel duyurular.', 'aksaray canlı müzik, aksaray etkinlik, le balkon duyurular'),
('/iletisim', 'İletişim & Konum | Le Balkon Lounge & Cafe Aksaray', 'Le Balkon adres, telefon ve çalışma saatleri. Aksaray merkezde, sizi bekliyoruz.', 'le balkon iletişim, aksaray cafe adres'),
('/rezervasyon', 'Rezervasyon | Le Balkon Lounge & Cafe Aksaray', 'Le Balkon''da masanızı şimdiden ayırtın. Online rezervasyon formu ile hızlı ve kolay rezervasyon.', 'aksaray cafe rezervasyon, le balkon rezervasyon')
on conflict (path) do nothing;

-- Örnek menü (panelden tamamen düzenlenebilir)
with cats as (
  insert into menu_categories (name, slug, description, sort_order) values
  ('Sıcak Kahveler', 'sicak-kahveler', 'Taze çekilmiş çekirdeklerle', 1),
  ('Soğuk Kahveler', 'soguk-kahveler', 'Buz gibi serinlik', 2),
  ('Serinletici İçecekler', 'serinletici-icecekler', 'Limonatalar, frozenlar, milkshakeler', 3),
  ('Çaylar & Bitki Çayları', 'caylar', 'Demleme çaylar', 4),
  ('Tatlılar', 'tatlilar', 'El yapımı tatlılar', 5),
  ('Atıştırmalıklar', 'atistirmaliklar', 'Tostlar, sandviçler, tabaklar', 6),
  ('Nargile', 'nargile', 'Özel harman aromalar', 7)
  returning id, slug
)
insert into menu_items (category_id, name, description, price, is_featured, sort_order)
select id, x.name, x.description, x.price, x.featured, x.ord from cats
join lateral (values
  ('sicak-kahveler', 'Espresso', 'Yoğun aromalı tek shot', 70.00, false, 1),
  ('sicak-kahveler', 'Latte', 'İpeksi süt köpüğüyle', 110.00, true, 2),
  ('sicak-kahveler', 'Türk Kahvesi', 'Közde, geleneksel sunum', 80.00, true, 3),
  ('soguk-kahveler', 'Iced Latte', 'Bol buzlu, ferahlatıcı', 120.00, true, 1),
  ('soguk-kahveler', 'Iced Caramel Macchiato', 'Karamel sosuyla', 140.00, false, 2),
  ('serinletici-icecekler', 'Ev Yapımı Limonata', 'Taze sıkım, naneli', 90.00, true, 1),
  ('caylar', 'Demleme Çay', 'Geleneksel tavşan kanı', 40.00, false, 1),
  ('tatlilar', 'San Sebastian Cheesecake', 'Akışkan merkezli', 160.00, true, 1),
  ('atistirmaliklar', 'Karışık Tost', 'Kaşar, sucuk, közlenmiş', 130.00, false, 1),
  ('nargile', 'Le Balkon Special', 'Mekâna özel harman', 350.00, true, 1)
) as x(slug, name, description, price, featured, ord) on x.slug = cats.slug;

insert into announcements (title, slug, summary, content, event_date, is_published, is_pinned) values
('Cuma Akşamı Canlı Müzik', 'cuma-aksami-canli-muzik',
 'Bu cuma 21:00''de canlı müzik gecemize bekliyoruz.',
 'Bu cuma akşamı saat 21:00''de canlı müzik performansıyla Le Balkon''dayız. Masanızı şimdiden ayırtmayı unutmayın; yerlerimiz sınırlıdır. Rezervasyon için bizi arayabilir veya sitemizdeki rezervasyon formunu kullanabilirsiniz.',
 now() + interval '3 days', true, true);
