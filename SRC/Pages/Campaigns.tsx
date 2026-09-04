import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, CAMPAIGN_ABI, FACTORY_ABI } from '../config/contracts';

const tierTargets = ['5,000', '10,000', '15,000', '20,000'];

// Mock campaign data for demo — replace with on-chain reads
const mockCampaigns = [
  {
    id: 0,
    tier: 0,
    title: 'Campaign 001',
    desc: 'Relocation support for a family in transition.',
    raised: 3200,
    target: 5000,
    state: 2, // Active
    image: 'https://assets.dappit.app/q/family+relocation+support',
  },
  {
    id: 1,
    tier: 1,
    title: 'Campaign 002',
    desc: 'Healthcare and living costs during recovery.',
    raised: 7500,
    target: 10000,
    state: 2, // Active
    image: 'https://assets.dappit.app/q/healthcare+recovery+support',
  },
];

const mockForum = [
  {
    id: 0,
    campaignId: 0,
    author: '0x1234…abcd',
    title: 'Bounty claim — case details verified',
    votesFor: 12,
    votesAgainst: 3,
    timeLeft: '2d 14h',
    image: 'https://assets.dappit.app/q/verified+documents+seal',
  },
  {
    id: 1,
    campaignId: 1,
    author: '0x5678…efgh',
    title: 'Bounty claim — location evidence submitted',
    votesFor: 8,
    votesAgainst: 5,
    timeLeft: '1d 6h',
    image: 'https://assets.dappit.app/q/evidence+location+mapping',
  },
];

function CampaignCard({ campaign }: { campaign: (typeof mockCampaigns)[0] }) {
  const { isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const progress = (campaign.raised / campaign.target) * 100;

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  React.useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleContribute = () => {
    if (!isConnected || !amount) return;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: CAMPAIGN_ABI,
      functionName: 'contribute',
      args: [parseUnits(amount, 18)],
    });
  };

  return (
    <div className="campaign-card">
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <img
          src={campaign.image}
          alt={campaign.title}
          style={{ width: 160, height: 160, objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 16 }}>
            <p style={{ fontSize: 18, fontWeight: 500 }}>{campaign.title}</p>
            <span className="badge valid">Active</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>{campaign.desc}</p>

          <div style={{ marginBottom: 8 }}>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {campaign.raised.toLocaleString()} / {campaign.target.toLocaleString()} TIP
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {progress.toFixed(1)}%
            </span>
          </div>

          <div style={{ display: 'flex', gap: 16, alignItems: 'flex-end' }}>
            <input
              className="stake-input"
              type="number"
              min="0"
              step="any"
              inputMode="decimal"
              placeholder="Amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ fontSize: 16, maxWidth: 160 }}
              disabled={!isConnected}
            />
            <button
              className="action-btn"
              onClick={handleContribute}
              disabled={!isConnected || !amount || isConfirming}
              style={{ width: 'auto', padding: '12px 24px', minHeight: 44 }}
            >
              {isConfirming ? 'Confirming…' : 'Contribute'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForumEntry({ entry }: { entry: (typeof mockForum)[0] }) {
  const { isConnected } = useAccount();
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  React.useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleVote = (support: boolean) => {
    if (!isConnected) return;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: CAMPAIGN_ABI,
      functionName: 'voteOnBounty',
      args: [BigInt(entry.id), support],
    });
  };

  return (
    <div className="campaign-card">
      <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
        <img
          src={entry.image}
          alt={entry.title}
          style={{ width: 120, height: 120, objectFit: 'cover', flexShrink: 0 }}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 16 }}>
            <p style={{ fontSize: 16, fontWeight: 500 }}>{entry.title}</p>
            <span className="caption">{entry.timeLeft} left</span>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>
            by {entry.author} · Campaign #{entry.campaignId + 1}
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              For: {entry.votesFor} · Against: {entry.votesAgainst}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            <button
              className="action-btn"
              onClick={() => handleVote(true)}
              disabled={!isConnected || isConfirming}
              style={{ width: 'auto', padding: '12px 24px', minHeight: 44 }}
            >
              Vote For
            </button>
            <button
              className="action-btn secondary"
              onClick={() => handleVote(false)}
              disabled={!isConnected || isConfirming}
              style={{ width: 'auto', padding: '12px 24px', minHeight: 44 }}
            >
              Vote Against
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { isConnected } = useAccount();

  return (
    <div>
      <section className="container" style={{ paddingTop: 96, paddingBottom: 96 }}>
        <p className="caption" style={{ marginBottom: 48 }}>Campaigns</p>

        {/* Campaign list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {mockCampaigns.map((c) => (
            <CampaignCard key={c.id} campaign={c} />
          ))}
        </div>

        {/* Forum */}
        <div style={{ marginTop: 96 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
            <p className="caption">Bounty Claims — Forum</p>
            {!isConnected && <span className="badge">Stakers only</span>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {mockForum.map((f) => (
              <ForumEntry key={f.id} entry={f} />
            ))}
          </div>
        </div>

        <p className="disclaimer">
          Platform disclaimer: Tipsters DAO is for coordination only. No sensitive information is
          added to the platform. Evidence handling occurs off-chain. Do not upload illegal content.
        </p>
      </section>
    </div>
  );
}
