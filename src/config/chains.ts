import type { Chain } from 'viem';

export const litvmTestnet = {
  id: 4441,
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

export const localhost = {
  id: 31337,
  name: 'Localhost',
  nativeCurrency: {
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
    public: { http: ['http://127.0.0.1:8545'] },
  },
} as const satisfies Chain;
