<?php

namespace App\Http\Controllers;

use App\Models\ClassRoom;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoterAuthController extends Controller
{
    /**
     * Tampilkan form login pemilih (NISN).
     * Kalau sudah punya sesi voter yang valid, langsung arahkan ke
     * halaman pemilihan agar tidak kembali ke form login.
     */
    public function showLogin(Request $request)
    {
        $studentId = $request->session()->get('voter_student_id');
        $periodId = $request->session()->get('voter_period_id');

        if ($studentId && $periodId) {
            $student = Student::find($studentId);
            $period = ElectionPeriod::find($periodId);

            // Sesi valid → lanjut ke pemilihan (VoteController sudah
            // menangani kasus "sudah memilih" → halaman terima kasih).
            if ($student && $period && $student->class && $student->class->is_open) {
                return redirect()->route('vote');
            }

            // Sesi ada tapi tidak valid (siswa/kelas hilang) → bersihkan.
            $request->session()->forget([
                'voter_student_id',
                'voter_period_id',
                'voter_voted',
            ]);
        }

        return Inertia::render('VoterLogin');
    }

    /**
     * Proses login pemilih dengan 3 filter:
     * 1. NISN terdaftar
     * 2. Kelas sedang dibuka (is_open)
     * 3. Belum memilih di periode aktif
     */
    public function authenticate(Request $request)
    {
        $nisn = preg_replace('/\D/', '', (string) $request->input('nisn'));

        $student = Student::where('nisn', $nisn)->first();

        // Filter 1: NISN terdaftar
        if (! $student) {
            return back()->withErrors(['nisn' => 'NISN tidak terdaftar.']);
        }

        // Filter 2: Kelas dibuka
        if (! $student->class || ! $student->class->is_open) {
            return back()->withErrors([
                'nisn' => 'Kelas Anda belum dibuka untuk memilih.',
            ]);
        }

        // Periode aktif
        $period = ElectionPeriod::where('is_active', true)->first();
        if (! $period) {
            return back()->withErrors(['nisn' => 'Pemilihan belum dibuka.']);
        }

        // Filter 3: Belum memilih
        $already = Vote::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->exists();
        if ($already) {
            return back()->withErrors(['nisn' => 'Anda sudah memberikan suara.']);
        }

        // Login berhasil — simpan identitas di session
        $request->session()->put('voter_student_id', $student->id);
        $request->session()->put('voter_period_id', $period->id);
        $request->session()->put('voter_voted', false);
        // Tulis session ke store (database) seketika agar tersedia
        // pada request berikutnya ke /pilih.
        $request->session()->save();

        // Arahkan ke halaman pemilihan (request GET baru akan membaca session).
        return redirect()->route('vote');
    }

    /**
     * Logout pemilih (kembali ke halaman login).
     */
    public function logout(Request $request): RedirectResponse
    {
        $request->session()->forget([
            'voter_student_id',
            'voter_period_id',
            'voter_voted',
        ]);

        return redirect()->route('voter.login');
    }
}
