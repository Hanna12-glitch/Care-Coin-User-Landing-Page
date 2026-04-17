import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Wait until wallet has at least 0.1 ALGO on chain
const waitForBalance = async (address: string): Promise<void> => {
  const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
  for (let i = 0; i < 10; i++) {
    await sleep(2000)
    const info = await algod.accountInformation(address).do() as { amount: bigint }
    console.log(`Balance check ${i + 1}/10:`, Number(info.amount), 'microALGO')
    if (Number(info.amount) > 100_000) return
  }
  throw new Error('Wallet nicht aufgeladen nach 20 Sekunden.')
}

// Poll until CARE opt-in appears on chain
const pollOptIn = async (address: string, assetId: number): Promise<boolean> => {
  const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
  for (let i = 0; i < 10; i++) {
    await sleep(3000)
    const info = await algod.accountInformation(address).do() as {
      assets?: { assetId: bigint }[]
    }
    const opted = (info.assets ?? []).some((a) => Number(a.assetId) === assetId)
    console.log(`Opt-in poll ${i + 1}/10:`, opted)
    if (opted) return true
  }
  return false
}

type SetupStep = 'idle' | 'funding' | 'waiting-balance' | 'opting-in' | 'confirming' | 'done' | 'error'

export default function Home() {
  const { activeAddress, wallets, transactionSigner } = useWallet()
  const web3authWallet = wallets?.find(w => w.id === 'web3auth')
  const navigate = useNavigate()
  const [setupStep, setSetupStep] = useState<SetupStep>('idle')
  const [setupError, setSetupError] = useState('')
  const setupStarted = useRef(false)

  useEffect(() => {
    if (!activeAddress || setupStarted.current) return
    setupStarted.current = true
    runSetup()
  }, [activeAddress])

  const runSetup = async () => {
    try {
      // Step 1: Fund wallet
      setSetupStep('funding')
      const fundRes = await fetch('/api/fund-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress }),
      })
      const fundData = await fundRes.json()
      console.log('Fund-wallet:', fundRes.status, fundData)
      if (!fundRes.ok) throw new Error(`Fund failed: ${JSON.stringify(fundData)}`)

      // Step 2: Wait until ALGO is confirmed on chain
      setSetupStep('waiting-balance')
      await waitForBalance(activeAddress!)

      // Step 3: Check if already opted in
      const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
      const info = await algod.accountInformation(activeAddress!).do() as {
        assets?: { assetId: bigint }[]
      }
      const alreadyOptedIn = (info.assets ?? []).some((a) => Number(a.assetId) === ASSET_ID)
      console.log('Already opted in:', alreadyOptedIn)

      if (!alreadyOptedIn) {
        // Step 4: Send opt-in tx
        setSetupStep('opting-in')
        const params = await algod.getTransactionParams().do()
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAddress!,
          receiver: activeAddress!,
          amount: 0,
          assetIndex: ASSET_ID,
          suggestedParams: params,
        })
        const signedTxns = await transactionSigner([txn], [0])
await algod.sendRawTransaction(signedTxns[0]).do()
console.log('Opt-in tx submitted ✅')

        // Step 5: Wait until opt-in confirmed on chain
        setSetupStep('confirming')
        const confirmed = await pollOptIn(activeAddress!, ASSET_ID)
        if (!confirmed) throw new Error('Opt-in nicht bestätigt nach 30 Sekunden.')
      }

      setSetupStep('done')
      navigate('/onboarding')
    } catch (err) {
      console.error('Setup error:', err)
      setSetupError('Something went wrong. Please reload and try again.')
      setSetupStep('error')
      setupStarted.current = false
    }
  }

  if (setupStep !== 'idle' && setupStep !== 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', fontFamily: 'sans-serif', gap: 16,
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        {setupStep === 'funding' && <p style={{ fontWeight: 600 }}>Preparing your wallet…</p>}
        {setupStep === 'waiting-balance' && (
          <>
            <p style={{ fontWeight: 600 }}>Preparing your wallet…</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>Confirming on Algorand, this takes a few seconds.</p>
          </>
        )}
        {setupStep === 'opting-in' && <p style={{ fontWeight: 600 }}>Setting up Care Coin…</p>}
        {setupStep === 'confirming' && (
          <>
            <p style={{ fontWeight: 600 }}>Almost there…</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>Confirming on Algorand, about 15 seconds.</p>
          </>
        )}
      </div>
    )
  }

  if (setupStep === 'error') {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: '#ffffff', fontFamily: 'sans-serif', gap: 16,
      }}>
        <p style={{ color: '#dc2626' }}>{setupError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '0.5rem 1rem', background: '#1333fa', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Reload
        </button>
      </div>
    )
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
                <p className="text-s text-[#141938]/70 dark:text-slate-500 text-center font-medium">
                  We'll send you a one-time login link. No password needed.
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

      {/* How It Works */}
      <div className="bg-[#141938]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">How it works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-7 transition group">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">1</div>
              <h3 className="text-lg font-extrabold text-white mb-2">Sign In</h3>
              <p className="text-sm text-white/60 leading-relaxed">Enter your email — you will receive a one-time log-in code. No password required.</p>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 transition">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">2</div>
              <h3 className="text-lg font-extrabold text-white mb-2">Log Your Care Work</h3>
              <p className="text-sm text-white/60 leading-relaxed">We help you with a short questionnaire.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 transition">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">3</div>
              <h3 className="text-lg font-extrabold text-white mb-2">Receive Care Coins</h3>
              <p className="text-sm text-white/60 leading-relaxed">Care Coin will send your care coins to your account.</p>
            </div>
            <div className="group rounded-3xl border border-white/10 bg-white/5 p-7 transition">
              <div className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-[#ffc2e8] text-[#141938] font-extrabold text-lg shadow-md mb-4">4</div>
              <h3 className="text-lg font-extrabold text-white mb-2">Redeem Your Care Coins</h3>
              <p className="text-sm text-white/60 leading-relaxed">Choose what you would like in exchange for your care coins.</p>
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
            Sign in with your email to get started.
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