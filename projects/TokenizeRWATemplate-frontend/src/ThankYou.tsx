import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCareCoinOptIn } from './useCareCoinOptIn'

const CARE_ASSET_ID = Number((import.meta as any).env.VITE_CARE_COIN_ASSET_ID)

export default function ThankYou() {
  const navigate = useNavigate()
  const { activeAddress, signTransactions, isReady } = useWallet()
  const { status, refetch, algodClient } = useCareCoinOptIn(activeAddress)

  const [localOptedIn, setLocalOptedIn] = useState(false)
  const [optInLoading, setOptInLoading] = useState(false)
  const [optInError, setOptInError] = useState<string | null>(null)

  const isOptedIn = localOptedIn || status === 'opted-in'

  useEffect(() => {
    if (!isReady) return
    if (!activeAddress) navigate('/')
  }, [activeAddress, isReady, navigate])

  useEffect(() => {
    if (activeAddress) {
      localStorage.setItem(`care-submitted-${activeAddress}`, 'true')
    }
  }, [activeAddress])

  const handleOptIn = async () => {
    if (!activeAddress) return
    setOptInLoading(true)
    setOptInError(null)
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 0,
        assetIndex: CARE_ASSET_ID,
        suggestedParams,
      } as any)
      const signedTxns = await signTransactions([txn])
      const validTxns = signedTxns.filter((t): t is Uint8Array => t !== null)
      if (validTxns.length === 0) throw new Error('Wallet signing cancelled')
      await algodClient.sendRawTransaction(validTxns).do()
      await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4)
      setLocalOptedIn(true)
      refetch()
    } catch (e: unknown) {
      console.error('Opt-in error:', e)
      setOptInError('Opt-in failed. Please check your wallet and try again.')
    } finally {
      setOptInLoading(false)
    }
  }

  if (!isReady) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <span className="w-4 h-4 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
    </div>
  )

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
      <div className="max-w-lg w-full mx-auto space-y-6 text-center">

        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[#141938]">Thank you!</h1>
          <p className="text-gray-500 text-base leading-relaxed">
            Now enable Care Coin to receive your tokens.
          </p>
        </div>

        {/* Opt-in */}
        {!isOptedIn && (
          <div className="bg-pink-50 border border-pink-100 rounded-2xl p-6 space-y-4 text-left">
            <div className="space-y-1">
                         
            </div>
            {optInError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{optInError}</p>
            )}
            {status === 'loading' && !localOptedIn ? (
              <p className="text-sm text-gray-400 animate-pulse">Checking wallet…</p>
            ) : (
              <button
                onClick={handleOptIn}
                disabled={optInLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-all"
              >
                {optInLoading ? 'Confirming in wallet…' : 'Enable Care Coin →'}
              </button>
            )}
          </div>
        )}

        {/* Success + Dashboard button */}
        {isOptedIn && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-3 text-left">
              <span className="text-emerald-500 text-xl">✓</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">Care Coin enabled!</p>
                
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full px-6 py-3 rounded-xl bg-[#1333fa] hover:bg-[#fa1179] text-white font-medium text-sm transition-all"
            >
              Go to Dashboard →
            </button>
          </>
        )}

      </div>
    </div>
  )
}