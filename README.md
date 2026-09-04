Tipsters DAO

Protect People Who Expose Predators

Tipsters DAO is a coordination layer. Stakers govern campaigns, approve bounties, and ensure funds reach those who need them — transparently, on-chain.

Features
Campaign Factory — Clone pattern for creating tiered crowdfunding campaigns
Staking and Governance — Stake TIP to vote on campaign approval and bounty release
Bounty System — Stakers submit and vote on bounty claims with IPFS hash storage
Allocation Controls — Campaign creators allocate funds across 5 categories in basis points
Escrow and Refunds — Funds held until goal reached; automatic refunds on failure
Tech Stack
Frontend: React 18 + TypeScript + Vite
Web3: wagmi + viem + Reown AppKit
Blockchain: LitVM Testnet (ERC20 with Permit)
Routing: React Router
Getting Started
Prerequisites: Node.js 18+ and a WalletConnect Project ID from cloud.walletconnect.com

Installation:

Clone the repo: git clone https://github.com/AnonCypherpunk/TipstersDAO.git
Navigate in: cd TipstersDAO
Install dependencies: npm install
Copy the env file: cp .env.example .env
Add your WalletConnect Project ID to the .env file
Start the dev server: npm run dev
For production, run: npm run build

Token
Standard: ERC20 with Permit
Supply: 84,000,000 TIP
Decimals: 18
Staking
Minimum stake: 1 TIP to become a DAO member with voting rights
Governance: Stakers vote on campaign approval and bounty release
Rewards: 1% of all campaign raises distributed pro-rata to stakers
Campaign Lifecycle
Pending — Campaign created, awaiting seed
Voting — 24h DAO approval window
Active — Fundraising live
Funded — Goal reached, escrow held
Completed — Funds released, 3.33% fee
Security
No sensitive data on-chain — IPFS hashes only
Reentrancy protection on all fund transfers
Pull-over-push refunds
Emergency pause capability
Disclaimer
Tipsters DAO is for coordination only. No sensitive information is added to the platform. Evidence handling occurs off-chain. Do not upload illegal content.

License
Private — All rights reserved.
