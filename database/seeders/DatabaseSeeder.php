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

        // 3. 3 Paslon (dengan foto Unsplash sebagai placeholder)
        $candidates = [
            [
                'number' => 1, 'name' => 'Budi & Ani',
                'capres_name' => 'Budi Santoso', 'cawapres_name' => 'Ani Wijaya',
                'capres_photo' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&h=160&q=80',
                'cawapres_photo' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&h=160&q=80',
                'color' => '#059669',
            ],
            [
                'number' => 2, 'name' => 'Dewi & Rudi',
                'capres_name' => 'Rudi Pratama', 'cawapres_name' => 'Dewi Lestari',
                'capres_photo' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&h=160&q=80',
                'cawapres_photo' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&h=160&q=80',
                'color' => '#10b981',
            ],
            [
                'number' => 3, 'name' => 'Siti & Eko',
                'capres_name' => 'Eko Saputra', 'cawapres_name' => 'Siti Nurhaliza',
                'capres_photo' => 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?auto=format&fit=crop&w=160&h=160&q=80',
                'cawapres_photo' => 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&h=160&q=80',
                'color' => '#34d399',
            ],
        ];
        foreach ($candidates as $c) {
            Candidate::create(array_merge(['period_id' => $period->id], $c));
        }

        // 4. Siswa ~320 orang, tersebar di kelas yang ADA (terbuka & tertutup)
        $allClasses = ClassRoom::all();
        $students = [];
        for ($i = 0; $i < 320; $i++) {
            $cls = $allClasses->random();
            $students[] = Student::create([
                'class_id' => $cls->id,
                'nisn' => (string) fake()->unique()->numerify('##########'),
                'name' => fake()->name(),
            ]);
        }

        // 5. Sebagian siswa sudah memilih (hanya dari kelas terbuka)
        $openClassIds = ClassRoom::where('is_open', true)->pluck('id');
        $openStudentIds = Student::whereIn('class_id', $openClassIds)->pluck('id');
        $chosen = $openStudentIds->random((int) ($openStudentIds->count() * 0.6));
        $candidateIds = Candidate::where('period_id', $period->id)->pluck('id');
        foreach ($chosen as $sid) {
            Vote::create([
                'student_id' => $sid,
                'candidate_id' => $candidateIds->random(),
                'period_id' => $period->id,
                'voted_at' => now()->subMinutes(rand(1, 600)),
            ]);
        }

        // 6. Admin default (NISN 0011223344 → login lewat form pemilih ke /admin)
        Admin::create([
            'username' => 'admin',
            'nisn' => '0011223344',
            'password' => bcrypt('admin123'),
        ]);
    }
}
