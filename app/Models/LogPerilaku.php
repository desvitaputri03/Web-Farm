<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model LogPerilaku (Tabel Database: 'log_perilaku')
 * Mengelola data catatan aktivitas dan telemetry sensor perilaku sapi.
 */
class LogPerilaku extends Model
{
    protected $table = 'log_perilaku';
    protected $primaryKey = 'id_log_perilaku';

    protected $fillable = [
        'id_sapi',
        'aktivitas',
        'akselerasi_x',
        'akselerasi_y',
        'akselerasi_z',
        'gyro_x',
        'gyro_y',
        'gyro_z',
        'waktu_mulai',
        'waktu_selesai',
        'sumber_data',
        'behID',
        'behCowID',
        'behActivity',
        'behStartTime',
        'behEndTime',
        'behSource',
    ];

    protected $appends = [
        'behID',
        'behCowID',
        'behActivity',
        'behStartTime',
        'behEndTime'
    ];

    // Accessors for English backwards compatibility
    public function getBehIDAttribute() { return $this->id_log_perilaku; }
    public function getBehCowIDAttribute() { return $this->id_sapi; }
    public function getBehActivityAttribute() { return $this->aktivitas; }
    public function getBehStartTimeAttribute() { return $this->waktu_mulai; }
    public function getBehEndTimeAttribute() { return $this->waktu_selesai; }

    // Mutators for English backwards compatibility
    public function setBehIDAttribute($val) { $this->attributes['id_log_perilaku'] = $val; }
    public function setBehCowIDAttribute($val) { $this->attributes['id_sapi'] = $val; }
    public function setBehActivityAttribute($val) { $this->attributes['aktivitas'] = $val; }
    public function setBehStartTimeAttribute($val) { $this->attributes['waktu_mulai'] = $val; }
    public function setBehEndTimeAttribute($val) { $this->attributes['waktu_selesai'] = $val; }
    public function setBehSourceAttribute($val) { $this->attributes['sumber_data'] = $val; }

    public function sapi(): BelongsTo { return $this->belongsTo(Sapi::class, 'id_sapi', 'id_sapi'); }
    public function cow(): BelongsTo { return $this->sapi(); }
}
