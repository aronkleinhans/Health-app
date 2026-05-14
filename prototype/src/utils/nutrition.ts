import { FoodItem, FoodLogEntry, DrinkLogEntry, ExerciseLogEntry } from '../types';
import { INTENSITY_MET_MULTIPLIER } from '../data/exercises';

export function calcNutrition(food: FoodItem, grams: number) {
  const f = grams / 100;
  return {
    kcal: Math.round(food.kcalPer100g * f),
    protein: Math.round(food.proteinPer100g * f * 10) / 10,
    carbs: Math.round(food.carbsPer100g * f * 10) / 10,
    fat: Math.round(food.fatPer100g * f * 10) / 10,
    fiber: Math.round(food.fiberPer100g * f * 10) / 10,
  };
}

export function sumFoodLog(entries: FoodLogEntry[]) {
  return entries.reduce(
    (acc, e) => ({
      kcal: acc.kcal + e.kcal,
      protein: Math.round((acc.protein + e.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + e.carbs) * 10) / 10,
      fat: Math.round((acc.fat + e.fat) * 10) / 10,
      fiber: Math.round((acc.fiber + e.fiber) * 10) / 10,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function calcGlycemicLoad(entries: FoodLogEntry[]): number {
  // GL = (GI × net carbs) / 100, summed across all logged items
  const total = entries.reduce((sum, e) => {
    if (e.gi === null) return sum;
    return sum + (e.gi * e.carbs) / 100;
  }, 0);
  return Math.round(total * 10) / 10;
}

// UK standard: 1 unit = 10ml pure alcohol
export function calcStandardDrinks(volumeMl: number, abvPercent: number): number {
  const pureMl = (volumeMl * abvPercent) / 100;
  return Math.round((pureMl / 10) * 10) / 10;
}

// Alcohol = 7 kcal/g; ethanol density ≈ 0.789 g/ml
export function calcAlcoholKcal(volumeMl: number, abvPercent: number): number {
  const pureMl = (volumeMl * abvPercent) / 100;
  return Math.round(pureMl * 0.789 * 7);
}

export function calcMetabolicWindowHours(standardDrinks: number): number {
  return Math.round(standardDrinks * 1.5 * 10) / 10;
}

// kcal = MET × weight_kg × duration_hours × intensity_multiplier
export function calcExerciseKcal(
  met: number,
  weightKg: number,
  durationMin: number,
  intensity: string
): number {
  const multiplier = INTENSITY_MET_MULTIPLIER[intensity] ?? 1.0;
  return Math.round(met * multiplier * weightKg * (durationMin / 60));
}

export function sumExerciseLog(entries: ExerciseLogEntry[]): number {
  return entries.reduce((s, e) => s + e.kcalBurned, 0);
}

export function sumDrinkLog(entries: DrinkLogEntry[]) {
  const units = entries.reduce((s, e) => s + e.standardDrinks, 0);
  const kcal = entries.reduce((s, e) => s + e.kcal, 0);
  const hasSpiritsAlone = entries.some((e) => e.drinkType === 'spirits');
  return {
    standardDrinks: Math.round(units * 10) / 10,
    kcal,
    metabolicWindowHours: calcMetabolicWindowHours(units),
    bgCrashRisk: hasSpiritsAlone,
  };
}
