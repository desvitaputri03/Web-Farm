<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model Fisiologis (Tabel Database: 'fisiologis')
 * Mengelola data kondisi fisik, bobot awal, bobot target, bobot terkini, dan suhu tubuh sapi.
 */
class Fisiologis extends Model
{
    protected $table = 'fisiologis';
    protected $primaryKey = 'id_fisiologis';

    protected $fillable = [
        'id_sapi',
        'status_fisiologis',
        'bobot_awal',
        'bobot_terukur_awal',
        'bobot_target',
        'bobot_terkini',
        'suhu_tubuh',
        'riwayat_kesehatan',
        'tanggal_pencatatan',
        'jam_pengukuran',
        'jenis_pencatatan',
        'phyID',
        'phyCowID',
        'phyStatus',
        'phyInitialWeight',
        'phyTargetWeight',
        'phyCurrentWeight',
        'phyTemperature',
        'phyHealthHistory',
        'phyRecordDate',
        'phyRecordTime',
        'phyRecordType',
    ];

    protected $appends = [
        'phyID',
        'phyCowID',
        'phyStatus',
        'phyInitialWeight',
        'phyTargetWeight',
        'phyCurrentWeight',
        'phyTemperature',
        'phyHealthHistory',
        'phyRecordDate',
        'phyRecordTime',
        'phyRecordType',
    ];

    // Accessors for English backwards compatibility
    public function getPhyIDAttribute() { return $this->id_fisiologis; }
    public function getPhyCowIDAttribute() { return $this->id_sapi; }
    public function getPhyStatusAttribute() { return $this->status_fisiologis; }
    public function getPhyInitialWeightAttribute() { return $this->bobot_awal; }
    public function getPhyTargetWeightAttribute() { return $this->bobot_target; }
    public function getPhyCurrentWeightAttribute() { return $this->bobot_terkini; }
    public function getPhyTemperatureAttribute() { return $this->suhu_tubuh; }
    public function getPhyHealthHistoryAttribute() { return $this->riwayat_kesehatan; }
    public function getPhyRecordDateAttribute() { return $this->tanggal_pencatatan ?? ($this->created_at ? $this->created_at->format('Y-m-d') : null); }
    public function getPhyRecordTimeAttribute() { return $this->jam_pengukuran ?? ($this->created_at ? $this->created_at->format('H:i') : '08:00'); }
    public function getPhyRecordTypeAttribute() { return $this->jenis_pencatatan ?? 'Penimbangan Berkala'; }

    // Mutators for English backwards compatibility
    public function setPhyIDAttribute($val) { $this->attributes['id_fisiologis'] = $val; }
    public function setPhyCowIDAttribute($val) { $this->attributes['id_sapi'] = $val; }
    public function setPhyStatusAttribute($val) { $this->attributes['status_fisiologis'] = $val; }
    public function setPhyInitialWeightAttribute($val) { $this->attributes['bobot_awal'] = $val; }
    public function setPhyTargetWeightAttribute($val) { $this->attributes['bobot_target'] = $val; }
    public function setPhyCurrentWeightAttribute($val) { $this->attributes['bobot_terkini'] = $val; }
    public function setPhyTemperatureAttribute($val) { $this->attributes['suhu_tubuh'] = $val; }
    public function setPhyHealthHistoryAttribute($val) { $this->attributes['riwayat_kesehatan'] = $val; }
    public function setPhyRecordDateAttribute($val) { $this->attributes['tanggal_pencatatan'] = $val; }
    public function setPhyRecordTimeAttribute($val) { $this->attributes['jam_pengukuran'] = $val; }
    public function setPhyRecordTypeAttribute($val) { $this->attributes['jenis_pencatatan'] = $val; }

    public function sapi(): BelongsTo { return $this->belongsTo(Sapi::class, 'id_sapi', 'id_sapi'); }
    public function cow(): BelongsTo { return $this->sapi(); }
}
