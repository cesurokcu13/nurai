// 30 Kur'an-ı Kerim Cüzü - Detaylı Bilgiler (Sayfa ve Sure Aralıkları)
export const QURAN_JUZ_LIST = [
  { number: 1, pageRange: '1 - 20', surahRange: 'Fâtiha 1 - Bakara 141', name: '1. Cüz' },
  { number: 2, pageRange: '21 - 40', surahRange: 'Bakara 142 - Bakara 252', name: '2. Cüz' },
  { number: 3, pageRange: '41 - 60', surahRange: 'Bakara 253 - Âl-i İmrân 92', name: '3. Cüz' },
  { number: 4, pageRange: '61 - 80', surahRange: 'Âl-i İmrân 93 - Nisâ 23', name: '4. Cüz' },
  { number: 5, pageRange: '81 - 100', surahRange: 'Nisâ 24 - Nisâ 147', name: '5. Cüz' },
  { number: 6, pageRange: '101 - 120', surahRange: 'Nisâ 148 - Mâide 81', name: '6. Cüz' },
  { number: 7, pageRange: '121 - 140', surahRange: 'Mâide 82 - En\'âm 110', name: '7. Cüz' },
  { number: 8, pageRange: '141 - 160', surahRange: 'En\'âm 111 - A\'râf 87', name: '8. Cüz' },
  { number: 9, pageRange: '161 - 180', surahRange: 'A\'râf 88 - Enfâl 40', name: '9. Cüz' },
  { number: 10, pageRange: '181 - 200', surahRange: 'Enfâl 41 - Tevbe 92', name: '10. Cüz' },
  { number: 11, pageRange: '201 - 220', surahRange: 'Tevbe 93 - Hûd 5', name: '11. Cüz' },
  { number: 12, pageRange: '221 - 240', surahRange: 'Hûd 6 - Yûsuf 52', name: '12. Cüz' },
  { number: 13, pageRange: '241 - 260', surahRange: 'Yûsuf 53 - İbrâhîm 52', name: '13. Cüz' },
  { number: 14, pageRange: '261 - 280', surahRange: 'Hicr 1 - Nahl 128', name: '14. Cüz' },
  { number: 15, pageRange: '281 - 300', surahRange: 'İsrâ 1 - Kehf 74', name: '15. Cüz' },
  { number: 16, pageRange: '301 - 320', surahRange: 'Kehf 75 - Tâhâ 135', name: '16. Cüz' },
  { number: 17, pageRange: '321 - 340', surahRange: 'Enbiyâ 1 - Hac 78', name: '17. Cüz' },
  { number: 18, pageRange: '341 - 360', surahRange: 'Mü\'minûn 1 - Furkân 20', name: '18. Cüz' },
  { number: 19, pageRange: '361 - 380', surahRange: 'Furkân 21 - Neml 55', name: '19. Cüz' },
  { number: 20, pageRange: '381 - 400', surahRange: 'Neml 56 - Ankebût 45', name: '20. Cüz' },
  { number: 21, pageRange: '401 - 420', surahRange: 'Ankebût 46 - Ahzâb 30', name: '21. Cüz' },
  { number: 22, pageRange: '421 - 440', surahRange: 'Ahzâb 31 - Yâsîn 27', name: '22. Cüz' },
  { number: 23, pageRange: '441 - 460', surahRange: 'Yâsîn 28 - Zümer 31', name: '23. Cüz' },
  { number: 24, pageRange: '461 - 480', surahRange: 'Zümer 32 - Fussilet 46', name: '24. Cüz' },
  { number: 25, pageRange: '481 - 500', surahRange: 'Fussilet 47 - Câsiye 37', name: '25. Cüz' },
  { number: 26, pageRange: '501 - 520', surahRange: 'Ahkâf 1 - Zâriyât 30', name: '26. Cüz' },
  { number: 27, pageRange: '521 - 540', surahRange: 'Zâriyât 31 - Hadîd 29', name: '27. Cüz' },
  { number: 28, pageRange: '541 - 560', surahRange: 'Mücâdele 1 - Tahrîm 12', name: '28. Cüz' },
  { number: 29, pageRange: '561 - 580', surahRange: 'Mülk 1 - Mürselât 50', name: '29. Cüz' },
  { number: 30, pageRange: '581 - 604', surahRange: 'Nebe 1 - Nâs 6', name: '30. Cüz' },
];

/**
 * Returns info for a specific Juz number (1-30)
 */
export function getJuzInfo(juzNumber) {
  const num = Number(juzNumber);
  return QURAN_JUZ_LIST.find((j) => j.number === num) || {
    number: num,
    pageRange: '',
    surahRange: '',
    name: `${num}. Cüz`
  };
}

/**
 * Calculate user's personal Hatim level, completed full hatims, and progress metrics.
 * @param {Array<number>} readJuzNumbers - Array of juz numbers the user has read (may contain duplicates across rounds)
 */
export function calculatePersonalHatimStats(readJuzNumbers = []) {
  const totalCount = readJuzNumbers.length;
  const uniqueNumbers = Array.from(new Set(readJuzNumbers));
  const uniqueCount = uniqueNumbers.length;

  // Number of full hatims (each 30 distinct juz or every 30 juz read)
  const fullHatimsCount = Math.floor(totalCount / 30);
  const currentRoundProgress = totalCount % 30;
  const uniquePercent = Math.min(100, Math.round((uniqueCount / 30) * 100));

  // Determine stage and badge title
  let levelTitle = 'Cüz Talebesi';
  let levelDescription = 'Hatim yolculuğuna yeni başladı.';
  let levelColor = 'text-amber-700 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800';

  if (totalCount >= 90) {
    levelTitle = 'Hâtimü\'l-Kur\'ân (3+ Hatim)';
    levelDescription = 'Mübarek hatim deryasında derinleşti.';
    levelColor = 'text-purple-700 bg-purple-50 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800';
  } else if (totalCount >= 60) {
    levelTitle = 'İki Hatim Sahibi';
    levelDescription = 'İki tam hatmi tamamladı, 3. hatim yolunda.';
    levelColor = 'text-indigo-700 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800';
  } else if (totalCount >= 30) {
    levelTitle = 'Hatim Sahibi 🌟';
    levelDescription = 'Tebrikler! 1 tam Kur\'an hatmini tamamladı.';
    levelColor = 'text-emerald-700 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  } else if (uniqueCount >= 23) {
    levelTitle = 'Üç Çeyrek Hatim (%75+)';
    levelDescription = 'Hatmin son çeyreğine ulaştı, hedefe çok yakın!';
    levelColor = 'text-teal-700 bg-teal-50 border-teal-200 dark:bg-teal-950/40 dark:text-teal-300 dark:border-teal-800';
  } else if (uniqueCount >= 15) {
    levelTitle = 'Yarım Hatim (%50+)';
    levelDescription = 'Kur\'an-ı Kerim\'in yarısını tamamladı.';
    levelColor = 'text-cyan-700 bg-cyan-50 border-cyan-200 dark:bg-cyan-950/40 dark:text-cyan-300 dark:border-cyan-800';
  } else if (uniqueCount >= 8) {
    levelTitle = 'Çeyrek Hatim (%25+)';
    levelDescription = 'İlk çeyreği aştı, istikrarla ilerliyor.';
    levelColor = 'text-blue-700 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800';
  } else if (uniqueCount >= 1) {
    levelTitle = 'Nurlu Başlangıç';
    levelDescription = 'İlk cüzlerini okudu, bereketli adımlar atıyor.';
    levelColor = 'text-sage-700 bg-sage-50 border-sage-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800';
  }

  // Which numbers from 1 to 30 are missing for a full 30-juz unique cycle?
  const missingJuzNumbers = [];
  for (let i = 1; i <= 30; i++) {
    if (!uniqueNumbers.includes(i)) {
      missingJuzNumbers.push(i);
    }
  }

  return {
    totalCount,
    uniqueCount,
    uniqueNumbers,
    missingJuzNumbers,
    fullHatimsCount,
    currentRoundProgress,
    uniquePercent,
    levelTitle,
    levelDescription,
    levelColor
  };
}
