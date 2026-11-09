<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::table('cows', function (Blueprint $table) {
            $table->text('cowPhoto')->nullable()->after('cowHistory');
        });
    }

    public function down(): void
    {
        Schema::table('cows', function (Blueprint $table) {
            $table->dropColumn('cowPhoto');
        });
    }
};
