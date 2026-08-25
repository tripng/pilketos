<?php

namespace App\Http\Controllers;

use App\Models\ClassRoom;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ClassRoomController extends Controller
{
    /**
     * Tampilkan seluruh kelas untuk diatur buka/tutup akses login.
     */
    public function index(): Response
    {
        $classes = ClassRoom::orderBy('code')
            ->get(['id', 'code', 'name', 'is_open'])
            ->map(function (ClassRoom $c) {
                return [
                    'id' => $c->id,
                    'code' => $c->code,
                    'name' => $c->name,
                    'is_open' => (bool) $c->is_open,
                    'student_count' => $c->students()->count(),
                ];
            });

        return Inertia::render('ClassSettings', [
            'classes' => $classes,
        ]);
    }

    /**
     * Balik status buka/tutup sebuah kelas (hanya kelas terbuka yang bisa login).
     */
    public function toggle(Request $request, ClassRoom $classRoom): RedirectResponse
    {
        $classRoom->update([
            'is_open' => ! $classRoom->is_open,
        ]);

        // Redirect ke index agar props kelas ikut segar (tanpa full reload SPA)
        return redirect()->route('admin.classes');
    }
}
