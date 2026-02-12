# Club Voting System - Deployment Guide

## Prerequisites

- Python 3.9+ installed
- Algorand AlgoKit CLI installed
- Connected to an Algorand network (LocalNet, TestNet, or MainNet)
- Funded admin wallet (for transaction fees)

## Installation

### 1. Install AlgoKit
```bash
# macOS/Linux
curl -L https://github.com/algorandfoundation/algokit-cli/releases/latest/download/algokit-v0.X.X-linux-amd64 -o algokit
chmod +x algokit
sudo mv algokit /usr/local/bin/

# Windows (using Chocolatey)
choco install algokit

# Verify installation
algokit --version
```

### 2. Install Python Dependencies
```bash
cd projects/contracts
pip install -e .
# or
python -m pip install -r pyproject.toml
```

## Compiling the Smart Contract

```bash
# Navigate to contracts directory
cd projects/contracts

# Compile the Algorand smart contracts
python -m algokit compile contract smart_contracts

# This generates:
# - Approval program (TEAL code)
# - Clear program
# - ARC-56 JSON spec
# - Python client
```

## Deploying to Different Networks

### Option 1: LocalNet (For Testing)

**Start LocalNet:**
```bash
algokit localnet start
```

**Deploy to LocalNet:**
```bash
cd projects/contracts
algokit project deploy \
  --network localnet \
  --deploy-to-new-app

# Output: Your app ID and transaction ID
```

### Option 2: TestNet (For Development)

**Setup TestNet Account:**
1. Create wallet at [dispatcher.testnet.algorand.com](https://dispatcher.testnet.algorand.com)
2. Request test ALGOs at [testnet dispenser](https://testnet.algoexplorer.io/dispenser)

**Deploy to TestNet:**
```bash
# Set environment variables
export ALGOD_SERVER=https://testnet-api.algonode.cloud
export ALGOD_PORT=443
export ALGOD_TOKEN=''  # Leave empty for public node

# Deploy
algokit project deploy --network testnet --deploy-to-new-app
```

### Option 3: MainNet (Production)

**Setup MainNet Connect:**
```bash
export ALGOD_SERVER=https://mainnet-api.algonode.cloud
export ALGOD_PORT=443
export ALGOD_TOKEN=''

# Deploy
algokit project deploy --network mainnet --deploy-to-new-app
```

## Manual Deployment (If algokit deploy fails)

```python
from algosdk import client, opcodes
from algopy import ARC4Contract

# 1. Set up client
algod_address = "http://localhost:4001"
algod_token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
client = client.AlgodClient(algod_token, algod_address)

# 2. Load approval and clear programs
with open('artifacts/contract/Approval.teal', 'r') as f:
    approval_source = f.read()

with open('artifacts/contract/Clear.teal', 'r') as f:
    clear_source = f.read()

# 3. Compile programs
approval_compiled = client.compile(approval_source)
clear_compiled = client.compile(clear_source)

# 4. Create application
# (Use algosdk to send create_app transaction)
```

## Updating an Existing Deployment

If contract already exists and you need to update it:

```bash
# Deploy with update
algokit project deploy \
  --network testnet \
  --app-id YOUR_APP_ID \
  --update

# This calls opt-in and updates the approval program
```

## Contract Initialization

After deployment, the contract automatically:
1. ✅ Sets admin to contract creator
2. ✅ Initializes empty BoxMaps for candidates
3. ✅ Prepares global state for elections

**No manual initialization needed!**

## Testing Deployments

### 1. Create Test Elections

```python
from algosdk.v2client import algod
from algopy.arc4 import ARC4Contract

# Initialize client
client = algod.AlgodClient(token, server)

# Test adding candidate (Admin only)
app_client.add_candidate(
    club="Basketball Club",
    name="Alice Johnson", 
    position="President"
)

# Verify it worked
votes = app_client.get_candidate_votes(
    club="Basketball Club",
    candidate_name="Alice Johnson",
    position="President"
)
print(f"Votes: {votes}")  # Should be: 0
```

### 2. Run Test Suite

```bash
# Navigate to contracts
cd projects/contracts

# Run tests
python -m pytest tests/

# View test results
python -m pytest tests/ -v
```

### 3. Manual Testing

```bash
# Start local Algorand network
algokit localnet start

# In another terminal, run tests
cd projects/contracts
python -m pytest tests/counter_test.py -v

# Deploy test contract
algokit project deploy --network localnet --deploy-to-new-app

# See deployed contract ID in output
```

## Verifying Deployment

### Check on AlgoExplorer

1. Go to AlgoExplorer for your network:
   - LocalNet: `http://localhost:8980` (if using algokit localnet)
   - TestNet: `https://testnet.algoexplorer.io`
   - MainNet: `https://algoexplorer.io`

2. Search for your contract ID
3. Verify:
   - Creator address matches admin wallet
   - Contract code is deployed
   - Global state shows admin address

### Programmatic Verification

```python
from algosdk.v2client import algod

client = algod.AlgodClient(token, server)

# Get app info
app_info = client.application_info(APP_ID)
print(f"Creator: {app_info['app-state'][0]['addr']}")
print(f"Global State: {app_info['params']['global-state']}")

# Check if contract exists
if app_info:
    print("✓ Contract deployed successfully!")
```

## Updating the Frontend

### 1. Update App ID in Home.tsx

```tsx
// Find this line
const [appId, setAppId] = useState<number>(1013)

// Replace with your deployed ID
const [appId, setAppId] = useState<number>(YOUR_APP_ID)
```

### 2. Update Network Configuration

Create `.env.local` in `projects/frontend/`:

```env
# For LocalNet
VITE_ALGOD_NETWORK=localnet
VITE_ALGOD_SERVER=http://localhost:4001
VITE_ALGOD_PORT=4001
VITE_ALGOD_TOKEN=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa

# OR for TestNet
VITE_ALGOD_NETWORK=testnet
VITE_ALGOD_SERVER=https://testnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=

# OR for MainNet
VITE_ALGOD_NETWORK=mainnet
VITE_ALGOD_SERVER=https://mainnet-api.algonode.cloud
VITE_ALGOD_PORT=443
VITE_ALGOD_TOKEN=
```

### 3. Run Frontend

```bash
cd projects/frontend
npm install
npm run dev
```

Visit `http://localhost:5173` (or the URL shown in terminal)

## Troubleshooting

### Error: "Only the admin can add candidates"
**Solution**: Make sure you're connected with the wallet that deployed the contract

### Error: "Application not found"
**Solution**: Verify the App ID matches the deployed contract ID

### Box storage errors
**Solution**: Ensure sender account has enough ALGOs for box creation fees (~2500 microAlgo per new box)

### Transaction timeout
**Solution**: 
- Check network connection
- Verify node is responding
- Try different node endpoint

## Gas/Fee Estimates

| Operation | Approx Cost | Notes |
|-----------|------------|-------|
| Deploy Contract | 1000 µ | One-time |
| Add Candidate | 5000 µ | Creates new box |
| Delete Candidate | 2000 µ | Removes box |
| Cast Vote | 2000 µ | Updates existing box |
| View Results | 0 µ | Read-only, free |

## Network Endpoints

### LocalNet
- Server: `http://localhost:4001`
- Indexer: `http://localhost:8980`
- Explorer: `http://localhost:8980`

### TestNet
- Server: `https://testnet-api.algonode.cloud`
- Port: `443`
- Explorer: `https://testnet.algoexplorer.io`
- Dispenser: `https://testnet.algoexplorer.io/dispenser`

### MainNet
- Server: `https://mainnet-api.algonode.cloud`
- Port: `443`
- Explorer: `https://algoexplorer.io`

## Post-Deployment Checklist

- [ ] Contract deployed successfully
- [ ] App ID obtained
- [ ] Admin function tests pass
- [ ] User voting tests pass
- [ ] Frontend App ID updated
- [ ] Network configuration correct
- [ ] Wallet connected successfully
- [ ] Admin dashboard accessible
- [ ] Voter booth accessible
- [ ] Can add candidates
- [ ] Can start/end elections
- [ ] Can cast votes
- [ ] Can view results

## Rollback Procedure

If something goes wrong:

```bash
# Option 1: Deploy new contract version
algokit project deploy --network testnet --deploy-to-app APP_ID --update

# Option 2: Create fresh deployment (for testing)
algokit project deploy --network testnet --deploy-to-new-app

# Option 3: Clear state and redeploy
# Note: This will erase all election data
algokit localnet reset
algokit localnet start
algokit project deploy --network localnet --deploy-to-new-app
```

## Support

- **AlgoKit Docs**: https://algorandfoundation.github.io/algokit-cli
- **Algorand Docs**: https://developer.algorand.org
- **Community**: https://discord.gg/algorand

---

**Version**: 1.0.0
**Last Updated**: February 2026
