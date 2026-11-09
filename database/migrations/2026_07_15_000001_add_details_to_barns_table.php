<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('barns', function (Blueprint $table) {
            $table->string('barnName')->nullable()->after('barnID');
            $table->string('barnLocation')->nullable()->after('barnName');
            $table->integer('barnCapacity')->default(10)->after('barnLocation');
        });
    }

    public function down(): void
    {
        Schema::table('barns', function (Blueprint $table) {
            $table->dropColumn(['barnName', 'barnLocation', 'barnCapacity']);
        });
    }
};
