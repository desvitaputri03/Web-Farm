<?php

return [
    'feed_price_per_kg' => (int) env('FARM_FEED_PRICE_PER_KG', 5000),
    'live_weight_price_per_kg' => (int) env('FARM_LIVE_WEIGHT_PRICE_PER_KG', 35000),
    'ideal_feed_ratio' => 0.10,
];
