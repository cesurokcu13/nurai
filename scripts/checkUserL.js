import fs from 'fs';
import path from 'path';

const { createClient } = await import('@supabase/supabase-js');

const envPath = path.resolve(process.cwd(), '.env');
const envFile = fs.readFileSync(envPath, 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) env[match[1]] = (match[2] || '').replace(/^["']|["']$/g, '').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: p } = await supabase.from('profiles').select('id, color_nickname, role').ilike('color_nickname', 'L%').single();
  const { data: logs } = await supabase.from('reading_logs').select('log_date, page_count').eq('user_id', p.id).order('log_date', { ascending: false });
  
  const total = logs.reduce((a, c) => a + c.page_count, 0);
  console.log(`Kullanıcı: ${p.color_nickname} (ID: ${p.id}, Role: ${p.role})`);
  console.log(`Toplam Okunan: ${total} sayfa (${logs.length} gün)`);
  console.log('Günlük Okumalar:');
  logs.forEach(l => console.log(`  - ${l.log_date}: ${l.page_count} sf`));
}

check();
