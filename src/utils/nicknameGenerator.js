// Turkish Color Palettes for Anonymous User Identity (Pure Letters Only)
const COLOR_PALETTES = [
  { name: 'Zümrüt Yeşil', hex: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { name: 'Safir Mavi', hex: '#3B82F6', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { name: 'Yakut Kırmızı', hex: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  { name: 'Kehribar Sarı', hex: '#F59E0B', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  { name: 'Turkuaz Işık', hex: '#06B6D4', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { name: 'Erguvan Mor', hex: '#A855F7', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { name: 'Mercan Turuncu', hex: '#F97316', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  { name: 'Sedef Pembe', hex: '#EC4899', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  { name: 'Lapis Lacivert', hex: '#6366F1', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { name: 'Zeytin Yeşil', hex: '#84CC16', bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30' },
  { name: 'Akuamarin Deniz', hex: '#14B8A6', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  { name: 'Menekşe Mor', hex: '#8B5CF6', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
];

const ADJECTIVES = [
  'Nurlu', 'Halis', 'Müstakim', 'Münir', 'Safi', 
  'Latif', 'Aziz', 'Parlak', 'Ruşen', 'Feyizli', 
  'Samimi', 'Bereketi', 'Sebatlı', 'Gayretli', 'Sadık'
];

/**
 * Generates a random Turkish color nickname consisting STRICTLY OF LETTERS ONLY (no numbers, no hashes).
 * E.g., "Nurlu Zümrüt Yeşil", "Halis Safir Mavi", "Latif Yakut Kırmızı"
 */
export function generateRandomColorNickname() {
  const palette = COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  
  // Pure letter nickname without any numbers or hash symbols
  const nickname = `${adjective} ${palette.name}`;
  return {
    nickname,
    hex: palette.hex,
    palette
  };
}

/**
 * Returns consistent Tailwind style classes for a given letter nickname
 */
export function getBadgeStyleForNickname(nickname = '') {
  if (!nickname) return COLOR_PALETTES[0];
  
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) {
    hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTES.length;
  return COLOR_PALETTES[index];
}
