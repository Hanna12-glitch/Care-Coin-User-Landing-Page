import { useWallet } from '@txnlab/use-wallet-react'
import { useState } from 'react'

/**
 * Home Page
 * User-facing landing page for Project Care Coin
 * Social login flow — Web3Auth email passwordless
 */
export default function Home() {
  const { activeAddress, wallets } = useWallet()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const web3authWallet = wallets?.find(w => w.id === 'web3auth')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !web3authWallet) return
    setLoading(true)
    setError('')
    try {
      await web3authWallet.connect({ loginProvider: 'email_passwordless', login_hint: email })
    } catch {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#ffffff] dark:bg-[#141938]">

      {/* Hero Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-32 pb-16 sm:pb-24">
        <div className="text-center">

          <div className="inline-block mb-6 px-4 py-1.5 bg-[#fa1179] text-white text-xs font-bold rounded-full uppercase tracking-widest shadow-sm">
            Proof-of-Concept · Built on Algorand
          </div>

          <h1 className="mt-6 text-5xl sm:text-7xl font-extrabold text-[#141938] dark:text-white leading-tight tracking-tight">
            Your care work<br />
            <span className="text-[#1333fa]">gets rewarded.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[#141938]/70 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Childcare. Eldercare. Household work. Project Care Coin turns your invisible labour into a verified digital asset — recognised, recorded, and real.
          </p>

          {/* Login Area */}
          <div className="mt-10">
            {activeAddress ? (
              <div className="px-10 py-4 rounded-2xl font-bold text-lg bg-[#1333fa] text-white shadow-lg flex items-center gap-2 justify-center w-fit mx-auto">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                Wallet connected — your token is ready!
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5">

                {/* Email Login Form */}
                <form onSubmit={handleEmailLogin} className="w-full max-w-sm flex flex-col gap-3">
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
                  {error && (
                    <p className="text-xs text-[#fa1179] text-center font-medium">{error}</p>
                  )}
                  <p className="text-xs text-[#141938]/40 dark:text-slate-500 text-center font-medium">
                    We'll send you a one-time login link. No password needed.
                  </p>
                </form>

                {/* Divider */}
                <div className="flex items-center gap-4 w-full max-w-sm">
                  <div className="flex-1 h-px bg-[#141938]/20 dark:bg-white/20" />
                  <span className="text-xs text-[#141938]/40 dark:text-slate-500 font-medium">or</span>
                  <div className="flex-1 h-px bg-[#141938]/20 dark:bg-white/20" />
                </div>

                <a
                  className="w-full max-w-sm text-center px-10 py-4 bg-white dark:bg-[#141938] border-2 border-[#141938] dark:border-[#FFD1FF]/30 text-[#141938] dark:text-[#FFD1FF] rounded-2xl font-bold text-lg hover:bg-[#1333fa] hover:text-white hover:border-[#1333fa] dark:hover:bg-[#1333fa]/20 transition"
                  target="_blank"
                  rel="noreferrer"
                  href="https://www.project-care-coin.org"
                >
                  Learn more →
                </a>

                <p className="text-sm text-[#141938]/50 dark:text-slate-400 font-medium">
                  Free to join. No crypto knowledge needed.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Stats Strip */}
      <div className="bg-[#1333fa] dark:bg-[#1333fa]/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-extrabold text-[#fb9b0c]">€374bn</p>
            <p className="mt-1 text-sm text-white/80 font-medium">Annual value of unpaid care work in Germany alone</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#fb9b0c]">64%</p>
            <p className="mt-1 text-sm text-white/80 font-medium">Of all unpaid carers in the EU are women</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#FFD1FF]">0</p>
            <p className="mt-1 text-sm text-white/80 font-medium">Verifiable records exist today — Care Coin changes that</p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white dark:bg-[#141938]/60">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141938] dark:text-white">How it works</h2>
            <p className="mt-3 text-[#141938]/60 dark:text-slate-400 font-medium">
              Three simple steps. No crypto knowledge needed.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

            {/* Step 1 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#fa1179] hover:shadow-xl hover:shadow-[#fa1179]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#fa1179] text-white font-extrabold text-lg shadow-md">
                  1
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Sign In</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    Enter your email above — no app download, no crypto wallet needed.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Free sign-in</span>
                <span className="group-hover:text-[#fa1179] transition">Instant ✦</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#1333fa] hover:shadow-xl hover:shadow-[#1333fa]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#1333fa] text-white font-extrabold text-lg shadow-md">
                  2
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Receive Your Token</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    A CARE token is sent to your account — each one represents one hour of recognised care work.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Airdrop</span>
                <span className="group-hover:text-[#1333fa] transition">Automatic ✦</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#fb9b0c] hover:shadow-xl hover:shadow-[#fb9b0c]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#fb9b0c] text-white font-extrabold text-lg shadow-md">
                  3
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">See Your Impact</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    View your care token balance — a permanent, verified record of your contribution.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Your profile</span>
                <span className="group-hover:text-[#fb9b0c] transition">Always yours ✦</span>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Features Highlight */}
      <div className="bg-[#FFD1FF] dark:bg-[#141938]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141938] dark:text-white mb-3 leading-tight">
                Designed for trust.<br />
                <span className="text-[#1333fa]">Built for you.</span>
              </h2>
              <p className="text-[#141938]/60 dark:text-slate-400 mb-8 text-sm leading-relaxed font-medium">
                Every Care Coin token is issued on Algorand — a secure, transparent blockchain. Your contribution is permanently recorded and always verifiable.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">No crypto knowledge needed</strong> — we handle everything for you
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Permanently recorded</strong> — your care hours live on the blockchain forever
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">100% free to join</strong> — this pilot costs you nothing
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Your token, your data</strong> — always in your control
                  </span>
                </li>
              </ul>
            </div>

            <div className="bg-[#1333fa] rounded-3xl p-8 shadow-2xl shadow-[#1333fa]/30">
              <p className="text-xs text-[#FFD1FF] mb-6 font-bold uppercase tracking-widest">✦ Sample Care Token</p>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60 font-medium">Name</span>
                  <span className="font-bold text-white">Family Care Credit</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60 font-medium">Symbol</span>
                  <span className="font-bold text-[#fb9b0c]">CARE</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60 font-medium">Total Supply</span>
                  <span className="font-bold text-white">52,000</span>
                </div>
                <div className="flex justify-between border-b border-white/10 pb-3">
                  <span className="text-white/60 font-medium">Unit</span>
                  <span className="font-bold text-[#FFD1FF]">1 token = 1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/60 font-medium">Issued by</span>
                  <span className="font-bold text-white">Project Care Coin</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-[#141938] text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24 text-center">
          <div className="inline-block mb-4 px-4 py-1 bg-[#fa1179] text-white text-xs font-bold rounded-full uppercase tracking-widest">
            Pilot · Free to join
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Ready to claim<br />
            <span className="text-[#fb9b0c]">your Care Token?</span>
          </h2>
          <p className="text-lg text-[#FFD1FF]/80 mb-2 max-w-xl mx-auto font-medium leading-relaxed">
            Enter your email above to get started. It takes 30 seconds.
          </p>
          <p className="text-sm text-white/40 mb-10 font-medium">
            No crypto wallet needed. No hidden fees. Just your care, recognised. 💛
          </p>

          {activeAddress ? (
            <div className="inline-flex items-center gap-3 px-12 py-4 rounded-2xl font-extrabold text-lg bg-[#fa1179] text-white shadow-xl shadow-[#fa1179]/30">
              <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
              You're signed in — token on its way! 🎉
            </div>
          ) : (
            <div className="inline-block px-12 py-4 rounded-2xl font-extrabold text-lg bg-white/10 text-white/60 border-2 border-white/20">
              👆 Enter your email at the top of the page
            </div>
          )}
        </div>
      </div>

    </div>
  )
}