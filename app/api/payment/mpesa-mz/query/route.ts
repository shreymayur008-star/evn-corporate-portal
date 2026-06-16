import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { queryTransactionStatus, getMpesaMessage } from '@/lib/mpesa-mz'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderRef:      z.string().startsWith('EVN-ORD-'),
  thirdPartyRef: z.string().min(1),
})

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

    const { orderRef, thirdPartyRef } = parsed.data

    const order = await prisma.order.findUnique({ where: { orderRef } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.status === 'PAID' || order.status === 'FAILED') {
      return NextResponse.json({
        status:     order.status,
        paymentRef: order.paymentRef,
        message:    order.status === 'PAID'
          ? 'Payment confirmed by Vodacom Mozambique'
          : 'Payment failed',
      })
    }

    const rawPaymentRef = order.paymentRef ?? ''
    const txRef = rawPaymentRef.includes('|')
      ? rawPaymentRef.split('|')[0]
      : rawPaymentRef

    const result = await queryTransactionStatus({
      queryReference: txRef,
      thirdPartyRef,
    })

    const code = result.output_ResponseCode

    if (code === 'INS-0') {
      await prisma.order.update({
        where: { orderRef },
        data:  {
          status:     'PAID',
          paymentRef: result.output_TransactionID,
        },
      })
    }

    return NextResponse.json({
      responseCode:  code,
      message:       getMpesaMessage(code),
      status:        code === 'INS-0' ? 'PAID' : order.status,
      transactionId: result.output_TransactionID,
    })

  } catch (err) {
    console.error('[mpesa-mz/query] error:', err)
    return NextResponse.json(
      { error: 'Status query failed — please try again' },
      { status: 500 }
    )
  }
}
