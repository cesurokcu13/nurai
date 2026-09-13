import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Auto-load .env file if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.startsWith('"') && value.endsWith('"')) {
          value = value.substring(1, value.length - 1);
        }
        if (!process.env[key]) process.env[key] = value.trim();
      }
    });
  }
} catch (e) {}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Hata: Supabase bilgileri eksik.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const LETTER_PALETTES = [
  { letter: 'A', name: 'Akuamarin Deniz', hex: '#14B8A6' },
  { letter: 'B', name: 'Büyük Deniz', hex: '#0284C7' },
  { letter: 'C', name: 'Cevher Mavi', hex: '#2563EB' },
  { letter: 'Ç', name: 'Çağlayan Işık', hex: '#06B6D4' },
  { letter: 'D', name: 'Deniz Mavisi', hex: '#3B82F6' },
  { letter: 'E', name: 'Erguvan Mor', hex: '#A855F7' },
  { letter: 'F', name: 'Firuze Yeşil', hex: '#10B981' },
  { letter: 'G', name: 'Gümüş Beyaz', hex: '#94A3B8' },
  { letter: 'H', name: 'Hazar Mavisi', hex: '#0284C7' },
  { letter: 'I', name: 'Işık Sarı', hex: '#EAB308' },
  { letter: 'İ', name: 'İnci Beyaz', hex: '#F8FAFC' },
  { letter: 'K', name: 'Kehribar Sarı', hex: '#F59E0B' },
  { letter: 'L', name: 'Lapis Lacivert', hex: '#6366F1' },
  { letter: 'M', name: 'Mercan Turuncu', hex: '#F97316' },
  { letter: 'N', name: 'Nurlu Yeşil', hex: '#22C55E' },
  { letter: 'O', name: 'Okyanus Mavi', hex: '#0284C7' },
  { letter: 'Ö', name: 'Özlü Yeşil', hex: '#16A34A' },
  { letter: 'P', name: 'Parlak Pembe', hex: '#EC4899' },
  { letter: 'R', name: 'Ruşen Sarı', hex: '#EAB308' },
  { letter: 'S', name: 'Safir Mavi', hex: '#3B82F6' },
  { letter: 'Ş', name: 'Şeffaf Turkuaz', hex: '#06B6D4' },
  { letter: 'T', name: 'Turkuaz Işık', hex: '#06B6D4' },
  { letter: 'U', name: 'Ufuk Mavisi', hex: '#0284C7' },
  { letter: 'Ü', name: 'Ürgüp Sarısı', hex: '#F59E0B' },
  { letter: 'V', name: 'Vefalı Erguvan', hex: '#8B5CF6' },
  { letter: 'Y', name: 'Yakut Kırmızı', hex: '#EF4444' },
  { letter: 'Z', name: 'Zümrüt Yeşil', hex: '#10B981' },
];

function sanitizeToLettersOnly(text = '') {
  return text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, '').trim();
}

function getInitialLetter(nickname = '') {
  const clean = sanitizeToLettersOnly(nickname);
  if (!clean) return 'A';
  return clean.charAt(0).toUpperCase();
}

async function resolveCollisions() {
  console.log('=== Supabase Çakışmaları Düzeltiliyor ===\n');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, color_nickname, badge_color');

  if (error || !profiles) {
    console.error('Hata:', error);
    process.exit(1);
  }

  const usedLetters = new Set();
  const keepProfiles = [];
  const fixProfiles = [];

  profiles.forEach((profile) => {
    const letter = getInitialLetter(profile.color_nickname);
    if (!usedLetters.has(letter)) {
      usedLetters.add(letter);
      keepProfiles.push(profile);
    } else {
      fixProfiles.push(profile);
    }
  });

  console.log(`Korunan Profil Sayısı: ${keepProfiles.length}`);
  console.log(`Düzeltilecek Çakışan Profil Sayısı: ${fixProfiles.length}`);

  for (const profile of fixProfiles) {
    // Find unused palette
    const unusedPalettes = LETTER_PALETTES.filter((p) => !usedLetters.has(p.letter));
    if (unusedPalettes.length > 0) {
      const selected = unusedPalettes[0];
      usedLetters.add(selected.letter);

      console.log(`Profil [${profile.id.substring(0, 8)}] "${profile.color_nickname}" -> "${selected.name}" (${selected.letter}) olarak güncelleniyor...`);

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({
          color_nickname: selected.name,
          badge_color: selected.hex
        })
        .eq('id', profile.id);

      if (updateErr) {
        console.error('Güncelleme hatası:', updateErr);
      } else {
        console.log('✅ Başarıyla güncellendi!');
      }
    }
  }

  console.log('\n=== Çakışma Düzeltme İşlemi Tamamlandı ===');
}

resolveCollisions();
