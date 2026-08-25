<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class VoteController extends Controller
{
    /**
     * Halaman pemilihan — hanya untuk pemilih yang sudah login & belum memilih.
     */
    public function index(Request $request): Response
    {
        $studentId = $request->session()->get('voter_student_id');
        $periodId = $request->session()->get('voter_period_id');

        if (! $studentId) {
            return redirect()->route('voter.login');
        }

        $student = Student::find($studentId);
        $period = ElectionPeriod::find($periodId);

        if (! $student || ! $period) {
            return Inertia::render('VoterLogin', [
                'errors' => ['nisn' => 'Sesi tidak valid, silakan masuk lagi.'],
            ]);
        }

        // Sudah memilih? arahkan ke halaman terima kasih
        $alreadyVoted = Vote::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->exists();

        if ($alreadyVoted) {
            return Inertia::render('VoteDone', [
                'studentName' => $student->name,
            ]);
        }

        $candidates = Candidate::orderBy('number')
            ->get(['id', 'number', 'capres_name', 'capres_photo', 'capres_photo_happy', 'cawapres_name', 'cawapres_photo', 'cawapres_photo_happy', 'motto', 'color'])
            ->map(function (Candidate $c) {
                return [
                    'id' => $c->id,
                    'number' => $c->number,
                    'capres' => ['name' => $c->capres_name, 'photo' => $c->capres_photo, 'photoHappy' => $c->capres_photo_happy],
                    'cawapres' => ['name' => $c->cawapres_name, 'photo' => $c->cawapres_photo, 'photoHappy' => $c->cawapres_photo_happy],
                    'motto' => $c->motto,
                    'color' => $c->color,
                ];
            });

        return Inertia::render('Vote', [
            'studentName' => $student->name,
            'candidates' => $candidates,
        ]);
    }

    /**
     * Proses penyimpanan suara.
     */
    public function store(Request $request)
    {
        $studentId = $request->session()->get('voter_student_id');
        $periodId = $request->session()->get('voter_period_id');

        if (! $studentId || ! $periodId) {
            return redirect()->route('voter.login');
        }

        $student = Student::find($studentId);
        $period = ElectionPeriod::find($periodId);

        // Validasi ulang: kelas masih dibuka & belum memilih
        if (! $student || ! $student->class || ! $student->class->is_open) {
            return redirect()->route('voter.login')
                ->withErrors(['nisn' => 'Kelas Anda sudah ditutup.']);
        }

        $candidateId = $request->input('candidate_id');
        $candidate = Candidate::find($candidateId);
        if (! $candidate) {
            return back()->withErrors(['candidate' => 'Calon tidak valid.']);
        }

        $exists = Vote::where('student_id', $student->id)
            ->where('period_id', $period->id)
            ->exists();
        if ($exists) {
            return Inertia::render('VoteDone', ['studentName' => $student->name]);
        }

        Vote::create([
            'student_id' => $student->id,
            'candidate_id' => $candidate->id,
            'period_id' => $period->id,
            'voted_at' => now(),
        ]);

        // Suara terekam → clear sesi pemilih agar tidak bisa memilih lagi
        // dan agar "/" kembali menampilkan form login.
        $request->session()->forget([
            'voter_student_id',
            'voter_period_id',
            'voter_voted',
        ]);

        return Inertia::render('VoteDone', [
            'studentName' => $student->name,
        ]);
    }
}
