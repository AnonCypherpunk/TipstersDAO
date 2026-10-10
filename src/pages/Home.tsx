import React from 'react';

    const allocations = [
      { title: 'Basic Living Costs', desc: 'Rent or short-term housing, food, utilities, and transportation while income is disrupted.' },
      { title: 'Relocation', desc: 'Moving expenses, deposits, and the higher cost of living in a new place if staying put is unsafe or untenable.' },
      { title: 'Healthcare and Insurance', desc: 'Gaps in coverage, therapy, and any medical needs that become urgent under stress.' },
      { title: 'Secure Communications and Records', desc: 'New devices, paid services that reduce tracking of ordinary activity, and copies of documents — kept legal and proportionate.' },
      { title: 'Cash Buffer', desc: 'Several months of expenses in accessible form so you are not forced into rushed decisions.' },
    ];

    const stateMachine = [
      { state: 'Pending', desc: 'Bounty created, awaiting seed' },
      { state: 'Voting', desc: '24h DAO approval window' },
      { state: 'Active', desc: 'Fundraising live' },
      { state: 'Funded', desc: 'Bounty funding goal reached, escrow held' },
      { state: 'Tipster', desc: 'Tipster explains how they can fulfill bounty' },
      { state: 'Voting', desc: '24h DAO approval window' },
      { state: 'Submission / Claim', desc: 'Tipster fulfills the task, submits proof, and catches the predator' },
      { state: 'Disbursement / Vote', desc: '36h DAO vote on distributing escrowed funds post-verification' },
    ];

    const access = [
      { action: 'View bounties', who: 'Public' },
      { action: 'Create bounty', who: 'Anyone with 50 zkLTC' },
      { action: 'Vote on bounties', who: 'Stakers only' },
      { action: 'View forum / submissions', who: 'Stakers only' },
      { action: 'Submit bounty claim', who: 'Anyone (Tipster)' },
    ];

    export default function Home() {
      return (
        <div>
          {/* Intro */}
          <section className="container" style={{ paddingTop: 120, paddingBottom: 96 }}>
            <div style={{ maxWidth: 720 }}>
              <h1 style={{ fontSize: 32, fontWeight: 400, lineHeight: 1.1, letterSpacing: '-0.02em', maxWidth: 600, marginBottom: 32 }}>
                Protect People Who Expose Predators
              </h1>
              <p style={{ color: 'var(--text-secondary)', maxWidth: 420, marginBottom: 0 }}>
                Tipsters DAO is a coordination layer. Stakers govern bounties,
                approve claims, and ensure funds reach those who need them —
                transparently, on-chain.
              </p>
            </div>
          </section>
          <hr className="rule" />

          {/* Bounty Lifecycle */}
          <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <p className="caption" style={{ marginBottom: 48 }}>Bounty Lifecycle</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid var(--border)' }}>
              {stateMachine.map((s, i) => (
                <React.Fragment key={i}>
                  <div
                    style={{
                      flex: '1 1 220px',
                      padding: '24px 24px 24px 0',
                      borderBottom: '1px solid var(--border)',
                      borderRight: '1px solid var(--border)',
                      minWidth: 0,
                    }}
                  >
                    <p style={{ fontSize: 14, fontWeight: 500, marginBottom: 8 }}>{i + 1}. {s.state}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{s.desc}</p>
                  </div>
                  {i < stateMachine.length - 1 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0 8px',
                        color: 'var(--text-secondary)',
                        fontSize: 14,
                        flexShrink: 0,
                      }}
                    >
                      →
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64, marginTop: 64 }}>
              {[
                { title: 'Escrow', text: 'Funds held until goal reached or cancelled, and bounty has been proven to be executed on' },
                { title: 'Fees', text: '3.33% on successful withdrawal to project, & 1% fee flows back to the DAO.' },
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
