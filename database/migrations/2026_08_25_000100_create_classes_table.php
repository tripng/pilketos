<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kelas siswa. Hanya kelas yang is_open=true yang boleh login/memilih.
     */
    public function up(): void
    {
        Schema::create('classes', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique()->comment('X1, XI2, XII6, dst');
            $table->string('name');
            $table->boolean('is_open')->default(true)->comment('buka/tutup akses login');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('classes');
    }
};
