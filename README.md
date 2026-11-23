# 📝 Görev Yöneticisi (Supabase + Jira)

Sade HTML/CSS/JavaScript ile yazılmış, **Supabase** altyapısını kullanan bir görev (to-do) yönetim uygulaması. Proje yönetimi **Jira** üzerinden yapılmıştır.

- 🌐 **Canlı site:** https://egemen-al.github.io/gorev-yoneticisi/
- 📋 **Jira panosu:** https://egemenal.atlassian.net/jira/software/projects/GY/boards/3

## Özellikler
- E-posta/şifre ile kayıt olma, giriş ve çıkış (Supabase Auth)
- Görev ekleme, listeleme, tamamlama ve silme (Supabase Database)
- Öncelik seviyesi (Düşük / Orta / Yüksek)
- Hepsi / Aktif / Tamamlanan filtreleri
- Row Level Security: her kullanıcı yalnızca kendi görevlerini görür

## Kullanılan Teknolojiler
| Alan | Teknoloji |
|---|---|
| Arayüz | HTML, CSS, JavaScript |
| Backend / Veritabanı | Supabase (PostgreSQL + Auth) |
| Proje Yönetimi | Jira |
| Versiyon Kontrol | Git & GitHub |

## Proje Yapısı
```
├── index.html            # Sayfa yapısı
├── style.css             # Tasarım
├── app.js                # Uygulama mantığı (Supabase işlemleri)
├── config.js             # Supabase URL ve anon key
├── supabase/schema.sql   # Tablo + güvenlik politikaları
└── jira/jira-gorevler.csv# Jira'ya içe aktarılacak görevler
```

---

## Kurulum

### 1) Supabase
1. https://supabase.com → **Start your project** → GitHub ile giriş yap.
2. **New project** oluştur (bölge: Frankfurt / Central EU).
3. Sol menü **SQL Editor** → `supabase/schema.sql` içeriğini yapıştır → **Run**.
4. **Project Settings → API Keys** sayfasından `Project URL` ve `publishable` anahtarını kopyala, `config.js` dosyasına yapıştır.
5. (İsteğe bağlı) Test kolaylığı için **Authentication → Sign In / Providers → Email** altında *Confirm email* seçeneğini kapatabilirsin.

### 2) Çalıştırma
`index.html` dosyasını tarayıcıda açman yeterli. Ya da VS Code'da **Live Server** eklentisiyle aç.

### 3) Jira
1. https://www.atlassian.com/software/jira/free → ücretsiz hesap aç.
2. **Create project → Scrum** (veya Kanban) şablonu → proje adı: `Görev Yöneticisi`.
3. Görevleri içe aktar: sağ üst **⚙️ Settings → System → External System Import → CSV** → `jira/jira-gorevler.csv` dosyasını seç, alanları eşleştir (Summary, Issue Type, Description, Priority, Labels).
4. **Ekip üyesi ekleme:** Proje içinde **Project settings → Access (People) → Add people** → e-posta adresini yaz → rol: *Member* (veya *Viewer*) → **Add**. Alternatif: sol alttaki **+ Invite people** butonu.
5. Görevleri sprint'e ekle, ilerledikçe *To Do → In Progress → Done* olarak taşı.
6. (İsteğe bağlı) GitHub bağlantısı: **Apps → Explore more apps → "GitHub for Jira"** kur. Commit mesajlarına Jira anahtarı yazarsan (ör. `GY-4 giriş ekranı eklendi`) commit'ler ilgili görevde görünür.

### 4) GitHub
```bash
git init
git add .
git commit -m "İlk sürüm: Supabase görev yöneticisi"
git branch -M main
git remote add origin https://github.com/KULLANICI_ADIN/gorev-yoneticisi.git
git push -u origin main
```
Yayınlamak için: depo **Settings → Pages → Branch: main / root → Save**. Birkaç dakika sonra site `https://KULLANICI_ADIN.github.io/gorev-yoneticisi/` adresinde açılır. Sonrasında Supabase'de **Authentication → URL Configuration → Site URL** alanına bu adresi gir.

> Not: `anon` anahtarı herkese açık olacak şekilde tasarlanmıştır; veriler RLS politikalarıyla korunur. `service_role` anahtarını **asla** koda koyma.
