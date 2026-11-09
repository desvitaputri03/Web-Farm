<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('examination_records', function (Blueprint $table) {
            $table->id();
            $table->string('cow_id');
            $table->foreign('cow_id')->references('cowID')->on('cows')->onDelete('cascade');
            $table->text('diagnosis_notes');
            $table->date('examination_date');
            $table->timestamp('input_date')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('examination_records');
    }
};
