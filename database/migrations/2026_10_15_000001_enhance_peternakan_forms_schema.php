<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        // 1. Tambah kolom pada tabel 'log_pakan' untuk form input manual pakan & 3 sesi makan
        if (Schema::hasTable('log_pakan')) {
            Schema::table('log_pakan', function (Blueprint $table) {
                if (!Schema::hasColumn('log_pakan', 'harga_pakan_per_kg')) {
                    $table->decimal('harga_pakan_per_kg', 12, 2)->nullable()->default(5000)->after('sisa_pakan');
                }
                if (!Schema::hasColumn('log_pakan', 'biaya_pakan_harian')) {
                    $table->decimal('biaya_pakan_harian', 12, 2)->nullable()->default(50000)->after('harga_pakan_per_kg');
                }
                if (!Schema::hasColumn('log_pakan', 'tanggal_pencatatan')) {
                    $table->date('tanggal_pencatatan')->nullable()->after('biaya_pakan_harian');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_1_jam')) {
                    $table->string('sesi_makan_1_jam', 10)->nullable()->default('07:00')->after('tanggal_pencatatan');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_1_durasi')) {
                    $table->integer('sesi_makan_1_durasi')->nullable()->default(20)->after('sesi_makan_1_jam');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_1_pakan')) {
                    $table->decimal('sesi_makan_1_pakan', 6, 2)->nullable()->default(3.33)->after('sesi_makan_1_durasi');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_2_jam')) {
                    $table->string('sesi_makan_2_jam', 10)->nullable()->default('12:00')->after('sesi_makan_1_pakan');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_2_durasi')) {
                    $table->integer('sesi_makan_2_durasi')->nullable()->default(15)->after('sesi_makan_2_jam');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_2_pakan')) {
                    $table->decimal('sesi_makan_2_pakan', 6, 2)->nullable()->default(3.33)->after('sesi_makan_2_durasi');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_3_jam')) {
                    $table->string('sesi_makan_3_jam', 10)->nullable()->default('17:00')->after('sesi_makan_2_pakan');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_3_durasi')) {
                    $table->integer('sesi_makan_3_durasi')->nullable()->default(25)->after('sesi_makan_3_jam');
                }
                if (!Schema::hasColumn('log_pakan', 'sesi_makan_3_pakan')) {
                    $table->decimal('sesi_makan_3_pakan', 6, 2)->nullable()->default(3.34)->after('sesi_makan_3_durasi');
                }
                if (!Schema::hasColumn('log_pakan', 'total_durasi_makan')) {
                    $table->integer('total_durasi_makan')->nullable()->default(60)->after('sesi_makan_3_pakan');
                }
                if (!Schema::hasColumn('log_pakan', 'keterangan')) {
                    $table->text('keterangan')->nullable()->after('total_durasi_makan');
                }
            });
        }

        // 2. Tambah kolom pada tabel 'fisiologis' untuk form riwayat suhu manual & berat badan
        if (Schema::hasTable('fisiologis')) {
            Schema::table('fisiologis', function (Blueprint $table) {
                if (!Schema::hasColumn('fisiologis', 'tanggal_pencatatan')) {
                    $table->date('tanggal_pencatatan')->nullable()->after('suhu_tubuh');
                }
                if (!Schema::hasColumn('fisiologis', 'jam_pengukuran')) {
                    $table->string('jam_pengukuran', 10)->nullable()->default('08:00')->after('tanggal_pencatatan');
                }
                if (!Schema::hasColumn('fisiologis', 'jenis_pencatatan')) {
                    $table->string('jenis_pencatatan', 50)->nullable()->default('Penimbangan Berkala')->after('jam_pengukuran');
                }
            });
        }

        // 3. Tambah kolom pada tabel 'sapi' untuk status pemeliharaan & target jual
        if (Schema::hasTable('sapi')) {
            Schema::table('sapi', function (Blueprint $table) {
                if (!Schema::hasColumn('sapi', 'status_pemeliharaan')) {
                    $table->string('status_pemeliharaan', 50)->nullable()->default('Dipelihara')->after('riwayat_sapi');
                }
                if (!Schema::hasColumn('sapi', 'tanggal_beli')) {
                    $table->date('tanggal_beli')->nullable()->after('tanggal_lahir');
                }
                if (!Schema::hasColumn('sapi', 'berat_awal_beli')) {
                    $table->decimal('berat_awal_beli', 6, 2)->nullable()->default(200)->after('harga_beli');
                }
                if (!Schema::hasColumn('sapi', 'target_berat_jual')) {
                    $table->decimal('target_berat_jual', 6, 2)->nullable()->default(500)->after('berat_awal_beli');
                }
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('log_pakan')) {
            Schema::table('log_pakan', function (Blueprint $table) {
                $table->dropColumn([
                    'harga_pakan_per_kg',
                    'biaya_pakan_harian',
                    'tanggal_pencatatan',
                    'sesi_makan_1_jam',
                    'sesi_makan_1_durasi',
                    'sesi_makan_1_pakan',
                    'sesi_makan_2_jam',
                    'sesi_makan_2_durasi',
                    'sesi_makan_2_pakan',
                    'sesi_makan_3_jam',
                    'sesi_makan_3_durasi',
                    'sesi_makan_3_pakan',
                    'total_durasi_makan',
                    'keterangan'
                ]);
            });
        }

        if (Schema::hasTable('fisiologis')) {
            Schema::table('fisiologis', function (Blueprint $table) {
                $table->dropColumn(['tanggal_pencatatan', 'jam_pengukuran', 'jenis_pencatatan']);
            });
        }

        if (Schema::hasTable('sapi')) {
            Schema::table('sapi', function (Blueprint $table) {
                $table->dropColumn(['status_pemeliharaan', 'tanggal_beli', 'berat_awal_beli', 'target_berat_jual']);
            });
        }
    }
};
