<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FarmController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SensorController;
use Illuminate\Support\Facades\Route;

// Halaman publik & landing
Route::get('/', function () {
    return \Inertia\Inertia::render('Landing', [
        'auth' => ['user' => auth()->user()],
    ]);
})->name('landing');

// Rute alias /farm
Route::get('/farm', function () {
    return auth()->check() ? redirect()->route('dashboard') : redirect()->route('login');
});

// Semua halaman farm butuh login
Route::middleware('auth')->group(function () {
    // Dashboard utama
    Route::get('/dashboard', [FarmController::class, 'index'])->name('dashboard');
    Route::get('/farm/dashboard', [FarmController::class, 'index']);

    // API data terpaginasi (Bahasa Indonesia & English Backward-Compatible Route Group)
    Route::prefix('farm/api')->group(function () {
        Route::get('/dashboard', [FarmController::class, 'dashboardStats']);
        Route::get('/cows', [FarmController::class, 'listCows']);
        Route::get('/cows/breeds', [FarmController::class, 'listCowBreeds']);
        Route::get('/cows/{id}/info', [\App\Http\Controllers\Api\ExaminationController::class, 'getCowInfo']);
        Route::get('/cows/{id}/examinations', [\App\Http\Controllers\Api\ExaminationController::class, 'getByCow']);
        Route::get('/examinations', [\App\Http\Controllers\Api\ExaminationController::class, 'index']);
        Route::post('/examinations', [\App\Http\Controllers\Api\ExaminationController::class, 'store']);
        Route::get('/physiology', [FarmController::class, 'listPhysiology']);
        Route::get('/behavior', [FarmController::class, 'listBehavior']);
        Route::get('/barns', [FarmController::class, 'listBarns']);
        Route::get('/feed', [FarmController::class, 'listFeed']);
        Route::get('/feeding-stations', [FarmController::class, 'listFeedingStations']);
        Route::get('/options/barns', [FarmController::class, 'listOptionsBarns']);
        Route::get('/options/cows', [FarmController::class, 'listOptionsCows']);
        Route::get('/options/owners', [FarmController::class, 'listOptionsOwners']);
        Route::get('/options/feeding-stations', [FarmController::class, 'listOptionsFeedingStations']);
    });

    Route::post('/farm/examinations', [\App\Http\Controllers\Api\ExaminationController::class, 'store'])->name('examinations.store');
    Route::delete('/farm/examinations/{id}', [\App\Http\Controllers\Api\ExaminationController::class, 'destroy'])->name('examinations.destroy');

    // Profil pengguna
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Modul 1: Sapi
    Route::post('/farm/cows', [FarmController::class, 'storeCow'])->name('cows.store');
    Route::put('/farm/cows/{id}', [FarmController::class, 'updateCow'])->name('cows.update');
    Route::delete('/farm/cows/{id}', [FarmController::class, 'destroyCow'])->name('cows.destroy');

    // Modul 2: Fisiologis
    Route::post('/farm/physiology', [FarmController::class, 'storePhysiology'])->name('physiology.store');
    Route::put('/farm/physiology/{id}', [FarmController::class, 'updatePhysiology'])->name('physiology.update');
    Route::delete('/farm/physiology/{id}', [FarmController::class, 'destroyPhysiology'])->name('physiology.destroy');

    // Modul 3: Perilaku
    Route::post('/farm/behavior', [FarmController::class, 'storeBehavior'])->name('behavior.store');
    Route::put('/farm/behavior/{id}', [FarmController::class, 'updateBehavior'])->name('behavior.update');
    Route::delete('/farm/behavior/{id}', [FarmController::class, 'destroyBehavior'])->name('behavior.destroy');

    // Modul 4: Kandang
    Route::post('/farm/barns', [FarmController::class, 'storeBarn'])->name('barns.store');
    Route::put('/farm/barns/{id}', [FarmController::class, 'updateBarn'])->name('barns.update');
    Route::delete('/farm/barns/{id}', [FarmController::class, 'destroyBarn'])->name('barns.destroy');

    // Modul 5: Pakan
    Route::post('/farm/feed', [FarmController::class, 'storeFeed'])->name('feed.store');
    Route::put('/farm/feed/{id}', [FarmController::class, 'updateFeed'])->name('feed.update');
    Route::delete('/farm/feed/{id}', [FarmController::class, 'destroyFeed'])->name('feed.destroy');

    // Modul 6: Tempat Makan
    Route::post('/farm/feeding-stations', [FarmController::class, 'storeFeedingStation'])->name('feeding-stations.store');
    Route::put('/farm/feeding-stations/{id}', [FarmController::class, 'updateFeedingStation'])->name('feeding-stations.update');
    Route::delete('/farm/feeding-stations/{id}', [FarmController::class, 'destroyFeedingStation'])->name('feeding-stations.destroy');

    // Modul Admin: Kelola Pengguna
    Route::prefix('admin')->group(function () {
        Route::get('/users', [AdminController::class, 'listUsers'])->name('admin.users.list');
        Route::post('/users', [AdminController::class, 'storeUser'])->name('admin.users.store');
        Route::put('/users/{id}', [AdminController::class, 'updateUser'])->name('admin.users.update');
        Route::delete('/users/{id}', [AdminController::class, 'destroyUser'])->name('admin.users.destroy');
    });
});

// API Sensor IoT (Public — Full CRUD Support: GET, POST, PUT, DELETE)
Route::prefix('api/sensor')->group(function () {
    // 1. Sensor IMU (Akselerometer & Gyroscope Inersia Sapi)
    Route::get('/imu', [SensorController::class, 'listImu']);
    Route::get('/perilaku', [SensorController::class, 'listImu']);
    Route::get('/behavior', [SensorController::class, 'listImu']);
    Route::post('/imu', [SensorController::class, 'ingestImu']);
    Route::post('/perilaku', [SensorController::class, 'ingestImu']);
    Route::post('/behavior', [SensorController::class, 'ingestImu']);
    Route::put('/imu/{id}', [SensorController::class, 'updateBehavior']);
    Route::put('/behavior/{id}', [SensorController::class, 'updateBehavior']);
    Route::delete('/imu/{id}', [SensorController::class, 'deleteBehavior']);
    Route::delete('/behavior/{id}', [SensorController::class, 'deleteBehavior']);

    // 2. Sensor Kamera (Deteksi Visual & Vision)
    Route::get('/kamera', [SensorController::class, 'listKamera']);
    Route::get('/camera', [SensorController::class, 'listKamera']);
    Route::post('/kamera', [SensorController::class, 'ingestKamera']);
    Route::post('/camera', [SensorController::class, 'ingestKamera']);

    // 3. Sensor Timbangan (Timbangan Pakan & Bobot Sapi)
    Route::get('/timbangan', [SensorController::class, 'listTimbangan']);
    Route::get('/pakan', [SensorController::class, 'listTimbangan']);
    Route::get('/feed', [SensorController::class, 'listTimbangan']);
    Route::post('/timbangan', [SensorController::class, 'ingestTimbangan']);
    Route::post('/pakan', [SensorController::class, 'ingestTimbangan']);
    Route::post('/feed', [SensorController::class, 'ingestTimbangan']);
    Route::put('/timbangan/{id}', [SensorController::class, 'updateFeed']);
    Route::put('/feed/{id}', [SensorController::class, 'updateFeed']);
    Route::delete('/timbangan/{id}', [SensorController::class, 'deleteFeed']);
    Route::delete('/feed/{id}', [SensorController::class, 'deleteFeed']);

    // 4. Sensor Lingkungan Kandang (Suhu Udara & Gas Amonia/Metana)
    Route::get('/lingkungan', [SensorController::class, 'listLingkungan']);
    Route::get('/kandang', [SensorController::class, 'listLingkungan']);
    Route::get('/barn', [SensorController::class, 'listLingkungan']);
    Route::post('/lingkungan', [SensorController::class, 'ingestLingkungan']);
    Route::post('/kandang', [SensorController::class, 'ingestLingkungan']);
    Route::post('/barn', [SensorController::class, 'ingestLingkungan']);
    Route::put('/lingkungan/{id}', [SensorController::class, 'ingestLingkungan']);
    Route::put('/barn/{id}', [SensorController::class, 'ingestLingkungan']);
    Route::delete('/lingkungan/{id}', [SensorController::class, 'deleteBarn']);
    Route::delete('/barn/{id}', [SensorController::class, 'deleteBarn']);

    // 5. Sensor Fisiologis (Suhu Tubuh & Bobot Sapi)
    Route::get('/fisiologis', [SensorController::class, 'listPhysiology']);
    Route::get('/physiology', [SensorController::class, 'listPhysiology']);
    Route::get('/fisiologis/{id}', [SensorController::class, 'showPhysiology']);
    Route::get('/physiology/{id}', [SensorController::class, 'showPhysiology']);
    Route::post('/fisiologis', [SensorController::class, 'ingestPhysiology']);
    Route::post('/physiology', [SensorController::class, 'ingestPhysiology']);
    Route::put('/fisiologis/{id}', [SensorController::class, 'ingestPhysiology']);
    Route::put('/physiology/{id}', [SensorController::class, 'ingestPhysiology']);
    Route::delete('/fisiologis/{id}', [SensorController::class, 'deletePhysiology']);
    Route::delete('/physiology/{id}', [SensorController::class, 'deletePhysiology']);

    // 6. Analisa & Indikator Penting Peternakan
    Route::get('/analisa', [SensorController::class, 'analisa']);
    Route::get('/analisis', [SensorController::class, 'analisa']);
});

require __DIR__.'/auth.php';
