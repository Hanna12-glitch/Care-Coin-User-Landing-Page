import { WalletId, useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import ConnectWallet from './components/ConnectWallet'
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
      <nav className="bg-[#FFD1FF] dark:bg-pink-950 sticky top-0 z-50">
        <div className="w-full px-8 py-8 flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/">
            <img src="/Logo.svg" alt="Project Care Coin" className="h-10 w-auto" />
          </NavLink>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button
              onClick={isConnected ? toggleWalletModal : handleSignIn}
              className={`flex items-center gap-2 px-5 py-2 rounded-xl font-bold text-sm transition ${
                isConnected
                  ? 'bg-white/60 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  : 'bg-[#1333fa] text-white hover:bg-[#fa1179]'
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