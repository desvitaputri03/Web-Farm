<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

/**
 * Migration Fix: SQLite Compatibility untuk Testing
 *
 * Masalah: Migration rename (2026_09_07) menggunakan MySQL-specific syntax
 * (information_schema, ALTER TABLE ... CHANGE) yang tidak berjalan di SQLite.
 * Akibatnya di SQLite tabel masih punya kolom lama (cowBarnID, dll.) DAN
 * foreign key baru (id_kandang, dll.) yang conflict sehingga semua tests gagal.
 *
 * Solusi: Di SQLite, drop dan recreate semua tabel dengan struktur final yang benar.
 * Di MySQL, skip (sudah dijalankan oleh migration sebelumnya di production).
 */
return new class extends Migration {
    public function up(): void
    {
        // Hanya jalankan di SQLite (testing environment)
        if (DB::getDriverName() !== 'sqlite') {
            return;
        }

        // Disable foreign key checks di SQLite agar bisa drop tanpa error
        DB::statement('PRAGMA foreign_keys = OFF');

        // Drop semua tabel yang bermasalah (urutan dari yang paling dependan)
        Schema::dropIfExists('riwayat_pemeriksaan');
        Schema::dropIfExists('examination_records');
        Schema::dropIfExists('log_kamera');
        Schema::dropIfExists('camera_logs');
        Schema::dropIfExists('log_pakan');
        Schema::dropIfExists('feed_logs');
        Schema::dropIfExists('log_perilaku');
        Schema::dropIfExists('behavior_logs');
        Schema::dropIfExists('fisiologis');
        Schema::dropIfExists('physiologies');
        Schema::dropIfExists('sapi');
        Schema::dropIfExists('cows');
        Schema::dropIfExists('tempat_makan');
        Schema::dropIfExists('feeding_stations');
        Schema::dropIfExists('kandang');
        Schema::dropIfExists('barns');

        // -------------------------------------------------------
        // 1. Buat kandang (dari barns)
        // -------------------------------------------------------
        Schema::create('kandang', function (Blueprint $table) {
            $table->string('id_kandang', 30)->primary();
            $table->string('nama_kandang', 100)->nullable();
            $table->string('lokasi_kandang', 100)->nullable();
            $table->integer('kapasitas_kandang')->default(10);
            $table->decimal('suhu_kandang', 5, 2)->nullable();
            $table->decimal('kelembapan_kandang', 5, 2)->nullable();
            $table->decimal('kadar_gas_amonia', 5, 2)->nullable();
            $table->decimal('kadar_gas_metana', 5, 2)->nullable();
            $table->integer('pencahayaan')->nullable();
            $table->decimal('kecepatan_angin', 5, 2)->nullable();
            $table->decimal('curah_hujan', 5, 2)->nullable();
            $table->enum('kondisi_lantai', ['Bersih', 'Kotor'])->default('Bersih');
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 2. Buat tempat_makan (dari feeding_stations)
        // -------------------------------------------------------
        Schema::create('tempat_makan', function (Blueprint $table) {
            $table->id('id_tempat_makan');
            $table->string('kode_tempat_makan', 30)->unique();
            $table->string('nama_tempat_makan', 100)->nullable();
            $table->enum('tipe_tempat_makan', ['makan', 'minum', 'campur'])->default('makan');
            $table->string('lokasi_tempat_makan', 100)->nullable();
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 3. Buat sapi (dari cows)
        // -------------------------------------------------------
        Schema::create('sapi', function (Blueprint $table) {
            $table->string('id_sapi', 30)->primary();
            $table->enum('jenis_kelamin', ['Jantan', 'Betina']);
            $table->date('tanggal_lahir')->nullable();
            $table->date('tanggal_beli')->nullable();
            $table->string('ras_sapi', 50);
            $table->text('riwayat_sapi')->nullable();
            $table->string('status_pemeliharaan', 50)->nullable()->default('Dipelihara');
            $table->decimal('harga_beli', 12, 2)->nullable();
            $table->decimal('berat_awal_beli', 6, 2)->nullable()->default(200);
            $table->decimal('target_berat_jual', 6, 2)->nullable()->default(500);
            $table->string('id_kandang', 30);
            $table->foreign('id_kandang')->references('id_kandang')->on('kandang')->onDelete('cascade');
            $table->unsignedBigInteger('id_tempat_makan')->nullable();
            $table->foreign('id_tempat_makan')->references('id_tempat_makan')->on('tempat_makan')->nullOnDelete();
            $table->unsignedBigInteger('id_pemilik')->nullable();
            $table->foreign('id_pemilik')->references('id')->on('users')->nullOnDelete();
            $table->string('foto_sapi', 255)->nullable();
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 4. Buat fisiologis (dari physiologies)
        // -------------------------------------------------------
        Schema::create('fisiologis', function (Blueprint $table) {
            $table->id('id_fisiologis');
            $table->string('id_sapi', 30);
            $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade');
            $table->string('status_fisiologis', 50);
            $table->decimal('bobot_awal', 6, 2)->nullable();
            $table->decimal('bobot_terukur_awal', 6, 2)->nullable();
            $table->decimal('bobot_target', 6, 2)->nullable();
            $table->decimal('bobot_terkini', 6, 2)->nullable();
            $table->decimal('suhu_tubuh', 4, 2)->nullable();
            $table->text('riwayat_kesehatan')->nullable();
            $table->date('tanggal_pencatatan')->nullable();
            $table->string('jam_pengukuran', 10)->nullable()->default('08:00');
            $table->string('jenis_pencatatan', 50)->nullable()->default('Penimbangan Berkala');
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 5. Buat log_perilaku (dari behavior_logs)
        // -------------------------------------------------------
        Schema::create('log_perilaku', function (Blueprint $table) {
            $table->id('id_log_perilaku');
            $table->string('id_sapi', 30);
            $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade');
            $table->string('aktivitas', 50);
            $table->decimal('akselerasi_x', 8, 4)->nullable();
            $table->decimal('akselerasi_y', 8, 4)->nullable();
            $table->decimal('akselerasi_z', 8, 4)->nullable();
            $table->decimal('gyro_x', 8, 4)->nullable();
            $table->decimal('gyro_y', 8, 4)->nullable();
            $table->decimal('gyro_z', 8, 4)->nullable();
            $table->dateTime('waktu_mulai');
            $table->dateTime('waktu_selesai');
            $table->string('sumber_data', 50)->default('Input Manual');
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 6. Buat log_pakan (dari feed_logs)
        // -------------------------------------------------------
        Schema::create('log_pakan', function (Blueprint $table) {
            $table->id('id_log_pakan');
            $table->string('id_sapi', 30);
            $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade');
            $table->unsignedBigInteger('id_tempat_makan')->nullable();
            $table->foreign('id_tempat_makan')->references('id_tempat_makan')->on('tempat_makan')->nullOnDelete();
            $table->string('komposisi_pakan', 100);
            $table->decimal('pakan_awal', 5, 2);
            $table->decimal('sisa_pakan', 5, 2);
            $table->decimal('harga_pakan_per_kg', 12, 2)->nullable()->default(5000);
            $table->decimal('biaya_pakan_harian', 12, 2)->nullable()->default(50000);
            $table->date('tanggal_pencatatan')->nullable();
            $table->string('sesi_makan_1_jam', 10)->nullable()->default('07:00');
            $table->integer('sesi_makan_1_durasi')->nullable()->default(20);
            $table->decimal('sesi_makan_1_pakan', 6, 2)->nullable()->default(3.33);
            $table->string('sesi_makan_2_jam', 10)->nullable()->default('12:00');
            $table->integer('sesi_makan_2_durasi')->nullable()->default(15);
            $table->decimal('sesi_makan_2_pakan', 6, 2)->nullable()->default(3.33);
            $table->string('sesi_makan_3_jam', 10)->nullable()->default('17:00');
            $table->integer('sesi_makan_3_durasi')->nullable()->default(25);
            $table->decimal('sesi_makan_3_pakan', 6, 2)->nullable()->default(3.34);
            $table->integer('total_durasi_makan')->nullable()->default(60);
            $table->integer('frekuensi_makan')->nullable()->default(2);
            $table->string('kualitas_air', 30)->nullable()->default('Baik');
            $table->decimal('air_awal', 5, 2)->nullable()->default(0);
            $table->decimal('sisa_air', 5, 2)->nullable()->default(0);
            $table->text('keterangan')->nullable();
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 7. Buat log_kamera (dari camera_logs)
        // -------------------------------------------------------
        Schema::create('log_kamera', function (Blueprint $table) {
            $table->id('id_log_kamera');
            $table->string('id_kandang', 30)->nullable();
            $table->foreign('id_kandang')->references('id_kandang')->on('kandang')->nullOnDelete();
            $table->string('id_sapi', 30);
            $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade');
            $table->string('aktivitas', 100);
            $table->decimal('tingkat_kepercayaan', 5, 2)->nullable();
            $table->integer('jumlah_terdeteksi')->nullable()->default(1);
            $table->string('path_foto', 255)->nullable();
            $table->dateTime('waktu_deteksi');
            $table->timestamps();
        });

        // -------------------------------------------------------
        // 8. Buat riwayat_pemeriksaan (dari examination_records)
        // -------------------------------------------------------
        Schema::create('riwayat_pemeriksaan', function (Blueprint $table) {
            $table->id('id_pemeriksaan');
            $table->string('id_sapi', 30);
            $table->foreign('id_sapi')->references('id_sapi')->on('sapi')->onDelete('cascade');
            $table->text('catatan_diagnosa');
            $table->date('tanggal_pemeriksaan');
            $table->timestamp('waktu_input')->useCurrent();
            $table->timestamps();
        });

        // Re-enable foreign key checks
        DB::statement('PRAGMA foreign_keys = ON');
    }

    public function down(): void
    {
        // Tidak perlu rollback karena ini adalah migration fix untuk SQLite
    }
};
