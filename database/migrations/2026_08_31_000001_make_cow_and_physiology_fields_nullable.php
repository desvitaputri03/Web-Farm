<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Make cow & physiology fields nullable
 *
 * Untuk MySQL: ALTER kolom menjadi nullable.
 * Untuk SQLite: skip (sudah ditangani oleh migration fix 2026_10_21 dengan recreate tabel).
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // SQLite: skip, akan ditangani migration fix terpisah
        }

        Schema::table('cows', function (Blueprint $table) {
            $table->date('cowBirthDate')->nullable()->change();
            $table->text('cowHistory')->nullable()->change();
            $table->decimal('cowPurchasePrice', 12, 2)->nullable()->change();
        });

        Schema::table('physiologies', function (Blueprint $table) {
            $table->decimal('phyInitialWeight', 6, 2)->nullable()->change();
            $table->decimal('phyTargetWeight', 6, 2)->nullable()->change();
            $table->decimal('phyCurrentWeight', 6, 2)->nullable()->change();
            $table->decimal('phyTemperature', 4, 2)->nullable()->change();
            $table->text('phyHealthHistory')->nullable()->change();
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        Schema::table('cows', function (Blueprint $table) {
            $table->date('cowBirthDate')->nullable(false)->change();
            $table->text('cowHistory')->nullable(false)->change();
            $table->decimal('cowPurchasePrice', 12, 2)->nullable(false)->change();
        });

        Schema::table('physiologies', function (Blueprint $table) {
            $table->decimal('phyInitialWeight', 6, 2)->nullable(false)->change();
            $table->decimal('phyTargetWeight', 6, 2)->nullable(false)->change();
            $table->decimal('phyCurrentWeight', 6, 2)->nullable(false)->change();
            $table->decimal('phyTemperature', 4, 2)->nullable(false)->change();
            $table->text('phyHealthHistory')->nullable(false)->change();
        });
    }
};
