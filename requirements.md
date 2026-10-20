# Panduan Pengerjaan: Portal Berita "Jurnal Polisi"

Dokumen acuan untuk membangun portal berita bergaya referensi (screenshot beranda). Fokus: desain, struktur halaman, stack, database, dan daftar aset.

---

## 1. Ringkasan

| Item | Keputusan |
|---|---|
| Jenis aplikasi | Portal berita + manajemen iklan banner |
| Framework | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS |
| Database / ORM | Prisma + PostgreSQL (MySQL juga bisa), semua ID memakai **UUID** |
| Auth admin | Login `username` + password (**bcrypt**), sesi **JWT** (library `jose`), RBAC via Super Group → Role |
| Upload gambar | Cloudinary / S3 / lokal (`/public/uploads`) |
| Deploy | Vercel, atau VPS langsung (Node + PM2 + Nginx), **tanpa Docker** |

---

## 2. Desain Visual

### 2.1 Palet Warna

| Token | Hex | Pemakaian |
|---|---|---|
| `brand-900` | `#6B0000` | Footer, blok CTA iklan |
| `brand-800` | `#7F0000` | Header utama, badge kategori (solid) |
| `brand-600` | `#B91C1C` | Judul seksi, link hover |
| `accent-red` | `#E50914` | Tombol utama ("Baca Selengkapnya"), label "Berita Utama", garis penanda judul seksi |
| `accent-orange` | `#F28C00` | Lengkung/swoosh dekoratif di header |
| `accent-peach` | `#FFD9A8` | Gradasi swoosh header |
| `surface-tint` | `#FBEFEF` | Kartu kategori cepat (Politik, Hukum, Sosial) |
| `surface` | `#FFFFFF` | Latar halaman & kartu berita |
| `border` | `#E5E7EB` | Garis kartu & pemisah list |
| `ink` | `#1F2937` | Teks utama |
| `muted` | `#6B7280` | Tanggal, deskripsi singkat |

Dark mode: tersedia lewat tombol bulan di header. Gunakan `class` strategy; latar `#120808`, kartu `#1E1010`, teks `#F3E8E8`.

### 2.2 Tipografi

- Font: **Inter** (alternatif: Plus Jakarta Sans) via `next/font`.
- Judul hero: `text-3xl/4xl font-semibold`
- Judul kartu: `text-sm font-semibold leading-snug`, maksimal 3 baris (`line-clamp-3`)
- Meta (tanggal, badge): `text-xs`

### 2.3 Komponen UI Umum

- Radius: kartu `rounded-xl`, nav `rounded-full`, tombol `rounded-md`
- Shadow ringan: `shadow-sm`, hover `shadow-md`
- Badge kategori: outline merah (list samping) dan solid maroon (kartu Berita Pilihan)
- Judul seksi: batang merah vertikal kecil di kiri + teks tebal + link "Lihat Semua →" di kanan

### 2.4 Konfigurasi Tailwind (v4, `globals.css`)

```css
@import "tailwindcss";

@theme {
  --color-brand-900: #6b0000;
  --color-brand-800: #7f0000;
  --color-brand-600: #b91c1c;
  --color-accent-red: #e50914;
  --color-accent-orange: #f28c00;
  --color-accent-peach: #ffd9a8;
  --color-surface-tint: #fbefef;
  --font-sans: var(--font-inter), ui-sans-serif, system-ui;
}

@custom-variant dark (&:where(.dark, .dark *));
```

---

## 3. Tata Letak Halaman Beranda

Container: `max-w-[1280px] mx-auto px-4 lg:px-7`.

```
┌──────────────────────────────────────────────────────────┐
│ HEADER (maroon + swoosh oranye)                          │
│ Logo | Nav pill (Beranda, Kategori▾, Redaksi, Pedoman    │
│ Media Siber, Term of Service) | Search | 🌙 | ☰          │
├───────────────────────────────┬──────────────────────────┤
│ HERO SLIDER (2/3)             │ SIDEBAR (1/3)            │
│ gambar + overlay gelap        │ Banner iklan             │
│ label Berita Utama, judul,    │ "Berita Terbaru" + Lihat │
│ ringkasan, tanggal, tombol    │ Semua, list thumbnail    │
│ dots slider                   │ (scroll vertikal)        │
├───────────────────────────────┴──────────────────────────┤
│ KATEGORI CEPAT: 3 kartu (ikon + judul + subjudul)        │
├──────────────────────────────────────────────────────────┤
│ BERITA PILIHAN: grid 4 kolom (gambar, badge, tanggal,    │
│ judul, ringkasan, "Baca Selengkapnya →")                 │
├──────────────────────────────────────────────────────────┤
│ CTA IKLAN: blok maroon (1/4) + 3 banner iklan            │
├──────────────────────────────────────────────────────────┤
│ FOOTER: Logo | Navigasi | Kategori | Kontak | ilustrasi  │
└──────────────────────────────────────────────────────────┘
```

### Spesifikasi Per Seksi

| Seksi | Layout Tailwind | Catatan |
|---|---|---|
| Header | `sticky top-0 z-50 bg-brand-800` | Swoosh = SVG absolut di belakang logo |
| Nav pill | `hidden lg:flex bg-white rounded-full px-6` | Mobile: hamburger → drawer |
| Hero | `grid lg:grid-cols-[2fr_1fr] gap-5` | Tinggi hero ±300px, `rounded-xl overflow-hidden`, gradient `from-black/70` |
| Berita Terbaru | `max-h-[300px] overflow-y-auto` | Thumbnail 64×48, divider tipis |
| Kategori cepat | `grid grid-cols-1 sm:grid-cols-3 gap-0` | Latar `surface-tint`, ikon maroon |
| Berita Pilihan | `grid sm:grid-cols-2 lg:grid-cols-4 gap-4` | Gambar rasio 16:9 |
| CTA Iklan | `grid lg:grid-cols-[1fr_3fr] gap-4` | Tombol outline putih "Hubungi Kami" |
| Footer | `bg-brand-800 text-white grid md:grid-cols-4` | Ilustrasi gedung di kanan bawah (opacity 30%) |

Responsif: mobile 1 kolom, tablet 2 kolom, desktop 4 kolom. Sidebar hero turun di bawah hero pada layar < `lg`.

---

## 4. Struktur Proyek (Next.js App Router)

```
/
├─ prisma/
│  ├─ schema.prisma
│  └─ seed.ts
├─ public/
│  ├─ images/ (logo, hero, kategori, iklan, footer)
│  └─ uploads/
├─ src/
│  ├─ app/
│  │  ├─ (public)/
│  │  │  ├─ page.tsx                 # Beranda
│  │  │  ├─ berita/[slug]/page.tsx   # Detail berita
│  │  │  ├─ kategori/[slug]/page.tsx
│  │  │  ├─ cari/page.tsx
│  │  │  ├─ redaksi/page.tsx
│  │  │  ├─ pedoman-media-siber/page.tsx
│  │  │  └─ term-of-service/page.tsx
│  │  ├─ admin/                      # Dashboard (dilindungi auth)
│  │  │  ├─ login/ berita/ kategori/ iklan/ slider/ halaman/
│  │  │  └─ pengguna/ super-group/ role/
│  │  └─ api/                        # Route handlers (upload, search)
│  ├─ components/
│  │  ├─ layout/ Header, Navbar, Footer, ThemeToggle
│  │  ├─ home/ HeroSlider, LatestList, QuickCategories, FeaturedGrid, AdCta
│  │  └─ ui/ Badge, Button, NewsCard, SectionTitle
│  ├─ lib/ prisma.ts, jwt.ts, password.ts, rbac.ts, utils.ts
│  ├─ actions/ (server actions CRUD)
│  └─ middleware.ts                  # verifikasi JWT & cek akses
└─ .env
```

---

## 5. Skema Database (Prisma)

Semua `id` memakai UUID (`@default(uuid()) @db.Uuid`). Pengguna login dengan `username`. Struktur akses: **Super Group → Role → Permission**, dan setiap User memiliki satu Role (group diturunkan dari role).

```prisma
generator client { provider = "prisma-client-js" }
datasource db { provider = "postgresql"; url = env("DATABASE_URL") }

enum Status      { DRAFT PUBLISHED ARCHIVED }
enum AdPlacement { SIDEBAR HOME_STRIP ARTICLE_TOP FOOTER }

// ── Akses & Pengguna ─────────────────────────────
model SuperGroup {
  id          String  @id @default(uuid()) @db.Uuid
  name        String  @unique
  slug        String  @unique
  description String?
  isSystem    Boolean @default(false)      // true = tidak boleh dihapus
  roles       Role[]
}

model Role {
  id           String           @id @default(uuid()) @db.Uuid
  name         String
  slug         String
  superGroupId String           @db.Uuid
  superGroup   SuperGroup       @relation(fields: [superGroupId], references: [id], onDelete: Cascade)
  permissions  RolePermission[]
  users        User[]

  @@unique([superGroupId, slug])
}

model Permission {
  id          String           @id @default(uuid()) @db.Uuid
  code        String           @unique     // contoh: "article:publish"
  description String?
  roles       RolePermission[]
}

model RolePermission {
  roleId       String     @db.Uuid
  permissionId String     @db.Uuid
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@id([roleId, permissionId])
}

model User {
  id            String         @id @default(uuid()) @db.Uuid
  username      String         @unique
  name          String
  email         String?        @unique
  passwordHash  String                       // hasil bcrypt
  isActive      Boolean        @default(true)
  lastLoginAt   DateTime?
  roleId        String         @db.Uuid
  role          Role           @relation(fields: [roleId], references: [id])
  articles      Article[]
  refreshTokens RefreshToken[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
}

model RefreshToken {
  id        String    @id @default(uuid()) @db.Uuid
  userId    String    @db.Uuid
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String    @unique
  expiresAt DateTime
  revokedAt DateTime?
  createdAt DateTime  @default(now())
}

// ── Konten ───────────────────────────────────────
model Category {
  id          String    @id @default(uuid()) @db.Uuid
  name        String    @unique
  slug        String    @unique
  tagline     String?                      // "Isu Strategis Bangsa"
  icon        String?
  showInQuick Boolean   @default(false)
  articles    Article[]
}

model Article {
  id          String    @id @default(uuid()) @db.Uuid
  title       String
  slug        String    @unique
  excerpt     String
  content     String    @db.Text
  coverImage  String
  status      Status    @default(DRAFT)
  isHeadline  Boolean   @default(false)    // Hero slider
  isFeatured  Boolean   @default(false)    // Berita Pilihan
  views       Int       @default(0)
  publishedAt DateTime?
  authorId    String    @db.Uuid
  categoryId  String    @db.Uuid
  author      User      @relation(fields: [authorId], references: [id])
  category    Category  @relation(fields: [categoryId], references: [id])
  tags        Tag[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  @@index([status, publishedAt])
  @@index([categoryId])
}

model Tag {
  id       String    @id @default(uuid()) @db.Uuid
  name     String    @unique
  slug     String    @unique
  articles Article[]
}

model Ad {
  id        String      @id @default(uuid()) @db.Uuid
  title     String
  image     String
  link      String?
  placement AdPlacement
  isActive  Boolean     @default(true)
  startsAt  DateTime?
  endsAt    DateTime?
}

model Page {                                // Redaksi, Pedoman Media Siber, ToS
  id      String @id @default(uuid()) @db.Uuid
  slug    String @unique
  title   String
  content String @db.Text
}

model Setting {                             // Kontak, alamat, sosmed, tagline
  key   String @id
  value String
}

model ContactMessage {
  id        String   @id @default(uuid()) @db.Uuid
  name      String
  email     String
  message   String
  createdAt DateTime @default(now())
}
```

### 5.1 Super Group, Role, dan Permission (data seed)

| Super Group | Role | Permission |
|---|---|---|
| **Super Admin** (`isSystem`) | Owner | Semua (`*`), termasuk kelola user, group, role |
| **Redaksi** | Pemimpin Redaksi | `article:*`, `category:*`, `slider:*`, `page:*`, `user:read` |
| **Redaksi** | Editor | `article:create`, `article:update`, `article:publish`, `category:read` |
| **Redaksi** | Reporter | `article:create`, `article:update:own` |
| **Periklanan** | Manajer Iklan | `ad:*`, `setting:update` |
| **Periklanan** | Staf Iklan | `ad:create`, `ad:update` |

Format permission: `modul:aksi` (`:own` = hanya data milik sendiri). Tabel di atas adalah data awal di `seed.ts`; group, role, dan permission selanjutnya dapat diatur dari dashboard admin.

### 5.2 Alur Autentikasi (JWT + bcrypt)

| Langkah | Detail |
|---|---|
| Daftar/buat user | Password di-hash `bcrypt.hash(password, 12)`, simpan di `passwordHash` |
| Login | Cari user by `username`, cek `isActive`, lalu `bcrypt.compare` |
| Access token | JWT (HS256, `jose`), masa berlaku 15 menit, payload: `sub` (UUID user), `username`, `roleId` |
| Refresh token | String acak, masa berlaku 7 hari, **hash-nya** disimpan di tabel `RefreshToken`, dikirim sebagai cookie |
| Cookie | `httpOnly`, `secure`, `sameSite=lax` |
| Refresh | Endpoint `/api/auth/refresh` memutar token (rotation) dan menandai token lama `revokedAt` |
| Logout | Revoke refresh token, hapus cookie |
| Middleware | `middleware.ts` memverifikasi JWT untuk `/admin/*` dan `/api/admin/*` |
| Cek akses | Helper `can(user, "article:publish")` di `lib/rbac.ts`, permission dimuat dari DB per role (di-cache) sehingga perubahan role langsung berlaku |
| Proteksi tambahan | Rate limit login (mis. 5 percobaan/menit per IP+username), pesan error seragam ("username atau password salah") |

---

## 6. Fitur

**Publik:** hero slider (autoplay), berita terbaru, berita pilihan, filter kategori, pencarian (judul/tag), detail berita + berita terkait + tombol bagikan, slot iklan, dark mode, SEO (metadata, OpenGraph, sitemap, JSON-LD `NewsArticle`).

**Admin:** login dengan username, manajemen pengguna, super group, dan role, CRUD berita (editor rich text, mis. Tiptap), kelola kategori, slider headline, iklan per posisi + jadwal tayang, edit halaman statis, pengaturan kontak footer.

---

## 7. Aset Visual (dicari Gemini)

> Catatan: Pinterest cocok untuk **referensi/inspirasi** saja. Untuk produksi, gunakan gambar berlisensi bebas (Unsplash, Pexels, Pixabay) atau buat sendiri, dan jangan memakai ulang logo, lambang, atau materi berhak cipta dari situs referensi.

### 7.1 Daftar Kebutuhan

| Kode | Aset | Ukuran | Format | Lokasi file |
|---|---|---|---|---|
| A1 | Logo situs (versi terang & gelap) | 300×80 | SVG/PNG | `public/images/logo.svg` |
| A2 | Swoosh dekoratif header (oranye) | 1440×140 | SVG | `public/images/header-swoosh.svg` |
| A3 | Foto hero (polisi/pengamanan, aparat, kegiatan nasional) | 1600×900 | WebP | `public/images/hero/` (3 gambar) |
| A4 | Foto berita (patroli, apel, lalu lintas, pelayanan publik) | 1200×675 | WebP | `public/images/news/` (±12) |
| A5 | Ikon kategori (bendera, timbangan, gedung/sekolah) | 64×64 | SVG | `public/images/icons/` |
| A6 | Banner iklan contoh (karangan bunga, UMKM) | 1200×630 | WebP | `public/images/ads/` (±4) |
| A7 | Ilustrasi gedung markas (footer, siluet putih) | 600×300 | SVG/PNG transparan | `public/images/footer-building.png` |
| A8 | Placeholder gambar (fallback) | 1200×675 | WebP | `public/images/placeholder.webp` |

### 7.2 Prompt untuk Gemini

```
Cari referensi dan sumber gambar berlisensi bebas (Unsplash/Pexels/Pixabay,
dan Pinterest hanya untuk referensi gaya) untuk portal berita kepolisian
Indonesia bertema merah maroon dan oranye.

Kebutuhan:
1. 3 foto hero 16:9: pengamanan aparat, apel pasukan, kegiatan nasional
2. 12 foto berita 16:9: patroli, lalu lintas, pelayanan masyarakat, pendidikan, sosial
3. Ikon SVG: bendera, timbangan keadilan, gedung sekolah (gaya outline)
4. 4 contoh banner iklan UMKM 1200x630 (toko bunga, jasa desain, kuliner)
5. Siluet gedung kantor pemerintahan untuk footer (PNG transparan)

Untuk setiap aset berikan: URL sumber, nama pembuat, jenis lisensi,
dan keterangan apakah boleh dipakai komersial.
Hindari wajah yang dapat dikenali dan logo/merek pihak ketiga.
Sajikan hasil dalam tabel.
```

### 7.3 Aturan Pengolahan Aset

- Konversi ke **WebP**, kompres < 200 KB per gambar.
- Gunakan `next/image` dengan `sizes` dan `priority` hanya untuk gambar hero pertama.
- Simpan catatan atribusi di `public/images/CREDITS.md`.

---

## 8. Tahapan Pengerjaan

| Fase | Pekerjaan | Hasil |
|---|---|---|
| 1 | Setup Next.js, Tailwind, token warna, font, Prisma + DB | Proyek berjalan |
| 2 | Layout global: Header, Navbar, Footer, dark mode | Kerangka halaman |
| 3 | Beranda dengan data dummy (seed) | Tampilan mirip referensi |
| 4 | Skema Prisma final + seed + query asli | Beranda terhubung DB |
| 5 | Halaman detail, kategori, pencarian, halaman statis | Sisi publik lengkap |
| 6 | Auth (JWT + bcrypt) + RBAC + dashboard admin + upload gambar | CMS berfungsi |
| 7 | Iklan, SEO, sitemap, optimasi performa | Siap rilis |
| 8 | Testing, deploy, backup DB | Produksi |

---

## 9. Perintah Awal

```bash
npx create-next-app@latest jurnal-polisi --ts --tailwind --app --src-dir
cd jurnal-polisi
npm i prisma @prisma/client bcryptjs jose zod lucide-react embla-carousel-react
npx prisma init
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

`.env`:
```
DATABASE_URL="postgresql://user:pass@localhost:5432/jurnalpolisi"
JWT_SECRET="isi-dengan-string-acak-panjang"
JWT_REFRESH_SECRET="isi-dengan-string-acak-lain"
```

---

## 10. Checklist Kualitas

- [ ] Kontras teks putih di atas maroon memenuhi WCAG AA
- [ ] Semua gambar punya `alt`
- [ ] Skor Lighthouse ≥ 90 (Performance, SEO, Accessibility)
- [ ] Responsif di 360px, 768px, 1280px
- [ ] Slug unik & redirect jika slug berubah
- [ ] Sanitasi konten HTML artikel (cegah XSS)
- [ ] Password tidak pernah disimpan/di-log dalam bentuk asli
- [ ] Setiap route admin dan server action memeriksa permission, bukan hanya status login
- [ ] Akun Owner awal dibuat lewat seed, password wajib diganti saat login pertama
- [ ] Atribusi lisensi aset tercatat
