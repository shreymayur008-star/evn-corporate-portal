export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ref: string }> }
) {
  const { ref } = await params
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      let attempts = 0
      const maxAttempts = 60

      const send = (data: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
        )
      }

      const initial = await prisma.order.findUnique({
        where:  { orderRef: ref },
        select: { status: true, orderRef: true }
      })

      if (initial) send({ status: initial.status, orderRef: ref })

      const interval = setInterval(async () => {
        attempts++
        if (attempts >= maxAttempts) {
          send({ status: 'TIMEOUT', message: 'Stream closed' })
          clearInterval(interval)
          controller.close()
          return
        }
        try {
          const order = await prisma.order.findUnique({
            where:  { orderRef: ref },
            select: { status: true, paymentRef: true }
          })
          if (!order) return
          send({ status: order.status, paymentRef: order.paymentRef })
          if (order.status === 'PAID' || order.status === 'FAILED') {
            clearInterval(interval)
            setTimeout(() => controller.close(), 500)
          }
        } catch {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection':    'keep-alive',
    },
  })
}
