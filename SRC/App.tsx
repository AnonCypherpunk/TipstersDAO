import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Stake from './pages/Stake';
import Campaigns from './pages/Campaigns';
import CreateCampaign from './pages/CreateCampaign';

function Layout() {
  const location = useLocation();

  return (
    <div>
      <header>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 16 }}>
          <Link to="/" style={{ textDecoration: 'none', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <span style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Tipsters DAO</span>
          </Link>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <Link
              to="/"
              className="btn"
              style={{ whiteSpace: 'nowrap', textDecoration: location.pathname === '/' ? 'underline' : 'none' }}
            >
              Home
            </Link>
            <Link
              to="/stake"
              className="btn"
              style={{ whiteSpace: 'nowrap', textDecoration: location.pathname === '/stake' ? 'underline' : 'none' }}
            >
              Stake
            </Link>
            <Link
              to="/campaigns"
              className="btn"
              style={{ whiteSpace: 'nowrap', textDecoration: location.pathname === '/campaigns' ? 'underline' : 'none' }}
            >
              Campaigns
            </Link>
            <Link
              to="/create"
              className="btn"
              style={{ whiteSpace: 'nowrap', textDecoration: location.pathname === '/create' ? 'underline' : 'none' }}
            >
              Create
            </Link>
          </nav>
          <div style={{ flexShrink: 0 }}>
            <appkit-button />
          </div>
        </div>
      </header>
      <hr className="rule" />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/create" element={<CreateCampaign />} />
      </Routes>

      <hr className="rule" />
      <footer className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 8 }}>Tipsters DAO</p>
            <p className="caption">LitVM · $TIP</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Made by <a href="https://dappit.io" target="_blank" rel="noreferrer" style={{ color: 'var(--text-secondary)' }}>dappit.io</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return <Layout />;
}
