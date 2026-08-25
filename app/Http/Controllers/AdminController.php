<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\ClassRoom;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Dashboard admin — menampilkan statistik nyata dari database.
     */
    public function dashboard(Request $request): Response
    {
        $period = ElectionPeriod::where('is_active', true)->first();

        // Total seluruh siswa terdaftar
        $totalSiswa = Student::count();

        // Suara per paslon (hanya untuk periode aktif)
        $votes = collect();
        $sudahMemilih = 0;

        if ($period) {
            $sudahMemilih = Vote::where('period_id', $period->id)->count();

            $votes = Candidate::orderBy('number')
                ->get([
                    'id',
                    'number',
                    'color',
                    'capres_name',
                    'capres_photo',
                    'capres_photo_happy',
                    'cawapres_name',
                    'cawapres_photo',
                    'cawapres_photo_happy',
                ])
                ->map(function (Candidate $c) use ($period) {
                    return [
                        'number' => $c->number,
                        'color' => $c->color,
                        'votes' => Vote::where('candidate_id', $c->id)
                            ->where('period_id', $period->id)
                            ->count(),
                        'capres' => [
                            'photo' => $c->capres_photo,
                            'photoHappy' => $c->capres_photo_happy,
                        ],
                        'cawapres' => [
                            'photo' => $c->cawapres_photo,
                            'photoHappy' => $c->cawapres_photo_happy,
                        ],
                    ];
                });
        }

        $belumMemilih = max($totalSiswa - $sudahMemilih, 0);
        $partisipasi = $totalSiswa > 0
            ? round(($sudahMemilih / $totalSiswa) * 100)
            : 0;

        // Jumlah siswa per kelas
        $kelas = ClassRoom::orderBy('code')
            ->get(['id', 'code'])
            ->map(function (ClassRoom $c) {
                return [
                    'kelas' => $c->code,
                    'count' => $c->students()->count(),
                ];
            });

        return Inertia::render('AdminDashboard', [
            'stats' => [
                'total_siswa' => $totalSiswa,
                'sudah_memilih' => $sudahMemilih,
                'belum_memilih' => $belumMemilih,
                'partisipasi' => $partisipasi,
            ],
            'votes' => $votes,
            'kelas' => $kelas,
            'live' => true,
        ]);
    }
}
