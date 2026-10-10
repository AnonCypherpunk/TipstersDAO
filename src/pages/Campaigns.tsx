import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, CAMPAIGN_ABI, FACTORY_ABI } from '../config/contracts';

// Campaign state enum matching the contract
const CAMPAIGN_STATES = [
  { label: 'Pending', color: '#9E7FFF' },
  { label: 'Voting', color: '#f472b6' },
  { label: 'Active', color: '#34d399' },
  { label: 'Funded', color: '#fbbf24' },
  { label: 'Tipster', color: '#60a5fa' },
  { label: 'Voting', color: '#f472b6' },
  { label: 'Submission', color: '#a78bfa' },
  { label: 'Disbursement', color: '#f87171' },
];

const stateLabels = [
  'Pending',
  'Voting',
  'Active',
  'Funded',
  'Tipster',
  'Voting',
  'Submission',
  'Disbursement',
];

// Demo campaigns for the local chain
const demoCampaigns = [
  {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    title: 'Bounty 001',
    desc: 'Relocation support for a family in transition.',
    image: 'https://assets.dappit.app/q/family+relocation+support',
  },
  {
    address: '0x0000000000000000000000000000000000000000' as `0x${string}`,
    title: 'Bounty 002',
    desc: 'Healthcare and living costs during recovery.',
    image: 'https://assets.dappit.app/q/healthcare+recovery+support',
  },
];

function CampaignCard({ campaign, index }: { campaign: (typeof demoCampaigns)[0]; index: number }) {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();
  const [proposal, setProposal] = useState('');
  const [proof, setProof] = useState('');

  // Read campaign state
  const { data: stateData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'state',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: raisedData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'raisedAmount',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: targetData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'targetAmount',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: votesForData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'campaignVotesFor',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: votesAgainstData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'campaignVotesAgainst',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: deadlineData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'votingDeadline',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: tipsterData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'tipster',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  const { data: proposalData } = useReadContract({
    address: campaign.address,
    abi: CAMPAIGN_ABI,
    functionName: 'tipsterProposal',
    query: { enabled: campaign.address !== '0x0000000000000000000000000000000000000000' },
  });

  // Demo state for non-deployed campaigns
  const state = stateData !== undefined ? Number(stateData) : index === 0 ? 2 : 3; // Active / Funded
  const raised = raisedData !== undefined ? Number(formatUnits(raisedData, 18)) : index === 0 ? 3200 : 10000;
  const target = targetData !== undefined ? Number(formatUnits(targetData, 18)) : 5000;
  const votesFor = votesForData !== undefined ? Number(votesForData) : 12;
  const votesAgainst = votesAgainstData !== undefined ? Number(votesAgainstData) : 3;
  const deadline = deadlineData !== undefined ? Number(deadlineData) : 0;
  const tipster = tipsterData !== undefined ? tipsterData : '0x1234…abcd';
  const tipsterProposal = proposalData !== undefined ? proposalData : '';

  const progress = target > 0 ? (raised / target) * 100 : 0;
  const stateInfo = CAMPAIGN_STATES[state] || CAMPAIGN_STATES[0];
  const isLive = campaign.address !== '0x0000000000000000000000000000000000000000';

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleAction = (fn: string, args: any[]) => {
    if (!isConnected || !isLive) return;
    writeContract({
      address: campaign.address,
      abi: CAMPAIGN_ABI,
      functionName: fn,
      args,
    });
  };

  const handleContribute = () => {
    if (!amount) return;
    handleAction('contribute', [parseUnits(amount, 18)]);
  };

  const handleSeed = () => {
    if (!amount) return;
    handleAction('seed', [parseUnits(amount, 18)]);
  };

  const handleVote = (support: boolean) => {
    if (state === 1) handleAction('voteOnCampaign', [support]);
    else if (state === 5) handleAction('voteOnProposal', [support]);
    else if (state === 7) handleAction('voteOnDisbursement', [support]);
  };

  const handleFinalize = () => {
    if (state === 1) handleAction('finalizeVoting', []);
    else if (state === 5) handleAction('finalizeProposalVoting', []);
    else if (state === 7) handleAction('finalizeDisbursement', []);
  };

  const handleSubmitProposal = () => {
    if (!proposal) return;
    handleAction('submitProposal', [proposal]);
  };

  const handleSubmitBounty = () => {
    if (!proof) return;
    handleAction('submitBounty', [proof]);
  };

  const handleStartVoting = () => {
    if (state === 0) handleAction('startVoting', []);
    else if (state === 4) handleAction('startProposalVoting', []);
    else if (state === 6) handleAction('startDisbursementVoting', []);
  };

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    if (!deadline) return;
    const timer = setInterval(() => {
      const diff = deadline * 1000 - Date.now();
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  const isVotingState = state === 1 || state === 5 || state === 7;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.02)';
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = 'none';
      }}
      onClick={() => setExpanded(!expanded)}
    >
      {/* Card image */}
      <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
        <img
          src={campaign.image}
          alt={campaign.title}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        {/* Status pill */}
        <div
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            background: stateInfo.color,
            color: '#fff',
            padding: '4px 12px',
            borderRadius: 999,
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            animation: state === 3 ? 'pulse 2s infinite' : 'none',
          }}
        >
          {stateLabels[state] || 'Unknown'}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: 20, flex: 1, display: 'flex', flexDirection: 'column' }}>
        <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
          Bounty #{index + 1}
        </p>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{campaign.title}</h3>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
          {campaign.desc}
        </p>

        {/* Progress */}
        <div style={{ marginBottom: 8 }}>
          <div
            style={{
              height: 6,
              background: 'var(--border)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                background: stateInfo.color,
                borderRadius: 999,
                width: `${Math.min(progress, 100)}%`,
                transition: 'width 500ms ease',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {raised.toLocaleString()} / {target.toLocaleString()} TIP
          </span>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {progress.toFixed(1)}%
          </span>
        </div>

        {/* Tipster info */}
        {state >= 4 && state <= 7 && (
          <div
            style={{
              background: 'var(--background)',
              borderRadius: 8,
              padding: 12,
              marginBottom: 16,
            }}
          >
            <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
              Tipster: {typeof tipster === 'string' ? tipster : `${tipster.slice(0, 6)}…${tipster.slice(-4)}`}
            </p>
            {tipsterProposal && (
              <p style={{ fontSize: 13, marginTop: 8 }}>{tipsterProposal}</p>
            )}
          </div>
        )}

        {/* Voting panel */}
        {isVotingState && (
          <div
            style={{
              background: 'var(--background)',
              borderRadius: 8,
              padding: 16,
              marginBottom: 16,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, fontWeight: 600 }}>
                {state === 1 ? 'DAO Approval' : state === 5 ? 'Proposal Vote' : 'Disbursement Vote'}
              </span>
              {timeLeft && (
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{timeLeft}</span>
              )}
            </div>
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  height: 6,
                  background: 'var(--border)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    background: '#34d399',
                    borderRadius: 999,
                    width: `${votesFor + votesAgainst > 0 ? (votesFor / (votesFor + votesAgainst)) * 100 : 50}%`,
                  }}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                <span style={{ fontSize: 11, color: '#34d399' }}>{votesFor} For</span>
                <span style={{ fontSize: 11, color: '#f87171' }}>{votesAgainst} Against</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="action-btn"
                onClick={() => handleVote(true)}
                disabled={!isConnected || !isLive || isConfirming}
                style={{ flex: 1, padding: '10px 16px', minHeight: 40, fontSize: 12 }}
              >
                Approve
              </button>
              <button
                className="action-btn secondary"
                onClick={() => handleVote(false)}
                disabled={!isConnected || !isLive || isConfirming}
                style={{ flex: 1, padding: '10px 16px', minHeight: 40, fontSize: 12 }}
              >
                Reject
              </button>
            </div>
            <button
              className="btn"
              onClick={handleFinalize}
              disabled={!isConnected || !isLive || isConfirming}
              style={{ width: '100%', marginTop: 8, fontSize: 12, textAlign: 'center' }}
            >
              Finalize Vote
            </button>
          </div>
        )}

        {/* Action area */}
        <div style={{ marginTop: 'auto' }} onClick={(e) => e.stopPropagation()}>
          {/* Seed / Contribute */}
          {(state === 0 || state === 2) && (
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                style={{
                  flex: 1,
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                }}
                disabled={!isConnected}
              />
              <button
                className="action-btn"
                onClick={state === 0 ? handleSeed : handleContribute}
                disabled={!isConnected || !amount || !isLive || isConfirming}
                style={{ padding: '10px 20px', minHeight: 40, fontSize: 12, whiteSpace: 'nowrap' }}
              >
                {state === 0 ? 'Seed' : 'Tip In'}
              </button>
            </div>
          )}

          {/* Start voting */}
          {state === 0 && (
            <button
              className="action-btn secondary"
              onClick={handleStartVoting}
              disabled={!isConnected || !isLive || isConfirming}
              style={{ width: '100%', marginTop: 8, padding: '10px 16px', minHeight: 40, fontSize: 12 }}
            >
              Start DAO Vote
            </button>
          )}

          {/* Submit proposal */}
          {state === 3 && (
            <div>
              <textarea
                placeholder="Explain how you'll fulfill this bounty…"
                value={proposal}
                onChange={(e) => setProposal(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                  resize: 'vertical',
                  minHeight: 80,
                  marginBottom: 8,
                }}
                disabled={!isConnected}
              />
              <button
                className="action-btn"
                onClick={handleSubmitProposal}
                disabled={!isConnected || !proposal || !isLive || isConfirming}
                style={{ width: '100%', padding: '10px 16px', minHeight: 40, fontSize: 12 }}
              >
                Submit Proposal
              </button>
            </div>
          )}

          {/* Start proposal voting */}
          {state === 4 && (
            <button
              className="action-btn"
              onClick={handleStartVoting}
              disabled={!isConnected || !isLive || isConfirming}
              style={{ width: '100%', padding: '10px 16px', minHeight: 40, fontSize: 12 }}
            >
              Start Proposal Vote
            </button>
          )}

          {/* Submit proof */}
          {state === 6 && (
            <div>
              <input
                type="text"
                placeholder="Proof link or IPFS hash…"
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--background)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  padding: '10px 12px',
                  fontSize: 13,
                  color: 'var(--text)',
                  outline: 'none',
                  marginBottom: 8,
                }}
                disabled={!isConnected}
              />
              <button
                className="action-btn"
                onClick={handleSubmitBounty}
                disabled={!isConnected || !proof || !isLive || isConfirming}
                style={{ width: '100%', padding: '10px 16px', minHeight: 40, fontSize: 12 }}
              >
                Submit Proof
              </button>
            </div>
          )}

          {/* Start disbursement */}
          {state === 6 && (
            <button
              className="action-btn secondary"
              onClick={handleStartVoting}
              disabled={!isConnected || !isLive || isConfirming}
              style={{ width: '100%', marginTop: 8, padding: '10px 16px', minHeight: 40, fontSize: 12 }}
            >
              Start Disbursement Vote
            </button>
          )}

          {/* Locked badge for funded */}
          {state === 3 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 8,
                background: 'rgba(251, 191, 36, 0.1)',
                color: '#fbbf24',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: '#fbbf24',
                  animation: 'pulse 2s infinite',
                }}
              />
              Funds Locked in Escrow
            </div>
          )}

          {/* Not live notice */}
          {!isLive && (
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', textAlign: 'center', marginTop: 8 }}>
              Demo card — deploy contracts to activate
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Campaigns() {
  const { isConnected } = useAccount();
  const [campaignAddresses, setCampaignAddresses] = useState<`0x${string}`[]>([]);

  // Read campaign count from factory
  const { data: countData } = useReadContract({
    address: CONTRACTS.campaignFactory,
    abi: FACTORY_ABI,
    functionName: 'campaignCount',
    query: { enabled: CONTRACTS.campaignFactory !== '0x0000000000000000000000000000000000000000' },
  });

  const count = countData !== undefined ? Number(countData) : 0;

  // Read campaign addresses
  useEffect(() => {
    if (count > 0 && CONTRACTS.campaignFactory !== '0x0000000000000000000000000000000000000000') {
      const addresses: `0x${string}`[] = [];
      for (let i = 0; i < count; i++) {
        // We'd need to read each one — for now, use demo data
      }
      setCampaignAddresses(addresses);
    }
  }, [count]);

  const liveCampaigns = campaignAddresses.length > 0 ? campaignAddresses : [];

  return (
    <div>
      <section className="container" style={{ paddingTop: 64, paddingBottom: 96 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48 }}>
          <div>
            <p className="caption" style={{ marginBottom: 8 }}>Active Bounties</p>
            <h1 style={{ fontSize: 28, fontWeight: 600 }}>Bounty Board</h1>
          </div>
          {!isConnected && (
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              Connect wallet to interact
            </span>
          )}
        </div>

        {/* Three-column grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 24,
          }}
        >
          {demoCampaigns.map((c, i) => (
            <CampaignCard key={i} campaign={c} index={i} />
          ))}
        </div>

        <p className="disclaimer">
          Platform disclaimer: Tipsters DAO is for coordination only. No sensitive information is
          added to the platform. Evidence handling occurs off-chain. Do not upload illegal content.
        </p>
      </section>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @media (max-width: 1024px) {
          .container > div > div {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .container > div > div {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
