<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model LogPakan (Tabel Database: 'log_pakan')
 * Mengelola data komposisi pakan, konsumsi pakan & air minum sapi.
 */
class LogPakan extends Model
{
    protected $table = 'log_pakan';
    protected $primaryKey = 'id_log_pakan';

    protected $fillable = [
        'id_sapi',
        'id_tempat_makan',
        'komposisi_pakan',
        'pakan_awal',
        'sisa_pakan',
        'frekuensi_makan',
        'kualitas_air',
        'air_awal',
        'sisa_air',
        'harga_pakan_per_kg',
        'biaya_pakan_harian',
        'tanggal_pencatatan',
        'sesi_makan_1_jam',
        'sesi_makan_1_durasi',
        'sesi_makan_1_pakan',
        'sesi_makan_2_jam',
        'sesi_makan_2_durasi',
        'sesi_makan_2_pakan',
        'sesi_makan_3_jam',
        'sesi_makan_3_durasi',
        'sesi_makan_3_pakan',
        'total_durasi_makan',
        'keterangan',
        'feedID',
        'feedCowID',
        'feedStationID',
        'feedComposition',
        'feedInitialFeed',
        'feedLeftoverFeed',
        'feedFrequency',
        'feedWaterQuality',
        'feedInitialWater',
        'feedLeftoverWater',
        'jam_makan_pagi',
        'durasi_makan_pagi_menit',
        'pakan_pagi_kg',
        'jam_makan_siang',
        'durasi_makan_siang_menit',
        'pakan_siang_kg',
        'jam_makan_sore',
        'durasi_makan_sore_menit',
        'pakan_sore_kg',
        'total_durasi_makan_menit',
    ];

    protected $appends = [
        'feedID',
        'feedCowID',
        'feedStationID',
        'feedComposition',
        'feedInitialFeed',
        'feedLeftoverFeed',
        'feedPricePerKg',
        'feedDailyCost',
        'feedRecordDate',
    ];

    // Accessors for English backwards compatibility
    public function getFeedIDAttribute() { return $this->id_log_pakan; }
    public function getFeedCowIDAttribute() { return $this->id_sapi; }
    public function getFeedStationIDAttribute() { return $this->id_tempat_makan; }
    public function getFeedCompositionAttribute() { return $this->komposisi_pakan; }
    public function getFeedInitialFeedAttribute() { return $this->pakan_awal; }
    public function getFeedLeftoverFeedAttribute() { return $this->sisa_pakan; }
    public function getFeedPricePerKgAttribute() { return $this->harga_pakan_per_kg ?? 5000; }
    public function getFeedDailyCostAttribute() { return $this->biaya_pakan_harian ?? (($this->pakan_awal ?? 10) * ($this->harga_pakan_per_kg ?? 5000)); }
    public function getFeedRecordDateAttribute() { return $this->tanggal_pencatatan ?? ($this->created_at ? $this->created_at->format('Y-m-d') : null); }

    // Mutators for English backwards compatibility
    public function setFeedIDAttribute($val) { $this->attributes['id_log_pakan'] = $val; }
    public function setFeedCowIDAttribute($val) { $this->attributes['id_sapi'] = $val; }
    public function setFeedStationIDAttribute($val) { $this->attributes['id_tempat_makan'] = $val; }
    public function setFeedCompositionAttribute($val) { $this->attributes['komposisi_pakan'] = $val; }
    public function setFeedInitialFeedAttribute($val) { $this->attributes['pakan_awal'] = $val; }
    public function setFeedLeftoverFeedAttribute($val) { $this->attributes['sisa_pakan'] = $val; }
    public function setFeedFrequencyAttribute($val) { $this->attributes['frekuensi_makan'] = $val; }
    public function setFeedWaterQualityAttribute($val) { $this->attributes['kualitas_air'] = $val; }
    public function setFeedInitialWaterAttribute($val) { $this->attributes['air_awal'] = $val; }
    public function setFeedLeftoverWaterAttribute($val) { $this->attributes['sisa_air'] = $val; }
    public function setJamMakanPagiAttribute($val) { $this->attributes['sesi_makan_1_jam'] = $val; }
    public function setDurasiMakanPagiMenitAttribute($val) { $this->attributes['sesi_makan_1_durasi'] = $val; }
    public function setPakanPagiKgAttribute($val) { $this->attributes['sesi_makan_1_pakan'] = $val; }
    public function setJamMakanSiangAttribute($val) { $this->attributes['sesi_makan_2_jam'] = $val; }
    public function setDurasiMakanSiangMenitAttribute($val) { $this->attributes['sesi_makan_2_durasi'] = $val; }
    public function setPakanSiangKgAttribute($val) { $this->attributes['sesi_makan_2_pakan'] = $val; }
    public function setJamMakanSoreAttribute($val) { $this->attributes['sesi_makan_3_jam'] = $val; }
    public function setDurasiMakanSoreMenitAttribute($val) { $this->attributes['sesi_makan_3_durasi'] = $val; }
    public function setPakanSoreKgAttribute($val) { $this->attributes['sesi_makan_3_pakan'] = $val; }
    public function setTotalDurasiMakanMenitAttribute($val) { $this->attributes['total_durasi_makan'] = $val; }

    public function sapi(): BelongsTo { return $this->belongsTo(Sapi::class, 'id_sapi', 'id_sapi'); }
    public function cow(): BelongsTo { return $this->sapi(); }

    public function tempatMakan(): BelongsTo { return $this->belongsTo(TempatMakan::class, 'id_tempat_makan', 'id_tempat_makan'); }
    public function feedingStation(): BelongsTo { return $this->tempatMakan(); }
}
