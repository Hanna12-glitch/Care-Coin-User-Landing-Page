import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCareCoinOptIn } from './useCareCoinOptIn'

const CARE_ASSET_ID = Number((import.meta as any).env.VITE_CARE_COIN_ASSET_ID)
const FORMS_APP_ID = '69de0aa001324e32c38f6893'
const FORMS_APP_BASE_URL = 'https://6h6u8bjv.forms.app'
const WALLET_FIELD_ID = '69de108c8ca500adbd32ae02'
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'

function loadFormsScript(callback: () => void) {
  const existing = document.querySelector('script[src="https://forms.app/cdn/embed.js"]')
  if (existing) { callback(); return }
  const script = document.createElement('script')
  script.src = 'https://forms.app/cdn/embed.js'
  script.async = true
  script.defer = true
  script.onload = callback
  document.body.appendChild(script)
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { activeAddress, signTransactions } = useWallet()
  const { status, refetch, algodClient } = useCareCoinOptIn(activeAddress)

  const [localOptedIn, setLocalOptedIn] = useState(false)
  const [optInLoading, setOptInLoading] = useState(false)
  const [optInError, setOptInError] = useState<string | null>(null)
  const [fundingStatus, setFundingStatus] = useState<'idle' | 'checking' | 'funded' | 'skipped'>('idle')

  const formInitializedRef = useRef(false)
  const activeAddressRef = useRef(activeAddress)
  useEffect(() => { activeAddressRef.current = activeAddress }, [activeAddress])

  const isOptedIn = localOptedIn || status === 'opted-in'

  // Logout-Redirect
  useEffect(() => {
    if (!activeAddress) navigate('/')
  }, [activeAddress, navigate])

  // Welcome Fund
  useEffect(() => {
    if (!activeAddress || fundingStatus !== 'idle') return
    const checkAndFund = async () => {
      setFundingStatus('checking')
      try {
        const res = await fetch('/api/fund-wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: activeAddress }),
        })
        const data = await res.json()
        setFundingStatus(data.funded ? 'funded' : 'skipped')
      } catch {
        setFundingStatus('skipped')
      }
    }
    checkAndFund()
  }, [activeAddress, fundingStatus])

  // On-chain CARE balance check → Dashboard wenn bereits Coins vorhanden
  useEffect(() => {
    if (!activeAddress) return
    if (status === 'loading') return
    const checkBalance = async () => {
      try {
        const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
        const info = await algod.accountInformation(activeAddress).do() as {
          assets?: { assetId: bigint; amount: bigint }[]
        }
        const careAsset = (info.assets ?? []).find((a) => Number(a.assetId) === CARE_ASSET_ID)
        const careBalance = careAsset ? Number(careAsset.amount) : 0
        console.log('CARE balance in Onboarding:', careBalance)
        if (careBalance > 0) {
          navigate('/dashboard')
        }
      } catch (e) {
        console.error('Balance check failed:', e)
      }
    }
    checkBalance()
  }, [activeAddress, status, navigate])

  // forms.app postMessage → /thank-you
  useEffect(() => {
  const handleMessage = async (event: MessageEvent) => {
    console.log('ALL messages:', event.origin, JSON.stringify(event.data))
    if (event.origin.includes('forms.app')) {
      console.log('forms.app message:', event.data)
    }
    if (
      typeof event.data === 'object' &&
      event.data?.type === 'formsapp' &&
      event.data?.action === 'submitted'
    ) {
      // CARE Coins senden nach Form-Submit
      try {
        const res = await fetch('/api/send-care', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            address: activeAddressRef.current,
            amount: 10,  // ← Anzahl CARE Coins anpassen
          }),
        })
        const data = await res.json()
        console.log('send-care result:', data)
      } catch (e) {
        console.error('send-care failed:', e)
      }
      navigate('/thank-you')
    }
  }
  window.addEventListener('message', handleMessage)
  return () => window.removeEventListener('message', handleMessage)
}, [activeAddress, navigate])

  // forms.app Callback-Ref
  const initForm = useCallback((node: HTMLDivElement | null) => {
    if (!node || formInitializedRef.current) return
    node.setAttribute('formsappId', FORMS_APP_ID)
    loadFormsScript(() => {
      if (formInitializedRef.current) return
      if (typeof (window as any).formsapp !== 'function') return
      new (window as any).formsapp(
        FORMS_APP_ID,
        'standard',
        {
          width: '100%',
          height: '500px',
          opacity: 0,
          answers: { [WALLET_FIELD_ID]: activeAddressRef.current ?? '' },
        },
        FORMS_APP_BASE_URL
      )
      formInitializedRef.current = true
    })
  }, [])

  const handleOptIn = async () => {
    const address = activeAddressRef.current
    if (!address) return
    setOptInLoading(true)
    setOptInError(null)
    try {
      const suggestedParams = await algodClient.getTransactionParams().do()
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: address,
        receiver: address,
        amount: 0,
        assetIndex: CARE_ASSET_ID,
        suggestedParams,
      } as any)
      const encodedTxn = algosdk.encodeUnsignedTransaction(txn)
      const signedTxns = await signTransactions([encodedTxn])
      const validTxns = signedTxns.filter((t): t is Uint8Array => t !== null)
      if (validTxns.length === 0) throw new Error('Wallet signing cancelled')
      await algodClient.sendRawTransaction(validTxns).do()
      await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4)
      setLocalOptedIn(true)
      refetch()
    } catch (e: unknown) {
      console.error('Opt-in error:', e)
      setOptInError('Opt-in fehlgeschlagen. Bitte prüfe dein Wallet und versuche es erneut.')
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
              <p className="text-xs text-gray-400 font-mono truncate max-w-xs">{activeAddress}</p>
            </div>
          </div>
        </div>

        {fundingStatus === 'checking' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-blue-400 animate-pulse inline-block" />
            <p className="text-sm text-blue-700">Preparing your wallet…</p>
          </div>
        )}
        

        {!isOptedIn && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-100 p-6 space-y-4">
            <div className="space-y-1">
              <h2 className="font-semibold text-gray-800">Enable Care Coin</h2>
              <p className="text-sm text-gray-500">
                One quick wallet step so we can send you Care Coins.
              </p>
              <p className="text-xs text-gray-400">
                ⓘ Your wallet needs a tiny ALGO reserve for this.
              </p>
            </div>
            {optInError && (
              <p className="text-sm text-red-500 bg-red-50 rounded-xl p-3">{optInError}</p>
            )}
            {status === 'loading' && !localOptedIn ? (
              <p className="text-sm text-gray-400 animate-pulse">Checking wallet…</p>
            ) : (
              <button
                onClick={handleOptIn}
                disabled={optInLoading || fundingStatus === 'checking'}
                className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-medium py-3 rounded-xl transition-all"
              >
                {optInLoading ? 'Confirming in wallet…' : 'Enable Care Coin →'}
              </button>
            )}
          </div>
        )}

        {isOptedIn && (
          <>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
              <span className="text-emerald-500 text-lg">✓</span>
              <div>
                <p className="text-sm font-medium text-emerald-800">Care Coin enabled</p>
                <p className="text-xs text-emerald-600">
                  You are all set. Please fill in the form below so we can send you Care Coins.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-800">Tell us about your care work</h2>
                <p className="text-xs text-gray-400">
                  Your answers help us understand how to value care better.
                </p>
              </div>
              <div ref={initForm} className="min-h-[200px]" />
            </div>
          </>
        )}

      </div>
    </div>
  )
}
