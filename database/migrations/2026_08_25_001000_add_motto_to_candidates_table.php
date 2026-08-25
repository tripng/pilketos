<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Kolom motto (visi/moto paslon) sempat terlewat di migrasi awal
     * padahal di-select oleh VoteController. Tambahkan di sini.
     */
    public function up(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->text('motto')->nullable()->after('cawapres_photo_happy');
        });
    }

    public function down(): void
    {
        Schema::table('candidates', function (Blueprint $table) {
            $table->dropColumn('motto');
        });
    }
};
