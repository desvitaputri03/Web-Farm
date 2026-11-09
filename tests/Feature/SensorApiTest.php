<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Kandang as Barn;
use App\Models\Sapi as Cow;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SensorApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        Barn::create([
            'barnID' => 'KDG-A01',
            'barnName' => 'Kandang Utama',
            'barnLocation' => 'Limau Manis',
            'barnCapacity' => 10,
        ]);

        Cow::create([
            'cowID' => 'SP-2024-001',
            'cowBreed' => 'Simental',
            'cowGender' => 'Jantan',
            'cowBirthDate' => '2023-01-01',
            'cowHistory' => 'Sehat',
            'cowBarnID' => 'KDG-A01',
        ]);

        $station = \App\Models\TempatMakan::create([
            'stationCode' => 'FS-001',
            'stationName' => 'Stasiun Pakan Utama',
            'stationType' => 'makan',
            'stationLocation' => 'KDG-A01',
        ]);
    }

    public function test_sensor_imu_api(): void
    {
        $response = $this->postJson('/api/sensor/imu', [
            'id_sapi' => 'SP-2024-001',
            'akselerasi_x' => 0.5,
            'akselerasi_y' => 1.2,
            'akselerasi_z' => 9.8,
            'pitch' => 2.1,
            'roll' => -1.0,
            'yaw' => 0.4,
            'aktivitas' => 'Makan',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('berhasil', true)
                 ->assertJsonPath('data.id_sapi', 'SP-2024-001')
                 ->assertJsonPath('data.aktivitas', 'Makan');
    }

    public function test_sensor_kamera_api(): void
    {
        $response = $this->postJson('/api/sensor/kamera', [
            'id_kandang' => 'KDG-A01',
            'id_sapi' => 'SP-2024-001',
            'aktivitas' => 'Berdiri',
            'tingkat_kepercayaan' => 0.96,
            'jumlah_terdeteksi' => 1,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('berhasil', true)
                 ->assertJsonPath('data.id_kandang', 'KDG-A01')
                 ->assertJsonPath('data.aktivitas', 'Berdiri');
    }

    public function test_sensor_timbangan_api(): void
    {
        $response = $this->postJson('/api/sensor/timbangan', [
            'id_sapi' => 'SP-2024-001',
            'id_tempat_makan' => '1',
            'pakan_awal' => 30.0,
            'sisa_pakan' => 5.0,
            'bobot_sapi' => 320.5,
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('berhasil', true)
                 ->assertJsonPath('data.id_sapi', 'SP-2024-001');
    }

    public function test_sensor_lingkungan_suhu_dan_gas_api(): void
    {
        $response = $this->postJson('/api/sensor/lingkungan', [
            'id_kandang' => 'KDG-A01',
            'suhu_lingkungan' => 27.8,
            'kelembapan' => 70.5,
            'kadar_gas_amonia' => 10.2,
            'kadar_gas_metana' => 4.5,
            'kondisi_lantai' => 'Bersih',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('berhasil', true)
                 ->assertJsonPath('data.id_kandang', 'KDG-A01')
                 ->assertJsonPath('data.suhu_lingkungan', 27.8)
                 ->assertJsonPath('data.kadar_gas_amonia', 10.2);
    }

    public function test_sensor_analisa_api(): void
    {
        $response = $this->getJson('/api/sensor/analisa');

        $response->assertStatus(200)
                 ->assertJsonPath('berhasil', true)
                 ->assertJsonStructure([
                     'berhasil',
                     'pesan',
                     'data' => [
                         'feedAnalysis',
                         'financial',
                         'performance',
                         'behaviorToday',
                         'behaviorPerCow',
                         'feedingAccess',
                         'barnSummary',
                     ]
                 ]);
    }
}
