// Mongolian tögrög formatting used everywhere a price is displayed:
// 4000000 -> "4,000,000₮"
export function formatMNT(value) {
  const num = Number(value) || 0;
  return `${num.toLocaleString('en-US')}₮`;
}

export const CATEGORY_LABELS = {
  account: 'Аккаунт',
  topup: 'Цэнэглэлт',
  rental: 'Түрээс',
};

export const SELLER_TYPE_LABELS = {
  all: 'Бүгд',
  admin: 'Админ аккаунт',
  user: 'Хэрэглэгчийн аккаунт',
};

export const GAME_LABELS = {
  pubg: 'PUBG Mobile',
  mlbb: 'MLBB',
  cs2: 'CS2',
};

export const WEAR_CONDITIONS = ['Factory New', 'Minimal Wear', 'Field-Tested', 'Well-Worn', 'Battle-Scarred'];

// CS2 storefront sub-nav — replaces Аккаунт/Цэнэглэлт/Түрээс when the CS2
// game filter is active, grouping listings by weapon/item type instead.
export const CS2_ITEM_TYPE_LABELS = {
  knife_glove: 'Хутга & Бээлий',
  rifle_pistol: 'Буунууд',
  agent_other: 'Агент & Бусад',
};

// Compact codes for the product card (full name is shown in the modal).
export const WEAR_SHORT_LABELS = {
  'Factory New': 'FN',
  'Minimal Wear': 'MW',
  'Field-Tested': 'FT',
  'Well-Worn': 'WW',
  'Battle-Scarred': 'BS',
};

export const STATTRAK_LABELS = {
  stattrak: 'StatTrak™',
  souvenir: 'Souvenir',
};

// CS2 community colors for the StatTrak/Souvenir pill — orange and gold
// are the actual in-game rarity colors, so a CS2 shopper recognizes them
// instantly instead of guessing from generic brand colors.
export const STATTRAK_STYLES = {
  stattrak: 'bg-[#cf6a32]/15 text-[#e8813f]',
  souvenir: 'bg-[#ffd700]/15 text-[#d4af37]',
};

// 0.035 -> "0.0350" — CS2 floats are conventionally shown to 4 decimals.
export function formatFloat(value) {
  return Number(value).toFixed(4);
}
