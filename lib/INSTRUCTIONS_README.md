# Steel Framework Solana Instructions

This guide explains how to make Solana calls using the Steel framework IDL for the QUEST mining game.

## Overview

The Steel framework provides several instructions for interacting with the QUEST mining protocol:

- **Deploy** - Deploy SOL to selected squares for the current round
- **Checkpoint** - Settle miner rewards for a completed round
- **ClaimSol** - Claim SOL rewards from your miner account
- **ClaimOre** - Claim QUEST token rewards from the treasury

## File Structure

- `lib/instructions.ts` - Core instruction builders and transaction helpers
- `lib/examples.tsx` - React hooks and component examples
- `lib/accounts.ts` - PDA derivation and account fetching
- `lib/types.ts` - TypeScript types and constants
- `lib/idl.json` - Steel framework IDL (Interface Definition Language)

## Installation

The required dependencies are already in your `package.json`:

```json
{
  "@solana/web3.js": "^1.98.4",
  "@solana/wallet-adapter-react": "^0.15.39",
  "@solana/wallet-adapter-react-ui": "^0.9.39"
}
```

## Quick Start

### 1. Deploy SOL to Squares

Deploy SOL to specific squares on the 5x5 grid:

```typescript
import { useDeployToSquares } from '@/lib/examples';

function MyComponent() {
  const { deploy } = useDeployToSquares();

  const handleDeploy = async () => {
    try {
      const signature = await deploy(
        0.1,              // Amount in SOL
        [0, 5, 12],       // Square indices (0-24)
        'ENTROPY_VAR_PUBKEY' // Entropy var account
      );
      console.log('Success:', signature);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <button onClick={handleDeploy}>Deploy</button>;
}
```

### 2. Checkpoint a Round

Settle rewards for a completed round:

```typescript
import { useCheckpoint } from '@/lib/examples';

function MyComponent() {
  const { checkpoint } = useCheckpoint();

  const handleCheckpoint = async () => {
    try {
      // Checkpoints the previous round by default
      const signature = await checkpoint();
      console.log('Success:', signature);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <button onClick={handleCheckpoint}>Checkpoint</button>;
}
```

### 3. Claim SOL Rewards

Claim SOL rewards from your miner account:

```typescript
import { useClaimSol } from '@/lib/examples';

function MyComponent() {
  const { claimSol } = useClaimSol();

  const handleClaim = async () => {
    try {
      const signature = await claimSol();
      console.log('Success:', signature);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <button onClick={handleClaim}>Claim SOL</button>;
}
```

### 4. Claim QUEST Token Rewards

Claim QUEST token rewards from the treasury:

```typescript
import { useClaimOre } from '@/lib/examples';

function MyComponent() {
  const { claimOre } = useClaimOre();

  const handleClaim = async () => {
    try {
      const signature = await claimOre();
      console.log('Success:', signature);
    } catch (error) {
      console.error('Failed:', error);
    }
  };

  return <button onClick={handleClaim}>Claim QUEST</button>;
}
```

## Advanced Usage

### Manual Instruction Building

If you need more control, you can build instructions manually:

```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { createDeployInstruction } from '@/lib/instructions';
import { fetchBoard } from '@/lib/accounts';

function MyComponent() {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();

  const customDeploy = async () => {
    if (!publicKey) return;

    // Get current round ID
    const board = await fetchBoard(connection);

    // Create instruction
    const instruction = createDeployInstruction(
      publicKey,           // signer
      publicKey,           // authority
      BigInt(100_000_000), // 0.1 SOL in lamports
      0b1000000000001,     // Bitmask for squares 0 and 12
      entropyVarPubkey,
      board.roundId
    );

    // Build and send transaction
    const tx = new Transaction().add(instruction);
    const signature = await sendTransaction(tx, connection);
    await connection.confirmTransaction(signature);

    return signature;
  };

  return <button onClick={customDeploy}>Deploy</button>;
}
```

### Understanding Square Bitmasks

The `deploy` instruction uses a bitmask to specify which squares to deploy to:

```typescript
// Example: Deploy to squares 0, 5, and 12
const squares = [0, 5, 12];
let bitmask = 0;
for (const index of squares) {
  bitmask |= (1 << index);
}
// Result: bitmask = 0b1000000100001 = 4129

// Or manually:
const bitmask = (1 << 0) | (1 << 5) | (1 << 12);
```

Grid layout (0-24):

```text
 0   1   2   3   4
 5   6   7   8   9
10  11  12  13  14
15  16  17  18  19
20  21  22  23  24
```

### PDA Derivation

The library provides helper functions to derive Program Derived Addresses:

```typescript
import {
  getAutomationPDA,
  getMinerPDA,
  getTreasuryPDA,
  getBoardPDA,
  getRoundPDA,
} from '@/lib/instructions';
import { PublicKey } from '@solana/web3.js';

// Get PDAs for a specific authority
const authority = new PublicKey('YOUR_WALLET_ADDRESS');
const automationPDA = getAutomationPDA(authority);
const minerPDA = getMinerPDA(authority);

// Get global PDAs
const treasuryPDA = getTreasuryPDA();
const boardPDA = getBoardPDA();
const roundPDA = getRoundPDA(BigInt(42)); // Round 42
```

### Account Fetching

Fetch on-chain account data:

```typescript
import { fetchBoard, fetchRound } from '@/lib/accounts';
import { connection } from '@/lib/solana';

// Fetch board data
const board = await fetchBoard(connection);
console.log('Current round:', board.roundId);
console.log('End slot:', board.endSlot);

// Fetch round data
const round = await fetchRound(connection, board.roundId);
console.log('Total deployed:', round.totalDeployed);
console.log('Motherlode:', round.motherlode);
console.log('Deployed per square:', round.deployed);
```

## Instruction Details

### Deploy Instruction

**Accounts:**

- `signer` - Transaction signer (executor) - writable, signer
- `authority` - Miner authority - writable
- `automation` - Automation PDA - writable
- `board` - Board PDA - writable
- `miner` - Miner PDA - writable
- `round` - Round PDA - writable
- `systemProgram` - System program
- `entropyVar` - Entropy var account - writable
- `entropyProgram` - Entropy program

**Arguments:**

- `amount: u64` - Amount of SOL to deploy (in lamports)
- `squares: u32` - Bitmask of squares to deploy to

**PDA Seeds:**

- Automation: `["automation", authority]`
- Miner: `["miner", authority]`
- Round: `["round", board.round_id]`

### Checkpoint Instruction

**Accounts:**

- `signer` - Transaction signer - writable, signer
- `board` - Board PDA
- `miner` - Miner PDA - writable
- `round` - Round PDA - writable
- `treasury` - Treasury PDA - writable
- `systemProgram` - System program

**Arguments:** None

**PDA Seeds:**

- Treasury: `["treasury"]`

### ClaimSol Instruction

**Accounts:**

- `signer` - Transaction signer - writable, signer
- `miner` - Miner PDA - writable
- `systemProgram` - System program

**Arguments:** None

### ClaimOre Instruction

**Accounts:**

- `signer` - Transaction signer - writable, signer
- `miner` - Miner PDA - writable
- `mint` - QUEST token mint
- `recipient` - Recipient token account - writable
- `treasury` - Treasury PDA - writable
- `treasuryTokens` - Treasury token account - writable
- `systemProgram` - System program
- `tokenProgram` - Token program
- `associatedTokenProgram` - Associated token program

**Arguments:** None

## Constants

```typescript
import { CONSTANTS } from '@/lib/types';

CONSTANTS.PROGRAM_ID              // Program ID
CONSTANTS.LAMPORTS_PER_SOL        // 1e9
CONSTANTS.ONE_ORE                 // 1e9 (QUEST has 9 decimals)
CONSTANTS.SECONDS_PER_SLOT        // ~0.4 seconds
```

## Error Handling

Always wrap transactions in try-catch blocks:

```typescript
try {
  const signature = await deploy(0.1, [0, 1, 2], entropyVar);
  console.log('Success:', signature);
} catch (error) {
  if (error.message.includes('User rejected')) {
    console.log('User cancelled transaction');
  } else if (error.message.includes('insufficient funds')) {
    console.log('Not enough SOL');
  } else {
    console.error('Transaction failed:', error);
  }
}
```

## Testing

Before deploying to mainnet, test on devnet:

1. Update `.env`:

```bash
NEXT_PUBLIC_RPC_URL=https://api.devnet.solana.com
```

2. Ensure your program is deployed on devnet
3. Update `CONSTANTS.PROGRAM_ID` if needed

## Resources

- [Steel Framework Documentation](https://github.com/regolith-labs/steel)
- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)

## Support

For issues or questions:

1. Check the IDL file at `lib/idl.json`
2. Review the instruction discriminators and account structures
3. Verify PDA derivation matches the on-chain program
