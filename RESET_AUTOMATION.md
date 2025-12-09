# Reset Automation Guide

This guide explains how to automatically execute the `reset` instruction when a round ends, using a server-side automation service.

## Overview

The reset function needs to be called after a round ends to:
1. Finalize the round and determine the winning square
2. Distribute rewards to winners
3. Create the next round

## Options for Automation

### Option 1: Node.js Backend Service (Implemented)

A Node.js service that monitors the blockchain and automatically calls reset when needed.

#### Setup

1. **Install dependencies** (if not already installed):
```bash
npm install
```

2. **Create automation keypair**:
```bash
solana-keygen new --outfile automation-keypair.json
```

3. **Fund the keypair**:
```bash
# Get the address
solana address -k automation-keypair.json

# Send SOL to it (you'll need ~0.01 SOL for transaction fees)
solana transfer <ADDRESS> 0.01 --allow-unfunded-recipient
```

4. **Set environment variables**:
Create a `.env` file:
```bash
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
AUTOMATION_KEYPAIR_PATH=./automation-keypair.json
```

5. **Run the service**:
```bash
# From the frontend directory
npx tsx scripts/reset-automation.ts

# Or from the scripts directory
cd scripts
npx tsx reset-automation.ts
```

#### How It Works

1. **Monitoring**: Checks the blockchain every 5 seconds
2. **Detection**: Compares current slot with `board.endSlot + INTERMISSION_SLOTS`
3. **Execution**: When condition is met, builds and sends reset transaction
4. **Logging**: Provides detailed console output of all operations

#### Service Output

```
🤖 Reset Automation Service Initialized
📍 RPC: https://api.mainnet-beta.solana.com
🔑 Payer: 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
🚀 Starting Reset Automation Service...
⏱️ Check interval: 5000ms

📊 Slot: 250000000 | Round: 42 | End: 249999850
⛏️ Round in progress: 150 slots remaining

📊 Slot: 250000150 | Round: 42 | End: 249999850
⏳ Intermission period: 0 slots until reset

🎯 Round ended! Executing reset...
🔄 Building reset transaction for round 42...
📤 Sending reset transaction...
⏳ Confirming transaction...
✅ Reset successful!
📝 Signature: 5j7s...8k3d
🔗 Explorer: https://explorer.solana.com/tx/5j7s...8k3d
```

#### Running as a Background Service

**Using PM2** (recommended for production):
```bash
npm install -g pm2
pm2 start scripts/reset-automation.ts --name ore-reset
pm2 save
pm2 startup  # Follow instructions to enable auto-start
```

**Using systemd** (Linux):
Create `/etc/systemd/system/ore-reset.service`:
```ini
[Unit]
Description=ORE Reset Automation
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/frontend
ExecStart=/usr/bin/npx ts-node scripts/reset-automation.ts
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Then:
```bash
sudo systemctl enable ore-reset
sudo systemctl start ore-reset
sudo systemctl status ore-reset
```

### Option 2: Clockwork (Decentralized Automation)

Clockwork is a decentralized automation protocol for Solana that can trigger transactions based on time or conditions.

#### Advantages
- Fully decentralized (no need to run your own server)
- Reliable and battle-tested
- Automatic retries on failure

#### Setup

1. **Install Clockwork SDK**:
```bash
npm install @clockwork-xyz/sdk
```

2. **Create automation script**:
```typescript
import { ClockworkProvider } from '@clockwork-xyz/sdk';
import { AnchorProvider } from '@coral-xyz/anchor';

const provider = AnchorProvider.local();
const clockwork = ClockworkProvider.fromAnchorProvider(provider);

// Schedule reset to run when slot >= endSlot + 150
await clockwork.threadCreate(
  authority.publicKey,
  'ore-reset-automation',
  {
    trigger: {
      slot: endSlot + 150n
    }
  },
  [resetInstruction]
);
```

3. **Fund the thread**:
Clockwork threads need SOL to pay for execution fees.

### Option 3: AWS Lambda / Cloud Functions

Deploy the automation service to a serverless platform:

1. **Package the service**
2. **Deploy to AWS Lambda, Google Cloud Functions, or similar**
3. **Set up CloudWatch/Cloud Scheduler to trigger every minute**

#### Example AWS Lambda Handler:
```typescript
import { ResetAutomation } from './reset-automation';

export const handler = async (event: any) => {
  const service = new ResetAutomation();
  await service.checkAndReset();
  return { statusCode: 200 };
};
```

## Security Considerations

1. **Keypair Security**:
   - Never commit keypairs to version control
   - Use environment variables or secure key management
   - Rotate keys periodically

2. **RPC Limits**:
   - Use a dedicated RPC endpoint (Helius, QuickNode, etc.)
   - Implement rate limiting
   - Monitor usage and costs

3. **Error Handling**:
   - The service includes automatic retry logic
   - Failed transactions are logged but don't crash the service
   - Monitor logs for persistent failures

4. **Monitoring**:
   - Set up alerts for service downtime
   - Monitor transaction success rate
   - Track SOL balance of automation keypair

## Cost Estimation

- **Transaction fees**: ~0.000005 SOL per reset (~$0.001 at $200/SOL)
- **RPC costs**: Free tier usually sufficient for 5-second polling
- **Server costs**:
  - VPS: $5-10/month
  - Serverless: ~$0 (within free tier)
  - Clockwork: ~0.001 SOL per execution

## Troubleshooting

### Service won't start
- Check keypair path is correct
- Verify RPC URL is accessible
- Ensure dependencies are installed

### Reset transaction fails
- Check keypair has sufficient SOL
- Verify all account addresses are correct
- Check program logs for specific error

### Service stops unexpectedly
- Use PM2 or systemd for auto-restart
- Check system logs
- Monitor memory usage

## Files Created

- `scripts/reset-automation.ts` - Main automation service
- `lib/resetInstruction.ts` - Reset instruction builder
- `RESET_AUTOMATION.md` - This documentation

## Next Steps

1. Test on devnet first
2. Monitor initial runs closely
3. Set up proper monitoring and alerts
4. Consider using Clockwork for production
