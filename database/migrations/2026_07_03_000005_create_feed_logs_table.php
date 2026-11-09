<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feed_logs', function (Blueprint $table) {
            $table->id('feedID');
            $table->string('feedCowID');
            $table->foreign('feedCowID')->references('cowID')->on('cows')->onDelete('cascade');
            $table->string('feedComposition');
            $table->decimal('feedInitialFeed', 5, 2); // kg
            $table->decimal('feedLeftoverFeed', 5, 2); // kg
            $table->integer('feedFrequency');
            $table->string('feedWaterQuality');
            $table->decimal('feedInitialWater', 5, 2); // L
            $table->decimal('feedLeftoverWater', 5, 2); // L
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_logs');
    }
};
