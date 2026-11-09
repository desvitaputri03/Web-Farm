<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('physiologies', function (Blueprint $table) {
            $table->id('phyID');
            $table->string('phyCowID')->unique();
            $table->foreign('phyCowID')->references('cowID')->on('cows')->onDelete('cascade');
            $table->string('phyStatus');
            $table->decimal('phyInitialWeight', 6, 2);
            $table->decimal('phyTargetWeight', 6, 2);
            $table->decimal('phyCurrentWeight', 6, 2);
            $table->decimal('phyTemperature', 4, 2);
            $table->text('phyHealthHistory');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('physiologies');
    }
};
