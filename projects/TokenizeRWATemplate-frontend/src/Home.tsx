import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const pollOptIn = async (address: string, assetId: number): Promise<boolean> => {
  const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
  for (let i = 0; i < 10; i++) {
    await sleep(3000)
    const info = await algod.accountInformation(address).do() as {
      assets?: { assetId: bigint }[]
    }
    const opted = (info.assets ?? []).some((a) => Number(a.assetId) === assetId)
    console.log(`Opt-in poll ${i + 1}/10:`, opted)
    if (opted) return true
  }
  return false
}

type SetupStep = 'idle' | 'funding' | 'opting-in' | 'confirming' | 'done' | 'error'

export default function Home() {
  const { activeAddress, wallets, transactionSigner } = useWallet()
  const web3authWallet = wallets?.find(w => w.id === 'web3auth')
  const navigate = useNavigate()
  const [setupStep, setSetupStep] = useState<SetupStep>('idle')
  const [setupError, setSetupError] = useState('')
  const setupStarted = useRef(false)

  useEffect(() => {
    if (!activeAddress || setupStarted.current) return
    setupStarted.current = true
    runSetup()
  }, [activeAddress])

  const runSetup = async () => {
    try {
      setSetupStep('funding')
      const fundRes = await fetch('/api/fund-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address: activeAddress }),
      })
      const fundData = await fundRes.json()
      console.log('Fund-wallet:', fundRes.status, fundData)
      if (!fundRes.ok) throw new Error(`Fund failed: ${JSON.stringify(fundData)}`)

      const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
      const info = await algod.accountInformation(activeAddress!).do() as {
        assets?: { assetId: bigint }[]
      }
      const alreadyOptedIn = (info.assets ?? []).some((a) => Number(a.assetId) === ASSET_ID)
      console.log('Already opted in:', alreadyOptedIn)

      if (!alreadyOptedIn) {
        setSetupStep('opting-in')
        const params = await algod.getTransactionParams().do()
        const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: activeAddress!,
          receiver: activeAddress!,
          amount: 0,
          assetIndex: ASSET_ID,
          suggestedParams: params,
        })
        await transactionSigner([txn], [0])

        setSetupStep('confirming')
        const confirmed = await pollOptIn(activeAddress!, ASSET_ID)
        if (!confirmed) throw new Error('Opt-in nicht bestätigt nach 30 Sekunden.')
      }

      setSetupStep('done')
      navigate('/onboarding')
    } catch (err) {
      console.error('Setup error:', err)
      setSetupError('Something went wrong. Please reload and try again.')
      setSetupStep('error')
      setupStarted.current = false
    }
  }

  if (setupStep !== 'idle' && setupStep !== 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        fontFamily: 'sans-serif',
        gap: 16,
      }}>
        <div style={{ fontSize: '2rem' }}>⏳</div>
        {setupStep === 'funding' && <p style={{ fontWeight: 600 }}>Preparing your wallet…</p>}
        {setupStep === 'opting-in' && <p style={{ fontWeight: 600 }}>Setting up Care Coin…</p>}
        {setupStep === 'confirming' && (
          <>
            <p style={{ fontWeight: 600 }}>Confirming on Algorand…</p>
            <p style={{ color: '#666', fontSize: '0.875rem' }}>This takes about 15 seconds.</p>
          </>
        )}
      </div>
    )
  }

  if (setupStep === 'error') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#ffffff',
        fontFamily: 'sans-serif',
        gap: 16,
      }}>
        <p style={{ color: '#dc2626' }}>{setupError}</p>
        <button
          onClick={() => window.location.reload()}
          style={{ padding: '0.5rem 1rem', background: '#1333fa', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}
        >
          Reload
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#ffffff] dark:bg-[#141938]">
      {/* dein bestehendes Landing-Page JSX bleibt hier unverändert */}
    </div>
  )
}