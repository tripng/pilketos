# Checklist Deploy — Hostinger Shared Hosting

Aplikasi: IMUT (e-voting pemilihan ketua OSIS) — Laravel 12 + Inertia v2 + React 18.
Asumsi: Hostinger **Business Shared** (ada SSH + Node.js). Session driver = `database`.

---

## 1. Persiapan di LOKAL (sudah dilakukan)
- [x] `npm run build` → hasil ada di `public/build/` (upload folder ini ke server).
- [x] `.env` sudah di-gitignore (TIDAK ikut ke repo/server).
- [x] `public/build/` di-gitignore → upload manual hasil build.
- [ ] Pastikan tidak upload DB lokal (ada 525 vote test). Di server pakai `migrate:fresh --seed`.

## 2. Di hPanel Hostinger
- [ ] Buat **MySQL Database** + user (catat host / nama DB / user / password).
- [ ] Pastikan **SSL** aktif (Let's Encrypt, gratis) untuk domain/subdomain.
- [ ] Siapkan folder: `public_html/pilketos/` (atau subdomain `vote.sekolah.sch`).

## 3. Upload Kode
Pilih satu:
- **A. Git (rapi)**: `git clone` / `git pull` dari GitHub ke folder tujuan.
- **B. FTP**: upload semua file KECUALI `.env`, `node_modules/`, `public/build/`
  lalu upload folder `public/build/` hasil build lokal ke `public/build/`.

## 4. Composer (lewat SSH)
```bash
cd public_html/pilketos
composer install --no-dev --optimize-autoloader
```
Kalau tidak ada SSH: pakai tool "Composer" di hPanel atau upload folder `vendor/` dari lokal.

## 5. Environment
```bash
cp .env.example .env
```
Edit `.env` (jangan commit):
```
APP_ENV=production
APP_DEBUG=false
APP_URL=https://domain-anda

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=nama_db
DB_USERNAME=user_db
DB_PASSWORD=password_db

SESSION_DRIVER=database
QUEUE_CONNECTION=database
CACHE_STORE=database
```
Lalu:
```bash
php artisan key:generate
```

## 6. Database (data AWAL BERSIH, tanpa vote test)
```bash
php artisan migrate:fresh --seed --force
```
> JANGAN dump DB lokal (ada 525 vote test). Perintah di atas bikin siswa + admin + 2 paslon fresh.

## 7. Build Assets
Karena Anda upload hasil build lokal, lewati langkah ini.
Kalau mau build di server (butuh Node):
```bash
npm install
npm run build
```

## 8. Document Root → `public/`  (PALING KRUSIAL)
Di hPanel, arahkan domain/subdomain ke:
```
public_html/pilketos/public
```
BUKAN ke root `public_html/pilketos`. Ini agar `.env` tidak ter-expose ke web.

## 9. Permission
```bash
chmod -R 755 storage bootstrap/cache
```

## 10. Storage Link (kalau ada upload foto siswa nanti)
```bash
php artisan storage:link
```

## 11. Optimasi (opsional, prod)
```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## 12. KEAMANAN — WAJIB
- [ ] **Ganti password admin** (seeder pakai `admin123`):
  ```bash
  php artisan tinker --execute="App\Models\Admin::first()->update(['password'=>bcrypt('PASSWORD_KUAT_BARU')]);"
  ```
- [ ] `APP_DEBUG=false` (jangan tampilkan error ke publik).
- [ ] Pastikan `public/.htaccess` ada (Laravel default) untuk rewrite ke `index.php`.

## 13. Verifikasi Setelah Live
- [ ] `/` → login siswa (NISN + token 4 huruf).
- [ ] `/admin` → login admin (NISN 0011223344, password sudah diganti).
- [ ] `/live` → lihat animasi (confetti muncul + fade out 2 detik).
- [ ] `php artisan migrate:status` → nothing pending.
- [ ] Token di dashboard admin otomatis ganti tiap 2 menit (tidak butuh cron).

## 14. Catatan App
- Token akses global: 4 huruf A-Z, rotate otomatis tiap 2 menit (rotate-on-request, TIDAK butuh scheduler/cron).
- Polling `/live` tiap 3 detik via Inertia `router.reload({ only: [...] })` — aman, tidak remount component.
- Session `database` → butuh tabel `sessions` (sudah dibuat saat migrate).

## 15. Rollback / Maintenance
```bash
php artisan down    # mode maintenance saat setup
php artisan up      # buka kembali
```
