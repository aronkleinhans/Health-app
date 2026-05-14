import { Flag, FoodLogEntry, PantryItem, UserSettings } from '../types';
import { calcGlycemicLoad } from './nutrition';
import { daysUntil } from './date';

interface DrinkSummary {
  standardDrinks: number;
  bgCrashRisk: boolean;
  metabolicWindowHours: number;
}

interface FoodTotals {
  kcal: number;
  protein: number;
}

export function computeFlags(
  foodTotals: FoodTotals,
  foodEntries: FoodLogEntry[],
  drinks: DrinkSummary,
  pantry: PantryItem[],
  settings: UserSettings
): Flag[] {
  const flags: Flag[] = [];
  const surplus = foodTotals.kcal - settings.kcalTarget;
  const gl = calcGlycemicLoad(foodEntries);

  if (surplus > 500) {
    flags.push({
      id: 'large-surplus',
      severity: 'warning',
      label: 'Large caloric surplus',
      detail: `${surplus} kcal above target (${foodTotals.kcal} logged, ${settings.kcalTarget} target).`,
      sensitive: false,
    });
  } else if (surplus < -600 && settings.goalMode !== 'lose') {
    flags.push({
      id: 'large-deficit',
      severity: 'warning',
      label: 'Large caloric deficit',
      detail: `${Math.abs(surplus)} kcal below target. Adequate intake supports recovery.`,
      sensitive: false,
    });
  }

  if (foodTotals.protein < settings.proteinTargetG * 0.6 && foodTotals.kcal > 0) {
    flags.push({
      id: 'low-protein',
      severity: 'info',
      label: 'Low protein',
      detail: `${Math.round(foodTotals.protein)}g logged vs ${settings.proteinTargetG}g target.`,
      sensitive: false,
    });
  }

  if (gl > 120) {
    flags.push({
      id: 'high-gi-load',
      severity: 'warning',
      label: 'High glycemic load',
      detail: `Today's GL is ${gl}. High-GI meals can cause rapid blood sugar swings.`,
      sensitive: true,
    });
  } else if (gl > 80) {
    flags.push({
      id: 'moderate-gi-load',
      severity: 'info',
      label: 'Moderate glycemic load',
      detail: `Today's GL is ${gl}.`,
      sensitive: false,
    });
  }

  if (drinks.standardDrinks > 0) {
    flags.push({
      id: 'metabolic-window',
      severity: 'info',
      label: 'Metabolic window active',
      detail: `Fat oxidation halted. Estimated clearance ~${drinks.metabolicWindowHours}h. Gluconeogenesis suppressed.`,
      sensitive: false,
    });
  }

  if (drinks.bgCrashRisk) {
    flags.push({
      id: 'bg-crash-risk',
      severity: 'warning',
      label: 'BG crash risk',
      detail: 'Spirits without sufficient food intake can cause hypoglycaemia.',
      sensitive: true,
    });
  }

  if (drinks.standardDrinks > 6) {
    flags.push({
      id: 'heavy-session',
      severity: 'critical',
      label: 'Heavy drinking session',
      detail: `${drinks.standardDrinks} units logged. Tomorrow's recovery capacity will be significantly reduced.`,
      sensitive: true,
    });
  } else if (drinks.standardDrinks > 4) {
    flags.push({
      id: 'significant-alcohol',
      severity: 'warning',
      label: 'Significant alcohol intake',
      detail: `${drinks.standardDrinks} units. Next-day recovery capacity reduced.`,
      sensitive: false,
    });
  }

  const expired = pantry.filter((p) => p.expiryDate && daysUntil(p.expiryDate) < 0);
  const expiringSoon = pantry.filter((p) => {
    if (!p.expiryDate) return false;
    const d = daysUntil(p.expiryDate);
    return d >= 0 && d <= 3;
  });

  if (expired.length > 0) {
    flags.push({
      id: 'expired-pantry',
      severity: 'warning',
      label: `${expired.length} expired pantry item${expired.length > 1 ? 's' : ''}`,
      detail: expired.map((p) => p.foodName).join(', '),
      sensitive: false,
    });
  }

  if (expiringSoon.length > 0) {
    flags.push({
      id: 'expiring-soon',
      severity: 'info',
      label: `${expiringSoon.length} item${expiringSoon.length > 1 ? 's' : ''} expiring within 3 days`,
      detail: expiringSoon.map((p) => p.foodName).join(', '),
      sensitive: false,
    });
  }

  return flags;
}

export function pantryMatchPercent(
  ingredients: { foodItemId: string; grams: number }[],
  pantry: PantryItem[]
): number {
  if (ingredients.length === 0) return 0;
  const available = ingredients.filter((ing) => {
    const stock = pantry.find((p) => p.foodItemId === ing.foodItemId);
    return stock && stock.quantityGrams >= ing.grams;
  });
  return Math.round((available.length / ingredients.length) * 100);
}
