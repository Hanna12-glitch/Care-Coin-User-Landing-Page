import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

type Status = 'idle' | 'signing' | 'submitting' | 'success' | 'error'

export default function Redeem() {
  const { activeAddress, transactionSigner, isReady } = useWallet()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isReady) return
    if (!activeAddress) navigate('/')
  }, [activeAddress, isReady, navigate])

  const [selected, setSelected] = useState<string | null>(null)
  const [customIdea, setCustomIdea] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [txId, setTxId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!isReady) return (
    <div className="min-h-screen bg-[#141938] flex items-center justify-center">
      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
    </div>
  )

  if (!activeAddress) return null

  const assetId = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID ?? 0)
  const projectWallet = (import.meta.env.VITE_PROJECT_WALLET_ADDRESS ?? '').trim()
  const isRealMode = Boolean(assetId && projectWallet)

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selected) return
    setStatus('signing')
    setErrorMsg('')
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
          sender: activeAddress,
          receiver: projectWallet,
          amount: 1,
          assetIndex: assetId,
          note: new TextEncoder().encode(JSON.stringify(redeemData)),
          suggestedParams,
        })
      } else {
        txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: activeAddress,
          receiver: activeAddress,
          amount: 0,
          note: new TextEncoder().encode(JSON.stringify(redeemData)),
          suggestedParams,
        })
      }
      setStatus('submitting')
      const signedTxns = await transactionSigner([txn], [0])
      await algod.sendRawTransaction(signedTxns[0]).do()
      await algosdk.waitForConfirmation(algod, txn.txID().toString(), 4)
      setTxId(txn.txID().toString())
      setStatus('success')
    } catch (e: unknown) {
      console.error('[Redeem] Error:', e)
      setErrorMsg(e instanceof Error ? e.message : 'Transaction failed. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    const rewardLabel = REWARD_CATEGORIES.find(r => r.id === selected)?.label ?? selected
    return (
      <div className="min-h-screen bg-[#141938] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🌟</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Reward redeemed!</h2>
          <p className="text-white/60 mb-2">
            You chose: <span className="text-[#ffc2e8] font-bold">{rewardLabel}</span>
          </p>
          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            {isRealMode
              ? 'Your CARE token has been sent back and recorded on-chain.'
              : 'Your preference is permanently recorded on the blockchain. Thank you for helping us find the right partners! 💛'}
          </p>
          {txId && (
            <a
              href={`https://lora.algokit.io/testnet/transaction/${txId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#ffc2e8]/70 hover:text-[#ffc2e8] font-mono break-all block mb-8 transition"
            >
              View on Lora ↗ {txId.slice(0, 20)}...
            </a>
          )}
          <Link
            to="/dashboard"
            className="block w-full py-3 rounded-2xl font-bold bg-[#1333fa] text-white hover:bg-[#fa1179] transition text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#141938] text-white px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Link to="/dashboard" className="text-white/40 hover:text-white text-sm font-medium transition mb-8 inline-block">
          ← Back to Dashboard
        </Link>
        <p className="text-xs font-bold uppercase tracking-widest text-[#1333fa] mb-2">Redeem</p>
        <h1 className="text-3xl font-extrabold text-white mb-2">Choose your reward</h1>
        <p className="text-white/50 mb-10">
          What would you most like for your care work? Your choice helps us find the right partners.
        </p>
        <form onSubmit={handleRedeem} className="space-y-8">
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
                    {!isRealMode && (
            <div className="rounded-2xl border border-[#fb9b0c]/20 bg-[#fb9b0c]/5 p-4 text-xs text-[#fb9b0c]">
              ⚙️ Simulation mode — your preference is recorded as a blockchain note.
              Add <code>VITE_CARE_COIN_ASSET_ID</code> + <code>VITE_PROJECT_WALLET_ADDRESS</code> to enable real token transfers.
            </div>
          )}

          <p className="text-xs text-white/45 -mt-4">
            If the log-in appears again, reconnect and continue
          </p>

          {status === 'error' && (
            <div className="rounded-2xl border border-[#fa1179]/30 bg-[#fa1179]/10 p-4 text-sm text-[#fa1179]">
              {errorMsg}
            </div>
          )}
          {status === 'error' && (
            <div className="rounded-2xl border border-[#fa1179]/30 bg-[#fa1179]/10 p-4 text-sm text-[#fa1179]">
              {errorMsg}
            </div>
          )}
          <button
            type="submit"
            disabled={!selected || (selected === 'other' && !customIdea.trim()) || status === 'signing' || status === 'submitting'}
            className="w-full py-4 rounded-2xl font-extrabold text-lg bg-[#1333fa] text-white hover:bg-[#fa1179] hover:scale-[1.01] transition disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'signing' && (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Check your wallet...</>)}
            {status === 'submitting' && (<><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Recording on-chain...</>)}
            {(status === 'idle' || status === 'error') && '✦ Redeem my care coins'}
          </button>
        </form>
      </div>
    </div>
  )
}
