<?php

namespace App\Http\Controllers;

use App\Models\Admin;
use App\Models\ClassRoom;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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

        // Validasi NISN wajib diisi & angka 8-12 digit
        // (data siswa asli 8-10 digit; siswa cadangan 12 digit).
        $validator = \Illuminate\Support\Facades\Validator::make(
            ['nisn' => $nisn],
            ['nisn' => 'required|digits_between:8,12'],
        );
        if ($validator->fails()) {
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Rotasi token otomatis tiap 2 menit (tanpa cron) — dipanggil tiap
        // request login. Token lama otomatis diganti jika sudah lewat 2 menit.
        $period = ElectionPeriod::where('is_active', true)->first();
        if ($period) {
            $period->ensureFreshToken(2);
        }

        // Filter 0: NISN ini milik admin? → login sebagai admin lalu ke panel.
        // Admin BEBAS token (hanya siswa yang wajib token).
        $admin = Admin::where('nisn', $nisn)->first();
        if ($admin) {
            Auth::guard('admin')->login($admin);
            $request->session()->regenerate();
            // Tulis session ke store seketika agar tersedia pada request berikutnya.
            $request->session()->save();

            return redirect()->route('admin.dashboard');
        }

        // Token global wajib & harus cocok dengan token periode aktif (khusus siswa).
        // Ini murni session Laravel (bukan JWT) — token hanya "kunci" yang
        // dicek cocok sebelum siswa diizinkan login.
        $token = (string) $request->input('token');
        $period = ElectionPeriod::where('is_active', true)->first();
        if (! $period || ! $period->access_token || ! \hash_equals($period->access_token, $token)) {
            $validator->errors()->add('token', 'Token tidak valid.');
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        $student = Student::where('nisn', $nisn)->first();

        // Filter 1: NISN terdaftar
        if (! $student) {
            $validator->errors()->add('nisn', 'NISN tidak terdaftar.');
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Filter 2: Kelas dibuka
        if (! $student->class || ! $student->class->is_open) {
            $validator->errors()->add('nisn', 'Kelas Anda belum dibuka untuk memilih.');
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Periode aktif
        $period = ElectionPeriod::where('is_active', true)->first();
        if (! $period) {
            $validator->errors()->add('nisn', 'Pemilihan belum dibuka.');
            throw new \Illuminate\Validation\ValidationException($validator);
        }

        // Filter 3: Belum memilih
        $already = Vote::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->exists();
        if ($already) {
            $validator->errors()->add('nisn', 'Anda sudah memberikan suara.');
            throw new \Illuminate\Validation\ValidationException($validator);
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
