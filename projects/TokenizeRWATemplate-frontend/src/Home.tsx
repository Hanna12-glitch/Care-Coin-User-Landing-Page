import { useWallet } from '@txnlab/use-wallet-react'
import { Link } from 'react-router-dom'

/**
 * Home Page
 * Landing page showcasing the RWA tokenization platform
 * Displays features, how it works, and CTAs to connect wallet and create assets
 */
export default function Home() {
  const { activeAddress } = useWallet()

  return (
    <div className="bg-[#FFD1FF] dark:bg-[#141938]">

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
            Childcare. Eldercare. Household work. Project Care Coin turns your invisible labour into digital money...
          </p>

          

          <p className="mt-6 text-lg sm:text-xl text-[#141938]/70 dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            ... and into a verified, on-chain asset — recognised, recorded, and real.
          </p>


        

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/tokenize"
              className={`px-10 py-4 rounded-2xl font-bold text-lg transition shadow-lg ${
                activeAddress
                  ? 'bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-105'
                  : 'bg-[#141938]/30 text-white/50 cursor-not-allowed'
              }`}
            >
              Start Tokenizing →
            </Link>

            <a
              className="px-10 py-4 bg-white dark:bg-[#141938] border-2 border-[#141938] dark:border-[#FFD1FF]/30 text-[#141938] dark:text-[#FFD1FF] rounded-2xl font-bold text-lg hover:bg-[#1333fa] hover:text-white hover:border-[#1333fa] dark:hover:bg-[#1333fa]/20 transition"
              target="_blank"
              rel="noreferrer"
              href="https://dev.algorand.co/concepts/assets/overview/"
            >
              Learn about ASAs
            </a>
          </div>

          {!activeAddress && (
            <p className="mt-5 text-sm text-[#141938]/50 dark:text-slate-400 font-medium">
              👆 Connect your wallet (top-right) to get started — it's free.
            </p>
          )}
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
              Four simple steps. No tech background needed.
            </p>
            <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-[#fb9b0c] bg-[#fb9b0c]/10 px-3 py-1 rounded-full">
              <span className="inline-flex h-2 w-2 rounded-full bg-[#fb9b0c]" />
              Live on TestNet
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

            {/* Step 1 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#fa1179] hover:shadow-xl hover:shadow-[#fa1179]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#fa1179] text-white font-extrabold text-lg shadow-md">
                  1
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Connect Your Wallet</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    Use Pera, Defly, Exodus, or KMD on localnet. One tap to connect — no account needed.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Wallet sign-in</span>
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
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Define Your Care Asset</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    Give your token a name, set the supply, attach a metadata URL — each token can represent an hour of care.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Mint on TestNet</span>
                <span className="group-hover:text-[#1333fa] transition">Fast ✦</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#fb9b0c] hover:shadow-xl hover:shadow-[#fb9b0c]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#fb9b0c] text-white font-extrabold text-lg shadow-md">
                  3
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Track Your Contributions</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    See all issued care tokens in your local history — a transparent, growing record of recognised labour.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Local history</span>
                <span className="group-hover:text-[#fb9b0c] transition">Simple ✦</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="group rounded-3xl border-2 border-[#FFD1FF] dark:border-[#1333fa]/30 bg-[#FFD1FF]/30 dark:bg-[#1333fa]/5 p-7 hover:border-[#fa1179] hover:shadow-xl hover:shadow-[#fa1179]/10 transition">
              <div className="flex items-start gap-4">
                <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#141938] dark:bg-[#FFD1FF] text-white dark:text-[#141938] font-extrabold text-lg shadow-md">
                  4
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold text-[#141938] dark:text-white">Transfer & Recognise</h3>
                  <p className="mt-1 text-sm text-[#141938]/60 dark:text-slate-300 leading-relaxed">
                    Send ALGO, TestNet USDC, or your care tokens to carers, institutions, or pilot participants.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center justify-between text-xs font-semibold text-[#141938]/40 dark:text-slate-500">
                <span>Built-in transfers</span>
                <span className="group-hover:text-[#fa1179] transition">All-in-one ✦</span>
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
                <span className="text-[#1333fa]">Built for compliance.</span>
              </h2>
              <p className="text-[#141938]/60 dark:text-slate-400 mb-8 text-sm leading-relaxed font-medium">
                Every Care Coin asset inherits Algorand's institutional-grade controls — giving operators, regulators, and pilot partners the oversight they need from day one.
              </p>
              <ul className="space-y-5">
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Manager Role</strong> — Update asset settings as your programme evolves
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Freeze Account</strong> — Pause transfers for audits or compliance reviews
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Clawback Authority</strong> — Recover tokens in the event of errors or disputes
                  </span>
                </li>
                <li className="flex gap-4 items-start">
                  <span className="mt-0.5 shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm leading-relaxed">
                    <strong className="font-bold">Metadata Support</strong> — Link care plans, hours logs, or certifications off-chain
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
                  <span className="text-white/60 font-medium">Manager</span>
                  <span className="font-bold text-white">Your Wallet</span>
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
            Demo · No real assets
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            Ready to run<br />
            <span className="text-[#fb9b0c]">your first pilot?</span>
          </h2>
          <p className="text-lg text-[#FFD1FF]/80 mb-2 max-w-xl mx-auto font-medium leading-relaxed">
            Claim your care token in minutes. No hidden fees, no complicated setup.
          </p>
          <p className="text-sm text-white/40 mb-10 font-medium">
            Built for care givers &amp; brands.
          </p>
          <Link
            to="/tokenize"
            className={`inline-block px-12 py-4 rounded-2xl font-extrabold text-lg transition shadow-xl ${
              activeAddress
                ? 'bg-[#fa1179] text-white hover:bg-[#fb9b0c] hover:scale-105 shadow-[#fa1179]/30'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            }`}
          >
            Create Your First Asset
          </Link>
        </div>
      </div>

    </div>
  )
}