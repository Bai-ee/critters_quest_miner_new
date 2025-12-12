# Rounds Table Component

A Next.js component that displays mining rounds and winners data from MongoDB using Mongoose.

## Features

- **Real-time Data**: Fetches latest rounds from MongoDB
- **Auto-refresh**: Updates every 30 seconds
- **Responsive Design**: Matches the mining dashboard aesthetic
- **Winner Tracking**: Shows ORE winners, including single winner lottery outcomes
- **Motherlode Display**: Highlights rounds with motherlode rewards
- **Time Display**: Shows relative time (e.g., "2 min ago")

## Installation

1. **Install Dependencies**:
```bash
pnpm install
```

This will install `mongoose` which is already added to `package.json`.

2. **Configure MongoDB Connection**:

Create a `.env.local` file in the frontend directory:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your MongoDB connection string:

```env
MONGODB_URI=mongodb://localhost:27017/ore_mining
```

Or for MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ore_mining?retryWrites=true&w=majority
```

## Usage

### Import and Use the Component

```tsx
import RoundsTable from '@/components/RoundsTable';

export default function Page() {
  return (
    <div className="container mx-auto p-8">
      <RoundsTable />
    </div>
  );
}
```

## File Structure

```
frontend/
├── app/
│   └── api/
│       └── rounds/
│           └── route.ts          # API endpoint for fetching rounds
├── components/
│   └── RoundsTable.tsx           # Main table component
├── lib/
│   ├── mongodb.ts                # Mongoose connection utility
│   └── models/
│       ├── Round.ts              # Round schema/model
│       └── Winner.ts             # Winner schema/model
└── .env.local                    # MongoDB connection string
```

## Data Structure

### Round Model
```typescript
{
  round_id: number;
  winning_square: number;
  top_miner: string;
  num_winners: number;
  total_deployed: number;        // in lamports
  total_vaulted: number;          // in lamports
  total_winnings: number;         // in lamports
  total_minted: number;           // in lamports
  lottery_outcome: string;        // "Split" | "Single Winner" | "Motherlode"
  motherlode_tier: string;        // "None" | "Minor" | "Major" | "Grand"
  ore_motherlode_payout: number;
  sol_motherlode_payout: number;
  start_slot: number;
  end_slot: number;
  timestamp: Date;
  round_winner?: string;          // Pubkey of single winner (if applicable)
}
```

### Winner Model
```typescript
{
  round_id: number;
  winning_square: number;
  miner: string;                  // Pubkey
  deployed_amount: number;
  sol_reward: number;
  ore_reward_guaranteed: number;
  ore_reward_lottery: number;
  motherlode_ore_reward: number;
  motherlode_sol_reward: number;
  is_lottery_winner: boolean;
  lottery_outcome: string;
  timestamp: Date;
}
```

## API Endpoint

### GET `/api/rounds`

Fetches the latest rounds with their winners.

**Query Parameters:**
- `limit` (optional): Number of rounds to fetch (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "round_id": 83821,
      "winning_square": 6,
      "lottery_outcome": "Split",
      "num_winners": 229,
      "total_deployed": 7566800000,
      "total_vaulted": 721200000,
      "total_winnings": 6490800000,
      "motherlode_tier": "None",
      "timestamp": "2024-12-11T20:00:00.000Z",
      "winners": [...]
    }
  ]
}
```

## Styling

The component uses Tailwind CSS and matches the dark theme with:
- Dark background (`bg-gray-800`)
- Purple accents for SOL amounts
- Yellow accents for lottery winners and motherlodes
- Hover effects on table rows
- Responsive design

## Features Explained

### ORE Winner Column
- Shows "Split" for split lottery outcomes
- Shows truncated wallet address for single winner outcomes
- Highlighted with yellow badge for single winners

### Motherlode Column
- Shows tier (Minor/Major/Grand) when applicable
- Shows "–" when no motherlode

### Time Column
- Relative time display (e.g., "2 min ago", "1 hour ago")
- Updates on each data refresh

### Number Formatting
- SOL amounts: 9 decimals
- ORE amounts: 11 decimals (handled by backend)
- Addresses: Truncated to first 4 and last 4 characters

## Troubleshooting

### "Cannot find module 'mongoose'" Error
Run `pnpm install` to install dependencies.

### "Failed to connect to MongoDB" Error
- Check your `MONGODB_URI` in `.env.local`
- Ensure MongoDB is running
- Verify network connectivity to MongoDB server

### No Data Showing
- Verify the MongoDB collections exist: `rounds` and `winners`
- Check the API endpoint: `http://localhost:3000/api/rounds`
- Look at browser console for errors

## Development

Run the development server:
```bash
pnpm dev
```

The component will be available at `http://localhost:3000` (or wherever you include it).

## Notes

- The component auto-refreshes every 30 seconds
- Data is fetched server-side via API route for better performance
- Mongoose connection is cached to prevent connection pool exhaustion
- The table is responsive and scrollable on mobile devices
