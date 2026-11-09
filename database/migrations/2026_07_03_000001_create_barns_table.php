<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barns', function (Blueprint $table) {
            $table->string('barnID')->primary(); // e.g. KDG-A01
            $table->decimal('barnTemperature', 5, 2)->nullable();
            $table->decimal('barnHumidity', 5, 2)->nullable();
            $table->integer('barnLight')->nullable();
            $table->decimal('barnWindSpeed', 5, 2)->nullable();
            $table->decimal('barnRainfall', 5, 2)->nullable();
            $table->enum('barnFloorCondition', ['Bersih', 'Kotor'])->default('Bersih');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barns');
    }
};
