<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\ClassRoom;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        // Rotasi token otomatis tiap 1 menit — semua halaman lihat token terkini.
        if ($period) {
            $period->ensureFreshToken(1);
        }
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
            'access_token' => $period?->access_token,
        ]);
    }

    /**
     * Halaman live hasil perolehan suara untuk UMUM (tanpa auth).
     * Menampilkan visualisasi yang sama dengan dashboard admin, tapi tanpa
     * panel token/logout. Data di-poll tiap 3 detik lewat Inertia (only props),
     * sehingga tidak ada double data / animasi crack.
     */
    public function liveResults(Request $request): Response
    {
        $period = ElectionPeriod::where('is_active', true)->first();

        $totalSiswa = Student::count();

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

        $kelas = ClassRoom::orderBy('code')
            ->get(['id', 'code'])
            ->map(function (ClassRoom $c) {
                return [
                    'kelas' => $c->code,
                    'count' => $c->students()->count(),
                ];
            });

        return Inertia::render('LiveResults', [
            'stats' => [
                'total_siswa' => $totalSiswa,
                'sudah_memilih' => $sudahMemilih,
                'belum_memilih' => $belumMemilih,
                'partisipasi' => $partisipasi,
            ],
            'votes' => $votes,
            'kelas' => $kelas,
            'live' => true,
            'access_token' => $period?->access_token,
            'token_rotated_at' => $period?->token_rotated_at,
            'token_expires_in' => $period && $period->token_rotated_at
                ? max(0, 60 - (int) now()->diffInSeconds($period->token_rotated_at))
                : 0,
        ]);
    }

    /**
     * Halaman publik /token — display token akses pemilih untuk
     * ditampilkan di ruangan voting. Publik (semua orang) dapat lihat,
     * tapi token cuma berlaku 1 menit lalu otomatis rotate.
     * Polling tiap 5 detik via Inertia (only props) — tidak remount.
     */
    public function tokenDisplay(Request $request): Response
    {
        $period = ElectionPeriod::where('is_active', true)->first();
        // Pastikan token selalu fresh (rotate tiap 1 menit) walaupun hanya via polling.
        if ($period) {
            $period->ensureFreshToken(1);
            $period->refresh();
        }

        return Inertia::render('TokenDisplay', [
            'access_token' => $period?->access_token ?? '-',
            'token_rotated_at' => $period?->token_rotated_at,
            'token_expires_in' => $period && $period->token_rotated_at
                ? max(0, 60 - (int) now()->diffInSeconds($period->token_rotated_at))
                : 0,
            'live' => true,
        ]);
    }

    /**
     * Halaman daftar seluruh peserta + status vote mereka (dengan paginasi,
     * sort, dan live search).
     */
    public function participants(Request $request): Response
    {
        $period = ElectionPeriod::where('is_active', true)->first();
        $periodId = $period?->id;

        $perPage = 50;

        $query = Student::with('class')
            ->orderBy('class_id')
            ->orderBy('name');

        // Live search: nisn / nama / kelas
        $search = trim((string) $request->input('search'));
        if ($search !== '') {
            $query->where(function ($q) use ($search) {
                $q->where('nisn', 'like', "%{$search}%")
                    ->orWhere('name', 'like', "%{$search}%")
                    ->orWhereHas('class', function ($c) use ($search) {
                        $c->where('code', 'like', "%{$search}%");
                    });
            });
        }

        // Sort: name | kelas | status
        $sort = $request->input('sort', 'kelas'); // default kelas (sudah di-orderBy class_id+name)
        $dir = strtolower($request->input('direction', 'asc')) === 'desc' ? 'desc' : 'asc';

        if ($sort === 'name') {
            $query = $query->reorder()->orderBy('name', $dir);
        } elseif ($sort === 'kelas') {
            $query = $query->reorder()->orderBy('class_id', $dir)->orderBy('name', 'asc');
        } elseif ($sort === 'status') {
            // status: belum memilih (0) dulu / sudah memilih (1)
            // pakai withCount agar aman di MySQL strict (tanpa GROUP BY manual)
            $query = $query->reorder()
                ->withCount([
                    'votes as vote_count' => function ($q) use ($periodId) {
                        $q->where('period_id', $periodId);
                    },
                ])
                ->orderBy('vote_count', $dir);
        }

        $students = $query->paginate($perPage, ['id', 'nisn', 'name', 'class_id'])
            ->through(function (Student $s) use ($periodId) {
                return [
                    'id' => $s->id,
                    'nisn' => $s->nisn,
                    'name' => $s->name,
                    'kelas' => $s->class?->code ?? '-',
                    'has_voted' => $periodId ? $s->hasVoted($periodId) : false,
                ];
            });

        return Inertia::render('AdminParticipants', [
            'participants' => $students,
            'total' => Student::count(),
            'sudah_memilih' => Vote::where('period_id', $periodId)->count(),
            'filters' => [
                'search' => $search,
                'sort' => $sort,
                'direction' => $dir,
            ],
        ]);
    }

    /**
     * Reset (hapus) suara milik satu peserta.
     */
    public function resetVote(Request $request, Student $student): RedirectResponse
    {
        $student->votes()->delete();

        return back()->with('flash', [
            'type' => 'success',
            'message' => "Suara {$student->name} berhasil direset.",
        ]);
    }

    /**
     * Reset (hapus) SELURUH suara peserta.
     */
    public function resetAllVotes(Request $request): RedirectResponse
    {
        Vote::query()->delete();

        return back()->with('flash', [
            'type' => 'success',
            'message' => 'Seluruh suara peserta berhasil direset.',
        ]);
    }

    /**
     * Logout admin (guard "admin") → kembali ke halaman login pemilih.
     */
    public function logout(Request $request): RedirectResponse
    {
        Auth::guard('admin')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Reset (generate ulang) token akses global untuk seluruh siswa.
     * Token baru akan menggantikan yang lama — siswa harus pakai token baru
     * untuk login. Menggunakan native session Laravel (bukan JWT).
     */
    public function resetToken(Request $request): RedirectResponse
    {
        $period = ElectionPeriod::where('is_active', true)->firstOrFail();
        // Generate token 4 huruf A-Z baru + catat waktu rotasi.
        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $token = '';
        for ($i = 0; $i < 4; $i++) {
            $token .= $chars[random_int(0, 25)];
        }
        $period->access_token = $token;
        $period->token_rotated_at = now();
        $period->save();

        return redirect()
            ->route('admin.dashboard')
            ->with('success', 'Token akses berhasil di-reset. Bagikan token baru ke seluruh siswa.');
    }
}
