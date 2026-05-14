import { useState, useMemo } from 'react';
import { useApp } from '../store/AppContext';
import { daysUntil } from '../utils/date';

export default function Pantry() {
  const { state, dispatch } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [foodId, setFoodId] = useState('');
  const [qty, setQty] = useState('');
  const [expiry, setExpiry] = useState('');
  const [query, setQuery] = useState('');

  const sorted = useMemo(() => {
    return [...state.pantry].sort((a, b) => {
      const da = a.expiryDate ? daysUntil(a.expiryDate) : 9999;
      const db = b.expiryDate ? daysUntil(b.expiryDate) : 9999;
      return da - db;
    });
  }, [state.pantry]);

  const filteredFoods = useMemo(() => {
    const q = query.toLowerCase();
    return state.foodItems.filter((f) => f.name.toLowerCase().includes(q)).slice(0, 8);
  }, [query, state.foodItems]);

  function addItem() {
    const food = state.foodItems.find((f) => f.id === foodId);
    if (!food || !qty) return;
    dispatch({
      type: 'ADD_PANTRY',
      item: {
        foodItemId: food.id,
        foodName: food.name,
        quantityGrams: parseFloat(qty),
        expiryDate: expiry || null,
      },
    });
    setFoodId('');
    setQty('');
    setExpiry('');
    setQuery('');
    setShowAdd(false);
  }

  return (
    <>
      <div className="flex-between" style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{sorted.length} items</span>
        <button className="btn btn-primary" onClick={() => setShowAdd((v) => !v)}>
          {showAdd ? 'Cancel' : '+ Add item'}
        </button>
      </div>

      {showAdd && (
        <div className="card">
          <div className="card-title">Add to pantry</div>
          <div className="form-group">
            <label className="form-label">Search food</label>
            <input
              type="text"
              placeholder="Search…"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setFoodId('');
              }}
            />
            {query && !foodId && (
              <div className="search-results" style={{ marginTop: 4 }}>
                {filteredFoods.map((f) => (
                  <div
                    key={f.id}
                    className="search-result-item"
                    onClick={() => {
                      setFoodId(f.id);
                      setQuery(f.name);
                    }}
                  >
                    <div className="search-result-name">{f.name}</div>
                    <div className="search-result-meta">{f.kcalPer100g} kcal/100g</div>
                  </div>
                ))}
                {filteredFoods.length === 0 && (
                  <div className="search-result-item" style={{ color: 'var(--muted)' }}>
                    No results
                  </div>
                )}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quantity (g or ml)</label>
              <input
                type="number"
                placeholder="500"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Expiry date</label>
              <input
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
              />
            </div>
          </div>
          <button
            className="btn btn-primary btn-block"
            disabled={!foodId || !qty}
            onClick={addItem}
          >
            Add to pantry
          </button>
        </div>
      )}

      {sorted.length === 0 && !showAdd && (
        <div className="empty">Pantry is empty.</div>
      )}

      <div className="card" style={{ padding: '4px 14px' }}>
        {sorted.map((item) => {
          const days = item.expiryDate ? daysUntil(item.expiryDate) : null;
          const expiryClass =
            days === null ? '' : days < 0 ? 'expiry-expired' : days <= 3 ? 'expiry-soon' : 'expiry-ok';
          const expiryLabel =
            days === null
              ? ''
              : days < 0
              ? `Expired ${Math.abs(days)}d ago`
              : days === 0
              ? 'Expires today'
              : `${days}d`;

          return (
            <div key={item.id} className="pantry-item">
              <div className="pantry-info">
                <div className="pantry-name">{item.foodName}</div>
                <div className="pantry-qty">
                  <QuantityEditor item={item} />
                </div>
              </div>
              {expiryLabel && (
                <span className={`expiry-badge ${expiryClass}`}>{expiryLabel}</span>
              )}
              <button
                className="btn-remove"
                onClick={() => dispatch({ type: 'REMOVE_PANTRY', id: item.id })}
                title="Remove"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

function QuantityEditor({ item }: { item: { id: string; quantityGrams: number } }) {
  const { dispatch } = useApp();
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(String(item.quantityGrams));

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
        <input
          type="number"
          value={val}
          autoFocus
          style={{ width: 70, padding: '2px 6px', fontSize: 13 }}
          onChange={(e) => setVal(e.target.value)}
          onBlur={() => {
            const n = parseFloat(val);
            if (n > 0) dispatch({ type: 'UPDATE_PANTRY', id: item.id, quantityGrams: n });
            setEditing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
            if (e.key === 'Escape') setEditing(false);
          }}
        />
        g
      </span>
    );
  }

  return (
    <span
      style={{ cursor: 'pointer', borderBottom: '1px dashed var(--border)' }}
      onClick={() => {
        setVal(String(item.quantityGrams));
        setEditing(true);
      }}
    >
      {item.quantityGrams}g
    </span>
  );
}
