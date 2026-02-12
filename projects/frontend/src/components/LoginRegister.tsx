import React, { useState } from 'react'

interface LoginRegisterProps {
  onLoginSuccess: (role: 'user' | 'admin', username: string) => void
  activeAddress: string | null
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'user' | 'admin' | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validation
    if (!username.trim()) {
      setError('Username is required')
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters')
      return
    }
    if (!password) {
      setError('Password is required')
      return
    }
    if (!selectedRole) {
      setError('Please select a role')
      return
    }

    if (isRegister && password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters')
      return
    }

    const userData = {
      username: username.trim(),
      password,
      role: selectedRole,
      registeredAt: new Date().toISOString(),
    }

    if (isRegister) {
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('clubVotingUsers') || '[]')
      if (existingUsers.some((u: any) => u.username.toLowerCase() === username.trim().toLowerCase())) {
        setError('Username already exists. Please choose a different username.')
        return
      }
      existingUsers.push(userData)
      localStorage.setItem('clubVotingUsers', JSON.stringify(existingUsers))
      setSuccess('Account created successfully! You can now login.')
      
      // Clear form and switch to login
      setTimeout(() => {
        setUsername('')
        setPassword('')
        setConfirmPassword('')
        setError('')
        setSuccess('')
        setSelectedRole(null)
        setIsRegister(false)
      }, 1500)
      return
    } else {
      // Check credentials for login
      const existingUsers = JSON.parse(localStorage.getItem('clubVotingUsers') || '[]')
      const user = existingUsers.find((u: any) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password)
      if (!user) {
        setError('Invalid username or password')
        return
      }
      // Success - login
      onLoginSuccess(user.role, user.username)
    }
  }

  const getAllUsers = () => {
    const users = JSON.parse(localStorage.getItem('clubVotingUsers') || '[]')
    return users
  }

  return (
    <div className="min-h-screen bg-gradient-to-tr from-teal-400 via-cyan-300 to-sky-400 flex items-center justify-center p-4">
      <div className="backdrop-blur-md bg-white/90 rounded-2xl p-8 shadow-2xl max-w-md w-full">
        <h1 className="text-3xl font-extrabold text-center text-teal-700 mb-2">
          🗳️ Quadrant
        </h1>
        <p className="text-center text-gray-600 mb-8">
          {isRegister ? 'Create your account to vote' : 'Login to your account'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role Selection */}
          {!selectedRole ? (
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Select your role:</p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('user')}
                  className="w-full p-3 text-left border-2 border-cyan-300 rounded-lg hover:bg-cyan-50 transition font-medium text-gray-700"
                >
                  🗳️ Voter - Vote in club elections
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className="w-full p-3 text-left border-2 border-purple-300 rounded-lg hover:bg-purple-50 transition font-medium text-gray-700"
                >
                  👨‍⚖️ Admin - Manage elections & candidates
                </button>
              </div>
            </div>
          ) : (
            <div className="mb-4 p-3 bg-gradient-to-r from-cyan-100 to-purple-100 rounded-lg flex justify-between items-center">
              <p className="text-sm font-medium text-gray-700">
                Role: <span className="font-bold text-teal-700">{selectedRole === 'user' ? '🗳️ Voter' : '👨‍⚖️ Admin'}</span>
              </p>
              <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="text-xs text-blue-600 hover:underline"
              >
                Change
              </button>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your username"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="Enter your password"
            />
          </div>

          {/* Confirm Password (Register only) */}
          {isRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Confirm your password"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="alert alert-error text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="alert alert-success text-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{success}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            disabled={!selectedRole}
          >
            {isRegister ? 'Create Account' : 'Login'}
          </button>

          {/* Toggle Register/Login */}
          <p className="text-center text-sm text-gray-600">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister)
                setError('')
                setSuccess('')
              }}
              className="text-teal-600 hover:underline font-medium"
            >
              {isRegister ? 'Login here' : 'Register here'}
            </button>
          </p>
        </form>

        {/* Debug: Show created accounts */}
        {getAllUsers().length > 0 && (
          <div className="mt-6 p-3 bg-gray-100 rounded-lg text-xs">
            <p className="font-semibold text-gray-700 mb-2">Created Accounts: ({getAllUsers().length})</p>
            <div className="space-y-1">
              {getAllUsers().map((user: any, idx: number) => (
                <p key={idx} className="text-gray-600">
                  • {user.username} ({user.role})
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LoginRegister
