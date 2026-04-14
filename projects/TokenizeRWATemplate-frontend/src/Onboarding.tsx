import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useCareCoinOptIn } from './useCareCoinOptIn'

const CARE_ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)
const FORMS_APP_ID = '69de0aa001324e32c38f6893'
const FORMS_APP_BASE_URL = 'https://6h6u8bjv.forms.app'
const WALLET_FIELD_ID = '69de108c8ca500adbd32ae02'

export default function Onboarding() {
  const { activeAddress, signTransactions } = useWallet()
  const { status, refetch, algodClient } = useCareCoinOptIn(activeAddress)
  const [optInLoading, setOptInLoading] = useState(false)
  const [optInError, setOptInError] = useState<string | null>(null)
  const formInitializedRef = useRef(false)

  const isOptedIn = status === 'opted-in'

  useEffect(() => {
    if (!isOptedIn || !activeAddress || formInitializedRef.current) return

    const initFormsApp = () => {
      if (typeof (window as any).formsapp === 'function') {
        new (window as any).formsapp(
          FORMS_APP_ID,
          'standard',
          {
            width: '100%',
            height: '820px',
            opacity: 0,
            answers: {
              [WALLET_FIELD_ID]: activeAddress,
            },
          },
          FORMS_APP_BASE_URL
        )
        formInitializedRef.current = true
      }
    }

    const existing = document.querySelector(
      'script[src="https://forms.app/cdn/embed.js"]'
    )

    if (existing) {
      initFormsApp()
    } else {
      const script = document.createElement('script')
      script.src = 'https://forms.app/cdn/embed.js'
      script.async = true
      script.defer = true
      script.onload = initFormsApp
      document.body.appendChild(script)
    }
  }, [isOptedIn, activeAddress])

  const handleOptIn = async () => {
    if (!activeAddress) return
    setOptInLoading(true)
    setOptInError(null)

    try {
      const suggestedParams = await algodClient.getTransactionParams().do()

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        from: activeAddress,
        to: activeAddress,
        amount: 0,
        assetIndex: CARE_ASSET_ID,
        suggestedParams,
      })

      const encodedTxn = algosdk.encodeUnsignedTransaction(txn)
      const signedTxns = await signTransactions([encodedTxn])

      await algodClient.sendRawTransaction(signedTxns).do()
      await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4)

      await refetch()
    } catch (e) {
      console.error(e)
      setOptInError(
        'Opt-in fehlgeschlagen. Bitte prüfe dein Wallet und versuche es erneut.'
      )
    } finally {
      setOptInLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-emerald-50 py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-teal-800">Welcome to Care Coin</h1>
          <p className="text-gray-500 text-sm">
            This is a research pilot. Your care work matters — and we want to recognise it.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <div>
              <p className="text-sm font-medium text-gray-700">Wallet connected</p>
              <p className="text-xs text-gray-400 font-mono truncate max-w-xs">
                {activeAddress}
              </p>
            </div>
          </div>
        </div>

        {!isOptedIn && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="font-semibold text-gray-800">Enable Care Coin</h2>
              <p className="text-sm text-gray-500">
                One quick wallet step so we can send you test funds and Care Coins.
              </p>
              <p className="text-xs text-gray-400">
                ⓘ Your wallet needs a tiny ALGO reserve for this (≈ 0.1 ALGO).
              </p>
            </div>

            {optInError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">
                {optInError}
              </p>
            )}

            {status === 'loading' ? (
              <p className="text-sm text-gray-400 animate-pulse">Checking wallet…</p>
            ) : (
              <button
                onClick={handleOptIn}
                disabled={optInLoading}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
              >
                {optInLoading ? 'Confirming in wallet…' : 'Enable Care Coin →'}
              </button>
            )}
          </div>
        )}

        {isOptedIn && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-emerald-500 text-lg">✓</span>
            <div>
              <p className="text-sm font-medium text-emerald-800">Care Coin enabled</p>
              <p className="text-xs text-emerald-600">
                You are all set. Please fill in the form below so we can send you Care Coins.
              </p>
            </div>
          </div>
        )}

        {isOptedIn && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
            <div className="px-5 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800">Tell us about your care work</h2>
              <p className="text-xs text-gray-400">
                Your answers help us understand how to value care better.
              </p>
            </div>

            <div formsappId={FORMS_APP_ID}></div>
          </div>
        )}
      </div>
    </div>
  )
}