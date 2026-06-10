export type SiteContent = { key: string; value: string; type: string; label: string; section: string };
export type SeoPage = { path: string; title: string; description: string; keywords: string; og_image: string };
export type MenuCategory = { id: string; name: string; slug: string; description: string; image_url: string; sort_order: number; is_active: boolean };
export type MenuItem = { id: string; category_id: string; name: string; description: string; price: number; is_active: boolean; is_featured: boolean; sort_order: number; menu_item_images?: MenuItemImage[] };
export type MenuItemImage = { id: string; item_id: string; url: string; sort_order: number };
export type GalleryItem = { id: string; type: 'image' | 'video'; url: string; title: string; sort_order: number; is_active: boolean };
export type Announcement = { id: string; title: string; slug: string; summary: string; content: string; image_url: string; event_date: string | null; is_published: boolean; is_pinned: boolean; created_at: string };
export type Reservation = { id: string; name: string; phone: string; date: string; time: string; guests: number; note: string; status: string; created_at: string };
