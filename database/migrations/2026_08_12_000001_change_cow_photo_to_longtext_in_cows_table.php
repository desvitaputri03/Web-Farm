<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Change cowPhoto to LONGTEXT nullable
 *
 * Untuk MySQL: ALTER kolom cowPhoto menjadi LONGTEXT nullable.
 * Untuk SQLite: skip (akan ditangani migration fix 2026_10_21).
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // SQLite: skip, migration fix akan recreate tabel dengan kolom yang benar
        }

        Schema::table('cows', function (Blueprint $table) {
            $table->longText('cowPhoto')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('cows', function (Blueprint $table) {
            $table->text('cowPhoto')->nullable()->change();
        });
    }
};
