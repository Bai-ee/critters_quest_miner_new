'use client';

import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface Props {
  children: ReactNode;
}

export const WalletContextProvider: FC<Props> = ({ children }) => {
  // Use devnet for testing, or mainnet-beta for production
  // Can be overridden with NEXT_PUBLIC_RPC_URL environment variable
  const endpoint = useMemo(() => {
    const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
    console.log('[WalletProvider] RPC URL from env:', rpcUrl ? 'SET (Helius)' : 'NOT SET (using default devnet)');
    if (rpcUrl) {
      console.log('[WalletProvider] Using RPC endpoint:', rpcUrl.replace(/api-key=[^&]+/, 'api-key=***'));
      return rpcUrl;
    }
    // Default to devnet for testing (can be changed to mainnet-beta for production)
    console.warn('[WalletProvider] NEXT_PUBLIC_RPC_URL not set, using default devnet endpoint');
    return clusterApiUrl('devnet');
  }, []);

  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};
