export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ItemSchema = z.object({
  meterNumber: z.string().length(11),
  amount:      z.number().min(50).max(10000),
  description: z.string(),
})

const schema = z.object({
  nome:  z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  items: z.array(ItemSchema).min(1),
  total: z.number().min(50),
})

function generateOrderRef(): string {
  return 'EVN-ORD-' + Math.random().toString(36).substring(2, 8).toUpperCase()
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

    const { nome, email, phone, items, total } = parsed.data
    const orderRef = generateOrderRef()

    const order = await prisma.order.create({
      data: { orderRef, nome, email, phone, items, total }
    })

    await resend.emails.send({
      from:    'EVN Portal <onboarding@resend.dev>',
      to:      email,
      subject: `EVN Portal — Order Confirmed: ${orderRef}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 0;margin:0;">
          <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
            <div style="background:#E85D04;padding:24px 32px;">
              <h1 style="color:white;margin:0;font-size:22px;">&#x26A1; EVN Portal</h1>
              <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Eletricidade Vantara Nacional, E.P.</p>
            </div>
            <div style="padding:32px;">
              <h2 style="color:#1e293b;font-size:18px;margin:0 0 4px;">Order Confirmed</h2>
              <p style="color:#64748b;font-size:13px;margin:0 0 24px;">Hello ${nome}, your Credelec recharge order has been received.</p>
              <div style="background:#fff7ed;border:2px solid #E85D04;border-radius:10px;padding:16px;margin-bottom:20px;">
                <p style="color:#64748b;font-size:12px;margin:0 0 4px;text-transform:uppercase;letter-spacing:1px;">Order Reference</p>
                <p style="color:#E85D04;font-size:24px;font-weight:bold;letter-spacing:4px;margin:0;font-family:monospace;">${orderRef}</p>
              </div>
              <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                <tr style="background:#f8fafc;">
                  <th style="padding:10px;text-align:left;font-size:12px;color:#64748b;border-bottom:2px solid #E85D04;">Meter Number</th>
                  <th style="padding:10px;text-align:right;font-size:12px;color:#64748b;border-bottom:2px solid #E85D04;">Amount</th>
                </tr>
                ${(items as Array<{meterNumber:string;amount:number}>).map(item => `
                <tr>
                  <td style="padding:10px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;font-family:monospace;">${item.meterNumber}</td>
                  <td style="padding:10px;font-size:13px;color:#1e293b;border-bottom:1px solid #e2e8f0;text-align:right;font-weight:bold;">${item.amount} MZN</td>
                </tr>`).join('')}
                <tr style="background:#f8fafc;">
                  <td style="padding:12px 10px;font-weight:bold;color:#1e293b;">Total</td>
                  <td style="padding:12px 10px;font-weight:bold;color:#E85D04;text-align:right;font-size:18px;">${total} MZN</td>
                </tr>
              </table>
              <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin-bottom:20px;">
                <p style="color:#16a34a;font-size:13px;margin:0;font-weight:bold;">&#x23F3; Next Step: Complete your MPesa payment to activate the recharge.</p>
              </div>
              <p style="color:#94a3b8;font-size:12px;margin:0;">Do not share your order reference with anyone. Keep it for your records.</p>
            </div>
            <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="color:#94a3b8;font-size:12px;margin:0;">EVN — Eletricidade Vantara Nacional, E.P.<br/>Linha Verde: 1455 (free 24/7) | atendimento@evn.co.mz</p>
            </div>
          </div>
        </body>
        </html>
      `,
    })

    return NextResponse.json({ success: true, orderRef, orderId: order.id }, { status: 201 })

  } catch (err) {
    console.error('create order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
