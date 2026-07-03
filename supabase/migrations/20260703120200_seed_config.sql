-- NuntaPlanner — Faza 1: seed config_parameters cu valorile implicite ale motorului.
-- region = NULL → config global. Regiunile pot suprascrie parțial prin rânduri proprii.
-- Valorile oglindesc DEFAULT_CONFIG din src/lib/engine/config.ts.

insert into public.config_parameters (region, key, value, version)
values (
  null,
  'engine_config',
  '{
    "avgDrinksPerAdultPerHour": 0.75,
    "drinkSplit": { "wine": 0.4, "beer": 0.2, "spirits": 0.15 },
    "wineServingMl": 150,
    "beerBottleMl": 330,
    "spiritsServingMl": 50,
    "wineBottleL": 0.75,
    "spiritsBottleL": 0.7,
    "waterLPerPersonPerHour": 0.5,
    "juiceLPerPersonPerHour": 0.3,
    "champagnePersonsPerBottle": 7,
    "safetyBufferPct": 0.1,
    "glassesWinePerAdult": 1.5,
    "glassesSpiritsPerAdult": 0.8,
    "glassesWaterPerPerson": 1.5,
    "drinkCostPerPersonRON": 60,
    "cakeGramsPerPerson": 120,
    "candyBarKgPerPerson": 0.15,
    "civilSweetsKgPerGuest": 0.1,
    "venueSqmFactor": 1.8,
    "venueSqmMin": 1.5,
    "venueSqmMax": 2.0,
    "guestsPerTable": 10,
    "musicBudgetPct": 0.09,
    "bandCostRON": 12000,
    "djCostRON": 4000,
    "bandGuestThresholdLow": 80,
    "bandGuestThresholdHigh": 200,
    "budgetAllocation": {
      "venue_catering": 0.48,
      "music": 0.09,
      "photo_video": 0.11,
      "decor_flowers": 0.09,
      "attire": 0.08,
      "drinks": 0.06,
      "invitations_favors_cake": 0.05,
      "misc": 0.04
    },
    "cateringMinPerPersonRON": 150
  }'::jsonb,
  1
)
on conflict (coalesce(region, '__global__'), key) do update
  set value = excluded.value,
      version = config_parameters.version + 1;
