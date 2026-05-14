import React, { createContext, useContext, useReducer, useEffect } from 'react';
import {
  FoodItem,
  FoodLogEntry,
  DrinkLogEntry,
  PantryItem,
  Recipe,
  UserSettings,
} from '../types';
import { FOOD_DATABASE } from '../data/foods';
import { todayStr, uid } from '../utils/date';
import { calcNutrition, calcStandardDrinks, calcAlcoholKcal } from '../utils/nutrition';

interface AppState {
  foodItems: FoodItem[];
  foodLog: FoodLogEntry[];
  drinkLog: DrinkLogEntry[];
  pantry: PantryItem[];
  recipes: Recipe[];
  settings: UserSettings;
}

type Action =
  | { type: 'ADD_FOOD_LOG'; entry: Omit<FoodLogEntry, 'id' | 'timestamp'> }
  | { type: 'REMOVE_FOOD_LOG'; id: string }
  | { type: 'ADD_DRINK_LOG'; entry: Omit<DrinkLogEntry, 'id' | 'timestamp'> }
  | { type: 'REMOVE_DRINK_LOG'; id: string }
  | { type: 'ADD_PANTRY'; item: Omit<PantryItem, 'id' | 'addedAt'> }
  | { type: 'REMOVE_PANTRY'; id: string }
  | { type: 'UPDATE_PANTRY'; id: string; quantityGrams: number }
  | { type: 'ADD_RECIPE'; recipe: Omit<Recipe, 'id' | 'createdAt'> }
  | { type: 'REMOVE_RECIPE'; id: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> };

function buildSeedState(): AppState {
  const today = todayStr();

  const chicken = FOOD_DATABASE.find((f) => f.id === 'chicken-breast')!;
  const oats = FOOD_DATABASE.find((f) => f.id === 'oats')!;
  const milk = FOOD_DATABASE.find((f) => f.id === 'whole-milk')!;
  const banana = FOOD_DATABASE.find((f) => f.id === 'banana')!;

  const oatNutrition = calcNutrition(oats, 80);
  const milkNutrition = calcNutrition(milk, 200);
  const banNutrition = calcNutrition(banana, 120);
  const chickNutrition = calcNutrition(chicken, 150);

  const seedFoodLog: FoodLogEntry[] = [
    {
      id: uid(),
      date: today,
      foodItemId: oats.id,
      foodName: oats.name,
      grams: 80,
      portionLabel: 'cup',
      ...oatNutrition,
      gi: oats.gi,
      timestamp: Date.now() - 6 * 3600_000,
    },
    {
      id: uid(),
      date: today,
      foodItemId: milk.id,
      foodName: milk.name,
      grams: 200,
      portionLabel: '100ml',
      ...milkNutrition,
      gi: milk.gi,
      timestamp: Date.now() - 6 * 3600_000 + 60_000,
    },
    {
      id: uid(),
      date: today,
      foodItemId: banana.id,
      foodName: banana.name,
      grams: 120,
      portionLabel: 'medium banana',
      ...banNutrition,
      gi: banana.gi,
      timestamp: Date.now() - 6 * 3600_000 + 120_000,
    },
    {
      id: uid(),
      date: today,
      foodItemId: chicken.id,
      foodName: chicken.name,
      grams: 150,
      portionLabel: 'small piece',
      ...chickNutrition,
      gi: chicken.gi,
      timestamp: Date.now() - 3 * 3600_000,
    },
  ];

  const offset = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  };

  const seedPantry: PantryItem[] = [
    { id: uid(), foodItemId: 'chicken-breast', foodName: 'Chicken breast (cooked)', quantityGrams: 500, expiryDate: offset(2), addedAt: Date.now() },
    { id: uid(), foodItemId: 'brown-rice', foodName: 'Brown rice (cooked)', quantityGrams: 800, expiryDate: offset(90), addedAt: Date.now() },
    { id: uid(), foodItemId: 'broccoli', foodName: 'Broccoli', quantityGrams: 300, expiryDate: offset(4), addedAt: Date.now() },
    { id: uid(), foodItemId: 'eggs', foodName: 'Eggs (whole)', quantityGrams: 360, expiryDate: offset(14), addedAt: Date.now() },
    { id: uid(), foodItemId: 'oats', foodName: 'Oats (dry)', quantityGrams: 500, expiryDate: offset(180), addedAt: Date.now() },
    { id: uid(), foodItemId: 'whole-milk', foodName: 'Whole milk', quantityGrams: 1000, expiryDate: offset(7), addedAt: Date.now() },
    { id: uid(), foodItemId: 'spinach', foodName: 'Spinach', quantityGrams: 200, expiryDate: offset(1), addedAt: Date.now() },
    { id: uid(), foodItemId: 'banana', foodName: 'Banana', quantityGrams: 360, expiryDate: offset(3), addedAt: Date.now() },
    { id: uid(), foodItemId: 'salmon', foodName: 'Salmon (cooked)', quantityGrams: 400, expiryDate: offset(-1), addedAt: Date.now() },
  ];

  const seedRecipes: Recipe[] = [
    {
      id: uid(),
      name: 'Chicken & Rice Bowl',
      servings: 1,
      ingredients: [
        { foodItemId: 'chicken-breast', foodName: 'Chicken breast (cooked)', grams: 150 },
        { foodItemId: 'brown-rice', foodName: 'Brown rice (cooked)', grams: 196 },
        { foodItemId: 'broccoli', foodName: 'Broccoli', grams: 100 },
      ],
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: 'Oat Breakfast Bowl',
      servings: 1,
      ingredients: [
        { foodItemId: 'oats', foodName: 'Oats (dry)', grams: 80 },
        { foodItemId: 'whole-milk', foodName: 'Whole milk', grams: 200 },
        { foodItemId: 'banana', foodName: 'Banana', grams: 120 },
      ],
      createdAt: Date.now(),
    },
    {
      id: uid(),
      name: 'Salmon & Spinach',
      servings: 1,
      ingredients: [
        { foodItemId: 'salmon', foodName: 'Salmon (cooked)', grams: 180 },
        { foodItemId: 'spinach', foodName: 'Spinach', grams: 90 },
        { foodItemId: 'sweet-potato', foodName: 'Sweet potato (baked)', grams: 150 },
      ],
      createdAt: Date.now(),
    },
  ];

  return {
    foodItems: FOOD_DATABASE,
    foodLog: seedFoodLog,
    drinkLog: [],
    pantry: seedPantry,
    recipes: seedRecipes,
    settings: {
      kcalTarget: 2200,
      proteinTargetG: 160,
      goalMode: 'maintain',
    },
  };
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem('health-app-state');
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    // ignore
  }
  return buildSeedState();
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'ADD_FOOD_LOG':
      return {
        ...state,
        foodLog: [...state.foodLog, { ...action.entry, id: uid(), timestamp: Date.now() }],
      };
    case 'REMOVE_FOOD_LOG':
      return { ...state, foodLog: state.foodLog.filter((e) => e.id !== action.id) };
    case 'ADD_DRINK_LOG':
      return {
        ...state,
        drinkLog: [...state.drinkLog, { ...action.entry, id: uid(), timestamp: Date.now() }],
      };
    case 'REMOVE_DRINK_LOG':
      return { ...state, drinkLog: state.drinkLog.filter((e) => e.id !== action.id) };
    case 'ADD_PANTRY':
      return {
        ...state,
        pantry: [...state.pantry, { ...action.item, id: uid(), addedAt: Date.now() }],
      };
    case 'REMOVE_PANTRY':
      return { ...state, pantry: state.pantry.filter((p) => p.id !== action.id) };
    case 'UPDATE_PANTRY':
      return {
        ...state,
        pantry: state.pantry.map((p) =>
          p.id === action.id ? { ...p, quantityGrams: action.quantityGrams } : p
        ),
      };
    case 'ADD_RECIPE':
      return {
        ...state,
        recipes: [...state.recipes, { ...action.recipe, id: uid(), createdAt: Date.now() }],
      };
    case 'REMOVE_RECIPE':
      return { ...state, recipes: state.recipes.filter((r) => r.id !== action.id) };
    case 'UPDATE_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.settings } };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem('health-app-state', JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

export { calcNutrition, calcStandardDrinks, calcAlcoholKcal };
