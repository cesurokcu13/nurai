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

function sanitizeToLettersOnly(text = '') {
  return text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, '').trim();
}

function getInitialLetter(nickname = '') {
  const clean = sanitizeToLettersOnly(nickname);
  if (!clean) return 'A';
  return clean.charAt(0).toUpperCase();
}

async function checkCollisions() {
  console.log('=== Supabase Veritabanı Kullanıcı Baş Harf Çakışma Kontrolü ===\n');

  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, color_nickname, badge_color, created_at');

  if (error) {
    console.error('Profil verileri çekilirken hata oluştu:', error);
    process.exit(1);
  }

  console.log(`Veritabanındaki Toplam Kullanıcı Sayısı: ${profiles ? profiles.length : 0}`);

  if (!profiles || profiles.length === 0) {
    console.log('Veritabanında henüz kayıtlı kullanıcı bulunmuyor.');
    return;
  }

  const letterMap = {};
  const collisions = [];

  profiles.forEach((profile) => {
    const letter = getInitialLetter(profile.color_nickname);
    if (!letterMap[letter]) {
      letterMap[letter] = [];
    }
    letterMap[letter].push(profile);
  });

  Object.entries(letterMap).forEach(([letter, userList]) => {
    if (userList.length > 1) {
      collisions.push({ letter, count: userList.length, users: userList });
    }
  });

  console.log('\n--- KULLANICI BAŞ HARF DAĞILIMI ---');
  Object.entries(letterMap).forEach(([letter, userList]) => {
    console.log(`• Baş Harf '${letter}': ${userList.length} kullanıcı (${userList.map(u => u.color_nickname).join(', ')})`);
  });

  console.log('\n-----------------------------------');
  if (collisions.length === 0) {
    console.log('✅ SONUÇ: HİÇBİR ÇAKIŞMA YOK! Tüm kullanıcıların baş harfleri %100 benzersizdir.');
  } else {
    console.log(`⚠️ ÇAKIŞMA TESPİT EDİLDİ: ${collisions.length} farklı baş harfte mükerrer kullanım var:`);
    collisions.forEach((c) => {
      console.log(`   - '${c.letter}' harfini ${c.count} kişi kullanıyor: ${c.users.map(u => u.color_nickname).join(', ')}`);
    });
  }
  console.log('-----------------------------------\n');
}

checkCollisions();
