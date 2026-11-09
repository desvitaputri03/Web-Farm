<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Rename tabel & kolom dari Bahasa Inggris ke Bahasa Indonesia
 *
 * Untuk MySQL: rename kolom satu per satu menggunakan information_schema + ALTER TABLE CHANGE.
 * Untuk SQLite: skip semua operasi (tidak support rename kolom & information_schema).
 *               Tabel akan dibuat dari awal dengan struktur benar oleh migration fix terpisah.
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // SQLite: skip, akan ditangani oleh migration fix 2026_10_21
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

        // Drop foreign keys before renaming
        $dropFkIfExist('cows', 'cowBarnID');
        $dropFkIfExist('cows', 'cowOwnerID');
        $dropFkIfExist('cows', 'cowStationID');
        $dropFkIfExist('physiologies', 'phyCowID');
        $dropFkIfExist('behavior_logs', 'behCowID');
        $dropFkIfExist('feed_logs', 'feedCowID');
        $dropFkIfExist('feed_logs', 'feedStationID');
        $dropFkIfExist('camera_logs', 'camCowID');
        $dropFkIfExist('camera_logs', 'barnID');
        $dropFkIfExist('examination_records', 'cow_id');

        // Rename columns for each table safely using raw statements for compatibility
        $renameCol = function($table, $oldCol, $newCol, $definition) {
            try {
                $cols = DB::select("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?", [$table, $oldCol]);
                if (!empty($cols)) {
                    DB::statement("ALTER TABLE `{$table}` CHANGE `{$oldCol}` `{$newCol}` {$definition}");
                }
            } catch (\Throwable $e) {}
        };

        // 1. barns -> kandang
        $renameCol('barns', 'barnID', 'id_kandang', 'VARCHAR(50) NOT NULL');
        $renameCol('barns', 'barnName', 'nama_kandang', 'VARCHAR(100) NOT NULL');
        $renameCol('barns', 'barnLocation', 'lokasi_kandang', 'VARCHAR(255) NULL');
        $renameCol('barns', 'barnCapacity', 'kapasitas_kandang', 'INT NOT NULL DEFAULT 10');
        $renameCol('barns', 'barnTemperature', 'suhu_kandang', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnHumidity', 'kelembapan_kandang', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnGasNH3', 'kadar_gas_amonia', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnGasCH4', 'kadar_gas_metana', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnLight', 'pencahayaan', 'INT NULL');
        $renameCol('barns', 'barnWindSpeed', 'kecepatan_angin', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnRainfall', 'curah_hujan', 'DECIMAL(5,2) NULL');
        $renameCol('barns', 'barnFloorCondition', 'kondisi_lantai', "ENUM('Bersih', 'Kotor') DEFAULT 'Bersih'");
        if (Schema::hasTable('barns') && !Schema::hasTable('kandang')) {
            Schema::rename('barns', 'kandang');
        }

        // 2. feeding_stations -> tempat_makan
        $renameCol('feeding_stations', 'stationID', 'id_tempat_makan', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('feeding_stations', 'stationCode', 'kode_tempat_makan', 'VARCHAR(50) NOT NULL');
        $renameCol('feeding_stations', 'stationName', 'nama_tempat_makan', 'VARCHAR(255) NULL');
        $renameCol('feeding_stations', 'stationType', 'tipe_tempat_makan', "ENUM('makan', 'minum', 'campur') DEFAULT 'makan'");
        $renameCol('feeding_stations', 'stationLocation', 'lokasi_tempat_makan', 'VARCHAR(255) NULL');
        if (Schema::hasTable('feeding_stations') && !Schema::hasTable('tempat_makan')) {
            Schema::rename('feeding_stations', 'tempat_makan');
        }

        // 3. cows -> sapi
        $renameCol('cows', 'cowID', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('cows', 'cowGender', 'jenis_kelamin', "ENUM('Jantan', 'Betina') NOT NULL");
        $renameCol('cows', 'cowBirthDate', 'tanggal_lahir', 'DATE NULL');
        $renameCol('cows', 'cowBreed', 'ras_sapi', 'VARCHAR(255) NOT NULL');
        $renameCol('cows', 'cowHistory', 'riwayat_sapi', 'TEXT NULL');
        $renameCol('cows', 'cowPhoto', 'foto_sapi', 'LONGTEXT NULL');
        $renameCol('cows', 'cowPurchasePrice', 'harga_beli', 'DECIMAL(12,2) NULL');
        $renameCol('cows', 'cowBarnID', 'id_kandang', 'VARCHAR(50) NOT NULL');
        $renameCol('cows', 'cowStationID', 'id_tempat_makan', 'BIGINT UNSIGNED NULL');
        $renameCol('cows', 'cowOwnerID', 'id_pemilik', 'BIGINT UNSIGNED NULL');
        if (Schema::hasTable('cows') && !Schema::hasTable('sapi')) {
            Schema::rename('cows', 'sapi');
        }

        // 4. physiologies -> fisiologis
        $renameCol('physiologies', 'phyID', 'id_fisiologis', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('physiologies', 'phyCowID', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('physiologies', 'phyStatus', 'status_fisiologis', 'VARCHAR(50) NOT NULL');
        $renameCol('physiologies', 'phyInitialWeight', 'bobot_awal', 'DECIMAL(6,2) NULL');
        $renameCol('physiologies', 'phyMeasuredInitialWeight', 'bobot_terukur_awal', 'DECIMAL(6,2) NULL');
        $renameCol('physiologies', 'phyTargetWeight', 'bobot_target', 'DECIMAL(6,2) NULL');
        $renameCol('physiologies', 'phyCurrentWeight', 'bobot_terkini', 'DECIMAL(6,2) NULL');
        $renameCol('physiologies', 'phyTemperature', 'suhu_tubuh', 'DECIMAL(4,2) NULL');
        $renameCol('physiologies', 'phyHealthHistory', 'riwayat_kesehatan', 'TEXT NULL');
        if (Schema::hasTable('physiologies') && !Schema::hasTable('fisiologis')) {
            Schema::rename('physiologies', 'fisiologis');
        }

        // 5. behavior_logs -> log_perilaku
        $renameCol('behavior_logs', 'behID', 'id_log_perilaku', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('behavior_logs', 'behCowID', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('behavior_logs', 'behActivity', 'aktivitas', "VARCHAR(50) NOT NULL");
        $renameCol('behavior_logs', 'accelX', 'akselerasi_x', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'accelY', 'akselerasi_y', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'accelZ', 'akselerasi_z', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'gyroX', 'gyro_x', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'gyroY', 'gyro_y', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'gyroZ', 'gyro_z', 'DECIMAL(8,4) NULL');
        $renameCol('behavior_logs', 'behStartTime', 'waktu_mulai', 'DATETIME NOT NULL');
        $renameCol('behavior_logs', 'behEndTime', 'waktu_selesai', 'DATETIME NOT NULL');
        $renameCol('behavior_logs', 'behSource', 'sumber_data', "VARCHAR(50) DEFAULT 'Input Manual'");
        if (Schema::hasTable('behavior_logs') && !Schema::hasTable('log_perilaku')) {
            Schema::rename('behavior_logs', 'log_perilaku');
        }

        // 6. feed_logs -> log_pakan
        $renameCol('feed_logs', 'feedID', 'id_log_pakan', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('feed_logs', 'feedCowID', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('feed_logs', 'feedStationID', 'id_tempat_makan', 'BIGINT UNSIGNED NULL');
        $renameCol('feed_logs', 'feedComposition', 'komposisi_pakan', 'VARCHAR(100) NOT NULL');
        $renameCol('feed_logs', 'feedInitialFeed', 'pakan_awal', 'DECIMAL(5,2) NOT NULL');
        $renameCol('feed_logs', 'feedLeftoverFeed', 'sisa_pakan', 'DECIMAL(5,2) NOT NULL');
        $renameCol('feed_logs', 'feedFrequency', 'frekuensi_makan', 'INT NULL DEFAULT 2');
        $renameCol('feed_logs', 'feedWaterQuality', 'kualitas_air', "VARCHAR(50) NULL DEFAULT 'Baik'");
        $renameCol('feed_logs', 'feedInitialWater', 'air_awal', 'DECIMAL(5,2) NULL DEFAULT 0');
        $renameCol('feed_logs', 'feedLeftoverWater', 'sisa_air', 'DECIMAL(5,2) NULL DEFAULT 0');
        if (Schema::hasTable('feed_logs') && !Schema::hasTable('log_pakan')) {
            Schema::rename('feed_logs', 'log_pakan');
        }

        // 7. camera_logs -> log_kamera
        $renameCol('camera_logs', 'camID', 'id_log_kamera', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('camera_logs', 'barnID', 'id_kandang', 'VARCHAR(50) NULL');
        $renameCol('camera_logs', 'camCowID', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('camera_logs', 'camActivity', 'aktivitas', 'VARCHAR(100) NOT NULL');
        $renameCol('camera_logs', 'camConfidence', 'tingkat_kepercayaan', 'DECIMAL(5,2) NULL');
        $renameCol('camera_logs', 'camDetectedCount', 'jumlah_terdeteksi', 'INT NULL DEFAULT 1');
        $renameCol('camera_logs', 'camImagePath', 'path_foto', 'VARCHAR(255) NULL');
        $renameCol('camera_logs', 'camCapturedAt', 'waktu_deteksi', 'DATETIME NOT NULL');
        if (Schema::hasTable('camera_logs') && !Schema::hasTable('log_kamera')) {
            Schema::rename('camera_logs', 'log_kamera');
        }

        // 8. examination_records -> riwayat_pemeriksaan
        $renameCol('examination_records', 'id', 'id_pemeriksaan', 'BIGINT UNSIGNED AUTO_INCREMENT');
        $renameCol('examination_records', 'cow_id', 'id_sapi', 'VARCHAR(50) NOT NULL');
        $renameCol('examination_records', 'diagnosis_notes', 'catatan_diagnosa', 'TEXT NOT NULL');
        $renameCol('examination_records', 'examination_date', 'tanggal_pemeriksaan', 'DATE NOT NULL');
        $renameCol('examination_records', 'input_date', 'waktu_input', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        if (Schema::hasTable('examination_records') && !Schema::hasTable('riwayat_pemeriksaan')) {
            Schema::rename('examination_records', 'riwayat_pemeriksaan');
        }

        // Re-add Foreign Keys with Indonesian column names
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

        if (Schema::hasTable('riwayat_pemeriksaan')) Schema::rename('riwayat_pemeriksaan', 'examination_records');
        if (Schema::hasTable('log_kamera')) Schema::rename('log_kamera', 'camera_logs');
        if (Schema::hasTable('log_pakan')) Schema::rename('log_pakan', 'feed_logs');
        if (Schema::hasTable('log_perilaku')) Schema::rename('log_perilaku', 'behavior_logs');
        if (Schema::hasTable('fisiologis')) Schema::rename('fisiologis', 'physiologies');
        if (Schema::hasTable('sapi')) Schema::rename('sapi', 'cows');
        if (Schema::hasTable('tempat_makan')) Schema::rename('tempat_makan', 'feeding_stations');
        if (Schema::hasTable('kandang')) Schema::rename('kandang', 'barns');

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
