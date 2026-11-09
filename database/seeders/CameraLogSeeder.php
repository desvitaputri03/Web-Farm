<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\CameraLog;
use App\Models\Cow;
use Carbon\Carbon;

class CameraLogSeeder extends Seeder
{
    public function run(): void
    {
        $cows = Cow::pluck('cowID')->toArray();
        if (empty($cows)) {
            $cows = ['SP-2024-001', 'SP-2024-002', 'SP-2024-003', 'SP-2024-005', 'SP-2024-007', 'SP-2024-008'];
        }

        $activities = ['Makan', 'Berdiri', 'Berbaring', 'Berjalan', 'Ruminasi'];

        foreach ($cows as $idx => $cowID) {
            CameraLog::create([
                'camCowID' => $cowID,
                'camActivity' => $activities[$idx % count($activities)],
                'camConfidence' => round(85.0 + ($idx * 2.3) % 12, 2),
                'camImagePath' => "/storage/camera/snapshot_{$cowID}.jpg",
                'camCapturedAt' => Carbon::now()->subMinutes($idx * 15),
            ]);
        }
    }
}
