export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params
    const order = await prisma.order.findUnique({
      where: { orderRef: ref }
    })
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    return NextResponse.json(order)
  } catch (err) {
    console.error('get order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  try {
    const { ref } = await params
    const { status, paymentRef } = await req.json()
    const order = await prisma.order.update({
      where: { orderRef: ref },
      data:  { status, paymentRef }
    })
    return NextResponse.json(order)
  } catch (err) {
    console.error('update order error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
