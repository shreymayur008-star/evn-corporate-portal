import { NextRequest, NextResponse } from 'next/server'
import { z }      from 'zod'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'
import {
  initiateC2B,
  queryTransactionStatus,
  normaliseMozPhone,
  getMpesaMessage,
} from '@/lib/mpesa-mz'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  phone:    z.string().min(9, 'Phone number too short'),
  amount:   z.number().min(1,  'Amount must be at least 1 MZN'),
  orderRef: z.string().startsWith('EVN-ORD-', 'Invalid order reference'),
})

// ── Email builder ─────────────────────────────────────────────
function buildReceiptEmail(
  nome:  string,
  txId:  string,
  ref:   string,
  total: number,
  items: Array<{ meterNumber: string; amount: number }>
): string {
  return `<!DOCTYPE html><html>
  <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 0;margin:0;">
    <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
      <div style="background:#16a34a;padding:24px 32px;">
        <h1 style="color:white;margin:0;font-size:22px;">✅ Payment Confirmed</h1>
        <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Vodacom Mozambique M-Pesa</p>
      </div>
      <div style="padding:32px;">
        <p style="color:#1e293b;font-size:15px;margin:0 0 18px;">Hello ${nome},</p>
        <p style="color:#475569;font-size:14px;margin:0 0 20px;">Your M-Pesa payment was confirmed by Vodacom Mozambique.</p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:18px;text-align:center;margin-bottom:20px;">
          <p style="color:#64748b;font-size:11px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Vodacom Transaction ID</p>
          <p style="color:#16a34a;font-size:26px;font-weight:bold;letter-spacing:4px;margin:0;font-family:monospace;">${txId}</p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Order Reference</td>
              <td style="padding:7px 0;text-align:right;font-family:monospace;font-weight:bold;">${ref}</td></tr>
          <tr><td style="padding:7px 0;color:#64748b;font-size:13px;">Amount Paid</td>
              <td style="padding:7px 0;text-align:right;font-weight:bold;color:#E85D04;font-size:18px;">${total} MZN</td></tr>
        </table>
        <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:18px;">
          <p style="color:#475569;font-size:13px;font-weight:bold;margin:0 0 8px;">Recharged Meters:</p>
          ${items.map(i => `
            <div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid #e2e8f0;">
              <span style="font-family:monospace;color:#1e293b;font-size:13px;">⚡ ${i.meterNumber}</span>
              <span style="font-weight:bold;color:#E85D04;">${i.amount} MZN</span>
            </div>`).join('')}
        </div>
        <p style="color:#16a34a;font-size:13px;font-weight:bold;margin:0;">Your meters will be credited within 5 minutes.</p>
      </div>
      <div style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">EVN — Eletricidade Vantara Nacional, E.P.<br/>
        Linha Verde: 1455 (free, 24/7) | atendimento@evn.co.mz</p>
      </div>
    </div>
  </body></html>`
}

// ── Background polling ────────────────────────────────────────
// No callback URL needed. Polls Vodacom every 10s after C2B.
// When customer enters PIN → Vodacom confirms → DB→PAID→email→SSE
async function pollUntilPaid(
  orderRef:      string,
  thirdPartyRef: string,
  email:         string,
  nome:          string,
  total:         number,
  items:         Array<{ meterNumber: string; amount: number }>
): Promise<void> {
  const MAX     = 12  // 12 × 10s = 120 seconds (2 minutes)
  const WAIT_MS = 10_000

  for (let i = 1; i <= MAX; i++) {
    await new Promise(r => setTimeout(r, WAIT_MS))

    try {
      const result = await queryTransactionStatus({
        queryReference: orderRef,
        thirdPartyRef,
      })

      const code = result.output_ResponseCode
      console.log(`[mpesa-poll] attempt ${i}/${MAX} — ${orderRef} — ${code}`)

      if (code === 'INS-0') {
        const txId = result.output_TransactionID ?? ''

        await prisma.order.update({
          where: { orderRef },
          data:  { status: 'PAID', paymentRef: txId, updatedAt: new Date() },
        })

        await resend.emails.send({
          from:    'EVN Portal <onboarding@resend.dev>',
          to:      email,
          subject: `EVN — M-Pesa Payment Confirmed: ${txId}`,
          html:    buildReceiptEmail(nome, txId, orderRef, total, items),
        })

        console.log('[mpesa-poll] ✅ PAID', orderRef, txId)
        return
      }

      if (['INS-5', 'INS-6'].includes(code)) {
        await prisma.order.update({
          where: { orderRef },
          data:  { status: 'FAILED', updatedAt: new Date() },
        })
        console.log('[mpesa-poll] ❌ FAILED', orderRef, code)
        return
      }

      // INS-9, INS-13, others = still pending, continue polling

    } catch (err) {
      console.error(`[mpesa-poll] attempt ${i} error:`, err)
    }
  }

  // Timed out after 2 minutes
  console.warn('[mpesa-poll] timeout after 2min', orderRef)
  await prisma.order.update({
    where: { orderRef },
    data:  { status: 'FAILED', updatedAt: new Date() },
  }).catch(() => {})
}

// ── Main handler ──────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let parsedOrderRef = ''

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { phone, amount, orderRef } = parsed.data
    parsedOrderRef = orderRef

    let normalisedPhone: string
    try {
      normalisedPhone = normaliseMozPhone(phone)
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 }
      )
    }

    const order = await prisma.order.findUnique({ where: { orderRef } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status === 'PAID') {
      return NextResponse.json(
        { error: 'This order has already been paid' },
        { status: 400 }
      )
    }

    const thirdPartyRef = `EVN-${Date.now()}`

    await prisma.order.update({
      where: { orderRef },
      data:  { status: 'PROCESSING' },
    })

    // ── Real Vodacom MZ C2B API call ──────────────────────────
    const result = await initiateC2B({
      amount,
      msisdn:         normalisedPhone,
      transactionRef: orderRef,
      thirdPartyRef,
    })

    console.log('[mpesa-mz/initiate]', orderRef, result.responseCode)

    if (result.success) {
      await prisma.order.update({
        where: { orderRef },
        data:  { paymentRef: result.conversationId ?? result.transactionId ?? '' },
      })

      const items = order.items as Array<{ meterNumber: string; amount: number }>

      // Fire-and-forget background polling
      void pollUntilPaid(
        orderRef,
        thirdPartyRef,
        order.email,
        order.nome,
        order.total,
        items
      )

      return NextResponse.json({
        success:        true,
        transactionId:  result.transactionId,
        conversationId: result.conversationId,
        thirdPartyRef,
        normalisedPhone,
        message: 'Payment request sent — check your phone for the M-Pesa prompt',
      })
    }

    // ── Vodacom returned a non-success code ───────────────────
    await prisma.order.update({
      where: { orderRef },
      data:  { status: 'PENDING' },
    })

    return NextResponse.json(
      {
        error:        getMpesaMessage(result.responseCode),
        responseCode: result.responseCode,
      },
      { status: 400 }
    )

  } catch (err) {
    console.error('[mpesa-mz/initiate] error:', err)

    if (parsedOrderRef) {
      await prisma.order.update({
        where: { orderRef: parsedOrderRef },
        data:  { status: 'PENDING' },
      }).catch(() => {})
    }

    return NextResponse.json(
      { error: 'Payment initiation failed — please try again' },
      { status: 500 }
    )
  }
}
