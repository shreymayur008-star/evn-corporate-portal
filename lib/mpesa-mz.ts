import crypto from 'crypto'

// ── Config ────────────────────────────────────────────────────────
const IS_SANDBOX = process.env.MPESA_MZ_ENV !== 'production'
const HOST       = IS_SANDBOX
  ? process.env.MPESA_MZ_SANDBOX_HOST
  : process.env.MPESA_MZ_PROD_HOST
const PORT       = IS_SANDBOX
  ? process.env.MPESA_MZ_SANDBOX_PORT
  : process.env.MPESA_MZ_PROD_PORT
const BASE_URL   = `https://${HOST}:${PORT}/ipg/v1x`
const SPC        = process.env.MPESA_MZ_SERVICE_PROVIDER_CODE!
const ORIGIN     = process.env.MPESA_MZ_ORIGIN!

// ── RSA-4096 Bearer Token Generation ─────────────────────────────
// Vodacom MZ does NOT use OAuth. Instead:
// 1. Take your API Key (32-char string)
// 2. Encrypt it with your 4096-bit RSA Public Key
// 3. Base64-encode the result
// 4. Use as: Authorization: Bearer {result}
export function generateBearer(): string {
  const apiKey    = process.env.MPESA_MZ_API_KEY!
  const publicKey = process.env.MPESA_MZ_PUBLIC_KEY!

  const decodedKey = Buffer.from(publicKey, 'base64')
  const pubKeyObj  = crypto.createPublicKey({
    key:    decodedKey,
    format: 'der',
    type:   'spki',
  })
  const encrypted = crypto.publicEncrypt(
    { key: pubKeyObj, padding: crypto.constants.RSA_PKCS1_PADDING },
    Buffer.from(apiKey, 'utf8')
  )
  return encrypted.toString('base64')
}

// ── Shared fetch helper ───────────────────────────────────────────
async function mpesaFetch(
  path:   string,
  method: 'POST' | 'PUT' | 'GET',
  body?:  Record<string, string>
): Promise<Record<string, string>> {
  const bearer = generateBearer()
  const res    = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${bearer}`,
      'Content-Type':  'application/json',
      'Origin':        ORIGIN,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok && res.status !== 400) {
    throw new Error(`MPesa HTTP error: ${res.status} ${res.statusText}`)
  }
  return res.json()
}

// ── Mozambican Phone Normaliser ───────────────────────────────────
// Accepts: 841234567 | 0841234567 | +258841234567 | 258841234567
// Returns: 258841234567
export function normaliseMozPhone(raw: string): string {
  let digits = raw.replace(/\D/g, '')
  if (digits.startsWith('00258')) digits = digits.slice(5)
  if (digits.startsWith('258'))   digits = digits.slice(3)
  if (digits.startsWith('0'))     digits = digits.slice(1)
  const final = '258' + digits
  if (!/^258(84|85|86|82|83|87)\d{7}$/.test(final)) {
    throw new Error(
      `Invalid Mozambican phone: must start with 84, 85, 86, 82, 83 or 87`
    )
  }
  return final
}

// ── Response Code Descriptions ────────────────────────────────────
export const MPESA_CODES: Record<string, string> = {
  'INS-0':    'Payment processed successfully',
  'INS-1':    'Internal processing error — please retry',
  'INS-5':    'Transaction cancelled by customer',
  'INS-6':    'Transaction failed — please retry',
  'INS-9':    'Request timed out — checking status',
  'INS-10':   'This number is not registered on MPesa',
  'INS-13':   'Unable to initiate — retry in 30 seconds',
  'INS-993':  'Authentication failed — check API credentials',
  'INS-2006': 'Insufficient MPesa balance — please top up',
  'INS-2051': 'Wrong PIN entered too many times — contact Vodacom',
  'INS-2057': 'Daily transaction limit exceeded — try tomorrow',
}

export function getMpesaMessage(code: string): string {
  return MPESA_CODES[code] ?? `MPesa error: ${code}`
}

// ── C2B: Customer pays EVN Portal ────────────────────────────────
export interface C2BParams {
  amount:         number
  msisdn:         string
  transactionRef: string
  thirdPartyRef:  string
}

export interface C2BResult {
  success:         boolean
  responseCode:    string
  responseDesc:    string
  transactionId?:  string
  conversationId?: string
  thirdPartyRef?:  string
  message:         string
}

export async function initiateC2B(params: C2BParams): Promise<C2BResult> {
  const msisdn = normaliseMozPhone(params.msisdn)

  const data = await mpesaFetch('/c2bPayment/singleStage/', 'POST', {
    input_TransactionReference: params.transactionRef,
    input_CustomerMSISDN:       msisdn,
    input_Amount:               params.amount.toString(),
    input_ThirdPartyReference:  params.thirdPartyRef,
    input_ServiceProviderCode:  SPC,
  })

  const code    = data.output_ResponseCode
  const success = code === 'INS-0'

  return {
    success,
    responseCode:   code,
    responseDesc:   data.output_ResponseDesc,
    transactionId:  data.output_TransactionID,
    conversationId: data.output_ConversationID,
    thirdPartyRef:  data.output_ThirdPartyReference,
    message:        getMpesaMessage(code),
  }
}

// ── Transaction Status Query ──────────────────────────────────────
export interface QueryParams {
  queryReference: string
  thirdPartyRef:  string
}

export async function queryTransactionStatus(
  params: QueryParams
): Promise<Record<string, string>> {
  return mpesaFetch('/queryTransactionStatus/', 'POST', {
    input_QueryReference:           params.queryReference,
    input_ServiceProviderCode:      SPC,
    input_ThirdPartyConversationID: params.thirdPartyRef,
    input_Country:                  'MOZ',
  })
}

// ── B2C: EVN Portal refunds customer ─────────────────────────────
export interface B2CParams {
  amount:         number
  msisdn:         string
  transactionRef: string
  thirdPartyRef:  string
}

export async function initiateB2C(
  params: B2CParams
): Promise<Record<string, string>> {
  const msisdn = normaliseMozPhone(params.msisdn)
  return mpesaFetch('/b2cPayment/', 'POST', {
    input_Amount:               params.amount.toString(),
    input_CustomerMSISDN:       msisdn,
    input_CustomerFirstName:    'EVN',
    input_CustomerLastName:     'Refund',
    input_ThirdPartyReference:  params.thirdPartyRef,
    input_TransactionReference: params.transactionRef,
    input_ServiceProviderCode:  SPC,
  })
}

// ── Reversal ─────────────────────────────────────────────────────
export interface ReversalParams {
  transactionId: string
  amount:        number
  thirdPartyRef: string
}

export async function reverseTransaction(
  params: ReversalParams
): Promise<Record<string, string>> {
  return mpesaFetch('/reversal/', 'PUT', {
    input_ReversalAmount:           params.amount.toString(),
    input_TransactionID:            params.transactionId,
    input_ThirdPartyConversationID: params.thirdPartyRef,
    input_Country:                  'MOZ',
    input_ServiceProviderCode:      SPC,
  })
}
