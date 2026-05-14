import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { pantryMatchPercent } from '../utils/flags';
import { calcNutrition, sumFoodLog } from '../utils/nutrition';
import { Recipe, RecipeIngredient } from '../types';
import { FoodLogEntry } from '../types';

export default function Recipes() {
  const { state, dispatch } = useApp();
  const [showCreate, setShowCreate] = useState(false);
  const [selected, setSelected] = useState<Recipe | null>(null);

  const recipesWithMatch = useMemo(() => {
    return state.recipes
      .map((r) => ({
        recipe: r,
        match: pantryMatchPercent(r.ingredients, state.pantry),
      }))
      .sort((a, b) => b.match - a.match);
  }, [state.recipes, state.pantry]);

  const tiers = useMemo(() => {
    const full = recipesWithMatch.filter((r) => r.match === 100);
    const partial = recipesWithMatch.filter((r) => r.match >= 50 && r.match < 100);
    const low = recipesWithMatch.filter((r) => r.match < 50);
    return { full, partial, low };
  }, [recipesWithMatch]);

  if (selected) {
    return (
      <RecipeDetail
        recipe={selected}
        pantry={state.pantry}
        onBack={() => setSelected(null)}
        onDelete={() => {
          dispatch({ type: 'REMOVE_RECIPE', id: selected.id });
          setSelected(null);
        }}
      />
    );
  }

  if (showCreate) {
    return (
      <CreateRecipe
        foodItems={state.foodItems}
        onSave={(recipe) => {
          dispatch({ type: 'ADD_RECIPE', recipe });
          setShowCreate(false);
        }}
        onCancel={() => setShowCreate(false)}
      />
    );
  }

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{state.recipes.length} recipes</span>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          + New recipe
        </button>
      </div>

      {state.recipes.length === 0 && (
        <div className="empty">No recipes yet. Create one above.</div>
      )}

      {tiers.full.length > 0 && (
        <>
          <div className="section-label">Make it now</div>
          {tiers.full.map(({ recipe, match }) => (
            <RecipeCard key={recipe.id} recipe={recipe} match={match} onClick={() => setSelected(recipe)} pantry={state.pantry} />
          ))}
        </>
      )}

      {tiers.partial.length > 0 && (
        <>
          <div className="section-label">Almost there</div>
          {tiers.partial.map(({ recipe, match }) => (
            <RecipeCard key={recipe.id} recipe={recipe} match={match} onClick={() => setSelected(recipe)} pantry={state.pantry} />
          ))}
        </>
      )}

      {tiers.low.length > 0 && (
        <>
          <div className="section-label">Not this week</div>
          {tiers.low.map(({ recipe, match }) => (
            <RecipeCard key={recipe.id} recipe={recipe} match={match} onClick={() => setSelected(recipe)} pantry={state.pantry} />
          ))}
        </>
      )}
    </>
  );
}

function RecipeCard({
  recipe,
  match,
  onClick,
  pantry,
}: {
  recipe: Recipe;
  match: number;
  onClick: () => void;
  pantry: ReturnType<typeof useApp>['state']['pantry'];
}) {
  const badgeClass = match === 100 ? 'match-full' : match >= 50 ? 'match-partial' : 'match-low';

  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-header">
        <span className="recipe-name">{recipe.name}</span>
        <span className={`match-badge ${badgeClass}`}>{match}%</span>
      </div>
      <ul className="ingredient-list">
        {recipe.ingredients.map((ing) => {
          const inStock = pantry.some(
            (p) => p.foodItemId === ing.foodItemId && p.quantityGrams >= ing.grams
          );
          return (
            <li key={ing.foodItemId} className={inStock ? 'available' : ''}>
              {inStock ? '✓' : '✗'} {ing.foodName} — {ing.grams}g
              {!inStock && <span className="text-muted"> (missing)</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function RecipeDetail({
  recipe,
  pantry,
  onBack,
  onDelete,
}: {
  recipe: Recipe;
  pantry: ReturnType<typeof useApp>['state']['pantry'];
  onBack: () => void;
  onDelete: () => void;
}) {
  const { state, dispatch } = useApp();

  const nutrition = useMemo(() => {
    const pseudoEntries: Partial<FoodLogEntry>[] = recipe.ingredients.map((ing) => {
      const food = state.foodItems.find((f) => f.id === ing.foodItemId);
      if (!food) return { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
      return calcNutrition(food, ing.grams);
    });
    return sumFoodLog(pseudoEntries as FoodLogEntry[]);
  }, [recipe, state.foodItems]);

  const match = pantryMatchPercent(recipe.ingredients, pantry);

  function logRecipe() {
    const today = new Date().toISOString().slice(0, 10);
    recipe.ingredients.forEach((ing) => {
      const food = state.foodItems.find((f) => f.id === ing.foodItemId);
      if (!food) return;
      const n = calcNutrition(food, ing.grams);
      dispatch({
        type: 'ADD_FOOD_LOG',
        entry: {
          date: today,
          foodItemId: food.id,
          foodName: food.name,
          grams: ing.grams,
          portionLabel: `${recipe.name}`,
          gi: food.gi,
          ...n,
        },
      });
    });
    onBack();
  }

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <button className="btn btn-secondary" onClick={onBack}>← Back</button>
        <button className="btn btn-danger" onClick={onDelete}>Delete</button>
      </div>

      <div className="card">
        <div className="flex-between">
          <div style={{ fontSize: 18, fontWeight: 600 }}>{recipe.name}</div>
          <span className={`match-badge ${match === 100 ? 'match-full' : match >= 50 ? 'match-partial' : 'match-low'}`}>
            {match}% match
          </span>
        </div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
        </div>

        <div className="divider" />

        <div className="macro-row">
          <div className="macro-item">
            <div className="macro-label">Kcal</div>
            <span className="macro-value">{nutrition.kcal}</span>
          </div>
          <div className="macro-item">
            <div className="macro-label">Protein</div>
            <span className="macro-value">{Math.round(nutrition.protein)}</span>
            <span className="macro-unit">g</span>
          </div>
          <div className="macro-item">
            <div className="macro-label">Carbs</div>
            <span className="macro-value">{Math.round(nutrition.carbs)}</span>
            <span className="macro-unit">g</span>
          </div>
          <div className="macro-item">
            <div className="macro-label">Fat</div>
            <span className="macro-value">{Math.round(nutrition.fat)}</span>
            <span className="macro-unit">g</span>
          </div>
        </div>

        <div className="divider" />

        <div className="card-title">Ingredients</div>
        <ul className="ingredient-list" style={{ fontSize: 14 }}>
          {recipe.ingredients.map((ing) => {
            const inStock = pantry.some(
              (p) => p.foodItemId === ing.foodItemId && p.quantityGrams >= ing.grams
            );
            return (
              <li key={ing.foodItemId} className={inStock ? 'available' : ''} style={{ marginBottom: 6 }}>
                <span style={{ color: inStock ? 'var(--positive)' : 'var(--critical)', marginRight: 6 }}>
                  {inStock ? '✓' : '✗'}
                </span>
                {ing.foodName} — {ing.grams}g
                {!inStock && (
                  <span className="text-muted text-sm" style={{ marginLeft: 6 }}>
                    missing from pantry
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </div>

      <button
        className="btn btn-primary btn-block"
        disabled={match < 100}
        onClick={logRecipe}
        title={match < 100 ? 'Missing ingredients' : 'Log all ingredients to food log'}
      >
        {match === 100 ? 'Log this meal' : `Missing ${recipe.ingredients.filter(
          (ing) => !pantry.some((p) => p.foodItemId === ing.foodItemId && p.quantityGrams >= ing.grams)
        ).length} ingredient(s)`}
      </button>
    </>
  );
}

function CreateRecipe({
  foodItems,
  onSave,
  onCancel,
}: {
  foodItems: ReturnType<typeof useApp>['state']['foodItems'];
  onSave: (r: Omit<Recipe, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [servings, setServings] = useState(1);
  const [ingredients, setIngredients] = useState<RecipeIngredient[]>([]);
  const [query, setQuery] = useState('');
  const [ingGrams, setIngGrams] = useState('');
  const [selectedFoodId, setSelectedFoodId] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return foodItems.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query, foodItems]);

  function addIngredient() {
    const food = foodItems.find((f) => f.id === selectedFoodId);
    if (!food || !ingGrams) return;
    const grams = parseFloat(ingGrams);
    if (!grams) return;
    setIngredients((prev) => [
      ...prev.filter((i) => i.foodItemId !== food.id),
      { foodItemId: food.id, foodName: food.name, grams },
    ]);
    setQuery('');
    setIngGrams('');
    setSelectedFoodId('');
  }

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <span style={{ fontWeight: 600 }}>New recipe</span>
        <button
          className="btn btn-primary"
          disabled={!name.trim() || ingredients.length === 0}
          onClick={() => onSave({ name: name.trim(), servings, ingredients })}
        >
          Save
        </button>
      </div>

      <div className="card">
        <div className="form-group">
          <label className="form-label">Recipe name</label>
          <input
            type="text"
            placeholder="e.g. Chicken stir-fry"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label className="form-label">Servings</label>
          <input
            type="number"
            min={1}
            value={servings}
            onChange={(e) => setServings(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="card">
        <div className="card-title">Ingredients</div>
        {ingredients.map((ing) => (
          <div key={ing.foodItemId} className="log-entry">
            <div className="log-entry-info">
              <div className="log-entry-name">{ing.foodName}</div>
              <div className="log-entry-sub">{ing.grams}g</div>
            </div>
            <button
              className="btn-remove"
              onClick={() => setIngredients((prev) => prev.filter((i) => i.foodItemId !== ing.foodItemId))}
            >
              ×
            </button>
          </div>
        ))}

        <div className="divider" />

        <div className="form-group">
          <label className="form-label">Add ingredient</label>
          <input
            type="text"
            placeholder="Search food…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedFoodId('');
            }}
          />
          {query && !selectedFoodId && results.length > 0 && (
            <div className="search-results" style={{ marginTop: 4 }}>
              {results.map((f) => (
                <div
                  key={f.id}
                  className="search-result-item"
                  onClick={() => {
                    setSelectedFoodId(f.id);
                    setQuery(f.name);
                  }}
                >
                  {f.name}
                </div>
              ))}
            </div>
          )}
        </div>
        {selectedFoodId && (
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Grams</label>
              <input
                type="number"
                placeholder="100"
                value={ingGrams}
                onChange={(e) => setIngGrams(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', paddingBottom: 12 }}>
              <button
                className="btn btn-secondary"
                disabled={!ingGrams}
                onClick={addIngredient}
              >
                Add
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
