import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { todayStr } from '../utils/date';
import { sumDrinkLog, calcStandardDrinks, calcAlcoholKcal } from '../utils/nutrition';
import { DRINK_PRESETS } from '../data/foods';
import { DrinkType } from '../types';

export default function DrinkLog() {
  const { state, dispatch } = useApp();
  const today = todayStr();
  const [showCustom, setShowCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customType, setCustomType] = useState<DrinkType>('beer');
  const [customVol, setCustomVol] = useState('');
  const [customAbv, setCustomAbv] = useState('');

  const todayDrinks = useMemo(
    () => state.drinkLog.filter((e) => e.date === today).sort((a, b) => a.timestamp - b.timestamp),
    [state.drinkLog, today]
  );
  const summary = useMemo(() => sumDrinkLog(todayDrinks), [todayDrinks]);

  function logPreset(preset: (typeof DRINK_PRESETS)[number]) {
    const units = calcStandardDrinks(preset.volumeMl, preset.abvPercent);
    const kcal = calcAlcoholKcal(preset.volumeMl, preset.abvPercent);
    dispatch({
      type: 'ADD_DRINK_LOG',
      entry: {
        date: today,
        name: preset.name,
        drinkType: preset.drinkType,
        volumeMl: preset.volumeMl,
        abvPercent: preset.abvPercent,
        kcal,
        standardDrinks: units,
      },
    });
  }

  function logCustom() {
    const vol = parseFloat(customVol);
    const abv = parseFloat(customAbv);
    if (!vol || !abv || !customName.trim()) return;
    const units = calcStandardDrinks(vol, abv);
    const kcal = calcAlcoholKcal(vol, abv);
    dispatch({
      type: 'ADD_DRINK_LOG',
      entry: {
        date: today,
        name: customName.trim(),
        drinkType: customType,
        volumeMl: vol,
        abvPercent: abv,
        kcal,
        standardDrinks: units,
      },
    });
    setCustomName('');
    setCustomVol('');
    setCustomAbv('');
    setShowCustom(false);
  }

  const typeGroups: { label: string; type: DrinkType }[] = [
    { label: 'Beer', type: 'beer' },
    { label: 'Wine', type: 'wine' },
    { label: 'Spirits', type: 'spirits' },
    { label: 'Cocktail', type: 'cocktail' },
  ];

  return (
    <>
      {/* Quick-add presets */}
      <div className="card">
        <div className="card-title">Quick add</div>
        {typeGroups.map(({ label, type }) => {
          const presets = DRINK_PRESETS.filter((p) => p.drinkType === type);
          return (
            <div key={type} style={{ marginBottom: 12 }}>
              <div className="section-label" style={{ margin: '0 0 6px' }}>{label}</div>
              <div className="drink-presets">
                {presets.map((p) => {
                  const units = calcStandardDrinks(p.volumeMl, p.abvPercent);
                  const kcal = calcAlcoholKcal(p.volumeMl, p.abvPercent);
                  return (
                    <button
                      key={p.name}
                      className="drink-chip"
                      onClick={() => logPreset(p)}
                      title={`${units} units · ${kcal} kcal`}
                    >
                      {p.name.replace(/^[A-Za-z]+ – /, '')}
                      <span className="text-muted" style={{ marginLeft: 4 }}>
                        {units}u
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
        <button
          className="btn btn-secondary"
          style={{ marginTop: 4 }}
          onClick={() => setShowCustom((v) => !v)}
        >
          {showCustom ? 'Hide custom' : '+ Custom drink'}
        </button>

        {showCustom && (
          <div style={{ marginTop: 12 }}>
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                placeholder="e.g. Guinness"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Type</label>
                <select value={customType} onChange={(e) => setCustomType(e.target.value as DrinkType)}>
                  <option value="beer">Beer</option>
                  <option value="wine">Wine</option>
                  <option value="spirits">Spirits</option>
                  <option value="cocktail">Cocktail</option>
                </select>
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Volume (ml)</label>
                <input
                  type="number"
                  placeholder="330"
                  value={customVol}
                  onChange={(e) => setCustomVol(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">ABV %</label>
                <input
                  type="number"
                  placeholder="5"
                  step="0.1"
                  value={customAbv}
                  onChange={(e) => setCustomAbv(e.target.value)}
                />
              </div>
            </div>
            {customVol && customAbv && (
              <div className="nutrition-preview" style={{ marginBottom: 10 }}>
                <div>
                  <span>Units </span>
                  <strong>{calcStandardDrinks(parseFloat(customVol) || 0, parseFloat(customAbv) || 0)}</strong>
                </div>
                <div>
                  <span>Kcal </span>
                  <strong>{calcAlcoholKcal(parseFloat(customVol) || 0, parseFloat(customAbv) || 0)}</strong>
                </div>
              </div>
            )}
            <button
              className="btn btn-primary btn-block"
              disabled={!customName.trim() || !customVol || !customAbv}
              onClick={logCustom}
            >
              Log drink
            </button>
          </div>
        )}
      </div>

      {/* Metabolic impact */}
      {summary.standardDrinks > 0 && (
        <div className="card">
          <div className="card-title">Metabolic impact</div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
            <div>
              <div className="macro-label">Total units</div>
              <span className="macro-value" style={{ color: 'var(--warn)' }}>
                {summary.standardDrinks}
              </span>
              <span className="macro-unit"> (UK)</span>
            </div>
            <div>
              <div className="macro-label">Kcal from alcohol</div>
              <span className="macro-value">{summary.kcal}</span>
            </div>
            <div>
              <div className="macro-label">Est. clearance</div>
              <span className="macro-value">{summary.metabolicWindowHours}</span>
              <span className="macro-unit">h</span>
            </div>
          </div>
          <div className="impact-row">
            <span className="impact-badge active">Fat oxidation halted</span>
            <span className="impact-badge active">Gluconeogenesis suppressed</span>
            {summary.bgCrashRisk && (
              <span className="impact-badge active">BG crash risk</span>
            )}
          </div>
          {summary.standardDrinks > 4 && (
            <div style={{ marginTop: 10, fontSize: 13, color: 'var(--warn)' }}>
              Next-day recovery capacity reduced.
            </div>
          )}
        </div>
      )}

      {/* Today's log */}
      <div className="section-label">Today's drinks</div>
      {todayDrinks.length === 0 && (
        <div className="empty">No drinks logged today.</div>
      )}
      <div className="card" style={{ padding: '4px 14px' }}>
        {todayDrinks.map((entry) => (
          <div key={entry.id} className="log-entry">
            <div className="log-entry-info">
              <div className="log-entry-name">{entry.name}</div>
              <div className="log-entry-sub">
                {entry.volumeMl}ml · {entry.abvPercent}% ABV · {entry.standardDrinks} units
              </div>
            </div>
            <div className="log-entry-kcal">{entry.kcal} kcal</div>
            <button
              className="btn-remove"
              onClick={() => dispatch({ type: 'REMOVE_DRINK_LOG', id: entry.id })}
              title="Remove"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
