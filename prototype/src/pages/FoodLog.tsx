import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { todayStr } from '../utils/date';
import { calcNutrition, sumFoodLog } from '../utils/nutrition';
import { FoodItem, PortionDef } from '../types';

export default function FoodLog() {
  const { state, dispatch } = useApp();
  const today = todayStr();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodItem | null>(null);

  const todayFood = useMemo(
    () =>
      state.foodLog
        .filter((e) => e.date === today)
        .sort((a, b) => a.timestamp - b.timestamp),
    [state.foodLog, today]
  );

  const totals = useMemo(() => sumFoodLog(todayFood), [todayFood]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.foodItems.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, state.foodItems]);

  return (
    <>
      {/* Search */}
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search foods…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {results.length > 0 && (
        <div className="search-results">
          {results.map((food) => (
            <div
              key={food.id}
              className="search-result-item"
              onClick={() => {
                setSelected(food);
                setQuery('');
              }}
            >
              <div className="search-result-name">{food.name}</div>
              <div className="search-result-meta">
                {food.kcalPer100g} kcal · P {food.proteinPer100g}g · C {food.carbsPer100g}g · F {food.fatPer100g}g per 100g
                {food.gi !== null ? ` · GI ${food.gi}` : ''}
              </div>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <PortionSheet
          food={selected}
          onLog={(grams, portionLabel) => {
            const n = calcNutrition(selected, grams);
            dispatch({
              type: 'ADD_FOOD_LOG',
              entry: {
                date: today,
                foodItemId: selected.id,
                foodName: selected.name,
                grams,
                portionLabel,
                gi: selected.gi,
                ...n,
              },
            });
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}

      {/* Today's log */}
      <div className="section-label">Today's log</div>

      {todayFood.length === 0 && (
        <div className="empty">No food logged yet. Search above to add.</div>
      )}

      <div className="card" style={{ padding: '4px 14px' }}>
        {todayFood.map((entry) => (
          <div key={entry.id} className="log-entry">
            <div className="log-entry-info">
              <div className="log-entry-name">{entry.foodName}</div>
              <div className="log-entry-sub">
                {entry.portionLabel} · {entry.grams}g · P {entry.protein}g · C {entry.carbs}g · F {entry.fat}g
                {entry.gi !== null ? ` · GI ${entry.gi}` : ''}
              </div>
            </div>
            <div className="log-entry-kcal">{entry.kcal} kcal</div>
            <button
              className="btn-remove"
              onClick={() => dispatch({ type: 'REMOVE_FOOD_LOG', id: entry.id })}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Totals */}
      {todayFood.length > 0 && (
        <div className="card">
          <div className="card-title">Totals</div>
          <div className="macro-row">
            <div className="macro-item">
              <div className="macro-label">Kcal</div>
              <span className="macro-value">{totals.kcal}</span>
            </div>
            <div className="macro-item">
              <div className="macro-label">Protein</div>
              <span className="macro-value">{Math.round(totals.protein)}</span>
              <span className="macro-unit">g</span>
            </div>
            <div className="macro-item">
              <div className="macro-label">Carbs</div>
              <span className="macro-value">{Math.round(totals.carbs)}</span>
              <span className="macro-unit">g</span>
            </div>
            <div className="macro-item">
              <div className="macro-label">Fat</div>
              <span className="macro-value">{Math.round(totals.fat)}</span>
              <span className="macro-unit">g</span>
            </div>
            <div className="macro-item">
              <div className="macro-label">Fiber</div>
              <span className="macro-value">{Math.round(totals.fiber)}</span>
              <span className="macro-unit">g</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface PortionSheetProps {
  food: FoodItem;
  onLog: (grams: number, label: string) => void;
  onClose: () => void;
}

function PortionSheet({ food, onLog, onClose }: PortionSheetProps) {
  const [selectedPortion, setSelectedPortion] = useState<PortionDef | null>(
    food.defaultPortions[0] ?? null
  );
  const [customGrams, setCustomGrams] = useState('');
  const [qty, setQty] = useState(1);

  const effectiveGrams = useMemo(() => {
    if (customGrams) return parseFloat(customGrams) || 0;
    return (selectedPortion?.grams ?? 0) * qty;
  }, [selectedPortion, qty, customGrams]);

  const preview = useMemo(
    () => (effectiveGrams > 0 ? calcNutrition(food, effectiveGrams) : null),
    [food, effectiveGrams]
  );

  const portionLabel = customGrams
    ? `${customGrams}g`
    : `${qty > 1 ? `${qty}× ` : ''}${selectedPortion?.label ?? ''}`;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{food.name}</div>

        <div className="form-label">Portion</div>
        <div className="portion-options">
          {food.defaultPortions.map((p) => (
            <button
              key={p.label}
              className={`portion-chip ${selectedPortion?.label === p.label && !customGrams ? 'selected' : ''}`}
              onClick={() => {
                setSelectedPortion(p);
                setCustomGrams('');
              }}
            >
              {p.label} ({p.grams}g)
            </button>
          ))}
        </div>

        {selectedPortion && !customGrams && (
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              value={qty}
              min={0.5}
              step={0.5}
              onChange={(e) => setQty(Math.max(0.5, parseFloat(e.target.value) || 1))}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Or enter grams directly</label>
          <input
            type="number"
            placeholder="e.g. 175"
            value={customGrams}
            onChange={(e) => {
              setCustomGrams(e.target.value);
              if (e.target.value) setSelectedPortion(null);
            }}
          />
        </div>

        {preview && (
          <div className="nutrition-preview">
            <div><span>Kcal </span><strong>{preview.kcal}</strong></div>
            <div><span>P </span><strong>{preview.protein}g</strong></div>
            <div><span>C </span><strong>{preview.carbs}g</strong></div>
            <div><span>F </span><strong>{preview.fat}g</strong></div>
            {food.gi !== null && <div><span>GI </span><strong>{food.gi}</strong></div>}
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={!preview || effectiveGrams <= 0}
            onClick={() => onLog(Math.round(effectiveGrams), portionLabel)}
          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}
