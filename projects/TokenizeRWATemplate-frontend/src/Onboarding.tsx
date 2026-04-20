import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const FORMS_APP_ID = '69de0aa001324e32c38f6893'
const FORMS_APP_BASE_URL = 'https://6h6u8bjv.forms.app'
const WALLET_FIELD_ID = '69de108c8ca500adbd32ae02'
const CARE_ASSET_ID = Number((import.meta as any).env.VITE_CARE_COIN_ASSET_ID)
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
  const { activeAddress, isReady } = useWallet()

  const [fundingStatus, setFundingStatus] = useState<'idle' | 'checking' | 'funded' | 'skipped'>('idle')
  const formInitializedRef = useRef(false)
  const activeAddressRef = useRef(activeAddress)
  useEffect(() => { activeAddressRef.current = activeAddress }, [activeAddress])

  


  useEffect(() => {
  if (!isReady) return
  if (!activeAddress) { navigate('/'); return }

  // Returning user check — bereits opted-in und hat Care-Coins → Dashboard
  const checkReturningUser = async () => {
    try {
      const algod = new algosdk.Algodv2('', ALGOD_SERVER, '')
      const info = await algod.accountInformation(activeAddress).do() as {
        assets?: { assetId: bigint; amount: bigint }[]
      }
      const careAsset = (info.assets ?? []).find(a => Number(a.assetId) === CARE_ASSET_ID)
      if (careAsset && Number(careAsset.amount) > 0) {
        navigate('/dashboard')
      }
    } catch (e) {
      console.error('Returning user check failed:', e)
    }
  }
  checkReturningUser()
  }, [activeAddress, isReady, navigate])

  // Fund wallet on mount
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

  // Listen for form submit → redirect to thank-you
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        typeof event.data === 'object' &&
        event.data?.type === 'formsapp' &&
        event.data?.action === 'submitted'
      ) {
        navigate('/thank-you')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigate])

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

  if (!isReady) return (
    <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
      <span className="w-4 h-4 border-2 border-blue-300 border-t-blue-600 rounded-full animate-spin" />
    </div>
  )

  if (!activeAddress) return null

  return (
    <div className="min-h-screen bg-[#ffffff] py-10 px-4">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#141938]">Welcome to Care Coin</h1>
          <p className="text-[#141938] text-sm">
            This is a research pilot. Your care work matters — and we want to recognise it.
            You are now the owner of a digital wallet.
            Please register below with your care status to receive care-coin.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
            <div>
              <p className="text-sm font-medium text-gray-700">This is your account number</p>
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

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">Tell us about your care work</h2>
            <p className="text-xs text-gray-400">
              You will receive care-coin according to your care profile.
            </p>
          </div>
          <div ref={initForm} className="min-h-[200px]" />
        </div>

      </div>
    </div>
  )
}