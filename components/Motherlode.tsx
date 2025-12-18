import { gramsToOre, lamportsToSol } from '@/lib/accounts';
import { useRoundData } from '@/hooks/useRoundData';
import { useMemo } from 'react';
import { JackpotTierCard } from './JackpotTierCard';

interface MotherlodeProps {
  amount?: bigint;
  endSlot?: bigint;
  currentSlot?: bigint;
  startSlot?: bigint;
}

export function Motherlode({ endSlot, currentSlot, startSlot }: MotherlodeProps) {
  const { treasury } = useRoundData();

  const data = useMemo(() => {
    if (!treasury) return null;
    return {
      minor: {
        ore: gramsToOre(treasury.motherlodeOreMinor),
        sol: lamportsToSol(treasury.motherlodeSolMinor),
      },
      major: {
        ore: gramsToOre(treasury.motherlodeOreMajor),
        sol: lamportsToSol(treasury.motherlodeSolMajor),
      },
      grand: {
        ore: gramsToOre(treasury.motherlodeOreGrand),
        sol: lamportsToSol(treasury.motherlodeSolGrand),
      }
    };
  }, [treasury]);

  if (!data) return null;

  return (
    <div className="w-full max-w-[800px] mx-auto" style={{ overflow: 'visible', marginTop: '-82px' }}>
      <div className="flex flex-col items-center w-full gap-0">
        {/* GRAND Card - Full Width */}
        <div className="w-full px-2">
          <JackpotTierCard
            tier="GRAND"
            ore={data.grand.ore}
            sol={data.grand.sol}
            odds="1/2500"
            bgImage="/img/grand_award_bg.png"
            labelImage="/img/grand_winner_label.png"
            scale={1}
          />
        </div>

        {/* MAJOR and MINOR - Side by Side with 2px gap */}
        <div className="flex flex-row w-full gap-[2px] px-2" style={{ marginTop: '-12px' }}>
          <div className="flex-1 min-w-0">
            <JackpotTierCard
              tier="MAJOR"
              ore={data.major.ore}
              sol={data.major.sol}
              odds="1/625"
              bgImage="/img/award_label_major.png"
              labelImage="/img/major_winner_label.png"
              scale={0.9}
            />
          </div>
          <div className="flex-1 min-w-0">
            <JackpotTierCard
              tier="MINOR"
              ore={data.minor.ore}
              sol={data.minor.sol}
              odds="1/125"
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
