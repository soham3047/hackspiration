# Club Voting Election System

A comprehensive Algorand-based election system for managing club elections, candidates, and voting with admin controls and user voting capabilities.

## Features

### Admin Dashboard (`AdminProfile.tsx`)
Admins can:
- **Add Candidates**: Add candidates to club elections for specific positions
- **Delete Candidates**: Remove candidates from elections
- **Set Election Duration**: Configure how long voting windows stay open (in seconds)
- **Start Elections**: Initiate voting periods
- **End Elections**: Close voting periods
- **Monitor Elections**: Track election status and timing

### Voter Booth (`UserProfile.tsx`)
Users can:
- **Cast Votes**: Vote for their preferred candidates in active elections
- **Select Club & Position**: Choose which election to participate in
- **View Live Results**: See current vote counts and standings
- **Check Election Status**: See if voting is currently open
- **View Remaining Time**: See countdown for voting period
- **Prevent Double Voting**: System prevents voting multiple times in same election

## Smart Contract Updates

### Enhanced `ClubVoting` Contract
Located in: `projects/contracts/smart_contracts/counter/contract.py`

#### New Methods:

**1. `add_candidate(club, name, position)`**
- Admin-only function
- Adds a candidate to the election register
- Supports multiple positions (President, Secretary, Treasurer, etc.)
- Returns vote count starting at 0

**2. `delete_candidate(club, name, position)`**
- Admin-only function
- Removes candidates from elections
- Prevents votes for deleted candidates

**3. `set_election_duration(club, position, duration_seconds)`**
- Admin-only function
- Sets how long voting window stays open
- Duration in seconds (e.g., 3600 = 1 hour)
- Automatically starts the election clock

**4. `start_election(club, position)`**
- Admin-only function
- Marks election as active
- Resets start time to current block timestamp

**5. `end_election(club, position)`**
- Admin-only function
- Marks election as inactive
- Stops accepting new votes

**6. `vote(club, candidate_name, position)`**
- User-callable function
- Casts a vote for a candidate
- Checks:
  - Election is active
  - Voting period hasn't expired
  - User hasn't already voted
- Returns error if any check fails

**7. `get_candidate_votes(club, candidate_name, position)`**
- Read-only function
- Returns current vote count for a candidate

**8. `is_election_active(club, position)`**
- Read-only function
- Returns 1 if active, 0 if inactive
- Useful for UI state

**9. `get_election_info(club, position)`**
- Read-only function
- Returns tuple: (start_timestamp, duration_seconds, is_active)
- Used for displaying time remaining

## Data Structure

### On-Chain Storage
```
BoxMap Storage:
- candidates: "{club}:{name}:{position}" → vote_count (UInt64)
- candidate_list: "{club}:{position}:{index}" → name (String)
- candidate_count: "{club}:{position}" → count (UInt64)

Election Management:
- election_start: "{club}:{position}" → timestamp (UInt64)
- election_duration: "{club}:{position}" → seconds (UInt64)
- election_active: "{club}:{position}" → 1/0 (UInt64)

Voting Registry:
- voters: "{club}:{position}:{voter_address}" → 1 (UInt64)
```

## How to Use

### Step 1: Connect Wallet
- Click "Connect Wallet" button in top right
- Select your preferred Algorand wallet (Pera, Defly, etc.)

### Step 2: Admin Setup (for admins only)

**Adding Candidates:**
1. Click "👨‍⚖️ Admin Dashboard"
2. Enter Club Name (e.g., "Basketball Club")
3. Enter Candidate Name
4. Select Position (President, Secretary, etc.)
5. Click "➕ Add Candidate"

**Setting Election Duration:**
1. Enter Club Name
2. Select Position
3. Enter duration in seconds (3600 = 1 hour)
4. Click "⏱️ Set Duration"

**Starting/Ending Elections:**
- Click "▶️ Start Election" to begin voting
- Click "⏹️ End Election" to stop voting

### Step 3: User Voting

**Casting a Vote:**
1. Click "🗳️ Voter Booth"
2. Select Club from dropdown
3. Select Position
4. Wait for election status to show "✅ Voting is OPEN"
5. Select a candidate
6. Click "🗳️ Cast Vote"

**Viewing Results:**
1. In Voter Booth, click "📊 View Results"
2. See live vote counts and rankings
3. Click "Back to Voting" to vote again in another election

## Component Files

### Frontend Components
- **`AdminProfile.tsx`** - Admin dashboard for election management
- **`UserProfile.tsx`** - User voting interface
- **`ClubVotingClientExtended.ts`** - Extended client with all contract methods

### Smart Contract
- **`contract.py`** - Enhanced ClubVoting ARC4 contract

## Mock Data

For demo purposes, `UserProfile.tsx` includes mock candidates for three clubs:
- Basketball Club
- Debating Club
- Tech Club

Each with positions: President, Secretary, Treasurer, Vice President

## Security Features

1. **Admin-Only Functions**: Only the contract creator can manage elections
2. **Vote Prevention**: Users can only vote once per election
3. **Time Validation**: Votes checked against election end time
4. **Active Status Check**: Elections must be marked as active
5. **Address Tracking**: Voter addresses recorded to prevent duplicates

## Future Enhancements

1. **Multi-Club Support**: Better filtering by club
2. **Candidate Profiles**: Store metadata (bio, platform, etc.)
3. **Voter Eligibility**: Add membership verification
4. **Results Export**: Download election results
5. **Anonymous Voting**: Encrypted voting systems
6. **Mobile App**: Native mobile voting interface
7. **Email Notifications**: Voting reminders and results
8. **Audit Logs**: Full transaction history
9. **Ranked Choice Voting**: Support ranked voting systems
10. **Scheduled Elections**: Auto-start/stop elections at specific times

## Testing

### Admin Flow
1. Deploy contract with admin account
2. Add candidates to club election
3. Set election duration (e.g., 1 hour)
4. Start election
5. (Verify active status)

### User Flow
1. Connect non-admin account
2. Select club and position
3. See active election
4. Cast vote
5. Attempt to vote again (should fail)
6. View live results

## Deployment

Before deploying, update the smart contract with proper address validation and additional security checks as needed for your use case.

```bash
# In contracts directory
python -m pip install -r pyproject.toml
python -m algokit compile -p smart_contracts
python -m algokit deploy
```

## Error Messages

- "Only the admin can..." - Non-admin trying to use admin function
- "Election is not active" - Trying to vote in inactive election
- "You have already voted in this election" - Duplicate vote attempt
- "Election voting period has ended" - Voting after deadline

## Support

For issues or questions about the voting system, refer to:
- [Algorand Documentation](https://developer.algorand.org)
- [AlgoKit Documentation](https://algorandfoundation.github.io/algokit-cli)
- [ARC4 Smart Contracts](https://arc.algorand.foundation/ARCs/arc-0004)

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Tested On**: Algorand MainNet, TestNet, and LocalNet
