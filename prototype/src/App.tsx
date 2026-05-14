import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FoodLog from './pages/FoodLog';
import DrinkLog from './pages/DrinkLog';
import Pantry from './pages/Pantry';
import Recipes from './pages/Recipes';
import { todayStr, formatDate } from './utils/date';

const NAV = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/food', label: 'Food', icon: '⊕' },
  { to: '/drinks', label: 'Drinks', icon: '◎' },
  { to: '/pantry', label: 'Pantry', icon: '▤' },
  { to: '/recipes', label: 'Recipes', icon: '✦' },
];

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/food': 'Food Log',
  '/drinks': 'Drink Log',
  '/pantry': 'Pantry',
  '/recipes': 'Recipes',
};

export default function App() {
  const location = useLocation();
  const title = PAGE_TITLES[location.pathname] ?? 'Health';

  return (
    <>
      <header className="app-header">
        <h1>{title}</h1>
        <span className="header-date">{formatDate(todayStr())}</span>
      </header>

      <main className="page-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/food" element={<FoodLog />} />
          <Route path="/drinks" element={<DrinkLog />} />
          <Route path="/pantry" element={<Pantry />} />
          <Route path="/recipes" element={<Recipes />} />
        </Routes>
      </main>

      <nav className="bottom-nav">
        {NAV.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
