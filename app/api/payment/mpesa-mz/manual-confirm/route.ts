import { NextRequest, NextResponse } from 'next/server'
import { z }      from 'zod'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

export const dynamic = 'force-dynamic'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  orderRef: z.string().startsWith('EVN-ORD-'),
})

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
        <p style="color:#475569;font-size:14px;margin:0 0 20px;">
          Your M-Pesa payment was confirmed by Vodacom Mozambique.
        </p>
        <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;
                    padding:18px;text-align:center;margin-bottom:20px;">
          <p style="color:#64748b;font-size:11px;margin:0 0 4px;
                    text-transform:uppercase;letter-spacing:1px;">
            Vodacom Transaction ID
          </p>
          <p style="color:#16a34a;font-size:26px;font-weight:bold;
                    letter-spacing:4px;margin:0;font-family:monospace;">
            ${txId}
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin-bottom:18px;">
          <tr>
            <td style="padding:7px 0;color:#64748b;font-size:13px;
                       border-bottom:1px solid #e2e8f0;">Order Reference</td>
            <td style="padding:7px 0;text-align:right;
                       font-family:monospace;font-weight:bold;">${ref}</td>
          </tr>
          <tr>
            <td style="padding:7px 0;color:#64748b;font-size:13px;">Total Paid</td>
            <td style="padding:7px 0;text-align:right;font-weight:bold;
                       color:#E85D04;font-size:18px;">${total} MZN</td>
          </tr>
        </table>
        <div style="background:#f8fafc;border-radius:8px;padding:14px;margin-bottom:18px;">
          <p style="color:#475569;font-size:13px;font-weight:bold;margin:0 0 8px;">
            Recharged Meters:
          </p>
          ${items.map(i => `
            <div style="display:flex;justify-content:space-between;
                        padding:5px 0;border-bottom:1px solid #e2e8f0;">
              <span style="font-family:monospace;color:#1e293b;font-size:13px;">
                ⚡ ${i.meterNumber}
              </span>
              <span style="font-weight:bold;color:#E85D04;">${i.amount} MZN</span>
            </div>`).join('')}
        </div>
        <p style="color:#16a34a;font-size:13px;font-weight:bold;margin:0;">
          Your meters will be credited within 5 minutes.
        </p>
      </div>
      <div style="background:#f8fafc;padding:18px 32px;border-top:1px solid #e2e8f0;">
        <p style="color:#94a3b8;font-size:12px;margin:0;">
          EVN — Eletricidade Vantara Nacional, E.P.<br/>
          Linha Verde: 1455 (free, 24/7) | atendimento@evn.co.mz
        </p>
      </div>
    </div>
  </body></html>`
}

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

    const { orderRef } = parsed.data

    const order = await prisma.order.findUnique({ where: { orderRef } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status === 'PAID') {
      return NextResponse.json({
        success:    true,
        message:    'Already paid',
        paymentRef: order.paymentRef,
      })
    }
    if (order.status !== 'PROCESSING') {
      return NextResponse.json(
        { error: 'Order is not in a payable state' },
        { status: 400 }
      )
    }

    // Extract txRef from paymentRef stored as "txRef|tpRef"
    const rawRef = order.paymentRef ?? ''
    const txId   = rawRef.includes('|')
      ? rawRef.split('|')[0]
      : rawRef

    await prisma.order.update({
      where: { orderRef },
      data:  {
        status:     'PAID',
        paymentRef: txId,
        updatedAt:  new Date(),
      },
    })

    const items = order.items as Array<{ meterNumber: string; amount: number }>

    await resend.emails.send({
      from:    'EVN Portal <onboarding@resend.dev>',
      to:      order.email,
      subject: `EVN — M-Pesa Payment Confirmed: ${txId}`,
      html:    buildReceiptEmail(
        order.nome,
        txId,
        orderRef,
        order.total,
        items
      ),
    })

    console.log('[mpesa-mz/manual-confirm] ✅ PAID', orderRef, txId)

    return NextResponse.json({
      success:       true,
      transactionId: txId,
      orderRef,
      message:       'Payment confirmed successfully',
    })

  } catch (err) {
    console.error('[mpesa-mz/manual-confirm]', err)
    return NextResponse.json(
      { error: 'Confirmation failed — please try again' },
      { status: 500 }
    )
  }
}
