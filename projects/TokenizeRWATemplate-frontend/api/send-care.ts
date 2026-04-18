import type { VercelRequest, VercelResponse } from '@vercel/node'
import algosdk from 'algosdk'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = 443
const ALGOD_TOKEN = ''
// Zeile 6 ersetzen:
const ASSET_ID = Number(process.env.CARE_COIN_ASSET_ID) || 758800978
const MAX_SEND_AMOUNT = 1000 // Sicherheitslimit pro Request

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address, amount } = req.body

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing address' })
  }

  const sendAmount = Number(amount)
  if (!sendAmount || sendAmount <= 0 || sendAmount > MAX_SEND_AMOUNT) {
    return res.status(400).json({ error: `Invalid amount (max ${MAX_SEND_AMOUNT})` })
  }

  const mnemonic = process.env.TREASURY_MNEMONIC
  if (!mnemonic) {
    return res.status(500).json({ error: 'Treasury not configured' })
  }

  try {
    const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)
    const treasury = algosdk.mnemonicToSecretKey(mnemonic)

    // Prüfen ob Empfänger bereits opted-in ist
    const accountInfo = await algod.accountInformation(address).do() as {
      assets?: { assetId: bigint }[]
    }
    const assets = accountInfo.assets ?? []
    const isOptedIn = assets.some((a) => Number(a.assetId) === ASSET_ID)

    if (!isOptedIn) {
      return res.status(400).json({ error: 'Recipient has not opted in to CARE token' })
    }

    const params = await algod.getTransactionParams().do()

    const txn = algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
      sender: treasury.addr,
      receiver: address,
      amount: sendAmount, // CARE Token hat keine Dezimalstellen → 100 = 100 CARE
      assetIndex: ASSET_ID,
      suggestedParams: params,
    })

    const signedTxn = txn.signTxn(treasury.sk)
    await algod.sendRawTransaction(signedTxn).do()
    await algosdk.waitForConfirmation(algod, txn.txID().toString(), 4)

    console.log(`Sent ${sendAmount} CARE to ${address}. TxID: ${txn.txID()}`)

    return res.status(200).json({
      success: true,
      txId: txn.txID().toString(),
      amount: sendAmount,
    })
  } catch (err) {
    console.error('send-care error:', err)
    return res.status(500).json({ error: 'Failed to send CARE token' })
  }
}