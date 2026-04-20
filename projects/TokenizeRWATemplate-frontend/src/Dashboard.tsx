import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface AccountInfo {
  algoBalance: number
  careBalance: number | null
}

export default function Dashboard() {
  const { activeAddress, isReady } = useWallet()
  const navigate = useNavigate()
  const [info, setInfo] = useState<AccountInfo>({ algoBalance: 0, careBalance: null })
  const [loading, setLoading] = useState(true)

  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  useEffect(() => {
    if (!isReady) return
    if (!activeAddress) navigate('/')
  }, [activeAddress, isReady, navigate])

  useEffect(() => {
    if (!activeAddress) return
    const config = getAlgodConfigFromViteEnvironment()
    const algod = new algosdk.Algodv2(String(config.token), config.server, config.port)
    const assetId = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID ?? 0)

    algod.accountInformation(activeAddress).do()
      .then((acct: any) => {
        const algo = Number(acct.amount) / 1_000_000
        let care: number | null = null
        if (assetId) {
          const holding = (acct.assets ?? []).find((a: any) => Number(a.assetId) === assetId)
          care = holding ? Number(holding.amount) : 0
        }
        setInfo({ algoBalance: algo, careBalance: care })
        setLoading(false)
      })
      .catch(() => {
        setInfo({ algoBalance: 0, careBalance: 0 })
        setLoading(false)
      })
  }, [activeAddress])

  const handleClaim = async () => {
    if (!activeAddress) return
    setClaimStatus('loading')
    setClaimError(null)
    try {
      const res = await fetch('/api/send-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress, amount: 10 }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) throw new Error(data.error ?? 'Claim failed')
      setTxId(data.txId)
      setClaimStatus('success')
      // Balance nach Claim neu laden
      setInfo(prev => ({ ...prev, careBalance: (prev.careBalance ?? 0) + 10 }))
    } catch (e: unknown) {
      setClaimError(e instanceof Error ? e.message : String(e))
      setClaimStatus('error')
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">

          {/* CARE Balance */}
          <div className="rounded-3xl bg-[#1333fa] p-7 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-3">CARE Balance</p>
            {loading ? (
              <div className="h-12 w-28 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <p className="text-5xl font-extrabold text-white">
                {info.careBalance !== null ? info.careBalance : '—'}
              </p>
            )}
            <p className="mt-2 text-sm text-white/60">CARE tokens earned</p>
          </div>

          {/* Redeem */}
          <Link
            to="/redeem"
            className="group rounded-3xl border-2 border-[#1333fa]/30 bg-[#1333fa]/5 hover:bg-[#1333fa]/20 hover:border-[#1333fa]/60 p-7 transition"
          >
            <h3 className="text-xl font-extrabold text-white mb-2">Redeem Reward</h3>
            <p className="text-sm text-white/60 leading-relaxed">
              Exchange your CARE tokens for a reward of your choice. Help us find the right partners.
            </p>
          </Link>

        </div>

        {/* Claim Care Coins */}
        <div className="rounded-3xl border border-[#ffc2e8]/20 bg-[#ffc2e8]/5 p-7 mb-5">
          <h3 className="text-lg font-extrabold text-white mb-1">Claim Care Coins</h3>
          <p className="text-sm text-white/50 mb-5">
            🌿 You have 10 Care Coins waiting for you.
          </p>

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
              {txId && (
                <a
                  href={`https://lora.algokit.io/testnet/transaction/${txId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#ffc2e8]/60 hover:text-[#ffc2e8] font-mono break-all block transition"
                >
                  View on Lora ↗ {txId.slice(0, 20)}...
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

        {!import.meta.env.VITE_CARE_COIN_ASSET_ID && (
          <div className="rounded-2xl border border-[#fb9b0c]/20 bg-[#fb9b0c]/5 p-4 text-xs text-[#fb9b0c]">
            ⚠️ Add <code>VITE_CARE_COIN_ASSET_ID</code> to your <code>.env</code> to show live CARE balance.
          </div>
        )}

      </div>
    </div>
  )
}