import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState } from 'react'
import { ClubVotingClient } from '../contracts/ClubVotingClientExtended'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AdminProfileProps {
  appId: number
}

const AdminProfile = ({ appId }: AdminProfileProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner: TransactionSigner } = useWallet()
  const [loading, setLoading] = useState(false)

  const [club, setClub] = useState('')
  const [candidateName, setCandidateName] = useState('')
  const [position, setPosition] = useState('President')
  const [durationSeconds, setDurationSeconds] = useState(3600) // 1 hour default

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })

  if (TransactionSigner) {
    algorand.setDefaultSigner(TransactionSigner)
  }

  const handleAddCandidate = async () => {
    if (!club.trim() || !candidateName.trim()) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.addCandidate(
        club,
        candidateName,
        position
      )
      
      // Store the club and candidate in localStorage
      try {
        const stored = localStorage.getItem('voting_clubs') || '{}'
        const clubs = JSON.parse(stored)
        
        if (!clubs[club]) {
          clubs[club] = {}
        }
        if (!clubs[club][position]) {
          clubs[club][position] = []
        }
        if (!clubs[club][position].includes(candidateName)) {
          clubs[club][position].push(candidateName)
        }
        
        localStorage.setItem('voting_clubs', JSON.stringify(clubs))
        // Notify storage listeners
        window.dispatchEvent(new Event('storage'))
      } catch (e) {
        console.error('Error saving to localStorage:', e)
      }

      enqueueSnackbar(`✅ Added candidate: ${candidateName} for ${position}`, {
        variant: 'success',
      })

      setCandidateName('')
    } catch (error) {
      enqueueSnackbar(`Error adding candidate: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCandidate = async () => {
    if (!club.trim() || !candidateName.trim()) {
      enqueueSnackbar('Please fill in all fields', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.deleteCandidate(
        club,
        candidateName,
        position
      )
      
      // Remove from localStorage
      try {
        const stored = localStorage.getItem('voting_clubs') || '{}'
        const clubs = JSON.parse(stored)
        
        if (clubs[club] && clubs[club][position]) {
          clubs[club][position] = clubs[club][position].filter(
            (c: string) => c !== candidateName
          )
          localStorage.setItem('voting_clubs', JSON.stringify(clubs))
          window.dispatchEvent(new Event('storage'))
        }
      } catch (e) {
        console.error('Error updating localStorage:', e)
      }

      enqueueSnackbar(`✅ Removed candidate: ${candidateName}`, {
        variant: 'success',
      })

      setCandidateName('')
    } catch (error) {
      enqueueSnackbar(`Error deleting candidate: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSetElectionDuration = async () => {
    if (!club.trim()) {
      enqueueSnackbar('Please enter a club name', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.setElectionDuration(
        club,
        position,
        BigInt(durationSeconds)
      )

      enqueueSnackbar(`✅ Election duration set to ${durationSeconds}s for ${club} - ${position}`, {
        variant: 'success',
      })
    } catch (error) {
      enqueueSnackbar(`Error setting duration: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleStartElection = async () => {
    if (!club.trim()) {
      enqueueSnackbar('Please enter a club name', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.startElection(club, position)

      enqueueSnackbar(`✅ Election started for ${club} - ${position}`, {
        variant: 'success',
      })
    } catch (error) {
      enqueueSnackbar(`Error starting election: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEndElection = async () => {
    if (!club.trim()) {
      enqueueSnackbar('Please enter a club name', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.endElection(club, position)

      enqueueSnackbar(`✅ Election ended for ${club} - ${position}`, {
        variant: 'success',
      })
    } catch (error) {
      enqueueSnackbar(`Error ending election: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 p-6">
      <div className="max-w-4xl mx-auto relative">
        {/* Close Button */}
        <button
          onClick={() => window.location.reload()} 
          className="fixed top-4 right-4 btn btn-circle btn-ghost text-2xl z-50 bg-white hover:bg-gray-100"
          title="Close Admin Dashboard"
        >
          ✕
        </button>
        
        <div className="backdrop-blur-md bg-white/90 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-purple-700 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600 mb-8">Manage club elections, candidates, and voting periods</p>

          {!activeAddress && (
            <div className="alert alert-warning shadow-lg mb-6">
              <div>
                <span>Please connect your wallet to access admin features</span>
              </div>
            </div>
          )}

          {activeAddress && (
            <>
              {/* Common Fields */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Election Settings</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Club Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Basketball Club"
                      className="input input-bordered w-full"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                      disabled={loading}
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Position</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={loading}
                    >
                      <option>President</option>
                      <option>Secretary</option>
                      <option>Treasurer</option>
                      <option>Vice President</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Candidate Management */}
              <div className="bg-blue-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                <h2 className="text-xl font-semibold text-blue-700 mb-4">Manage Candidates</h2>
                
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Candidate Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter candidate name"
                    className="input input-bordered w-full"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    disabled={loading}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading && club.trim() && candidateName.trim()) {
                        handleAddCandidate()
                      }
                    }}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-success flex-1"
                    onClick={handleAddCandidate}
                    disabled={loading || !club.trim() || !candidateName.trim()}
                  >
                    {loading ? 'Processing...' : '➕ Add Candidate'}
                  </button>
                  <button
                    className="btn btn-error flex-1"
                    onClick={handleDeleteCandidate}
                    disabled={loading || !club.trim() || !candidateName.trim()}
                  >
                    {loading ? 'Processing...' : '🗑️ Delete Candidate'}
                  </button>
                </div>
              </div>

              {/* Election Management */}
              <div className="bg-green-50 rounded-lg p-6 mb-8 border-2 border-green-200">
                <h2 className="text-xl font-semibold text-green-700 mb-4">Election Control</h2>
                
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text font-semibold">Election Duration (seconds)</span>
                  </label>
                  <input
                    type="number"
                    placeholder="3600 (1 hour)"
                    className="input input-bordered w-full"
                    value={durationSeconds}
                    onChange={(e) => setDurationSeconds(Number(e.target.value))}
                    disabled={loading}
                    min="60"
                  />
                  <span className="text-sm text-gray-600 mt-2">
                    ⏰ {durationSeconds / 3600 > 1 ? `${(durationSeconds / 3600).toFixed(2)} hours` : `${(durationSeconds / 60).toFixed(0)} minutes`}
                  </span>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-info flex-1"
                    onClick={handleSetElectionDuration}
                    disabled={loading || !club.trim()}
                  >
                    {loading ? 'Processing...' : '⏱️ Set Duration'}
                  </button>
                  <button
                    className="btn btn-success flex-1"
                    onClick={handleStartElection}
                    disabled={loading || !club.trim()}
                  >
                    {loading ? 'Processing...' : '▶️ Start Election'}
                  </button>
                  <button
                    className="btn btn-warning flex-1"
                    onClick={handleEndElection}
                    disabled={loading || !club.trim()}
                  >
                    {loading ? 'Processing...' : '⏹️ End Election'}
                  </button>
                </div>
              </div>

              {/* Info Box */}
              <div className="alert alert-info shadow-lg">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="stroke-current shrink-0 w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                  <div>
                    <h3 className="font-bold">Admin Features</h3>
                    <div className="text-xs">
                      <p>• Add/Remove candidates from club elections</p>
                      <p>• Set election voting duration</p>
                      <p>• Start and end elections</p>
                      <p>• Only the contract creator can access these features</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminProfile
