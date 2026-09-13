import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

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

// Environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const recipientEmail = 'aksungur1420@gmail.com';

const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Hata: VITE_SUPABASE_URL ve VITE_SUPABASE_ANON_KEY çevre değişkenleri tanımlanmalıdır.');
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

async function runDailyReport() {
  console.log('=== Risale-i Nur Okuma Halkası Günlük Raporu Hazırlanıyor ===');

  // Calculate dates in Turkey Time (UTC+3)
  const now = new Date();
  const turkeyDateStr = new Date(now.getTime() + 3 * 3600 * 1000).toISOString().split('T')[0];

  console.log(`Tarih: ${turkeyDateStr}`);

  // 1. Fetch today's reading logs
  const { data: todayLogs, error: todayErr } = await supabase
    .from('reading_logs')
    .select(`
      id,
      user_id,
      log_date,
      page_count,
      profiles (
        color_nickname,
        badge_color
      )
    `)
    .eq('log_date', turkeyDateStr)
    .order('page_count', { ascending: false });

  if (todayErr) {
    console.error('Bugünün verileri çekilirken hata:', todayErr);
    process.exit(1);
  }

  // 2. Fetch last 7 days reading logs for weekly summary
  const sevenDaysAgo = new Date(now.getTime() - 6 * 24 * 3600 * 1000);
  const sevenDaysAgoStr = new Date(sevenDaysAgo.getTime() + 3 * 3600 * 1000).toISOString().split('T')[0];

  const { data: weeklyLogs, error: weeklyErr } = await supabase
    .from('reading_logs')
    .select(`
      id,
      user_id,
      log_date,
      page_count,
      profiles (
        color_nickname,
        badge_color
      )
    `)
    .gte('log_date', sevenDaysAgoStr);

  if (weeklyErr) {
    console.error('Haftalık veriler çekilirken hata:', weeklyErr);
  }

  // Calculate Today's Stats
  const activeTodayCount = todayLogs ? todayLogs.length : 0;
  const todayTotalPages = todayLogs ? todayLogs.reduce((acc, l) => acc + l.page_count, 0) : 0;
  const todayAveragePerPage = activeTodayCount > 0 ? (todayTotalPages / activeTodayCount).toFixed(1) : 0;

  // Process Weekly Leaderboard
  const weeklyMap = {};
  (weeklyLogs || []).forEach((log) => {
    const userId = log.user_id;
    const nickname = log.profiles?.color_nickname || 'Anonim';
    if (!weeklyMap[userId]) {
      weeklyMap[userId] = {
        userId,
        nickname,
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
  const weeklyAveragePerPerson = weeklyList.length > 0 ? (weeklyTotalPages / weeklyList.length).toFixed(1) : 0;

  console.log(`- Bugünkü Toplam: ${todayTotalPages} sayfa`);
  console.log(`- Bugünkü Aktif Okuyucu: ${activeTodayCount} kişi`);
  console.log(`- Bugünkü Kişi Başı Ortalama: ${todayAveragePerPage} sayfa`);
  console.log(`- Haftalık Toplam: ${weeklyTotalPages} sayfa`);
  console.log(`- Haftalık Kişi Başı Ortalama: ${weeklyAveragePerPerson} sayfa`);

  // Generate HTML Email Content
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 650px; margin: 0 auto; background-color: #1e293b; border-radius: 16px; border: 1px solid #334155; padding: 24px; }
        .header { text-align: center; border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
        .header h1 { color: #10b981; font-size: 22px; margin: 0; }
        .header p { color: #94a3b8; font-size: 13px; margin-top: 4px; }
        .stats-grid { display: flex; gap: 10px; margin-bottom: 24px; }
        .stat-card { flex: 1; background: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 12px; text-align: center; }
        .stat-title { font-size: 11px; color: #94a3b8; text-transform: uppercase; }
        .stat-value { font-size: 20px; font-weight: bold; color: #10b981; margin-top: 4px; }
        .stat-value-amber { font-size: 20px; font-weight: bold; color: #f59e0b; margin-top: 4px; }
        .stat-value-blue { font-size: 20px; font-weight: bold; color: #3b82f6; margin-top: 4px; }
        .section-title { font-size: 15px; font-weight: bold; color: #f8fafc; margin-bottom: 12px; border-left: 4px solid #10b981; padding-left: 8px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 24px; text-align: left; font-size: 13px; }
        th { background-color: #0f172a; color: #94a3b8; padding: 10px; border-bottom: 1px solid #334155; text-transform: uppercase; font-size: 11px; }
        td { padding: 10px; border-bottom: 1px solid #334155; color: #e2e8f0; }
        .badge { display: inline-block; width: 28px; height: 28px; line-height: 28px; border-radius: 50%; text-align: center; font-weight: bold; background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4); }
        .footer { text-align: center; font-size: 11px; color: #64748b; margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        
        <div class="header">
          <h1>📖 Risale-i Nur Okuma Halkası</h1>
          <p>Günlük ve Haftalık Okuma Değerlendirme Raporu (${turkeyDateStr})</p>
        </div>

        <!-- Metric Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-title">Bugün Okunan</div>
            <div class="stat-value">${todayTotalPages} Sayfa</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Aktif Okuyucu</div>
            <div class="stat-value-blue">${activeTodayCount} Kişi</div>
          </div>
          <div class="stat-card">
            <div class="stat-title">Kişi Başı Ortalama</div>
            <div class="stat-value-amber">${todayAveragePerPage} Sayfa</div>
          </div>
        </div>

        <!-- 1. Bugünkü Okuma Sıralaması -->
        <div class="section-title">📅 Bugünkü Okuma Sıralaması</div>
        ${activeTodayCount === 0 ? '<p style="color:#94a3b8; font-size:13px;">Bugün henüz kayıt girilmedi.</p>' : `
        <table>
          <thead>
            <tr>
              <th>Sıra</th>
              <th>Okuyucu Kodu</th>
              <th style="text-align: right;">Sayfa Sayısı</th>
            </tr>
          </thead>
          <tbody>
            ${todayLogs.map((log, index) => {
              const letter = getInitialLetter(log.profiles?.color_nickname);
              const rankStr = index === 0 ? '🥇 1.' : index === 1 ? '🥈 2.' : index === 2 ? '🥉 3.' : `${index + 1}.`;
              return `
                <tr>
                  <td style="font-weight: bold; color: #94a3b8;">${rankStr}</td>
                  <td><span class="badge">${letter}</span></td>
                  <td style="text-align: right; font-weight: bold; color: #10b981;">${log.page_count} sayfa</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        `}

        <!-- 2. Haftalık Okuma Özet Sıralaması -->
        <div class="section-title">📊 Bu Haftanın Genel Özeti</div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: -8px; margin-bottom: 12px;">
          Haftalık Toplam: <strong style="color:#f59e0b;">${weeklyTotalPages} sayfa</strong> | Haftalık Kişi Başı Ortalama: <strong style="color:#f59e0b;">${weeklyAveragePerPerson} sayfa</strong>
        </p>
        ${weeklyList.length === 0 ? '<p style="color:#94a3b8; font-size:13px;">Bu hafta veri yok.</p>' : `
        <table>
          <thead>
            <tr>
              <th>Derece</th>
              <th>Okuyucu Kodu</th>
              <th style="text-align: center;">Aktif Gün</th>
              <th style="text-align: right;">Haftalık Toplam</th>
            </tr>
          </thead>
          <tbody>
            ${weeklyList.map((item, index) => {
              const letter = getInitialLetter(item.nickname);
              const rankStr = index === 0 ? '🥇 1.' : index === 1 ? '🥈 2.' : index === 2 ? '🥉 3.' : `${index + 1}.`;
              return `
                <tr>
                  <td style="font-weight: bold; color: #94a3b8;">${rankStr}</td>
                  <td><span class="badge">${letter}</span></td>
                  <td style="text-align: center; color: #cbd5e1;">${item.daysActive} gün</td>
                  <td style="text-align: right; font-weight: bold; color: #f59e0b;">${item.totalPages} sayfa</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        `}

        <div class="footer">
          Risale-i Nur Günlük Okuma Halkası Otomatik Sistem Raporudur.<br>
          Rapor Saati: 23:31 TSI | Alıcı: ${recipientEmail}
        </div>

      </div>
    </body>
    </html>
  `;

  // Send Email if SMTP credentials provided
  if (smtpUser && smtpPass) {
    console.log(`E-posta gönderiliyor (${recipientEmail})...`);
    
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
      subject: `📖 Günlük Okuma Raporu - ${turkeyDateStr} (${todayTotalPages} Sayfa / Ort: ${todayAveragePerPage})`,
      html: htmlContent
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('E-posta başarıyla gönderildi! Message ID:', info.messageId);
  } else {
    console.log('Bilgi: SMTP_USER ve SMTP_PASS tanımlanmadığı için e-posta gönderimi simüle edildi.');
    console.log('Rapor şablonu oluşturuldu ve başarıyla test edildi.');
  }

  console.log('=== Rapor İşlemi Tamamlandı ===');
}

runDailyReport().catch((err) => {
  console.error('Rapor çalıştırma hatası:', err);
  process.exit(1);
});
