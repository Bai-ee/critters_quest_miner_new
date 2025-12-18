'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export const WalletButton = () => {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();

  const handleClick = () => {
    setVisible(true);
  };

  return (
    <button
      onClick={handleClick}
      className="bg-transparent border-none p-0 cursor-pointer"
      style={{ background: 'transparent', border: 'none', padding: 0 }}
    >
      <img
        src={connected ? '/img/Attached_wallet.png' : '/img/wallet.png'}
        alt={connected ? 'Connected Wallet' : 'Connect Wallet'}
        style={{ height: 'auto', width: '66.67%', display: 'block' }}
      />
    </button>
  );
};
