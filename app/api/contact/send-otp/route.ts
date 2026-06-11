export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { Resend } from 'resend'
import { prisma } from '@/lib/db'

const resend = new Resend(process.env.RESEND_API_KEY)

const schema = z.object({
  nome:     z.string().min(2, 'Name must be at least 2 characters'),
  email:    z.string().email('Invalid email address'),
  mensagem: z.string().min(5, 'Message must be at least 5 characters'),
  topic:    z.string().optional(),
})

function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = schema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Invalid request data' },
        { status: 400 }
      )
    }

    const { nome, email, mensagem, topic } = parsed.data
    const otp = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000)

    await prisma.otpVerification.deleteMany({
      where: { email, used: false }
    })

    await prisma.otpVerification.create({
      data: { email, otp, expiresAt }
    })

    const { error: emailError } = await resend.emails.send({
      from: 'EVN Portal <onboarding@resend.dev>',
      to: email,
      subject: `EVN Portal — Your Verification Code: ${otp}`,
      html: `
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 0; margin: 0;">
          <div style="max-width: 480px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">

            <div style="background: #E85D04; padding: 24px 32px;">
              <h1 style="color: white; margin: 0; font-size: 22px;">&#9889; EVN Portal</h1>
              <p style="color: rgba(255,255,255,0.85); margin: 4px 0 0; font-size: 13px;">
                Eletricidade Vantara Nacional, E.P.
              </p>
            </div>

            <div style="padding: 32px;">
              <p style="color: #1e293b; font-size: 16px; margin: 0 0 8px;">Hello ${nome},</p>
              <p style="color: #475569; font-size: 14px; margin: 0 0 28px; line-height: 1.6;">
                We received your message to our support team. To verify your identity,
                please enter the code below in the EVN Portal.
              </p>

              <div style="background: #fff7ed; border: 2px solid #E85D04; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 8px; text-transform: uppercase; letter-spacing: 1px;">
                  Your Verification Code
                </p>
                <p style="color: #E85D04; font-size: 42px; font-weight: bold; letter-spacing: 10px; margin: 0; font-family: monospace;">
                  ${otp}
                </p>
                <p style="color: #94a3b8; font-size: 12px; margin: 8px 0 0;">
                  Expires in 10 minutes
                </p>
              </div>

              <div style="background: #f8fafc; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <p style="color: #64748b; font-size: 13px; margin: 0 0 6px; font-weight: bold;">Your message summary:</p>
                <p style="color: #475569; font-size: 13px; margin: 0; line-height: 1.6;">
                  ${mensagem.slice(0, 100)}${mensagem.length > 100 ? '...' : ''}
                </p>
              </div>

              <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.6;">
                If you did not request this code, please ignore this email.
                Do not share this code with anyone.
              </p>
            </div>

            <div style="background: #f8fafc; padding: 20px 32px; border-top: 1px solid #e2e8f0;">
              <p style="color: #94a3b8; font-size: 12px; margin: 0;">
                EVN &#8212; Eletricidade Vantara Nacional, E.P.<br/>
                Av. 25 de Setembro, 1218, Maputo, Mo&#231;ambique<br/>
                Linha Verde: 1455 (free, 24/7) | atendimento@evn.co.mz
              </p>
            </div>

          </div>
        </body>
        </html>
      `,
    })

    if (emailError) {
      console.error('Resend error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, message: 'Verification code sent to your email.' })

  } catch (err) {
    console.error('send-otp error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
