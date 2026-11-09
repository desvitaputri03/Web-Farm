<?php

namespace App\Services;

use App\Models\LogPerilaku as BehaviorLog;
use App\Models\Sapi as Cow;
use App\Models\LogPakan as FeedLog;
use App\Models\Fisiologis as Physiology;
use App\Models\Kandang as Barn;
use Carbon\Carbon;
use Illuminate\Support\Collection;

class LivestockAnalyticsService
{
    public function compute(?string $dateStr = null): array
    {
        $cows = Cow::with(['fisiologis', 'dataPakan', 'dataPerilaku'])->get();
        $targetDate = $dateStr ? Carbon::parse($dateStr) : Carbon::today();
        $today = $targetDate;
        $feedPrice = config('farm.feed_price_per_kg', 3500); // Rp 3.500 / kg
        $livePrice = config('farm.live_weight_price_per_kg', 55000); // Rp 55.000 / kg sapi hidup
        $idealRatio = config('farm.ideal_feed_ratio', 0.10); // 10% dari berat sapi

        $sevenDaysAgo = (clone $targetDate)->subDays(7);
        $thirtyDaysAgo = (clone $targetDate)->subDays(30);

        $feedAnalysis = [];
        $performance = [];
        $totalDailyFeed = 0;
        $totalWeeklyFeed = 0;
        $totalMonthlyFeed = 0;
        $totalIdealDemand = 0;

        foreach ($cows as $cow) {
            $phy = $cow->fisiologis;
            $currentWeight = (float) ($phy?->bobot_terkini ?? 0);
            $idealFeed = $currentWeight > 0 ? round($currentWeight * $idealRatio, 2) : 0;
            $totalIdealDemand += $idealFeed;

            $todayFeeds = $cow->dataPakan->filter(fn ($f) => $f->created_at && $f->created_at->toDateString() === $today->toDateString());
            if ($todayFeeds->count() === 0) {
                $nearestFeed = $cow->dataPakan->filter(fn ($f) => $f->created_at && $f->created_at->toDateString() <= $today->toDateString())->sortByDesc('created_at')->first();
                if ($nearestFeed) {
                    $todayFeeds = collect([$nearestFeed]);
                } elseif ($cow->dataPakan->isNotEmpty()) {
                    $todayFeeds = collect([$cow->dataPakan->first()]);
                }
            }

            $consumedToday = round($todayFeeds->sum('jumlah_pakan'), 2);

            $weeklyFeeds = $cow->dataPakan->filter(fn ($f) => $f->created_at && $f->created_at >= $sevenDaysAgo);
            $consumedWeekly = $weeklyFeeds->sum('jumlah_pakan');

            $monthlyFeeds = $cow->dataPakan->filter(fn ($f) => $f->created_at && $f->created_at >= $thirtyDaysAgo);
            $consumedMonthly = $monthlyFeeds->sum('jumlah_pakan');

            $status = 'Tidak Ada Data';
            if ($todayFeeds->count() === 0 || $consumedToday == 0) {
                $status = 'Tidak Ada Data';
            } elseif ($idealFeed > 0) {
                $diff = abs($consumedToday - $idealFeed) / $idealFeed;
                if ($diff <= 0.10) {
                    $status = 'Sesuai';
                } else {
                    $status = 'Tidak Sesuai';
                }
            }

            $feedAnalysis[] = [
                'cowID' => $cow->id_sapi,
                'cowBreed' => $cow->ras_sapi,
                'cowGender' => $cow->jenis_kelamin_sapi,
                'currentWeight' => $currentWeight,
                'idealFeedDaily' => $idealFeed,
                'consumedToday' => $consumedToday,
                'feedFrequency' => $todayFeeds->count(),
                'status' => $status,
            ];

            $totalDailyFeed += $consumedToday;
            $totalWeeklyFeed += $consumedWeekly;
            $totalMonthlyFeed += $consumedMonthly;
        }

        $financial['dailyFeedKg'] = round($totalDailyFeed, 2);
        $financial['totalIdealDemand'] = round($totalIdealDemand, 2);
        $financial['feedPricePerKg'] = $feedPrice;
        $financial['livePricePerKg'] = $livePrice;
        $financial['dailyCost'] = round($totalDailyFeed * $feedPrice, 0);
        $financial['weeklyCost'] = round(($totalDailyFeed * 7) * $feedPrice, 0);
        $financial['monthlyCost'] = round(($totalDailyFeed * 30) * $feedPrice, 0);

        $totalWeightGainWeekly = 0;
        $totalWeightGainMonthly = 0;
        $cowCountWithPhy = 0;
        $marketPricePerKg = 75000; // Rp 75.000 / kg

        foreach ($cows as $cow) {
            $phy = $cow->fisiologis;
            if (!$phy) {
                continue;
            }

            $cowCountWithPhy++;
            $initial = (float) $phy->bobot_awal;
            $current = (float) $phy->bobot_terkini;
            $gain = round($current - $initial, 2);
            
            $gainWeekly = round($gain * 0.25, 2);
            $gainMonthly = $gain;
            $totalWeightGainWeekly += $gainWeekly;
            $totalWeightGainMonthly += $gainMonthly;

            $purchase = (float) $cow->harga_beli_sapi;
            $totalFeedCost = round($cow->dataPakan->sum('jumlah_pakan') * $feedPrice, 0);

            $costBasedSell = $purchase + $totalFeedCost;
            $profitLossMethod1 = 0;

            $marketBasedSell = round($current * $marketPricePerKg, 0);
            $profitLossMethod2 = $marketBasedSell - ($purchase + $totalFeedCost);

            $performance[] = [
                'cowID' => $cow->id_sapi,
                'cowBreed' => $cow->ras_sapi,
                'cowGender' => $cow->jenis_kelamin_sapi,
                'currentWeight' => $current,
                'weightGain' => $gain,
                'gainWeekly' => $gainWeekly,
                'gainMonthly' => $gainMonthly,
                'purchasePrice' => $purchase,
                'totalFeedCost' => $totalFeedCost,
                'costBasedSell' => $costBasedSell,
                'marketBasedSell' => $marketBasedSell,
                'profitLossMethod1' => $profitLossMethod1,
                'profitLossMethod2' => $profitLossMethod2,
                'status' => $profitLossMethod2 >= 0 ? 'UNTUNG (PROFIT)' : 'RUGI',
            ];
        }

        $financial['avgGainWeekly'] = $cowCountWithPhy > 0 ? round($totalWeightGainWeekly / $cowCountWithPhy, 2) : 0;
        $financial['avgGainMonthly'] = $cowCountWithPhy > 0 ? round($totalWeightGainMonthly / $cowCountWithPhy, 2) : 0;
        $financial['marketPricePerKg'] = $marketPricePerKg;

        $behaviorToday = $this->behaviorSummary($today);
        $behaviorPerCow = $this->behaviorPerCowSummary($cows, $today);
        $feedingAccess = $this->feedingAccessSummary($today);
        $barnSummary = Barn::all();

        return [
            'feedAnalysis' => $feedAnalysis,
            'financial' => $financial,
            'performance' => $performance,
            'behaviorToday' => $behaviorToday,
            'behaviorPerCow' => $behaviorPerCow,
            'feedingAccess' => $feedingAccess,
            'barnSummary' => $barnSummary,
        ];
    }

    private function behaviorSummary(Carbon $date): array
    {
        $logs = BehaviorLog::whereDate('waktu_mulai', $date)->get();
        $activities = ['Makan', 'Berjalan', 'Berdiri', 'Berbaring', 'Ruminasi'];
        $summary = [];

        foreach ($activities as $act) {
            $summary[$act] = $logs->where('aktivitas', $act)->count();
        }

        $summary['total'] = $logs->count();

        return $summary;
    }

    private function behaviorPerCowSummary($cows, Carbon $date): array
    {
        $result = [];

        $calcDuration = function ($filteredLogs, $defaultMins = 30) {
            $count = $filteredLogs->count();
            if ($count === 0) return ['count' => 0, 'mins' => 0, 'formatted' => '0 mnt', 'timeOnly' => '0 mnt'];

            $totalMins = 0;
            foreach ($filteredLogs as $l) {
                if ($l->waktu_mulai && $l->waktu_selesai) {
                    $diff = Carbon::parse($l->waktu_mulai)->diffInMinutes(Carbon::parse($l->waktu_selesai));
                    $totalMins += max(5, $diff);
                } else {
                    $totalMins += $defaultMins;
                }
            }

            $hours = floor($totalMins / 60);
            $mins = $totalMins % 60;
            $timeStr = $hours > 0 ? ($mins > 0 ? "{$hours} jam {$mins} mnt" : "{$hours} jam") : "{$mins} mnt";

            return [
                'count' => $count,
                'mins' => $totalMins,
                'formatted' => "{$count} kali ({$timeStr})",
                'timeOnly' => $timeStr,
            ];
        };

        foreach ($cows as $cow) {
            $logs = $cow->dataPerilaku->filter(fn ($b) => $b->waktu_mulai && Carbon::parse($b->waktu_mulai)->toDateString() === $date->toDateString());
            if ($logs->count() === 0) {
                $nearestLogs = $cow->dataPerilaku->filter(fn ($b) => $b->waktu_mulai && Carbon::parse($b->waktu_mulai)->toDateString() <= $date->toDateString());
                if ($nearestLogs->isNotEmpty()) {
                    $latestDateStr = Carbon::parse($nearestLogs->max('waktu_mulai'))->toDateString();
                    $logs = $cow->dataPerilaku->filter(fn ($b) => $b->waktu_mulai && Carbon::parse($b->waktu_mulai)->toDateString() === $latestDateStr);
                } elseif ($cow->dataPerilaku->isNotEmpty()) {
                    $logs = $cow->dataPerilaku->take(5);
                }
            }

            $makanData = $calcDuration($logs->where('aktivitas', 'Makan'), 45);
            $ruminasiData = $calcDuration($logs->where('aktivitas', 'Ruminasi'), 60);
            $berjalanData = $calcDuration($logs->where('aktivitas', 'Berjalan'), 20);
            $berdiriData = $calcDuration($logs->where('aktivitas', 'Berdiri'), 35);
            $berbaringData = $calcDuration($logs->where('aktivitas', 'Berbaring'), 50);

            $result[] = [
                'cowID' => $cow->id_sapi,
                'cowBreed' => $cow->ras_sapi,
                'makan' => $makanData['count'],
                'makanDuration' => $makanData['formatted'],
                'ruminasi' => $ruminasiData['count'],
                'ruminasiDuration' => $ruminasiData['formatted'],
                'berjalan' => $berjalanData['count'],
                'berjalanDuration' => $berjalanData['formatted'],
                'berdiri' => $berdiriData['count'],
                'berdiriDuration' => $berdiriData['formatted'],
                'berbaring' => $berbaringData['count'],
                'berbaringDuration' => $berbaringData['formatted'],
                'total' => $logs->count(),
            ];
        }
        return $result;
    }

    private function feedingAccessSummary(Carbon $date): array
    {
        $logs = FeedLog::whereDate('created_at', $date)->get();

        return [
            'totalAccess' => $logs->count(),
            'records' => $logs->count(),
        ];
    }
}
