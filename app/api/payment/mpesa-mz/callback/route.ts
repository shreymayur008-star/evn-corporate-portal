import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const responseCode  = body.output_ResponseCode      as string
    const transactionId = body.output_TransactionID      as string
    const thirdPartyRef = body.output_ThirdPartyReference as string
    const responseDesc  = body.output_ResponseDesc       as string

    console.log('[mpesa-mz/callback] received:', {
      responseCode,
      transactionId,
      thirdPartyRef,
    })

    let order = await prisma.order.findFirst({
      where: {
        OR: [
          { orderRef:   thirdPartyRef },
          { paymentRef: { contains: thirdPartyRef } },
        ],
      },
    })

    if (!order) {
      order = await prisma.order.findFirst({
        where:   { status: 'PROCESSING' },
        orderBy: { updatedAt: 'desc' },
      })
    }

    if (!order) {
      console.warn('[mpesa-mz/callback] no matching order for:', thirdPartyRef)
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
    }

    if (responseCode === 'INS-0') {
      const updatedOrder = await prisma.order.update({
        where: { id: order.id },
        data:  {
          status:     'PAID',
          paymentRef: transactionId,
          updatedAt:  new Date(),
        },
      })

      const items = updatedOrder.items as Array<{
        meterNumber: string
        amount:      number
      }>

      await resend.emails.send({
        from:    'EVN Portal <onboarding@resend.dev>',
        to:      updatedOrder.email,
        subject: `EVN — M-Pesa Payment Confirmed: ${transactionId}`,
        html: `
          <!DOCTYPE html>
          <html>
          <body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:40px 0;margin:0;">
            <div style="max-width:520px;margin:0 auto;background:white;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
              <div style="background:#16a34a;padding:24px 32px;">
                <h1 style="color:white;margin:0;font-size:22px;">&#x2705; Payment Confirmed</h1>
                <p style="color:rgba(255,255,255,0.85);margin:4px 0 0;font-size:13px;">Vodacom Mozambique M-Pesa</p>
              </div>
              <div style="padding:32px;">
                <p style="color:#1e293b;font-size:16px;margin:0 0 20px;">Hello ${updatedOrder.nome},</p>
                <p style="color:#475569;font-size:14px;margin:0 0 24px;">Your M-Pesa payment was confirmed by Vodacom Mozambique.</p>
                <div style="background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:20px;text-align:center;margin-bottom:20px;">
                  <p style="color:#64748b;font-size:11px;margin:0 0 6px;text-transform:uppercase;letter-spacing:1px;">Vodacom Transaction ID</p>
                  <p style="color:#16a34a;font-size:26px;font-weight:bold;letter-spacing:4px;margin:0;font-family:monospace;">${transactionId}</p>
                </div>
                <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
                  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Order Reference</td><td style="padding:8px 0;text-align:right;font-family:monospace;font-weight:bold;">${updatedOrder.orderRef}</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;border-bottom:1px solid #e2e8f0;">Amount Paid</td><td style="padding:8px 0;text-align:right;font-weight:bold;color:#E85D04;font-size:18px;">${updatedOrder.total} MZN</td></tr>
                  <tr><td style="padding:8px 0;color:#64748b;font-size:13px;">Date</td><td style="padding:8px 0;text-align:right;">${new Date().toLocaleString('pt-MZ')}</td></tr>
                </table>
                <div style="background:#f8fafc;border-radius:8px;padding:16px;margin-bottom:20px;">
                  <p style="color:#475569;font-size:13px;font-weight:bold;margin:0 0 10px;">Recharged Meters:</p>
                  ${items.map(item => `
                    <div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #e2e8f0;">
                      <span style="font-family:monospace;color:#1e293b;">&#x26A1; ${item.meterNumber}</span>
                      <span style="font-weight:bold;color:#E85D04;">${item.amount} MZN</span>
                    </div>
                  `).join('')}
                </div>
                <p style="color:#16a34a;font-size:13px;font-weight:bold;margin:0;">Your meters will be credited within 5 minutes.</p>
              </div>
              <div style="background:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
                <p style="color:#94a3b8;font-size:12px;margin:0;">EVN — Eletricidade Vantara Nacional, E.P.<br/>Linha Verde: 1455 (free, 24/7) | atendimento@evn.co.mz</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })

      console.log('[mpesa-mz/callback] order PAID:', updatedOrder.orderRef, transactionId)

    } else {
      await prisma.order.update({
        where: { id: order.id },
        data:  {
          status:    'FAILED',
          updatedAt: new Date(),
        },
      })

      console.log('[mpesa-mz/callback] order FAILED:', order.orderRef, responseCode, responseDesc)
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })

  } catch (err) {
    console.error('[mpesa-mz/callback] critical error:', err)
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' })
  }
}
