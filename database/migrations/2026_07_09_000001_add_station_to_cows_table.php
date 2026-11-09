<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cows', function (Blueprint $table) {
            $table->unsignedBigInteger('cowStationID')->nullable()->after('cowBarnID');
            $table->foreign('cowStationID')->references('stationID')->on('feeding_stations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('cows', function (Blueprint $table) {
            $table->dropForeign(['cowStationID']);
            $table->dropColumn('cowStationID');
        });
    }
};
