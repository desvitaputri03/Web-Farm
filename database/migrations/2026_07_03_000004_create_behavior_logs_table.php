<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('behavior_logs', function (Blueprint $table) {
            $table->id('behID');
            $table->string('behCowID');
            $table->foreign('behCowID')->references('cowID')->on('cows')->onDelete('cascade');
            $table->enum('behActivity', ['Makan', 'Berjalan', 'Berdiri', 'Berbaring', 'Ruminasi']);
            $table->dateTime('behStartTime');
            $table->dateTime('behEndTime');
            $table->enum('behSource', ['Otomatis Sensor', 'Input Manual'])->default('Input Manual');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('behavior_logs');
    }
};
