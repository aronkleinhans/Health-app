import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { todayStr } from '../utils/date';
import { calcExerciseKcal, sumExerciseLog } from '../utils/nutrition';
import { ExerciseItem, ExerciseIntensity } from '../types';
import { INTENSITY_MET_MULTIPLIER } from '../data/exercises';

const INTENSITY_LABELS: Record<ExerciseIntensity, string> = {
  light: 'Light',
  moderate: 'Moderate',
  intense: 'Intense',
};

export default function Exercise() {
  const { state, dispatch } = useApp();
  const today = todayStr();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<ExerciseItem | null>(null);

  const todayExercise = useMemo(
    () =>
      state.exerciseLog
        .filter((e) => e.date === today)
        .sort((a, b) => a.timestamp - b.timestamp),
    [state.exerciseLog, today]
  );

  const kcalOut = useMemo(() => sumExerciseLog(todayExercise), [todayExercise]);

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return state.exerciseItems.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, state.exerciseItems]);

  const categoryGroups = useMemo(() => {
    if (query.trim()) return null;
    const groups: Record<string, ExerciseItem[]> = {};
    for (const ex of state.exerciseItems) {
      if (!groups[ex.category]) groups[ex.category] = [];
      groups[ex.category].push(ex);
    }
    return groups;
  }, [query, state.exerciseItems]);

  const categoryLabels: Record<string, string> = {
    cardio: 'Cardio',
    strength: 'Strength',
    sports: 'Sports',
    flexibility: 'Flexibility',
  };

  return (
    <>
      {/* Daily burn summary */}
      {kcalOut > 0 && (
        <div className="card">
          <div className="card-title">Today's burn</div>
          <div className="kcal-row">
            <span className="kcal-big" style={{ color: 'var(--positive)' }}>{kcalOut}</span>
            <span className="kcal-label">kcal burned</span>
          </div>
          <div className="text-sm text-muted mt-8">
            {todayExercise.length} session{todayExercise.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-input-wrap">
        <span className="search-icon">⌕</span>
        <input
          type="text"
          placeholder="Search exercises…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Search results */}
      {results.length > 0 && (
        <div className="search-results">
          {results.map((ex) => {
            const est = calcExerciseKcal(ex.met, state.settings.weightKg, 30, 'moderate');
            return (
              <div
                key={ex.id}
                className="search-result-item"
                onClick={() => {
                  setSelected(ex);
                  setQuery('');
                }}
              >
                <div className="search-result-name">{ex.name}</div>
                <div className="search-result-meta">
                  {categoryLabels[ex.category]} · MET {ex.met} · ~{est} kcal/30 min
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Category browse (when not searching) */}
      {!query.trim() && categoryGroups && (
        <>
          {Object.entries(categoryGroups).map(([cat, exercises]) => (
            <div key={cat}>
              <div className="section-label">{categoryLabels[cat]}</div>
              <div className="card" style={{ padding: '4px 14px' }}>
                {exercises.map((ex) => {
                  const est = calcExerciseKcal(ex.met, state.settings.weightKg, 30, 'moderate');
                  return (
                    <div
                      key={ex.id}
                      className="log-entry"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelected(ex)}
                    >
                      <div className="log-entry-info">
                        <div className="log-entry-name">{ex.name}</div>
                        <div className="log-entry-sub">~{est} kcal / 30 min at moderate</div>
                      </div>
                      <span style={{ color: 'var(--muted)', fontSize: 18 }}>›</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Today's log */}
      {todayExercise.length > 0 && (
        <>
          <div className="section-label">Today's log</div>
          <div className="card" style={{ padding: '4px 14px' }}>
            {todayExercise.map((entry) => (
              <div key={entry.id} className="log-entry">
                <div className="log-entry-info">
                  <div className="log-entry-name">{entry.exerciseName}</div>
                  <div className="log-entry-sub">
                    {entry.durationMin} min · {INTENSITY_LABELS[entry.intensity]}
                  </div>
                </div>
                <div className="log-entry-kcal" style={{ color: 'var(--positive)' }}>
                  -{entry.kcalBurned} kcal
                </div>
                <button
                  className="btn-remove"
                  onClick={() => dispatch({ type: 'REMOVE_EXERCISE_LOG', id: entry.id })}
                  title="Remove"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {selected && (
        <ExerciseSheet
          exercise={selected}
          weightKg={state.settings.weightKg}
          onLog={(durationMin, intensity, kcalBurned) => {
            dispatch({
              type: 'ADD_EXERCISE_LOG',
              entry: {
                date: today,
                exerciseId: selected.id,
                exerciseName: selected.name,
                durationMin,
                intensity,
                kcalBurned,
              },
            });
            setSelected(null);
          }}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}

function ExerciseSheet({
  exercise,
  weightKg,
  onLog,
  onClose,
}: {
  exercise: ExerciseItem;
  weightKg: number;
  onLog: (durationMin: number, intensity: ExerciseIntensity, kcalBurned: number) => void;
  onClose: () => void;
}) {
  const [duration, setDuration] = useState('30');
  const [intensity, setIntensity] = useState<ExerciseIntensity>('moderate');

  const kcal = useMemo(() => {
    const d = parseInt(duration) || 0;
    return d > 0 ? calcExerciseKcal(exercise.met, weightKg, d, intensity) : 0;
  }, [exercise.met, weightKg, duration, intensity]);

  const intensities = Object.keys(INTENSITY_MET_MULTIPLIER) as ExerciseIntensity[];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-title">{exercise.name}</div>

        <div className="form-group">
          <label className="form-label">Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            min={1}
            onChange={(e) => setDuration(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Intensity</label>
          <div className="portion-options">
            {intensities.map((i) => (
              <button
                key={i}
                className={`portion-chip ${intensity === i ? 'selected' : ''}`}
                onClick={() => setIntensity(i)}
              >
                {INTENSITY_LABELS[i]}
              </button>
            ))}
          </div>
        </div>

        {kcal > 0 && (
          <div className="nutrition-preview" style={{ marginBottom: 14 }}>
            <div>
              <span>Est. burn </span>
              <strong style={{ color: 'var(--positive)' }}>{kcal} kcal</strong>
            </div>
            <div>
              <span>MET </span>
              <strong>{(exercise.met * (INTENSITY_MET_MULTIPLIER[intensity] ?? 1)).toFixed(1)}</strong>
            </div>
            <div>
              <span>Based on </span>
              <strong>{weightKg}kg</strong>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            style={{ flex: 1 }}
            disabled={kcal <= 0}
            onClick={() => onLog(parseInt(duration), intensity, kcal)}
          >
            Log
          </button>
        </div>
      </div>
    </div>
  );
}
