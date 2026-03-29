// src/components/EmailLogin.tsx
import { useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'

export default function EmailLogin() {
  const { wallets, activeAddress } = useWallet()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const web3authWallet = wallets?.find(w => w.id === 'web3auth')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !web3authWallet) return
    setLoading(true)
    setError('')
    try {
      // Web3Auth Email Passwordless Login
      await web3authWallet.connect({ loginProvider: 'email_passwordless', login_hint: email })
    } catch (err) {
      setError('Login fehlgeschlagen. Bitte versuche es erneut.')
    } finally {
      setLoading(false)
    }
  }

  if (activeAddress) return null // versteckt wenn eingeloggt

  return (
    <form onSubmit={handleLogin} className="w-full max-w-sm mx-auto flex flex-col gap-3">
      <label className="text-sm font-bold text-[#141938] dark:text-white text-center">
        Your email address
      </label>
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="anna@gmail.com"
        required
        className="w-full px-5 py-3.5 rounded-2xl border-2 border-[#141938]/20 dark:border-white/20 bg-white dark:bg-[#141938] text-[#141938] dark:text-white placeholder:text-[#141938]/30 focus:outline-none focus:border-[#1333fa] transition text-base"
      />
      <button
        type="submit"
        disabled={loading || !email}
        className="w-full px-5 py-3.5 rounded-2xl font-bold text-base bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-105 transition disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending link...
          </>
        ) : (
          '✉️ Sign in with Email'
        )}
      </button>
      {error && <p className="text-xs text-[#fa1179] text-center font-medium">{error}</p>}
      <p className="text-xs text-[#141938]/40 dark:text-slate-500 text-center font-medium">
        We'll send you a one-time login link. No password needed.
      </p>
    </form>
  )
}