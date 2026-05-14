export interface PortionDef {
  label: string;
  grams: number;
}

export interface FoodItem {
  id: string;
  name: string;
  kcalPer100g: number;
  proteinPer100g: number;
  carbsPer100g: number;
  fatPer100g: number;
  fiberPer100g: number;
  gi: number | null;
  defaultPortions: PortionDef[];
}

export interface FoodLogEntry {
  id: string;
  date: string;
  foodItemId: string;
  foodName: string;
  grams: number;
  portionLabel: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  gi: number | null;
  timestamp: number;
}

export type DrinkType = 'beer' | 'wine' | 'spirits' | 'cocktail';

export interface DrinkLogEntry {
  id: string;
  date: string;
  name: string;
  drinkType: DrinkType;
  volumeMl: number;
  abvPercent: number;
  kcal: number;
  standardDrinks: number;
  timestamp: number;
}

export interface PantryItem {
  id: string;
  foodItemId: string;
  foodName: string;
  quantityGrams: number;
  expiryDate: string | null;
  addedAt: number;
}

export interface RecipeIngredient {
  foodItemId: string;
  foodName: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  servings: number;
  ingredients: RecipeIngredient[];
  createdAt: number;
}

export type FlagSeverity = 'info' | 'warning' | 'critical';

export interface Flag {
  id: string;
  severity: FlagSeverity;
  label: string;
  detail: string;
  sensitive: boolean;
}

export type GoalMode = 'lose' | 'maintain' | 'gain';

export interface UserSettings {
  kcalTarget: number;
  proteinTargetG: number;
  goalMode: GoalMode;
  weightKg: number;
}

export type ExerciseCategory = 'cardio' | 'strength' | 'sports' | 'flexibility';
export type ExerciseIntensity = 'light' | 'moderate' | 'intense';

export interface ExerciseItem {
  id: string;
  name: string;
  category: ExerciseCategory;
  met: number;
}

export interface ExerciseLogEntry {
  id: string;
  date: string;
  exerciseId: string;
  exerciseName: string;
  durationMin: number;
  intensity: ExerciseIntensity;
  kcalBurned: number;
  timestamp: number;
}
