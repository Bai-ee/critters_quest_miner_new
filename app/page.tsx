'use client';

import { Grid } from '@/components/Grid';
import { MainControl } from '@/components/MainControl';
import { Motherlode } from '@/components/Motherlode';
import { Timer } from '@/components/Timer';
import { WalletButton } from '@/components/WalletButton';
import { Modal } from '@/components/Modal';
import { RoundResults } from '@/components/RoundResults';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useTokenBalance } from '@/hooks/useTokenBalance';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { CALCULATIONS } from '@/lib/constants';


export default function Home() {
  const { board, round, previousRound, currentSlot, loading, error, lastUpdate, miner, automation } = useRoundData();
  const { connected, publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();

  const [isResultsModalOpen, setIsResultsModalOpen] = useState(false);
  const [lastShownRoundId, setLastShownRoundId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // Show modal when previousRound is updated (round just completed)
    if (previousRound && previousRound.id.toString() !== lastShownRoundId) {
      setIsResultsModalOpen(true);
      setLastShownRoundId(previousRound.id.toString());
    }
  }, [previousRound, lastShownRoundId]);

  // Get token balance
  const { balance: tokenBalance } = useTokenBalance({
    tokenMint: 'QUESTP8xKMfot3ErcdfWXsHbG3kN9mutieAqrVNw74s',
    walletAddress: 'GkvAksZA1map1tNjVsH5vz5yx9a7ZEJafojoCkALMknZ',
    decimals: 9
  });

  // Shared state for square selection
  const [selectedSquares, setSelectedSquares] = useState<Set<number>>(new Set());

  const toggleSquare = (index: number) => {
    const newSelected = new Set(selectedSquares);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedSquares(newSelected);
  };

  const selectAll = () => {
    setSelectedSquares(new Set(Array.from({ length: 25 }, (_, i) => i)));
  };

  const clearSelection = () => {
    setSelectedSquares(new Set());
  };

  const randomSelection = () => {
    // Default to 5 random squares if no count specified
    const numSquares = Math.floor(Math.random() * 25) + 1;
    const maxSquares = Math.min(numSquares, 25);

    // Create array of all square indices [0-24]
    const allSquares = Array.from({ length: 25 }, (_, i) => i);

    // Shuffle array using Fisher-Yates algorithm
    for (let i = allSquares.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allSquares[i], allSquares[j]] = [allSquares[j], allSquares[i]];
    }

    // Take first N squares from shuffled array
    const randomSquares = allSquares.slice(0, maxSquares);
    setSelectedSquares(new Set(randomSquares));
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="text-center cq-panel p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cq-neon mx-auto mb-4"></div>
          <p className="text-lg font-bold text-cq-neon">Loading QUEST data...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Solana...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center p-4">
        <div className="cq-panel p-6 max-w-md">
          <h1 className="text-2xl font-bold text-center mb-4 text-red-400">
            Error
          </h1>
          <div className="cq-panel p-4 border-red-500/50">
            <p className="text-red-300 text-sm">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="cq-button-primary mt-4 w-full py-2 text-sm font-bold text-black"
            >
              RETRY
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!board || !round) {
    return (
      <main className="min-h-screen bg-cq-bg-0 text-white flex items-center justify-center">
        <div className="cq-panel p-8">
          <h1 className="text-2xl font-bold text-center text-cq-neon">
            No data available
          </h1>
        </div>
      </main>
    );
  }

  // Format last update time
  const formatUpdateTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 5) return 'just now';
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return date.toLocaleTimeString();
  };

  return (
    <main className="min-h-screen bg-cq-bg-0 text-white flex flex-col" style={{ overflowX: 'hidden' }}>
      {/* Drawer Backdrop for Mobile */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 z-30 sm:hidden bg-black/20 backdrop-blur-[2px]"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}

      {/* Background layers */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-cq-bg-1 via-cq-bg-0 to-cq-bg-1"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(116,253,231,0.1)_0%,transparent_70%)]"></div>
      </div>

      {/* Mining items gradient image at top - scrolls with page */}
      <div className="relative flex justify-center items-center mx-auto" style={{ zIndex: 1, marginTop: '0px', width: '4000px', overflow: 'visible', left: '50%', transform: 'translateX(-50%)' }}>
        <div className="absolute flex items-center justify-center gap-4" style={{ top: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 0 }}>
          <img 
            src="/img/misc_value_space.png" 
            alt="Value Space Left" 
            className="sm:w-[20%]"
            style={{
              width: '16%',
              height: 'auto',
              display: 'block',
            }}
          />
          <img 
            src="/img/miner_logo.png" 
            alt="Miner Logo" 
            style={{
              width: '140px',
              height: 'auto',
              display: 'block',
              maxWidth: '20%',
              marginTop:'-20px'
            }}
          />
          <img 
            src="/img/misc_value_space.png" 
            alt="Value Space Right" 
            className="sm:w-[20%]"
            style={{
              width: '16%',
              height: 'auto',
              display: 'block',
            }}
          />
        </div>
        {board?.endSlot && currentSlot && (
          <div className="absolute top-[90px]" style={{ left: '50%', transform: 'translateX(-50%)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '16px' }}>
            <Timer endSlot={board.endSlot} currentSlot={currentSlot} startSlot={board.startSlot} />
            <img 
              src="/img/pickaxe_front.gif" 
              alt="Pickaxe" 
              className="h-[133px] sm:h-[133px] sm:mt-[50px] md:h-[133px]"
              style={{
                width: 'auto',
                marginTop:'-50px'
              }}
            />
            <div style={{ backgroundColor: '#FFB84A', width: '100px', minHeight: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '8px', border: '2px solid black', borderRadius: '8px' }}>
              <span className="text-xs sm:text-sm font-bold text-white">R#{board?.roundId?.toString() || '0'}</span>
              <span className="text-[10px] sm:text-xs font-bold text-white">{selectedSquares.size} selected</span>
            </div>
          </div>
        )}
        <img 
          src="/img/mining_items_gradient.png" 
          alt="" 
          className="sm:mt-[20px]"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            maxWidth: '1674.97px',
            objectFit: 'contain',
            position: 'relative',
            zIndex: 1,
            marginTop: '10px',
          }}
        />
      </div>

      {/* TOP HUD - Fixed height */}
      <div
        className="fixed top-0 left-0 right-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            {/* Left: Title */}
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-cq-primary-blue to-cq-primary-yellow bg-clip-text text-transparent">
                QUEST MINER
              </h1>
            </div>

            {/* Right: Balances + Wallet */}
            <div className="flex items-center gap-2" style={{ background: 'transparent' }}>
              {connected && publicKey && (
                <div className="px-2 py-1 hidden sm:block" style={{ background: 'transparent' }}>
                  <span className="text-xs font-bold text-cq-gold">{solBalance.toFixed(2)} SOL</span>
                </div>
              )}
              <WalletButton />
            </div>
          </div>
        </div>
      </div>

      {/* CENTER STAGE - Grid always centered */}
      {/* 
      <div 
        className="flex-1 flex flex-col items-center justify-start pb-32 px-3 sm:px-4 relative"
        style={{ minHeight: 'calc(100svh - 80px - 120px)', overflow: 'visible', marginTop: '0px' }}
      >
        <div 
          className="absolute inset-0 w-full"
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'black',
            top: '0',
            left: '0',
            zIndex: 0,
            overflow: 'hidden'
          }}
        >
          <div 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '100%',
              backgroundImage: 'url(/img/bg_mining.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'top center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>

        <div className="w-full max-w-[min(92vw,520px)] md:max-w-[1200px] mx-auto relative z-30 mb-0" style={{ overflow: 'visible' }}>
          <div className="p-2 sm:p-6 mt-[-90px] sm:mt-[-110px] md:mt-[-130px] lg:mt-[-140px]" style={{ overflow: 'visible' }}>
            <Motherlode
              endSlot={board.endSlot}
              currentSlot={currentSlot}
              startSlot={board.startSlot}
            />
          </div>
        </div>

        <div className="w-full max-w-[min(92vw,520px)] relative z-30" style={{ overflow: 'visible' }}>
          <div className="mt-[-20px] sm:mt-[-40px]" style={{ overflow: 'visible' }}>
            <Grid
              round={round}
              selectedSquares={selectedSquares}
              toggleSquare={toggleSquare}
            />
          </div>
        </div>
      </div>
      */}

      {/* BOTTOM CONTROL BAR - Sticky */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-40 border-t-2 border-black transition-transform duration-300 ease-in-out ${
          !isDrawerOpen ? 'translate-y-[calc(100%-48px)] sm:translate-y-0' : 'translate-y-0'
        }`}
        style={{ backgroundColor: '#FFB84A' }}
        onClick={() => !isDrawerOpen && setIsDrawerOpen(true)}
      >
        {/* Drawer Handle for Mobile */}
        <div 
          className="sm:hidden w-full h-[48px] flex flex-col items-center justify-center cursor-pointer border-b border-black/10"
          onClick={(e) => {
            if (isDrawerOpen) {
              e.stopPropagation();
              setIsDrawerOpen(false);
            }
          }}
        >
          <div className="w-12 h-1 bg-black/20 rounded-full mb-1"></div>
          <span className="text-[10px] font-bold text-black/40 uppercase tracking-widest">
            {isDrawerOpen ? 'Close Controls' : 'Open Controls'}
          </span>
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <MainControl
            round={round}
            miner={miner}
            selectedSquares={selectedSquares}
            selectAll={selectAll}
            clearSelection={clearSelection}
            randomSelection={randomSelection}
            solBalance={solBalance}
            automation={automation}
          />
        </div>
      </div>

      {/* Round Results Modal - Pops up on round completion */}
      <Modal
        isOpen={isResultsModalOpen}
        onClose={() => setIsResultsModalOpen(false)}
        title="Round Results"
        size="lg"
      >
        <RoundResults 
          round={previousRound || round} 
          miner={miner} 
        />
        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setIsResultsModalOpen(false)}
            className="cq-button-primary px-8 py-3 text-lg font-bold text-black"
          >
            CONTINUE MINING
          </button>
        </div>
      </Modal>
    </main>
  );
}
