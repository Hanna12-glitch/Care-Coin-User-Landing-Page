import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

type Step = 'idle' | 'funding' | 'checkingOptIn' | 'readyToActivate' | 'activating' | 'done' | 'error'

export default function Onboarding() {
  const { activeAddress, transactionSigner } = useWallet()
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // Redirect to home if wallet disconnects after being connected
  const hasBeenConnected = useRef(false)
  useEffect(() => {
    if (activeAddress) {
      hasBeenConnected.current = true
    } else if (hasBeenConnected.current) {
      navigate('/')
    }
  }, [activeAddress, navigate])

  // Listen for forms.app submission → navigate to thank-you
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

  // ─── Step 1: Auto-fund on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!activeAddress) return
    setStep('funding')

    fetch('/api/fund-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: activeAddress }),
    })
      .then(async (r) => {
        const data = await r.json()
        console.log('Fund-wallet response:', r.status, data)
        if (!r.ok) throw new Error(`HTTP ${r.status}: ${JSON.stringify(data)}`)
        checkOptIn()
      })
      .catch((err) => {
        console.error('Fund-wallet error:', err)
        setErrorMsg('Wallet konnte nicht aufgeladen werden. Bitte Seite neu laden.')
        setStep('error')
      })
  }, [activeAddress])

  // ─── Step 2: Check opt-in status ──────────────────────────────────────────
  const checkOptIn = async () => {
    setStep('checkingOptIn')
    try {
      const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
      const info = await algod.accountInformation(activeAddress!).do() as {
        assets?: { assetId: bigint }[]
      }
      const assets = info.assets ?? []
      const alreadyOptedIn = assets.some((a) => Number(a.assetId) === ASSET_ID)
      console.log('ASSET_ID:', ASSET_ID, '| opted in:', alreadyOptedIn)

      if (alreadyOptedIn) {
        setStep('done')
      } else {
        setStep('readyToActivate')
      }
    } catch (err) {
      console.error('checkOptIn error:', err)
      setErrorMsg('Wallet-Status konnte nicht geprüft werden.')
      setStep('error')
    }
  }

  // ─── Step 3: Activate = Opt-In + Welcome Bonus ───────────────────────────
  const handleActivate = async () => {
    if (!activeAddress || !transactionSigner) return
    setStep('activating')
    setErrorMsg('')

    try {
      const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
      const params = await algod.getTransactionParams().do()

      const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
        sender: activeAddress,
        receiver: activeAddress,
        amount: 0,
        assetIndex: ASSET_ID,
        suggestedParams: params,
      })

      await transactionSigner([txn], [0])

      await fetch('/api/send-care', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress, amount: 10 }),
      })

      setStep('done')
    } catch (e) {
      console.error(e)
      setErrorMsg('Aktivierung fehlgeschlagen. Bitte versuche es erneut.')
      setStep('readyToActivate')
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Welcome to Care Coin
      </h1>
      <p style={{ marginBottom: '0.5rem', color: '#555' }}>
        This is a research pilot.
      </p>
      <p style={{ marginBottom: '2rem', color: '#555' }}>
        Your care work matters — and we want to recognise it.
      </p>

      {/* Funding */}
      {step === 'funding' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Preparing your wallet…</strong>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>
            Sending your welcome ALGO. This takes a few seconds.
          </p>
        </div>
      )}

      {/* Checking */}
      {step === 'checkingOptIn' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Checking account status…</strong>
        </div>
      )}

      {/* Ready to activate */}
      {step === 'readyToActivate' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
            Please accept our currency so we can send you Care Coins.
          </p>
          {errorMsg && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{errorMsg}</p>
          )}
          <button
            onClick={handleActivate}
            style={{
              width: '100%', padding: '0.875rem', background: '#1333fa', color: '#fff',
              border: 'none', borderRadius: 8, fontWeight: 600, fontSize: '1rem', cursor: 'pointer',
            }}
          >
            Enable Care Coin →
          </button>
        </div>
      )}

      {/* Activating */}
      {step === 'activating' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Activating — please confirm in your wallet…</strong>
        </div>
      )}

      {/* Done — show form */}
      {step === 'done' && (
        <div>
          <div style={{ background: '#e5f8fc', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <strong>Care Coin enabled ✅</strong>
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

      {/* Error */}
      {step === 'error' && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{errorMsg}</p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '0.5rem 1rem', background: '#dc2626', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Seite neu laden
          </button>
        </div>
      )}
    </div>
  )
}