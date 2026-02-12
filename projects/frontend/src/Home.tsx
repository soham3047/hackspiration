// src/components/Home.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import React, { useState } from 'react'
import ConnectWallet from './components/ConnectWallet'
import LoginRegister from './components/LoginRegister'
import UserVotingDashboard from './components/UserVotingDashboard'
import AdminDashboard from './components/AdminDashboard'

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  const [appId] = useState<number>(1013)
  const [openWalletModal, setOpenWalletModal] = useState<boolean>(false)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [userRole, setUserRole] = useState<'user' | 'admin' | null>(null)
  const [username, setUsername] = useState<string>('')
  const { activeAddress } = useWallet()

  const toggleWalletModal = () => {
    setOpenWalletModal(!openWalletModal)
  }

  const handleLoginSuccess = (role: 'user' | 'admin', _username: string) => {
    setUserRole(role)
    setUsername(_username)
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUserRole(null)
    setUsername('')
  }

  // If not authenticated, show login/register
  if (!isAuthenticated) {
    return (
      <>
        <LoginRegister onLoginSuccess={handleLoginSuccess} activeAddress={activeAddress || null} />
        <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
        {/* Wallet button for login page */}
        {!activeAddress && (
          <div className="absolute top-4 right-4 z-10">
            <button
              className="btn btn-accent px-5 py-2 text-sm font-medium rounded-full shadow-md"
              onClick={toggleWalletModal}
            >
              Connect Wallet
            </button>
          </div>
        )}
      </>
    )
  }

  // If authenticated as user, show user voting dashboard
  if (userRole === 'user') {
    return <UserVotingDashboard username={username} appId={appId} onLogout={handleLogout} />
  }

  // If authenticated as admin, show admin dashboard
  if (userRole === 'admin') {
    return <AdminDashboard username={username} appId={appId} onLogout={handleLogout} />
  }

  // Fallback (shouldn't reach here)
  return <div>Loading...</div>
}

export default Home
