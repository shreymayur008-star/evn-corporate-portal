import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { initiateC2B, normaliseMozPhone } from '@/lib/mpesa-mz'

export const dynamic = 'force-dynamic'

const schema = z.object({
  phone:    z.string().min(9, 'Phone number too short'),
  amount:   z.number().min(1, 'Amount must be at least 1 MZN'),
  orderRef: z.string().startsWith('EVN-ORD-', 'Invalid order reference'),
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

    if (result.success) {
      await prisma.order.update({
        where: { orderRef },
        data:  { paymentRef: result.conversationId ?? result.transactionId },
      })

      return NextResponse.json({
        success:        true,
        transactionId:  result.transactionId,
        conversationId: result.conversationId,
        thirdPartyRef,
        normalisedPhone,
        message:        result.message,
      })
    }

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

  } catch (err) {
    console.error('[mpesa-mz/initiate] error:', err)
    return NextResponse.json(
      { error: 'Payment initiation failed — please try again' },
      { status: 500 }
    )
  }
}
