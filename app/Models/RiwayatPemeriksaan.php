<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Model RiwayatPemeriksaan (Tabel Database: 'riwayat_pemeriksaan')
 * Mengelola data catatan riwayat pemeriksaan kesehatan sapi oleh dokter/peternak.
 */
class RiwayatPemeriksaan extends Model
{
    protected $table = 'riwayat_pemeriksaan';
    protected $primaryKey = 'id_pemeriksaan';

    protected $fillable = [
        'id_sapi',
        'catatan_diagnosa',
        'tanggal_pemeriksaan',
        'waktu_input',
        'cow_id',
        'diagnosis_notes',
        'examination_date',
        'input_date',
    ];

    protected $casts = [
        'tanggal_pemeriksaan' => 'date',
        'waktu_input' => 'datetime',
    ];

    protected $appends = [
        'id',
        'cow_id',
        'diagnosis_notes',
        'examination_date',
        'input_date'
    ];

    // Accessors for English backwards compatibility
    public function getIdAttribute() { return $this->id_pemeriksaan; }
    public function getCowIdAttribute() { return $this->id_sapi; }
    public function getDiagnosisNotesAttribute() { return $this->catatan_diagnosa; }
    public function getExaminationDateAttribute() { return $this->tanggal_pemeriksaan; }
    public function getInputDateAttribute() { return $this->waktu_input ?? $this->created_at; }

    // Mutators for English backwards compatibility
    public function setCowIdAttribute($value) { $this->attributes['id_sapi'] = $value; }
    public function setDiagnosisNotesAttribute($value) { $this->attributes['catatan_diagnosa'] = $value; }
    public function setExaminationDateAttribute($value) { $this->attributes['tanggal_pemeriksaan'] = $value; }
    public function setInputDateAttribute($value) { $this->attributes['waktu_input'] = $value; }

    public function sapi(): BelongsTo { return $this->belongsTo(Sapi::class, 'id_sapi', 'id_sapi'); }
    public function cow(): BelongsTo { return $this->sapi(); }
}
