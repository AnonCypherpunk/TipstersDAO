import React, { useState } from 'react';
import { useDisconnect } from 'wagmi';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { useAccount, useConnect, useSwitchChain } from 'wagmi';
import Home from './pages/Home';
import Forum from './pages/Forum';
import Stake from './pages/Stake';
import CreateCampaign from './pages/CreateCampaign';
import { litvmTestnet } from './config/chains';

type View = 'home' | 'forum' | 'stake' | 'create';

const NAV: { id: View; label: string }[] = [
  { id: 'home', label: 'Home' },
  { id: 'forum', label: 'Bounties' },
  { id: 'stake', label: 'Stake' },
  { id: 'create', label: 'Create' },
];

function WalletButton() {
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();

  if (!isConnected) {
    return (
      <button
        className="action-btn"
        onClick={() => {
          // If AppKit initialized, open its modal; otherwise fall back to an injected wallet.
          try {
            open();
          } catch {
            connect({ connector: connectors[0] });
          }
        }}
        style={{ width: 'auto', padding: '10px 20px', minHeight: 40 }}
      >
        Connect Wallet
      </button>
    );
  }

  return (
    <button
      className="action-btn secondary"
      onClick={() => disconnect()}
      title="Disconnect wallet"
      style={{ width: 'auto', padding: '10px 20px', minHeight: 40 }}
    >
      {address?.slice(0, 6)}…{address?.slice(-4)}
    </button>
  );
}

function NetworkBanner() {
  const { isConnected, chainId } = useAccount();
  const { switchChain } = useSwitchChain();

  if (!isConnected || chainId === litvmTestnet.id) return null;

  return (
    <div
      style={{
        background: 'rgba(244, 114, 182, 0.12)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div
        className="container"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 12, gap: 16, flexWrap: 'wrap' }}
      >
        <span style={{ fontSize: 13, color: 'var(--text)' }}>
          Wrong network — Tipsters DAO runs on {litvmTestnet.name}.
        </span>
        <button
          className="action-btn"
          onClick={() => switchChain({ chainId: litvmTestnet.id })}
          style={{ width: 'auto', padding: '8px 16px', minHeight: 36, fontSize: 12 }}
        >
          Switch to {litvmTestnet.name}
        </button>
      </div>
    </div>
  );
}

function Layout() {
  const [view, setView] = useState<View>('home');

  return (
    <div>
      <header>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 24, paddingBottom: 24, gap: 16 }}>
          <button
            className="btn"
            onClick={() => setView('home')}
            style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, textDecoration: 'none' }}
          >
            <span style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>Tipsters DAO</span>
          </button>
          <nav style={{ display: 'flex', gap: 24, alignItems: 'center', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {NAV.map((item) => (
              <button
                key={item.id}
                className="btn"
                onClick={() => setView(item.id)}
                style={{ whiteSpace: 'nowrap', textDecoration: view === item.id ? 'underline' : 'none' }}
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div style={{ flexShrink: 0 }}>
            <WalletButton />
          </div>
        </div>
      </header>
      <NetworkBanner />
      <hr className="rule" />

      {view === 'home' && <Home />}
      {view === 'forum' && <Forum />}
      {view === 'stake' && <Stake />}
      {view === 'create' && <CreateCampaign />}

      <hr className="rule" />
      <footer className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <p style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.02em', marginBottom: 8 }}>Tipsters DAO</p>
            <p className="caption">LitVM · $zkLTC</p>
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
