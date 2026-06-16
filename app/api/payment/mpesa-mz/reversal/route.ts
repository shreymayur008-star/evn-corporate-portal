import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { reverseTransaction, getMpesaMessage } from '@/lib/mpesa-mz'
import { requireAdmin } from '@/lib/adminGuard'

export const dynamic = 'force-dynamic'

const schema = z.object({
  orderId:       z.string().min(1),
  transactionId: z.string().min(1),
  amount:        z.number().min(1),
})

export async function POST(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      )
    }

    const { orderId, transactionId, amount } = parsed.data

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.status !== 'PAID') {
      return NextResponse.json(
        { error: 'Only PAID orders can be reversed' },
        { status: 400 }
      )
    }

    const thirdPartyRef = `EVN-REV-${Date.now()}`

    const result = await reverseTransaction({
      transactionId,
      amount,
      thirdPartyRef,
    })

    const code = result.output_ResponseCode

    if (code === 'INS-0') {
      await prisma.order.update({
        where: { id: orderId },
        data:  { status: 'CANCELLED' },
      })
      return NextResponse.json({
        success:      true,
        message:      'Refund processed — money returned to customer MPesa wallet',
        responseCode: code,
      })
    }

    return NextResponse.json(
      {
        error:        getMpesaMessage(code),
        responseCode: code,
      },
      { status: 400 }
    )

  } catch (err) {
    console.error('[mpesa-mz/reversal] error:', err)
    return NextResponse.json(
      { error: 'Reversal failed — please try again' },
      { status: 500 }
    )
  }
}
