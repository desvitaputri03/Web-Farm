<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Kandang (Tabel Database: 'kandang')
 * Mengelola data kandang peternakan, kapasitas, serta pemantauan lingkungan.
 */
class Kandang extends Model
{
    protected $table = 'kandang';
    protected $primaryKey = 'id_kandang';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_kandang',
        'nama_kandang',
        'lokasi_kandang',
        'kapasitas_kandang',
        'suhu_kandang',
        'kelembapan_kandang',
        'pencahayaan',
        'kecepatan_angin',
        'curah_hujan',
        'kondisi_lantai',
        'barnID',
        'barnName',
        'barnLocation',
        'barnCapacity',
        'barnTemperature',
        'barnHumidity',
        'barnLight',
        'barnWindSpeed',
        'barnRainfall',
        'barnFloorCondition',
    ];

    protected $appends = [
        'barnID',
        'barnName',
        'barnLocation',
        'barnCapacity',
        'barnTemperature',
        'barnHumidity',
        'barnLight',
        'barnWindSpeed',
        'barnRainfall',
        'barnFloorCondition'
    ];

    // Accessors for English backwards compatibility
    public function getBarnIDAttribute() { return $this->id_kandang; }
    public function getBarnNameAttribute() { return $this->nama_kandang; }
    public function getBarnLocationAttribute() { return $this->lokasi_kandang; }
    public function getBarnCapacityAttribute() { return $this->kapasitas_kandang; }
    public function getBarnTemperatureAttribute() { return $this->suhu_kandang; }
    public function getBarnHumidityAttribute() { return $this->kelembapan_kandang; }
    public function getBarnLightAttribute() { return $this->pencahayaan; }
    public function getBarnWindSpeedAttribute() { return $this->kecepatan_angin; }
    public function getBarnRainfallAttribute() { return $this->curah_hujan; }
    public function getBarnFloorConditionAttribute() { return $this->kondisi_lantai; }

    // Mutators for English backwards compatibility
    public function setBarnIDAttribute($val) { $this->attributes['id_kandang'] = $val; }
    public function setBarnNameAttribute($val) { $this->attributes['nama_kandang'] = $val; }
    public function setBarnLocationAttribute($val) { $this->attributes['lokasi_kandang'] = $val; }
    public function setBarnCapacityAttribute($val) { $this->attributes['kapasitas_kandang'] = $val; }
    public function setBarnTemperatureAttribute($val) { $this->attributes['suhu_kandang'] = $val; }
    public function setBarnHumidityAttribute($val) { $this->attributes['kelembapan_kandang'] = $val; }
    public function setBarnLightAttribute($val) { $this->attributes['pencahayaan'] = $val; }
    public function setBarnWindSpeedAttribute($val) { $this->attributes['kecepatan_angin'] = $val; }
    public function setBarnRainfallAttribute($val) { $this->attributes['curah_hujan'] = $val; }
    public function setBarnFloorConditionAttribute($val) { $this->attributes['kondisi_lantai'] = $val; }

    public function cows(): HasMany { return $this->hasMany(Sapi::class, 'id_kandang', 'id_kandang'); }
    public function sapi(): HasMany { return $this->cows(); }
    public function kamera(): HasMany { return $this->hasMany(LogKamera::class, 'id_kandang', 'id_kandang'); }
    public function cameraLogs(): HasMany { return $this->kamera(); }
}
