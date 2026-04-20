import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

const REWARD_CATEGORIES = [
  { id: 'wellness',  label: 'Wellness Voucher',   desc: 'Massage, spa or yoga' },
  { id: 'financial', label: 'Financial Coaching', desc: '1:1 with an advisor' },
  { id: 'shopping',  label: 'Shopping Voucher',   desc: 'Groceries or household' },
  { id: 'fashion',   label: 'Fashion',            desc: 'Fashion Voucher' },
  { id: 'education', label: 'Education',          desc: 'Course or workshop' },
  { id: 'culture',   label: 'Culture & Leisure',  desc: 'Cinema, theatre, museum' },
  { id: 'health',    label: 'Health Check-Up',    desc: 'Medical or preventive care' },
  { id: 'other',     label: 'My own idea',        desc: 'Tell us what you want!' },
]

type RedeemStatus = 'idle' | 'signing' | 'submitting' | 'success' | 'error'

interface AccountInfo {
  algoBalance: number
  careBalance: number | null
}

export default function Dashboard() {
  const { activeAddress, signTransactions, isReady } = useWallet()
  const navigate = useNavigate()

  const [info, setInfo] = useState<AccountInfo>({ algoBalance: 0, careBalance: null })
  const [loading, setLoading] = useState(true)

  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [claimTxId, setClaimTxId] = useState<string | null>(null)
  const [hasClaimed, setHasClaimed] = useState(false)

  const [selected, setSelected] = useState<string | null>(null)
  const [customIdea, setCustomIdea] = useState('')
  const [redeemStatus, setRedeemStatus] = useState<RedeemStatus>('idle')
  const [redeemTxId, setRedeemTxId] = useState('')
  const [redeemError, setRedeemError] = useState('')

  const assetId = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID ?? 0)
  const projectWallet = (import.meta.env.VITE_PROJECT_WALLET_ADDRESS ?? '').trim()
  const isRealMode = Boolean(assetId && projectWallet)

  useEffect(() => {
    if (!isReady) return
    if (!activeAddress) navigate('/')
  }, [activeAddress, isReady, navigate])

  useEffect(() => {
    if (!activeAddress) return
    const config = getAlgodConfigFromViteEnvironment()
    const algod = new algosdk.Algodv2(String(config.token), config.server, config.port)

    algod.accountInformation(activeAddress).do()
      .then((acct: any) => {
        const algo = Number(acct.amount) / 1_000_000
        let care: number | null = null
        if (assetId) {
          const holding = (acct.assets ?? []).find((a: any) => Number(a.assetId) === assetId)
          care = holding ? Number(holding.amount) : 0
        }
        setInfo({ algoBalance: algo, careBalance: care })

        // Wenn Wallet bereits Coins hat, dann wurde bereits geclaimt
        if ((care ?? 0) > 0) {
          setHasClaimed(true)
        }

        setLoading(false)
      })
      .catch(() => {
        setInfo({ algoBalance: 0, careBalance: 0 })
        setLoading(false)
      })
  }, [activeAddress, assetId])

  const handleClaim = async () => {
    if (!activeAddress) return
    setClaimStatus('loading')
    setClaimError(null)

    try {
      const res = await fetch('/api/send-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress, amount: 30 }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        const raw = data.error ?? ''
        const friendly = raw.includes('underflow')
          ? 'Not enough Care-Coins. Thank You for your engagement - we will get in touch.'
          : raw || 'Claim failed. Please try again.'
        throw new Error(friendly)
      }

      setClaimTxId(data.txId)
      setClaimStatus('success')
      setHasClaimed(true)
      setInfo(prev => ({ ...prev, careBalance: (prev.careBalance ?? 0) + 30 }))
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : String(e))
      setClaimStatus('error')
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return

    setRedeemStatus('signing')
    setRedeemError('')

    try {
      const config = getAlgodConfigFromViteEnvironment()
      const algod = new algosdk.Algodv2(String(config.token), config.server, config.port)
      const suggestedParams = await algod.getTransactionParams().do()

      const redeemData = {
        type: 'care-redeem',
        reward: selected,
        customIdea: selected === 'other' ? customIdea : undefined,
        timestamp: new Date().toISOString(),
        version: 1,
      }

      let txn: algosdk.Transaction

      if (isRealMode) {
        txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAddress!,
          receiver: projectWallet,
          amount: 10,
          assetIndex: assetId,
          note: new TextEncoder().encode(JSON.stringify(redeemData)),
          suggestedParams,
        })
      } else {
        txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress!,
          receiver: activeAddress!,
          amount: 0,
          note: new TextEncoder().encode(JSON.stringify(redeemData)),
          suggestedParams,
        })
      }

      setRedeemStatus('submitting')
      const signedTxns = await signTransactions([txn])
      const validTxns = signedTxns.filter((t): t is Uint8Array => t !== null)

      await algod.sendRawTransaction(validTxns[0]).do()
      await algosdk.waitForConfirmation(algod, txn.txID().toString(), 4)

      setRedeemTxId(txn.txID().toString())
      setRedeemStatus('success')
      setInfo(prev => ({ ...prev, careBalance: Math.max(0, (prev.careBalance ?? 0) - 10) }))
    } catch (e: unknown) {
      console.error('[Redeem] Error:', e)
      const raw = e instanceof Error ? e.message : String(e)
      const friendly = raw.includes('underflow')
        ? 'Your wallet needs to be reacitvated. Please contact us via HELP button below'
        : 'Transaction failed. Please try again.'
      setRedeemError(friendly)
      setRedeemStatus('error')
    }
  }

  if (!isReady) return (
    <div className="min-h-screen bg-[#141938] flex items-center justify-center">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-[#141938] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-2">Welcome</p>
          <h1 className="text-4xl font-extrabold text-white mb-1">Your Care Wallet</h1>
        </div>

        {/* CARE Balance */}
        <div className="rounded-3xl bg-[#1333fa] p-7 shadow-xl mb-5">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-3">CARE Balance</p>
          {loading ? (
            <div className="h-12 w-28 bg-white/10 rounded-xl animate-pulse" />
          ) : (
            <p className="text-5xl font-extrabold text-white">
              {info.careBalance !== null ? info.careBalance : '—'}
            </p>
          )}
        </div>

        {/* Claim — nur für User, die noch nie geclaimt haben */}
        {info.careBalance === 0 && !hasClaimed && !loading && (
          <div className="rounded-3xl border border-[#ffc2e8]/20 bg-[#ffc2e8]/5 p-7 mb-5">
            <h3 className="text-lg font-extrabold text-white mb-1">You have 30 Care Coins waiting for you</h3>

            {claimStatus === 'idle' && (
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-2xl bg-[#fa1179] hover:bg-[#e0006a] text-white font-bold text-sm transition-all"
              >
                Claim Care Coins →
              </button>
            )}

            {claimStatus === 'loading' && (
              <div className="flex items-center gap-3 py-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <p className="text-sm text-white/70">Sending Care Coins to your wallet…</p>
              </div>
            )}

            {claimStatus === 'success' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400 text-xl">✓</span>
                  <p className="text-sm font-semibold text-emerald-400">10 Care Coins sent!</p>
                </div>
                {claimTxId && (
                  <a
                    href={`https://lora.algokit.io/testnet/transaction/${claimTxId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-[#ffc2e8]/60 hover:text-[#ffc2e8] font-mono break-all block transition"
                  >
                    View on Lora ↗ {claimTxId.slice(0, 20)}...
                  </a>
                )}
              </div>
            )}

            {claimStatus === 'error' && (
              <div className="space-y-3">
                <p className="text-sm text-[#fa1179] bg-[#fa1179]/10 rounded-xl p-3">{claimError}</p>
                <button
                  onClick={handleClaim}
                  className="w-full py-3 rounded-2xl bg-[#fa1179] hover:bg-[#e0006a] text-white font-bold text-sm transition-all"
                >
                  Try again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Empty wallet — wenn bereits geclaimt, aber alles aufgebraucht */}
        {info.careBalance === 0 && hasClaimed && !loading && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7 mb-5">
            <h3 className="text-lg font-extrabold text-white mb-1">Your wallet is empty</h3>
            <p className="text-sm text-white/60">
              You have used all your Care-Coins.
            </p>
          </div>
        )}

        {/* Redeem */}
        {redeemStatus !== 'success' ? (
          <div className="rounded-3xl border border-[#1333fa]/30 bg-[#1333fa]/5 p-7 mb-5">
            <h3 className="text-lg font-extrabold text-white mb-1">Choose your Reward</h3>
            <p className="text-sm text-white/50 mb-6">
              What would you most like for your care work? Your choice helps us find the right partners.
            </p>
            <p className="text-sm text-white/50 mb-6">
              Every Reward is 10 Care-Coins. Which would you like most?
            </p>

            <form onSubmit={handleRedeem} className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {REWARD_CATEGORIES.map(reward => (
                  <button
                    key={reward.id}
                    type="button"
                    onClick={() => setSelected(reward.id)}
                    className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition text-center ${
                      selected === reward.id
                        ? 'border-[#1333fa] bg-[#1333fa]/25 text-white scale-[1.03]'
                        : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white'
                    }`}
                  >
                    <span className="text-xs font-semibold leading-tight">{reward.label}</span>
                    <span className="text-xs text-white/30 leading-tight hidden sm:block">{reward.desc}</span>
                  </button>
                ))}
              </div>

              {selected === 'other' && (
                <div>
                  <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
                    What would you like? ✨
                  </label>
                  <textarea
                    value={customIdea}
                    onChange={e => setCustomIdea(e.target.value)}
                    placeholder="e.g. A voucher for a local restaurant, a house-cleaning service..."
                    rows={3}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 px-5 py-4 text-sm focus:outline-none focus:border-[#1333fa]/50 transition resize-none"
                  />
                </div>
              )}

              {!isRealMode && (
                <div className="rounded-2xl border border-[#fb9b0c]/20 bg-[#fb9b0c]/5 p-4 text-xs text-[#fb9b0c]">
                  ⚙️ Simulation mode — your preference is recorded as a blockchain note.
                  Add <code>VITE_CARE_COIN_ASSET_ID</code> + <code>VITE_PROJECT_WALLET_ADDRESS</code> to enable real token transfers.
                </div>
              )}

              {redeemStatus === 'error' && (
                <div className="rounded-2xl border border-[#fa1179]/30 bg-[#fa1179]/10 p-4 text-sm text-[#fa1179]">
                  {redeemError}
                </div>
              )}

              <button
                type="submit"
                disabled={!selected || (selected === 'other' && !customIdea.trim()) || redeemStatus === 'signing' || redeemStatus === 'submitting'}
                className="w-full py-4 rounded-2xl font-extrabold text-lg bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-[1.01] transition disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {redeemStatus === 'signing' && (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Check your wallet...</>)}
                {redeemStatus === 'submitting' && (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Recording on-chain...</>)}
                {(redeemStatus === 'idle' || redeemStatus === 'error') && 'Redeem my care coins'}
              </button>
            </form>
          </div>
        ) : (
          <div className="rounded-3xl border border-blue-500/30 bg-blue-500/5 p-7 mb-5 text-center">
            <h3 className="text-xl font-extrabold text-white mb-2">Thank You for submitting your choice!</h3>
            <h2 className="text-xl font-extrabold text-white mb-2">Your Reward will be send to you via e-mail shortly</h2>
            <p className="text-white/60 mb-2">
              You chose: <span className="text-[#ffc2e8] font-bold">
                {REWARD_CATEGORIES.find(r => r.id === selected)?.label ?? selected}
              </span>
            </p>

            {redeemTxId && (
              <a
                href={`https://lora.algokit.io/testnet/transaction/${redeemTxId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[#ffc2e8]/70 hover:text-[#ffc2e8] font-mono break-all block mb-6 transition"
              >
                View on Lora ↗ {redeemTxId.slice(0, 20)}...
              </a>
            )}

            <button
              onClick={() => {
                setRedeemStatus('idle')
                setSelected(null)
                setCustomIdea('')
                setRedeemTxId('')
              }}
              className="w-full py-3 rounded-2xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-all"
            >
              ← Choose again
            </button>
          </div>
        )}

        {!import.meta.env.VITE_CARE_COIN_ASSET_ID && (
          <div className="rounded-2xl border border-[#fb9b0c]/20 bg-[#fb9b0c]/5 p-4 text-xs text-[#fb9b0c]">
            ⚠️ Add <code>VITE_CARE_COIN_ASSET_ID</code> to your <code>.env</code> to show live CARE balance.
          </div>
        )}

        {/* Footer */}
        <div className="mt-10 text-center">
          <a
            href="mailto:help@project-care-coin.org"
            className="inline-block py-3 px-8 rounded-2xl border border-white/20 bg-blue/5 hover:bg-[#fa1179] text-white font-bold text-sm transition-all"
          >
            HELP
          </a>
        </div>
      </div>
    </div>
  )
}