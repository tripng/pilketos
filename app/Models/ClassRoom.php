<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ClassRoom extends Model
{
    use HasFactory;

    protected $table = 'classes';

    protected $fillable = ['code', 'name', 'is_open'];

    protected $casts = [
        'is_open' => 'boolean',
    ];

    public function students(): HasMany
    {
        return $this->hasMany(Student::class, 'class_id');
    }
}
