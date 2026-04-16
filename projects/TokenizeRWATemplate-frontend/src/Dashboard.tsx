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

      {/* Redeem Reward */}
      <Link
        to="/redeem"
        className="group rounded-3xl border-2 border-[#1333fa]/30 bg-[#1333fa]/5 hover:bg-[#1333fa]/20 hover:border-[#1333fa]/60 p-7 transition">
        <h3 className="text-xl font-extrabold text-white mb-2">Redeem Reward</h3>
        <p className="text-sm text-white/60 leading-relaxed mb-5">
        Exchange your CARE tokens for a reward of your choice. Help us find the right partners.
        </p>
      </Link>

      </div>

        {/* Hints */}
        {!loading && info.careBalance === 0 && (
          <div className="mt-8 rounded-2xl border border-[#ffc2e8]/15 bg-[#ffc2e8]/5 p-5 text-sm text-white/50">
            Thank You for being part of building care-coin!
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