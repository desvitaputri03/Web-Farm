<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cows', function (Blueprint $table) {
            $table->string('cowID')->primary();
            $table->enum('cowGender', ['Jantan', 'Betina']);
            $table->date('cowBirthDate');
            $table->string('cowBreed');
            $table->text('cowHistory');
            $table->decimal('cowPurchasePrice', 12, 2)->default(12000000.00);
            $table->string('cowBarnID');
            $table->foreign('cowBarnID')->references('barnID')->on('barns')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cows');
    }
};
