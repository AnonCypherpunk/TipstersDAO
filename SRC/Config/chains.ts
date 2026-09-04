import type { Chain } from 'viem';

export const litvmTestnet = {
  id: 12345, // Replace with actual chain ID from https://testnet.litvm.com/chainid
  name: 'LitVM Testnet',
  nativeCurrency: {
    name: 'LIT',
    symbol: 'LIT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://testnet.litvm.com'] },
    public: { http: ['https://testnet.litvm.com'] },
  },
  blockExplorers: {
    default: { name: 'LitVM Explorer', url: 'https://testnet.litvm.com/explorer' },
  },
} as const satisfies Chain;
