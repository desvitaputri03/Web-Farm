<?php

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;
use App\Models\Kandang;
use App\Models\Sapi;
use App\Models\Fisiologis;
use App\Models\LogPerilaku;
use App\Models\TempatMakan;
use App\Models\LogPakan;
use App\Models\LogKamera;

class ApiCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_barns_api_crud(): void
    {
        // 1. POST (Create)
        $response = $this->postJson('/api/barns', [
            'barnID' => 'KANDANG-TEST-01',
            'barnName' => 'Kandang Tes Utama',
            'barnLocation' => 'Blok A',
            'barnCapacity' => 20,
            'barnTemperature' => 28.5,
            'barnHumidity' => 70.0,
        ]);
        $response->assertStatus(201)
                 ->assertJson(['status' => 'success']);

        // 2. GET Index
        $response = $this->getJson('/api/barns');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 3. GET Show
        $response = $this->getJson('/api/barns/KANDANG-TEST-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 4. PUT (Update)
        $response = $this->putJson('/api/barns/KANDANG-TEST-01', [
            'barnName' => 'Kandang Tes Terupdate',
            'barnTemperature' => 27.0,
        ]);
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 5. DELETE
        $response = $this->deleteJson('/api/barns/KANDANG-TEST-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);
    }

    public function test_cows_api_crud(): void
    {
        // Setup parent Kandang
        Kandang::create([
            'barnID' => 'BARN-COW-01',
            'barnName' => 'Kandang Sapi',
        ]);

        // 1. POST (Create)
        $response = $this->postJson('/api/cows', [
            'cowID' => 'SAPI-TEST-01',
            'cowGender' => 'Jantan',
            'cowBirthDate' => '2023-01-01',
            'cowBreed' => 'Limosin',
            'cowHistory' => 'Sehat dan aktif',
            'cowBarnID' => 'BARN-COW-01',
        ]);
        $response->assertStatus(201)
                 ->assertJson(['status' => 'success']);

        // 2. GET Index
        $response = $this->getJson('/api/cows');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 3. GET Show
        $response = $this->getJson('/api/cows/SAPI-TEST-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 4. PUT (Update)
        $response = $this->putJson('/api/cows/SAPI-TEST-01', [
            'cowBreed' => 'Limosin Super',
        ]);
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 5. DELETE
        $response = $this->deleteJson('/api/cows/SAPI-TEST-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);
    }

    public function test_physiologies_api_crud(): void
    {
        Kandang::create(['barnID' => 'BARN-PHY-01', 'barnName' => 'Kandang Fisiologis']);
        Sapi::create([
            'cowID' => 'SAPI-PHY-01',
            'cowGender' => 'Betina',
            'cowBirthDate' => '2022-05-10',
            'cowBreed' => 'Simental',
            'cowHistory' => 'Sehat',
            'cowBarnID' => 'BARN-PHY-01',
        ]);

        // 1. POST (Create)
        $response = $this->postJson('/api/physiologies', [
            'phyCowID' => 'SAPI-PHY-01',
            'phyStatus' => 'Sehat',
            'phyInitialWeight' => 300,
            'phyTargetWeight' => 500,
            'phyCurrentWeight' => 350,
            'phyTemperature' => 38.5,
            'phyHealthHistory' => 'Sehat tanpa catatan medis',
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);

        // 2. GET Index & Show
        $this->getJson('/api/physiologies')->assertStatus(200);
        $this->getJson('/api/physiologies/SAPI-PHY-01')->assertStatus(200);

        // 3. PUT (Update)
        $this->putJson('/api/physiologies/SAPI-PHY-01', ['phyCurrentWeight' => 360])
             ->assertStatus(200);

        // 4. DELETE
        $this->deleteJson('/api/physiologies/SAPI-PHY-01')->assertStatus(200);
    }

    public function test_behavior_logs_api_crud(): void
    {
        Kandang::create(['barnID' => 'BARN-BEH-01', 'barnName' => 'Kandang Perilaku']);
        Sapi::create([
            'cowID' => 'SAPI-BEH-01',
            'cowGender' => 'Jantan',
            'cowBirthDate' => '2023-03-01',
            'cowBreed' => 'PO',
            'cowHistory' => 'Bagus',
            'cowBarnID' => 'BARN-BEH-01',
        ]);

        // 1. POST (Create)
        $response = $this->postJson('/api/behavior-logs', [
            'behCowID' => 'SAPI-BEH-01',
            'behActivity' => 'Makan',
            'behStartTime' => now()->toDateTimeString(),
            'behEndTime' => now()->addMinutes(30)->toDateTimeString(),
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);
        $logId = $response->json('data.behID') ?? $response->json('data.id');

        // 2. GET Index & Show
        $this->getJson('/api/behavior-logs')->assertStatus(200);
        if ($logId) {
            $this->getJson("/api/behavior-logs/{$logId}")->assertStatus(200);
            $this->putJson("/api/behavior-logs/{$logId}", ['behActivity' => 'Ruminasi'])->assertStatus(200);
            $this->deleteJson("/api/behavior-logs/{$logId}")->assertStatus(200);
        }
    }

    public function test_feeding_stations_api_crud(): void
    {
        // 1. POST (Create)
        $response = $this->postJson('/api/feeding-stations', [
            'stationCode' => 'STASIUN-01',
            'stationName' => 'Stasiun Pakan Utama',
            'stationType' => 'makan',
            'stationLocation' => 'Sektor 1',
        ]);
        $response->assertStatus(201)
                 ->assertJson(['status' => 'success']);

        // 2. GET Index
        $response = $this->getJson('/api/feeding-stations');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 3. GET Show
        $response = $this->getJson('/api/feeding-stations/STASIUN-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 4. PUT (Update)
        $response = $this->putJson('/api/feeding-stations/STASIUN-01', [
            'stationName' => 'Stasiun Pakan Baru',
        ]);
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);

        // 5. DELETE
        $response = $this->deleteJson('/api/feeding-stations/STASIUN-01');
        $response->assertStatus(200)
                 ->assertJson(['status' => 'success']);
    }

    public function test_feed_logs_api_crud(): void
    {
        Kandang::create(['barnID' => 'BARN-FEED-01', 'barnName' => 'Kandang Pakan']);
        Sapi::create([
            'cowID' => 'SAPI-FEED-01',
            'cowGender' => 'Jantan',
            'cowBirthDate' => '2023-01-01',
            'cowBreed' => 'Limosin',
            'cowHistory' => 'Sehat',
            'cowBarnID' => 'BARN-FEED-01',
        ]);

        // 1. POST (Create)
        $response = $this->postJson('/api/feed-logs', [
            'feedCowID' => 'SAPI-FEED-01',
            'feedComposition' => 'Hijauan + Konsentrat',
            'feedInitialFeed' => 15.0,
            'feedLeftoverFeed' => 2.0,
            'feedFrequency' => 2,
            'feedWaterQuality' => 'Baik',
            'feedInitialWater' => 20.0,
            'feedLeftoverWater' => 5.0,
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);
        $logId = $response->json('data.feedID') ?? $response->json('data.id');

        // 2. GET Index & Show
        $this->getJson('/api/feed-logs')->assertStatus(200);
        if ($logId) {
            $this->getJson("/api/feed-logs/{$logId}")->assertStatus(200);
            $this->putJson("/api/feed-logs/{$logId}", ['feedComposition' => 'Konsentrat Murni'])->assertStatus(200);
            $this->deleteJson("/api/feed-logs/{$logId}")->assertStatus(200);
        }
    }

    public function test_camera_logs_api_crud(): void
    {
        Kandang::create(['barnID' => 'BARN-CAM-01', 'barnName' => 'Kandang Kamera']);
        Sapi::create([
            'cowID' => 'SAPI-CAM-01',
            'cowGender' => 'Betina',
            'cowBirthDate' => '2023-02-01',
            'cowBreed' => 'Angus',
            'cowHistory' => 'Sehat',
            'cowBarnID' => 'BARN-CAM-01',
        ]);

        // 1. POST (Create)
        $response = $this->postJson('/api/camera-logs', [
            'camCowID' => 'SAPI-CAM-01',
            'camActivity' => 'Makan',
            'camConfidence' => 0.95,
            'camCapturedAt' => now()->toDateTimeString(),
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);
        $logId = $response->json('data.camID') ?? $response->json('data.id');

        // 2. GET Index & Show
        $this->getJson('/api/camera-logs')->assertStatus(200);
        if ($logId) {
            $this->getJson("/api/camera-logs/{$logId}")->assertStatus(200);
            $this->putJson("/api/camera-logs/{$logId}", ['camConfidence' => 0.98])->assertStatus(200);
            $this->deleteJson("/api/camera-logs/{$logId}")->assertStatus(200);
        }
    }

    public function test_sensor_api_endpoints(): void
    {
        Kandang::create(['barnID' => 'BARN-SENSOR-01', 'barnName' => 'Kandang Sensor']);
        Sapi::create([
            'cowID' => 'SAPI-SENSOR-01',
            'cowGender' => 'Jantan',
            'cowBirthDate' => '2023-01-01',
            'cowBreed' => 'Limosin',
            'cowHistory' => 'Sehat',
            'cowBarnID' => 'BARN-SENSOR-01',
        ]);

        // Sensor Ingestion (POST)
        $this->postJson('/api/sensor/feed', [
            'id_sapi' => 'SAPI-SENSOR-01',
            'pakan_awal' => 10.0,
            'sisa_pakan' => 2.0,
        ])->assertSuccessful();

        $this->postJson('/api/sensor/barn', [
            'id_kandang' => 'BARN-SENSOR-01',
            'suhu_kandang' => 27.5,
            'kelembapan' => 65.0,
            'cahaya' => 300,
        ])->assertSuccessful();

        // Sensor Retrieval (GET)
        $this->getJson('/api/sensor/feed')->assertStatus(200);
        $this->getJson('/api/sensor/barn')->assertStatus(200);
        $this->getJson('/api/sensor/behavior')->assertStatus(200);
        $this->getJson('/api/sensor/physiology')->assertStatus(200);
    }

    public function test_indonesian_field_names(): void
    {
        // 1. POST Kandang pakai bahasa Indonesia
        $response = $this->postJson('/api/barns', [
            'id_kandang' => 'KDG-INDO-1',
            'nama_kandang' => 'Kandang Indonesia 1',
            'lokasi' => 'Blok B',
            'kapasitas' => 15,
            'suhu' => 28.0,
            'kelembapan' => 70.0,
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);

        // 2. POST Sapi pakai bahasa Indonesia
        $response = $this->postJson('/api/cows', [
            'id_sapi' => 'SAPI-INDO-1',
            'jenis_kelamin' => 'Betina',
            'tanggal_lahir' => '2023-05-20',
            'ras' => 'PO',
            'riwayat' => 'Sehat dan lincah',
            'harga_beli' => 11000000,
            'id_kandang' => 'KDG-INDO-1',
        ]);
        $response->assertStatus(201)->assertJson(['status' => 'success']);
    }

    public function test_analytics_api_endpoints(): void
    {
        $this->getJson('/api/analytics/feed-ideal')->assertStatus(200);
        $this->getJson('/api/analytics/feed-intensity')->assertStatus(200);
        $this->getJson('/api/analytics/behavior-summary')->assertStatus(200);
        $this->getJson('/api/analytics/feed-total')->assertStatus(200);
        $this->getJson('/api/analytics/feed-cost')->assertStatus(200);
        $this->getJson('/api/analytics/weight-change')->assertStatus(200);
        $this->getJson('/api/analytics/profit')->assertStatus(200);
    }
}
