export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  phone:        z.string().min(9),
  amount:       z.number().min(50),
  orderRef:     z.string().startsWith('EVN-ORD-'),
  meterNumbers: z.array(z.string()),
})

function generateTransactionId(): string {
  return 'MP' + Date.now().toString().slice(-8) +
    Math.random().toString(36).substring(2, 6).toUpperCase()
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

    const { phone, amount, orderRef, meterNumbers } = parsed.data

    const order = await prisma.order.findUnique({ where: { orderRef } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status === 'PAID') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    await new Promise(resolve => setTimeout(resolve, 1500))

    const transactionId = generateTransactionId()

    await prisma.order.update({
      where: { orderRef },
      data:  { status: 'PAID', paymentRef: transactionId }
    })

    await resend.emails.send({
      from:    'EVN Portal <onboarding@resend.dev>',
      to:      order.email,
      subject: `EVN Portal — Payment Confirmed: ${transactionId}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 0;margin:0;">
          <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="background:#16a34a;padding:24px 32px;">
              <h1 style="color:white;margin:0;font-size:22px;">&#x2705; Payment Confirmed</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">EVN — Eletricidade Vantara Nacional, E.P.</p>
            </div>
            <div style="padding:32px;">
              <p style="color:#1e293b;font-size:16px;margin:0 0 24px;">Hello ${order.nome}, your MPesa payment was successful!</p>
              <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:16px;margin-bottom:20px;text-align:center;">
                <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Transaction ID</p>
                <p style="color:#16a34a;font-size:22px;font-weight:bold;letter-spacing:4px;margin:0;font-family:monospace;">${transactionId}</p>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Order Reference</td><td style="padding:8px 0;font-weight:bold;text-align:right;font-family:monospace;">${orderRef}</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Amount Paid</td><td style="padding:8px 0;font-weight:bold;color:#E85D04;text-align:right;font-size:18px;">${amount} MZN</td></tr>
                <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Phone</td><td style="padding:8px 0;font-weight:bold;text-align:right;">${phone}</td></tr>
              </table>
              <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
                <p style="color:#475569;font-size:13px;margin:0 0 8px;font-weight:bold;">Meters to be recharged:</p>
                ${meterNumbers.map((m: string) => `<p style="color:#1e293b;font-family:monospace;font-size:14px;margin:4px 0;">&#x26A1; ${m}</p>`).join('')}
              </div>
              <p style="color:#16a34a;font-size:13px;font-weight:bold;">Your meters will be credited within 5 minutes.</p>
            </div>
            <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">EVN — Linha Verde: 1455 (free 24/7) | atendimento@evn.co.mz</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({
      success:       true,
      transactionId,
      amount,
      phone,
      orderRef,
      message: `Payment of ${amount} MZN processed successfully via M-Pesa`,
    })

  } catch (err) {
    console.error('mpesa error:', err)
    return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 })
  }
}
