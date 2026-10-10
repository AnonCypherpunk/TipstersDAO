import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, TIP_TOKEN_ABI, STAKING_ABI } from '../config/contracts';

const MIN_STAKE = 1;

export default function Stake() {
  const { address, isConnected } = useAccount();
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { data: tokenBalance } = useReadContract({
    address: CONTRACTS.tipToken,
    abi: TIP_TOKEN_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: stakeInfo } = useReadContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'stakes',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: totalStakedRaw } = useReadContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
  });

  const { data: pendingRewards } = useReadContract({
    address: CONTRACTS.staking,
    abi: STAKING_ABI,
    functionName: 'pendingRewards',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const balance = tokenBalance ? Number(formatUnits(tokenBalance, 18)) : 0;
  const staked = stakeInfo ? Number(formatUnits(stakeInfo[0], 18)) : 0;
  const totalStaked = totalStakedRaw ? Number(formatUnits(totalStakedRaw, 18)) : 0;
  const rewards = pendingRewards ? Number(formatUnits(pendingRewards, 18)) : 0;
  const parsedAmount = amount ? Number(amount) : 0;
  const isValid = parsedAmount >= MIN_STAKE;
  const isEligible = staked >= MIN_STAKE;

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleStake = () => {
    if (!isValid || !address) return;
    writeContract({
      address: CONTRACTS.staking,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [parseUnits(amount, 18)],
    });
  };

  const handleUnstake = () => {
    if (!address || staked <= 0) return;
    writeContract({
      address: CONTRACTS.staking,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [parseUnits(amount || String(staked), 18)],
    });
  };

  const handleClaimRewards = () => {
    if (!address || rewards <= 0) return;
    writeContract({
      address: CONTRACTS.staking,
      abi: STAKING_ABI,
      functionName: 'claimRewards',
      args: [],
    });
  };

  return (
    <div>
      {/* How staking works */}
      <section className="container" style={{ paddingTop: 64, paddingBottom: 48 }}>
        <p className="caption" style={{ marginBottom: 32 }}>How Staking Works</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 64 }}>
          {[
            { title: 'Minimum stake', text: '1 zkLTC to become a DAO member with voting rights.' },
            { title: 'Governance', text: 'Stakers vote on bounty approval and claim release.' },
            { title: 'Rewards', text: '1% of all bounty raises distributed pro-rata to stakers.' },
          ].map((p) => (
            <div key={p.title} style={{ borderTop: '1px solid var(--border)', paddingTop: 24 }}>
              <p style={{ fontSize: 16, fontWeight: 400, marginBottom: 12 }}>{p.title}</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{p.text}</p>
            </div>
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Balance header */}
      <section className="container" style={{ paddingTop: 64, paddingBottom: 48 }}>
        <p className="caption" style={{ marginBottom: 8 }}>Available Balance</p>
        <p style={{ fontSize: 48, fontWeight: 600, letterSpacing: '-0.03em', marginBottom: 8 }}>
          {isConnected ? balance.toLocaleString() : '—'} <span style={{ fontSize: 24, color: 'var(--text-secondary)' }}>zkLTC</span>
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 480 }}>
          zkLTC is the native gas token of LitVM — no faucet needed. Stake 1 zkLTC to participate in DAO governance.
        </p>
      </section>
      <hr className="rule" />

      {/* Staking interface */}
      <section className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 48 }}>
          {/* Stake form */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            <p className="caption" style={{ marginBottom: 16 }}>Stake zkLTC</p>

            <div style={{ marginBottom: 16 }}>
              <input
                className="stake-input"
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={!isConnected}
              />
            </div>

            <div style={{ marginBottom: 24, minHeight: 24 }}>
              {amount && (
                <span className={`badge ${isValid ? 'valid' : 'invalid'}`}>
                  {isValid ? 'Minimum met' : `Minimum ${MIN_STAKE} zkLTC`}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="action-btn" onClick={handleStake} disabled={!isConnected || !isValid || isConfirming}>
                {isConfirming ? 'Confirming…' : 'Stake'}
              </button>
              <button className="action-btn secondary" onClick={handleUnstake} disabled={!isConnected || staked <= 0 || isConfirming}>
                Unstake
              </button>
            </div>
          </div>

          {/* Position card */}
          <div
            style={{
              background: 'var(--surface)',
              borderRadius: 12,
              border: '1px solid var(--border)',
              padding: 24,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
              <p className="caption">Your Position</p>
              <span className={`gov-pill ${isEligible ? 'active' : ''}`}>
                <span className="gov-dot" />
                {isEligible ? 'Governance Eligible' : 'Stake 1 zkLTC to govern'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <span className="caption">Staked</span>
                <span style={{ fontSize: 20, fontWeight: 600 }}>{staked.toLocaleString()} zkLTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <span className="caption">Pending Rewards</span>
                <span style={{ fontSize: 20, fontWeight: 600, color: rewards > 0 ? '#34d399' : 'var(--text)' }}>
                  {rewards.toLocaleString()} zkLTC
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
                <span className="caption">Total Staked (DAO)</span>
                <span style={{ fontSize: 20, fontWeight: 600 }}>{totalStaked.toLocaleString()} zkLTC</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="caption">Wallet</span>
                <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', textAlign: 'right', paddingLeft: 16 }}>
                  {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : 'Not connected'}
                </span>
              </div>
            </div>

            {rewards > 0 && (
              <button
                className="action-btn"
                onClick={handleClaimRewards}
                disabled={!isConnected || isConfirming}
                style={{ marginTop: 24 }}
              >
                Claim Rewards
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
