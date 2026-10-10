import { createAppKit } from '@reown/appkit/react';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { createConfig, http } from 'wagmi';
import { injected } from 'wagmi/connectors';
import App from './App';
import { litvmTestnet } from './config/chains';
import './index.css';

const projectId = (import.meta.env.VITE_WC_PROJECT_ID as string) || '';
const hasRealProjectId = Boolean(projectId) && projectId !== 'demo-project-id';

const networks = [litvmTestnet];

const queryClient = new QueryClient();

// Build the wagmi config the app will actually use. If a real WalletConnect
// projectId is present we go through AppKit (full modal + QR). Otherwise we fall
// back to a plain injected-wallet config so the dapp still renders and works
// with MetaMask/Rabby — no module-load throw, no blank screen.
let wagmiConfig;

if (hasRealProjectId) {
  try {
    const wagmiAdapter = new WagmiAdapter({
      networks,
      projectId,
      ssr: false,
    });

    createAppKit({
      adapters: [wagmiAdapter],
      networks,
      projectId,
      features: {
        analytics: true,
      },
    });

    wagmiConfig = wagmiAdapter.wagmiConfig;
  } catch {
    wagmiConfig = createConfig({
      chains: [litvmTestnet],
      connectors: [injected()],
      transports: {
        [litvmTestnet.id]: http(),
      },
    });
  }
} else {
  wagmiConfig = createConfig({
    chains: [litvmTestnet],
    connectors: [injected()],
    transports: {
      [litvmTestnet.id]: http(),
    },
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>,
);
