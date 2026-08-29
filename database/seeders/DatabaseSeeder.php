<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\Candidate;
use App\Models\ClassRoom;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        // 1. Periode pemilihan aktif
        $period = ElectionPeriod::create([
            'name' => 'Pilketos 2026',
            'year' => 2026,
            'is_active' => true,
            'opened_at' => now(),
            'closed_at' => null,
        ]);

        // 2. Kelas (hanya beberapa yang terbuka untuk login)
        $classDefs = [
            'X1' => true,  'X2' => true,  'X3' => false, 'X4' => false,
            'XI1' => true, 'XI2' => false, 'XI3' => true, 'XI4' => false,
            'XII1' => true, 'XII2' => true, 'XII3' => false, 'XII4' => false,
            'XII5' => true, 'XII6' => true,
        ];
        $classes = [];
        foreach ($classDefs as $code => $open) {
            $classes[$code] = ClassRoom::create([
                'code' => $code,
                'name' => 'Kelas ' . $code,
                'is_open' => $open,
            ]);
        }

        // 3. 2 Paslon (foto dari resources/img -> public/img)
        $candidates = [
            [
                'number' => 1, 'name' => 'Alif & Nahlatusyifa',
                'capres_name' => 'Alif Pratama Tampilang', 'cawapres_name' => 'Nahlatusyifa Djau',
                'capres_photo' => '/img/paslon1a.jpg',
                'cawapres_photo' => '/img/paslon1b.jpg',
                'color' => '#059669',
            ],
            [
                'number' => 2, 'name' => 'Asyifa & Fatih',
                'capres_name' => 'Asyifa Modanggu', 'cawapres_name' => 'Muhammad Fathir',
                'capres_photo' => '/img/paslon2a.jpg',
                'cawapres_photo' => '/img/paslon2b.png',
                'color' => '#10b981',
            ],
        ];
        foreach ($candidates as $c) {
            Candidate::create(array_merge(['period_id' => $period->id], $c));
        }

        // 4. Impor siswa ASLI dari CSV (Data Siswa - Sheet5.csv & Data Siswa - X.csv)
        //    Struktur: nama,nisn,kelas — tanpa header.
        //    Hapus dulu 14 kelas dummy dari migration agar tidak numpuk,
        //    lalu buat kelas dari kode unik di CSV + siswanya.
        ClassRoom::query()->delete();
        $classMap = [];
        $csvFiles = [
            base_path('Data Siswa - Sheet5.csv'),
            base_path('Data Siswa - X.csv'),
        ];
        foreach ($csvFiles as $csvPath) {
            if (! is_file($csvPath) || ($fh = fopen($csvPath, 'r')) === false) {
                continue;
            }
            while (($row = fgetcsv($fh)) !== false) {
                if (count($row) < 3) {
                    continue;
                }
                $name = trim($row[0]);
                $nisn = trim($row[1]);
                $code = trim($row[2]);
                if ($name === '' || $nisn === '') {
                    continue;
                }
                if (! isset($classMap[$code])) {
                    $classMap[$code] = ClassRoom::create([
                        'code' => $code,
                        'name' => $code,
                        'is_open' => true,
                    ]);
                }
                Student::create([
                    'class_id' => $classMap[$code]->id,
                    'nisn' => $nisn,
                    'name' => $name,
                ]);
            }
            fclose($fh);
        }

        // 5. (Tidak ada vote awal — data asli, belum ada yang memilih)

        // 6. Admin default (NISN 0011223344 → login lewat form pemilih ke /admin)
        Admin::create([
            'username' => 'admin',
            'nisn' => '0011223344',
            'password' => bcrypt('admin123'),
        ]);
    }
}
