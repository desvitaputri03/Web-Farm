<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cows', function (Blueprint $table) {
            $table->foreignId('cowOwnerID')->nullable()->after('cowBarnID')->constrained('users')->nullOnDelete();
        });

        Schema::table('feed_logs', function (Blueprint $table) {
            $table->unsignedBigInteger('feedStationID')->nullable()->after('feedCowID');
            $table->foreign('feedStationID')->references('stationID')->on('feeding_stations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('feed_logs', function (Blueprint $table) {
            $table->dropForeign(['feedStationID']);
            $table->dropColumn('feedStationID');
        });

        Schema::table('cows', function (Blueprint $table) {
            $table->dropForeign(['cowOwnerID']);
            $table->dropColumn('cowOwnerID');
        });
    }
};
