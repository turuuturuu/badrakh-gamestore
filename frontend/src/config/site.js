// Store-wide contact links. Override via VITE_FACEBOOK_PAGE_URL /
// VITE_MESSENGER_URL in frontend/.env once the real Page + Messenger
// links are known — see .env.example.
export const FACEBOOK_PAGE_URL =
  import.meta.env.VITE_FACEBOOK_PAGE_URL || 'https://www.facebook.com/profile.php?id=100071548254555';

// The "Худалдаж авах" / "Түрээслэх" / "Цэнэглэх" button on every product
// always opens this — the store's own Messenger chat — regardless of
// which product/seller it is. ProductModal appends a `?text=` param with
// an auto-filled message built from that specific product, so the buyer
// lands in Messenger with the composer already written for them.
export const OFFICIAL_MESSENGER_URL = import.meta.env.VITE_MESSENGER_URL || 'https://m.me/enhm.nh.b.128561';
