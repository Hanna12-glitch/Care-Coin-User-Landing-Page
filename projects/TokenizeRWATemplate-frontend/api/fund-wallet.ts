import type { VercelRequest, VercelResponse } from '@vercel/node'
import algosdk from 'algosdk'

const ALGOD_SERVER = 'https://testnet-api.algonode.cloud'
const ALGOD_PORT = 443
const ALGOD_TOKEN = ''
const FUND_AMOUNT_ALGO = 1_000_000
const MIN_BALANCE_THRESHOLD = 200_000

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { address } = req.body ?? {}
  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing address' })
  }

  const mnemonic = process.env.TREASURY_MNEMONIC?.trim()
  if (!mnemonic) {
    return res.status(500).json({ error: 'Treasury not configured' })
  }

  try {
    const algodClient = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT)

    let currentBalance = 0
    try {
      const accountInfo = await algodClient.accountInformation(address).do()
      currentBalance = Number(accountInfo.amount ?? 0)
    } catch (accountErr: any) {
      const status = accountErr?.status ?? accountErr?.response?.status
      const message = String(accountErr?.message ?? accountErr)

      const is404 =
        status === 404 ||
        message.includes('404') ||
        message.toLowerCase().includes('not found') ||
        message.toLowerCase().includes('no accounts found')

      if (!is404) {
        throw accountErr
      }
    }

    if (currentBalance >= MIN_BALANCE_THRESHOLD) {
      return res.status(200).json({
        funded: false,
        reason: 'Already has sufficient balance',
        balance: currentBalance,
      })
    }

    const treasuryAccount = algosdk.mnemonicToSecretKey(mnemonic)
    const suggestedParams = await algodClient.getTransactionParams().do()

    const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      sender: treasuryAccount.addr,
      receiver: address,
      amount: FUND_AMOUNT_ALGO,
      suggestedParams,
    })

    const signedTxn = txn.signTxn(treasuryAccount.sk)
    const sendResp = await algodClient.sendRawTransaction(signedTxn).do()
    await algosdk.waitForConfirmation(algodClient, txn.txID().toString(), 4)

    return res.status(200).json({
      funded: true,
      txId: txn.txID().toString(),
      tx: sendResp,
      amount: FUND_AMOUNT_ALGO,
    })
  } catch (err: any) {
    console.error('Fund error:', {
      message: err?.message,
      status: err?.status,
      body: err?.response?.body,
      stack: err?.stack,
    })

    return res.status(500).json({
      error: 'Funding failed',
      details: err?.message ?? 'Unknown error',
    })
  }
}