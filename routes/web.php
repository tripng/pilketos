<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\VoterAuthController;
use App\Http\Controllers\VoteController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

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

Route::get('/admin', [AdminController::class, 'dashboard'])
    ->name('admin.dashboard');

Route::get('/admin/kelas', [ClassRoomController::class, 'index'])
    ->name('admin.classes');

Route::post('/admin/kelas/{classRoom}/toggle', [ClassRoomController::class, 'toggle'])
    ->name('admin.classes.toggle');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
