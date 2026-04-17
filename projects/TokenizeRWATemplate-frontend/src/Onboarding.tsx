import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

export default function Onboarding() {
  const { activeAddress, transactionSigner } = useWallet()
  const navigate = useNavigate()

  const hasBeenConnected = useRef(false)
  useEffect(() => {
    if (activeAddress) {
      hasBeenConnected.current = true
    } else if (hasBeenConnected.current) {
      navigate('/')
    }
  }, [activeAddress, navigate])

  const [fundStatus, setFundStatus] = useState<'idle' | 'funding' | 'funded' | 'error'>('idle')
  const [optInStatus, setOptInStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [optInError, setOptInError] = useState('')
  const [alreadyOptedIn, setAlreadyOptedIn] = useState(false)

  // Step 1: Auto-fund wallet on mount
  useEffect(() => {
    if (!activeAddress) return
    setFundStatus('funding')
    fetch('/api/fund-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: activeAddress }),
    })
      .then(async (r) => {
        const data = await r.json()
        console.log('Fund-wallet response:', r.status, data)
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(data)}`)
        setFundStatus('funded')
      })
      .catch((err) => {
        console.error('Fund-wallet frontend error:', err)
        setFundStatus('error')
      })
  }, [activeAddress])

  // Step 2: Check if already opted in
  useEffect(() => {
    if (!activeAddress || fundStatus !== 'funded') return
    const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
    algod.accountInformation(activeAddress).do().then((info: { assets?: { assetId: bigint }[] }) => {
      console.log('ASSET_ID:', ASSET_ID, typeof ASSET_ID)
      console.log('assets:', info.assets)
      const assets = info.assets ?? []
      const opted = assets.some((a) => Number(a.assetId) === ASSET_ID)
      console.log('alreadyOptedIn:', opted)
      setAlreadyOptedIn(opted)
      if (opted) setOptInStatus('done')
    })
  }, [activeAddress, fundStatus])

  // Step 3: Listen for form submission via postMessage
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (
        event.origin.includes('forms.app') &&
        typeof event.data === 'string' &&
        event.data.startsWith('formsapp-formSubmitted')
      ) {
        navigate('/thank-you')
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [navigate])

  // Step 4: Opt-in handler
  const handleOptIn = async () => {
    console.log('handleOptIn called', { activeAddress, hasSigner: !!transactionSigner })
    if (!activeAddress || !transactionSigner) {
      console.warn('Early return — missing address or signer', { activeAddress, transactionSigner })
      return
    }
    setOptInStatus('loading')
    setOptInError('')
    try {
      const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
      const params = await algod.getTransactionParams().do()
      console.log('Transaction params:', params)
      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 0,
        assetIndex: ASSET_ID,
        suggestedParams: params,
      })
      console.log('Sending txn to signer...', txn)
      await transactionSigner([txn], [0])
      console.log('Opt-in success!')
      setOptInStatus('done')
    } catch (e) {
      console.error('Opt-in error:', e)
      setOptInError('Opt-in fehlgeschlagen. Bitte prüfe dein Wallet und versuche es erneut.')
      setOptInStatus('error')
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1.5rem' }}>
        Welcome to Care Coin
      </h1>
      <p style={{ marginBottom: '2rem', color: '#555' }}>
        This is a research pilot.
      </p>
      <p style={{ marginBottom: '2rem', color: '#555' }}>
        Your care work matters — and we want to recognise it.
      </p>

      {/* Step 1: Welcome Fund */}
      {fundStatus === 'funding' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Preparing your wallet…</strong>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>
            Sending your welcome ALGO. This takes a few seconds.
          </p>
        </div>
      )}

      {/* Step 2: Opt-In */}
      {(fundStatus === 'funded' || fundStatus === 'error') && optInStatus !== 'done' && !alreadyOptedIn && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
            Please accept our currency so we can send you Care Coins.
          </p>
          {optInError && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{optInError}</p>
          )}
          <button
            onClick={handleOptIn}
            disabled={optInStatus === 'loading'}
            style={{
              width: '100%', padding: '0.875rem', background: '#1333fa', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            {optInStatus === 'loading' ? 'Enabling…' : 'Enable Care Coin →'}
          </button>
        </div>
      )}

      {/* Step 3: Form */}
      {(optInStatus === 'done' || alreadyOptedIn) && (
        <div>
          <div style={{ background: '#e5f8fc', border: '0px solid #1333fa', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Care Coin enabled</strong>
            </div>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1333fa', marginTop: 4 }}>
              You are all set. Please fill in the form below so we can send you Care Coins.
            </p>
          </div>

          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.25rem' }}>
            Tell us about your care work
          </h2>
          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
            Your answers help us understand how to value care better.
          </p>

          <iframe
            src="https://join-project-care-coin.forms.app/onboarding"
            width="100%"
            height="600"
            style={{ border: 'none', borderRadius: 12 }}
            title="Care Work Survey"
          />
        </div>
      )}
    </div>
  )
}