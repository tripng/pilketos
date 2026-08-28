<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom nisn ke tabel admins agar admin bisa masuk panel
     * lewat form login pemilih (NISN) di halaman "/".
     */
    public function up(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->string('nisn')->unique()->nullable()->after('username');
        });
    }

    public function down(): void
    {
        Schema::table('admins', function (Blueprint $table) {
            $table->dropColumn('nisn');
        });
    }
};
