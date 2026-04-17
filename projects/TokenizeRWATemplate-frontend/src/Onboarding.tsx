import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useState } from 'react'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

type Step = 'idle' | 'funding' | 'checkingOptIn' | 'readyToActivate' | 'activating' | 'done' | 'error'

export default function Onboarding() {
  const { activeAddress, transactionSigner } = useWallet()
  const [step, setStep] = useState<Step>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  // ─── Step 1: Auto-fund on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!activeAddress) return
    setStep('funding')

    fetch('/api/fund-wallet', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: activeAddress }),
    })
      .then((r) => r.json())
      .then(() => checkOptIn())
      .catch(() => {
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

      if (alreadyOptedIn) {
        setStep('done')
      } else {
        setStep('readyToActivate')
      }
    } catch {
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

      // Welcome Bonus vom Treasury anfordern
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
    <div className="onboarding-container">
      <h1>This is a research pilot.</h1>
      <p>Your care work matters — and we want to recognise it.</p>

      {!activeAddress && (
        <p className="status-info">Bitte verbinde dein Wallet, um fortzufahren.</p>
      )}

      {step === 'funding' && (
        <p className="status-info">⏳ Bereite dein Konto vor…</p>
      )}

      {step === 'checkingOptIn' && (
        <p className="status-info">⏳ Prüfe Konto-Status…</p>
      )}

      {step === 'readyToActivate' && (
        <div className="activate-section">
          <p>Ein letzter Schritt, um Care Coins empfangen zu können.</p>
          <button
            className="btn-primary"
            onClick={handleActivate}
          >
            ✅ Konto aktivieren &amp; Welcome-Bonus erhalten
          </button>
          {errorMsg && <p className="error-msg">{errorMsg}</p>}
        </div>
      )}

      {step === 'activating' && (
        <p className="status-info">⏳ Konto wird aktiviert — bitte Wallet-Popup bestätigen…</p>
      )}

      {step === 'done' && (
        <div className="done-section">
          <p>🎉 Dein Konto ist aktiviert. Beantworte jetzt ein paar Fragen, damit wir dir Care Coins senden können.</p>
          {/* Formular kommt hier */}
        </div>
      )}

      {step === 'error' && (
        <div className="error-section">
          <p className="error-msg">{errorMsg}</p>
          <button onClick={() => window.location.reload()}>
            Seite neu laden
          </button>
        </div>
      )}
    </div>
  )
}