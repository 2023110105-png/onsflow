# Arsitektur Lengkap SaaS Sistem Kasir — Khusus F&B & Coffee Shop
> Dokumen ini mencakup keputusan arsitektur, tech stack modern 2025,
> struktur folder profesional, panduan fase development dari nol hingga production,
> **serta hasil riset mendalam kompetitor global & nasional Indonesia.**
>
> Kompetitor yang diriset: Toast, Square, Lightspeed, Lavu, Clover, TouchBistro (global)
> dan Moka POS, Majoo, Pawoon, Olsera, Qasir, Nutapos, Labamu (Indonesia).
>
> **Fokus pasar: Kedai Kopi, Kafe, dan Restoran F&B Indonesia.**
> **Tanggal Riset Kompetitor:** April 2026

---

## Daftar Isi

1. [Keputusan Arsitektur](#1-keputusan-arsitektur)
2. [Tech Stack Modern 2025](#2-tech-stack-modern-2025)
3. [Peta Kompetitor](#3-peta-kompetitor)
4. [Database Schema](#4-database-schema)
5. [Fitur Kasir & Transaksi](#5-fitur-kasir--transaksi)
6. [Fitur Keuangan & Finance](#6-fitur-keuangan--finance)
7. [Fitur Operasional F&B](#7-fitur-operasional-fb)
8. [Fitur Pegawai & SDM](#8-fitur-pegawai--sdm)
9. [Fitur Pelanggan & Loyalty](#9-fitur-pelanggan--loyalty)
10. [Fitur Laporan & Analitik](#10-fitur-laporan--analitik)
11. [Fitur AI & Teknologi](#11-fitur-ai--teknologi)
12. [Fitur Integrasi Eksternal](#12-fitur-integrasi-eksternal)
13. [Fitur Keberlanjutan (Sustainability)](#13-fitur-keberlanjutan-sustainability)
14. [Peluang Diferensiasi vs Kompetitor](#14-peluang-diferensiasi-vs-kompetitor)
15. [Struktur Folder Lengkap](#15-struktur-folder-lengkap)
16. [Strategi Multi-Tenant](#16-strategi-multi-tenant)
17. [Realtime Architecture](#17-realtime-architecture)
18. [Flow Kritis F&B](#18-flow-kritis-fb)
19. [AI Layer Architecture](#19-ai-layer-architecture)
20. [Matriks Prioritas & Fase Development](#20-matriks-prioritas--fase-development)
21. [Rekomendasi Skema Database Lengkap](#21-rekomendasi-skema-database-lengkap)
22. [Setup & Konfigurasi](#22-setup--konfigurasi)
23. [Naming Convention](#23-naming-convention)

---

## 1. Keputusan Arsitektur

### Rekomendasi: Modular Monolith, bukan Decoupled penuh

Sebagai solo developer yang membangun SaaS B2B dari nol, pilihan terbaik
bukan Decoupled Architecture (microservices) dan bukan Monolith biasa.
Pilihan yang tepat adalah **Modular Monolith yang siap dipisah kapanpun**.

```
Microservices          Modular Monolith          Tight Monolith
─────────────          ────────────────          ──────────────
Terlalu kompleks  ←    PILIHAN TEPAT       →     Susah scale
untuk solo dev         untuk solo dev            di masa depan
2 repo+                1 repo (monorepo)          1 repo
2x deploy              1 deploy awal             1 deploy
CORS kompleks          Bisa pisah kapanpun       Tidak bisa pisah
Cocok 50+ dev          Cocok solo dev ✓          Cocok proyek kecil
```

### Prinsip utama Modular Monolith

Setiap modul (auth, order, kitchen, inventory, billing, AI) punya boundary
yang jelas — tidak boleh saling import langsung antar modul.
Semua komunikasi antar modul lewat service interface.

### Modul Inti F&B (berbeda dari retail biasa)

| Modul | Penjelasan |
|---|---|
| `order` | Mengelola pesanan Dine-In, Takeaway, dan Ojol |
| `modifier` | Varian produk: ukuran, level gula, jenis susu, topping |
| `kitchen` | KDS (Kitchen Display System) — komunikasi kasir ke barista/dapur |
| `recipe` | BOM (Bill of Materials) — resep produk ke bahan baku |
| `table` | Manajemen meja Dine-In & QR self-ordering |
| `inventory` | Stok berbasis bahan baku (bukan produk jadi) |

### Kapan pisah ke Decoupled?

Pisahkan hanya kalau sudah memenuhi salah satu kondisi ini:
- Lebih dari 10.000 outlet aktif (traffic tinggi)
- KDS butuh server tersendiri karena latensi kritis
- AI service butuh GPU server tersendiri
- Modul `order` skalanya jauh berbeda dari modul `report` 

---

## 2. Tech Stack Modern 2025

### Frontend

| Teknologi | Versi | Fungsi |
|---|---|---|
| Next.js | 15 | Framework utama (App Router + Server Components) |
| React | 19 | UI library |
| Tailwind CSS | 4 | Styling (CSS-native, zero config) |
| shadcn/ui | latest | Komponen UI accessible |
| Zustand | 5 | Client state management |
| TanStack Query | 5 | Server state + caching otomatis |
| tRPC | 11 | Type-safe API client (zero REST boilerplate) |

### Backend

| Teknologi | Versi | Fungsi |
|---|---|---|
| NestJS | 11 | Backend framework (DI, modules, guards) |
| tRPC adapter | 11 | Expose NestJS via tRPC |
| Drizzle ORM | latest | Database queries (3x lebih cepat dari Prisma) |
| Zod | 3 | Schema validation (shared frontend-backend) |
| BullMQ | latest | Job queue untuk background tasks |
| Trigger.dev | 3 | Background jobs modern dengan dashboard |

### Realtime (Kritis untuk F&B)

| Teknologi | Fungsi |
|---|---|
| Supabase Realtime | Sync order ke KDS barista via WebSocket — real-time wajib ada |
| PartyKit | Collaborative table management (fase lanjut) |

### Database

| Teknologi | Fungsi |
|---|---|
| PostgreSQL 16 | Database utama (multi-tenant via schema) |
| pgvector | Vector search untuk AI rekomendasi menu |
| TimescaleDB | Time-series data untuk AI forecasting penjualan |
| Neon DB | Serverless PostgreSQL + database branching per PR |
| Upstash Redis | Serverless Redis (cache, session, rate limit, antrian order) |

### AI Layer

| Teknologi | Fungsi |
|---|---|
| Vercel AI SDK 4 | Streaming AI response, tool calling, multi-provider |
| Claude API (Anthropic) | AI utama — analisis omzet, forecast bahan baku, anomali kas |
| OpenAI API | Fallback + embedding generation |
| Mastra | AI agent orchestration (multi-step reasoning) |
| pgvector | Simpan embedding, semantic search menu |

### Infrastruktur & DevOps

| Teknologi | Fungsi |
|---|---|
| Turborepo | Monorepo management + build cache |
| Docker | Containerization semua service |
| GitHub Actions | CI/CD pipeline |
| Turbo Remote Cache | Cache build CI (hemat 70% waktu) |
| Vercel | Deploy frontend (Next.js) |
| Railway | Deploy backend (NestJS) + background jobs |
| Neon DB | Deploy PostgreSQL serverless |
| Upstash | Deploy Redis serverless |

### Observability

| Teknologi | Fungsi |
|---|---|
| Sentry | Error tracking frontend + backend |
| BetterStack | Log management + uptime monitoring |
| OpenTelemetry | Distributed tracing |

### Billing & Payment

| Teknologi | Fungsi |
|---|---|
| Midtrans | Payment gateway Indonesia (QRIS Dinamis, transfer, e-wallet) |
| Stripe | Kartu kredit + ekspansi internasional |

---

## 3. Peta Kompetitor

### Kompetitor Global

| Produk | Fokus | Harga/Bulan | Kekuatan | Kelemahan |
|---|---|---|---|---|
| **Toast** | Restoran & Kafe | $0–$165+ | Ekosistem lengkap, tip management, KDS | Mahal, hanya iOS/iPad |
| **Square for Restaurants** | Semua skala | $0–$60+ | Gratis plan, mudah dipakai, gift card | Inventory tidak dalam, tidak ada HPP |
| **Lightspeed Restaurant** | F&B menengah-besar | $69–$399+ | Ingredient-level inventory, CRM built-in | Mahal, kompleks |
| **Lavu POS** | Kafe & F&B | Custom | 200+ fitur, iPad native, AI "Marty" | Harga tidak transparan |
| **Clover** | Semua | Custom | Customer-facing display terbaik, modifier group | Terikat payment processor |
| **TouchBistro** | Restoran | $69+ | 50+ laporan, offline mode, fleksibel | Integrasi terbatas, lambat setup |
| **MenuSifu** | Bakery & Kafe | Custom | Time-based discount, batch tracking, bundling | Niche |
| **KORONA POS** | Kafe + Retail | $59–$69+ | Cocok kafe yang jual beans/merchandise | Kurang dikenal |

### Kompetitor Nasional Indonesia

| Produk | Harga/Bulan | Kekuatan | Kelemahan |
|---|---|---|
| **Moka POS** (GoTo) | Custom | Integrasi GoTo, UI bersih, populer | Mahal, bergantung internet |
| **Majoo** | Rp129rb–499rb | All-in-one (kasir+HR+akuntansi+CRM) | Biaya tinggi, kurva belajar |
| **Pawoon** | Rp299rb | Resep & BOM, mudah dipakai, franchise-friendly | Offline sync bermasalah |
| **Olsera** | Rp1,28jt/tahun | Hybrid online/offline, omnichannel | UI kurang modern |
| **Qasir** | Gratis–berbayar | 1M+ pengguna, ringan, QRIS | Fitur sangat basic |
| **Nutapos** | Custom | Khusus kuliner, COGS detail | Kurang dikenal luas |
| **Labamu** | Custom | QR Menu, analisis mendalam, multi-outlet | Baru berkembang |
| **Kasir Pintar** | Gratis–Pro | Lokal, ringan, Android-friendly | Fitur terbatas versi gratis |
| **iSeller** | Custom | Omnichannel, marketplace sync | Lebih fokus retail |

> **Insight kritis:** Kompetitor global (Toast, Square) masih belum bisa masuk Indonesia
> secara penuh karena kendala payment gateway lokal (QRIS, GoPay, OVO)
> dan integrasi ojol lokal. Ini **jendela waktu** untuk membangun sistem yang
> "lebih Indonesia" dari kompetitor global.

---

## 4. Database Schema

### Skema yang WAJIB dirancang dari hari pertama

Ini adalah perbedaan terbesar antara kasir retail dan kasir F&B.
Salah rancang di sini = refactor total saat klien minta fitur modifier.

```
public schema
├── tenants             (id, name, slug, plan_id, created_at)
├── plans               (id, name, price, features)
└── subscriptions       (id, tenant_id, plan_id, status, expires_at)

tenant_{slug} schema   (dibuat otomatis saat kedai daftar)
├── users               (kasir, barista, manager, owner)
├── outlets             (cabang-cabang kedai)
├── tables              (meja Dine-In per outlet)
│
├── products            (menu: Caffe Latte, Americano, dll)
├── categories          (Kopi, Non-Kopi, Makanan, dll)
│
├── product_modifiers   ← KRITIS F&B: grup modifier per produk
│   contoh: "Ukuran", "Jenis Susu", "Level Gula", "Topping"
│
├── modifier_options    ← KRITIS F&B: pilihan dalam tiap grup
│   contoh: Regular(0), Large(+5k) | Oat Milk(+10k), Soya(+8k)
│
├── recipes             ← KRITIS F&B: resep produk (Bill of Materials)
│   relasi: product_id → bahan baku + jumlah yang dipakai
│
├── ingredients         (bahan baku: Biji Kopi, Susu, Sirup Vanilla)
├── ingredient_stock    (stok bahan baku per outlet)
│
├── orders              (pesanan: Dine-In/Takeaway/Ojol + status)
├── order_items         (item pesanan + modifier yang dipilih)
├── order_item_modifiers (modifier per item — many-to-many)
│
├── transactions        (pembayaran — bisa 1 order, bisa split bill)
├── transaction_items   (breakdown item per transaksi)
│
├── inventory_movements (histori keluar-masuk bahan baku)
└── product_embeddings  (pgvector untuk AI rekomendasi menu)
```

### Contoh Order F&B yang Kompleks

```
Order #042 — Meja 7 (Dine-In)
│
├── Item 1: Caffe Latte  Rp 38.000
│   ├── Modifier: Large (+5.000)
│   ├── Modifier: Oat Milk (+10.000)
│   └── Modifier: Less Sugar (0)
│   Total item: Rp 53.000
│
└── Item 2: Croissant  Rp 25.000
    └── Modifier: Extra Butter (0)
    Total item: Rp 25.000

Total order: Rp 78.000
Bayar: Split — QRIS Rp 53.000 + Tunai Rp 25.000
```

---

## 5. Fitur Kasir & Transaksi

### Sudah Ada di Kompetitor (Standar Industri — Wajib Ada)

- Antarmuka kasir touchscreen yang cepat (<10 detik per order)
- Multi-payment method (tunai, QRIS, kartu, e-wallet)
- Split bill (bayar terpisah per orang atau per item)
- QRIS Dinamis (nominal otomatis tanpa input manual)
- Product modifiers / varian (ukuran, susu, gula, topping)
- Nested modifier groups (Ukuran → Jenis Susu → Level Gula → Topping)
- Required vs optional modifier
- Dine-In / Takeaway / Delivery order type
- Offline mode — transaksi tetap jalan tanpa internet
- Struk PDF + printer thermal
- Void / cancel item dengan approval
- Refund (penuh dan parsial)
- Diskon manual dan diskon otomatis per produk
- Hold order / save order (simpan order untuk dilanjut nanti)

### Fitur Kasir Tambahan yang Perlu Diimplementasikan

#### 5.1 — Nested Modifier dengan Required/Optional Flag

**Deskripsi:** Pisahkan modifier yang wajib dipilih (size, milk type) vs opsional
(topping, extra shot). Kasir tidak bisa lanjut tanpa memilih modifier yang required.

**Kompetitor:** Toast, Clover sudah punya. Kompetitor Indonesia belum ada.

**Nilai bisnis:** Mencegah order salah karena kasir lupa konfirmasi size atau jenis susu.

```sql
modifier_groups (
  id, product_id, name, required BOOLEAN,
  min_select INT, max_select INT, sort_order INT
)
```

---

#### 5.2 — Counted Modifier / Quantity Modifier

**Deskripsi:** Pelanggan bisa pilih "Extra Shot" sebanyak 1, 2, atau 3 (bukan hanya ya/tidak).
Setiap quantity menambah harga secara proporsional.

**Contoh:** Extra Shot (+8.000) × 2 = +16.000

**Nilai bisnis:** Meningkatkan average ticket size, akurat untuk barista.

---

#### 5.3 — Order Hold & Tab Management

**Deskripsi:** Kasir bisa "hold" pesanan yang belum dibayar, sambil melayani pelanggan lain.
Di kafe berkonsep, pelanggan sering tambah pesanan beberapa kali selama duduk.

**Nilai bisnis:** Wajib untuk kafe dine-in yang melayani pelanggan yang tinggal lama.

---

#### 5.4 — Customer-Facing Display (CFD)

**Deskripsi:** Layar kedua menghadap pelanggan menampilkan item yang diorder kasir,
total, promosi aktif, dan opsi digital receipt.

**Kompetitor:** Clover unggul di fitur ini vs kompetitor.

**Implementasi:** Layar kedua (tablet/monitor) yang sinkron real-time via WebSocket
dengan kasir utama.

---

#### 5.5 — Dynamic Pricing / Time-Based Price

**Deskripsi:** Harga produk berubah otomatis berdasarkan waktu. Contoh: Happy Hour
14:00–17:00 harga kopi -20%, atau harga naik saat peak hour weekend.

**Status kompetitor:** MenuSifu sudah ada, Toast belum native. **Belum ada di Indonesia — peluang diferensiasi.**

```sql
price_rules (
  id, product_id, outlet_id, name,
  rule_type ENUM('time_based', 'day_based', 'date_range'),
  start_time TIME, end_time TIME,
  days_of_week INT[], -- bitmask: 1=Mon, 2=Tue, dst
  discount_type ENUM('percentage', 'fixed', 'override'),
  discount_value DECIMAL,
  valid_from DATE, valid_until DATE
)
```

---

#### 5.6 — Combo / Bundle Builder

**Deskripsi:** Paket "Kopi + Pastry = hemat Rp15.000" bisa dibuat langsung di POS.
Saat kasir pilih Caffe Latte, sistem tawarkan bundle otomatis.

**Status kompetitor:** MenuSifu dan Toast punya. Kompetitor Indonesia belum ada yang bagus.

```sql
combos (id, name, price, active)
combo_items (id, combo_id, product_id, modifier_options, quantity)
```

---

#### 5.7 — Gift Card & Voucher Digital

**Deskripsi:** Jual gift card digital via QR/link, redeem di kasir. Pelanggan bisa beli
untuk dikirim ke teman.

**Status Indonesia:** Tidak ada satu pun kompetitor lokal yang punya gift card digital. **Peluang diferensiasi besar.**

```sql
gift_cards (
  id, code VARCHAR UNIQUE, initial_balance, remaining_balance,
  purchased_by_customer_id, valid_until DATE, status
)
gift_card_transactions (id, gift_card_id, transaction_id, amount, type)
```

---

#### 5.8 — Order Status Display untuk Pelanggan

**Deskripsi:** Layar TV/monitor di area tunggu menampilkan status order pelanggan:
"Pesanan #42 — Sedang Dibuat", "Pesanan #38 — Siap Diambil".

**Status Indonesia:** Tidak ada. Sangat relevan untuk kafe dengan counter pickup.

---

## 6. Fitur Keuangan & Finance

#### 6.1 — Shift & Cash Drawer Management (KRITIS)

**Deskripsi:** Manajemen shift kasir yang lengkap:
- Buka shift: input modal awal (uang di laci)
- Selama shift: semua transaksi tunai tercatat
- Tutup shift: hitung total tunai seharusnya, bandingkan dengan fisik
- Selisih lebih/kurang → dicatat dan perlu penjelasan

**Status kompetitor:** Toast, Square, Clover, Pawoon, Moka semua punya.
**Gap terbesar — belum ada sama sekali di arsitektur awal.**

```sql
shifts (
  id, outlet_id, user_id, opened_at, closed_at,
  opening_cash DECIMAL,   -- modal awal
  expected_cash DECIMAL,  -- seharusnya ada (dihitung sistem)
  actual_cash DECIMAL,    -- hasil hitung fisik kasir
  difference DECIMAL,     -- selisih (+ atau -)
  notes TEXT, status ENUM('open', 'closed')
)
shift_cash_movements (
  id, shift_id, type ENUM('opening', 'petty_cash_in', 'petty_cash_out', 'closing'),
  amount DECIMAL, description TEXT, approved_by INT
)
```

---

#### 6.2 — Petty Cash Management

**Deskripsi:** Pengeluaran kas kecil di luar transaksi (beli keperluan dapur, bayar ojek, dll).
Dicatat per shift, masuk ke laporan keuangan harian.

**Status Indonesia:** Majoo punya basic version. Tidak ada yang lengkap.

---

#### 6.3 — Rekonsiliasi Harian Otomatis

**Deskripsi:** Sistem otomatis membandingkan:
- Total transaksi per payment method
- Uang tunai di laci vs yang seharusnya
- Settlement QRIS/EDC vs yang tercatat di POS

**Nilai bisnis:** Owner tidak perlu rekonsiliasi manual tiap malam.
**Tidak dimiliki kompetitor Indonesia — killer feature.**

---

#### 6.4 — Jurnal Akuntansi Otomatis

**Deskripsi:** Setiap transaksi generate double-entry journal otomatis:

```
Penjualan Caffe Latte Rp45.000:
  Debit:  Kas/Bank        Rp45.000
  Kredit: Pendapatan Kopi Rp45.000
```

Export ke format Accurate, Jurnal.id, atau Excel untuk akuntan.

**Status Indonesia:** Hanya Jurnal Touch (add-on software akuntansi) yang punya ini. **Diferensiasi kuat.**

```sql
journal_entries (id, transaction_id, date, description)
journal_lines (
  id, entry_id, account_code, account_name,
  debit DECIMAL, credit DECIMAL
)
chart_of_accounts (id, code, name, type, parent_id)
```

---

#### 6.5 — Laporan Arus Kas (Cash Flow)

**Deskripsi:** Laporan sederhana kas masuk vs kas keluar per hari/minggu/bulan.
Berbeda dari laporan omzet — ini tentang uang tunai aktual.

**Status kompetitor:** Toast dan Lightspeed punya. Tidak ada kompetitor Indonesia yang punya.

---

#### 6.6 — Deposit & Uang Muka Pesanan

**Deskripsi:** Pelanggan bayar DP dulu (misal untuk catering atau pesanan batch),
sisa dibayar saat ambil.

**Relevansi F&B:** Kafe yang terima pesanan custom (hampers, kue ulang tahun, catering).

---

## 7. Fitur Operasional F&B

#### 7.1 — Manajemen Antrian Digital (Queue Management)

**Deskripsi:** Sistem nomor antrian digital:
- Pelanggan ambil nomor via QR atau layar touch
- KDS / layar di bar tampilkan nomor yang sedang dilayani
- Notifikasi WhatsApp/SMS saat order siap

**Status Indonesia:** Tidak ada yang lengkap dengan notifikasi WA.

```sql
queues (
  id, outlet_id, queue_number VARCHAR, order_id INT,
  status ENUM('waiting', 'preparing', 'ready', 'called', 'done'),
  created_at, called_at, completed_at
)
```

---

#### 7.2 — Void & Refund Workflow dengan Approval

**Deskripsi:** Alur yang aman:
1. Kasir request void/refund → butuh alasan
2. Notifikasi ke supervisor/manager
3. Manager approve via PIN atau app mobile
4. Void/refund baru dieksekusi
5. Audit log lengkap siapa approve, jam berapa

**Status kompetitor:** Toast punya role-based approval.
**Status Indonesia:** Semua kompetitor Indonesia tidak punya approval workflow.

```sql
void_requests (
  id, transaction_id, order_item_id, requested_by, reason TEXT,
  status ENUM('pending', 'approved', 'rejected'),
  approved_by INT, approved_at TIMESTAMP, notes TEXT
)
```

---

#### 7.3 — Purchase Order (PO) ke Supplier

**Deskripsi:** Modul PO lengkap:
- Buat PO dari stok yang menipis (manual atau AI generate)
- Kirim ke supplier via email/WhatsApp
- Catat harga beli aktual saat barang datang (Good Receipt)
- Bandingkan harga beli vs HPP untuk analisis margin

**Status Indonesia:** Tidak ada satu pun kompetitor POS lokal yang punya PO module terintegrasi.

```sql
suppliers (id, name, contact_person, phone, email, address, payment_terms)
purchase_orders (
  id, supplier_id, outlet_id, status ENUM('draft','sent','received','cancelled'),
  expected_delivery DATE, notes TEXT, created_by INT
)
po_items (id, po_id, ingredient_id, quantity_ordered, unit_price, quantity_received)
good_receipts (id, po_id, received_by INT, received_at, notes)
```

---

#### 7.4 — Reservasi Meja (Table Reservation)

**Deskripsi:** Pelanggan booking meja via link/QR:
- Pilih tanggal, waktu, jumlah tamu
- Konfirmasi otomatis via WhatsApp
- Meja terkunci di TableMap sesuai slot
- Reminder H-1 via WhatsApp
- Deposit booking opsional (via QRIS link)

**Status Indonesia:** Labamu dan Moka basic. Belum ada yang terintegrasi penuh dengan TableMap + WA notif.

```sql
reservations (
  id, outlet_id, table_id, customer_id,
  party_size INT, reserved_date DATE, reserved_time TIME,
  duration_minutes INT, status ENUM('pending','confirmed','seated','done','cancelled','no_show'),
  deposit_paid DECIMAL, special_request TEXT,
  confirmed_at, reminder_sent_at
)
```

---

#### 7.5 — Stock Opname (Stok Fisik)

**Deskripsi:** Proses hitung stok fisik bahan baku:
- Buat sesi opname per outlet
- Staf input jumlah fisik per bahan baku (via mobile)
- Sistem bandingkan dengan stok teoritis (dari BOM + gerakan)
- Selisih di-flag untuk investigasi
- Adjustment otomatis ke stok sistem

**Status Indonesia:** Tidak ada kompetitor lokal yang punya stock opname terintegrasi.

```sql
stock_takes (
  id, outlet_id, status ENUM('draft','in_progress','completed'),
  started_by INT, started_at, completed_at
)
stock_take_items (
  id, stock_take_id, ingredient_id,
  system_quantity DECIMAL, -- teoritis
  actual_quantity DECIMAL, -- fisik
  difference DECIMAL, notes TEXT
)
```

---

#### 7.6 — Waste / Spoilage Tracking

**Deskripsi:** Catat bahan baku yang terbuang/rusak:
- Jenis: expired, spill, over-portion, prep waste
- Perhitungan nilai kerugian otomatis (qty × harga beli)
- Laporan waste per periode untuk optimasi

**Status kompetitor:** Lightspeed Restaurant punya. Kompetitor Indonesia belum ada.

```sql
waste_logs (
  id, outlet_id, ingredient_id, quantity DECIMAL,
  waste_type ENUM('expired','spill','prep','overcooked','other'),
  cost_value DECIMAL, recorded_by INT, notes TEXT, recorded_at
)
```

---

#### 7.7 — Printer Routing Cerdas (Multi-Zone)

**Deskripsi:** Routing cetak yang lebih canggih — set per kategori menu → printer mana:
- Minuman panas → Bar Station Printer
- Makanan berat → Kitchen Printer
- Minuman dingin + Es → Cold Bar Printer
- Backup jika printer offline: cetak ke printer lain

**Status kompetitor:** Toast punya multi-zone routing. Tidak ada kompetitor Indonesia.

```sql
print_stations (id, outlet_id, name, ip_address, port, type, backup_station_id)
category_print_routing (id, category_id, outlet_id, station_id)
```

---

#### 7.8 — Self-Service Kiosk Mode

**Deskripsi:** Mode kasir untuk layar sentuh yang dioperasikan pelanggan sendiri:
- Pelanggan browse menu, pilih modifier, bayar sendiri
- Terintegrasi langsung ke KDS
- Kurangi antrian di counter saat peak hour
- Bisa upsell otomatis ("Tambah pastry?")

**Status kompetitor:** Square, Toast, Clover semua punya.
**Belum ada di Indonesia.**

**Implementasi:** Halaman baru `(kiosk)/[outletId]/page.tsx` dengan mode fullscreen.

---

## 8. Fitur Pegawai & SDM

#### 8.1 — Penjadwalan Shift Karyawan (Staff Scheduling)

**Deskripsi:** Jadwal kerja visual per minggu:
- Manager drag-drop shift ke karyawan
- Validasi: tidak ada konflik jadwal, tidak melebihi jam maksimal
- Karyawan lihat jadwal mereka via mobile app
- Notifikasi perubahan jadwal via WhatsApp

**Status Indonesia:** Majoo punya basic. Tidak ada yang punya validasi overtime otomatis.

```sql
staff_schedules (
  id, outlet_id, user_id, shift_date DATE,
  start_time TIME, end_time TIME,
  position VARCHAR, -- kasir / barista / pelayan / supervisor
  notes TEXT, status ENUM('scheduled','confirmed','swapped','cancelled')
)
schedule_swap_requests (
  id, requester_id, target_id, shift_id,
  status ENUM('pending','approved','rejected'), approved_by INT
)
```

---

#### 8.2 — Absensi & Clock In/Out via POS

**Deskripsi:** Karyawan tap PIN atau scan wajah di tablet untuk clock in/out.
Terintegrasi langsung dengan shift schedule:
- Tidak bisa clock in sebelum jadwal mulai (configurable buffer 15 menit)
- Overtime otomatis terdeteksi jika clock out melebihi jadwal

**Status Indonesia:** Majoo punya basic absensi. Tidak ada integrasi langsung dengan POS.

```sql
attendance_logs (
  id, user_id, outlet_id, shift_schedule_id,
  clock_in TIMESTAMP, clock_out TIMESTAMP,
  clock_in_method ENUM('pin','face','manual'),
  late_minutes INT, early_out_minutes INT, overtime_minutes INT,
  approved_by INT
)
```

---

#### 8.3 — Tip Management & Distribusi Service Charge

**Deskripsi:** Di Indonesia, service charge dikumpulkan dan dibagi ke karyawan.
Sistem harus bisa:
- Hitung total service charge per shift/periode
- Distribusi otomatis berdasarkan aturan (jam kerja, posisi, dll)
- Laporan detail per karyawan berapa dapat tip

**Status kompetitor:** Toast Tips Manager adalah yang terbaik di dunia.
**Status Indonesia:** Tidak ada satu pun yang punya ini. Peluang besar.**

```sql
tip_pools (
  id, outlet_id, period_start DATE, period_end DATE,
  total_service_charge DECIMAL, status ENUM('open','calculated','distributed')
)
tip_distributions (
  id, pool_id, user_id, hours_worked DECIMAL,
  distribution_percentage DECIMAL, amount DECIMAL
)
tip_rules (
  id, outlet_id, rule_name VARCHAR,
  basis ENUM('hours_worked','points','percentage','custom'),
  staff_positions TEXT[] -- posisi yang dapat bagian
)
```

---

#### 8.4 — Performa Kasir & Karyawan

**Deskripsi:** Dashboard performa individual karyawan:
- Total penjualan per kasir per shift
- Rata-rata waktu transaksi
- Jumlah void/discount yang diminta
- Item paling sering terjual per kasir (upsell performance)
- Keterlambatan clock in

---

#### 8.5 — Onboarding Karyawan Digital

**Deskripsi:** Proses masuk karyawan baru:
- Input data personal (KTP, nomor HP, rekening)
- Tandatangan perjanjian kerja digital (e-signature)
- Briefing menu & SOP via video dalam app
- Akses hak diaktifkan setelah onboarding selesai

**Status kompetitor:** Toast punya. Status Indonesia: Tidak ada.

---

#### 8.6 — Hak Akses Granular (Role-Based Access Control)

**Deskripsi:** Setiap role punya permission yang bisa dikonfigurasi:

| Aksi | Kasir | Barista | Supervisor | Manager | Owner |
|---|---|---|---|---|---|
| Void item | ❌ | ❌ | ✅ | ✅ | ✅ |
| Diskon manual | ❌ | ❌ | ✅ | ✅ | ✅ |
| Lihat laporan | ❌ | ❌ | Outlet saja | ✅ | ✅ |
| Edit harga | ❌ | ❌ | ❌ | ✅ | ✅ |
| Export data | ❌ | ❌ | ❌ | ✅ | ✅ |

**Status kompetitor:** Semua global kompetitor punya.
**Status Indonesia:** Sangat lemah di semua kompetitor lokal.

```sql
roles (id, tenant_id, name, description)
permissions (id, resource VARCHAR, action VARCHAR, description)
role_permissions (role_id, permission_id)
```

---

## 9. Fitur Pelanggan & Loyalty

#### 9.1 — CRM & Profil Pelanggan

**Deskripsi:** Database pelanggan yang detail:
- Nama, nomor HP, email, tanggal lahir
- Riwayat order lengkap
- Minuman favorit (dari data historis)
- Total spend lifetime
- Frekuensi kunjungan (RFM score — Recency, Frequency, Monetary)

**Status Indonesia:** Majoo punya basic CRM. Tidak ada yang punya RFM scoring.

```sql
customers (
  id, tenant_id, name, phone VARCHAR UNIQUE, email,
  birth_date DATE, gender, joined_at,
  total_lifetime_spend DECIMAL, visit_count INT,
  last_visit_at TIMESTAMP, rfm_score DECIMAL,
  preferred_outlet_id INT, notes TEXT
)
customer_preferences (
  id, customer_id, product_id, modifier_snapshot JSONB,
  order_count INT -- berapa kali pesan ini
)
```

---

#### 9.2 — Program Loyalty & Poin

**Deskripsi:** Sistem poin pelanggan:
- Earn: Rp1.000 = 1 poin (bisa dikonfigurasi per tier)
- Tier: Bronze (0–999 poin), Silver (1000–4999), Gold (5000+), Platinum (15000+)
- Redeem: poin ditukar diskon/produk gratis
- Bonus poin: di hari ulang tahun, produk tertentu, event khusus
- Expiry: poin kadaluarsa setelah X bulan jika tidak aktif

**Status Indonesia:** Moka dan Majoo punya basic. Tidak ada yang punya multi-tier.

```sql
loyalty_programs (id, tenant_id, name, earn_rate DECIMAL, expiry_months INT)
loyalty_tiers (
  id, program_id, name, min_points INT,
  earn_multiplier DECIMAL, perks JSONB
)
customer_points (id, customer_id, program_id, total_points INT, tier_id INT, tier_updated_at)
point_transactions (
  id, customer_id, transaction_id, type ENUM('earn','redeem','expire','bonus'),
  points INT, description TEXT, expires_at
)
```

---

#### 9.3 — Stamp Card Digital (Cap Digital)

**Deskripsi:** Pengganti kartu cap fisik. Beli 9 kopi, kopi ke-10 gratis.
Pelanggan lihat progress di WhatsApp atau link QR personal.

**Perbedaan dari poin:** Stamp card lebih sederhana dan familiar untuk pelanggan casual.

**Status Indonesia:** Tidak ada kompetitor yang punya ini. **Diferensiasi menarik.**

```sql
stamp_cards (
  id, tenant_id, product_category_id,
  stamps_required INT, reward_description TEXT
)
customer_stamps (id, customer_id, stamp_card_id, current_stamps INT, completed_count INT)
```

---

#### 9.4 — Voucher & Kode Promo

**Deskripsi:** Generate dan distribute kode promo:
- Fixed discount atau persentase
- Berlaku untuk produk/kategori tertentu
- Batas penggunaan (total/per pelanggan)
- Tracking redemption

```sql
vouchers (
  id, tenant_id, code VARCHAR UNIQUE, type ENUM('percentage','fixed','free_item'),
  discount_value DECIMAL, product_id INT,
  max_uses INT, max_uses_per_customer INT, current_uses INT,
  min_transaction DECIMAL, valid_from DATE, valid_until DATE
)
voucher_redemptions (id, voucher_id, customer_id, transaction_id, redeemed_at)
```

---

#### 9.5 — Feedback & Rating Pelanggan

**Deskripsi:** Setelah transaksi, pelanggan dapat QR/link untuk rating cepat:
- Rating bintang 1–5 per order
- Komentar opsional
- Alert ke manager jika rating ≤ 2 bintang (unhappy customer alert)

**Status Indonesia:** Tidak ada kompetitor yang punya. **Fitur unik.**

---

#### 9.6 — Subscription Kopi (Coffee Subscription)

**Deskripsi:** Pelanggan berlangganan kopi bulanan:
- Contoh: 20 Americano/bulan, hemat 25% = Rp200.000/bulan
- Bayar di awal, kredit dikurangi tiap order
- Auto-renew via Midtrans recurring payment

**Status Indonesia:** Tidak ada satu pun. **Sangat unik untuk pasar Indonesia.**

```sql
subscription_plans (
  id, tenant_id, name, product_id, quantity_per_period INT,
  period ENUM('weekly','monthly'), price DECIMAL
)
customer_subscriptions (
  id, customer_id, plan_id, status ENUM('active','paused','cancelled'),
  start_date DATE, next_renewal DATE, remaining_credits INT
)
```

---

## 10. Fitur Laporan & Analitik

#### 10.1 — Laporan HPP & Margin per Menu (KRITIS)

**Deskripsi:** Laporan profitabilitas real per produk:
- Harga jual − HPP (dari BOM) = Gross Margin
- Ranking menu dari yang paling menguntungkan
- Tren margin dari waktu ke waktu

**Status Indonesia:** Hanya Nutapos yang punya COGS detail. **Gap besar.**

---

#### 10.2 — Laporan Kinerja Kasir per Shift

- Total transaksi per kasir
- Nilai rata-rata transaksi
- Jumlah void dan alasan
- Jumlah diskon yang diberikan
- Selisih kas shift

---

#### 10.3 — Laporan Konsumsi Bahan Baku

- Bahan baku apa yang paling banyak dipakai
- Biaya bahan baku per periode
- Tren konsumsi: bulan ini vs bulan lalu
- Prediksi kebutuhan bahan baku minggu depan (dari AI)

---

#### 10.4 — Laporan Waste & Spoilage

- Total kerugian dari waste per periode
- Bahan baku yang paling sering terbuang
- Perbandingan waste aktual vs benchmark

---

#### 10.5 — Dashboard Perbandingan Antar Cabang

- Omzet per outlet (bar chart)
- Outlet dengan margin tertinggi
- Menu terlaris per outlet (bisa berbeda antar lokasi)

---

#### 10.6 — Laporan Jam Sibuk (Heatmap)

**Deskripsi:** Heatmap jam × hari menampilkan volume transaksi.
Berguna untuk scheduling karyawan dan manajemen bahan baku.

**Format:** Matrix 24 jam × 7 hari dengan warna intensitas.

---

#### 10.7 — Laporan Pajak (PPN & PPh)

- Total PPN yang dikumpulkan per periode
- Format siap lapor ke SPT
- Laporan PPh 21 untuk karyawan (dari data payroll)

**Status Indonesia:** Hanya Accurate POS yang punya ini. Tidak ada POS murni yang punya.

---

#### 10.8 — Export Multi-Format

Semua laporan bisa diexport ke PDF (arsip), Excel/CSV (analisis),
JSON (integrasi), dan format Accurate/Jurnal.id (akuntansi).

---

## 11. Fitur AI & Teknologi

#### 11.1 — AI Rekomendasi Upsell di Layar Kasir

**Deskripsi:** Saat kasir input order, sistem AI tampilkan saran:
"Pelanggan yang pesan Caffe Latte biasanya juga pesan Croissant — tawarkan?"

**Implementasi:** Collaborative filtering berbasis order history via pgvector.

---

#### 11.2 — AI Menu Engineering Real-Time

**Deskripsi:** Klasifikasi otomatis menu setiap hari:

| Kategori | Kriteria | Tindakan |
|---|---|---|
| **Stars** | Populer + margin tinggi | Highlight di kasir |
| **Plowhorses** | Populer + margin rendah | Naikkan harga atau kurangi porsi |
| **Puzzles** | Tidak populer + margin tinggi | Perlu promosi |
| **Dogs** | Tidak populer + margin rendah | Pertimbangkan hapus |

Kasir otomatis dapat badge "Rekomendasikan Hari Ini" di menu Stars.

---

#### 11.3 — AI Prediksi Waste Bahan Baku

**Deskripsi:** Berdasarkan forecast penjualan, AI prediksi bahan baku apa yang
berisiko tidak habis terpakai sebelum expired. Alert ke manager H-2 sebelum expired.

---

#### 11.4 — AI Natural Language Business Query

**Deskripsi:** Owner bisa tanya dalam bahasa natural:
- "Kenapa omzet Sabtu kemarin turun 30% dibanding Sabtu sebelumnya?"
- "Menu mana yang paling untung bulan Ramadan?"
- "Kasir siapa yang paling banyak proses void?"

**Implementasi:** Claude API dengan konteks data dari TimescaleDB.

---

#### 11.5 — Voice Order untuk Barista (Inovatif)

**Deskripsi:** Barista bisa update status order via suara:
"Order 42 — Caffe Latte — Done"
KDS otomatis update status tanpa sentuh layar.

**Status kompetitor:** Belum ada yang implementasi ini. **First mover advantage.**

---

#### 11.6 — Computer Vision — Deteksi Porsi Tidak Konsisten

**Deskripsi:** Kamera di station barista/dapur mendeteksi apakah ukuran/porsi
minuman sesuai standar. Alert jika terlalu sedikit atau terlalu banyak.

**Status kompetitor:** Belum ada yang punya ini di POS. Very innovative.

---

## 12. Fitur Integrasi Eksternal

#### 12.1 — Integrasi GoFood & GrabFood (KRITIS)

**Deskripsi:** Order dari platform ojol masuk otomatis ke KDS tanpa input manual kasir.
Sinkronisasi menu dan harga dua arah. Laporan gabungan omzet dine-in + ojol dalam satu dashboard.

**Status Indonesia:** Moka punya sebagian. **Tidak ada yang punya dua arah penuh.**
Fitur yang paling sering diminta owner dengan 40%+ revenue dari ojol.

```sql
delivery_platform_orders (
  id, platform ENUM('gofood','grabfood','shopeefood','traveloka_eats'),
  platform_order_id VARCHAR, outlet_id,
  order_data JSONB,      -- raw dari platform
  mapped_order_id INT,   -- ke orders table kita
  status, imported_at
)
menu_platform_mapping (
  id, product_id, platform, platform_product_id, platform_price DECIMAL
)
```

---

#### 12.2 — WhatsApp Business API (Notifikasi & Marketing)

- Laporan harian otomatis ke owner jam 23:00
- Alert stok menipis → ke manager
- Konfirmasi reservasi → ke pelanggan
- Notifikasi order siap → ke pelanggan (untuk pickup)
- Blast promosi ke segment pelanggan (loyalty tier tertentu)

**Status Indonesia:** Tidak ada kompetitor yang punya ini natively.

---

#### 12.3 — Integrasi Akuntansi (Accurate & Jurnal.id)

Sinkronisasi dua arah: transaksi POS → jurnal akuntansi otomatis,
invoice pembelian → biaya di akuntansi, payroll → beban gaji.

---

#### 12.4 — Integrasi E-Commerce / Marketplace

Untuk kafe yang jual produk retail (kopi beans, merchandise):
sinkronisasi stok dengan Tokopedia/Shopee/TikTok Shop, order marketplace
masuk ke satu dashboard.

**Status Indonesia:** Olsera dan iSeller punya ini.

---

#### 12.5 — Open API & Webhook untuk Partner

API publik untuk developer dan partner: webhook saat order masuk / transaksi selesai,
REST API untuk integrasi custom, developer documentation.

---

#### 12.6 — Integrasi Printer Label

Cetak label untuk takeaway/delivery: nama pelanggan, nomor order, item, waktu siap,
barcode untuk scan di konter pickup, label alergen.

---

## 13. Fitur Keberlanjutan (Sustainability)

#### 13.1 — Digital Receipt (Struk Digital)

Pilihan struk digital via WhatsApp, QR di layar kasir, atau email.
Kurangi kertas thermal, biaya operasional lebih rendah.

---

#### 13.2 — Pelacak Sampah & Waste Dashboard

Visualisasi dampak lingkungan: kg bahan baku terbuang per bulan,
estimasi kerugian finansial, tren apakah waste berkurang setelah intervensi.

---

#### 13.3 — Digital Menu (QR Menu Tanpa Cetak)

Menu digital via QR yang bisa diupdate real-time:
- Harga dan ketersediaan otomatis update saat stok habis
- Foto menu berkualitas tinggi
- Filter alergen / vegan / halal

**Status Indonesia:** Labamu punya. Tidak ada yang punya filter alergen.

---

#### 13.4 — Laporan Jejak Karbon Sederhana

Estimasi CO2 dari operasi kedai berdasarkan konsumsi listrik, packaging, dan waste.

**Status kompetitor:** Belum ada yang punya ini. **Sangat inovatif untuk branding.**

---

## 14. Peluang Diferensiasi vs Kompetitor

### Diferensiasi Level 1 — Tidak Ada di Kompetitor Indonesia

| Fitur | Status Global | Status Indonesia | Nilai Bisnis |
|---|---|---|---|
| **Shift & Cash Drawer Management** | Semua global punya | Tidak ada yang lengkap | ⭐⭐⭐⭐⭐ |
| **Tip/Service Charge Distribution** | Toast unggul | Tidak ada | ⭐⭐⭐⭐⭐ |
| **Purchase Order ke Supplier** | Lightspeed punya | Tidak ada | ⭐⭐⭐⭐⭐ |
| **Jurnal Akuntansi Otomatis** | Toast/Square ada | Hanya Jurnal Touch | ⭐⭐⭐⭐⭐ |
| **Gift Card Digital** | Square/Toast punya | Tidak ada | ⭐⭐⭐⭐ |
| **Coffee Subscription** | KORONA ada | Tidak ada | ⭐⭐⭐⭐ |
| **Stamp Card Digital** | Beberapa ada | Tidak ada | ⭐⭐⭐⭐ |
| **Antrian Digital + WA Notif** | Pawoon basic | Tidak ada lengkap | ⭐⭐⭐⭐ |
| **Stock Opname Terintegrasi** | Lightspeed punya | Tidak ada | ⭐⭐⭐⭐ |
| **Void & Refund Approval Workflow** | Toast punya | Tidak ada | ⭐⭐⭐⭐ |
| **AI Upsell Real-Time di Kasir** | Lavu "Marty" ada | Tidak ada | ⭐⭐⭐⭐ |
| **WhatsApp Business Notifikasi** | Tidak ada global | Tidak ada | ⭐⭐⭐⭐ |
| **RFM Customer Scoring** | Beberapa ada | Tidak ada | ⭐⭐⭐ |
| **Self-Service Kiosk Mode** | Semua global punya | Tidak ada | ⭐⭐⭐ |
| **Rekonsiliasi Harian Otomatis** | Toast ada | Tidak ada | ⭐⭐⭐ |

### Diferensiasi Level 2 — Belum Ada di Kompetitor Global

| Fitur | Keterangan | Nilai Bisnis |
|---|---|---|
| **Integrasi GoFood/GrabFood Dua Arah** | Ada yang satu arah, belum dua arah | ⭐⭐⭐⭐⭐ |
| **Voice Order untuk Barista** | Belum ada di POS manapun | ⭐⭐⭐ |
| **WhatsApp Laporan Harian Auto** | Belum ada natively | ⭐⭐⭐⭐ |
| **AI Prediksi Waste Bahan Baku** | Baru Lightspeed basic | ⭐⭐⭐ |
| **Jejak Karbon per Transaksi** | Belum ada di POS | ⭐⭐ |
| **Coffee Subscription + Auto-renew QRIS** | KORONA ada tapi tidak WA-based | ⭐⭐⭐⭐ |

---

## 15. Struktur Folder Lengkap

### Gambaran Monorepo

```
onsflow/
├── apps/
│   ├── web/                    # Next.js 15 — kasir + dashboard + KDS
│   ├── api/                    # NestJS 11 — backend utama
│   └── mobile/                 # Expo + React Native (fase 3, owner)
├── packages/
│   ├── ui/                     # Komponen shadcn shared
│   ├── types/                  # TypeScript types shared
│   ├── utils/                  # Helper functions shared
│   ├── validators/             # Zod schemas shared
│   └── config/                 # ESLint, Tailwind, TS config
├── turbo.json
├── package.json
├── docker-compose.yml
└── .github/
    └── workflows/
        ├── ci.yml
        └── deploy.yml
```

---

### apps/web — Next.js 15

```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   │
│   ├── (kasir)/                         # Tampilan POS fullscreen
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── [outletId]/
│   │       └── page.tsx                 # Kasir per outlet/cabang
│   │
│   ├── (kds)/                           # Kitchen/Bar Display System
│   │   ├── layout.tsx
│   │   └── [outletId]/
│   │       ├── page.tsx                 # KDS utama (semua station)
│   │       ├── bar/page.tsx             # KDS khusus Bar/Barista
│   │       └── kitchen/page.tsx         # KDS khusus Dapur
│   │
│   ├── (kiosk)/                         # Self-Service Kiosk
│   │   └── [outletId]/page.tsx          # Mode fullscreen untuk pelanggan
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   │
│   │   ├── pesanan/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── menu/
│   │   │   ├── page.tsx
│   │   │   ├── tambah/page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── modifier/page.tsx
│   │   │   ├── combo/page.tsx           # Bundle Builder
│   │   │   └── harga-dinamis/page.tsx   # Time-Based Pricing
│   │   │
│   │   ├── resep/
│   │   │   ├── page.tsx
│   │   │   └── [productId]/page.tsx
│   │   │
│   │   ├── bahan-baku/
│   │   │   ├── page.tsx
│   │   │   ├── alert/page.tsx
│   │   │   ├── gerakan/page.tsx
│   │   │   ├── opname/page.tsx          # Stock Opname
│   │   │   └── waste/page.tsx           # Waste Tracking
│   │   │
│   │   ├── supplier/                    # Purchase Order
│   │   │   ├── page.tsx
│   │   │   └── po/page.tsx
│   │   │
│   │   ├── meja/
│   │   │   ├── page.tsx
│   │   │   └── [outletId]/page.tsx
│   │   │
│   │   ├── reservasi/                   # Table Reservation
│   │   │   └── page.tsx
│   │   │
│   │   ├── antrian/                     # Queue Management
│   │   │   └── page.tsx
│   │   │
│   │   ├── pelanggan/                   # CRM
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── loyalty/page.tsx
│   │   │   ├── stamp/page.tsx
│   │   │   ├── voucher/page.tsx
│   │   │   ├── gift-card/page.tsx
│   │   │   └── subscription/page.tsx
│   │   │
│   │   ├── karyawan/
│   │   │   ├── page.tsx
│   │   │   ├── [id]/page.tsx
│   │   │   ├── jadwal/page.tsx          # Staff Scheduling
│   │   │   ├── absensi/page.tsx         # Attendance
│   │   │   ├── onboarding/page.tsx      # Digital Onboarding
│   │   │   └── service-charge/page.tsx  # Tip Distribution
│   │   │
│   │   ├── shift/                       # Shift Management
│   │   │   └── page.tsx
│   │   │
│   │   ├── laporan/
│   │   │   ├── page.tsx
│   │   │   ├── penjualan/page.tsx
│   │   │   ├── hpp/page.tsx
│   │   │   ├── bahan-baku/page.tsx
│   │   │   ├── waste/page.tsx
│   │   │   ├── jam-sibuk/page.tsx       # Heatmap
│   │   │   ├── kasir/page.tsx           # Cashier Performance
│   │   │   ├── keuangan/page.tsx
│   │   │   ├── arus-kas/page.tsx        # Cash Flow
│   │   │   ├── pajak/page.tsx
│   │   │   └── karyawan/page.tsx
│   │   │
│   │   ├── cabang/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   │
│   │   ├── pengaturan/
│   │   │   ├── page.tsx
│   │   │   ├── printer/page.tsx
│   │   │   ├── printer-routing/page.tsx # Multi-Zone Routing
│   │   │   ├── pajak/page.tsx
│   │   │   ├── service-charge/page.tsx
│   │   │   ├── rbac/page.tsx            # Role & Permission
│   │   │   └── integrasi/page.tsx       # Ojol & Akuntansi
│   │   │
│   │   └── ai-insight/
│   │       ├── page.tsx
│   │       ├── forecast/page.tsx
│   │       ├── menu-engineering/page.tsx
│   │       ├── rekomendasi/page.tsx
│   │       ├── anomali/page.tsx
│   │       └── query/page.tsx           # NL Business Query
│   │
│   ├── (super-admin)/
│   │   ├── layout.tsx
│   │   ├── tenants/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── billing/page.tsx
│   │   ├── analytics/page.tsx
│   │   └── feature-flags/page.tsx
│   │
│   └── api/
│       └── webhooks/
│           ├── midtrans/route.ts
│           └── stripe/route.ts
│
├── components/
│   ├── kasir/
│   │   ├── MenuGrid.tsx
│   │   ├── MenuCard.tsx
│   │   ├── ModifierModal.tsx
│   │   ├── CartPanel.tsx
│   │   ├── CartItem.tsx
│   │   ├── OrderTypeSelector.tsx
│   │   ├── TableSelector.tsx
│   │   ├── PaymentModal.tsx
│   │   ├── SplitBillDialog.tsx
│   │   ├── QrisDynamicModal.tsx
│   │   ├── ReceiptModal.tsx
│   │   ├── ReceiptPrinter.tsx
│   │   ├── NumpadInput.tsx
│   │   ├── CategoryFilter.tsx
│   │   ├── StockBadge.tsx
│   │   ├── AiUpsellBanner.tsx           # AI Upsell
│   │   ├── CustomerFacingDisplay.tsx    # CFD
│   │   └── RealtimeIndicator.tsx
│   │
│   ├── kds/
│   │   ├── OrderTicket.tsx
│   │   ├── KitchenBoard.tsx
│   │   ├── TicketTimer.tsx
│   │   └── StationFilter.tsx
│   │
│   ├── meja/
│   │   ├── TableMap.tsx
│   │   ├── TableCard.tsx
│   │   └── TableMergeDialog.tsx
│   │
│   ├── dashboard/
│   │   ├── RevenueChart.tsx
│   │   ├── OrderTable.tsx
│   │   ├── TopMenuList.tsx
│   │   ├── IngredientAlertCard.tsx
│   │   ├── HourlyChart.tsx
│   │   ├── OutletComparison.tsx
│   │   ├── HppMarginCard.tsx
│   │   └── AiInsightCard.tsx
│   │
│   ├── ai/
│   │   ├── ForecastChart.tsx
│   │   ├── MenuEngineeringMatrix.tsx
│   │   ├── AnomalyAlert.tsx
│   │   ├── RecommendationList.tsx
│   │   └── AiChatWidget.tsx
│   │
│   └── layout/
│       ├── Sidebar.tsx
│       ├── Topbar.tsx
│       ├── MobileNav.tsx
│       ├── TenantGuard.tsx
│       └── OfflineBanner.tsx
│
├── hooks/
│   ├── useOrder.ts
│   ├── useCart.ts
│   ├── useModifier.ts
│   ├── useTable.ts
│   ├── useKds.ts
│   ├── useIngredientStock.ts
│   ├── useRealtime.ts
│   ├── useOfflineSync.ts
│   ├── useAiInsight.ts
│   └── useTenant.ts
│
├── lib/
│   ├── trpc/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── provider.tsx
│   ├── supabase/
│   │   ├── client.ts
│   │   └── realtime.ts
│   ├── hardware/
│   │   ├── receipt-printer.ts
│   │   └── kitchen-printer.ts
│   ├── ai/
│   │   └── client.ts
│   ├── utils.ts
│   ├── constants.ts
│   ├── currency.ts
│   └── pwa/
│       ├── sw.ts
│       └── offline-queue.ts
│
└── store/
    ├── useAuthStore.ts
    ├── useCartStore.ts
    ├── useOrderStore.ts
    ├── useTableStore.ts
    ├── useTenantStore.ts
    ├── useOfflineStore.ts
    └── useSettingStore.ts
```

---

### apps/api — NestJS 11

```
apps/api/
└── src/
    ├── main.ts
    ├── app.module.ts
    │
    ├── trpc/
    │   ├── trpc.module.ts
    │   ├── trpc.router.ts
    │   └── trpc.context.ts
    │
    ├── common/
    │   ├── decorators/
    │   │   ├── tenant.decorator.ts
    │   │   ├── user.decorator.ts
    │   │   └── roles.decorator.ts
    │   ├── guards/
    │   │   ├── jwt.guard.ts
    │   │   ├── roles.guard.ts
    │   │   └── subscription.guard.ts
    │   ├── interceptors/
    │   │   ├── tenant-schema.interceptor.ts
    │   │   └── logging.interceptor.ts
    │   ├── filters/
    │   │   └── global-exception.filter.ts
    │   └── middleware/
    │       └── rate-limit.middleware.ts
    │
    ├── database/
    │   ├── drizzle/
    │   │   ├── schemas/
    │   │   │   ├── public/
    │   │   │   │   ├── tenants.ts
    │   │   │   │   ├── plans.ts
    │   │   │   │   └── subscriptions.ts
    │   │   │   └── tenant/
    │   │   │       ├── users.ts
    │   │   │       ├── outlets.ts
    │   │   │       ├── tables.ts
    │   │   │       ├── categories.ts
    │   │   │       ├── products.ts
    │   │   │       ├── product-modifiers.ts        # KRITIS F&B
    │   │   │       ├── modifier-options.ts         # KRITIS F&B
    │   │   │       ├── modifier-groups.ts          # BARU: Required/Optional
    │   │   │       ├── recipes.ts                  # KRITIS F&B: BOM
    │   │   │       ├── ingredients.ts              # KRITIS F&B
    │   │   │       ├── ingredient-stock.ts
    │   │   │       ├── inventory-movements.ts
    │   │   │       ├── waste-logs.ts               # BARU
    │   │   │       ├── stock-takes.ts              # BARU
    │   │   │       ├── stock-take-items.ts         # BARU
    │   │   │       ├── orders.ts
    │   │   │       ├── order-items.ts
    │   │   │       ├── order-item-modifiers.ts
    │   │   │       ├── transactions.ts
    │   │   │       ├── transaction-items.ts
    │   │   │       ├── shifts.ts                   # BARU: KRITIS
    │   │   │       ├── shift-cash-movements.ts     # BARU
    │   │   │       ├── void-requests.ts            # BARU
    │   │   │       ├── customers.ts                # BARU: CRM
    │   │   │       ├── customer-preferences.ts     # BARU
    │   │   │       ├── loyalty-programs.ts         # BARU
    │   │   │       ├── loyalty-tiers.ts            # BARU
    │   │   │       ├── customer-points.ts          # BARU
    │   │   │       ├── point-transactions.ts       # BARU
    │   │   │       ├── stamp-cards.ts              # BARU
    │   │   │       ├── customer-stamps.ts          # BARU
    │   │   │       ├── vouchers.ts                 # BARU
    │   │   │       ├── voucher-redemptions.ts      # BARU
    │   │   │       ├── gift-cards.ts               # BARU
    │   │   │       ├── gift-card-transactions.ts   # BARU
    │   │   │       ├── subscription-plans.ts       # BARU
    │   │   │       ├── customer-subscriptions.ts   # BARU
    │   │   │       ├── staff-schedules.ts          # BARU
    │   │   │       ├── schedule-swap-requests.ts   # BARU
    │   │   │       ├── attendance-logs.ts          # BARU
    │   │   │       ├── tip-pools.ts                # BARU
    │   │   │       ├── tip-distributions.ts        # BARU
    │   │   │       ├── tip-rules.ts                # BARU
    │   │   │       ├── reservations.ts             # BARU
    │   │   │       ├── queues.ts                   # BARU
    │   │   │       ├── price-rules.ts              # BARU: Dynamic Pricing
    │   │   │       ├── combos.ts                   # BARU: Bundle
    │   │   │       ├── combo-items.ts              # BARU
    │   │   │       ├── suppliers.ts                # BARU
    │   │   │       ├── purchase-orders.ts          # BARU
    │   │   │       ├── po-items.ts                 # BARU
    │   │   │       ├── good-receipts.ts            # BARU
    │   │   │       ├── journal-entries.ts          # BARU
    │   │   │       ├── journal-lines.ts            # BARU
    │   │   │       ├── chart-of-accounts.ts        # BARU
    │   │   │       ├── delivery-platform-orders.ts # BARU: Ojol
    │   │   │       ├── menu-platform-mapping.ts    # BARU
    │   │   │       ├── print-stations.ts           # BARU
    │   │   │       ├── category-print-routing.ts   # BARU
    │   │   │       ├── roles.ts                    # BARU: RBAC
    │   │   │       ├── permissions.ts              # BARU
    │   │   │       ├── role-permissions.ts         # BARU
    │   │   │       └── product-embeddings.ts
    │   │   └── migrations/
    │   └── tenant-schema.service.ts
    │
    └── modules/
        ├── auth/
        ├── tenant/
        ├── order/
        ├── modifier/
        ├── kitchen/
        ├── table/
        ├── recipe/
        ├── ingredient/
        ├── transaction/
        ├── product/
        ├── outlet/
        │
        ├── shift/                               # BARU: Shift Management
        ├── void/                                # BARU: Void Approval Workflow
        ├── customer/                            # BARU: CRM
        ├── loyalty/                             # BARU: Points & Tiers
        ├── stamp/                               # BARU: Stamp Card
        ├── voucher/                             # BARU
        ├── gift-card/                           # BARU
        ├── subscription/                        # BARU: Coffee Subscription
        ├── staff-schedule/                      # BARU: Scheduling
        ├── attendance/                          # BARU
        ├── tip/                                 # BARU: Service Charge
        ├── reservation/                         # BARU
        ├── queue/                               # BARU
        ├── waste/                               # BARU
        ├── stock-take/                          # BARU
        ├── price-rule/                          # BARU: Dynamic Pricing
        ├── combo/                               # BARU: Bundle Builder
        ├── supplier/                            # BARU: PO
        ├── journal/                             # BARU: Accounting
        ├── delivery-platform/                   # BARU: Ojol Integration
        ├── whatsapp/                            # BARU: WA Business API
        ├── rbac/                                # BARU: Role & Permission
        │
        ├── report/
        │   └── generators/
        │       ├── pdf.generator.ts
        │       ├── excel.generator.ts
        │       ├── hpp.generator.ts
        │       ├── cashflow.generator.ts        # BARU
        │       └── tax.generator.ts             # BARU
        │
        ├── billing/
        └── ai/
            └── agents/
                ├── forecast.agent.ts
                ├── menu-engineering.agent.ts
                ├── ingredient.agent.ts
                ├── anomaly.agent.ts
                ├── insight.agent.ts
                ├── upsell.agent.ts              # BARU: Real-time Upsell
                └── waste-prediction.agent.ts    # BARU
```

---

### packages/validators — Zod Schemas (Shared)

```
packages/validators/
└── src/
    ├── auth.schema.ts
    ├── order.schema.ts
    ├── modifier.schema.ts
    ├── recipe.schema.ts
    ├── ingredient.schema.ts
    ├── table.schema.ts
    ├── transaction.schema.ts
    ├── product.schema.ts
    ├── tenant.schema.ts
    ├── billing.schema.ts
    ├── ai.schema.ts
    ├── shift.schema.ts              # BARU
    ├── customer.schema.ts           # BARU
    ├── loyalty.schema.ts            # BARU
    ├── voucher.schema.ts            # BARU
    ├── gift-card.schema.ts          # BARU
    ├── subscription.schema.ts       # BARU
    ├── staff-schedule.schema.ts     # BARU
    ├── attendance.schema.ts         # BARU
    ├── tip.schema.ts                # BARU
    ├── reservation.schema.ts        # BARU
    ├── queue.schema.ts              # BARU
    ├── supplier.schema.ts           # BARU
    ├── purchase-order.schema.ts     # BARU
    ├── journal.schema.ts            # BARU
    ├── price-rule.schema.ts         # BARU
    └── index.ts
```

---

## 16. Strategi Multi-Tenant

### Schema-per-tenant di PostgreSQL

```
public schema
├── tenants             (id, name, slug, plan_id, created_at)
├── plans               (id, name, price, features)
└── subscriptions       (id, tenant_id, plan_id, status, expires_at)

tenant_{slug} schema   (dibuat otomatis saat kedai daftar)
└── [semua tabel tenant seperti di Bagian 4]
```

### Cara kerja request

```
Request masuk
    ↓
JWT Guard (verifikasi token)
    ↓
Tenant Guard (ambil tenant_id dari JWT)
    ↓
Subscription Guard (cek plan masih aktif)
    ↓
TenantSchema Interceptor
    → SET search_path TO tenant_{slug}
    ↓
Handler/Service
    → Query otomatis ke schema tenant yang benar
```

---

## 17. Realtime Architecture

### Cara kerja realtime di kedai kopi

```
Kasir input pesanan (+ pilih modifier)
    ↓
NestJS: simpan order ke DB
    ↓
NestJS: broadcast ke Supabase channels
    │
    ├── Channel "kds:{tenantId}:{outletId}:bar"
    │   → Layar KDS Barista: tiket pesanan baru muncul otomatis
    │
    ├── Channel "kds:{tenantId}:{outletId}:kitchen"
    │   → Layar KDS Dapur: tiket makanan muncul otomatis
    │
    ├── Channel "table:{tenantId}:{outletId}"
    │   → Update status meja di dashboard: kosong → terisi
    │
    ├── Channel "queue:{tenantId}:{outletId}"     ← BARU: Antrian Digital
    │   → Update nomor antrian di layar tunggu
    │
    └── Channel "dashboard:{tenantId}"
        → Update chart omzet real-time di layar owner
```

### Channel structure

```typescript
// Order ke KDS
`kds:${tenantId}:${outletId}:bar` 
`kds:${tenantId}:${outletId}:kitchen` 
`kds:${tenantId}:${outletId}:all` 

// Status meja Dine-In
`table:${tenantId}:${outletId}` 

// Antrian Digital
`queue:${tenantId}:${outletId}` 

// Customer-Facing Display
`cfd:${tenantId}:${outletId}` 

// Dashboard owner
`dashboard:${tenantId}` 

// Notifikasi stok menipis & shift
`alert:${tenantId}` 
```

---

## 18. Flow Kritis F&B

### Flow Order → Potong Bahan Baku Otomatis

```
Kasir klik "Bayar" (1 Caffe Latte Large, Oat Milk)
    ↓
transaction.service.ts: simpan transaksi
    ↓
recipe.service.ts: ambil BOM Caffe Latte
    → 18g Biji Kopi, 200ml Oat Milk, 1 Cup
    ↓
ingredient.service.ts: potong stok bahan baku
    → ingredient_stock.biji_kopi -= 18g
    → ingredient_stock.oat_milk  -= 200ml
    → ingredient_stock.cup       -= 1
    ↓
Cek threshold: apakah stok di bawah minimum?
    → Ya: broadcast alert ke "alert:{tenantId}"
    → Owner dapat notifikasi: "Oat Milk sisa 2L"
```

### Flow Split Bill

```
Meja 7 pesan 4 item — total Rp 156.000
Pelanggan minta bayar terpisah
    ↓
Kasir buka SplitBillDialog
    ↓
Kasir drag item ke tiap "orang" (atau input manual nominal)
    ↓
Sistem buat 2-4 sub-transaksi dari 1 order yang sama
    ↓
Tiap sub-transaksi punya payment method berbeda
    ↓
Order ditandai PAID saat semua sub-transaksi lunas
    ↓
Meja 7 otomatis berubah status: terisi → kosong
```

### Flow Void dengan Approval

```
Kasir request void item
    ↓
void_requests: status = 'pending', reason wajib diisi
    ↓
Notifikasi push ke Supervisor/Manager
    ↓
Manager approve via PIN atau mobile app
    ↓
void_requests: status = 'approved', approved_by, approved_at dicatat
    ↓
Item di-void, stok bahan baku di-rollback
    ↓
Audit log tersimpan permanen
```

### Flow Shift Management

```
Kasir buka shift
    ↓
Input modal awal (hitung uang fisik di laci)
    ↓
shifts: opening_cash dicatat, status = 'open'
    ↓
[Selama shift — semua transaksi tunai tercatat]
    ↓
Kasir tutup shift
    ↓
Hitung fisik uang di laci → input actual_cash
    ↓
Sistem hitung expected_cash (opening + tunai masuk - tunai keluar)
    ↓
difference = actual_cash - expected_cash
    ↓
Jika difference ≠ 0 → wajib isi keterangan
    ↓
Laporan shift dikirim ke Manager via WhatsApp
```

### Flow Printer Routing

```
Pesanan selesai dibayar
    ↓
receipt.service.ts: generate struk pelanggan
    ↓
hardware/receipt-printer.ts: cetak ke printer kasir
    │
    └── Paralel:
        kitchen-printer.ts: route per kategori menu
            → Minuman panas → Bar Printer
            → Makanan → Kitchen Printer
        realtime.service.ts: broadcast ke KDS tablet
```

---

## 19. AI Layer Architecture

### Flow Menu Engineering (Stars/Dogs)

```
Data penjualan 30 hari terakhir (TimescaleDB)
    ↓
menu-engineering.agent.ts:
    → Hitung: popularity (volume terjual) per menu
    → Hitung: profitability (harga jual - HPP) per menu
    ↓
Klasifikasi matrix:
    ├── Stars:       Populer + Profitable → Promosikan
    ├── Plowhorses:  Populer + Kurang Profit → Naikkan harga/kurangi porsi
    ├── Puzzles:     Kurang Populer + Profitable → Perlu promosi
    └── Dogs:        Kurang Populer + Kurang Profit → Pertimbangkan hapus
    ↓
Tampil di dashboard ai-insight/menu-engineering
```

### Flow Prediksi Bahan Baku

```
TimescaleDB (data historis 12 bulan + event kalender)
    ↓
forecast.agent.ts: analisis tren + musiman + hari libur
    ↓
Claude API: prediksi kebutuhan bahan baku per minggu
    ↓
Return: prediksi kebutuhan bahan baku per outlet
    ↓
Cache ke Upstash Redis (6 jam)
    ↓
Tampil di dashboard + otomatis buat draft PO (Purchase Order)
```

### Flow AI Upsell Real-Time

```
Kasir input item pertama (Caffe Latte)
    ↓
upsell.agent.ts: query pgvector
    → "Pelanggan yang pesan Caffe Latte juga sering pesan..."
    ↓
Return: top 3 rekomendasi dengan confidence score
    ↓
AiUpsellBanner.tsx: tampil di layar kasir
    → "Tambah Croissant? (+Rp25.000) — 68% pelanggan juga pesan ini"
    ↓
Kasir bisa langsung klik tambah ke cart
```

---

## 20. Matriks Prioritas & Fase Development

### Fase 1 — MVP Kasir F&B (Minggu 1–8)

**Target: 1 kedai kopi bisa pakai, modifier jalan, struk bisa cetak**

**Yang dibangun (arsitektur awal):**
- Auth (login kasir, owner)
- Manajemen menu & kategori
- Product Modifiers & Variants
- POS interface (kasir) + ModifierModal
- OrderType: Dine-In / Takeaway / Ojol
- Transaksi + struk PDF
- Printer routing: kasir + dapur
- Inventory bahan baku dasar
- Dashboard sederhana (omzet hari ini)
- Deploy pertama (Vercel + Railway + Neon)

**Tambahan wajib dari riset kompetitor:**
- Shift & Cash Drawer Management
- Void & Refund Approval Workflow
- Required vs Optional Modifier
- Hak Akses Granular (RBAC)
- Absensi Clock In/Out di POS
- Digital Receipt via WhatsApp

**Stack aktif:**
Next.js 15 + NestJS + Drizzle + PostgreSQL + Upstash Redis
tRPC + Zustand + TanStack Query + Sentry

### Fase 2 — SaaS Aktif + F&B Lengkap (Minggu 9–16)

**Target: onboard klien baru sendiri, billing jalan, fitur F&B lengkap**

**Yang dibangun (arsitektur awal):**
- Multi-tenant (schema per kedai)
- Billing Midtrans (langganan bulanan)
- Realtime sync order ke KDS (WebSocket)
- Kitchen/Bar Display System (KDS)
- Manajemen meja Dine-In (TableMap)
- Split Bill + QRIS Dinamis
- Resep & BOM → potong bahan baku otomatis
- Laporan HPP & margin per menu
- Export Excel/PDF

**Tambahan wajib dari riset kompetitor:**
- CRM & Profil Pelanggan
- Program Loyalty & Poin Multi-Tier
- Stamp Card Digital
- Gift Card Digital
- Purchase Order ke Supplier
- Stock Opname Terintegrasi
- Waste / Spoilage Tracking
- Tip / Service Charge Distribution
- Penjadwalan Shift Karyawan
- Integrasi GoFood & GrabFood
- WhatsApp Business Notifikasi
- Dynamic Pricing / Happy Hour
- Combo / Bundle Builder

**Stack tambahan:**
Supabase Realtime + Trigger.dev + Midtrans

### Fase 3 — Multi-Cabang + Mobile Owner (Minggu 17–24)

**Target: kedai punya banyak cabang, owner pantau dari HP**

**Yang dibangun (arsitektur awal):**
- Multi-outlet / cabang
- Dashboard perbandingan antar cabang
- QR Menu Self-Ordering
- Mobile app owner (Expo React Native)
- Push notification

**Tambahan dari riset kompetitor:**
- Reservasi Meja + Deposit via QRIS
- Antrian Digital + WA Notif
- Self-Service Kiosk Mode
- Customer-Facing Display (CFD)
- Order Status Display
- Coffee Subscription
- Laporan Jam Sibuk (Heatmap)
- Jurnal Akuntansi Otomatis
- Rekonsiliasi Harian Otomatis
- Feedback & Rating Pelanggan
- Onboarding Karyawan Digital
- Printer Routing Cerdas Multi-Zone

**Stack tambahan:**
Expo + React Native + Stripe

### Fase 4 — AI Layer F&B (Minggu 25+)

**Target: sistem beri rekomendasi bisnis otomatis khusus F&B**

**Yang dibangun (arsitektur awal):**
- Menu Engineering Matrix (Stars/Dogs)
- Prediksi kebutuhan bahan baku
- Anomaly detection

**Tambahan dari riset kompetitor:**
- AI Upsell Real-Time di Layar Kasir
- AI Prediksi Waste Bahan Baku
- AI NL Business Query
- Performa Kasir AI-powered
- Voice Order untuk Barista
- Laporan Jejak Karbon
- RFM Scoring & Segmentasi

**Stack tambahan:**
Vercel AI SDK 4 + Mastra + pgvector + TimescaleDB aktif

---

## 21. Rekomendasi Skema Database Lengkap

Tabel-tabel yang wajib ada di `tenant_{slug}` schema:

```sql
-- ═══════════════════════════════
-- KASIR & SHIFT
-- ═══════════════════════════════
shifts
shift_cash_movements
void_requests

-- ═══════════════════════════════
-- MENU & MODIFIER
-- ═══════════════════════════════
products
categories
product_modifiers          -- KRITIS F&B
modifier_options           -- KRITIS F&B
modifier_groups            -- required/optional flag
combos                     -- Bundle Builder
combo_items
price_rules                -- Dynamic Pricing

-- ═══════════════════════════════
-- RESEP & BAHAN BAKU
-- ═══════════════════════════════
recipes                    -- KRITIS F&B: BOM
ingredients                -- KRITIS F&B
ingredient_stock
inventory_movements
waste_logs
stock_takes
stock_take_items

-- ═══════════════════════════════
-- ORDER & TRANSAKSI
-- ═══════════════════════════════
orders
order_items
order_item_modifiers
transactions
transaction_items

-- ═══════════════════════════════
-- PELANGGAN & LOYALTY
-- ═══════════════════════════════
customers
customer_preferences
loyalty_programs
loyalty_tiers
customer_points
point_transactions
stamp_cards
customer_stamps
vouchers
voucher_redemptions
customer_subscriptions
subscription_plans
gift_cards
gift_card_transactions

-- ═══════════════════════════════
-- KARYAWAN & SDM
-- ═══════════════════════════════
users
staff_schedules
schedule_swap_requests
attendance_logs
tip_pools
tip_distributions
tip_rules

-- ═══════════════════════════════
-- OPERASIONAL F&B
-- ═══════════════════════════════
tables
reservations
queues
outlets

-- ═══════════════════════════════
-- SUPPLIER & PEMBELIAN
-- ═══════════════════════════════
suppliers
purchase_orders
po_items
good_receipts

-- ═══════════════════════════════
-- AKUNTANSI
-- ═══════════════════════════════
journal_entries
journal_lines
chart_of_accounts

-- ═══════════════════════════════
-- INTEGRASI EKSTERNAL
-- ═══════════════════════════════
delivery_platform_orders
menu_platform_mapping

-- ═══════════════════════════════
-- PRINTER & HARDWARE
-- ═══════════════════════════════
print_stations
category_print_routing

-- ═══════════════════════════════
-- RBAC & KEAMANAN
-- ═══════════════════════════════
roles
permissions
role_permissions

-- ═══════════════════════════════
-- AI
-- ═══════════════════════════════
product_embeddings
```

> **Catatan penting:** Tambahkan tabel `customers` dan `loyalty_programs` dari Fase 1,
> meskipun fitur loyalty baru aktif di Fase 2. Data transaksi yang tidak terhubung ke
> pelanggan tidak bisa direfactor mudah di kemudian hari.
>
> Hal yang sama berlaku untuk `product_modifiers`, `modifier_options`, `recipes`,
> dan `ingredients` — 4 tabel ini adalah fondasi semua fitur F&B dan
> **tidak bisa direfactor mudah** setelah ada data transaksi.

---

## 22. Setup & Konfigurasi

### turbo.json

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "typecheck": {}
  }
}
```

### docker-compose.yml (development)

```yaml
version: '3.8'
services:
  postgres:
    image: timescale/timescaledb-ha:pg16-latest
    environment:
      POSTGRES_DB: onsflow_dev
      POSTGRES_USER: onsflow
      POSTGRES_PASSWORD: secret
    ports: ["5432:5432"]
    volumes: [postgres_data:/var/lib/postgresql/data]
    command: >
      postgres
      -c shared_preload_libraries=timescaledb,vector
      -c max_connections=200
  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]
volumes:
  postgres_data:
```

### apps/api/.env

```bash
# Database
DATABASE_URL="postgresql://onsflow:secret@localhost:5432/onsflow_dev"

# Redis
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"
UPSTASH_REDIS_REST_TOKEN="xxx"

# Auth
JWT_SECRET="your-super-secret-256-bit-key"
JWT_EXPIRES_IN="7d"

# Realtime (KDS WebSocket)
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_SERVICE_KEY="xxx"

# Billing
MIDTRANS_SERVER_KEY="SB-Mid-server-xxx"
MIDTRANS_CLIENT_KEY="SB-Mid-client-xxx"
STRIPE_SECRET_KEY="sk_test_xxx"
STRIPE_WEBHOOK_SECRET="whsec_xxx"

# AI
ANTHROPIC_API_KEY="sk-ant-xxx"
OPENAI_API_KEY="sk-xxx"

# WhatsApp Business API
WHATSAPP_API_TOKEN="xxx"
WHATSAPP_PHONE_NUMBER_ID="xxx"

# Storage (foto menu)
AWS_S3_BUCKET="onsflow-saas-prod"
AWS_REGION="ap-southeast-1"
AWS_ACCESS_KEY_ID="xxx"
AWS_SECRET_ACCESS_KEY="xxx"

# Observability
SENTRY_DSN="https://xxx@sentry.io/xxx"
BETTERSTACK_TOKEN="xxx"
```

### Perintah Memulai Project

```bash
# 1. Buat monorepo
npx create-turbo@latest onsflow
cd onsflow

# 2. Setup apps
npx create-next-app@latest apps/web --typescript --tailwind --app
cd apps && nest new api --package-manager pnpm

# 3. Install dependencies utama
pnpm add -w drizzle-orm @trpc/server @trpc/client
pnpm add -w zustand @tanstack/react-query
pnpm add -w @supabase/supabase-js
pnpm add -w ai @anthropic-ai/sdk
pnpm add -w zod @sentry/nextjs

# 4. Jalankan development
pnpm dev
```

---

## 23. Naming Convention

| Jenis | Format | Contoh |
|---|---|---|
| Komponen React | PascalCase | ModifierModal.tsx |
| Hook | camelCase + use | useOrderStore.ts |
| Service NestJS | kebab-case + .service | order.service.ts |
| Router tRPC | kebab-case + .router | order.router.ts |
| Zod schema | kebab-case + .schema | modifier.schema.ts |
| DTO | kebab-case + .dto | create-order.dto.ts |
| Types | kebab-case + .types | order.types.ts |
| Folder | kebab-case | bahan-baku/ |
| DB table | snake_case | order_item_modifiers |
| DB column | snake_case | created_at |
| Env var | UPPER_SNAKE_CASE | MIDTRANS_SERVER_KEY |
| tRPC procedure | camelCase | order.create |
| Realtime channel | domain:tenantId:extra | kds:abc123:outlet1:bar |

---

## Penutup — 3 Fakta Utama dari Riset

**1. Gap terbesar bukan di AI** — melainkan di fitur operasional dasar seperti
Shift Management, Void Approval, dan Tip Distribution. Kompetitor Indonesia
sangat lemah di sini. Ini harus diselesaikan sebelum Fase 2.

**2. Peluang diferensiasi terbesar** ada di integrasi WhatsApp (notifikasi + marketing),
integrasi ojol dua arah, dan coffee subscription. Tidak ada satu pun kompetitor
Indonesia yang punya ketiga ini sekaligus.

**3. Kompetitor global belum masuk Indonesia** secara penuh karena kendala
payment gateway lokal (QRIS, GoPay, OVO) dan integrasi ojol lokal.
Ini jendela waktu untuk membangun sistem yang "lebih Indonesia" dari kompetitor global.

> **Mulai dari Fase 1 saja** — tapi pastikan skema database
> `product_modifiers`, `modifier_options`, `recipes`, `ingredients`, `customers`,
> dan `shifts` sudah dirancang dengan benar dari hari pertama.
> Fokus pada 1 kedai kopi pilot dulu, minta feedback, baru scale ke klien berikutnya.
