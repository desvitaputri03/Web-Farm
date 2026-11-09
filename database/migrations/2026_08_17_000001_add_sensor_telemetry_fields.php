<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tambah kolom IMU (Akselerometer & Gyroscope) pada behavior_logs
        if (Schema::hasTable('behavior_logs')) {
            Schema::table('behavior_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('behavior_logs', 'accelX')) {
                    $table->decimal('accelX', 8, 4)->nullable()->after('behActivity');
                }
                if (!Schema::hasColumn('behavior_logs', 'accelY')) {
                    $table->decimal('accelY', 8, 4)->nullable()->after('accelX');
                }
                if (!Schema::hasColumn('behavior_logs', 'accelZ')) {
                    $table->decimal('accelZ', 8, 4)->nullable()->after('accelY');
                }
                if (!Schema::hasColumn('behavior_logs', 'gyroX')) {
                    $table->decimal('gyroX', 8, 4)->nullable()->after('accelZ');
                }
                if (!Schema::hasColumn('behavior_logs', 'gyroY')) {
                    $table->decimal('gyroY', 8, 4)->nullable()->after('gyroX');
                }
                if (!Schema::hasColumn('behavior_logs', 'gyroZ')) {
                    $table->decimal('gyroZ', 8, 4)->nullable()->after('gyroY');
                }
            });
        }

        // 2. Tambah kolom Gas Amonia & Gas Metana pada barns (Lingkungan Kandang)
        if (Schema::hasTable('barns')) {
            Schema::table('barns', function (Blueprint $table) {
                if (!Schema::hasColumn('barns', 'barnGasNH3')) {
                    $table->decimal('barnGasNH3', 8, 2)->nullable()->default(12.5)->after('barnHumidity');
                }
                if (!Schema::hasColumn('barns', 'barnGasCH4')) {
                    $table->decimal('barnGasCH4', 8, 2)->nullable()->default(5.0)->after('barnGasNH3');
                }
            });
        }

        // 3. Tambah kolom id_kandang & jumlah_terdeteksi pada camera_logs (Sensor Kamera)
        if (Schema::hasTable('camera_logs')) {
            Schema::table('camera_logs', function (Blueprint $table) {
                if (!Schema::hasColumn('camera_logs', 'barnID')) {
                    $table->string('barnID')->nullable()->after('camID');
                }
                if (!Schema::hasColumn('camera_logs', 'camDetectedCount')) {
                    $table->integer('camDetectedCount')->nullable()->default(1)->after('camConfidence');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('behavior_logs')) {
            Schema::table('behavior_logs', function (Blueprint $table) {
                $table->dropColumn(['accelX', 'accelY', 'accelZ', 'gyroX', 'gyroY', 'gyroZ']);
            });
        }

        if (Schema::hasTable('barns')) {
            Schema::table('barns', function (Blueprint $table) {
                $table->dropColumn(['barnGasNH3', 'barnGasCH4']);
            });
        }

        if (Schema::hasTable('camera_logs')) {
            Schema::table('camera_logs', function (Blueprint $table) {
                $table->dropColumn(['barnID', 'camDetectedCount']);
            });
        }
    }
};
