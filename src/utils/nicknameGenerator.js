// Turkish Letter Palettes for Anonymous User Identity (Unique Initial Letters)
export const LETTER_PALETTES = [
  { letter: 'A', name: 'Akuamarin Deniz', hex: '#14B8A6', bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/30' },
  { letter: 'B', name: 'Büyük Deniz', hex: '#0284C7', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  { letter: 'C', name: 'Cevher Mavi', hex: '#2563EB', bg: 'bg-blue-600/10', text: 'text-blue-400', border: 'border-blue-600/30' },
  { letter: 'Ç', name: 'Çağlayan Işık', hex: '#06B6D4', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { letter: 'D', name: 'Deniz Mavisi', hex: '#3B82F6', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { letter: 'E', name: 'Erguvan Mor', hex: '#A855F7', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  { letter: 'F', name: 'Firuze Yeşil', hex: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  { letter: 'G', name: 'Gümüş Beyaz', hex: '#94A3B8', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  { letter: 'H', name: 'Hazar Mavisi', hex: '#0284C7', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  { letter: 'I', name: 'Işık Sarı', hex: '#EAB308', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  { letter: 'İ', name: 'İnci Beyaz', hex: '#F8FAFC', bg: 'bg-slate-200/10', text: 'text-slate-200', border: 'border-slate-300/30' },
  { letter: 'K', name: 'Kehribar Sarı', hex: '#F59E0B', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  { letter: 'L', name: 'Lapis Lacivert', hex: '#6366F1', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  { letter: 'M', name: 'Mercan Turuncu', hex: '#F97316', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  { letter: 'N', name: 'Nurlu Yeşil', hex: '#22C55E', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/30' },
  { letter: 'O', name: 'Okyanus Mavi', hex: '#0284C7', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  { letter: 'Ö', name: 'Özlü Yeşil', hex: '#16A34A', bg: 'bg-green-600/10', text: 'text-green-400', border: 'border-green-600/30' },
  { letter: 'P', name: 'Parlak Pembe', hex: '#EC4899', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/30' },
  { letter: 'R', name: 'Ruşen Sarı', hex: '#EAB308', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  { letter: 'S', name: 'Safir Mavi', hex: '#3B82F6', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  { letter: 'Ş', name: 'Şeffaf Turkuaz', hex: '#06B6D4', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { letter: 'T', name: 'Turkuaz Işık', hex: '#06B6D4', bg: 'bg-cyan-500/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
  { letter: 'U', name: 'Ufuk Mavisi', hex: '#0284C7', bg: 'bg-sky-500/10', text: 'text-sky-400', border: 'border-sky-500/30' },
  { letter: 'Ü', name: 'Ürgüp Sarısı', hex: '#F59E0B', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  { letter: 'V', name: 'Vefalı Erguvan', hex: '#8B5CF6', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/30' },
  { letter: 'Y', name: 'Yakut Kırmızı', hex: '#EF4444', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  { letter: 'Z', name: 'Zümrüt Yeşil', hex: '#10B981', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
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
