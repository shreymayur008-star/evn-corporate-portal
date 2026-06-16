import { NextRequest, NextResponse } from 'next/server'
import { z }                         from 'zod'
import { Resend }                    from 'resend'
import { prisma }                    from '@/lib/db'
import {
  initiateC2B,
  queryTransactionStatus,
  normaliseMozPhone,
} from '@/lib/mpesa-mz'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  phone:    z.string().min(9, 'Phone number too short'),
  amount:   z.number().min(1,  'Amount must be at least 1 MZN'),
  orderRef: z.string().startsWith('EVN-ORD-', 'Invalid order reference'),
})

// ── Background polling — no callback URL needed ────────────────
// Fires after C2B succeeds. Polls Vodacom every 10 seconds.
// When PAID: updates DB → SSE picks it up → browser updates live.
async function pollUntilResolved(
  orderRef:      string,
  thirdPartyRef: string,
  email:         string,
  nome:          string,
  total:         number,
  items:         Array<{ meterNumber: string; amount: number }>
): Promise<void> {
  const MAX_ATTEMPTS  = 6        // 6 × 10s = 60 seconds max
  const POLL_INTERVAL = 10_000  // 10 seconds between polls

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    await new Promise(res => setTimeout(res, POLL_INTERVAL))

    try {
      const result = await queryTransactionStatus({
        queryReference: orderRef,
        thirdPartyRef,
      })

      const code = result.output_ResponseCode

      console.log(
        `[mpesa-poll] attempt ${attempt}/${MAX_ATTEMPTS}`,
        orderRef, code
      )

      // ✅ Payment confirmed by Vodacom MZ
      if (code === 'INS-0') {
        const transactionId = result.output_TransactionID ?? ''

        await prisma.order.update({
          where: { orderRef },
          data:  {
            status:     'PAID',
            paymentRef: transactionId,
            updatedAt:  new Date(),
          },
        })

        await resend.emails.send({
          from:    'EVN Portal <onboarding@resend.dev>',
          to:      email,
          subject: `EVN — M-Pesa Payment Confirmed: ${transactionId}`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 0;margin:0;">
              <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
                <div style="background:#16a34a;padding:24px 32px;">
                  <h1 style="color:white;margin:0;font-size:22px;">Payment Confirmed</h1>
                  <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">
                    Vodacom Mozambique M-Pesa
                  </p>
                </div>
                <div style="padding:32px;">
                  <p style="color:#1e293b;font-size:16px;margin:0 0 8px;">Hello ${nome},</p>
                  <p style="color:#475569;font-size:14px;margin:0 0 24px;">
                    Your M-Pesa payment was confirmed by Vodacom Mozambique.
                  </p>
                  <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
                    <p style="color:#64748b;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">
                      Vodacom Transaction ID
                    </p>
                    <p style="color:#16a34a;font-size:26px;font-weight:bold;letter-spacing:4px;margin:0;font-family:monospace;">
                      ${transactionId}
                    </p>
                  </div>
                  <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Order Reference</td>
                      <td style="padding:8px 0;text-align:right;font-family:monospace;font-weight:bold;">${orderRef}</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Amount Paid</td>
                      <td style="padding:8px 0;text-align:right;font-weight:bold;color:#E85D04;font-size:18px;">${total} MZN</td>
                    </tr>
                    <tr>
                      <td style="padding:8px 0;color:#64748b;font-size:13px;">Date</td>
                      <td style="padding:8px 0;text-align:right;font-size:13px;">${new Date().toLocaleString('pt-MZ')}</td>
                    </tr>
                  </table>
                  <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
                    <p style="color:#475569;font-size:13px;font-weight:bold;margin:0 0 10px;">Recharged Meters:</p>
                    ${items.map(item => `
                      <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                        <span style="font-family:monospace;color:#1e293b;font-size:13px;">${item.meterNumber}</span>
                        <span style="font-weight:bold;color:#E85D04;">${item.amount} MZN</span>
                      </div>
                    `).join('')}
                  </div>
                  <p style="color:#16a34a;font-size:13px;font-weight:bold;margin:0;">
                    Your meters will be credited within 5 minutes.
                  </p>
                </div>
                <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
                  <p style="color:#94a3b8;font-size:12px;margin:0;">
                    EVN — Eletricidade Vantara Nacional, E.P.<br/>
                    Linha Verde: 1455 (free, 24/7) | atendimento@evn.co.mz
                  </p>
                </div>
              </div>
            </body>
            </html>
          `,
        })

        console.log('[mpesa-poll] PAID', orderRef, transactionId)
        return
      }

      // Definitive failure — stop polling
      if (['INS-5', 'INS-6'].includes(code)) {
        await prisma.order.update({
          where: { orderRef },
          data:  { status: 'FAILED', updatedAt: new Date() },
        })
        console.log('[mpesa-poll] FAILED', orderRef, code)
        return
      }

      // Other codes (INS-9, INS-13, etc.) — continue polling

    } catch (err) {
      console.error(`[mpesa-poll] attempt ${attempt} error:`, err)
    }
  }

  // Exhausted all attempts
  console.warn('[mpesa-poll] timed out after 60s', orderRef)
  await prisma.order.update({
    where: { orderRef },
    data:  { status: 'FAILED', updatedAt: new Date() },
  }).catch(() => {})
}

// ── Main Route Handler ─────────────────────────────────────────
export async function POST(req: NextRequest) {
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
    if (order.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This order has been cancelled' },
        { status: 400 }
      )
    }

    const thirdPartyRef = `EVN-${Date.now()}`

    await prisma.order.update({
      where: { orderRef },
      data:  { status: 'PROCESSING' },
    })

    const result = await initiateC2B({
      amount,
      msisdn:         normalisedPhone,
      transactionRef: orderRef,
      thirdPartyRef,
    })

    if (!result.success) {
      await prisma.order.update({
        where: { orderRef },
        data:  { status: 'PENDING' },
      })

      return NextResponse.json(
        {
          error:        result.message,
          responseCode: result.responseCode,
        },
        { status: 400 }
      )
    }

    await prisma.order.update({
      where: { orderRef },
      data:  { paymentRef: result.conversationId ?? result.transactionId ?? '' },
    })

    // Fire-and-forget background polling — does not block response
    const items = order.items as Array<{ meterNumber: string; amount: number }>

    void pollUntilResolved(
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
      message:        'Payment request sent — check your phone for the M-Pesa prompt',
    })

  } catch (err) {
    console.error('[mpesa-mz/initiate] error:', err)
    return NextResponse.json(
      { error: 'Payment initiation failed — please try again' },
      { status: 500 }
    )
  }
}
