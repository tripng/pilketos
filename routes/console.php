<?php

use App\Models\ElectionPeriod;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Rotasi token global tiap 1 menit (jika sudah lewat 1 menit sejak rotasi terakhir,
// ensureFreshToken akan menggantinya). Berjalan otomatis kalau `php artisan schedule`
// dijalankan via cron; tanpa cron pun token tetap rotate saat ada request login/dashboard.
Artisan::command('token:rotate', function () {
    $period = ElectionPeriod::where('is_active', true)->first();
    if (! $period) {
        $this->warn('Tidak ada periode aktif.');
        return;
    }
    $before = $period->access_token;
    $period->ensureFreshToken(1);
    $this->info("Token: {$before} -> {$period->access_token}");
})->purpose('Rotate global access token if older than 1 minute');
