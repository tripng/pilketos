<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ElectionPeriod extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'year',
        'is_active',
        'access_token',
        'token_rotated_at',
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'is_active' => 'boolean',
        'access_token' => 'string',
        'token_rotated_at' => 'datetime',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    /**
     * Rotasi token global jika sudah lewat $minutes menit sejak rotasi terakhir.
     * Dipanggil saat ada request login siswa / buka dashboard admin, sehingga
     * token berganti otomatis tiap periode tanpa bergantung cron.
     * (Bonus: scheduler `php artisan schedule` juga memanggil ini tiap menit.)
     */
    public function ensureFreshToken(int $minutes = 2): void
    {
        $needRotate = $this->token_rotated_at === null
            || $this->access_token === null
            || $this->token_rotated_at->copy()->addMinutes($minutes)->isPast();

        if (! $needRotate) {
            return;
        }

        $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        $token = '';
        for ($i = 0; $i < 4; $i++) {
            $token .= $chars[random_int(0, 25)];
        }

        $this->access_token = $token;
        $this->token_rotated_at = now();
        $this->save();
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class, 'period_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'period_id');
    }
}
