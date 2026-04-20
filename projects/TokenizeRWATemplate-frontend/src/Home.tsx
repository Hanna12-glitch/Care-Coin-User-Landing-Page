import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Home() {
  const { activeAddress, wallets, isReady } = useWallet()
  const web3authWallet = wallets?.find(w => w.id === 'web3auth')
  const navigate = useNavigate()

  useEffect(() => {
  if (!isReady) return
  if (!activeAddress) return
  // Returning user mit Balance → Dashboard, neuer User → Onboarding
  // wird in Onboarding.tsx nochmal geprüft, hier immer zu onboarding
  navigate('/onboarding', { replace: true })
}, [activeAddress, isReady, navigate])

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
                <button
                  onClick={() => web3authWallet?.connect()}
                  disabled={!web3authWallet}
                  className="px-10 py-4 rounded-2xl font-bold text-lg bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-105 transition disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Sign in with Email
                </button>
                <p className="text-xs text-[#141938]/40 dark:text-slate-500 text-center font-medium">
                  We'll send you a one-time login link. No password needed.
                </p>
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
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div>
            <p className="text-4xl font-extrabold text-[#fba30c]">311bn hours</p>
            <p className="mt-1 text-sm text-white/80 font-medium">unpaid care work annually in Europe alone on top of paid jobs</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#fba30c]">135M+ people</p>
            <p className="mt-1 text-sm text-white/80 font-medium">juggle care work and employment simultaneously</p>
          </div>
          <div>
            <p className="text-4xl font-extrabold text-[#fba30c]">44% more care</p>
            <p className="mt-1 text-sm text-white/80 font-medium">is provided by women who earn less and are more likely to burn-out</p>
          </div>
        </div>
      </div>


      {/* How It Works — 4 Steps: 1 + 2 + 1 */}
      <div className="bg-[#141938]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">

          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How it works</h2>
          </div>

          {/* Row 1 — Step 1 full width */}
          <div className="mb-5 rounded-3xl border border-white/10 bg-white/5 hover:bg-[#ffc2e8]/10 hover:border-[#ffc2e8]/30 p-7 transition group">
            <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">
              1
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">Sign In</h3>
            <p className="text-sm text-white/60 leading-relaxed max-w-xl">
              Enter your email — you will receive a one-time log-in code. No password required.
            </p>
          </div>

          {/* Row 2 — Steps 2 & 3 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

            {/* Step 2 — Log Your Care Work */}
            <div className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-[#ffc2e8]/10 hover:border-[#ffc2e8]/30 p-7 transition">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">
                2
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">Log Your Care Work</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Put in the amount of care work and what type.
              </p>
            </div>

            {/* Step 3 — Receive Care Coins */}
            <div className="group rounded-3xl border border-white/10 bg-white/5 hover:bg-[#ffc2e8]/10 hover:border-[#ffc2e8]/30 p-7 transition">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">
                3
              </div>
              <h3 className="text-lg font-extrabold text-white mb-2">Receive Care Coins</h3>
              <p className="text-sm text-white/60 leading-relaxed">
                Care Coin will send your care coins to your account. One hour = one care coin.
              </p>
            </div>

          </div>

          {/* Row 3 — Step 4 full width */}
          <div className="rounded-3xl border border-white/10 bg-white/5 hover:bg-[#ffc2e8]/10 hover:border-[#ffc2e8]/30 p-7 transition group">
            <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">
              4
            </div>
            <h3 className="text-lg font-extrabold text-white mb-2">Redeem Your Reward</h3>
            <p className="text-sm text-white/60 leading-relaxed max-w-xl">
              Choose what you would like to exchange your care coins for. This helps us find the right partners for Project Care Coin.
            </p>
          </div>

        </div>
      </div>

      {/* Member Card Section */}
      <div className="bg-[#FFFFFF] dark:bg-[#1a1035]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* Text left */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#fa1179] mb-4">
                ✦ Exclusive
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#141938] dark:text-white mb-6 leading-tight">
                Your Member Card
              </h2>
              <p className="text-[#141938]/70 dark:text-slate-300 text-base leading-relaxed">
                Project Care-Coin sends you a digital member ID. It is bound to your wallet, cannot be transferred or copied. It will always prove you are an early supporter and eligible for benefits in the future.
              </p>
              <div className="mt-8 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm font-medium">Bound to your wallet — non-transferable</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm font-medium">Permanent proof of early support</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-xl bg-[#fa1179] text-white font-bold text-sm">✓</span>
                  <span className="text-[#141938] dark:text-gray-200 text-sm font-medium">Unlocks future benefits & rewards</span>
                </div>
              </div>
            </div>

            {/* Image right */}
            <div className="flex justify-center">
              <img
                src="/Care-Coin-NFT.jpg"
                alt="Project Care-Coin Member Card NFT"
                className="w-full max-w-xs shadow-2xl shadow-[#1333fa]/20"
                loading="lazy"
              />
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
            <span className="text-[#fb9b0c]">your Care Coin?</span>
          </h2>
          <p className="text-lg text-[#fddeef]/80 mb-2 max-w-xl mx-auto font-medium leading-relaxed">
            Sign in with your email to get started. It takes 30 seconds.
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
            <button
              onClick={() => web3authWallet?.connect()}
              disabled={!web3authWallet}
              className="px-12 py-4 rounded-2xl font-extrabold text-lg bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-105 transition disabled:opacity-40 shadow-xl"
            >
              Sign in with Email
            </button>
          )}
        </div>
      </div>

    </div>
  )
}