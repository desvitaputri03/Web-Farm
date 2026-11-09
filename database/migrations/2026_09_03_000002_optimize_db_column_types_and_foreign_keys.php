<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration: Optimize DB Column Types dan Foreign Keys
 * 
 * Untuk MySQL: alter kolom untuk mengubah panjang string, drop & re-add FK.
 * Untuk SQLite: skip semua ALTER (akan ditangani oleh migration fix terpisah).
 */
return new class extends Migration {
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return; // SQLite tidak perlu ALTER ini; migration fix akan handle
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

        // 1. Drop existing foreign keys safely
        $dropFkIfExist('cows', 'cowBarnID');
        $dropFkIfExist('physiologies', 'phyCowID');
        $dropFkIfExist('behavior_logs', 'behCowID');
        $dropFkIfExist('feed_logs', 'feedCowID');
        $dropFkIfExist('camera_logs', 'camCowID');
        $dropFkIfExist('camera_logs', 'barnID');
        $dropFkIfExist('examination_records', 'cow_id');

        // 2. Change column lengths
        Schema::table('barns', function (Blueprint $table) {
            $table->string('barnID', 50)->change();
        });

        Schema::table('cows', function (Blueprint $table) {
            $table->string('cowID', 50)->change();
            $table->string('cowBarnID', 50)->change();
        });

        Schema::table('feeding_stations', function (Blueprint $table) {
            $table->string('stationCode', 50)->change();
        });

        Schema::table('physiologies', function (Blueprint $table) {
            $table->string('phyCowID', 50)->change();
            $table->string('phyStatus', 50)->change();
        });

        Schema::table('behavior_logs', function (Blueprint $table) {
            $table->string('behCowID', 50)->change();
        });

        Schema::table('feed_logs', function (Blueprint $table) {
            $table->string('feedCowID', 50)->change();
        });

        Schema::table('camera_logs', function (Blueprint $table) {
            $table->string('barnID', 50)->nullable()->change();
            $table->string('camCowID', 50)->change();
        });

        Schema::table('examination_records', function (Blueprint $table) {
            $table->string('cow_id', 50)->change();
        });

        // 3. Re-add foreign keys
        Schema::table('cows', function (Blueprint $table) {
            $table->foreign('cowBarnID')->references('barnID')->on('barns')->onDelete('cascade');
        });
        Schema::table('physiologies', function (Blueprint $table) {
            $table->foreign('phyCowID')->references('cowID')->on('cows')->onDelete('cascade');
        });
        Schema::table('behavior_logs', function (Blueprint $table) {
            $table->foreign('behCowID')->references('cowID')->on('cows')->onDelete('cascade');
        });
        Schema::table('feed_logs', function (Blueprint $table) {
            $table->foreign('feedCowID')->references('cowID')->on('cows')->onDelete('cascade');
        });
        Schema::table('camera_logs', function (Blueprint $table) {
            $table->foreign('camCowID')->references('cowID')->on('cows')->onDelete('cascade');
            $table->foreign('barnID')->references('barnID')->on('barns')->nullOnDelete();
        });
        Schema::table('examination_records', function (Blueprint $table) {
            $table->foreign('cow_id')->references('cowID')->on('cows')->onDelete('cascade');
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0;');

        Schema::table('examination_records', function (Blueprint $table) {
            $table->string('cow_id', 255)->change();
        });

        Schema::table('camera_logs', function (Blueprint $table) {
            $table->string('camCowID', 255)->change();
            $table->string('barnID', 255)->nullable()->change();
        });

        Schema::table('feed_logs', function (Blueprint $table) {
            $table->string('feedCowID', 255)->change();
        });

        Schema::table('behavior_logs', function (Blueprint $table) {
            $table->string('behCowID', 255)->change();
        });

        Schema::table('physiologies', function (Blueprint $table) {
            $table->string('phyStatus', 255)->change();
            $table->string('phyCowID', 255)->change();
        });

        Schema::table('feeding_stations', function (Blueprint $table) {
            $table->string('stationCode', 255)->change();
        });

        Schema::table('cows', function (Blueprint $table) {
            $table->string('cowBarnID', 255)->change();
            $table->string('cowID', 255)->change();
        });

        Schema::table('barns', function (Blueprint $table) {
            $table->string('barnID', 255)->change();
        });

        DB::statement('SET FOREIGN_KEY_CHECKS=1;');
    }
};
