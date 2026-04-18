import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ThankYou() {
  const navigate = useNavigate()
  const { activeAddress } = useWallet()

  const [claimStatus, setClaimStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [claimError, setClaimError] = useState<string | null>(null)
  const [txId, setTxId] = useState<string | null>(null)

  // Logout-Redirect
  useEffect(() => {
    if (!activeAddress) navigate('/')
  }, [activeAddress, navigate])

  // Flag setzen: dieser User hat das Formular ausgefüllt
  useEffect(() => {
    if (activeAddress) {
      localStorage.setItem(`care-submitted-${activeAddress}`, 'true')
    }
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
      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Claim failed')
      }
      setTxId(data.txId)
      setClaimStatus('success')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setClaimError(msg)
      setClaimStatus('error')
    }
  }

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto space-y-6 text-center">

        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center">
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-teal-800">Thank you!</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Your care work has been recorded. Claim your Care Coins below.
          </p>
        </div>

        {/* Claim Button */}
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-6 space-y-4">
          {claimStatus === 'idle' && (
            <>
              <p className="text-sm text-teal-700 font-medium">
                🌿 You have 10 Care Coins waiting for you
              </p>
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all"
              >
                Claim Care Coins →
              </button>
            </>
          )}

          {claimStatus === 'loading' && (
            <div className="flex items-center justify-center gap-3 py-2">
              <span className="w-3 h-3 rounded-full bg-teal-400 animate-pulse inline-block" />
              <p className="text-sm text-teal-700">Sending Care Coins to your wallet…</p>
            </div>
          )}

          {claimStatus === 'success' && (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <span className="text-emerald-500 text-xl">✓</span>
                <p className="text-sm font-semibold text-emerald-700">10 Care Coins sent!</p>
              </div>
              {txId && (
                <p className="text-xs text-gray-400 font-mono break-all">
                  TxID: {txId}
                </p>
              )}
            </div>
          )}

          {claimStatus === 'error' && (
            <div className="space-y-3">
              <p className="text-sm text-red-600 bg-red-50 rounded-xl p-3">
                {claimError}
              </p>
              <button
                onClick={handleClaim}
                className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-sm transition-all"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-all"
          >
            View my Dashboard →
          </button>
          <button
            onClick={() => navigate('/redeem')}
            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium text-sm transition-all"
          >
            See Redeem options
          </button>
        </div>

      </div>
    </div>
  )
}
