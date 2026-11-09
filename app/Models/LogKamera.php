<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model LogKamera (Tabel Database: 'log_kamera')
 * Mengelola data tangkapan foto deteksi kamera AI & pengenalan individu sapi di kandang.
 */
class LogKamera extends Model
{
    protected $table = 'log_kamera';
    protected $primaryKey = 'id_log_kamera';

    protected $fillable = [
        'id_kandang',
        'id_sapi',
        'aktivitas',
        'tingkat_kepercayaan',
        'jumlah_terdeteksi',
        'path_foto',
        'waktu_deteksi',
        'camID',
        'barnID',
        'camCowID',
        'camActivity',
        'camConfidence',
        'camImagePath',
        'camCapturedAt',
    ];

    protected $appends = [
        'camID',
        'barnID',
        'camCowID',
        'camActivity',
        'camConfidence',
        'camImagePath',
        'camCapturedAt'
    ];

    public function getCamIDAttribute()
    {
        return $this->id_log_kamera;
    }
    public function getBarnIDAttribute()
    {
        return $this->id_kandang;
    }
    public function getCamCowIDAttribute()
    {
        return $this->id_sapi;
    }
    public function getCamActivityAttribute()
    {
        return $this->aktivitas;
    }
    public function getCamConfidenceAttribute()
    {
        return $this->tingkat_kepercayaan;
    }
    public function getCamImagePathAttribute()
    {
        return $this->path_foto;
    }
    public function getCamCapturedAtAttribute()
    {
        return $this->waktu_deteksi ?? $this->created_at;
    }

    // Mutators for English backwards compatibility
    public function setCamIDAttribute($val)
    {
        $this->attributes['id_log_kamera'] = $val;
    }
    public function setBarnIDAttribute($val)
    {
        $this->attributes['id_kandang'] = $val;
    }
    public function setCamCowIDAttribute($val)
    {
        $this->attributes['id_sapi'] = $val;
    }
    public function setCamActivityAttribute($val)
    {
        $this->attributes['aktivitas'] = $val;
    }
    public function setCamConfidenceAttribute($val)
    {
        $this->attributes['tingkat_kepercayaan'] = $val;
    }
    public function setCamImagePathAttribute($val)
    {
        $this->attributes['path_foto'] = $val;
    }
    public function setCamCapturedAtAttribute($val)
    {
        $this->attributes['waktu_deteksi'] = $val;
    }

    public function kandang(): BelongsTo
    {
        return $this->belongsTo(Kandang::class, 'id_kandang', 'id_kandang');
    }
    public function barn(): BelongsTo
    {
        return $this->kandang();
    }

    public function sapi(): BelongsTo
    {
        return $this->belongsTo(Sapi::class, 'id_sapi', 'id_sapi');
    }
    public function cow(): BelongsTo
    {
        return $this->sapi();
    }
}
