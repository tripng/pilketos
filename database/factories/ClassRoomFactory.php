<?php

namespace Database\Factories;

use App\Models\ClassRoom;
use Illuminate\Database\Eloquent\Factories\Factory;

class ClassRoomFactory extends Factory
{
    protected $model = ClassRoom::class;

    public function definition(): array
    {
        return [
            'code' => strtoupper(fake()->bothify('?#')),
            'name' => fake()->word(),
            'is_open' => true,
        ];
    }
}
