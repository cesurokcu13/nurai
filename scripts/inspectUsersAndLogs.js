import fs from 'fs';
import path from 'path';
import WebSocket from 'ws';

globalThis.WebSocket ??= WebSocket;
const { createClient } = await import('@supabase/supabase-js');

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

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function inspect() {
  console.log('=== VERİTABANI KULLANICI & OKUMA KAYDI İNCELEMESİ ===\n');

  const { data: profiles } = await supabase.from('profiles').select('id, color_nickname');
  const { data: logs } = await supabase.from('reading_logs').select('user_id, log_date, page_count');

  console.log(`- Profiles (Kayıtlı Kullanıcı) Sayısı: ${profiles ? profiles.length : 0}`);
  
  const loggedUsersSet = new Set((logs || []).map(l => l.user_id));
  console.log(`- Reading Logs (Okuma Kaydı Girmiş Aktif Kullanıcı) Sayısı: ${loggedUsersSet.size}`);

  console.log('\nProfil Listesi:');
  profiles?.forEach(p => {
    const hasLogged = loggedUsersSet.has(p.id);
    console.log(`  • [${p.id.substring(0, 8)}] ${p.color_nickname} -> ${hasLogged ? '✅ Okuma kaydı var' : '❌ Henüz okuma kaydı girmemiş'}`);
  });
}

inspect();
