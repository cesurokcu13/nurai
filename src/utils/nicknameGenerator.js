// Turkish Letter Palettes for Anonymous User Identity (Unique Initial Letters) - Optimized for Warm Light Theme
export const LETTER_PALETTES = [
  { letter: 'A', name: 'Akuamarin Deniz', hex: '#0D9488', bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
  { letter: 'B', name: 'Büyük Deniz', hex: '#0284C7', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  { letter: 'C', name: 'Cevher Mavi', hex: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  { letter: 'Ç', name: 'Çağlayan Işık', hex: '#0891B2', bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  { letter: 'D', name: 'Deniz Mavisi', hex: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  { letter: 'E', name: 'Erguvan Mor', hex: '#9333EA', bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
  { letter: 'F', name: 'Firuze Yeşil', hex: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
  { letter: 'G', name: 'Gümüş Gri', hex: '#64748B', bg: 'bg-stone-100', text: 'text-stone-800', border: 'border-stone-300' },
  { letter: 'H', name: 'Hazar Mavisi', hex: '#0284C7', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  { letter: 'I', name: 'Işık Sarı', hex: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { letter: 'İ', name: 'İnci Krem', hex: '#78716C', bg: 'bg-stone-50', text: 'text-stone-800', border: 'border-stone-200' },
  { letter: 'K', name: 'Kehribar Sarı', hex: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { letter: 'L', name: 'Lapis Lacivert', hex: '#4F46E5', bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  { letter: 'M', name: 'Mercan Turuncu', hex: '#EA580C', bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
  { letter: 'N', name: 'Nurlu Yeşil', hex: '#16A34A', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  { letter: 'O', name: 'Okyanus Mavi', hex: '#0284C7', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  { letter: 'Ö', name: 'Özlü Yeşil', hex: '#15803D', bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
  { letter: 'P', name: 'Papatya Pembe', hex: '#DB2777', bg: 'bg-pink-50', text: 'text-pink-800', border: 'border-pink-200' },
  { letter: 'R', name: 'Ruşen Sarı', hex: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { letter: 'S', name: 'Safir Mavi', hex: '#2563EB', bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
  { letter: 'Ş', name: 'Şeffaf Turkuaz', hex: '#0891B2', bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  { letter: 'T', name: 'Turkuaz Işık', hex: '#0891B2', bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  { letter: 'U', name: 'Ufuk Mavisi', hex: '#0284C7', bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  { letter: 'Ü', name: 'Ürgüp Sarısı', hex: '#D97706', bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  { letter: 'V', name: 'Vefalı Erguvan', hex: '#7C3AED', bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  { letter: 'Y', name: 'Yakut Kırmızı', hex: '#DC2626', bg: 'bg-rose-50', text: 'text-rose-800', border: 'border-rose-200' },
  { letter: 'Z', name: 'Zümrüt Yeşil', hex: '#059669', bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
];

export function sanitizeToLettersOnly(text = '') {
  return text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, '').trim();
}

export function getInitialLetter(nickname = '') {
  const clean = sanitizeToLettersOnly(nickname);
  if (!clean) return 'A';
  return clean.charAt(0).toUpperCase();
}

/**
 * Maps a list of logs/profiles so that every user ID receives a 100% UNIQUE initial letter.
 */
export function getGuaranteedUniqueLetterMap(logs = []) {
  const userLetterMap = {};
  const usedLetters = new Set();

  const userList = [];
  const seenUsers = new Set();

  logs.forEach((item) => {
    const userId = item.user_id || item.id;
    if (userId && !seenUsers.has(userId)) {
      seenUsers.add(userId);
      userList.push({
        userId,
        nickname: item.profiles?.color_nickname || item.color_nickname || 'Anonim'
      });
    }
  });

  userList.forEach((user) => {
    const rawLetter = getInitialLetter(user.nickname);

    if (!usedLetters.has(rawLetter)) {
      usedLetters.add(rawLetter);
      userLetterMap[user.userId] = rawLetter;
    } else {
      // Find unused letter from LETTER_PALETTES pool
      const available = LETTER_PALETTES.find((p) => !usedLetters.has(p.letter));
      const chosenLetter = available ? available.letter : rawLetter;
      usedLetters.add(chosenLetter);
      userLetterMap[user.userId] = chosenLetter;
    }
  });

  return userLetterMap;
}

export function generateRandomColorNickname(existingNicknames = []) {
  const usedLetters = new Set(existingNicknames.map((n) => getInitialLetter(n)));
  const availablePalettes = LETTER_PALETTES.filter((p) => !usedLetters.has(p.letter));

  const palette = availablePalettes.length > 0
    ? availablePalettes[Math.floor(Math.random() * availablePalettes.length)]
    : LETTER_PALETTES[Math.floor(Math.random() * LETTER_PALETTES.length)];

  return {
    nickname: palette.name,
    hex: palette.hex,
    palette
  };
}

export function getBadgeStyleForNickname(letterOrNickname = '') {
  const initial = letterOrNickname.length === 1
    ? letterOrNickname.toUpperCase()
    : getInitialLetter(letterOrNickname);

  const matched = LETTER_PALETTES.find((p) => p.letter === initial);
  if (matched) return matched;

  let hash = 0;
  for (let i = 0; i < letterOrNickname.length; i++) {
    hash = letterOrNickname.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % LETTER_PALETTES.length;
  return LETTER_PALETTES[index];
}
