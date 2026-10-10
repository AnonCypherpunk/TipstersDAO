import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { CONTRACTS, CAMPAIGN_ABI, FACTORY_ABI } from '../config/contracts';

// Mock forum threads — in production these would be fetched from IPFS or Dappit Base
const mockThreads = [
  {
    id: 0,
    campaignId: 0,
    title: 'Bounty 001 — Tipster proposals',
    author: '0x1234…abcd',
    posts: [
      {
        id: 0,
        author: '0x1234…abcd',
        role: 'Tipster',
        content: 'I have verifiable information about this case. I can document the timeline and provide evidence to authorities within 48 hours of selection.',
        timestamp: '2h ago',
        votesFor: 12,
        votesAgainst: 3,
        stage: 5,
      },
      {
        id: 1,
        author: '0x5678…efgh',
        role: 'DAO Member',
        content: 'Can you share the general region without revealing specifics? We need enough to verify you have genuine access.',
        timestamp: '1h ago',
        votesFor: 0,
        votesAgainst: 0,
        stage: 5,
      },
      {
        id: 2,
        author: '0x1234…abcd',
        role: 'Tipster',
        content: 'The information relates to activity in the Pacific Northwest. I have documentation that I can present to authorities on selection.',
        timestamp: '45m ago',
        votesFor: 0,
        votesAgainst: 0,
        stage: 5,
      },
    ],
  },
  {
    id: 1,
    campaignId: 1,
    title: 'Bounty 002 — Tipster proposals',
    author: '0x5678…efgh',
    posts: [
      {
        id: 0,
        author: '0x5678…efgh',
        role: 'Tipster',
        content: 'I have firsthand knowledge of the situation described. I can provide a full account with supporting documentation.',
        timestamp: '5h ago',
        votesFor: 8,
        votesAgainst: 5,
        stage: 5,
      },
      {
        id: 1,
        author: '0x9abc…def0',
        role: 'DAO Member',
        content: 'The documentation should be shared with authorities first, then we can verify the submission hash on-chain.',
        timestamp: '3h ago',
        votesFor: 0,
        votesAgainst: 0,
        stage: 5,
      },
    ],
  },
];

const mockBounties = [
  {
    id: 0,
    title: 'Bounty 001',
    desc: 'Relocation support for a family in transition.',
    amount: 250,
    state: 3, // Funded
  },
  {
    id: 1,
    title: 'Bounty 002',
    desc: 'Healthcare and living costs during recovery.',
    amount: 500,
    state: 3, // Funded
  },
];

function LiveBountyFeed() {
  const { data: count } = useReadContract({
    address: CONTRACTS.campaignFactory,
    abi: FACTORY_ABI,
    functionName: 'campaignCount',
  });

  const total = count ? Number(count) : 0;

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        padding: 20,
        marginBottom: 24,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
        <p className="caption">Live Bounties On-Chain</p>
        <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--primary)' }}>{total}</span>
      </div>
      <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 8 }}>
        {total === 0
          ? 'No bounties created yet — be the first to initiate one.'
          : `${total} campaign${total === 1 ? '' : 's'} deployed to the factory contract.`}
      </p>
    </div>
  );
}

const stateLabels = ['Pending', 'Voting', 'Active', 'Funded', 'Tipster', 'Voting', 'Submission', 'Disbursement'];

function ThreadCard({ thread }: { thread: (typeof mockThreads)[0] }) {
  const { isConnected } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  React.useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleVote = (postId: number, support: boolean) => {
    if (!isConnected) return;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: CAMPAIGN_ABI,
      functionName: 'voteOnProposal',
      args: [BigInt(postId), support],
    });
  };

  const handlePost = () => {
    if (!newPost.trim()) return;
    // In production: store post to IPFS, then call submitProposal on-chain
    setNewPost('');
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{ padding: 20, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{thread.title}</p>
          <span className="caption">{thread.posts.length} posts</span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          Started by {thread.author} · Campaign #{thread.campaignId + 1}
        </p>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20 }}>
            {thread.posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: 'var(--background)',
                  borderRadius: 8,
                  padding: 16,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 12, fontWeight: 600 }}>{post.author}</span>
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: post.role === 'Tipster' ? 'rgba(158, 127, 255, 0.15)' : 'rgba(244, 114, 182, 0.15)',
                        color: post.role === 'Tipster' ? 'var(--primary)' : 'var(--accent)',
                      }}
                    >
                      {post.role}
                    </span>
                  </div>
                  <span className="caption">{post.timestamp}</span>
                </div>
                <p style={{ fontSize: 13, marginBottom: 12 }}>{post.content}</p>

                {/* Vote panel for tipster proposals */}
                {post.role === 'Tipster' && post.stage === 5 && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <button
                      className="action-btn"
                      onClick={() => handleVote(post.id, true)}
                      disabled={!isConnected || isConfirming}
                      style={{ width: 'auto', padding: '8px 16px', minHeight: 36, fontSize: 12 }}
                    >
                      Approve
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleVote(post.id, false)}
                      disabled={!isConnected || isConfirming}
                      style={{ width: 'auto', padding: '8px 16px', minHeight: 36, fontSize: 12 }}
                    >
                      Reject
                    </button>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                      {post.votesFor} For · {post.votesAgainst} Against
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* New post composer */}
          <div>
            <textarea
              placeholder="Share information, ask questions, or submit a proposal…"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
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
              onClick={handlePost}
              disabled={!isConnected || !newPost.trim()}
              style={{ width: 'auto', padding: '10px 24px', minHeight: 40, fontSize: 12 }}
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function BountyRow({ bounty }: { bounty: (typeof mockBounties)[0] }) {
  const { isConnected } = useAccount();
  const [expanded, setExpanded] = useState(false);
  const [proposal, setProposal] = useState('');
  const [proof, setProof] = useState('');
  const [txHash, setTxHash] = useState<`0x${string}` | undefined>();

  const { writeContract, data: writeData } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash: txHash });

  React.useEffect(() => {
    if (writeData) setTxHash(writeData);
  }, [writeData]);

  const handleSubmitProposal = () => {
    if (!proposal.trim() || !isConnected) return;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: CAMPAIGN_ABI,
      functionName: 'submitProposal',
      args: [proposal],
    });
  };

  const handleSubmitProof = () => {
    if (!proof.trim() || !isConnected) return;
    writeContract({
      address: CONTRACTS.campaignFactory,
      abi: CAMPAIGN_ABI,
      functionName: 'submitBounty',
      args: [proof],
    });
  };

  return (
    <div
      style={{
        background: 'var(--surface)',
        borderRadius: 12,
        border: '1px solid var(--border)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{ padding: 20, cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8, gap: 16 }}>
          <p style={{ fontSize: 16, fontWeight: 600 }}>{bounty.title}</p>
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              padding: '3px 10px',
              borderRadius: 999,
              background: 'rgba(52, 211, 153, 0.15)',
              color: '#34d399',
            }}
          >
            {stateLabels[bounty.state]}
          </span>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 8 }}>{bounty.desc}</p>
        <p style={{ fontSize: 14, fontWeight: 600 }}>{bounty.amount.toLocaleString()} zkLTC</p>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: 20 }}>
          {/* Stage 5: Submit proposal */}
          {bounty.state === 3 && (
            <div>
              <p className="caption" style={{ marginBottom: 8 }}>Submit Tipster Proposal</p>
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
                disabled={!isConnected || !proposal.trim() || isConfirming}
                style={{ width: 'auto', padding: '10px 24px', minHeight: 40, fontSize: 12 }}
              >
                Submit Proposal
              </button>
            </div>
          )}

          {/* Stage 7: Submit proof */}
          {bounty.state === 6 && (
            <div>
              <p className="caption" style={{ marginBottom: 8 }}>Submit Proof of Execution</p>
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
                onClick={handleSubmitProof}
                disabled={!isConnected || !proof.trim() || isConfirming}
                style={{ width: 'auto', padding: '10px 24px', minHeight: 40, fontSize: 12 }}
              >
                Submit Proof
              </button>
            </div>
          )}

          {bounty.state !== 3 && bounty.state !== 6 && (
            <p style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              This bounty is in the {stateLabels[bounty.state]} stage. Check back when it's ready for tipster proposals.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function Forum() {
  const { isConnected } = useAccount();

  return (
    <div>
      {/* Forum header */}
      <section className="container" style={{ paddingTop: 64, paddingBottom: 48 }}>
        <p className="caption" style={{ marginBottom: 8 }}>DAO Discussion</p>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>Bounties</h1>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', maxWidth: 480 }}>
          Discuss bounties, evaluate tipster proposals, and coordinate on verification — all in one place.
        </p>
      </section>
      <hr className="rule" />

      {/* Live on-chain bounty count */}
      <section className="container" style={{ paddingTop: 48, paddingBottom: 0 }}>
        <LiveBountyFeed />
      </section>

      {/* Threads */}
      <section className="container" style={{ paddingTop: 0, paddingBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <p className="caption">Discussion Threads</p>
          {!isConnected && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Connect wallet to post</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockThreads.map((t) => (
            <ThreadCard key={t.id} thread={t} />
          ))}
        </div>
      </section>
      <hr className="rule" />

      {/* Bounties for tipsters */}
      <section className="container" style={{ paddingTop: 48, paddingBottom: 64 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <p className="caption">Funded Bounties — Open for Tipsters</p>
          {!isConnected && <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Connect wallet to submit</span>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mockBounties.map((b) => (
            <BountyRow key={b.id} bounty={b} />
          ))}
        </div>
      </section>
    </div>
  );
}
