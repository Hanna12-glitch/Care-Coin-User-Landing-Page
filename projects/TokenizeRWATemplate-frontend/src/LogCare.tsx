import algosdk from 'algosdk'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useWallet } from '@txnlab/use-wallet-react'
import { getAlgodConfigFromViteEnvironment } from './utils/network/getAlgoClientConfigs'

const CARE_CATEGORIES = [
  { id: 'childcare', label: 'Childcare',          emoji: '👶' },
  { id: 'eldercare', label: 'Eldercare',           emoji: '🤝' },
  { id: 'household', label: 'Household',           emoji: '🏠' },
  { id: 'emotional', label: 'Emotional Support',   emoji: '💙' },
  { id: 'transport', label: 'Transport & Errands', emoji: '🚗' },
  { id: 'medical',   label: 'Medical Care',        emoji: '🏥' },
  { id: 'education', label: 'Education Support',   emoji: '📚' },
  { id: 'other',     label: 'Other',               emoji: '✨' },
]

type Status = 'idle' | 'signing' | 'submitting' | 'success' | 'error'

export default function LogCare() {
  const { activeAddress, transactionSigner } = useWallet()
  const navigate = useNavigate()

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [hours, setHours] = useState(1)
  const [exhaustingNote, setExhaustingNote] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [txId, setTxId] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  if (!activeAddress) {
    navigate('/')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCategory) return

    setStatus('signing')
    setErrorMsg('')

    try {
      const config = getAlgodConfigFromViteEnvironment()
      const algod = new algosdk.Algodv2(String(config.token), config.server, config.port)

      const noteData = {
        type: 'care-log',
        category: selectedCategory,
        hours,
        exhausting: exhaustingNote,
        timestamp: new Date().toISOString(),
        version: 1,
      }

      const suggestedParams = await algod.getTransactionParams().do()

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 0,
        note: new TextEncoder().encode(JSON.stringify(noteData)),
        suggestedParams,
      })

      const atc = new algosdk.AtomicTransactionComposer()
      atc.addTransaction({ txn, signer: transactionSigner })

      setStatus('submitting')
      const result = await atc.execute(algod, 4)

      setTxId(result.txIDs[0])
      setStatus('success')
    } catch (e: unknown) {
      console.error('[LogCare] Error:', e)
      setErrorMsg(e instanceof Error ? e.message : 'Transaction failed. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-[#141938] flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h2 className="text-3xl font-extrabold text-white mb-3">Care work logged!</h2>
          <p className="text-white/60 mb-2 leading-relaxed">
            Your care session is permanently recorded on the Algorand blockchain.
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
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setStatus('idle')
                setSelectedCategory(null)
                setExhaustingNote('')
                setHours(1)
              }}
              className="w-full py-3 rounded-2xl font-bold bg-[#ffc2e8] text-[#141938] hover:opacity-90 transition"
            >
              Log another session
            </button>
            <Link
              to="/dashboard"
              className="w-full py-3 rounded-2xl font-bold border border-white/20 text-white hover:bg-white/5 transition text-center"
            >
              Back to Dashboard
            </Link>
          </div>
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

        <p className="text-xs font-bold uppercase tracking-widest text-[#ffc2e8] mb-2">✦ Care Log</p>
        <h1 className="text-3xl font-extrabold text-white mb-2">Log your care work</h1>
        <p className="text-white/50 mb-10">Your session is permanently stored on-chain.</p>

        <form onSubmit={handleSubmit} className="space-y-8">

          <div>
            <label className="block text-sm font-bold text-white/70 mb-4 uppercase tracking-wider">
              What type of care did you do?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CARE_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition text-center ${
                    selectedCategory === cat.id
                      ? 'border-[#ffc2e8] bg-[#ffc2e8]/15 text-white'
                      : 'border-white/10 bg-white/5 text-white/50 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <span className="text-2xl">{cat.emoji}</span>
                  <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/70 mb-4 uppercase tracking-wider">
              How many hours?{' '}
              <span className="text-[#ffc2e8] font-extrabold text-xl normal-case ml-1">{hours}h</span>
            </label>
            <input
              type="range"
              min={0.5}
              max={12}
              step={0.5}
              value={hours}
              onChange={e => setHours(Number(e.target.value))}
              className="w-full accent-[#ffc2e8] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/25 mt-1">
              <span>0.5h</span>
              <span>6h</span>
              <span>12h</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-white/70 mb-2 uppercase tracking-wider">
              What was most exhausting?{' '}
              <span className="text-white/30 normal-case font-normal">(optional)</span>
            </label>
            <textarea
              value={exhaustingNote}
              onChange={e => setExhaustingNote(e.target.value)}
              placeholder="e.g. Bedtime routine took 3 hours, my child was very unsettled..."
              rows={3}
              className="w-full rounded-2xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 px-5 py-4 text-sm focus:outline-none focus:border-[#ffc2e8]/50 transition resize-none"
            />
          </div>

          {status === 'error' && (
            <div className="rounded-2xl border border-[#fa1179]/30 bg-[#fa1179]/10 p-4 text-sm text-[#fa1179]">
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={!selectedCategory || status === 'signing' || status === 'submitting'}
            className="w-full py-4 rounded-2xl font-extrabold text-lg bg-[#ffc2e8] text-[#141938] hover:opacity-90 hover:scale-[1.01] transition disabled:opacity-40 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'signing' && (
              <>
                <span className="w-4 h-4 border-2 border-[#141938]/30 border-t-[#141938] rounded-full animate-spin" />
                Check your wallet...
              </>
            )}
            {status === 'submitting' && (
              <>
                <span className="w-4 h-4 border-2 border-[#141938]/30 border-t-[#141938] rounded-full animate-spin" />
                Recording on-chain...
              </>
            )}
            {(status === 'idle' || status === 'error') && '✦ Record my care work'}
          </button>

          <p className="text-xs text-white/25 text-center">
            A tiny ALGO fee applies for storing your record on-chain.
          </p>

        </form>
      </div>
    </div>
  )
}