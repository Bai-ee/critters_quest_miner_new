'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  const { publicKey, connected } = useWallet();

  return (
    <div className="flex items-center gap-3">
      {connected && publicKey && (
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg">
          <div className="h-2 w-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-300">
            {publicKey.toBase58().slice(0, 4)}...{publicKey.toBase58().slice(-4)}
          </span>
        </div>
      )}
      <WalletMultiButton className="bg-linear-to-r! from-blue-500! to-purple-600! hover:from-blue-600! hover:to-purple-700! rounded-lg! transition-all! duration-200! font-semibold!" />
    </div>
  );
};
