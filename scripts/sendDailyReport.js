import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

// Auto-load .env file if present
try {
  const envPath = path.resolve(process.cwd(), '.env');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach((line) => {
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

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const recipientEmail = process.env.RECIPIENT_EMAIL || 'aksungur1420@gmail.com';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Hata: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY çevre değişkenleri tanımlanmalıdır.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Turkish Letter Palettes for Anonymous User Identity (Unique Initial Letters)
const LETTER_PALETTES = [
  { letter: 'A', name: 'Akuamarin Deniz', hex: '#14B8A6', bg: '#0d9488', text: '#ccfbf1', border: '#14b8a6' },
  { letter: 'B', name: 'Büyük Deniz', hex: '#0284C7', bg: '#0369a1', text: '#e0f2fe', border: '#0284c7' },
  { letter: 'C', name: 'Cevher Mavi', hex: '#2563EB', bg: '#1d4ed8', text: '#dbeafe', border: '#2563eb' },
  { letter: 'Ç', name: 'Çağlayan Işık', hex: '#06B6D4', bg: '#0891b2', text: '#cffafe', border: '#06b6d4' },
  { letter: 'D', name: 'Deniz Mavisi', hex: '#3B82F6', bg: '#2563eb', text: '#dbeafe', border: '#3b82f6' },
  { letter: 'E', name: 'Erguvan Mor', hex: '#A855F7', bg: '#9333ea', text: '#f3e8ff', border: '#a855f7' },
  { letter: 'F', name: 'Firuze Yeşil', hex: '#10B981', bg: '#059669', text: '#d1fae5', border: '#10b981' },
  { letter: 'G', name: 'Gümüş Beyaz', hex: '#94A3B8', bg: '#64748b', text: '#f8fafc', border: '#94a3b8' },
  { letter: 'H', name: 'Hazar Mavisi', hex: '#0284C7', bg: '#0284c7', text: '#e0f2fe', border: '#38bdf8' },
  { letter: 'I', name: 'Işık Sarı', hex: '#EAB308', bg: '#ca8a04', text: '#fef9c3', border: '#eab308' },
  { letter: 'İ', name: 'İnci Beyaz', hex: '#CBD5E1', bg: '#475569', text: '#ffffff', border: '#cbd5e1' },
  { letter: 'K', name: 'Kehribar Sarı', hex: '#F59E0B', bg: '#d97706', text: '#fef3c7', border: '#f59e0b' },
  { letter: 'L', name: 'Lapis Lacivert', hex: '#6366F1', bg: '#4f46e5', text: '#e0e7ff', border: '#6366f1' },
  { letter: 'M', name: 'Mercan Turuncu', hex: '#F97316', bg: '#ea580c', text: '#ffedd5', border: '#f97316' },
  { letter: 'N', name: 'Nurlu Yeşil', hex: '#22C55E', bg: '#16a34a', text: '#dcfce7', border: '#22c55e' },
  { letter: 'O', name: 'Okyanus Mavi', hex: '#0284C7', bg: '#0369a1', text: '#e0f2fe', border: '#0284c7' },
  { letter: 'Ö', name: 'Özlü Yeşil', hex: '#16A34A', bg: '#15803d', text: '#dcfce7', border: '#16a34a' },
  { letter: 'P', name: 'Parlak Pembe', hex: '#EC4899', bg: '#db2777', text: '#fce7f3', border: '#ec4899' },
  { letter: 'R', name: 'Ruşen Sarı', hex: '#EAB308', bg: '#d97706', text: '#fef3c7', border: '#eab308' },
  { letter: 'S', name: 'Safir Mavi', hex: '#3B82F6', bg: '#2563eb', text: '#dbeafe', border: '#3b82f6' },
  { letter: 'Ş', name: 'Şeffaf Turkuaz', hex: '#06B6D4', bg: '#0891b2', text: '#cffafe', border: '#06b6d4' },
  { letter: 'T', name: 'Turkuaz Işık', hex: '#06B6D4', bg: '#0e7490', text: '#cffafe', border: '#06b6d4' },
  { letter: 'U', name: 'Ufuk Mavisi', hex: '#0284C7', bg: '#0369a1', text: '#e0f2fe', border: '#0284c7' },
  { letter: 'Ü', name: 'Ürgüp Sarısı', hex: '#F59E0B', bg: '#d97706', text: '#fef3c7', border: '#f59e0b' },
  { letter: 'V', name: 'Vefalı Erguvan', hex: '#8B5CF6', bg: '#7c3aed', text: '#ede9fe', border: '#8b5cf6' },
  { letter: 'Y', name: 'Yakut Kırmızı', hex: '#EF4444', bg: '#dc2626', text: '#fee2e2', border: '#ef4444' },
  { letter: 'Z', name: 'Zümrüt Yeşil', hex: '#10B981', bg: '#059669', text: '#d1fae5', border: '#10b981' },
];

function sanitizeToLettersOnly(text = '') {
  return text.replace(/[^a-zA-ZçğıöşüÇĞİÖŞÜ\s]/g, '').trim();
}

function getInitialLetter(nickname = '') {
  const clean = sanitizeToLettersOnly(nickname);
  if (!clean) return 'A';
  return clean.charAt(0).toUpperCase();
}

function getBadgeStyleForLetter(letter = 'A') {
  const matched = LETTER_PALETTES.find((p) => p.letter === letter.toUpperCase());
  if (matched) return matched;
  return {
    letter,
    hex: '#10B981',
    bg: '#059669',
    text: '#ffffff',
    border: '#10b981'
  };
}

function buildUniqueLetterMap(profiles = []) {
  const userLetterMap = {};
  const usedLetters = new Set();

  profiles.forEach((profile) => {
    const rawLetter = getInitialLetter(profile.color_nickname);
    if (!usedLetters.has(rawLetter)) {
      usedLetters.add(rawLetter);
      userLetterMap[profile.id] = rawLetter;
    } else {
      const available = LETTER_PALETTES.find((p) => !usedLetters.has(p.letter));
      const chosenLetter = available ? available.letter : rawLetter;
      usedLetters.add(chosenLetter);
      userLetterMap[profile.id] = chosenLetter;
    }
  });

  return userLetterMap;
}

// Timezone safe Turkey date helpers
function getTurkeyDateStr(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Istanbul' }).format(date);
}

function getDaysAgoTurkeyDateStr(daysAgo = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return getTurkeyDateStr(d);
}

function getStartOfMonthStr(dateStr) {
  const parts = dateStr.split('-');
  return parts[0] + '-' + parts[1] + '-01';
}

function getTurkishDayName(dateStr) {
  const d = new Date(dateStr + 'T12:00:00Z');
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return days[d.getUTCDay()];
}

async function runDailyReport() {
  console.log('=== Risale-i Nur Okuma Halkası Günlük Raporu Hazırlanıyor ===');

  const todayStr = getTurkeyDateStr();
  const last7DaysStr = getDaysAgoTurkeyDateStr(6);
  const startOfMonthStr = getStartOfMonthStr(todayStr);

  const dayOfMonth = parseInt(todayStr.split('-')[2], 10);
  const dayOfWeekIndex = new Date(todayStr + 'T12:00:00Z').getUTCDay() === 0 ? 7 : new Date(todayStr + 'T12:00:00Z').getUTCDay();

  console.log(`Rapor Tarihi (TSİ): ${todayStr}`);
  console.log(`Haftalık Pencere (Son 7 Gün): ${last7DaysStr} - ${todayStr}`);
  console.log(`Ay Başlangıcı: ${startOfMonthStr} (${dayOfMonth}. gün)`);
  console.log(`Alıcı E-Posta: ${recipientEmail}`);

  // 1. Fetch all profiles to establish guaranteed unique letter mapping
  const { data: allProfiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, color_nickname, badge_color');

  if (profileErr) {
    console.error('Profiller çekilirken hata:', profileErr);
    process.exit(1);
  }

  const uniqueLetterMap = buildUniqueLetterMap(allProfiles || []);

  // 2. Fetch today's logs (descending by page_count)
  const { data: todayLogs, error: todayErr } = await supabase
    .from('reading_logs')
    .select('id, user_id, log_date, page_count')
    .eq('log_date', todayStr)
    .order('page_count', { ascending: false });

  if (todayErr) {
    console.error('Bugünün okuma kayıtları çekilirken hata:', todayErr);
    process.exit(1);
  }

  // 3. Fetch weekly logs (last 7 days inclusive)
  const { data: weeklyLogs, error: weeklyErr } = await supabase
    .from('reading_logs')
    .select('id, user_id, log_date, page_count')
    .gte('log_date', last7DaysStr);

  if (weeklyErr) {
    console.error('Haftalık okuma kayıtları çekilirken hata:', weeklyErr);
  }

  // 4. Fetch monthly logs (from 1st day of current month)
  const { data: monthlyLogs, error: monthlyErr } = await supabase
    .from('reading_logs')
    .select('id, user_id, log_date, page_count')
    .gte('log_date', startOfMonthStr);

  if (monthlyErr) {
    console.error('Aylık okuma kayıtları çekilirken hata:', monthlyErr);
  }

  // ==========================================
  // CALCULATIONS & METRICS
  // ==========================================

  // --- TODAY'S STATS ---
  const activeTodayCount = todayLogs ? todayLogs.length : 0;
  const todayTotalPages = todayLogs ? todayLogs.reduce((acc, l) => acc + l.page_count, 0) : 0;
  const todayAveragePerPage = activeTodayCount > 0 ? (todayTotalPages / activeTodayCount).toFixed(1) : '0';
  const todayMaxPages = activeTodayCount > 0 ? Math.max(...todayLogs.map((l) => l.page_count)) : 0;

  // --- WEEKLY LEADERBOARD & STATS ---
  const weeklyMap = {};
  (weeklyLogs || []).forEach((log) => {
    const userId = log.user_id;
    if (!weeklyMap[userId]) {
      weeklyMap[userId] = {
        userId,
        totalPages: 0,
        daysActiveSet: new Set()
      };
    }
    weeklyMap[userId].totalPages += log.page_count;
    weeklyMap[userId].daysActiveSet.add(log.log_date);
  });

  const weeklyList = Object.values(weeklyMap)
    .map((u) => ({ ...u, daysActive: u.daysActiveSet.size }))
    .sort((a, b) => b.totalPages - a.totalPages);

  const weeklyTotalPages = (weeklyLogs || []).reduce((acc, l) => acc + l.page_count, 0);
  const weeklyActiveUsers = weeklyList.length;
  const weeklyAveragePerPerson = weeklyActiveUsers > 0 ? (weeklyTotalPages / weeklyActiveUsers).toFixed(1) : '0';
  const weeklyDailyAverage = (weeklyTotalPages / 7).toFixed(1);

  // --- MONTHLY LEADERBOARD & STATS ---
  const monthlyMap = {};
  (monthlyLogs || []).forEach((log) => {
    const userId = log.user_id;
    if (!monthlyMap[userId]) {
      monthlyMap[userId] = {
        userId,
        totalPages: 0,
        daysActiveSet: new Set()
      };
    }
    monthlyMap[userId].totalPages += log.page_count;
    monthlyMap[userId].daysActiveSet.add(log.log_date);
  });

  const monthlyList = Object.values(monthlyMap)
    .map((u) => ({ ...u, daysActive: u.daysActiveSet.size }))
    .sort((a, b) => b.totalPages - a.totalPages);

  const monthlyTotalPages = (monthlyLogs || []).reduce((acc, l) => acc + l.page_count, 0);
  const monthlyActiveUsers = monthlyList.length;
  const monthlyAveragePerPerson = monthlyActiveUsers > 0 ? (monthlyTotalPages / monthlyActiveUsers).toFixed(1) : '0';
  const monthlyDailyAverage = dayOfMonth > 0 ? (monthlyTotalPages / dayOfMonth).toFixed(1) : '0';

  // --- LAST 7 DAYS TREND CHART DATA ---
  const last7DaysArray = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = getDaysAgoTurkeyDateStr(i);
    const dayName = getTurkishDayName(dStr);
    const dayDisplay = `${parseInt(dStr.split('-')[2], 10)}/${parseInt(dStr.split('-')[1], 10)} ${dayName}`;
    last7DaysArray.push({
      dateStr: dStr,
      displayLabel: dayDisplay,
      totalPages: 0,
      activeUsers: 0
    });
  }

  (weeklyLogs || []).forEach((log) => {
    const item = last7DaysArray.find((d) => d.dateStr === log.log_date);
    if (item) {
      item.totalPages += log.page_count;
      item.activeUsers += 1;
    }
  });

  const trendMaxPage = Math.max(...last7DaysArray.map((d) => d.totalPages), 50);

  console.log('\n--- İSTATİSTİK ÖZETİ ---');
  console.log(`• Bugün: Toplam ${todayTotalPages} sf | ${activeTodayCount} okuyucu | Kişi başı ort: ${todayAveragePerPage} sf | En yüksek: ${todayMaxPages} sf`);
  console.log(`• Haftalık (Son 7 Gün): Toplam ${weeklyTotalPages} sf | ${weeklyActiveUsers} okuyucu | Kişi başı: ${weeklyAveragePerPerson} sf | Günlük ort: ${weeklyDailyAverage} sf`);
  console.log(`• Bu Ay: Toplam ${monthlyTotalPages} sf | ${monthlyActiveUsers} okuyucu | Kişi başı: ${monthlyAveragePerPerson} sf | Günlük ort: ${monthlyDailyAverage} sf`);

  // ==========================================
  // GENERATE HTML / CSS RESPONSIVE EMAIL
  // ==========================================

  // Badge component generator (ONLY shows single letter)
  const renderBadge = (userId) => {
    const letter = uniqueLetterMap[userId] || 'A';
    const style = getBadgeStyleForLetter(letter);
    return `
      <span style="display:inline-block; width:32px; height:32px; line-height:32px; border-radius:50%; text-align:center; font-weight:800; font-size:14px; background-color:${style.bg}; color:${style.text}; border:1px solid ${style.border}; box-shadow:0 1px 3px rgba(0,0,0,0.3);">
        ${letter}
      </span>
    `;
  };

  // 1. Daily User Distribution Bar Chart (Horizontal)
  const renderDailyDistributionChart = () => {
    if (!todayLogs || todayLogs.length === 0) {
      return `<p style="color:#94a3b8; font-size:13px; text-align:center; margin:16px 0;">Bugün okuma dağılım grafiği oluşturulacak veri bulunmuyor.</p>`;
    }

    const maxP = Math.max(...todayLogs.map((l) => l.page_count), 1);

    const barsHtml = todayLogs.map((log) => {
      const letter = uniqueLetterMap[log.user_id] || 'A';
      const style = getBadgeStyleForLetter(letter);
      const percentage = Math.max(Math.round((log.page_count / maxP) * 100), 8);
      const share = todayTotalPages > 0 ? ((log.page_count / todayTotalPages) * 100).toFixed(1) : 0;

      return `
        <div style="margin-bottom: 10px; display: flex; align-items: center;">
          <div style="width: 38px; text-align: center; flex-shrink: 0;">
            ${renderBadge(log.user_id)}
          </div>
          <div style="flex: 1; margin: 0 10px; background-color: #0f172a; border-radius: 6px; overflow: hidden; height: 26px; border: 1px solid #334155; position: relative;">
            <div style="width: ${percentage}%; height: 100%; background: linear-gradient(90deg, ${style.bg}, #10b981); border-radius: 5px;"></div>
            <span style="position: absolute; right: 8px; top: 4px; font-size: 11px; font-weight: bold; color: #f8fafc; text-shadow: 0 1px 2px rgba(0,0,0,0.8);">
              ${log.page_count} sayfa (%${share})
            </span>
          </div>
        </div>
      `;
    }).join('');

    return `
      <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px;">
          📊 Bugünkü Okuyucu Sayfa Dağılım Grafiği
        </div>
        ${barsHtml}
      </div>
    `;
  };

  // 2. Last 7 Days Reading Trend Bar Chart (Vertical Columns)
  const renderTrendChart = () => {
    const columnsHtml = last7DaysArray.map((item) => {
      const heightPercent = trendMaxPage > 0 ? Math.max(Math.round((item.totalPages / trendMaxPage) * 100), item.totalPages > 0 ? 14 : 4) : 4;
      const isToday = item.dateStr === todayStr;
      const barColor = isToday ? '#10b981' : '#3b82f6';
      const labelColor = isToday ? '#10b981' : '#94a3b8';

      return `
        <td style="vertical-align: bottom; text-align: center; padding: 0 4px; width: 14.28%;">
          <div style="font-size: 11px; font-weight: bold; color: ${isToday ? '#10b981' : '#f8fafc'}; margin-bottom: 4px;">
            ${item.totalPages > 0 ? item.totalPages : '-'}
          </div>
          <div style="height: 105px; display: flex; align-items: flex-end; justify-content: center; background-color: #0f172a; border-radius: 6px; border: 1px solid #334155; padding-top: 4px;">
            <div style="width: 72%; height: ${heightPercent}%; background: ${barColor}; border-radius: 4px 4px 0 0; margin: 0 auto; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>
          </div>
          <div style="font-size: 10px; color: ${labelColor}; font-weight: ${isToday ? 'bold' : 'normal'}; margin-top: 6px; white-space: nowrap;">
            ${item.displayLabel}
          </div>
        </td>
      `;
    }).join('');

    return `
      <div style="background-color: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <div style="font-size: 12px; font-weight: bold; color: #94a3b8; text-transform: uppercase; margin-bottom: 14px; letter-spacing: 0.5px;">
          📈 Son 7 Günün Okuma Eğilim Grafiği (Günlük Toplam Sayfalar)
        </div>
        <table style="width: 100%; border-collapse: collapse; table-layout: fixed;">
          <tr>
            ${columnsHtml}
          </tr>
        </table>
      </div>
    `;
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Risale-i Nur Günlük Okuma Raporu</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #090d16; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 680px; margin: 0 auto; background-color: #131d2e; border-radius: 18px; border: 1px solid #334155; padding: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 18px; margin-bottom: 22px; }
        .header h1 { color: #10b981; font-size: 24px; margin: 0; font-weight: 800; letter-spacing: -0.5px; }
        .header p { color: #94a3b8; font-size: 13px; margin-top: 6px; }
        .stats-grid { display: flex; gap: 8px; margin-bottom: 22px; flex-wrap: wrap; }
        .stat-card { flex: 1; min-width: 130px; background: #0b1120; border: 1px solid #283548; border-radius: 12px; padding: 12px 10px; text-align: center; }
        .stat-title { font-size: 11px; color: #94a3b8; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
        .stat-value-green { font-size: 20px; font-weight: 800; color: #10b981; margin-top: 4px; }
        .stat-value-blue { font-size: 20px; font-weight: 800; color: #38bdf8; margin-top: 4px; }
        .stat-value-amber { font-size: 20px; font-weight: 800; color: #f59e0b; margin-top: 4px; }
        .stat-value-purple { font-size: 20px; font-weight: 800; color: #a855f7; margin-top: 4px; }
        .section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; margin-top: 24px; border-left: 4px solid #10b981; padding-left: 10px; }
        .section-title { font-size: 15px; font-weight: 700; color: #ffffff; }
        .section-badge { font-size: 11px; padding: 3px 8px; border-radius: 8px; background: #1e293b; color: #94a3b8; border: 1px solid #334155; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 22px; text-align: left; font-size: 13px; background: #182337; border-radius: 12px; overflow: hidden; border: 1px solid #2e3d55; }
        th { background-color: #0b1120; color: #94a3b8; padding: 11px 12px; border-bottom: 1px solid #334155; text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px; font-weight: 700; }
        td { padding: 11px 12px; border-bottom: 1px solid #283548; color: #e2e8f0; vertical-align: middle; }
        tr:last-child td { border-bottom: none; }
        .rank-gold { color: #f59e0b; font-weight: 800; font-size: 13px; }
        .rank-silver { color: #cbd5e1; font-weight: 800; font-size: 13px; }
        .rank-bronze { color: #d97706; font-weight: 800; font-size: 13px; }
        .info-pill { display: inline-block; padding: 2px 7px; border-radius: 6px; background-color: #0f172a; border: 1px solid #334155; font-size: 11px; color: #cbd5e1; }
        .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 26px; border-top: 1px solid #334155; padding-top: 16px; line-height: 1.6; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <!-- Header -->
        <div class="header">
          <h1>📖 Risale-i Nur Okuma Halkası</h1>
          <p>Gün Sonu Genel Değerlendirme & İstatistik Raporu (${todayStr})</p>
        </div>

        <!-- 1. GÜNLÜK METRİK KARTLARI -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">Bugün Okunan</div>
            <div class="stat-value-green">${todayTotalPages} <span style="font-size:12px; font-weight:normal;">sf</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Aktif Okuyucu</div>
            <div class="stat-value-blue">${activeTodayCount} <span style="font-size:12px; font-weight:normal;">kişi</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Kişi Başı Ortalama</div>
            <div class="stat-value-amber">${todayAveragePerPage} <span style="font-size:12px; font-weight:normal;">sf</span></div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Günün Zirvesi</div>
            <div class="stat-value-purple">${todayMaxPages} <span style="font-size:12px; font-weight:normal;">sf</span></div>
          </div>
        </div>

        <!-- 2. GÖRSEL GRAFİK: SON 7 GÜNÜN TREND GRAFİĞİ -->
        ${renderTrendChart()}

        <!-- 3. BUGÜNKÜ SIRALAMA TABLOSU (Yüksekten Düşüğe, SADECE Takma Harfler) -->
        <div class="section-header">
          <div class="section-title">📅 1. Bugünkü Okuma Sıralaması (Yüksekten Düşüğe)</div>
          <span class="section-badge">${activeTodayCount} Katılımcı</span>
        </div>

        ${activeTodayCount === 0 ? `
          <div style="padding: 20px; text-align: center; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; color: #94a3b8; font-size: 13px; margin-bottom: 22px;">
            Bugün henüz okuma kaydı girilmedi.
          </div>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Sıra</th>
                <th style="width: 120px;">Takma Harf</th>
                <th style="text-align: right;">Okunan Sayfa</th>
                <th style="text-align: right;">Grup Payı</th>
              </tr>
            </thead>
            <tbody>
              ${todayLogs.map((log, index) => {
                const rankText = index === 0 ? '<span class="rank-gold">🥇 1.</span>' : index === 1 ? '<span class="rank-silver">🥈 2.</span>' : index === 2 ? '<span class="rank-bronze">🥉 3.</span>' : `<span style="color:#94a3b8;">${index + 1}.</span>`;
                const sharePercent = todayTotalPages > 0 ? ((log.page_count / todayTotalPages) * 100).toFixed(1) : 0;
                return `
                  <tr>
                    <td>${rankText}</td>
                    <td>${renderBadge(log.user_id)}</td>
                    <td style="text-align: right; font-weight: 800; color: #10b981; font-size: 14px;">
                      ${log.page_count} sayfa
                    </td>
                    <td style="text-align: right; color: #94a3b8; font-size: 12px;">
                      %${sharePercent}
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}

        <!-- 4. GÖRSEL GRAFİK: BUGÜNKÜ SAYFA DAĞILIMI -->
        ${renderDailyDistributionChart()}

        <!-- 5. HAFTALIK ÖZET VE SIRALAMA TABLOSU -->
        <div class="section-header" style="border-left-color: #f59e0b;">
          <div class="section-title">📊 2. Son 7 Günün Özeti & Sıralaması</div>
          <span class="section-badge" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.3);">
            Toplam ${weeklyTotalPages} sf
          </span>
        </div>

        <!-- Haftalık Mini Metrik Çubuğu -->
        <div style="background-color: #0b1120; border: 1px solid #283548; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; color: #cbd5e1; display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap; gap: 8px;">
          <div>Haftalık Toplam: <strong style="color:#f59e0b;">${weeklyTotalPages} sf</strong></div>
          <div>Aktif Okuyucu: <strong style="color:#38bdf8;">${weeklyActiveUsers} kişi</strong></div>
          <div>Kişi Başı Ortalama: <strong style="color:#10b981;">${weeklyAveragePerPerson} sf</strong></div>
          <div>Günlük Ortalama: <strong style="color:#a855f7;">${weeklyDailyAverage} sf/gün</strong></div>
        </div>

        ${weeklyList.length === 0 ? `
          <div style="padding: 20px; text-align: center; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; color: #94a3b8; font-size: 13px; margin-bottom: 22px;">
            Bu hafta henüz okuma verisi bulunmuyor.
          </div>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Derece</th>
                <th style="width: 120px;">Takma Harf</th>
                <th style="text-align: center;">Okunan Gün</th>
                <th style="text-align: right;">Haftalık Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${weeklyList.map((item, index) => {
                const rankText = index === 0 ? '<span class="rank-gold">🥇 1.</span>' : index === 1 ? '<span class="rank-silver">🥈 2.</span>' : index === 2 ? '<span class="rank-bronze">🥉 3.</span>' : `<span style="color:#94a3b8;">${index + 1}.</span>`;
                return `
                  <tr>
                    <td>${rankText}</td>
                    <td>${renderBadge(item.userId)}</td>
                    <td style="text-align: center;">
                      <span class="info-pill">${item.daysActive} gün</span>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: #f59e0b; font-size: 14px;">
                      ${item.totalPages} sayfa
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}

        <!-- 6. AYLIK ÖZET VE SIRALAMA TABLOSU -->
        <div class="section-header" style="border-left-color: #38bdf8;">
          <div class="section-title">📅 3. Bu Ayın Özeti & Genel Sıralaması</div>
          <span class="section-badge" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3);">
            Toplam ${monthlyTotalPages} sf
          </span>
        </div>

        <!-- Aylık Mini Metrik Çubuğu -->
        <div style="background-color: #0b1120; border: 1px solid #283548; border-radius: 10px; padding: 10px 14px; margin-bottom: 14px; font-size: 12px; color: #cbd5e1; display: flex; justify-content: space-around; text-align: center; flex-wrap: wrap; gap: 8px;">
          <div>Aylık Toplam: <strong style="color:#38bdf8;">${monthlyTotalPages} sf</strong></div>
          <div>Aktif Okuyucu: <strong style="color:#10b981;">${monthlyActiveUsers} kişi</strong></div>
          <div>Kişi Başı Ortalama: <strong style="color:#f59e0b;">${monthlyAveragePerPerson} sf</strong></div>
          <div>Günlük Ortalama: <strong style="color:#a855f7;">${monthlyDailyAverage} sf/gün</strong></div>
        </div>

        ${monthlyList.length === 0 ? `
          <div style="padding: 20px; text-align: center; background-color: #0f172a; border-radius: 12px; border: 1px solid #334155; color: #94a3b8; font-size: 13px; margin-bottom: 22px;">
            Bu ay henüz okuma verisi bulunmuyor.
          </div>
        ` : `
          <table>
            <thead>
              <tr>
                <th style="width: 70px;">Sıra</th>
                <th style="width: 120px;">Takma Harf</th>
                <th style="text-align: center;">Okunan Gün</th>
                <th style="text-align: right;">Aylık Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${monthlyList.map((item, index) => {
                const rankText = index === 0 ? '<span class="rank-gold">🥇 1.</span>' : index === 1 ? '<span class="rank-silver">🥈 2.</span>' : index === 2 ? '<span class="rank-bronze">🥉 3.</span>' : `<span style="color:#94a3b8;">${index + 1}.</span>`;
                return `
                  <tr>
                    <td>${rankText}</td>
                    <td>${renderBadge(item.userId)}</td>
                    <td style="text-align: center;">
                      <span class="info-pill">${item.daysActive} gün</span>
                    </td>
                    <td style="text-align: right; font-weight: 800; color: #38bdf8; font-size: 14px;">
                      ${item.totalPages} sayfa
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        `}

        <!-- Footer -->
        <div class="footer">
          🔒 <strong>Gizlilik İlkesi:</strong> Tablolarda okuyucu isimleri veya tam lakapları yer almaz; her katılımcı yalnızca kendisine ait özel takma harfi ile temsil edilir.<br>
          Risale-i Nur Günlük Okuma Halkası Otomatik Değerlendirme Servisidir.<br>
          Rapor Saati: 23:31 TSİ | Rapor Tarihi: ${todayStr} | Alıcı: ${recipientEmail}
        </div>

      </div>
    </body>
    </html>
  `;

  // Write preview HTML to disk so it can be viewed locally or verified
  try {
    const previewDir = path.resolve(process.cwd(), 'dist');
    if (!fs.existsSync(previewDir)) {
      fs.mkdirSync(previewDir, { recursive: true });
    }
    const previewPath = path.join(previewDir, 'preview-daily-report.html');
    fs.writeFileSync(previewPath, htmlContent, 'utf8');
    console.log(`HTML Önizleme Dosyası Oluşturuldu: ${previewPath}`);
  } catch (err) {
    console.warn('Önizleme dosyası yazılırken uyarı:', err.message);
  }

  // Send Email if SMTP credentials provided
  if (smtpUser && smtpPass) {
    console.log(`\nE-posta gönderiliyor (${recipientEmail})...`);

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const mailOptions = {
      from: `"Risale-i Nur Okuma Halkası" <${smtpUser}>`,
      to: recipientEmail,
      subject: `📖 Günlük Okuma Raporu - ${todayStr} (${todayTotalPages} Sayfa / Ort: ${todayAveragePerPage})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta başarıyla gönderildi! Message ID:', info.messageId);
  } else {
    console.log('\nBilgi: SMTP_USER ve SMTP_PASS tanımlanmadığı için e-posta gönderimi simüle edildi.');
    console.log('E-posta HTML şablonu ve tüm istatistik tabloları eksiksiz hazırlandı.');
  }

  console.log('=== Rapor İşlemi Başarıyla Tamamlandı ===\n');
}

runDailyReport().catch((err) => {
  console.error('Rapor çalıştırma hatası:', err);
  process.exit(1);
});
