<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom token_rotated_at untuk melacak kapan token global
     * terakhir diganti (rotasi otomatis tiap 2 menit).
     */
    public function up(): void
    {
        Schema::table('election_periods', function (Blueprint $table) {
            $table->timestamp('token_rotated_at')->nullable()->after('access_token');
        });
    }

    public function down(): void
    {
        Schema::table('election_periods', function (Blueprint $table) {
            $table->dropColumn('token_rotated_at');
        });
    }
};
