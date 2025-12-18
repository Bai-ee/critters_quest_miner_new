import { gramsToOre, lamportsToSol } from '@/lib/accounts';
import { useRoundData } from '@/hooks/useRoundData';
import { useMemo } from 'react';
import { JackpotTierCard } from './JackpotTierCard';
import { Timer } from './Timer';

interface MotherlodeProps {
  amount?: bigint;
  endSlot?: bigint;
  currentSlot?: bigint;
  startSlot?: bigint;
}

export function Motherlode({ amount, endSlot, currentSlot, startSlot }: MotherlodeProps) {
  const { treasury } = useRoundData();

  const tiers = useMemo(() => {
    if (!treasury) {
      return [
        {
          name: 'GRAND',
          emoji: '🎰',
          odds: '1/2500',
          ore: 0,
          sol: 0,
        },
        {
          name: 'MAJOR',
          emoji: '💎',
          odds: '1/625',
          ore: 0,
          sol: 0,
        },
        {
          name: 'MINOR',
          emoji: '⭐',
          odds: '1/125',
          ore: 0,
          sol: 0,
        },
      ];
    }

    return [
      {
        name: 'GRAND',
        emoji: '🎰',
        odds: '1/2500',
        ore: gramsToOre(treasury.motherlodeOreGrand),
        sol: lamportsToSol(treasury.motherlodeSolGrand),
      },
      {
        name: 'MAJOR',
        emoji: '💎',
        odds: '1/625',
        ore: gramsToOre(treasury.motherlodeOreMajor),
        sol: lamportsToSol(treasury.motherlodeSolMajor),
      },
      {
        name: 'MINOR',
        emoji: '⭐',
        odds: '1/125',
        ore: gramsToOre(treasury.motherlodeOreMinor),
        sol: lamportsToSol(treasury.motherlodeSolMinor),
      },
    ];
  }, [treasury]);

  const formatNumber = (num: number) => {
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T`;
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`;
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`;
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`;
    return num.toFixed(1);
  };

  const getTierStyles = (name: string) => {
    switch (name) {
      case 'GRAND':
        return {
          bg: 'var(--tier-grand-bg)',
          text: 'var(--tier-grand-text)',
        };
      case 'MAJOR':
        return {
          bg: 'var(--tier-major-bg)',
          text: 'var(--tier-major-text)',
        };
      case 'MINOR':
        return {
          bg: 'var(--tier-minor-bg)',
          text: 'var(--tier-minor-text)',
        };
      default:
        return {
          bg: 'var(--tier-mini-bg)',
          text: 'var(--tier-mini-text)',
        };
    }
  };

  const grandTier = tiers[0];
  const majorTier = tiers[1];
  const minorTier = tiers[2];

  const grandTotalValue = grandTier.sol + (grandTier.ore * 0.0001);
  const majorTotalValue = majorTier.sol + (majorTier.ore * 0.0001);
  const minorTotalValue = minorTier.sol + (minorTier.ore * 0.0001);

  return (
    <div className="space-y-4 mb-6" style={{ overflow: 'visible' }}>
      {/* Desktop Layout: 3 Columns (MAJOR | GRAND | MINOR) */}
      <div className="hidden md:flex flex-row items-start justify-center gap-2 mt-4" style={{ overflow: 'visible' }}>
        <div className="flex-1 flex justify-center items-center" style={{ minWidth: 0 }}>
          <JackpotTierCard
            tier="MAJOR"
            value={majorTotalValue}
            ore={majorTier.ore}
            sol={majorTier.sol}
            odds={majorTier.odds}
            bgImage="/img/award_label_major.png"
            labelImage="/img/major_winner_label.png"
            scale={1}
          />
        </div>
        <div className="flex-1 flex justify-center items-center" style={{ minWidth: 0 }}>
          <JackpotTierCard
            tier="GRAND"
            value={grandTotalValue}
            ore={grandTier.ore}
            sol={grandTier.sol}
            odds={grandTier.odds}
            bgImage="/img/grand_award_bg.png"
            labelImage="/img/grand_winner_label.png"
            scale={1}
          />
        </div>
        <div className="flex-1 flex justify-center items-center" style={{ minWidth: 0 }}>
          <JackpotTierCard
            tier="MINOR"
            value={minorTotalValue}
            ore={minorTier.ore}
            sol={minorTier.sol}
            odds={minorTier.odds}
            bgImage="/img/award_label_minor.png"
            labelImage="/img/minor_winner_label.png"
            scale={1}
          />
        </div>
      </div>

      {/* Mobile/Small Layout: Original Stacked Orientation */}
      <div className="md:hidden flex flex-col space-y-4" style={{ overflow: 'visible' }}>
        <div className="relative sm:pt-[10px]" style={{ overflow: 'visible', marginBottom: '0', paddingBottom: '0', marginTop: '0', paddingTop: '0' }}>
          <JackpotTierCard
            tier="GRAND"
            value={grandTotalValue}
            ore={grandTier.ore}
            sol={grandTier.sol}
            odds={grandTier.odds}
            bgImage="/img/grand_award_bg.png"
            labelImage="/img/grand_winner_label.png"
            scale={1}
          />
        </div>

        <div className="relative flex flex-row w-full items-start justify-center mt-[10px] sm:mt-4" style={{ overflow: 'visible', gap: '0' }}>
          <div className="flex-1 w-full flex justify-center items-center" style={{ minWidth: 0 }}>
            <JackpotTierCard
              tier="MAJOR"
              value={majorTotalValue}
              ore={majorTier.ore}
              sol={majorTier.sol}
              odds={majorTier.odds}
              bgImage="/img/award_label_major.png"
              labelImage="/img/major_winner_label.png"
              scale={0.9}
            />
          </div>
          <div className="flex-1 w-full flex justify-center items-center" style={{ minWidth: 0 }}>
            <JackpotTierCard
              tier="MINOR"
              value={minorTotalValue}
              ore={minorTier.ore}
              sol={minorTier.sol}
              odds={minorTier.odds}
              bgImage="/img/award_label_minor.png"
              labelImage="/img/minor_winner_label.png"
              scale={0.9}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
