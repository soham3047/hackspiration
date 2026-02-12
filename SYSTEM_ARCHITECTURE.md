# Club Voting System - Architecture Overview

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      Algorand Network                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           ClubVoting Smart Contract (ARC4)             │  │
│  │  ════════════════════════════════════════════════════════  │
│  │                                                              │
│  │  BoxMap Storage:                                            │
│  │  ├─ candidates: club:name:position → votes                 │
│  │  ├─ candidate_list: club:position:index → name             │
│  │  ├─ election_start: club:position → timestamp              │
│  │  ├─ election_duration: club:position → seconds             │
│  │  ├─ election_active: club:position → 1/0                   │
│  │  └─ voters: club:position:address → 1                      │
│  │                                                              │
│  │  Methods (9 Total):                                         │
│  │  ✓ add_candidate        ✓ delete_candidate                  │
│  │  ✓ set_election_duration ✓ start_election                   │
│  │  ✓ end_election  ✓ vote                                     │
│  │  ✓ get_candidate_votes  ✓ is_election_active                │
│  │  ✓ get_election_info                                        │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          ▲                                    ▲
          │ Read/Write Transactions           │
          │                                    │
┌─────────────────────────────────────────────────────────────────┐
│              Frontend Application (React/TypeScript)            │
│  ════════════════════════════════════════════════════════════   │
│                                                                  │
│  ┌──────────────────────┐        ┌──────────────────────┐      │
│  │   Home.tsx           │        │  NOT SHOWN: Other    │      │
│  │  (Navigation Hub)    │        │  Components          │      │
│  │                      │        │  (SendAlgo, Bank,    │      │
│  │ ┌────────────────┐   │        │   etc.)              │      │
│  │ │ Admin Button   │   │        └──────────────────────┘      │
│  │ ├────────────────┤   │                                       │
│  │ │ Voter Button   │   │        ┌──────────────────────┐      │
│  │ └────────────────┘   │        │ Connect Wallet       │      │
│  └──────────────────────┘        │ (WalletProvider)     │      │
│           │                       └──────────────────────┘      │
│           ├─ Opens Modal ──┐                                    │
│           └─ Opens Modal ──┤                                    │
│                            │                                    │
│       ┌────────────────────┴─────────────────────┐              │
│       │                                           │              │
│  ┌────▼──────────────────────┐  ┌──────────────▼────────────┐ │
│  │   AdminProfile.tsx        │  │   UserProfile.tsx         │ │
│  │  (Admin Dashboard)        │  │  (Voter Booth)            │ │
│  ├───────────────────────────┤  ├──────────────────────────┤ │
│  │ ✓ Add Candidate           │  │ ✓ Select Club/Position   │ │
│  │ ✓ Delete Candidate        │  │ ✓ View Status (3s check) │ │
│  │ ✓ Set Duration            │  │ ✓ Select Candidate       │ │
│  │ ✓ Start Election          │  │ ✓ Cast Vote              │ │
│  │ ✓ End Election            │  │ ✓ View Results           │ │
│  │                           │  │ ✓ See Rankings           │ │
│  │ Purple/Pink Theme         │  │ Indigo/Cyan Theme        │ │
│  └────┬──────────────────────┘  └────┬────────────────────┘ │
│       │                              │                        │
│       └──────────┬───────────────────┘                         │
│                  │                                             │
│  ┌───────────────▼────────────────────────────────────────┐   │
│  │  ClubVotingClientExtended.ts (Contract Bridge)         │   │
│  │  ════════════════════════════════════════════════════  │   │
│  │                                                         │   │
│  │  9 Async Methods:                                       │   │
│  │  • addCandidate()          • deleteCandidate()         │   │
│  │  • setElectionDuration()   • startElection()           │   │
│  │  • endElection()           • vote()                    │   │
│  │  • getCandidateVotes()     • isElectionActive()        │   │
│  │  • getElectionInfo()                                    │   │
│  │                                                         │   │
│  │  Uses: AlgorandClient, TransactionSigner               │   │
│  └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

### Adding a Candidate (Admin)
```
Admin User
    │
    ├─ Click "Add Candidate" Button
    │
    ▼
AdminProfile.tsx
    │
    ├─ Input: Club Name, Candidate Name, Position
    │
    ├─ Validation Check
    │  └─ Fields not empty?
    │
    ▼
handleAddCandidate()
    │
    ├─ Create ClubVotingClient
    │
    ├─ Call client.addCandidate()
    │
    ▼
ClubVotingClientExtended.ts
    │
    ├─ Format parameters
    │
    ├─ Create transaction
    │
    ▼
Algorand Network
    │
    ├─ Validate Admin Status
    │
    ├─ Create Box Storage
    │  └─ Key: "club:name:position"
    │  └─ Value: 0 (initial votes)
    │
    ▼
Transaction Success
    │
    ├─ Return to AdminProfile
    │
    ├─ Show Success Snackbar
    │
    ├─ Clear form inputs
    │
    ▼
Admin User Sees
    └─ ✅ Candidate added successfully!
```

### Casting a Vote (User)
```
Regular User
    │
    ├─ Click "Cast Vote" Button
    │
    ▼
UserProfile.tsx
    │
    ├─ Selected: Club, Position, Candidate
    │
    ├─ Validation Checks
    │  ├─ Candidate selected?
    │  ├─ Club selected?
    │  └─ Election active?
    │
    ▼
handleVote()
    │
    ├─ Create ClubVotingClient
    │
    ├─ Call client.vote()
    │
    ▼
ClubVotingClientExtended.ts
    │
    ├─ Format: club, candidate_name, position
    │
    ├─ Create vote transaction
    │
    ▼
Smart Contract (vote method)
    │
    ├─ Check 1: Is election active?
    │  └─ election_active[club:position] == 1
    │
    ├─ Check 2: Has user already voted?
    │  └─ voters[club:position:sender_address] exists?
    │
    ├─ Check 3: Is voting period still open?
    │  └─ Current_time <= start_time + duration
    │
    ├─ All checks pass? YES
    │
    ├─ Increment vote count
    │  └─ candidates[club:name:position] += 1
    │
    ├─ Mark user as voted
    │  └─ voters[club:position:sender_address] = 1
    │
    ▼
Transaction Success
    │
    ├─ Return to UserProfile
    │
    ├─ Show Success Snackbar
    │
    ├─ Refresh election info
    │
    ├─ Clear candidate selection
    │
    ▼
User Sees
    └─ ✅ Your vote recorded! / ❌ Error message if checks failed
```

### Viewing Results
```
User
    │
    ├─ Click "View Results" Button
    │
    ▼
UserProfile.tsx
    │
    ├─ Set loading state
    │
    ├─ For each candidate in list:
    │  │
    │  ├─ Call getCandidateVotes()
    │  │
    │  └─ Return votes for candidate
    │
    ├─ Collect all results
    │
    ├─ Sort by vote count (descending)
    │
    ├─ Add rankings (🥇 🥈 🥉)
    │
    ▼
Display Results Component
    │
    ├─ For each candidate:
    │  ├─ Show name
    │  ├─ Show vote count
    │  ├─ Draw bar chart (% of total)
    │  └─ Show ranking
    │
    ▼
User Sees
    └─ Live Election Results
       with visual progress bars
```

## Component Interaction Flow

```
┌──────────────┐
│   Home       │ ← Main navigation hub
└──────┬───────┘
       │
       ├─────────────────┬──────────────────┐
       │                 │                  │
       ▼                 ▼                  ▼
   [Other]         AdminProfile      UserProfile
   Components      (Admin Mode)      (User Mode)
       │                 │                  │
       │            ┌────┴──────┐           │
       │            │Client     │           │
       │            │Bridge     │           │
       │            └────┬──────┘           │
       │                 │                  │
       │            ┌────┴──────────────────┘
       │            │
       └────────┬───┘
                │
          Smart Contract
          (Algorand)
```

## State Management Flow

### Admin Component State
```
AdminProfile.tsx
├─ club: string              (selected club)
├─ candidateName: string     (candidate to add/delete)
├─ position: string          (President, Secretary, etc.)
├─ durationSeconds: number   (voting duration)
└─ loading: boolean          (transaction in progress)
```

### User Component State
```
UserProfile.tsx
├─ club: string              (selected club)
├─ position: string          (elected position)
├─ candidates: Candidate[]   (list of candidates)
├─ selectedCandidate: string (who to vote for)
├─ loading: boolean          (voting in progress)
├─ loadingResults: boolean   (fetching results)
├─ electionActive: boolean   (is voting open)
├─ electionInfo: {           (timing info)
│  ├─ startTime: number
│  ├─ duration: number
│  └─ timeRemaining: number
├─ results: Candidate[]      (election results)
└─ showResults: boolean      (show results view)
```

## Security Architecture

```
┌────────────────────────────────────────────────────────┐
│            Security Layers                             │
├────────────────────────────────────────────────────────┤
│                                                         │
│ Layer 1: Frontend Validation                           │
│ ├─ Check wallet connected                             │
│ ├─ Validate form inputs                               │
│ ├─ Disable buttons when inactive                       │
│ └─ Show appropriate error messages                     │
│                                                         │
│ Layer 2: Contract Permissions                          │
│ ├─ Verify sender is admin (for admin functions)        │
│ ├─ Verify election is active (for voting)              │
│ ├─ Verify election not expired (for voting)            │
│ └─ Verify no double voting (for voting)                │
│                                                         │
│ Layer 3: On-Chain Storage                              │
│ ├─ Immutable blockchain records                        │
│ ├─ Transaction signatures verify sender                │
│ ├─ Box storage ties to specific app                    │
│ └─ All votes permanently recorded                      │
│                                                         │
│ Layer 4: Network Security                              │
│ ├─ HTTPS for all API calls                             │
│ ├─ Algorand consensus verification                     │
│ ├─ Transaction confirmation (6 blocks finality)        │
│ └─ Private key never sent to server                    │
│                                                         │
└────────────────────────────────────────────────────────┘
```

## File Structure

```
Hackathon-QuickStart-template/
├── IMPLEMENTATION_SUMMARY.md         ← This file
├── VOTING_QUICK_START.md            ← Quick 5-min setup
├── DEPLOYMENT_GUIDE.md              ← Deploy instructions
├── projects/
│   ├── contracts/
│   │   ├── pyproject.toml           [updated with dependencies]
│   │   └── smart_contracts/
│   │       └── counter/
│   │           └── contract.py      [ENHANCED - 9 new methods]
│   │
│   ├── frontend/
│   │   └── src/
│   │       ├── App.tsx              [wallet setup - unchanged]
│   │       ├── Home.tsx             [UPDATED - added 2 buttons]
│   │       ├── main.tsx             [entry point - unchanged]
│   │       ├── components/
│   │       │   ├── AdminProfile.tsx [NEW - admin dashboard]
│   │       │   ├── UserProfile.tsx  [NEW - voter booth]
│   │       │   ├── AppCalls.tsx     [existing voting - unchanged]
│   │       │   ├── ConnectWallet.tsx[unchanged]
│   │       │   └── ... (other components)
│   │       ├── contracts/
│   │       │   ├── ClubVotingClient.ts         [auto-generated]
│   │       │   └── ClubVotingClientExtended.ts [NEW - bridge]
│   │       ├── utils/               [unchanged]
│   │       └── styles/              [unchanged]
│   └── README.md
│
└── README.md
```

## Network Communication

```
Frontend                    Algorand Network
   │                              │
   ├─ Connect Wallet ────────────►│
   │  (via WalletProvider)        │
   │◄──────────── Account Info ───┤
   │                              │
   ├─ Build Transaction ──────────►│
   │                              │
   ├─ Sign Transaction ───────────►│ (on user's device)
   │  (on device, secure)         │
   │                              │
   ├─ Submit Transaction ─────────►│
   │                              │ Consensus
   │◄────── Transaction ID ───────┤ Verification
   │                              │
   ├─ Poll for Status ────────────►│
   │                              │
   │ (6 blocks = finality)        │
   │                              │
   │◄───── State Updated ─────────┤
   │                              │
   ├─ Read Updated State ─────────►│  Read-only
   │                              │  (free, no transaction)
   │◄────── State Data ───────────┤
   │                              │

Result: Immutable, transparent, secure voting record
```

## Deployment Architecture

```
Development
    │
    ├─ LocalNet (SQLite Backend)
    │  └─ Fast iteration, free testing
    │
    ▼
Staging
    │
    ├─ TestNet (Real Algorand Network)
    │  └─ Pre-production testing with real network
    │
    ▼
Production
    │
    └─ MainNet (Real Algorand Network)
       └─ Live elections with real value
```

## Summary of Interactions

```
Timeline of a Complete Election:

T=0:00    │ Admin deploys contract
          │
T=0:05    │ Admin creates admin profile
          │ Admin adds 3 candidates
          │
T=0:10    │ Admin sets election duration (1 hour = 3600s)
          │ Admin starts election
          │ Status: "✅ Voting is OPEN"
          │
T=0:30    │ Users connect wallets
          │ Users see election status
          │ User A votes for Candidate 1
          │ User B votes for Candidate 2
          │ User C votes for Candidate 1
          │ Results: Candidate 1: 2, Candidate 2: 1
          │
T=0:59    │ Users can still vote
          │ Results continue updating
          │
T=1:00    │ Voting period expires
          │ Status: "⏰ Voting Time Expired"
          │
T=1:01    │ Admin ends election
          │ Status becomes "❌ Voting is CLOSED"
          │
T=1:02    │ Final results visible to all
          │ Immutable blockchain record created
          │
Permanent │ Results stored on blockchain forever
Archive   │ Can be queried anytime
```

---

This architecture provides:
- ✅ Secure admin controls
- ✅ Democratic user voting
- ✅ Transparent results
- ✅ Immutable records
- ✅ Scalable design

**Status**: Ready for Deployment 🚀
