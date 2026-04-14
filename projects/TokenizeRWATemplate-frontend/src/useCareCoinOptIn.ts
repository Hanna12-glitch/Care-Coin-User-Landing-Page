import { useState, useEffect, useCallback, useRef } from 'react'
import algosdk from 'algosdk'

const CARE_ASSET_ID = Number((import.meta as any).env.VITE_CARE_COIN_ASSET_ID)
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'

export type OptInStatus = 'loading' | 'opted-in' | 'not-opted-in'

const algodClient = new algosdk.Algodv2('', ALGOD_SERVER, '')

export function useCareCoinOptIn(address: string | null) {
  const [status, setStatus] = useState<OptInStatus>('loading')
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
    }
  }, [])

  const check = useCallback(async () => {
    if (!address) {
      setStatus('not-opted-in')
      return
    }

    setStatus('loading')

    try {
      const info = await algodClient.accountInformation(address).do()

      const assets: any[] =
        info?.assets ??
        (info as any)?.['assets'] ??
        []

      const hasAsset = assets.some((a: any) => {
        const id =
          a?.assetId ??
          a?.['asset-id'] ??
          a?.['assetId'] ??
          a?.id

        return Number(id) === CARE_ASSET_ID
      })

      if (mountedRef.current) {
        setStatus(hasAsset ? 'opted-in' : 'not-opted-in')
      }
    } catch (e) {
      console.error('useCareCoinOptIn check failed:', e)
      if (mountedRef.current) setStatus('not-opted-in')
    }
  }, [address])

  useEffect(() => {
    check()
  }, [check])

  return { status, refetch: check, algodClient }
}