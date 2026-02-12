import React, { useState, useEffect } from 'react'
import { useSnackbar } from 'notistack'

interface AdminDashboardProps {
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

const AdminDashboard: React.FC<AdminDashboardProps> = ({ username, appId, onLogout }) => {
  const { enqueueSnackbar } = useSnackbar()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [newCandidateName, setNewCandidateName] = useState('')
  const [newCandidatePosition, setNewCandidatePosition] = useState('President')
  const [showResults, setShowResults] = useState(false)
  const [loading, setLoading] = useState(false)
  const [votes, setVotes] = useState<Record<string, number>>({})

  // Load candidates and settings from localStorage
  useEffect(() => {
    const savedCandidates = JSON.parse(localStorage.getItem('clubVotingCandidates') || '[]')
    if (savedCandidates.length === 0) {
      // Initialize with default candidates
      const defaultCandidates: Candidate[] = [
        { id: 'pres1', name: 'John Doe', position: 'President', votes: 0 },
        { id: 'pres2', name: 'Jane Smith', position: 'President', votes: 0 },
        { id: 'sec1', name: 'Mike Johnson', position: 'Secretary', votes: 0 },
        { id: 'sec2', name: 'Sarah Williams', position: 'Secretary', votes: 0 },
      ]
      setCandidates(defaultCandidates)
      localStorage.setItem('clubVotingCandidates', JSON.stringify(defaultCandidates))
    } else {
      setCandidates(savedCandidates)
    }

    // Load voting settings
    const votingSettings = JSON.parse(localStorage.getItem('clubVotingSettings') || '{}')
    setShowResults(votingSettings.showResults || false)

    // Load vote counts
    const votingRecord = JSON.parse(localStorage.getItem('clubVotingRecord') || '{}')
    setVotes(votingRecord)
  }, [])

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newCandidateName.trim()) {
      enqueueSnackbar('Please enter candidate name', { variant: 'warning' })
      return
    }

    setLoading(true)
    try {
      const newCandidate: Candidate = {
        id: `${newCandidatePosition.toLowerCase()}_${Date.now()}`,
        name: newCandidateName,
        position: newCandidatePosition,
        votes: 0,
      }

      const updatedCandidates = [...candidates, newCandidate]
      setCandidates(updatedCandidates)
      localStorage.setItem('clubVotingCandidates', JSON.stringify(updatedCandidates))

      setNewCandidateName('')
      enqueueSnackbar(`${newCandidateName} added as ${newCandidatePosition} candidate!`, { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Error adding candidate: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteCandidate = (candidateId: string) => {
    const candidate = candidates.find((c) => c.id === candidateId)
    setLoading(true)
    try {
      const updatedCandidates = candidates.filter((c) => c.id !== candidateId)
      setCandidates(updatedCandidates)
      localStorage.setItem('clubVotingCandidates', JSON.stringify(updatedCandidates))
      enqueueSnackbar(`${candidate?.name} has been removed!`, { variant: 'success' })
    } catch (error) {
      enqueueSnackbar(`Error deleting candidate: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleEnableResults = () => {
    setLoading(true)
    try {
      const votingSettings = {
        showResults: !showResults,
        lastUpdated: new Date().toISOString(),
      }
      localStorage.setItem('clubVotingSettings', JSON.stringify(votingSettings))
      setShowResults(!showResults)
      enqueueSnackbar(
        `Results ${!showResults ? 'enabled' : 'disabled'} successfully!`,
        { variant: 'success' }
      )
    } catch (error) {
      enqueueSnackbar(`Error updating results: ${(error as Error).message}`, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const handleResetVotes = () => {
    if (window.confirm('Are you sure you want to reset all votes? This cannot be undone.')) {
      setLoading(true)
      try {
        const resetCandidates = candidates.map((c) => ({ ...c, votes: 0 }))
        setCandidates(resetCandidates)
        localStorage.setItem('clubVotingCandidates', JSON.stringify(resetCandidates))
        localStorage.setItem('clubVotingRecord', JSON.stringify({}))
        setVotes({})
        enqueueSnackbar('All votes have been reset!', { variant: 'success' })
      } catch (error) {
        enqueueSnackbar(`Error resetting votes: ${(error as Error).message}`, { variant: 'error' })
      } finally {
        setLoading(false)
      }
    }
  }

  const groupedCandidates = {
    President: candidates.filter((c) => c.position === 'President'),
    Secretary: candidates.filter((c) => c.position === 'Secretary'),
  }

  const totalVotes = candidates.reduce((sum, c) => sum + c.votes, 0)
  const totalVoters = Object.keys(votes).length

  return (
    <div className="min-h-screen bg-gradient-to-tr from-purple-400 via-indigo-300 to-purple-400">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-purple-700">👨‍⚖️ Admin Dashboard</h1>
            <p className="text-gray-600">Welcome, <span className="font-semibold">{username}</span></p>
          </div>
          <button
            onClick={onLogout}
            className="btn btn-outline btn-error"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Statistics Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Total Candidates</h3>
              <p className="text-3xl font-bold text-purple-700">{candidates.length}</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Total Votes Cast</h3>
              <p className="text-3xl font-bold text-blue-700">{totalVotes}</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Total Voters</h3>
              <p className="text-3xl font-bold text-teal-700">{totalVoters}</p>
            </div>
          </div>
          <div className="card bg-white shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-sm">Results Status</h3>
              <p className={`text-sm font-bold ${showResults ? 'text-green-600' : 'text-orange-600'}`}>
                {showResults ? '✓ Visible' : '✗ Hidden'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Add Candidate Form */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-xl text-purple-700">➕ Add New Candidate</h2>
                <div className="divider"></div>
                <form onSubmit={handleAddCandidate} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Candidate Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter candidate name"
                      value={newCandidateName}
                      onChange={(e) => setNewCandidateName(e.target.value)}
                      className="input input-bordered"
                      disabled={loading}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-semibold">Position</span>
                    </label>
                    <select
                      value={newCandidatePosition}
                      onChange={(e) => setNewCandidatePosition(e.target.value)}
                      className="select select-bordered"
                      disabled={loading}
                    >
                      <option value="President">President</option>
                      <option value="Secretary">Secretary</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary w-full"
                  >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : null}
                    Add Candidate
                  </button>
                </form>
              </div>
            </div>

            {/* Candidates List by Position */}
            {Object.entries(groupedCandidates).map(([position, positionCandidates]) => (
              <div key={position} className="card bg-white shadow-xl">
                <div className="card-body">
                  <h2 className="card-title text-lg text-purple-700">{position} Candidates</h2>
                  <div className="divider my-2"></div>

                  {positionCandidates.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No candidates added yet</p>
                  ) : (
                    <div className="space-y-3">
                      {positionCandidates.map((candidate) => (
                        <div key={candidate.id} className="border border-gray-300 rounded-lg p-4 flex justify-between items-center hover:shadow-md transition">
                          <div>
                            <h3 className="font-bold text-lg">{candidate.name}</h3>
                            <div className="flex gap-3 mt-1">
                              <span className="badge badge-outline">{candidate.position}</span>
                              <span className="badge badge-primary">{candidate.votes} votes</span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteCandidate(candidate.id)}
                            disabled={loading}
                            className="btn btn-sm btn-error btn-outline"
                          >
                            Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar - Controls */}
          <div className="space-y-4">
            {/* Results Control */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">📊 Results Management</h3>
                <div className="divider my-2"></div>
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    {showResults
                      ? 'Results are currently visible to all voters'
                      : 'Results are hidden from voters'}
                  </p>
                  <button
                    onClick={handleEnableResults}
                    disabled={loading}
                    className={`btn w-full ${showResults ? 'btn-error' : 'btn-success'}`}
                  >
                    {loading ? <span className="loading loading-spinner loading-sm"></span> : null}
                    {showResults ? 'Hide Results' : 'Show Results'}
                  </button>
                </div>
              </div>
            </div>

            {/* Voting Statistics */}
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <h3 className="card-title text-lg">📈 Voting Statistics</h3>
                <div className="divider my-2"></div>
                <div className="space-y-2">
                  {candidates.map((candidate) => (
                    <div key={candidate.id} className="flex justify-between text-sm">
                      <span className="truncate">{candidate.name}</span>
                      <span className="font-bold text-purple-700">{candidate.votes}</span>
                    </div>
                  ))}
                </div>
                <div className="divider my-2"></div>
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className="text-lg text-purple-700">{totalVotes}</span>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="card bg-white shadow-xl border-2 border-red-200">
              <div className="card-body">
                <h3 className="card-title text-lg text-red-600">⚠️ Danger Zone</h3>
                <div className="divider my-2"></div>
                <button
                  onClick={handleResetVotes}
                  disabled={loading}
                  className="btn btn-outline btn-error w-full text-xs"
                >
                  Reset All Votes
                </button>
                <p className="text-xs text-gray-600 mt-2">
                  This will clear all votes and reset the system
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
