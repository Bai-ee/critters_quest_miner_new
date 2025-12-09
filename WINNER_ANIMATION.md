# Winner Square Animation Implementation

## Overview
Added animated visual indication of the winning square in the mining game grid based on the on-chain logic from the Solana program.

## Changes Made

### 1. **lib/accounts.ts** - Added `getWinningSquare()` function
- Calculates the winning square index (0-24) from a round's `slotHash`
- Matches the Rust implementation in `api/src/state/round.rs:68-70`
- Algorithm:
  1. Checks if `slotHash` is all zeros (round not finalized)
  2. Converts first 8 bytes to u64 (little-endian) to get RNG value
  3. Returns `rng % 25` as the winning square index
- Returns `null` if the round hasn't been finalized yet

### 2. **components/Grid.tsx** - Enhanced with winner animation
- Imports `getWinningSquare` utility function
- Calculates winning square on every render using `round.slotHash`
- Uses React state and `useEffect` to trigger animation with a 100ms delay
- Visual effects for winning square:
  - **Golden gradient background**: `from-yellow-400 via-amber-500 to-yellow-600`
  - **Pulsing animation**: `animate-pulse` for attention-grabbing effect
  - **Bouncing crown emoji**: 👑 centered over the square
  - **Scale effect**: `scale-110` to make it stand out
  - **Enhanced borders**: Thicker yellow borders with ring effect
  - **Shadow effects**: Golden glow with `shadow-2xl shadow-yellow-500/50`
  - **Text changes**: "WINNER!" label instead of "SOL", yellow-tinted text

## How It Works

### On-Chain Logic (Rust)
```rust
// From: ore/program/src/reset.rs:133
let winning_square = round.winning_square(r);

// From: ore/api/src/state/round.rs:68-70
pub fn winning_square(&self, rng: u64) -> usize {
    (rng % 25) as usize
}
```

### Frontend Logic (TypeScript)
```typescript
// Calculate winning square from slot hash
const winningSquare = getWinningSquare(round.slotHash);

// Returns null if round not finalized, or 0-24 if finalized
export function getWinningSquare(slotHash: Uint8Array): number | null {
  const isZeroHash = slotHash.every(byte => byte === 0);
  if (isZeroHash) return null;
  
  let rng = 0n;
  for (let i = 0; i < 8; i++) {
    rng |= BigInt(slotHash[i]) << BigInt(i * 8);
  }
  
  return Number(rng % 25n);
}
```

## Animation Behavior

1. **Before Round Ends**: No winner shown (slotHash is all zeros)
2. **After Reset Event**: When the round is finalized via the `reset` instruction:
   - The `slotHash` is populated from the entropy var
   - Frontend calculates winning square
   - 100ms delay, then animation triggers
3. **Visual Feedback**:
   - Golden pulsing gradient
   - Bouncing crown emoji
   - "WINNER!" text
   - Elevated z-index to appear above other squares

## Integration with On-Chain Events

The winning square is determined by the `ResetEvent` emitted in `program/src/reset.rs`:
- Event includes `winning_square` field (line 273)
- Calculated from entropy var's random value
- Frontend can independently verify by reading `round.slotHash`

## Testing

To test the animation:
1. Wait for a round to complete
2. Call the `reset` instruction to finalize the round
3. The winning square will automatically animate in the grid
4. The animation persists until the next round begins

## Notes

- The lint warning about `bg-gradient-to-br` is incorrect - this is valid Tailwind CSS
- Animation is responsive and works across all screen sizes
- Winner square maintains interactivity (can still be clicked)
- Z-index ensures winner square appears above others
