'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useRef, useState } from 'react';
import { Modal } from './Modal';

interface WalletButtonProps {
  className?: string;
  width?: string;
}

export const WalletButton = ({ className = "sm:mr-0 sm:mt-0", width = "100%" }: WalletButtonProps) => {
  const { connected, disconnect, publicKey } = useWallet();
  const walletButtonRef = useRef<HTMLDivElement>(null);
  const [showModal, setShowModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Don't call preventDefault on button clicks - it's not needed and can cause passive listener issues

    if (connected) {
      // If connected, show custom modal with options
      setShowModal(true);
    } else {
      // If not connected, trigger the WalletMultiButton to open selection modal
      const button = walletButtonRef.current?.querySelector('button');
      if (button) {
        button.click();
      }
    }
  };

  const handleChangeWallet = () => {
    setShowModal(false);
    // Trigger the WalletMultiButton to open selection modal
    const button = walletButtonRef.current?.querySelector('button');
    if (button) {
      button.click();
    }
  };

  const handleDisconnect = async () => {
    setShowModal(false);
    await disconnect();
  };

  return (
    <>
      <div className={`flex items-center justify-center ${className}`} style={{ width: '100%', height: '100%' }}>
        {/* Hidden WalletMultiButton for wallet selection modal */}
        <div ref={walletButtonRef} style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}>
          <WalletMultiButton />
        </div>

        {/* Custom styled button */}
        <button
          onClick={handleClick}
          className="bg-transparent border-none p-0 cursor-pointer flex items-center justify-center active:scale-95 transition-transform"
          style={{
            background: 'transparent',
            border: 'none',
            padding: 0,
            width: '100%',
            height: '100%',
            minHeight: '44px'
          }}
        >
          <img
            src={connected ? '/img/Attached_wallet.png' : '/img/wallet.png'}
            alt={connected ? 'Connected Wallet' : 'Connect Wallet'}
            style={{ height: 'auto', width: width, display: 'block', maxWidth: '100%' }}
          />
        </button>
      </div>

      {/* Wallet Options Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Wallet Options"
        size="sm"
        showCloseButton={true}
      >
        <div className="space-y-4">
          {/* Connected Wallet Address */}
          {connected && publicKey && (
            <div className="p-4 bg-gray-700/50 rounded-lg border border-gray-600/50">
              <p className="text-xs text-gray-400 mb-1">Connected Wallet</p>
              <p className="text-sm text-white font-mono break-all">
                {publicKey.toBase58()}
              </p>
            </div>
          )}

          {/* Change Wallet Button */}
          <button
            onClick={handleChangeWallet}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Change Wallet
          </button>

          {/* Disconnect Button */}
          <button
            onClick={handleDisconnect}
            className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            Disconnect
          </button>
        </div>
      </Modal>
    </>
  );
};
