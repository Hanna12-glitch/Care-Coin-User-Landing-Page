import { useWallet } from '@txnlab/use-wallet-react'
import { useEffect, useState } from 'react'
import algosdk from 'algosdk'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

export default function Onboarding() {
  const { activeAddress, transactionSigner } = useWallet()

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
      .then((r) => r.json())
      .then(() => setFundStatus('funded'))
      .catch(() => setFundStatus('error'))
  }, [activeAddress])

  // Step 2: Check if already opted in
  useEffect(() => {
    if (!activeAddress || fundStatus !== 'funded') return
    const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
    algod.accountInformation(activeAddress).do().then((info: { assets?: { assetId: bigint }[] }) => {
      const assets = info.assets ?? []
      const opted = assets.some((a) => Number(a.assetId) === ASSET_ID)
      setAlreadyOptedIn(opted)
      if (opted) setOptInStatus('done')
    })
  }, [activeAddress, fundStatus])

  // Step 3: Opt-in handler
  const handleOptIn = async () => {
    if (!activeAddress || !transactionSigner) return
    setOptInStatus('loading')
    setOptInError('')
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
      setOptInStatus('done')
    } catch (e) {
      console.error(e)
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
        This is a research pilot. Your care work matters — and we want to recognise it.
      </p>

      {/* Wallet connected */}
      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#16a34a' }}>●</span>
          <strong>Wallet connected</strong>
        </div>
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: 4 }}>{activeAddress}</div>
      </div>

      {/* Step 1: Welcome Fund */}
      {fundStatus === 'funding' && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Preparing your wallet…</strong>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>
            Sending your welcome ALGO. This takes a few seconds.
          </p>
        </div>
      )}

      {(fundStatus === 'funded' || fundStatus === 'error') && !alreadyOptedIn && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>✅</span>
            <strong>Welcome fund received</strong>
          </div>
          <p style={{ fontSize: '0.875rem', color: '#666', marginTop: 4 }}>
            1 ALGO has been sent to your wallet to get you started.
          </p>
        </div>
      )}

      {/* Step 2: Opt-In */}
      {fundStatus === 'funded' && optInStatus !== 'done' && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: '1rem' }}>
          <strong>Enable Care Coin</strong>
          <p style={{ fontSize: '0.875rem', color: '#555', margin: '0.5rem 0 1rem' }}>
            One quick wallet step so we can send you Care Coins.
          </p>
          <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>
            ⓘ Your wallet needs a tiny ALGO reserve for this.
          </p>
          {optInError && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{optInError}</p>
          )}
          <button
            onClick={handleOptIn}
            disabled={optInStatus === 'loading'}
            style={{
              width: '100%', padding: '0.875rem', background: '#0d9488', color: '#fff',
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
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>✅</span>
              <strong>Care Coin enabled</strong>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#555', marginTop: 4 }}>
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
            src="https://forms.app/en/67ef5edde29f1edcc2f4e4b0"
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
