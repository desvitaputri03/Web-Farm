<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Model Sapi (Tabel Database: 'sapi')
 * Mengelola data utama ternak sapi (Identitas, Breed, Jenis Kelamin, Pemilik, Kandang, dan Tempat Makan).
 */
class Sapi extends Model
{
    protected $table = 'sapi';
    protected $primaryKey = 'id_sapi';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id_sapi',
        'jenis_kelamin',
        'tanggal_lahir',
        'tanggal_beli',
        'ras_sapi',
        'riwayat_sapi',
        'foto_sapi',
        'harga_beli',
        'berat_awal_beli',
        'target_berat_jual',
        'status_pemeliharaan',
        'id_kandang',
        'id_pemilik',
        'id_tempat_makan',
        'cowID',
        'cowGender',
        'cowBirthDate',
        'cowPurchaseDate',
        'cowBreed',
        'cowHistory',
        'cowPhoto',
        'cowPurchasePrice',
        'cowInitialWeight',
        'cowTargetWeight',
        'cowMaintenanceStatus',
        'cowBarnID',
        'cowOwnerID',
        'cowStationID',
    ];

    protected $appends = [
        'cowID',
        'cowGender',
        'cowBirthDate',
        'cowPurchaseDate',
        'cowBreed',
        'cowHistory',
        'cowPhoto',
        'cowPurchasePrice',
        'cowInitialWeight',
        'cowTargetWeight',
        'cowMaintenanceStatus',
        'cowBarnID',
        'cowOwnerID',
        'cowStationID'
    ];

    // Accessors untuk kompatibilitas Bahasa Inggris
    public function getCowIDAttribute() { return $this->id_sapi; }
    public function getCowGenderAttribute() { return $this->jenis_kelamin; }
    public function getCowBirthDateAttribute() { return $this->tanggal_lahir; }
    public function getCowPurchaseDateAttribute() { return $this->tanggal_beli ?? $this->tanggal_lahir; }
    public function getCowBreedAttribute() { return $this->ras_sapi; }
    public function getCowHistoryAttribute() { return $this->riwayat_sapi; }
    public function getCowPhotoAttribute() { return $this->foto_sapi; }
    public function getCowPurchasePriceAttribute() { return $this->harga_beli; }
    public function getCowInitialWeightAttribute() { return $this->berat_awal_beli ?? 200; }
    public function getCowTargetWeightAttribute() { return $this->target_berat_jual ?? 500; }
    public function getCowMaintenanceStatusAttribute() { return $this->status_pemeliharaan ?? 'Dipelihara'; }
    public function getCowBarnIDAttribute() { return $this->id_kandang; }
    public function getCowOwnerIDAttribute() { return $this->id_pemilik; }
    public function getCowStationIDAttribute() { return $this->id_tempat_makan; }

    // Mutators untuk kompatibilitas Bahasa Inggris
    public function setCowIDAttribute($val) { $this->attributes['id_sapi'] = $val; }
    public function setCowGenderAttribute($val) { $this->attributes['jenis_kelamin'] = $val; }
    public function setCowBirthDateAttribute($val) { $this->attributes['tanggal_lahir'] = $val; }
    public function setCowPurchaseDateAttribute($val) { $this->attributes['tanggal_beli'] = $val; }
    public function setCowBreedAttribute($val) { $this->attributes['ras_sapi'] = $val; }
    public function setCowHistoryAttribute($val) { $this->attributes['riwayat_sapi'] = $val; }
    public function setCowPhotoAttribute($val) { $this->attributes['foto_sapi'] = $val; }
    public function setCowPurchasePriceAttribute($val) { $this->attributes['harga_beli'] = $val; }
    public function setCowInitialWeightAttribute($val) { $this->attributes['berat_awal_beli'] = $val; }
    public function setCowTargetWeightAttribute($val) { $this->attributes['target_berat_jual'] = $val; }
    public function setCowMaintenanceStatusAttribute($val) { $this->attributes['status_pemeliharaan'] = $val; }
    public function setCowBarnIDAttribute($val) { $this->attributes['id_kandang'] = $val; }
    public function setCowOwnerIDAttribute($val) { $this->attributes['id_pemilik'] = $val; }
    public function setCowStationIDAttribute($val) { $this->attributes['id_tempat_makan'] = $val; }

    
    public function kandang(): BelongsTo { return $this->belongsTo(Kandang::class, 'id_kandang', 'id_kandang'); }
    public function barn(): BelongsTo { return $this->kandang(); }

    // Relasi Ke Pemilik / User
    public function pemilik(): BelongsTo { return $this->belongsTo(User::class, 'id_pemilik', 'id'); }
    public function owner(): BelongsTo { return $this->pemilik(); }

    // Relasi Ke Tempat Makan
    public function tempatMakan(): BelongsTo { return $this->belongsTo(TempatMakan::class, 'id_tempat_makan', 'id_tempat_makan'); }
    public function feedingStation(): BelongsTo { return $this->tempatMakan(); }

    // Relasi Ke Fisiologis
    public function fisiologis(): HasOne { return $this->hasOne(Fisiologis::class, 'id_sapi', 'id_sapi'); }
    public function physiology(): HasOne { return $this->fisiologis(); }

    // Relasi Ke Log Perilaku
    public function dataPerilaku(): HasMany { return $this->hasMany(LogPerilaku::class, 'id_sapi', 'id_sapi'); }
    public function behaviorLogs(): HasMany { return $this->dataPerilaku(); }

    // Relasi Ke Log Pakan
    public function dataPakan(): HasMany { return $this->hasMany(LogPakan::class, 'id_sapi', 'id_sapi'); }
    public function feedLogs(): HasMany { return $this->dataPakan(); }

    // Relasi Ke Log Kamera
    public function dataKamera(): HasMany { return $this->hasMany(LogKamera::class, 'id_sapi', 'id_sapi'); }
    public function cameraLogs(): HasMany { return $this->dataKamera(); }

    // Relasi Ke Riwayat Pemeriksaan
    public function riwayatPemeriksaan(): HasMany { return $this->hasMany(RiwayatPemeriksaan::class, 'id_sapi', 'id_sapi'); }
    public function examinationRecords(): HasMany { return $this->riwayatPemeriksaan(); }
}