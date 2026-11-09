<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ApiController;
use App\Http\Controllers\Api\BarnsController;
use App\Http\Controllers\Api\CowsController;
use App\Http\Controllers\Api\PhysiologiesController;
use App\Http\Controllers\Api\BehaviorLogsController;
use App\Http\Controllers\Api\FeedingStationsController;
use App\Http\Controllers\Api\FeedLogsController;
use App\Http\Controllers\Api\CameraLogsController;
use App\Http\Controllers\Api\ExaminationController;

/*
|--------------------------------------------------------------------------
| API Routes — Sistem Monitoring Peternakan Sapi SIMANTRA (Desvita)
| RESTful API (GET Index & GET Show + CRUD + Analytics)
|--------------------------------------------------------------------------
*/

// 0. Catatan Pemeriksaan Mantri (Examinations) & Combined Info Sapi
Route::get('/examinations', [ExaminationController::class, 'index']);
Route::post('/examinations', [ExaminationController::class, 'store']);
Route::get('/cows/{id}/examinations', [ExaminationController::class, 'getByCow']);
Route::get('/cows/{id}/info', [ExaminationController::class, 'getCowInfo']);
Route::get('/dashboard/summary', [App\Http\Controllers\FarmController::class, 'dashboardStats']);

// Sensor IoT Ingestion Endpoints (REST API)
Route::get('/sensors/body-temperature/{id}', [App\Http\Controllers\SensorController::class, 'showPhysiology']);
Route::get('/sensor/fisiologis/{id}', [App\Http\Controllers\SensorController::class, 'showPhysiology']);
Route::post('/sensors/body-temperature', [App\Http\Controllers\SensorController::class, 'ingestPhysiology']);
Route::post('/sensor/body-temperature', [App\Http\Controllers\SensorController::class, 'ingestPhysiology']);
Route::post('/sensors/feed', [App\Http\Controllers\SensorController::class, 'ingestTimbangan']);
Route::post('/sensor/feed', [App\Http\Controllers\SensorController::class, 'ingestTimbangan']);
Route::post('/sensors/behavior', [App\Http\Controllers\SensorController::class, 'ingestImu']);
Route::post('/sensor/behavior', [App\Http\Controllers\SensorController::class, 'ingestImu']);
Route::post('/sensors/environment', [App\Http\Controllers\SensorController::class, 'ingestLingkungan']);
Route::post('/sensor/environment', [App\Http\Controllers\SensorController::class, 'ingestLingkungan']);

// 1. Kandang (Barns)
Route::get('/barns', [BarnsController::class, 'index']);
Route::get('/barns/{id}', [BarnsController::class, 'show']);
Route::post('/barns', [ApiController::class, 'storeBarn']);
Route::put('/barns/{id}', [ApiController::class, 'updateBarn']);
Route::delete('/barns/{id}', [ApiController::class, 'destroyBarn']);

// 2. Sapi (Cows)
Route::get('/cows', [CowsController::class, 'index']);
Route::get('/cows/{id}', [CowsController::class, 'show']);
Route::post('/cows', [ApiController::class, 'storeCow']);
Route::put('/cows/{id}', [ApiController::class, 'updateCow']);
Route::delete('/cows/{id}', [ApiController::class, 'destroyCow']);

// 3. Fisiologis (Physiologies)
Route::get('/physiologies', [PhysiologiesController::class, 'index']);
Route::get('/physiologies/{id}', [PhysiologiesController::class, 'show']);
Route::post('/physiologies', [ApiController::class, 'storePhysiology']);
Route::put('/physiologies/{id}', [ApiController::class, 'updatePhysiology']);
Route::delete('/physiologies/{id}', [ApiController::class, 'destroyPhysiology']);

// 4. Log Perilaku (Behavior Logs)
Route::get('/behavior-logs', [BehaviorLogsController::class, 'index']);
Route::get('/behavior-logs/{id}', [BehaviorLogsController::class, 'show']);
Route::post('/behavior-logs', [ApiController::class, 'storeBehaviorLog']);
Route::put('/behavior-logs/{id}', [ApiController::class, 'updateBehaviorLog']);
Route::delete('/behavior-logs/{id}', [ApiController::class, 'destroyBehaviorLog']);

// 5. Stasiun Pakan (Feeding Stations)
Route::get('/feeding-stations', [FeedingStationsController::class, 'index']);
Route::get('/feeding-stations/{id}', [FeedingStationsController::class, 'show']);
Route::post('/feeding-stations', [ApiController::class, 'storeFeedingStation']);
Route::put('/feeding-stations/{id}', [ApiController::class, 'updateFeedingStation']);
Route::delete('/feeding-stations/{id}', [ApiController::class, 'destroyFeedingStation']);

// 6. Log Pakan (Feed Logs)
Route::get('/feed-logs', [FeedLogsController::class, 'index']);
Route::get('/feed-logs/{id}', [FeedLogsController::class, 'show']);
Route::post('/feed-logs', [ApiController::class, 'storeFeedLog']);
Route::put('/feed-logs/{id}', [ApiController::class, 'updateFeedLog']);
Route::delete('/feed-logs/{id}', [ApiController::class, 'destroyFeedLog']);

// 7. Log Deteksi Kamera (Camera Logs)
Route::get('/camera-logs', [CameraLogsController::class, 'index']);
Route::get('/camera-logs/{id}', [CameraLogsController::class, 'show']);
Route::post('/camera-logs', [ApiController::class, 'storeCameraLog']);
Route::put('/camera-logs/{id}', [ApiController::class, 'updateCameraLog']);
Route::delete('/camera-logs/{id}', [ApiController::class, 'destroyCameraLog']);

// 8. Analitik ("Informasi Penting")
Route::get('/analytics/feed-ideal/{cow_id?}', [ApiController::class, 'feedIdeal']);
Route::get('/analytics/feed-intensity/{cow_id?}', [ApiController::class, 'feedIntensity']);
Route::get('/analytics/behavior-summary/{cow_id?}', [ApiController::class, 'behaviorSummary']);
Route::get('/analytics/feed-total', [ApiController::class, 'feedTotal']);
Route::get('/analytics/feed-cost', [ApiController::class, 'feedCost']);
Route::get('/analytics/weight-change/{cow_id?}', [ApiController::class, 'weightChange']);
Route::get('/analytics/profit/{cow_id?}', [ApiController::class, 'profit']);

/*
|--------------------------------------------------------------------------
| ALIAS RUTE API BAHASA INDONESIA (Memudahkan Pengujian & Sidang Skripsi)
|--------------------------------------------------------------------------
*/
// Sapi
Route::get('/sapi', [CowsController::class, 'index']);
Route::get('/sapi/{id}', [CowsController::class, 'show']);

// Perilaku / Aktivitas Sapi
Route::get('/perilaku', [BehaviorLogsController::class, 'index']);
Route::get('/perilaku/{id}', [BehaviorLogsController::class, 'show']);

// Kandang
Route::get('/kandang', [BarnsController::class, 'index']);
Route::get('/kandang/{id}', [BarnsController::class, 'show']);

// Tempat Makan
Route::get('/tempat-makan', [FeedingStationsController::class, 'index']);
Route::get('/tempat-makan/{id}', [FeedingStationsController::class, 'show']);

// Fisiologis Sapi
Route::get('/fisiologis', [PhysiologiesController::class, 'index']);
Route::get('/fisiologis/{id}', [PhysiologiesController::class, 'show']);

// Log Pakan
Route::get('/log-pakan', [FeedLogsController::class, 'index']);
Route::get('/log-pakan/{id}', [FeedLogsController::class, 'show']);

// Log Kamera
Route::get('/log-kamera', [CameraLogsController::class, 'index']);
Route::get('/log-kamera/{id}', [CameraLogsController::class, 'show']);

// Analitik Bahasa Indonesia
Route::get('/analitik/pakan-ideal/{cow_id?}', [ApiController::class, 'feedIdeal']);
Route::get('/analitik/intensitas-makan/{cow_id?}', [ApiController::class, 'feedIntensity']);
Route::get('/analitik/rekap-perilaku/{cow_id?}', [ApiController::class, 'behaviorSummary']);
Route::get('/analitik/total-pakan', [ApiController::class, 'feedTotal']);
Route::get('/analitik/biaya-pakan', [ApiController::class, 'feedCost']);
Route::get('/analitik/pertumbuhan-bobot/{cow_id?}', [ApiController::class, 'weightChange']);
Route::get('/analitik/keuangan-profit/{cow_id?}', [ApiController::class, 'profit']);


