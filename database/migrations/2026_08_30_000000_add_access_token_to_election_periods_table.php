<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom access_token (token global untuk seluruh siswa di periode ini).
     * Login pemilih membutuhkan NISN + token ini. Bukan JWT — murni
     * session Laravel (token hanya sebagai "kunci" yang dicek cocok).
     */
    public function up(): void
    {
        Schema::table('election_periods', function (Blueprint $table) {
            $table->string('access_token')->nullable()->after('is_active');
        });
    }

    public function down(): void
    {
        Schema::table('election_periods', function (Blueprint $table) {
            $table->dropColumn('access_token');
        });
    }
};
