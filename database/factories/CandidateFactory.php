<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\ElectionPeriod;
use Illuminate\Database\Eloquent\Factories\Factory;

class CandidateFactory extends Factory
{
    protected $model = Candidate::class;

    public function definition(): array
    {
        return [
            'period_id' => ElectionPeriod::factory(),
            'number' => fake()->numberBetween(1, 4),
            'name' => fake()->name(),
            'capres_name' => fake()->name(),
            'cawapres_name' => fake()->name(),
            'capres_photo' => null,
            'cawapres_photo' => null,
            'color' => '#059669',
        ];
    }
}
