# Club Voting System - Quick Start Guide

## Overview
A complete web3 voting system for managing club elections with admin controls and user voting features.

## What's New
✨ **2 New Components Added:**
- 👨‍⚖️ **Admin Dashboard** - Manage elections and candidates
- 🗳️ **Voter Booth** - Cast votes and view results

## Quick Setup (5 Minutes)

### 1. Smart Contract is Ready
The enhanced contract is already in place with these new features:
- ✅ Add/remove candidates
- ✅ Set election duration
- ✅ Start/end elections
- ✅ Cast votes with duplicate prevention
- ✅ View live results

### 2. Components Are Ready to Use
Located in `src/components/`:
```
AdminProfile.tsx      - Admin election management
UserProfile.tsx       - User voting interface
ClubVotingClientExtended.ts - Contract client
```

### 3. Integration Complete
Navigate to Home page and look for two new cards:
```
👨‍⚖️ Admin Dashboard    - "Manage club elections, candidates, and voting periods"
🗳️ Voter Booth         - "Cast your vote in club elections and view results"
```

## How to Run

### Option 1: Local Development
```bash
cd projects/frontend
npm install
npm run dev
```

### Option 2: Build and Deploy
```bash
cd projects/frontend
npm run build
npm preview
```

## Usage Scenarios

### Scenario 1: Basketball Club Election (Admin)
1. Connect wallet (as admin)
2. Click "Admin Dashboard"
3. Enter "Basketball Club" as club name
4. Add candidates:
   - Name: "Alice Johnson" → Position: "President"
   - Name: "Bob Smith" → Position: "President"
   - Name: "Charlie Davis" → Position: "President"
5. Set duration: 3600 seconds (1 hour)
6. Click "Start Election"

### Scenario 2: Vote for Club President (User)
1. Connect wallet (as regular user)
2. Click "Voter Booth"
3. Select "Basketball Club"
4. Select "President"
5. Wait for status to show "✅ Voting is OPEN"
6. Select "Alice Johnson"
7. Click "Cast Vote"
8. View real-time results

### Scenario 3: End Election & View Final Results (Admin)
1. Admin dashboard
2. Select the club and position
3. Click "End Election"
4. User can still view results but cannot vote

## File Structure
```
src/
├── components/
│   ├── AdminProfile.tsx          [NEW] Admin dashboard
│   ├── UserProfile.tsx           [NEW] Voter booth
│   ├── AppCalls.tsx              Existing voting component
│   └── ... other components
├── contracts/
│   ├── ClubVotingClient.ts       Auto-generated client
│   └── ClubVotingClientExtended.ts [NEW] Extended methods
contracts/smart_contracts/counter/
└── contract.py                   [UPDATED] Enhanced voting contract
```

## Key Features

### Admin Can:
- ➕ Add multiple candidates per election
- 🗑️ Remove candidates anytime
- ⏱️ Set custom voting duration (seconds)
- ▶️ Start elections
- ⏹️ End elections early
- 📊 Monitor voting progress

### Users Can:
- 🗳️ Cast votes in active elections
- ✅ One vote per election (prevents double voting)
- 👀 View live vote counts
- 📈 See candidate rankings
- ⏰ Check time remaining to vote

## Data Stored On-Chain
Every vote is recorded on the Algorand blockchain:
- Candidate names and vote counts
- Election start/end times
- Voting status (active/inactive)
- Voter addresses (to prevent duplicates)

## Supported Positions
- President
- Secretary
- Treasurer
- Vice President
- *(Easily extensible to add more)*

## Security
✓ Admin-only functions protected
✓ Double-voting prevention
✓ Time-based access control
✓ Immutable blockchain records
✓ Account-based authentication

## Example Workflow

```
Timeline for Election:
├─ T=0:00    Admin adds candidates
├─ T=0:05    Admin sets 60-minute duration
├─ T=0:10    Admin starts election
├─ T=0:11-60:00  Users can vote
├─ T=30:00   Users view live results
├─ T=60:00   Voting time expires
└─ T=60:01   Admin ends election, final results published
```

## Troubleshooting

### "Connect Wallet" is grayed out
→ Install Algorand wallet (Pera, Defly, etc.) first

### Admin buttons don't work
→ Make sure you're using the admin account that deployed the contract

### Can't vote in election
→ Check:
  1. Wallet is connected
  2. Election shows "✅ Voting is OPEN"
  3. You haven't already voted in this election
  4. Election time hasn't expired

### No candidates showing
→ Admin needs to add candidates first via Admin Dashboard

## Contract Details

| Parameter | Value | Notes |
|-----------|-------|-------|
| Network | Algorand TestNet/MainNet | Configurable via .env |
| Contract Type | ARC4 Smart Contract | Python-based |
| Storage | Box Storage + Global State | Scalable |
| Admin | Contract Creator | Only admin address |
| Transaction Cost | Minimal | ~1000 microAlgo per call |

## Environment Variables
Check `.env.local` for:
```
VITE_ALGOD_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
```

## Next Steps

1. **Deploy Contract** (if not already done)
   ```bash
   cd projects/contracts
   python -m algokit compile
   python -m algokit deploy --network testnet
   ```

2. **Update App ID** (if needed)
   - Find `const appId = 1013` in `Home.tsx`
   - Replace with your deployed contract ID

3. **Test Elections**
   - Create test wallets
   - Run through admin and user scenarios
   - Check blockchain explorer for transactions

4. **Customize** (Optional)
   - Add more positions (edit `position` select options)
   - Change colors/styling (edit Tailwind classes)
   - Add more clubs (add to `mockCandidates`)

## Support & Documentation

- **Smart Contract Docs**: See `VOTING_SYSTEM_README.md`
- **Algorand Docs**: https://developer.algorand.org
- **AlgoKit Docs**: https://algorandfoundation.github.io/algokit-cli

## Common Customizations

### Add More Positions
In `AdminProfile.tsx` and `UserProfile.tsx`:
```jsx
<option>President</option>
<option>Secretary</option>
<option>Treasurer</option>
<option>Vice President</option>
<option>Historian</option>  {/* ADD HERE */}
```

### Change Color Scheme
Modify Tailwind gradient classes:
```jsx
{/* Change from orange to purple */}
className="bg-gradient-to-br from-purple-500 to-indigo-500"
```

### Modify Duration Options
In `AdminProfile.tsx`:
```jsx
<input type="number" value={durationSeconds} ... />
{/* Default: 3600 (1 hour) */}
{/* Try: 600 (10 min), 7200 (2 hours) */}
```

---

**Ready to Vote? Click the Admin Dashboard and Voter Booth buttons on the home page!** 🎉

**Version**: 1.0.0  
**Last Updated**: February 2026
