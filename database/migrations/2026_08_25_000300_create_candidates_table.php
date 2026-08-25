<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Pasangan calon (paslon) per periode.
     */
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('period_id')->constrained('election_periods')->cascadeOnDelete();
            $table->unsignedTinyInteger('number')->comment('urut paslon 1-4');
            $table->string('name');
            $table->string('capres_name');
            $table->string('cawapres_name');
            $table->string('capres_photo')->nullable();
            $table->string('capres_photo_happy')->nullable();
            $table->string('cawapres_photo')->nullable();
            $table->string('cawapres_photo_happy')->nullable();
            $table->string('color')->default('#059669');
            $table->timestamps();

            $table->unique(['period_id', 'number']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
