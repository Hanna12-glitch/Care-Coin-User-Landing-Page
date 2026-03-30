import { WalletId, useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ConnectWallet from './components/ConnectWallet'
import ThemeToggle from './components/ThemeToggle'
import { ellipseAddress } from './utils/ellipseAddress'

export default function Layout() {
  const { activeAddress, wallets } = useWallet()

  const isConnected = Boolean(activeAddress)
  const displayAddress = isConnected && activeAddress ? ellipseAddress(activeAddress, 4) : 'Sign in'

  const [openWalletModal, setOpenWalletModal] = useState(false)
  const toggleWalletModal = () => setOpenWalletModal(!openWalletModal)

  const handleSignIn = async () => {
    const web3authWallet = wallets?.find(w => w.id === WalletId.WEB3AUTH)
    if (web3authWallet) await web3authWallet.connect()
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Navbar */}
      <nav className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <NavLink to="/" className="text-2xl font-bold text-[#141938] dark:text-white hover:text-[#1333fa] transition">
            Project Care Coin
          </NavLink>

          <div className="hidden sm:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-semibold transition ${isActive ? 'text-[#1333fa]' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`
              }
            >
              Home
            </NavLink>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />

            <button
              onClick={isConnected ? toggleWalletModal : handleSignIn}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition shadow-sm border ${
                isConnected
                  ? 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
                  : 'bg-[#1333fa] border-[#1333fa] text-white hover:bg-[#fa1179]'
              }`}
            >
              {isConnected && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />}
              {displayAddress}
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#141938] text-slate-400 py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid gap-8 md:grid-cols-3">
          <div>
            <div className="text-xl font-bold text-white mb-3">Project Care Coin</div>
            <p className="text-sm">Tokenizing unpaid care work on Algorand.</p>
          </div>
          <div className="text-sm">
            <span className="text-white font-bold block mb-2">Connect</span>
            <a href="https://lora.algokit.io" target="_blank" className="hover:text-[#fb9b0c] transition">
              Lora Explorer →
            </a>
          </div>
          <div className="text-xs">© {new Date().getFullYear()} Project Care Coin. All rights reserved.</div>
        </div>
      </footer>

      <ConnectWallet openModal={openWalletModal} closeModal={toggleWalletModal} />
    </div>
  )
}