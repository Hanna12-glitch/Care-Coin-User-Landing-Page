import algosdk from 'algosdk'
import { useCallback, useEffect, useState } from 'react'

const algodClient = new algosdk.Algodv2(
  '',
  import.meta.env.VITE_ALGOD_SERVER ?? 'https://testnet-api.algonode.cloud',
  import.meta.env.VITE_ALGOD_PORT ?? 443
)

const CARE_ASSET_ID = Number(import.meta.env.VITE_CARE_COIN_ASSET_ID)

export type OptInStatus = 'loading' | 'opted-in' | 'not-opted-in' | 'error'

export function useCareCoinOptIn(activeAddress: string | null) {
  const [status, setStatus] = useState<OptInStatus>('loading')

  const checkOptIn = useCallback(async () => {
    if (!activeAddress) {
      setStatus('not-opted-in')
      return
    }
    try {
      setStatus('loading')
      const info = await algodClient.accountInformation(activeAddress).do()
      const assets: Array<{ 'asset-id': number }> = info['assets'] ?? []
      const hasAsset = assets.some((a) => a['asset-id'] === CARE_ASSET_ID)
      setStatus(hasAsset ? 'opted-in' : 'not-opted-in')
    } catch (e) {
      console.error('OptIn check failed', e)
      setStatus('error')
    }
  }, [activeAddress])

  useEffect(() => {
    checkOptIn()
  }, [checkOptIn])

  return { status, refetch: checkOptIn, algodClient }
}