export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'

const schema = z.object({
  email:    z.string().email(),
  otp:      z.string().length(6),
  nome:     z.string().min(2),
  mensagem: z.string().min(5),
  topic:    z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      )
    }

    const { email, otp, nome, mensagem, topic } = parsed.data

    const record = await prisma.otpVerification.findFirst({
      where: { email, otp, used: false },
      orderBy: { createdAt: 'desc' },
    })

    if (!record) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check and try again.' },
        { status: 400 }
      )
    }

    if (new Date() > record.expiresAt) {
      await prisma.otpVerification.delete({ where: { id: record.id } })
      return NextResponse.json(
        { error: 'Your code has expired. Please request a new one.' },
        { status: 400 }
      )
    }

    await prisma.otpVerification.update({
      where: { id: record.id },
      data:  { used: true },
    })

    await prisma.contactMessage.create({
      data: {
        nome,
        email,
        mensagem: topic ? `[${topic}] ${mensagem}` : mensagem,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Message verified and sent to EVN support.',
      reference: `EVN-${Date.now().toString(36).toUpperCase()}`,
    })

  } catch (err) {
    console.error('verify-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
