<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('sensor:simulate {--count=5 : Jumlah data per sensor}', function () {
    $count = (int) $this->option('count');
    $this->info("🚀 Memulai simulasi streaming data sensor IoT ($count data)...");

    $cows = \App\Models\Sapi::all();
    if ($cows->isEmpty()) {
        $this->error("Belum ada data sapi. Jalankan 'php artisan db:seed' terlebih dahulu.");
        return;
    }

    $barns = \App\Models\Kandang::all();
    $activities = ['Makan', 'Berjalan', 'Berdiri', 'Berbaring', 'Ruminasi'];
    $stations = \App\Models\TempatMakan::all();

    for ($i = 0; $i < $count; $i++) {
        $cow = $cows->random();
        $barn = $barns->isNotEmpty() ? $barns->random() : null;
        $act = $activities[array_rand($activities)];

        // 1. Simulasikan Sensor IMU
        $accelX = round(mt_rand(-200, 200) / 100, 2);
        $accelY = round(mt_rand(-200, 200) / 100, 2);
        $accelZ = round(9.8 + (mt_rand(-150, 150) / 100), 2);
        $gyroX  = round(mt_rand(-180, 180) / 10, 2);
        $gyroY  = round(mt_rand(-180, 180) / 10, 2);
        $gyroZ  = round(mt_rand(-180, 180) / 10, 2);

        \App\Models\LogPerilaku::create([
            'behCowID'     => $cow->cowID,
            'behActivity'  => $act,
            'accelX'       => $accelX,
            'accelY'       => $accelY,
            'accelZ'       => $accelZ,
            'gyroX'        => $gyroX,
            'gyroY'        => $gyroY,
            'gyroZ'        => $gyroZ,
            'behStartTime' => now()->subMinutes(rand(10, 120)),
            'behEndTime'   => now()->subMinutes(rand(1, 9)),
            'behSource'    => 'Otomatis Sensor',
        ]);

        // 2. Simulasikan Sensor Timbangan Pakan & Bobot
        $initialFeed = round(mt_rand(250, 350) / 10, 1);
        $leftoverFeed = round(mt_rand(20, 80) / 10, 1);
        $stationID = $stations->isNotEmpty() ? $stations->random()->stationID : 1;

        \App\Models\LogPakan::create([
            'feedCowID'         => $cow->cowID,
            'feedStationID'     => $stationID,
            'feedComposition'   => 'Konsentrat & Hijauan (Sensor IoT)',
            'feedInitialFeed'   => $initialFeed,
            'feedLeftoverFeed'  => $leftoverFeed,
            'feedFrequency'     => rand(1, 3),
            'feedWaterQuality'  => 'Jernih',
            'feedInitialWater'  => round(mt_rand(300, 500) / 10, 1),
            'feedLeftoverWater' => round(mt_rand(50, 150) / 10, 1),
        ]);

        // 3. Simulasikan Sensor Kamera
        if ($barn) {
            \App\Models\LogKamera::create([
                'barnID'           => $barn->barnID,
                'camCowID'         => $cow->cowID,
                'camActivity'      => $act,
                'camConfidence'    => round(mt_rand(90, 99) / 100, 2),
                'camImagePath'     => null,
                'camDetectedCount' => rand(1, 3),
                'camCapturedAt'    => now()->subMinutes(rand(1, 60)),
            ]);

            // 4. Simulasikan Sensor Lingkungan Kandang (Suhu & Gas)
            $barn->update([
                'barnTemperature'    => round(26.0 + (mt_rand(0, 70) / 10), 1),
                'barnHumidity'       => round(60.0 + (mt_rand(0, 250) / 10), 1),
                'barnGasNH3'          => round(5.0 + (mt_rand(0, 150) / 10), 1),
                'barnGasCH4'          => round(2.0 + (mt_rand(0, 60) / 10), 1),
                'barnLight'          => rand(200, 450),
                'barnWindSpeed'      => round(0.8 + (mt_rand(0, 15) / 10), 1),
                'barnFloorCondition' => rand(0, 10) > 2 ? 'Bersih' : 'Kotor',
            ]);
        }
    }

    $this->info("✅ Simulasi berhasil! $count paket data sensor telah masuk ke sistem.");
    $this->line("👉 Cek di Dashboard: http://127.0.0.1:8000/dashboard");
    $this->line("👉 Cek via API Analisa: http://127.0.0.1:8000/api/sensor/analisa");
})->purpose('Simulasikan data telemetry sensor IoT (IMU, Kamera, Timbangan, Lingkungan Suhu & Gas)');
