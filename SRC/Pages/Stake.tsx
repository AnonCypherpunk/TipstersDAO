import React, { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, TIP_TOKEN_ABI, STAKING_ABI } from '../config/contracts';

const TOTAL_SUPPLY = 84_000_000;
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

  const staked = stakeInfo ? Number(formatUnits(stakeInfo[0], 18)) : 0;
  const balance = tokenBalance ? Number(formatUnits(tokenBalance, 18)) : 0;
  const totalStaked = totalStakedRaw ? Number(formatUnits(totalStakedRaw, 18)) : 0;
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

  return (
    <div>
      <section className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="stat-card">
            <p className="caption" style={{ marginBottom: 8 }}>Total Supply</p>
            <p className="stat-value">84M $TIP</p>
          </div>
          <div className="stat-card">
            <p className="caption" style={{ marginBottom: 8 }}>Minimum Stake</p>
            <p className="stat-value">1 $TIP</p>
          </div>
        </div>
      </section>
      <hr className="rule" />

      <section className="container" style={{ paddingTop: 64, paddingBottom: 64 }}>
        <p className="caption" style={{ marginBottom: 24 }}>Stake $TIP</p>

        <div style={{ marginBottom: 24, overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <span className={`gov-pill ${isEligible ? 'active' : ''}`}>
            <span className="gov-dot" />
            {isEligible ? 'Governance Eligible' : 'Stake to govern'}
          </span>
        </div>

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
              {isValid ? 'Minimum met' : `Minimum ${MIN_STAKE} $TIP`}
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

        <div style={{ marginTop: 32, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="caption">Wallet</span>
            <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', textAlign: 'right', paddingLeft: 16 }}>
              {isConnected ? `${address?.slice(0, 6)}…${address?.slice(-4)}` : 'Not connected'}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="caption">Staked</span>
            <span style={{ color: 'var(--text-secondary)' }}>{staked.toLocaleString()} $TIP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="caption">Available</span>
            <span style={{ color: 'var(--text-secondary)' }}>{balance.toLocaleString()} $TIP</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="caption">Total Staked</span>
            <span style={{ color: 'var(--text-secondary)' }}>{totalStaked.toLocaleString()} $TIP</span>
          </div>
        </div>
      </section>
    </div>
  );
}
