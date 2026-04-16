import type { VercelRequest, VercelResponse } from '@vercel/node'
import algosdk from 'algosdk'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = 443
const ALGOD_TOKEN = ''
const FUND_AMOUNT_ALGO = 1_000_000 // 1 ALGO in microAlgo
const MIN_BALANCE_THRESHOLD = 200_200_000 // 0.2 ALGO — nur funden wenn darunter

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS für Codespace + Vercel
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address } = req.body
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing address' })
  }

  const mnemonic = process.env.TREASURY_MNEMONIC
  if (!mnemonic) {
    return res.status(500).json({ error: 'Treasury not configured' })
  }

  try {
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

    // Balance des Empfängers prüfen
    const accountInfo = await algodClient.accountInformation(address).do()
    const currentBalance = Number(accountInfo.amount)

    if (currentBalance >= MIN_BALANCE_THRESHOLD) {
      return res.status(200).json({ 
        funded: false, 
        reason: 'Already has sufficient balance',
        balance: currentBalance 
      })
    }

    // Treasury-Wallet laden
    const treasuryAccount = algosdk.mnemonicToSecretKey(mnemonic)
    const suggestedParams = await algodClient.getTransactionParams().do()

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: treasuryAccount.addr,
      receiver: address,
      amount: FUND_AMOUNT_ALGO,
      suggestedParams,
    })

    const signedTxn = txn.signTxn(treasuryAccount.sk)
    await algodClient.sendRawTransaction(signedTxn).do()
    await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4)

    console.log(`Funded ${address} with 1 ALGO. TxID: ${txn.txID()}`)

    return res.status(200).json({ 
      funded: true, 
      txId: txn.txID().toString(),
      amount: FUND_AMOUNT_ALGO
    })

  } catch (err) {
    console.error('Fund error:', err)
    return res.status(500).json({ error: 'Funding failed' })
  }
}