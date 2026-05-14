import { useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { todayStr } from '../utils/date';
import { sumFoodLog, sumDrinkLog, calcGlycemicLoad } from '../utils/nutrition';
import { computeFlags } from '../utils/flags';

export default function Dashboard() {
  const { state } = useApp();
  const today = todayStr();

  const todayFood = useMemo(
    () => state.foodLog.filter((e) => e.date === today),
    [state.foodLog, today]
  );
  const todayDrinks = useMemo(
    () => state.drinkLog.filter((e) => e.date === today),
    [state.drinkLog, today]
  );

  const foodTotals = useMemo(() => sumFoodLog(todayFood), [todayFood]);
  const drinkSummary = useMemo(() => sumDrinkLog(todayDrinks), [todayDrinks]);
  const gl = useMemo(() => calcGlycemicLoad(todayFood), [todayFood]);

  const flags = useMemo(
    () =>
      computeFlags(
        { kcal: foodTotals.kcal, protein: foodTotals.protein },
        todayFood,
        drinkSummary,
        state.pantry,
        state.settings
      ),
    [foodTotals, todayFood, drinkSummary, state.pantry, state.settings]
  );

  const { kcalTarget, proteinTargetG } = state.settings;
  const kcalPct = Math.min((foodTotals.kcal / kcalTarget) * 100, 100);
  const surplus = foodTotals.kcal - kcalTarget;
  const totalKcal = foodTotals.kcal + drinkSummary.kcal;
  const totalCarbs = foodTotals.carbs;
  const totalFat = foodTotals.fat;
  const totalFiber = foodTotals.fiber;

  return (
    <>
      {/* Kcal summary */}
      <div className="card">
        <div className="card-title">Today's snapshot</div>
        <div className="kcal-row">
          <span className="kcal-big">{totalKcal}</span>
          <span className="kcal-label">kcal</span>
          <span className="kcal-target">
            {surplus > 0 ? '+' : ''}{surplus} vs {kcalTarget} target
          </span>
        </div>
        <div className="progress-bar mt-8">
          <div
            className="progress-fill"
            style={{
              width: `${kcalPct}%`,
              background: kcalPct > 110 ? 'var(--warn)' : 'var(--accent)',
            }}
          />
        </div>

        <div className="macro-row">
          <div className="macro-item">
            <div className="macro-label">Protein</div>
            <div>
              <span className="macro-value">{Math.round(foodTotals.protein)}</span>
              <span className="macro-unit">g / {proteinTargetG}g</span>
            </div>
            <div className="progress-bar" style={{ marginTop: 4 }}>
              <div
                className="progress-fill"
                style={{
                  width: `${Math.min((foodTotals.protein / proteinTargetG) * 100, 100)}%`,
                  background: 'var(--positive)',
                }}
              />
            </div>
          </div>
          <div className="macro-item">
            <div className="macro-label">Carbs</div>
            <div>
              <span className="macro-value">{Math.round(totalCarbs)}</span>
              <span className="macro-unit">g</span>
            </div>
          </div>
          <div className="macro-item">
            <div className="macro-label">Fat</div>
            <div>
              <span className="macro-value">{Math.round(totalFat)}</span>
              <span className="macro-unit">g</span>
            </div>
          </div>
          <div className="macro-item">
            <div className="macro-label">Fiber</div>
            <div>
              <span className="macro-value">{Math.round(totalFiber)}</span>
              <span className="macro-unit">g</span>
            </div>
          </div>
        </div>
      </div>

      {/* GI & Alcohol row */}
      <div className="card">
        <div className="card-title">Metabolic</div>
        <div style={{ display: 'flex', gap: 24 }}>
          <div>
            <div className="macro-label">Glycemic load</div>
            <div>
              <span className="macro-value" style={{ color: gl > 120 ? 'var(--warn)' : gl > 80 ? 'var(--info)' : 'var(--text)' }}>
                {gl}
              </span>
              <span className="macro-unit"> GL</span>
            </div>
          </div>
          {drinkSummary.standardDrinks > 0 && (
            <div>
              <div className="macro-label">Alcohol units</div>
              <div>
                <span className="macro-value" style={{ color: 'var(--warn)' }}>
                  {drinkSummary.standardDrinks}
                </span>
                <span className="macro-unit"> units</span>
              </div>
              <div className="text-sm text-muted" style={{ marginTop: 2 }}>
                ~{drinkSummary.metabolicWindowHours}h clearance
              </div>
            </div>
          )}
          {drinkSummary.standardDrinks === 0 && (
            <div>
              <div className="macro-label">Alcohol</div>
              <div className="macro-value text-muted" style={{ fontSize: 14 }}>None logged</div>
            </div>
          )}
          <div>
            <div className="macro-label">Drink kcal</div>
            <div>
              <span className="macro-value">{drinkSummary.kcal}</span>
              <span className="macro-unit"> kcal</span>
            </div>
          </div>
        </div>
      </div>

      {/* Flags */}
      {flags.length > 0 && (
        <div>
          <div className="section-label">Flags</div>
          {flags.map((flag) => (
            <div key={flag.id} className={`flag ${flag.severity}`}>
              <div className="flag-label">{flag.label}</div>
              <div className="flag-detail">{flag.detail}</div>
              {flag.sensitive && (
                <div className="flag-sensitive">Consider discussing with your healthcare provider.</div>
              )}
            </div>
          ))}
        </div>
      )}

      {flags.length === 0 && foodTotals.kcal === 0 && (
        <div className="card">
          <div className="empty">No food logged yet today.</div>
        </div>
      )}

      {flags.length === 0 && foodTotals.kcal > 0 && (
        <div className="flag info">
          <div className="flag-label">No flags</div>
          <div className="flag-detail">Nothing to surface today.</div>
        </div>
      )}

      {/* Settings strip */}
      <div className="card">
        <div className="card-title">Goals</div>
        <div className="settings-row">
          <label>Mode</label>
          <GoalModeToggle />
        </div>
        <div className="settings-row">
          <label>Kcal target</label>
          <KcalInput />
        </div>
        <div className="settings-row">
          <label>Protein target</label>
          <ProteinInput />
        </div>
      </div>
    </>
  );
}

function GoalModeToggle() {
  const { state, dispatch } = useApp();
  const modes = ['lose', 'maintain', 'gain'] as const;
  return (
    <div className="goal-chips">
      {modes.map((m) => (
        <button
          key={m}
          className={`goal-chip ${state.settings.goalMode === m ? 'active' : ''}`}
          onClick={() => dispatch({ type: 'UPDATE_SETTINGS', settings: { goalMode: m } })}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function KcalInput() {
  const { state, dispatch } = useApp();
  return (
    <input
      type="number"
      value={state.settings.kcalTarget}
      style={{ width: 90, textAlign: 'right' }}
      onChange={(e) =>
        dispatch({
          type: 'UPDATE_SETTINGS',
          settings: { kcalTarget: Math.max(500, parseInt(e.target.value) || 0) },
        })
      }
    />
  );
}

function ProteinInput() {
  const { state, dispatch } = useApp();
  return (
    <input
      type="number"
      value={state.settings.proteinTargetG}
      style={{ width: 90, textAlign: 'right' }}
      onChange={(e) =>
        dispatch({
          type: 'UPDATE_SETTINGS',
          settings: { proteinTargetG: Math.max(10, parseInt(e.target.value) || 0) },
        })
      }
    />
  );
}
