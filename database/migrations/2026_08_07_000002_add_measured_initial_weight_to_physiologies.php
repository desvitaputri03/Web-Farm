<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('physiologies', function (Blueprint $table) {
            if (!Schema::hasColumn('physiologies', 'phyMeasuredInitialWeight')) {
                $table->decimal('phyMeasuredInitialWeight', 6, 2)->nullable()->after('phyInitialWeight');
            }
        });
    }

    public function down(): void
    {
        Schema::table('physiologies', function (Blueprint $table) {
            if (Schema::hasColumn('physiologies', 'phyMeasuredInitialWeight')) {
                $table->dropColumn('phyMeasuredInitialWeight');
            }
        });
    }
};
