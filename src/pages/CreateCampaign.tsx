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
        title: 'Healthcare',
        desc: 'Gaps in coverage, therapy, and any medical needs that become urgent under stress.',
      },
      {
        title: 'Secure Communications',
        desc: 'New devices, paid services that reduce tracking of ordinary activity, and copies of documents — kept legal and proportionate.',
      },
      {
        title: 'Cash Buffer',
        desc: 'Several months of expenses in accessible form so you are not forced into rushed decisions.',
      },
    ];

    const destinations = [
      { value: 'ipfs', label: 'IPFS' },
      { value: 'arweave', label: 'Arweave' },
      { value: 'filecoin', label: 'Filecoin' },
    ];

    export default function CreateCampaign() {
      const { isConnected } = useAccount();
      const [bountyAmount, setBountyAmount] = useState(50);
      const [allocations, setAllocations] = useState<number[]>([3000, 2000, 2000, 1500, 1500]);
      const [infoDestination, setInfoDestination] = useState('');
      const [destinationType, setDestinationType] = useState('ipfs');
      const [seedAmount, setSeedAmount] = useState('');
      const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

      const total = allocations.reduce((a, b) => a + b, 0);
      const isValid = total === 10000 && seedAmount !== '' && infoDestination !== '' && bountyAmount > 0;

      const { writeContract, data: writeData } = useWriteContract();
      const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

      useEffect(() => {
        if (writeData) setTxHash(writeData);
      }, [writeData]);

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
            0,
            allocations as [number, number, number, number, number],
            destination,
            parseUnits(seedAmount, 18),
          ],
        });
      };

      return (
        <div>
          <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <p className="caption" style={{ marginBottom: 48 }}>Create Bounty</p>

            {/* Bounty amount slider */}
            <div style={{ marginBottom: 64 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                <p className="caption">Bounty Amount</p>
                <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--primary)' }}>
                  {bountyAmount} zkLTC
                </span>
              </div>

              <div style={{ padding: '24px 0' }}>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="1"
                  value={bountyAmount}
                  onChange={(e) => setBountyAmount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    height: 4,
                    background: 'var(--border)',
                    borderRadius: 999,
                    outline: 'none',
                    cursor: 'pointer',
                    WebkitAppearance: 'none',
                    appearance: 'none',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
                  <span className="caption">0 zkLTC</span>
                  <span className="caption">500 zkLTC</span>
                </div>
              </div>

              <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Minimum seed: .5 zkLTC
              </p>
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
              <p className="caption" style={{ marginBottom: 16 }}>Post-Bounty Information Destination</p>
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
              <p className="caption" style={{ marginBottom: 16 }}>Seed Amount — Minimum .5 zkLTC</p>
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
              {isConfirming ? 'Confirming…' : 'Initiate Bounty'}
            </button>

            <p className="disclaimer">
              Platform disclaimer: Tipsters DAO is for coordination only. No sensitive information is
              added to the platform. Evidence handling occurs off-chain. Do not upload illegal content.
            </p>
          </section>
        </div>
      );
    }
