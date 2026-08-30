<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ClassRoomController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VoterAuthController;
use App\Http\Controllers\VoteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::post('/admin/logout', [AdminController::class, 'logout'])
    ->name('admin.logout');

Route::get('/', [VoterAuthController::class, 'showLogin'])
    ->name('voter.login');

Route::post('/voter/login', [VoterAuthController::class, 'authenticate'])
    ->name('voter.authenticate');

Route::post('/voter/logout', [VoterAuthController::class, 'logout'])
    ->name('voter.logout');

Route::get('/pilih', [VoteController::class, 'index'])
    ->name('vote');

Route::post('/pilih', [VoteController::class, 'store'])
    ->name('vote.store');

Route::middleware('auth.admin')->group(function () {
    Route::get('/admin', [AdminController::class, 'dashboard'])
        ->name('admin.dashboard');

    Route::get('/admin/kelas', [ClassRoomController::class, 'index'])
        ->name('admin.classes');

    Route::post('/admin/kelas/{classRoom}/toggle', [ClassRoomController::class, 'toggle'])
        ->name('admin.classes.toggle');

    Route::get('/admin/peserta', [AdminController::class, 'participants'])
        ->name('admin.participants');

    Route::post('/admin/peserta/{student}/reset', [AdminController::class, 'resetVote'])
        ->name('admin.participants.reset');

    Route::post('/admin/peserta/reset-all', [AdminController::class, 'resetAllVotes'])
        ->name('admin.participants.resetAll');

    Route::post('/admin/token/reset', [AdminController::class, 'resetToken'])
        ->name('admin.token.reset');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
