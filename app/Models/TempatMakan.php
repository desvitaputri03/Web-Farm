<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model TempatMakan (Tabel Database: 'tempat_makan')
 * Mengelola data lokasi stasiun tempat makan & minum otomatis IoT.
 */
class TempatMakan extends Model
{
    protected $table = 'tempat_makan';
    protected $primaryKey = 'id_tempat_makan';

    protected $fillable = [
        'kode_tempat_makan',
        'nama_tempat_makan',
        'tipe_tempat_makan',
        'lokasi_tempat_makan',
        'stationID',
        'stationCode',
        'stationName',
        'stationType',
        'stationLocation',
    ];

    protected $appends = [
        'stationID',
        'stationCode',
        'stationName',
        'stationType',
        'stationLocation'
    ];

    // Accessors for English backwards compatibility
    public function getStationIDAttribute() { return $this->id_tempat_makan; }
    public function getStationCodeAttribute() { return $this->kode_tempat_makan; }
    public function getStationNameAttribute() { return $this->nama_tempat_makan; }
    public function getStationTypeAttribute() { return $this->tipe_tempat_makan; }
    public function getStationLocationAttribute() { return $this->lokasi_tempat_makan; }

    // Mutators for English backwards compatibility
    public function setStationIDAttribute($val) { $this->attributes['id_tempat_makan'] = $val; }
    public function setStationCodeAttribute($val) { $this->attributes['kode_tempat_makan'] = $val; }
    public function setStationNameAttribute($val) { $this->attributes['nama_tempat_makan'] = $val; }
    public function setStationTypeAttribute($val) { $this->attributes['tipe_tempat_makan'] = $val; }
    public function setStationLocationAttribute($val) { $this->attributes['lokasi_tempat_makan'] = $val; }

    public function cows(): HasMany { return $this->hasMany(Sapi::class, 'id_tempat_makan', 'id_tempat_makan'); }
    public function sapi(): HasMany { return $this->cows(); }
    public function kandang() { return $this->belongsTo(Kandang::class, 'lokasi_tempat_makan', 'id_kandang'); }
    public function barn() { return $this->kandang(); }
}
