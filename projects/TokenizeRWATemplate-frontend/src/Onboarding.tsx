import { useWallet } from '@txnlab/use-wallet-react'
import algosdk from 'algosdk'
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

export default function Onboarding() {
  const { activeAddress } = useWallet()
  const navigate = useNavigate()
  const [careSent, setCareSent] = useState(false)
  const [error, setError] = useState('')
  const sendStarted = useRef(false)

  const hasBeenConnected = useRef(false)
  useEffect(() => {
    if (activeAddress) {
      hasBeenConnected.current = true
    } else if (hasBeenConnected.current) {
      navigate('/')
    }
  }, [activeAddress, navigate])

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

  useEffect(() => {
    if (!activeAddress || sendStarted.current) return
    sendStarted.current = true

    const run = async () => {
      try {
        // Check if user already has CARE tokens
        const algod = new algosdk.Algodv2('', ALGOD_SERVER, 443)
        const info = await algod.accountInformation(activeAddress).do() as {
          assets?: { assetId: bigint; amount: bigint }[]
        }
        const careAsset = (info.assets ?? []).find((a) => Number(a.assetId) === ASSET_ID)
        const careBalance = careAsset ? Number(careAsset.amount) : 0
        console.log('CARE balance:', careBalance)

        if (careBalance > 0) {
          // Already has tokens — skip send
          console.log('Already has CARE tokens, skipping send-care')
          setCareSent(true)
          return
        }

        // Send welcome bonus
        const res = await fetch('/api/send-care', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address: activeAddress, amount: 10 }),
        })
        const data = await res.json()
        console.log('send-care:', res.status, data)
        setCareSent(true)
      } catch (err) {
        console.error('send-care error:', err)
        setError('Welcome bonus konnte nicht gesendet werden.')
        setCareSent(true)
      }
    }

    run()
  }, [activeAddress])

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1rem', fontFamily: 'sans-serif' }}>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>
        Welcome to Care Coin
      </h1>
      <p style={{ marginBottom: '0.5rem', color: '#555' }}>This is a research pilot.</p>
      <p style={{ marginBottom: '2rem', color: '#555' }}>Your care work matters — and we want to recognise it.</p>

      {!careSent && (
        <div style={{ background: '#fefce8', border: '1px solid #fde68a', borderRadius: 12, padding: '1rem', marginBottom: '1rem' }}>
          <strong>⏳ Setting up your account…</strong>
        </div>
      )}

      {careSent && (
        <div>
          <div style={{ background: '#e5f8fc', borderRadius: 12, padding: '1rem', marginBottom: '1.5rem' }}>
            <strong>Care Coin enabled ✅</strong>
            <p style={{ fontSize: '0.875rem', fontWeight: 600, color: '#1333fa', marginTop: 4 }}>
              You are all set. Please fill in the form below so we can send you Care Coins.
            </p>
          </div>

          {error && (
            <p style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>
          )}

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