import React, { useState, useEffect } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits } from 'viem';
import { CONTRACTS, FACTORY_ABI } from '../config/contracts';

const allocationCategories = [
  {
    title: 'Basic Living Costs',
    desc: 'Rent or short-term housing, food, utilities, and transportation while income is disrupted.',
  },
  {
    title: 'Relocation',
    desc: 'Moving expenses, deposits, and the higher cost of living in a new place if staying put is unsafe or untenable.',
  },
  {
    title: 'Healthcare and Insurance',
    desc: 'Gaps in coverage, therapy, and any medical needs that become urgent under stress.',
  },
  {
    title: 'Secure Communications and Records',
    desc: 'New devices, paid services that reduce tracking of ordinary activity, and copies of documents — kept legal and proportionate.',
  },
  {
    title: 'Cash Buffer',
    desc: 'Several months of expenses in accessible form so you are not forced into rushed decisions.',
  },
];

const tiers = [
  { value: 0, label: 'Tier 1', amount: '5,000 TIP', target: '5K' },
  { value: 1, label: 'Tier 2', amount: '10,000 TIP', target: '10K' },
  { value: 2, label: 'Tier 3', amount: '15,000 TIP', target: '15K' },
  { value: 3, label: 'Tier 4', amount: '20,000 TIP', target: '20K' },
];

// Default allocations per tier (basis points)
const tierDefaults: number[][] = [
  [3000, 2000, 2000, 1500, 1500], // Tier 1
  [2500, 2500, 2000, 1500, 1500], // Tier 2
  [2000, 2500, 2500, 1500, 1500], // Tier 3
  [2000, 2000, 2500, 2000, 1500], // Tier 4
];

const destinations = [
  { value: 'ipfs', label: 'IPFS' },
  { value: 'arweave', label: 'Arweave' },
  { value: 'filecoin', label: 'Filecoin' },
];

export default function CreateCampaign() {
  const { isConnected } = useAccount();
  const [tier, setTier] = useState(0);
  const [allocations, setAllocations] = useState<number[]>(tierDefaults[0]);
  const [infoDestination, setInfoDestination] = useState('');
  const [destinationType, setDestinationType] = useState('ipfs');
  const [seedAmount, setSeedAmount] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const total = allocations.reduce((a, b) => a + b, 0);
  const isValid = total === 10000 && seedAmount !== '' && infoDestination !== '';

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleTierChange = (t: number) => {
    setTier(t);
    setAllocations(tierDefaults[t]);
  };

  const handleAllocationChange = (index: number, value: number) => {
    const next = [...allocations];
    next[index] = Math.min(10000, Math.max(0, value));
    setAllocations(next);
  };

  const handleCreate = () => {
    if (!isValid || !isConnected) return;
    const destination = destinationType === 'ipfs' ? `ipfs://${infoDestination}` : `${destinationType}://${infoDestination}`;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: FACTORY_ABI,
      functionName: 'createCampaign',
      args: [
        tier,
        allocations as [number, number, number, number, number],
        destination,
        parseUnits(seedAmount, 18),
      ],
    });
  };

  return (
    <div>
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Create Campaign</p>

        {/* Tier selection */}
        <div style={{ marginBottom: 64 }}>
          <p className="caption" style={{ marginBottom: 16 }}>Tier</p>
          <div className="tier-grid">
            {tiers.map((t) => (
              <button
                key={t.value}
                onClick={() => handleTierChange(t.value)}
                className={`tier-btn ${tier === t.value ? 'active' : ''}`}
              >
                <p className="caption" style={{ marginBottom: 8 }}>{t.label}</p>
                <p style={{ fontSize: 16, fontWeight: 500 }}>{t.amount}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Allocations */}
        <div style={{ marginBottom: 64 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
            <p className="caption">Allocations — Basis Points</p>
            <span className={`badge ${total === 10000 ? 'valid' : 'invalid'}`}>
              {total === 10000 ? '100% allocated' : `${total} / 10000 bp`}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--border)' }}>
            {allocationCategories.map((cat, i) => (
              <div key={cat.title} className="allocation-row">
                <div className="allocation-info">
                  <p className="allocation-title">{cat.title}</p>
                  <p className="allocation-desc">{cat.desc}</p>
                </div>
                <div className="allocation-controls">
                  <input
                    type="range"
                    className="alloc-slider"
                    min="0"
                    max="10000"
                    step="100"
                    value={allocations[i]}
                    onChange={(e) => handleAllocationChange(i, Number(e.target.value))}
                  />
                  <span className="allocation-value">
                    {((allocations[i] / 10000) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info destination */}
        <div style={{ marginBottom: 64 }}>
          <p className="caption" style={{ marginBottom: 16 }}>Post-Campaign Information Destination</p>
          <div style={{ display: 'flex', gap: 32, marginBottom: 24 }}>
            {destinations.map((d) => (
              <button
                key={d.value}
                onClick={() => setDestinationType(d.value)}
                className="btn"
                style={{ textDecoration: destinationType === d.value ? 'underline' : 'none' }}
              >
                {d.label}
              </button>
            ))}
          </div>
          <input
            className="stake-input"
            type="text"
            placeholder={`${destinationType}://…`}
            value={infoDestination}
            onChange={(e) => setInfoDestination(e.target.value)}
            style={{ fontSize: 16 }}
          />
        </div>

        {/* Seed amount */}
        <div style={{ marginBottom: 48 }}>
          <p className="caption" style={{ marginBottom: 16 }}>Seed Amount — Minimum $50 of TIP</p>
          <input
            className="stake-input"
            type="number"
            min="0"
            step="any"
            inputMode="decimal"
            placeholder="0"
            value={seedAmount}
            onChange={(e) => setSeedAmount(e.target.value)}
            style={{ fontSize: 16 }}
          />
        </div>

        <button className="action-btn" onClick={handleCreate} disabled={!isConnected || !isValid || isConfirming}>
          {isConfirming ? 'Confirming…' : 'Create Campaign'}
        </button>

        <p className="disclaimer">
          Platform disclaimer: Tipsters DAO is for coordination only. No sensitive information is
          added to the platform. Evidence handling occurs off-chain. Do not upload illegal content.
        </p>
      </section>
    </div>
  );
}
