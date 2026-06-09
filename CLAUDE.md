# İshak Alper Web Sitesi — CLAUDE.md

## Proje Özeti

**İshak Alper**'in kişisel web sitesi ve kitap satış platformu. "Çıplak Gösteren Gözlükler" adlı kitabın tanıtımı, blog, danışmanlık başvurusu ve sipariş yönetimini içerir.

Google AI Studio'dan export edilmiş bir applet — Firebase Firestore/Auth/Storage backend, React 19 + Vite 6 + Tailwind 4 frontend, Express dev server.

## Tech Stack

| Katman | Teknoloji |
|--------|-----------|
| Frontend | React 19, TypeScript 5.8, Vite 6 |
| Styling | Tailwind CSS 4 (`@tailwindcss/vite` plugin) |
| Routing | React Router DOM 7 |
| Animasyon | Framer Motion 12 |
| Backend / DB | Firebase 12 (Firestore, Auth, Storage) |
| i18n | i18next 26 + react-i18next 17 |
| AI | `@google/genai` (Gemini API) |
| Dev Server | Express 4 + Vite middleware (`tsx server.ts`) |
| Build | Vite + esbuild (server bundle) |

## Proje Yapısı

```
/
├── src/
│   ├── App.tsx                  # Router + Auth state
│   ├── main.tsx                 # Entry point
│   ├── index.css                # Global styles
│   ├── i18n.ts                  # i18next config (10 dil)
│   ├── pages/
│   │   ├── Home.tsx             # Hero, video, quote, content feed
│   │   ├── Book.tsx             # Kitap detay sayfası
│   │   ├── Blog.tsx             # Blog listesi
│   │   ├── BlogPost.tsx         # Tekil blog yazısı
│   │   ├── Contact.tsx          # İletişim formu
│   │   ├── About.tsx            # Hakkımda
│   │   ├── Admin.tsx            # Admin paneli (Google Auth korumalı)
│   │   ├── Checkout.tsx         # Sipariş sayfası
│   │   ├── ReadPreview.tsx      # Kitap önizleme okuyucu
│   │   └── NotFound.tsx         # 404
│   ├── components/
│   │   ├── Layout.tsx           # Navbar + Outlet + Footer
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── ContentFeed.tsx      # Blog/içerik akışı
│   │   ├── VideoPlayer.tsx      # Video oynatıcı
│   │   ├── NewsletterPopup.tsx  # Email abonelik popup
│   │   ├── PurchaseModal.tsx    # Satın alma modal
│   │   ├── CheckoutModal.tsx    # Ödeme modal
│   │   ├── ReadPreviewModal.tsx # Kitap okuma modal
│   │   ├── SEO.tsx              # react-helmet-async SEO
│   │   ├── BackButton.tsx
│   │   └── ErrorBoundary.tsx
│   ├── lib/
│   │   ├── firebase.ts          # Firebase init (config'den)
│   │   ├── errorHandling.ts     # Firestore hata yönetimi
│   │   └── seed.ts              # Blog post seed scripti
│   ├── data/
│   │   └── blogPosts.ts         # Statik blog verisi
│   └── locales/                 # tr, en, de, fr, es, it, ru, zh, ar, ku
├── server.ts                    # Express dev/prod server
├── vite.config.ts
├── firebase-applet-config.json  # Firebase proje config (commit'te var)
├── firestore.rules              # Güvenlik kuralları
├── .env.example                 # Gerekli env değişkenleri
└── package.json
```

## Rotalar

| URL | Sayfa | Notlar |
|-----|-------|--------|
| `/` | Home | Hero, video, quote, content feed |
| `/kitap` | Book | Kitap detayı, satın alma |
| `/blog` | Blog | Liste |
| `/blog/:id` | BlogPost | Tekil yazı |
| `/iletisim` | Contact | Form → Firestore `messages` |
| `/hakkimda` | About | Yazar hakkında |
| `/admin` | Admin | Google Auth gerektiriyor |
| `/checkout` | Checkout | Sipariş → Firestore `orders` |
| `/kitap/oku` | ReadPreview | Kitap önizleme |

## Firebase Collections

| Koleksiyon | Açıklama | Erişim |
|------------|----------|--------|
| `settings/general` | Site ayarları (hero, sosyal medya vs.) | Herkes okuyabilir, sadece admin yazabilir |
| `settings/stats` | Ziyaretçi sayacı | Herkes increment edebilir |
| `posts` | Blog yazıları | Yayınlananlar herkese açık |
| `messages` | İletişim formları | Herkes oluşturabilir, sadece admin okuyabilir |
| `orders` | Siparişler | Herkes oluşturabilir, sadece admin yönetir |
| `consulting_requests` | Danışmanlık talepleri | Herkes oluşturabilir |
| `books` | Kitap bilgisi | Herkese açık okuma |
| `subscribers` | Newsletter aboneleri | Herkes kaydolabilir |
| `users` | Kullanıcı rolleri | Sadece kendi/admin |

## Admin Erişimi

Admin email: `ishak595@gmail.com` (Firestore rules'da hardcoded)
Giriş: Google OAuth (`signInWithPopup` ile)
URL: `/admin`

## Geliştirme Ortamı

### Kurulum

```bash
cd /Users/alper/-shak-Alper-web-sitesi
npm install
```

### .env.local Oluşturma

```bash
cp .env.example .env.local
# GEMINI_API_KEY değerini doldur
```

### Çalıştırma

```bash
npm run dev        # http://localhost:3000
npm run build      # Production build
npm run start      # Production server
npm run lint       # TypeScript type check
```

Dev server `tsx server.ts` çalıştırır — Express + Vite middleware birlikte.

## Ortam Değişkenleri

| Değişken | Açıklama | Zorunlu |
|----------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API anahtarı | Evet |
| `APP_URL` | Deploy edilen URL (Cloud Run otomatik inject eder) | Hayır |

Firebase config `.env`'de değil, `firebase-applet-config.json`'da — bu dosya repoda mevcut.

## i18n

10 dil desteği: `tr, en, de, fr, es, it, ru, zh, ar, ku`
- Türkçe dışındaki dillerde `t('key')` kullanılır
- Türkçede Firestore `settings/general`'dan gelen dinamik metin önceliklidir
- Yeni çeviri eklemek için: `src/locales/<lang>.json` düzenle + `src/i18n.ts`'de kaydedildiğinden emin ol

## Önemli Notlar

- **Görsel yükleme**: Firebase Storage yerine base64 → canvas ile Firestore'a sıkıştırılarak kaydediliyor (1MB limit)
- **Lazy loading**: Tüm sayfalar `React.lazy()` ile yükleniyor
- **SEO**: `react-helmet-async` ile her sayfada meta tag yönetimi
- **Animasyonlar**: Framer Motion `whileInView` + `initial/animate` pattern
- **Video**: Custom `VideoPlayer` bileşeni (YouTube, direkt URL destekler)
- **Hata yönetimi**: `src/lib/errorHandling.ts` + `ErrorBoundary` bileşeni

## Sık Yapılan Değişiklikler

### Hero metni / site ayarları
Firestore Console → `settings/general` dökümanını düzenle veya `/admin` panelinden değiştir.

### Yeni sayfa ekleme
1. `src/pages/YeniSayfa.tsx` oluştur
2. `src/App.tsx`'de `lazy(() => import('./pages/YeniSayfa'))` ekle
3. `<Route>` tanımla

### Yeni blog yazısı
`/admin` → Posts sekmesi → "Yeni Yazı" butonu

### Firestore kuralları güncelleme
`firestore.rules` dosyasını düzenle → Firebase Console'dan deploy et
