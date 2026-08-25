<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Periode pemilihan (tahunan). Satu siswa hanya boleh memilih 1x per periode.
     */
    public function up(): void
    {
        Schema::create('election_periods', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->year('year');
            $table->boolean('is_active')->default(true);
            $table->timestamp('opened_at')->nullable();
            $table->timestamp('closed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('election_periods');
    }
};
