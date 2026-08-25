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
        'opened_at',
        'closed_at',
    ];

    protected $casts = [
        'year' => 'integer',
        'is_active' => 'boolean',
        'opened_at' => 'datetime',
        'closed_at' => 'datetime',
    ];

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class, 'period_id');
    }

    public function votes(): HasMany
    {
        return $this->hasMany(Vote::class, 'period_id');
    }
}
