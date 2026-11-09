<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('feeding_stations', function (Blueprint $table) {
            $table->id('stationID');
            $table->string('stationCode')->unique();
            $table->string('stationName')->nullable();
            $table->enum('stationType', ['makan', 'minum', 'campur'])->default('makan');
            $table->string('stationLocation')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feeding_stations');
    }
};
?>