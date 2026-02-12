import React, { useState, useEffect } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import FaceRecognition from './FaceRecognition'
import CertificateGeneration from './CertificateGeneration'

interface UserVotingDashboardProps {
  username: string
  appId: number
  onLogout: () => void
}

interface Candidate {
  id: string
  name: string
  position: string
  votes: number
}

const UserVotingDashboard: React.FC<UserVotingDashboardProps> = ({ username, appId, onLogout }) => {
  const { activeAddress } = useWallet()
  const { enqueueSnackbar } = useSnackbar()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [hasVoted, setHasVoted] = useState(false)
  const [votedFor, setVotedFor] = useState<string | null>(null)
  const [resultsVisible, setResultsVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [faceVerified, setFaceVerified] = useState(false)
  const [faceVerificationError, setFaceVerificationError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'voting' | 'certificate'>('voting')

  // Load candidates and voting status from localStorage
  useEffect(() => {
    const savedCandidates = JSON.parse(localStorage.getItem('clubVotingCandidates') || '[]')
    if (savedCandidates.length === 0) {
      // Initialize with default candidates if none exist
      const defaultCandidates: Candidate[] = [
        { id: 'pres1', name: 'John Doe', position: 'President', votes: 0 },
        { id: 'pres2', name: 'Jane Smith', position: 'President', votes: 0 },
        { id: 'sec1', name: 'Mike Johnson', position: 'Secretary', votes: 0 },
        { id: 'sec2', name: 'Sarah Williams', position: 'Secretary', votes: 0 },
      ]
      setCandidates(defaultCandidates)
    } else {
      setCandidates(savedCandidates)
    }

    // Check if this user has already voted
    const votingRecord = JSON.parse(localStorage.getItem('clubVotingRecord') || '{}')
    if (votingRecord[username]) {
      setHasVoted(true)
      setVotedFor(votingRecord[username])
    }

    // Check if results are enabled
    const votingSettings = JSON.parse(localStorage.getItem('clubVotingSettings') || '{}')
    if (votingSettings.showResults) {
      setResultsVisible(true)
    }
  }, [username])

  const handleVote = async (candidateId: string) => {
    if (!faceVerified) {
      enqueueSnackbar('Please verify your face before voting', { variant: 'warning' })
      return
    }

    if (hasVoted) {
      enqueueSnackbar('You have already voted!', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      // Simulate blockchain transaction delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update candidates with new vote count
      const updatedCandidates = candidates.map((c) =>
        c.id === candidateId ? { ...c, votes: c.votes + 1 } : c
      )
      setCandidates(updatedCandidates)
      localStorage.setItem('clubVotingCandidates', JSON.stringify(updatedCandidates))

      // Record the vote
      const votingRecord = JSON.parse(localStorage.getItem('clubVotingRecord') || '{}')
      votingRecord[username] = candidateId
      localStorage.setItem('clubVotingRecord', JSON.stringify(votingRecord))

      setHasVoted(true)
      setVotedFor(candidateId)
      enqueueSnackbar('Your vote has been recorded successfully!', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Error recording vote: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleFaceVerified = () => {
    setFaceVerified(true)
    setFaceVerificationError(null)
  }

  const handleFaceVerificationFailed = (reason: string) => {
    setFaceVerified(false)
    setFaceVerificationError(reason)
    enqueueSnackbar(reason, { variant: 'error' })
  }

  const groupedCandidates = {
    President: candidates.filter((c) => c.position === 'President'),
    Secretary: candidates.filter((c) => c.position === 'Secretary'),
  }

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)

  return (
    <div className="min-h-screen bg-gradient-to-tr from-cyan-400 via-blue-300 to-cyan-400">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-teal-700">🗳️ Quadrant</h1>
            <p className="text-gray-600">Welcome, <span className="font-semibold">{username}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-outline btn-error"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-6xl mx-auto">
          <div className="tabs tabs-bordered">
            <button
              onClick={() => setActiveTab('voting')}
              className={`tab ${activeTab === 'voting' ? 'tab-active' : ''}`}
            >
              🗳️ Voting
            </button>
            <button
              onClick={() => setActiveTab('certificate')}
              className={`tab ${activeTab === 'certificate' ? 'tab-active' : ''}`}
            >
              📜 Certificate
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tab Content */}
        {activeTab === 'voting' ? (
          <>
            {/* Voting Status Alert */}
            {hasVoted && (
              <div className="alert alert-success mb-6">
                <div>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>You have successfully voted! Your vote has been recorded.</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Voting Area */}
              <div className="lg:col-span-2 space-y-6">
            {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
              <div key={position} className="card bg-white shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-2xl text-teal-700">{position}</h2>
                  <div className="divider my-2"></div>

                  {positionCandidates.length === 0 ? (
                    <p className="text-gray-500">No candidates for this position yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {positionCandidates.map((candidate) => (
                        <div key={candidate.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-800">{candidate.name}</h3>
                              <p className="text-sm text-gray-500">{candidate.position}</p>
                            </div>
                            {votedFor === candidate.id && <span className="badge badge-success">✓ Your vote</span>}
                          </div>

                          {resultsVisible && (
                            <div className="mb-3">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-700">Votes:</span>
                                <span className="font-bold text-teal-700">{candidate.votes}</span>
                              </div>
                              <progress
                                className="progress progress-info w-full"
                                value={totalVotes > 0 ? candidate.votes : 0}
                                max={Math.max(totalVotes, 1)}
                              ></progress>
                            </div>
                          )}

                          <button
                            onClick={() => handleVote(candidate.id)}
                            disabled={hasVoted || loading || !faceVerified}
                            className={`btn btn-sm w-full ${
                              votedFor === candidate.id
                                ? 'btn-success'
                                : 'btn-outline btn-primary'
                            }`}
                            title={!faceVerified ? 'Please verify your face first' : ''}
                          >
                            {loading ? <span className="loading loading-spinner loading-sm"></span> : null}
                            {hasVoted ? (votedFor === candidate.id ? 'Your Vote' : 'Already Voted') : !faceVerified ? 'Verify Face First' : 'Vote'}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Face Recognition */}
            <FaceRecognition
              username={username}
              onFaceVerified={handleFaceVerified}
              onVerificationFailed={handleFaceVerificationFailed}
              disabled={hasVoted}
            />

            {/* Face Verification Error */}
            {faceVerificationError && (
              <div className="alert alert-error text-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="stroke-current shrink-0 h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2"
                  />
                </svg>
                <span>{faceVerificationError}</span>
              </div>
            )}

            {/* Voting Statistics */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">📊 Statistics</h3>
                <div className="divider my-2"></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-gray-700">Total Votes:</span>
                    <span className="font-bold text-lg text-teal-700">{totalVotes}</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-gray-700">Your Status:</span>
                    <span className={`font-bold ${hasVoted ? 'text-green-600' : 'text-orange-600'}`}>
                      {hasVoted ? '✓ Voted' : 'Pending'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-100 rounded">
                    <span className="text-gray-700">Candidates:</span>
                    <span className="font-bold text-lg text-teal-700">{candidates.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results Status */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">📈 Results</h3>
                <div className="divider my-2"></div>
                {resultsVisible ? (
                  <div className="alert alert-info">
                    <span>Results are currently visible</span>
                  </div>
                ) : (
                  <div className="alert alert-warning">
                    <span>Results will be shown when enabled by admin</span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Info */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">🔐 Wallet</h3>
                <div className="divider my-2"></div>
                <p className="text-xs text-gray-600 break-all">{activeAddress}</p>
              </div>
            </div>
          </div>
        </div>
          </>
        ) : (
          // Certificate Tab
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Certificate Generation Section */}
            <div className="lg:col-span-2">
              <CertificateGeneration username={username} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserVotingDashboard
