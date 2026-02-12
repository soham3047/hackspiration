import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useState, useEffect } from 'react'
import { ClubVotingClient } from '../contracts/ClubVotingClientExtended'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface UserProfileProps {
  appId: number
}

interface Candidate {
  name: string
  votes: number
}

const UserProfile = ({ appId }: UserProfileProps) => {
  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner: TransactionSigner } = useWallet()
  const [loading, setLoading] = useState(false)
  const [loadingResults, setLoadingResults] = useState(false)

  const [club, setClub] = useState('')
  const [position, setPosition] = useState('President')
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null)
  const [electionActive, setElectionActive] = useState(false)
  const [electionInfo, setElectionInfo] = useState<{
    startTime: number
    duration: number
    timeRemaining: number
  } | null>(null)
  const [results, setResults] = useState<Candidate[]>([])
  const [showResults, setShowResults] = useState(false)

  const algodConfig = getAlgodConfigFromViteEnvironment()
  const indexerConfig = getIndexerConfigFromViteEnvironment()
  const algorand = AlgorandClient.fromConfig({
    algodConfig,
    indexerConfig,
  })

  if (TransactionSigner) {
    algorand.setDefaultSigner(TransactionSigner)
  }

  // Mock candidate list - Includes default clubs + any dynamically added ones
  const defaultCandidates: Record<string, Record<string, string[]>> = {
    'Basketball Club': {
      President: ['Alice Johnson', 'Bob Smith', 'Charlie Davis'],
      Secretary: ['Diana Lee', 'Eve Martinez'],
      Treasurer: ['Frank Wilson', 'Grace Chen'],
      'Vice President': ['Henry Brown', 'Ivy Rodriguez'],
    },
    'Debating Club': {
      President: ['Jack Thompson', 'Kate Williams'],
      Secretary: ['Liam Garcia', 'Mia Anderson'],
      Treasurer: ['Noah Taylor', 'Olivia Jackson'],
      'Vice President': ['Peter White', 'Quinn Harris'],
    },
    'Tech Club': {
      President: ['Rachel Martin', 'Samuel Clark'],
      Secretary: ['Tina Lewis', 'Uma Young'],
      Treasurer: ['Victor King', 'Wendy Scott'],
      'Vice President': ['Xavier Green', 'Yara Adams'],
    },
  }
  
  // Get stored clubs from localStorage or use defaults
  const getStoredClubs = () => {
    try {
      const stored = localStorage.getItem('voting_clubs')
      if (stored) {
        const parsed = JSON.parse(stored)
        return { ...defaultCandidates, ...parsed }
      }
    } catch (e) {
      console.error('Error loading stored clubs:', e)
    }
    return defaultCandidates
  }
  
  const mockCandidates = getStoredClubs()

  // Load candidates when club changes
  useEffect(() => {
    if (club) {
      const clubCandidates = mockCandidates[club]?.[position] || []
      setCandidates(clubCandidates.map(name => ({ name, votes: 0 })))
      setSelectedCandidate(null)
      loadElectionInfo()
    }
  }, [club, position])

  // Fetch election info
  const loadElectionInfo = async () => {
    if (!club) return
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      const info = await client.getElectionInfo(club, position)
      const [startTime, duration, isActive] = info

      const now = Math.floor(Date.now() / 1000)
      const timeRemaining = Math.max(0, Number(startTime) + Number(duration) - now)

      setElectionInfo({
        startTime: Number(startTime),
        duration: Number(duration),
        timeRemaining,
      })
      setElectionActive(Number(isActive) === 1 && timeRemaining > 0)
    } catch (error) {
      console.log('Election not yet configured for this club/position')
      setElectionActive(false)
    }
  }

  // Refresh election info periodically
  useEffect(() => {
    const interval = setInterval(loadElectionInfo, 5000) // Refresh every 5 seconds
    return () => clearInterval(interval)
  }, [club, position])

  const handleVote = async () => {
    if (!selectedCandidate || !club) {
      enqueueSnackbar('Please select a candidate', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      await client.vote(club, selectedCandidate, position)

      enqueueSnackbar(`✅ Your vote for ${selectedCandidate} has been recorded!`, {
        variant: 'success',
      })

      setSelectedCandidate(null)
      // Refresh election info
      await loadElectionInfo()
    } catch (error) {
      enqueueSnackbar(`Voting error: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  // Store club whenever candidates are added (called from AdminProfile)
  useEffect(() => {
    // Listen for storage changes from AdminProfile
    const handleStorageChange = () => {
      // Refresh club list
      if (club) {
        setSelectedCandidate(null)
        loadElectionInfo()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [club])

  const handleViewResults = async () => {
    if (!club) {
      enqueueSnackbar('Please select a club', { variant: 'warning' })
      return
    }

    setLoadingResults(true)
    try {
      const client = new ClubVotingClient({
        appId: BigInt(appId),
        algorand,
        defaultSigner: TransactionSigner,
      })

      const resultsData: Candidate[] = []
      for (const candidate of candidates) {
        const votes = await client.getCandidateVotes(club, candidate.name, position)
        resultsData.push({
          name: candidate.name,
          votes: Number(votes),
        })
      }

      setResults(resultsData.sort((a, b) => b.votes - a.votes))
      setShowResults(true)
    } catch (error) {
      enqueueSnackbar(`Error fetching results: ${(error as Error).message}`, {
        variant: 'error',
      })
    } finally {
      setLoadingResults(false)
    }
  }

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Voting Closed'
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="backdrop-blur-md bg-white/90 rounded-2xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-indigo-700 mb-2">Voting Booth</h1>
          <p className="text-gray-600 mb-8">Cast your vote for your preferred candidate</p>

          {!activeAddress && (
            <div className="alert alert-warning shadow-lg mb-6">
              <div>
                <span>Please connect your wallet to vote</span>
              </div>
            </div>
          )}

          {activeAddress && (
            <>
              {/* Club and Position Selection */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-8 border-2 border-indigo-200">
                <h2 className="text-xl font-semibold text-indigo-700 mb-4">Select Election</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Club</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={club}
                      onChange={(e) => setClub(e.target.value)}
                      disabled={loading || loadingResults}
                    >
                      <option value="">-- Select a Club --</option>
                      {Object.keys(mockCandidates).map((clubName) => (
                        <option key={clubName} value={clubName}>
                          {clubName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Position</span>
                    </label>
                    <select
                      className="select select-bordered w-full"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      disabled={loading || loadingResults || !club}
                    >
                      <option>President</option>
                      <option>Secretary</option>
                      <option>Treasurer</option>
                      <option>Vice President</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Election Status */}
              {club && (
                <div
                  className={`rounded-lg p-6 mb-8 border-2 ${
                    electionActive
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-2">
                        {electionActive ? '✅ Voting is OPEN' : '❌ Voting is CLOSED'}
                      </p>
                      {electionInfo && (
                        <p className={`text-sm ${electionActive ? 'text-green-700' : 'text-red-700'}`}>
                          ⏱️ Time Remaining: {formatTimeRemaining(electionInfo.timeRemaining)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Candidates List */}
              {club && !showResults && (
                <div className="bg-blue-50 rounded-lg p-6 mb-8 border-2 border-blue-200">
                  <h2 className="text-xl font-semibold text-blue-700 mb-4">
                    Candidates for {position}
                  </h2>

                  {candidates.length === 0 ? (
                    <p className="text-gray-600 text-center py-6">
                      No candidates registered for this position yet.
                    </p>
                  ) : (
                    <div className="space-y-3 mb-6">
                      {candidates.map((candidate) => (
                        <label key={candidate.name} className="flex items-center gap-3 p-4 border-2 border-blue-300 rounded-lg cursor-pointer hover:bg-blue-100 transition">
                          <input
                            type="radio"
                            name="candidate"
                            value={candidate.name}
                            checked={selectedCandidate === candidate.name}
                            onChange={(e) => setSelectedCandidate(e.target.value)}
                            disabled={loading || !electionActive}
                            className="radio radio-primary"
                          />
                          <span className="font-semibold text-gray-800">{candidate.name}</span>
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      className="btn btn-primary flex-1"
                      onClick={handleVote}
                      disabled={loading || !electionActive || !selectedCandidate || !club}
                    >
                      {loading ? 'Recording Vote...' : '🗳️ Cast Vote'}
                    </button>
                    <button
                      className="btn btn-secondary flex-1"
                      onClick={handleViewResults}
                      disabled={loadingResults || !club}
                    >
                      {loadingResults ? 'Loading...' : '📊 View Results'}
                    </button>
                  </div>
                </div>
              )}

              {/* Results View */}
              {showResults && (
                <div className="bg-purple-50 rounded-lg p-6 mb-8 border-2 border-purple-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-purple-700">
                      📊 Results for {position}
                    </h2>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => setShowResults(false)}
                    >
                      ✕
                    </button>
                  </div>

                  {results.length === 0 ? (
                    <p className="text-gray-600 text-center py-6">No votes recorded yet.</p>
                  ) : (
                    <div className="space-y-4">
                      {results.map((candidate, index) => {
                        const maxVotes = Math.max(...results.map(c => c.votes), 1)
                        const percentage = (candidate.votes / maxVotes) * 100
                        
                        return (
                          <div key={candidate.name}>
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-2">
                                <span className="text-md font-semibold">
                                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '  '}
                                </span>
                                <span className="font-semibold">{candidate.name}</span>
                              </div>
                              <span className="text-sm font-bold text-purple-700">{candidate.votes} votes</span>
                            </div>
                            <div className="w-full bg-purple-200 rounded-full h-3">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}

                  <button
                    className="btn btn-primary w-full mt-6"
                    onClick={() => setShowResults(false)}
                  >
                    Back to Voting
                  </button>
                </div>
              )}

              {/* Info */}
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
                    <h3 className="font-bold">How to Vote</h3>
                    <div className="text-xs">
                      <p>1. Select a club and position</p>
                      <p>2. Check election status (must be open)</p>
                      <p>3. Select your preferred candidate</p>
                      <p>4. Click "Cast Vote" to submit</p>
                      <p>5. View results anytime</p>
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

export default UserProfile
