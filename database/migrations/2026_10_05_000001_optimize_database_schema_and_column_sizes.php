<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Optimize database schema dan ukuran kolom
 *
 * Untuk MySQL: ALTER kolom untuk optimasi ukuran, drop & re-add FK.
 * Untuk SQLite: skip (akan ditangani migration fix 2026_10_21).
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // SQLite tidak perlu; sudah ditangani migration fix terpisah
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        $dropFkIfExist = function($table, $col) {
            try {
                $fks = DB::select("SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ? AND REFERENCED_TABLE_NAME IS NOT NULL", [$table, $col]);
                foreach ($fks as $fk) {
                    $name = $fk->CONSTRAINT_NAME ?? $fk->constraint_name;
                    DB::statement("ALTER TABLE `{$table}` DROP FOREIGN KEY `{$name}`");
                }
            } catch (\Throwable $e) {}
        };

        // 1. Drop foreign keys that touch altered ID columns
        $dropFkIfExist('sapi', 'id_kandang');
        $dropFkIfExist('sapi', 'id_tempat_makan');
        $dropFkIfExist('sapi', 'id_pemilik');
        $dropFkIfExist('fisiologis', 'id_sapi');
        $dropFkIfExist('log_perilaku', 'id_sapi');
        $dropFkIfExist('log_pakan', 'id_sapi');
        $dropFkIfExist('log_pakan', 'id_tempat_makan');
        $dropFkIfExist('log_kamera', 'id_sapi');
        $dropFkIfExist('log_kamera', 'id_kandang');
        $dropFkIfExist('riwayat_pemeriksaan', 'id_sapi');

        // 2. Optimize 'users' table
        try {
            DB::statement("ALTER TABLE `users` MODIFY `name` VARCHAR(100) NOT NULL");
            DB::statement("ALTER TABLE `users` MODIFY `email` VARCHAR(100) NOT NULL");
            $hasPhone = DB::select("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'nomor_telepon'");
            if (empty($hasPhone)) {
                DB::statement("ALTER TABLE `users` ADD COLUMN `nomor_telepon` VARCHAR(20) NULL AFTER `email`");
            } else {
                DB::statement("ALTER TABLE `users` MODIFY `nomor_telepon` VARCHAR(20) NULL");
            }
        } catch (\Throwable $e) {}

        // 3. Optimize 'kandang' table
        try {
            DB::statement("ALTER TABLE `kandang` MODIFY `id_kandang` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `kandang` MODIFY `lokasi_kandang` VARCHAR(100) NULL");
        } catch (\Throwable $e) {}

        // 4. Optimize 'tempat_makan' table
        try {
            DB::statement("ALTER TABLE `tempat_makan` MODIFY `kode_tempat_makan` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `tempat_makan` MODIFY `nama_tempat_makan` VARCHAR(100) NULL");
            DB::statement("ALTER TABLE `tempat_makan` MODIFY `lokasi_tempat_makan` VARCHAR(100) NULL");
        } catch (\Throwable $e) {}

        // 5. Optimize 'sapi' table
        try {
            DB::statement("ALTER TABLE `sapi` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `sapi` MODIFY `ras_sapi` VARCHAR(50) NOT NULL");
            DB::statement("ALTER TABLE `sapi` MODIFY `foto_sapi` VARCHAR(255) NULL");
            DB::statement("ALTER TABLE `sapi` MODIFY `id_kandang` VARCHAR(30) NOT NULL");
        } catch (\Throwable $e) {}

        // 6. Optimize related tables
        try {
            DB::statement("ALTER TABLE `fisiologis` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `log_perilaku` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `log_pakan` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `log_pakan` MODIFY `kualitas_air` VARCHAR(30) NULL DEFAULT 'Baik'");
            DB::statement("ALTER TABLE `log_kamera` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
            DB::statement("ALTER TABLE `log_kamera` MODIFY `id_kandang` VARCHAR(30) NULL");
            DB::statement("ALTER TABLE `riwayat_pemeriksaan` MODIFY `id_sapi` VARCHAR(30) NOT NULL");
        } catch (\Throwable $e) {}

        // 7. Re-add Foreign Key Constraints cleanly
        Schema::table('sapi', function (Blueprint $table) {
            try { $table->foreign('id_kandang')->references('id_kandang')->on('kandang')->onDelete('cascade'); } catch (\Throwable $e) {}
            try { $table->foreign('id_tempat_makan')->references('id_tempat_makan')->on('tempat_makan')->nullOnDelete(); } catch (\Throwable $e) {}
            try { $table->foreign('id_pemilik')->references('id')->on('users')->nullOnDelete(); } catch (\Throwable $e) {}
        });

        Schema::table('fisiologis', function (Blueprint $table) {
            try { $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade'); } catch (\Throwable $e) {}
        });

        Schema::table('log_perilaku', function (Blueprint $table) {
            try { $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade'); } catch (\Throwable $e) {}
        });

        Schema::table('log_pakan', function (Blueprint $table) {
            try { $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade'); } catch (\Throwable $e) {}
            try { $table->foreign('id_tempat_makan')->references('id_tempat_makan')->on('tempat_makan')->nullOnDelete(); } catch (\Throwable $e) {}
        });

        Schema::table('log_kamera', function (Blueprint $table) {
            try { $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade'); } catch (\Throwable $e) {}
            try { $table->foreign('id_kandang')->references('id_kandang')->on('kandang')->nullOnDelete(); } catch (\Throwable $e) {}
        });

        Schema::table('riwayat_pemeriksaan', function (Blueprint $table) {
            try { $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade'); } catch (\Throwable $e) {}
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        try {
            DB::statement("ALTER TABLE `users` MODIFY `name` VARCHAR(255) NOT NULL");
            DB::statement("ALTER TABLE `users` MODIFY `email` VARCHAR(255) NOT NULL");
            DB::statement("ALTER TABLE `sapi` MODIFY `ras_sapi` VARCHAR(255) NOT NULL");
            DB::statement("ALTER TABLE `sapi` MODIFY `foto_sapi` LONGTEXT NULL");
            DB::statement("ALTER TABLE `kandang` MODIFY `lokasi_kandang` VARCHAR(255) NULL");
            DB::statement("ALTER TABLE `tempat_makan` MODIFY `nama_tempat_makan` VARCHAR(255) NULL");
            DB::statement("ALTER TABLE `tempat_makan` MODIFY `lokasi_tempat_makan` VARCHAR(255) NULL");
        } catch (\Throwable $e) {}

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
