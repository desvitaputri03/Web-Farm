<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('camera_logs', function (Blueprint $table) {
            $table->id('camID');
            $table->string('camCowID');
            $table->foreign('camCowID')->references('cowID')->on('cows')->onDelete('cascade');
            $table->string('camActivity', 100);
            $table->decimal('camConfidence', 5, 2)->nullable();
            $table->string('camImagePath')->nullable();
            $table->dateTime('camCapturedAt');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('camera_logs');
    }
};
