# 📖 Risale-i Nur Günlük Okuma Halkası (One-Page Web Uygulaması)

Risale-i Nur talebelerinin günlük okuma miktarlarını (sayfa sayılarını) anonim bir şekilde kaydedebildiği, topluluk olarak ne kadar okunduğunu günlük, haftalık ve aylık tablolar ve görsel grafikler halinde takip edebildiği modern bir One-Page Web Uygulaması.

![Risale-i Nur Okuma Halkası](https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-blue?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Deploy-GitHub_Pages-black?style=for-the-badge&logo=github)

---

## ✨ Öne Çıkan Özellikler

1. **🔒 %100 Gizlilik ve Anonimlik**:
   - Kullanıcıların e-posta adresleri kesinlikle gizli tutulur ve diğer kullanıcılara gösterilmez.
   - Her kullanıcıya sistem tarafından otomatik ve renkli bir takma ad (*"Zümrüt Yeşil #412"*, *"Safir Mavi #891"*, *"Yakut Kırmızı #305"*) ve renk rozeti atanır.
2. **⚡ Hızlı Okuma Kaydı**:
   - Tarih seçimi, okunan sayfa sayısı ve isteğe bağlı eser seçimi (Sözler, Mektubat, Lem'alar vb.) ile tek tıkla kayıt gürültüsüz kaydedilir.
   - Tebrik confetti efektleri ile okuma motivasyonu desteklenir.
3. **📊 Günlük, Haftalık ve Aylık Tablolar**:
   - **Günlük Tablo**: Bugün kim kaç sayfa okudu?
   - **Haftalık Özet**: Bu haftanın en çok okuyanları (Liderlik kürsüsü 🥇 🥈 🥉).
   - **Aylık Özet**: Aylık toplam ve okuma yapılan aktif gün sayıları.
4. **📈 Görsel İstatistik Grafikleri**:
   - Son 14 günün okuma eğilimi alanı (Recharts ile dinamik grafik).
   - Okunan Risale-i Nur eserlerinin oransal pasta grafiği.
5. **🔥 Kişisel Okuma Serisi (Streak)**:
   - Kullanıcının kaç gündür aralıksız okuduğu ve toplam okuduğu sayfa sayısı hesabı.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

* **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts, Canvas-Confetti.
* **Backend & DB**: Supabase (PostgreSQL + Auth + RLS Kuralları) veya Demo Modu (LocalStorage Fallback).
* **Hosting**: GitHub Pages (GitHub Actions CI/CD ile otomatik yayınlama).

---

## 🚀 Yerel Geliştirme (Local Development)

Projeyi yerel bilgisayarınızda çalıştırmak için:

```bash
# 1. Bağımlılıkları yükleyin
cmd /c npm install

# 2. Geliştirme sunucusunu başlatın
cmd /c npm run dev
```

Tarayıcınızda `http://localhost:5173` adresine giderek uygulamayı görüntüleyebilirsiniz.

---

## 🌐 Supabase Veritabanı Kurulumu (Opsiyonel)

Uygulama varsayılan olarak **Demo Modunda** (LocalStorage) çalışır. Canlı bulut veritabanını aktif etmek için:

1. [Supabase.com](https://supabase.com) adresinden ücretsiz bir proje oluşturun.
2. `supabase_schema.sql` dosyasındaki SQL kodlarını Supabase SQL Editor kısmına yapıştırıp çalıştırın.
3. Proje dizininde `.env` dosyası oluşturup bilgilerinizi ekleyin:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 📦 GitHub Pages İle Yayınlama (Deployment)

1. Projenizi GitHub üzerinde yeni bir **Public Repository** olarak oluşturun ve yükleyin:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Risale-i Nur Okuma Halkası"
   git branch -M main
   git remote add origin https://github.com/KULLANICI_ADI/REPOSITORY_ADI.git
   git push -u origin main
   ```
2. GitHub Repository **Settings -> Pages** sekmesine gidin.
3. **Source** kısmını `GitHub Actions` olarak seçin.
4. Repository pushes ile `.github/workflows/deploy.yml` otomatik çalışacak ve siteniz birkaç dakika içinde yayına girecektir!

---

## 📜 Lisans
MIT License - Herkes dilediğince kullanabilir, özelleştirebilir ve yayınlayabilir.
