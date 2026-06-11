export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAdmin } from '@/lib/adminGuard'
import type { Prisma, OrderStatus } from '@prisma/client'

const VALID_STATUSES: OrderStatus[] = ['PENDING', 'PROCESSING', 'PAID', 'FAILED', 'CANCELLED']

export async function GET(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { searchParams } = new URL(req.url)
  const q      = searchParams.get('q') ?? ''
  const status = searchParams.get('status') ?? ''
  const page   = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit  = 20
  const skip   = (page - 1) * limit

  const where: Prisma.OrderWhereInput = {}

  if (q) {
    where.OR = [
      { orderRef: { contains: q, mode: 'insensitive' } },
      { email:    { contains: q, mode: 'insensitive' } },
      { nome:     { contains: q, mode: 'insensitive' } },
      { phone:    { contains: q, mode: 'insensitive' } },
    ]
  }

  if (status && VALID_STATUSES.includes(status as OrderStatus)) {
    where.status = status as OrderStatus
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ])

  return NextResponse.json({ orders, total, page, limit })
}

export async function DELETE(req: NextRequest) {
  const authError = await requireAdmin()
  if (authError) return authError

  const { id } = await req.json()
  await prisma.order.delete({ where: { id } })
  return NextResponse.json({ success: true })
}
