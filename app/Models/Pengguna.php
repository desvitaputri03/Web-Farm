<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

/**
 * Model Pengguna (Tabel Database: 'users')
 * Mengelola data pengguna, hak akses, dan autentikasi akun peternak/admin.
 */
class Pengguna extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'name',
        'email',
        'nomor_telepon',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'id_pengguna',
        'nama_pengguna',
        'email_pengguna',
        'telepon',
        'peran'
    ];

    public function getIdPenggunaAttribute() { return $this->id; }
    public function getNamaPenggunaAttribute() { return $this->name; }
    public function getEmailPenggunaAttribute() { return $this->email; }
    public function getTeleponAttribute() { return $this->nomor_telepon; }
    public function getPeranAttribute() { return $this->role; }

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
