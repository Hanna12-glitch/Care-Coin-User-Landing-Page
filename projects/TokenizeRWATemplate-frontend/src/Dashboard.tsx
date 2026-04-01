import algosdk from 'algosdk'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { ellipseAddress } from './utils/ellipseAddress'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

interface AccountInfo {
  algoBalance: number
  careBalance: number | null
}

export default function Dashboard() {
  const { activeAddress } = useWallet()
  const navigate = useNavigate()
  const [info, setInfo] = useState<AccountInfo>({ algoBalance: 0, careBalance: null })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!activeAddress) navigate('/')
  }, [activeAddress, navigate])

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
          const holding = (acct.assets ?? []).find((a: any) => a['asset-id'] === assetId)
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

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-[#141938] text-white px-4 py-12">
      <div className="max-w-3xl mx-auto">

        {/* Welcome */}
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-2">✦ Welcome back</p>
          <h1 className="text-4xl font-extrabold text-white mb-1">Your Care Wallet</h1>
          <p className="text-white/40 font-mono text-sm">{ellipseAddress(activeAddress, 8)}</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
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
          <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
            <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-3">ALGO Balance</p>
            {loading ? (
              <div className="h-12 w-28 bg-white/10 rounded-xl animate-pulse" />
            ) : (
              <p className="text-5xl font-extrabold text-white">
                {info.algoBalance.toFixed(3)}
              </p>
            )}
            <p className="mt-2 text-sm text-white/60">ALGO (for transaction fees)</p>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Link
            to="/log"
            className="group rounded-3xl border-2 border-[#ffc2e8]/20 bg-[#ffc2e8]/5 hover:bg-[#ffc2e8]/10 hover:border-[#ffc2e8]/50 p-7 transition"
          >
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-extrabold text-white mb-2">Log Care Work</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              Record your care hours and earn CARE tokens. Permanently stored on Algorand.
            </p>
            <span className="text-xs font-bold text-[#ffc2e8]/50 group-hover:text-[#ffc2e8] transition">
              Start logging →
            </span>
          </Link>

          <Link
            to="/redeem"
            className="group rounded-3xl border-2 border-[#1333fa]/30 bg-[#1333fa]/5 hover:bg-[#1333fa]/10 hover:border-[#1333fa]/60 p-7 transition"
          >
            <div className="text-4xl mb-4">🎁</div>
            <h3 className="text-xl font-extrabold text-white mb-2">Redeem Reward</h3>
            <p className="text-sm text-white/60 leading-relaxed mb-5">
              Exchange your CARE tokens for a reward of your choice. Help us find the right partners.
            </p>
            <span className="text-xs font-bold text-[#1333fa]/50 group-hover:text-[#1333fa] transition">
              Choose reward →
            </span>
          </Link>
        </div>

        {/* Hints */}
        {!loading && info.careBalance === 0 && (
          <div className="mt-8 rounded-2xl border border-[#ffc2e8]/15 bg-[#ffc2e8]/5 p-5 text-sm text-white/50">
            💛 No CARE tokens yet — log your first care session and we'll send them to you!
          </div>
        )}
        {!import.meta.env.VITE_CARE_COIN_ASSET_ID && (
          <div className="mt-4 rounded-2xl border border-[#fb9b0c]/20 bg-[#fb9b0c]/5 p-4 text-xs text-[#fb9b0c]">
            ⚠️ Add <code>VITE_CARE_COIN_ASSET_ID</code> to your <code>.env</code> to show live CARE balance.
          </div>
        )}

      </div>
    </div>
  )
}