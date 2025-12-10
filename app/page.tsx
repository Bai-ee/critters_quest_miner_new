'use client';

import { Grid } from '@/components/Grid';
import { MainControl } from '@/components/MainControl';
import { Motherlode } from '@/components/Motherlode';
import { RoundResults } from '@/components/RoundResults';
import { Stats } from '@/components/Stats';
import { Timer } from '@/components/Timer';
import { WalletButton } from '@/components/WalletButton';
import { useRoundData } from '@/hooks/useRoundData';
import { useSolBalance } from '@/hooks/useSolBalance';
import { useWallet } from '@solana/wallet-adapter-react';
import { useState } from 'react';


export default function Home() {
  const { board, round, currentSlot, loading, error, lastUpdate, miner, automation } = useRoundData();
  const { connected, publicKey } = useWallet();
  const { balance: solBalance } = useSolBalance();

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
      <main className="min-h-screen bg-gray-900 text-white p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading QUEST data from blockchain...</p>
          <p className="text-sm text-gray-400 mt-2">Connecting to Solana via WebSocket...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-red-500">
            Error
          </h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-6">
            <p className="text-red-300">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </main>
    );
  }

  if (!board || !round) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8">
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
    <main className="min-h-screen bg-gray-900 text-white p-3 sm:p-4 md:p-4 lg:p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header - Single Row */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-3 lg:gap-4 mb-6 md:mb-8 bg-gray-800/30 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50">
          {/* Title Section */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-linear-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent truncate">
              QUEST Mining Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
              Round <span className="font-bold text-white">#{board.roundId.toString()}</span>
            </p>
          </div>

          {/* Info Pills - Balance, Status, Wallet */}
          <div className="flex flex-wrap items-center gap-2 lg:gap-3">
            {/* Live Status */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-900/40 border border-green-500/50 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              <span className="text-xs text-green-400 font-medium">Live</span>
              <span className="text-xs text-gray-500 hidden md:inline">• {formatUpdateTime(lastUpdate)}</span>
            </div>

            {/* Balance */}
            {connected && publicKey ? (
              <div className="px-3 py-1.5 bg-purple-900/40 border border-purple-500/50 rounded-lg">
                <div className="flex items-center gap-1.5">
                  <span className="text-purple-400 text-sm">💰</span>
                  <span className="font-mono font-bold text-purple-100 text-xs sm:text-sm">{solBalance.toFixed(4)} SOL</span>
                </div>
              </div>
            ) : null}

            {/* Wallet Button */}
            <div className="shrink-0">
              <WalletButton />
            </div>
          </div>
        </div>


        {/* Row 1: Motherlode Tiers */}
        <Motherlode />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6 mb-8">
          {/* Left Column - Mining Grid and Results */}
          <div className="flex flex-col gap-4 md:gap-6">
            {/* Mining Grid */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6 border border-gray-700">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                  <span>⛏️</span>
                  Mining Grid
                </h2>
                <div className="text-xs text-gray-500 font-mono">
                  Real-time updates
                </div>
              </div>

              {/* Controls Section */}
              <Grid
                round={round}
                selectedSquares={selectedSquares}
                toggleSquare={toggleSquare}
              />

              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                <span className="text-base md:text-lg font-bold text-white">{selectedSquares.size}</span>
                <span className="text-xs md:text-sm text-gray-400">square{selectedSquares.size !== 1 ? 's' : ''} selected</span>
              </div>

            </div>
          </div>

          {/* Right Column - Motherlode, Timer/Stats, Actions */}
          <div className="flex flex-col gap-4 md:gap-6">

            {/* Row 2: Timer and Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Timer endSlot={board.endSlot} currentSlot={currentSlot} startSlot={board.startSlot} />
              <Stats round={round} miner={miner} />
            </div>

            {/* Row 3: Action Buttons */}
            <div className="bg-linear-to-br from-gray-800/60 to-gray-900/60 rounded-xl p-2 border border-gray-700/50 backdrop-blur-sm">
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

        </div>

        {/* Round Results*/}
        <RoundResults round={round} miner={miner} />

        {/* Footer Info */}
        <div className="text-center text-gray-500 text-sm space-y-1">
          <p>Slots: {board.startSlot.toString()} → {board.endSlot.toString()}</p>
          <p>Current Slot: {currentSlot.toString()}</p>
          <p className="mt-2">
            Built with ❤️ using Solana Web3.js WebSockets
          </p>
        </div>

      </div>
    </main>
  );
}
