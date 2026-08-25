<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\ElectionPeriod;
use App\Models\Student;
use App\Models\Vote;
use Illuminate\Database\Eloquent\Factories\Factory;

class VoteFactory extends Factory
{
    protected $model = Vote::class;

    public function definition(): array
    {
        return [
            'student_id' => Student::factory(),
            'candidate_id' => Candidate::factory(),
            'period_id' => ElectionPeriod::factory(),
            'voted_at' => now(),
        ];
    }
}
