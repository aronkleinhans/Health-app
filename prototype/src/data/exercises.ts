import { ExerciseItem } from '../types';

export const EXERCISE_DATABASE: ExerciseItem[] = [
  // Cardio
  { id: 'walk-slow',        name: 'Walking (slow)',          category: 'cardio',      met: 2.8 },
  { id: 'walk-moderate',    name: 'Walking (moderate)',      category: 'cardio',      met: 3.5 },
  { id: 'walk-brisk',       name: 'Walking (brisk)',         category: 'cardio',      met: 5.0 },
  { id: 'run-5mph',         name: 'Running (5 mph)',         category: 'cardio',      met: 8.3 },
  { id: 'run-6mph',         name: 'Running (6 mph)',         category: 'cardio',      met: 9.8 },
  { id: 'run-8mph',         name: 'Running (8 mph)',         category: 'cardio',      met: 11.8 },
  { id: 'cycle-leisure',    name: 'Cycling (leisure)',       category: 'cardio',      met: 4.0 },
  { id: 'cycle-moderate',   name: 'Cycling (moderate)',      category: 'cardio',      met: 8.0 },
  { id: 'cycle-vigorous',   name: 'Cycling (vigorous)',      category: 'cardio',      met: 12.0 },
  { id: 'swim-moderate',    name: 'Swimming (moderate)',     category: 'cardio',      met: 6.0 },
  { id: 'swim-vigorous',    name: 'Swimming (vigorous)',     category: 'cardio',      met: 9.8 },
  { id: 'elliptical',       name: 'Elliptical',              category: 'cardio',      met: 5.0 },
  { id: 'rowing-moderate',  name: 'Rowing (moderate)',       category: 'cardio',      met: 7.0 },
  { id: 'rowing-vigorous',  name: 'Rowing (vigorous)',       category: 'cardio',      met: 12.0 },
  { id: 'jump-rope',        name: 'Jump rope',               category: 'cardio',      met: 10.0 },
  { id: 'hiit',             name: 'HIIT',                    category: 'cardio',      met: 10.0 },
  { id: 'stair-climbing',   name: 'Stair climbing',          category: 'cardio',      met: 9.0 },
  // Strength
  { id: 'weights-light',    name: 'Weight training (light)', category: 'strength',    met: 3.5 },
  { id: 'weights-moderate', name: 'Weight training (moderate)', category: 'strength', met: 5.0 },
  { id: 'weights-heavy',    name: 'Weight training (heavy)', category: 'strength',    met: 6.0 },
  { id: 'circuit',          name: 'Circuit training',        category: 'strength',    met: 8.0 },
  { id: 'bodyweight',       name: 'Bodyweight training',     category: 'strength',    met: 4.0 },
  { id: 'crossfit',         name: 'CrossFit',                category: 'strength',    met: 9.0 },
  // Sports
  { id: 'football',         name: 'Football / Soccer',       category: 'sports',      met: 7.0 },
  { id: 'basketball',       name: 'Basketball',              category: 'sports',      met: 6.5 },
  { id: 'tennis',           name: 'Tennis',                  category: 'sports',      met: 7.3 },
  { id: 'squash',           name: 'Squash',                  category: 'sports',      met: 12.0 },
  { id: 'badminton',        name: 'Badminton',               category: 'sports',      met: 5.5 },
  { id: 'rugby',            name: 'Rugby',                   category: 'sports',      met: 8.3 },
  { id: 'golf',             name: 'Golf (walking)',          category: 'sports',      met: 4.3 },
  // Flexibility
  { id: 'yoga',             name: 'Yoga',                    category: 'flexibility', met: 2.5 },
  { id: 'pilates',          name: 'Pilates',                 category: 'flexibility', met: 3.0 },
  { id: 'stretching',       name: 'Stretching',              category: 'flexibility', met: 2.3 },
];

export const INTENSITY_MET_MULTIPLIER: Record<string, number> = {
  light: 0.75,
  moderate: 1.0,
  intense: 1.3,
};
