<?php

namespace Database\Factories;

use App\Models\ElectionPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

class ElectionPeriodFactory extends Factory
{
    protected $model = ElectionPeriod::class;

    public function definition(): array
    {
        return [
            'name' => 'Pilketos ' . fake()->year(),
            'year' => fake()->year(),
            'is_active' => true,
            'opened_at' => now(),
            'closed_at' => null,
        ];
    }
}
