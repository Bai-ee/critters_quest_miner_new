'use client';

import { useEffect, useState, useCallback } from 'react';
import { connection, getCurrentSlot } from '@/lib/solana';
import { fetchBoard, fetchMiner, fetchRound, getBoardPDA, getMinerPDA, getRoundPDA, gramsToOre, getTreasuryPDA, fetchTreasury, fetchAutomation, getAutomationPDA } from '@/lib/accounts';
import type { Board, Round, Miner, Treasury, Automation } from '@/lib/types';
import { PublicKey, AccountInfo } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';

export function useRoundData() {
  const { publicKey } = useWallet();
  const [board, setBoard] = useState<Board | null>(null);
  const [round, setRound] = useState<Round | null>(null);
  const [previousRound, setPreviousRound] = useState<Round | null>(null);
  const [currentSlot, setCurrentSlot] = useState<bigint>(0n);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [miner, setMiner] = useState<Miner | null>(null);
  const [treasury, setTreasury] = useState<Treasury | null>(null);
  const [automation, setAutomation] = useState<Automation | null>(null);

  // Fetch Board data (called initially and when Board account changes)
  const fetchBoardData = useCallback(async () => {
    try {
      const boardData = await fetchBoard(connection);
      setBoard(boardData);
      return boardData;
    } catch (err) {
      console.error('Error fetching board:', err);
      throw err;
    }
  }, []);

  // Fetch Round data (called initially and when Round account changes)
  const fetchRoundData = useCallback(async (roundId: bigint) => {
    try {
      const roundData = await fetchRound(connection, roundId);
      setRound(roundData);
      setLastUpdate(new Date());
      return roundData;
    } catch (err) {
      console.error('Error fetching round:', err);
      throw err;
    }
  }, []);

  // Fetch Miner data (called initially and when Miner account changes)
  const fetchMinerData = useCallback(async (walletPublicKey: PublicKey) => {
    try {
      const minerData = await fetchMiner(connection, walletPublicKey);
      setMiner(minerData);
      return minerData;
    } catch (err) {
      console.error('Error fetching miner:', err);
      throw err;
    }
  }, []);


  // Initial data fetch
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch initial data
        const boardData = await fetchBoardData();
        const roundData = await fetchRoundData(boardData.roundId);

        // Fetch initial treasury/motherlode data
        try {
          const treasuryData = await fetchTreasury(connection);
          setTreasury(treasuryData);
        } catch (err) {
          console.error('Error fetching initial treasury:', err);
        }

        // Get current slot
        const slot = await getCurrentSlot();
        setCurrentSlot(BigInt(slot));

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [fetchBoardData, fetchRoundData]);

  // WebSocket subscription to Board account
  useEffect(() => {
    if (!board) return;

    const boardPDA = getBoardPDA();
    console.log('📡 Subscribing to Board account:', boardPDA.toString());

    const subscriptionId = connection.onAccountChange(
      boardPDA,
      async (accountInfo) => {
        console.log('🔔 Board account changed!');

        try {
          // Parse the new board data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          const roundId = data.readBigUInt64LE(offset);
          offset += 8;
          const startSlot = data.readBigUInt64LE(offset);
          offset += 8;
          const endSlot = data.readBigUInt64LE(offset);

          const newBoard: Board = { roundId, startSlot, endSlot };
          setBoard(newBoard);

          // If round changed, fetch new round data and keep previous round
          if (newBoard.roundId !== board.roundId) {
            console.log('🔄 Round changed! Fetching new round data...');
            // Save current round as previous round before fetching new one
            if (round) {
              setPreviousRound(round);
              // Fetch the old round one more time to get the final slotHash
              try {
                const oldRoundData = await fetchRound(connection, board.roundId);
                setPreviousRound(oldRoundData);
                console.log('📜 Previous round saved with slotHash:', oldRoundData.slotHash);
              } catch (err) {
                console.error('Error fetching previous round:', err);
              }
            }
            const newRoundData = await fetchRoundData(newBoard.roundId);

            // Fetch Treasury's live motherlode for the new round
            try {
              const treasuryData = await fetchTreasury(connection);
              setTreasury(treasuryData);
            } catch (err) {
              console.error('Error fetching treasury for new round:', err);
            }
          }
        } catch (err) {
          console.error('Error parsing Board update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Board account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [board, fetchRoundData]);

  // WebSocket subscription to Round account
  useEffect(() => {
    if (!board) return;

    const roundPDA = getRoundPDA(board.roundId);
    console.log('📡 Subscribing to Round account:', roundPDA.toString());

    const subscriptionId = connection.onAccountChange(
      roundPDA,
      async (accountInfo) => {
        console.log('🔔 Round account changed!');

        try {
          // Parse the new round data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          // Parse all fields (same as in accounts.ts)
          const id = data.readBigUInt64LE(offset);
          offset += 8;

          const deployed: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            deployed.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          const slotHash = data.subarray(offset, offset + 32);
          offset += 32;

          const count: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            count.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          const expiresAt = data.readBigUInt64LE(offset);
          offset += 8;
          // Skip the round's motherlode payouts (ore_motherlode_payout + sol_motherlode_payout)
          offset += 16;

          const rentPayerBytes = data.subarray(offset, offset + 32);
          const rentPayer = Buffer.from(rentPayerBytes).toString('hex');
          offset += 32;

          const topMinerBytes = data.subarray(offset, offset + 32);
          const topMiner = Buffer.from(topMinerBytes).toString('hex');
          offset += 32;

          const topMinerReward = data.readBigUInt64LE(offset);
          offset += 8;
          const totalDeployed = data.readBigUInt64LE(offset);
          offset += 8;
          const totalVaulted = data.readBigUInt64LE(offset);
          offset += 8;
          const totalWinnings = data.readBigUInt64LE(offset);

          // Update round but preserve the Treasury's motherlode value
          setRound((currentRound) => {
            if (!currentRound) return null;
            return {
              ...currentRound,
              id,
              deployed,
              slotHash,
              count,
              expiresAt,
              rentPayer,
              topMiner,
              topMinerReward,
              totalDeployed,
              totalVaulted,
              totalWinnings,
            };
          });
          setLastUpdate(new Date());
        } catch (err) {
          console.error('Error parsing Round update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Round account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [board]);

  // Update current slot every second
  useEffect(() => {
    const updateSlot = async () => {
      try {
        const slot = await getCurrentSlot();
        setCurrentSlot(BigInt(slot));
      } catch (err) {
        console.error('Error fetching slot:', err);
      }
    };

    // Update immediately
    updateSlot();

    // Then update every second
    const interval = setInterval(updateSlot, 1000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket subscription to Miner account
  useEffect(() => {
    if (!publicKey) {
      // Clear miner data when wallet disconnects
      setMiner(null);
      return;
    }

    // Fetch initial miner data
    fetchMinerData(publicKey);

    const minerPDA = getMinerPDA(publicKey);
    console.log('📡 Subscribing to Miner account:', minerPDA.toString());

    const subscriptionId = connection.onAccountChange(
      minerPDA,
      async (accountInfo) => {
        console.log('🔔 Miner account changed!');

        try {
          // Check if account was closed (empty data)
          if (accountInfo.data.length === 0) {
            console.log('🔴 Miner account closed');
            setMiner(null);
            return;
          }

          // Parse the new miner data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          // Parse Miner struct fields in order:

          // 1. authority: Pubkey (32 bytes)
          const authorityBytes = data.subarray(offset, offset + 32);
          const authority = new PublicKey(authorityBytes).toString();
          offset += 32;

          // 2. deployed: [u64; 25]
          const deployed: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            deployed.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          // 3. cumulative: [u64; 25]
          const cumulative: bigint[] = [];
          for (let i = 0; i < 25; i++) {
            cumulative.push(data.readBigUInt64LE(offset));
            offset += 8;
          }

          // 4. checkpoint_fee: u64
          const checkpointFee = data.readBigUInt64LE(offset);
          offset += 8;

          // 5. checkpoint_id: u64
          const checkpointId = data.readBigUInt64LE(offset);
          offset += 8;

          // 6. last_claim_ore_at: i64
          const lastClaimOreAt = data.readBigUInt64LE(offset);
          offset += 8;

          // 7. last_claim_sol_at: i64
          const lastClaimSolAt = data.readBigUInt64LE(offset);
          offset += 8;

          // 8. rewards_factor: Numeric (16 bytes)
          const rewardsFactor = data.subarray(offset, offset + 16);
          offset += 16;

          // 9. rewards_sol: u64
          const rewardsSol = data.readBigUInt64LE(offset);
          offset += 8;

          // 10. rewards_ore: u64
          const rewardsOre = data.readBigUInt64LE(offset);
          offset += 8;

          // 11. refined_ore: u64
          const refinedOre = data.readBigUInt64LE(offset);
          offset += 8;

          // 12. round_id: u64
          const roundId = data.readBigUInt64LE(offset);
          offset += 8;

          // 13. lifetime_rewards_sol: u64
          const lifetimeRewardsSol = data.readBigUInt64LE(offset);
          offset += 8;

          // 14. lifetime_rewards_ore: u64
          const lifetimeRewardsOre = data.readBigUInt64LE(offset);
          offset += 8;

          // 15. lifetime_deployed: u64
          const lifetimeDeployed = data.readBigUInt64LE(offset);
          offset += 8;

          const newMiner: Miner = {
            authority,
            deployed,
            cumulative,
            checkpointFee,
            checkpointId,
            lastClaimOreAt,
            lastClaimSolAt,
            rewardsFactor,
            rewardsSol,
            rewardsOre,
            refinedOre,
            roundId,
            lifetimeRewardsSol,
            lifetimeRewardsOre,
            lifetimeDeployed,
          };

          setMiner(newMiner);
          console.log('✅ Miner data updated:', {
            rewardsSol: newMiner.rewardsSol.toString(),
            rewardsOre: newMiner.rewardsOre.toString(),
            lifetimeRewardsSol: newMiner.lifetimeRewardsSol.toString(),
          });
        } catch (err) {
          console.error('Error parsing Miner update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Miner account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, fetchMinerData]);

  // WebSocket subscription to Automation account
  useEffect(() => {
    if (!publicKey) {
      // Clear automation data when wallet disconnects
      setAutomation(null);
      return;
    }

    // Fetch initial automation data
    const fetchAutomationData = async () => {
      try {
        const automationData = await fetchAutomation(connection, publicKey);
        setAutomation(automationData);
      } catch (err) {
        console.error('Error fetching automation:', err);
      }
    };

    fetchAutomationData();

    const automationPDA = getAutomationPDA(publicKey);
    console.log('📡 Subscribing to Automation account:', automationPDA.toString());

    const subscriptionId = connection.onAccountChange(
      automationPDA,
      async (accountInfo) => {
        console.log('🔔 Automation account changed!');

        try {
          // Check if account was closed (empty data)
          if (accountInfo.data.length === 0) {
            console.log('🔴 Automation account closed');
            setAutomation(null);
            return;
          }

          // Parse the new automation data
          const data = accountInfo.data;
          let offset = 8; // Skip discriminator

          // Parse Automation struct fields in order:
          const amount = data.readBigUInt64LE(offset);
          offset += 8;

          const authorityBytes = data.subarray(offset, offset + 32);
          const authority = new PublicKey(authorityBytes).toString();
          offset += 32;

          const balance = data.readBigUInt64LE(offset);
          offset += 8;

          const executorBytes = data.subarray(offset, offset + 32);
          const executor = new PublicKey(executorBytes).toString();
          offset += 32;

          const fee = data.readBigUInt64LE(offset);
          offset += 8;

          const strategy = data.readBigUInt64LE(offset);
          offset += 8;

          const mask = data.readBigUInt64LE(offset);
          offset += 8;

          const reload = data.readBigUInt64LE(offset);
          offset += 8;

          const newAutomation: Automation = {
            amount,
            authority,
            balance,
            executor,
            fee,
            strategy,
            mask,
            reload,
          };

          setAutomation(newAutomation);
          console.log('✅ Automation data updated:', {
            balance: newAutomation.balance.toString(),
            amount: newAutomation.amount.toString(),
          });
        } catch (err) {
          console.error('Error parsing Automation update:', err);
          // Account might have been closed
          setAutomation(null);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Automation account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey]);

  // WebSocket subscription to Treasury PDA account to track motherlode
  useEffect(() => {
    const treasuryPDA = getTreasuryPDA();

    console.log('📡 Subscribing to Treasury PDA account:', treasuryPDA.toString());

    const subscriptionId = connection.onAccountChange(
      treasuryPDA,
      async (accountInfo) => {
        console.log('🔔 Treasury PDA account changed!');

        try {
          // Fetch full Treasury data when account changes
          const treasuryData = await fetchTreasury(connection);
          setTreasury(treasuryData);
          setLastUpdate(new Date());
          console.log('💰 Treasury updated - Minor:', gramsToOre(treasuryData.motherlodeOreMinor).toFixed(2), 'ORE');
        } catch (err) {
          console.error('Error fetching Treasury update:', err);
        }
      },
      'confirmed'
    );

    return () => {
      console.log('🔌 Unsubscribing from Treasury PDA account');
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, []); // Empty dependency array - subscribe once on mount

  return {
    board,
    round,
    previousRound,
    currentSlot,
    loading,
    error,
    lastUpdate,
    miner,
    treasury,
    automation,
  };
}
