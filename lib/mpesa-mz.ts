import crypto from 'crypto'

// ── Config ────────────────────────────────────────────────────
const IS_SANDBOX = process.env.MPESA_MZ_ENV !== 'production'
const HOST       = IS_SANDBOX
  ? process.env.MPESA_MZ_SANDBOX_HOST!
  : process.env.MPESA_MZ_PROD_HOST!
const PORT       = IS_SANDBOX
  ? process.env.MPESA_MZ_SANDBOX_PORT!
  : process.env.MPESA_MZ_PROD_PORT!
const SPC        = process.env.MPESA_MZ_SERVICE_PROVIDER_CODE!
const ORIGIN     = process.env.MPESA_MZ_ORIGIN!

// ── RSA Bearer Token (used for query and reversal) ───────────
export function generateBearer(): string {
  const apiKey    = process.env.MPESA_MZ_API_KEY!
  const publicKey = process.env.MPESA_MZ_PUBLIC_KEY!
  const decoded   = Buffer.from(publicKey, 'base64')
  const pubKeyObj = crypto.createPublicKey({
    key: decoded, format: 'der', type: 'spki',
  })
  const encrypted = crypto.publicEncrypt(
    { key: pubKeyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(apiKey, 'utf8')
  )
  return encrypted.toString('base64')
}

// ── Phone normaliser ─────────────────────────────────────────
export function normaliseMozPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00258')) digits = digits.slice(5)
  if (digits.startsWith('258'))   digits = digits.slice(3)
  if (digits.startsWith('0'))     digits = digits.slice(1)
  const final = '258' + digits
  if (!/^258(84|85|86|82|83|87)\d{7}$/.test(final)) {
    throw new Error(
      'Invalid Mozambican phone number — must start with 84, 85, 86, 82, 83 or 87'
    )
  }
  return final
}

// ── Reference generators (NO hyphens — Vodacom rejects them) ─
export function generateTxRef(): string {
  // Format: T + 10 digits — matches mpesa-node-api examples (T12344C)
  return 'T' + Date.now().toString().slice(-10)
}

export function generateThirdPartyRef(): string {
  // Format: 6 uppercase alphanumeric — matches mpesa-node-api examples (ref1, ZXVM9H)
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

// ── C2B via mpesa-node-api package ───────────────────────────
// This is what Mozambican developers use and what works with the sandbox.
// It handles URL construction, port, and request format internally.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mpesaLib = require('mpesa-node-api')

let mpesaInitialized = false
function ensureMpesaInit() {
  if (!mpesaInitialized) {
    mpesaLib.initializeApi({
      baseUrl:             HOST,
      apiKey:              process.env.MPESA_MZ_API_KEY!,
      publicKey:           process.env.MPESA_MZ_PUBLIC_KEY!,
      origin:              ORIGIN,
      serviceProviderCode: SPC,
    })
    mpesaInitialized = true
  }
}

export interface C2BResult {
  success:         boolean
  responseCode:    string
  responseDesc:    string
  transactionId?:  string
  conversationId?: string
  thirdPartyRef?:  string
  message:         string
  txRef:           string
  tpRef:           string
}

export async function initiateC2B(params: {
  amount:  number
  msisdn:  string   // normalised: 258XXXXXXXXX
  txRef:   string   // T1234567890
  tpRef:   string   // ZXVM9H
}): Promise<C2BResult> {
  ensureMpesaInit()

  const result = await mpesaLib.initiate_c2b(
    params.amount,
    parseInt(params.msisdn, 10),  // mpesa-node-api takes number
    params.txRef,
    params.tpRef
  )

  const code    = result?.output_ResponseCode ?? 'UNKNOWN'
  const success = code === 'INS-0'

  return {
    success,
    responseCode:   code,
    responseDesc:   result?.output_ResponseDesc ?? '',
    transactionId:  result?.output_TransactionID,
    conversationId: result?.output_ConversationID,
    thirdPartyRef:  result?.output_ThirdPartyReference,
    message:        getMpesaMessage(code),
    txRef:          params.txRef,
    tpRef:          params.tpRef,
  }
}

// ── Query via direct API (mpesa-node-api doesn't support this) ─
export async function queryTransactionStatus(params: {
  queryReference: string
  thirdPartyRef:  string
}): Promise<Record<string, string>> {
  const bearer = generateBearer()
  const res    = await fetch(
    `https://${HOST}:${PORT}/ipg/v1x/queryTransactionStatus/`,
    {
      method:  'POST',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type':  'application/json',
        'Origin':        ORIGIN,
      },
      body: JSON.stringify({
        input_QueryReference:           params.queryReference,
        input_ServiceProviderCode:      SPC,
        input_ThirdPartyConversationID: params.thirdPartyRef,
        input_Country:                  'MOZ',
      }),
    }
  )
  return res.json()
}

// ── Reversal via direct API ───────────────────────────────────
export async function reverseTransaction(params: {
  transactionId:  string
  amount:         number
  thirdPartyRef:  string
}): Promise<Record<string, string>> {
  const bearer = generateBearer()
  const res    = await fetch(
    `https://${HOST}:${PORT}/ipg/v1x/reversal/`,
    {
      method:  'PUT',
      headers: {
        'Authorization': `Bearer ${bearer}`,
        'Content-Type':  'application/json',
        'Origin':        ORIGIN,
      },
      body: JSON.stringify({
        input_ReversalAmount:           params.amount.toString(),
        input_TransactionID:            params.transactionId,
        input_ThirdPartyConversationID: params.thirdPartyRef,
        input_Country:                  'MOZ',
        input_ServiceProviderCode:      SPC,
      }),
    }
  )
  return res.json()
}

// ── Response codes ────────────────────────────────────────────
export const MPESA_CODES: Record<string, string> = {
  'INS-0':    'Payment processed successfully',
  'INS-1':    'Internal error — please retry',
  'INS-5':    'Transaction cancelled by customer',
  'INS-6':    'Transaction failed — please retry',
  'INS-9':    'Request timed out — checking status',
  'INS-10':   'Phone number not registered on MPesa',
  'INS-13':   'Unable to initiate — retry in 30 seconds',
  'INS-21':   'C2B service not provisioned on this account',
  'INS-993':  'Authentication failed — check API credentials',
  'INS-2006': 'Insufficient MPesa balance',
  'INS-2051': 'Wrong PIN entered too many times',
  'INS-2057': 'Daily transaction limit exceeded',
}

export function getMpesaMessage(code: string): string {
  return MPESA_CODES[code] ?? `MPesa error: ${code}`
}
