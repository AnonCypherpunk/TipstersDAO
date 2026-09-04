import React from 'react';

const tiers = [
  { name: 'Tier 1', amount: '5,000 TIP' },
  { name: 'Tier 2', amount: '10,000 TIP' },
  { name: 'Tier 3', amount: '15,000 TIP' },
  { name: 'Tier 4', amount: '20,000 TIP' },
];

const allocations = [
  { title: 'Basic Living Costs', desc: 'Rent or short-term housing, food, utilities, and transportation while income is disrupted.' },
  { title: 'Relocation', desc: 'Moving expenses, deposits, and the higher cost of living in a new place if staying put is unsafe or untenable.' },
  { title: 'Healthcare and Insurance', desc: 'Gaps in coverage, therapy, and any medical needs that become urgent under stress.' },
  { title: 'Secure Communications and Records', desc: 'New devices, paid services that reduce tracking of ordinary activity, and copies of documents — kept legal and proportionate.' },
  { title: 'Cash Buffer', desc: 'Several months of expenses in accessible form so you are not forced into rushed decisions.' },
];

const stateMachine = [
  { state: 'Pending', desc: 'Campaign created, awaiting seed' },
  { state: 'Voting', desc: '24h DAO approval window' },
  { state: 'Active', desc: 'Fundraising live' },
  { state: 'Funded', desc: 'Goal reached, escrow held' },
  { state: 'Completed', desc: 'Funds released, 3.33% fee' },
];

const access = [
  { action: 'View campaigns', who: 'Public' },
  { action: 'Create campaign', who: 'Anyone with $50 TIP' },
  { action: 'Vote on campaigns', who: 'Stakers only' },
  { action: 'View forum / submissions', who: 'Stakers only' },
  { action: 'Submit bounty claim', who: 'Stakers only' },
];

export default function Home() {
  return (
    <div>
      {/* Intro */}
      <section className="container" style={{ paddingTop: 120, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 24 }}>LitVM · ERC20 · $TIP</p>
        <h1 style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 600, marginBottom: 32 }}>
          Protect People Who Expose Predators
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 420, marginBottom: 0 }}>
          Tipsters DAO is a coordination layer. Stakers govern campaigns,
          approve bounties, and ensure funds reach those who need them —
          transparently, on-chain.
        </p>
      </section>
      <hr className="rule" />

      {/* Token */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Token — $TIP</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)' }}>
          {[
            { label: 'Standard', value: 'ERC20 with Permit' },
            { label: 'Supply', value: '84,000,000 TIP' },
            { label: 'Decimals', value: '18' },
          ].map((s) => (
            <div key={s.label} style={{ padding: '24px 24px 24px 0', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <p className="caption" style={{ marginBottom: 8 }}>{s.label}</p>
              <p style={{ fontSize: 16, fontWeight: 400 }}>{s.value}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Staking */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Staking</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
          {[
            { title: 'Minimum stake', text: '1 TIP to become a DAO member with voting rights.' },
            { title: 'Governance', text: 'Stakers vote on campaign approval and bounty release.' },
            { title: 'Rewards', text: '1% of all campaign raises distributed pro-rata to stakers.' },
          ].map((p) => (
            <div key={p.title} style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>{p.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Campaigns */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Campaign Factory — Clone Pattern</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderTop: '1px solid var(--border)' }}>
          {tiers.map((t) => (
            <div key={t.name} style={{ padding: '24px 24px 24px 0', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <p className="caption" style={{ marginBottom: 8 }}>{t.name}</p>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 4 }}>{t.amount}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Min seed: $50 of TIP</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 64 }}>
          <p className="caption" style={{ marginBottom: 32 }}>Campaign Lifecycle</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid var(--border)' }}>
            {stateMachine.map((s, i) => (
              <div key={s.state} style={{ padding: '24px 24px 24px 0', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
                <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{i + 1}. {s.state}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64, marginTop: 64 }}>
          {[
            { title: 'Escrow', text: 'Funds held until goal reached or cancelled.' },
            { title: 'Fee', text: '3.33% on successful withdrawal.' },
            { title: 'Refund', text: 'Automatic if failed or cancelled.' },
          ].map((p) => (
            <div key={p.title} style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>{p.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Allocations */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Allocation Categories — Basis Points</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', borderTop: '1px solid var(--border)' }}>
          {allocations.map((a) => (
            <div key={a.title} style={{ padding: '24px 24px 24px 0', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{a.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{a.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Bounty */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Bounty System</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', borderTop: '1px solid var(--border)' }}>
          {[
            { step: '01', title: 'Submission', text: 'Stakers post encrypted answers. IPFS hash only on-chain.' },
            { step: '02', title: 'Voting', text: '3-day DAO approval window.' },
            { step: '03', title: 'Release', text: 'Automatic on majority vote.' },
          ].map((s) => (
            <div key={s.step} style={{ padding: '24px 24px 24px 0', borderBottom: '1px solid var(--border)', borderRight: '1px solid var(--border)' }}>
              <p className="caption" style={{ marginBottom: 8 }}>{s.step}</p>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 8 }}>{s.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.text}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Access */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Access Control</p>
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {access.map((a) => (
            <div key={a.action} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)', gap: 16 }}>
              <span>{a.action}</span>
              <span className="caption" style={{ textAlign: 'right' }}>{a.who}</span>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Security */}
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Security</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
          {[
            { title: 'No sensitive data on-chain', text: 'IPFS hashes only. Evidence handling occurs off-chain.' },
            { title: 'Reentrancy protection', text: 'All fund transfers guarded against reentrancy attacks.' },
            { title: 'Pull-over-push refunds', text: 'Users withdraw their own funds — no forced pushes.' },
            { title: 'Emergency pause', text: 'Contract can be paused in case of incident.' },
            { title: 'Coordination only', text: 'Platform is for coordination. No illegal content.' },
          ].map((p) => (
            <div key={p.title} style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>{p.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
