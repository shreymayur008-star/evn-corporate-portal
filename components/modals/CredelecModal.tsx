'use client'

import { useState, useRef, useEffect } from 'react'
import { ShoppingCart, Trash2, CreditCard, CheckCircle, Loader2, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface CartItem {
  meterNumber: string
  amount:      number
  description: string
}

type Step = 'cart' | 'checkout' | 'payment' | 'confirmation'

const AMOUNTS = [50, 100, 200, 500, 1000]

export function CredelecModal({ onClose, closeModal }: { onClose?: () => void; closeModal?: () => void }) {
  const handleClose = onClose ?? closeModal ?? (() => {})

  const [step,           setStep]           = useState<Step>('cart')
  const [meter,          setMeter]          = useState('')
  const [meterError,     setMeterError]     = useState('')
  const [selectedAmt,    setSelectedAmt]    = useState<number>(0)
  const [cart,           setCart]           = useState<CartItem[]>([])
  const [nome,           setNome]           = useState('')
  const [email,          setEmail]          = useState('')
  const [phone,          setPhone]          = useState('')
  const [loading,        setLoading]        = useState(false)
  const [orderRef,       setOrderRef]       = useState('')
  const [transactionId,  setTransactionId]  = useState('')
  const [orderStatus,    setOrderStatus]    = useState<string>('PENDING')
  const [paymentLoading, setPaymentLoading] = useState(false)

  // MPesa MZ state
  const [mpesaPhone,      setMpesaPhone]      = useState('')
  const [mpesaPhoneError, setMpesaPhoneError] = useState('')
  const [mpesaLoading,    setMpesaLoading]    = useState(false)
  const [mpesaError,      setMpesaError]      = useState('')
  const [thirdPartyRef,   setThirdPartyRef]   = useState('')
  const [waitingTimer,    setWaitingTimer]    = useState(0)

  // MPesa PIN confirm state
  const [pinConfirmed,   setPinConfirmed]   = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [showPinButton,  setShowPinButton]  = useState(false)
  const pinTimerRef = useRef<NodeJS.Timeout | null>(null)

  const sseRef      = useRef<EventSource | null>(null)
  const waitTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const total = cart.reduce((s, i) => s + i.amount, 0)

  const validateMeter = (v: string) => {
    if (v.length === 11 && /^\d{11}$/.test(v)) {
      setMeterError('')
      return true
    }
    setMeterError('Meter number must be exactly 11 digits')
    return false
  }

  const addToCart = () => {
    if (!validateMeter(meter)) return
    if (!selectedAmt) { toast.error('Please select a recharge amount'); return }
    if (cart.some(i => i.meterNumber === meter)) {
      toast.error('This meter is already in your cart'); return
    }
    setCart(prev => [...prev, {
      meterNumber: meter,
      amount:      selectedAmt,
      description: 'Recarga Credelec'
    }])
    setMeter('')
    setSelectedAmt(0)
    setMeterError('')
    toast.success('Added to cart!')
  }

  const removeFromCart = (idx: number) => {
    setCart(prev => prev.filter((_, i) => i !== idx))
  }

  const handleCheckout = async () => {
    if (!nome.trim() || nome.length < 2) {
      toast.error('Please enter your full name'); return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address'); return
    }
    if (phone.replace(/\D/g, '').length < 9) {
      toast.error('Please enter a valid phone number'); return
    }
    setLoading(true)
    try {
      const res  = await fetch('/api/orders/create', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ nome, email, phone, items: cart, total }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Failed to create order'); return }
      setOrderRef(data.orderRef)
      setStep('payment')
      toast.success('Order confirmed! Check your email.')
      startSSE(data.orderRef)
    } catch {
      toast.error('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startSSE = (ref: string) => {
    if (sseRef.current) sseRef.current.close()
    const es = new EventSource(`/api/orders/stream/${ref}`)
    es.onmessage = (e) => {
      const data = JSON.parse(e.data)
      setOrderStatus(data.status)
      if (data.status === 'PAID') {
        setTransactionId(data.paymentRef ?? '')
        setStep('confirmation')
        es.close()
      }
    }
    es.onerror = () => es.close()
    sseRef.current = es
  }

  const startWaitingTimer = () => {
    setWaitingTimer(60)
    if (waitTimerRef.current) clearInterval(waitTimerRef.current)
    waitTimerRef.current = setInterval(() => {
      setWaitingTimer(prev => {
        if (prev <= 1) {
          clearInterval(waitTimerRef.current!)
          waitTimerRef.current = null
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleMpesaPayment = async () => {
    if (!mpesaPhone.trim()) {
      setMpesaPhoneError('Please enter your M-Pesa phone number')
      return
    }
    const digits = mpesaPhone.replace(/\D/g, '')
    if (digits.length < 9) {
      setMpesaPhoneError('Phone number too short — minimum 9 digits')
      return
    }

    setMpesaLoading(true)
    setMpesaError('')
    setMpesaPhoneError('')

    try {
      const res  = await fetch('/api/payment/mpesa-mz/initiate', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          phone:    mpesaPhone,
          amount:   total,
          orderRef: orderRef,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMpesaError(data.error ?? 'Payment request failed')
        return
      }

      setThirdPartyRef(data.thirdPartyRef ?? '')
      setPaymentLoading(false)
      startWaitingTimer()
      toast.success('Payment request sent! Check your phone for the M-Pesa prompt.')

      // Show "I've entered my PIN" button after 20 seconds
      if (pinTimerRef.current) clearTimeout(pinTimerRef.current)
      pinTimerRef.current = setTimeout(() => {
        setShowPinButton(true)
      }, 20_000)

    } catch {
      setMpesaError('Connection error — please check your internet and retry')
    } finally {
      setMpesaLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    if (!orderRef) return
    try {
      const res  = await fetch('/api/payment/mpesa-mz/query', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderRef, thirdPartyRef }),
      })
      const data = await res.json()
      if (data.status === 'PAID') {
        setTransactionId(data.transactionId ?? '')
        setStep('confirmation')
        toast.success('Payment confirmed!')
      } else {
        toast(data.message ?? 'Still processing — please wait')
      }
    } catch {
      toast.error('Could not check status — please retry')
    }
  }

  const handlePinConfirm = async () => {
    if (confirmLoading || pinConfirmed) return
    setConfirmLoading(true)
    try {
      const res  = await fetch('/api/payment/mpesa-mz/manual-confirm', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderRef }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setPinConfirmed(true)
        setTransactionId(data.transactionId ?? '')
        setTimeout(() => {
          setStep('confirmation')
        }, 1500)
        toast.success('Payment confirmed!')
      } else {
        toast.error(data.error ?? 'Confirmation failed — try again')
      }
    } catch {
      toast.error('Connection error — please try again')
    } finally {
      setConfirmLoading(false)
    }
  }

  const resetAll = () => {
    setStep('cart'); setCart([]); setMeter(''); setSelectedAmt(0)
    setNome(''); setEmail(''); setPhone(''); setOrderRef('')
    setTransactionId(''); setOrderStatus('PENDING'); setPaymentLoading(false)
    setMpesaPhone(''); setMpesaPhoneError(''); setMpesaError('')
    setThirdPartyRef(''); setWaitingTimer(0)
    setPinConfirmed(false)
    setShowPinButton(false)
    setConfirmLoading(false)
    if (waitTimerRef.current) {
      clearInterval(waitTimerRef.current)
      waitTimerRef.current = null
    }
    if (pinTimerRef.current) {
      clearTimeout(pinTimerRef.current)
      pinTimerRef.current = null
    }
    if (sseRef.current) { sseRef.current.close(); sseRef.current = null }
  }

  useEffect(() => {
    return () => {
      if (sseRef.current)      sseRef.current.close()
      if (waitTimerRef.current) clearInterval(waitTimerRef.current)
      if (pinTimerRef.current)  clearTimeout(pinTimerRef.current)
    }
  }, [])

  const STEPS: Step[] = ['cart', 'checkout', 'payment', 'confirmation']

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 pt-6 pb-3 border-b border-white/[0.08] shrink-0">
        <div className="w-9 h-9 rounded-xl bg-orange-500/15 flex items-center justify-center">
          <Zap className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h2 className="text-slate-100 font-bold text-base">Credelec Top-Up</h2>
          <p className="text-slate-500 text-xs">
            {step === 'cart'         && 'Add meters to your cart'}
            {step === 'checkout'     && 'Review and confirm order'}
            {step === 'payment'      && 'Complete MPesa payment'}
            {step === 'confirmation' && 'Payment successful'}
          </p>
        </div>
      </div>

      {/* Step indicator */}
      <div className="flex items-center px-5 py-2 gap-2 shrink-0">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
              step === s
                ? 'bg-orange-500 text-white'
                : STEPS.indexOf(step) > i
                ? 'bg-emerald-500 text-white'
                : 'bg-white/5 text-slate-600'
            }`}>{i + 1}</div>
            {i < 3 && <div className={`flex-1 h-0.5 rounded transition-colors ${
              STEPS.indexOf(step) > i ? 'bg-emerald-500' : 'bg-white/10'
            }`} />}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-5 pb-8 space-y-4">
        <AnimatePresence mode="wait">

          {/* ── STEP 1: CART ── */}
          {step === 'cart' && (
            <motion.div key="cart" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}}>
              <div className="space-y-2 mt-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Meter Number (11 digits)
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={11}
                  value={meter}
                  onChange={e => { setMeter(e.target.value.replace(/\D/g,'')); setMeterError('') }}
                  placeholder="e.g. 12345678901"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none text-slate-100 placeholder:text-slate-600 font-mono text-lg text-center transition-colors ${
                    meterError ? 'border-red-500' : meter.length === 11 ? 'border-emerald-500' : 'border-white/10 focus:border-orange-500'
                  }`}
                  style={{ background: 'rgba(255,255,255,0.05)' }}
                />
                {meterError && <p className="text-red-400 text-xs">{meterError}</p>}
                <div className="flex gap-1">
                  {Array.from({length:11}).map((_,i) => (
                    <div key={i} className={`flex-1 h-1 rounded-full transition-colors ${
                      i < meter.length ? 'bg-orange-500' : 'bg-white/10'
                    }`} />
                  ))}
                </div>
                <p className="text-slate-600 text-xs text-right">{meter.length}/11</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Recharge Amount (MZN)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AMOUNTS.map(a => (
                    <button key={a} type="button" onClick={() => setSelectedAmt(a)}
                      className={`py-3 rounded-xl font-bold text-sm transition-colors border-2 ${
                        selectedAmt === a
                          ? 'bg-orange-500 border-orange-500 text-white'
                          : 'border-white/10 text-slate-400 hover:border-orange-500/50 hover:text-orange-400'
                      }`}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              <button type="button" onClick={addToCart}
                disabled={meter.length !== 11 || !selectedAmt}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold transition-colors flex items-center justify-center gap-2">
                <ShoppingCart className="w-4 h-4" />
                Add to Cart
              </button>

              {cart.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cart ({cart.length} item{cart.length > 1 ? 's' : ''})
                  </p>
                  {cart.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-white/[0.08]"
                      style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <div>
                        <p className="text-slate-100 font-mono text-sm">{item.meterNumber}</p>
                        <p className="text-slate-500 text-xs">Credelec Recharge</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-orange-400 font-bold">{item.amount} MZN</span>
                        <button type="button" onClick={() => removeFromCart(idx)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <span className="text-slate-300 font-bold">Total</span>
                    <span className="text-orange-400 font-black text-xl">{total} MZN</span>
                  </div>
                  <button type="button" onClick={() => setStep('checkout')}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors flex items-center justify-center gap-2">
                    <CreditCard className="w-4 h-4" />
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 2: CHECKOUT ── */}
          {step === 'checkout' && (
            <motion.div key="checkout" initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} className="space-y-4 mt-2">
              <div className="space-y-3">
                {([
                  { label:'Full Name',     val:nome,  set:setNome,  type:'text',  ph:'Your full name' },
                  { label:'Email Address', val:email, set:setEmail, type:'email', ph:'your@email.com' },
                  { label:'Contact Phone', val:phone, set:setPhone, type:'tel',   ph:'+258 84 000 0000' },
                ] as const).map(({ label, val, set, type, ph }) => (
                  <div key={label} className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
                    <input type={type} value={val} onChange={e => (set as (v: string) => void)(e.target.value)}
                      placeholder={ph}
                      className="w-full px-4 py-3 rounded-xl border-2 border-white/10 focus:border-orange-500 outline-none text-slate-100 placeholder:text-slate-600 transition-colors text-base"
                      style={{ background: 'rgba(255,255,255,0.05)' }} />
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-white/[0.08] overflow-hidden">
                <div className="px-4 py-2 border-b border-white/[0.08]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Summary</p>
                </div>
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center px-4 py-2.5 border-b border-white/[0.06]">
                    <span className="text-slate-400 font-mono text-sm">{item.meterNumber}</span>
                    <span className="text-slate-200 font-bold text-sm">{item.amount} MZN</span>
                  </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-orange-500/10">
                  <span className="text-slate-200 font-bold">Total to Pay</span>
                  <span className="text-orange-400 font-black text-xl">{total} MZN</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep('cart')}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors text-sm">
                  ← Back
                </button>
                <button type="button" onClick={handleCheckout} disabled={loading}
                  className="flex-[2] py-3 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white font-bold transition-colors flex items-center justify-center gap-2">
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Processing...</> : 'Place Order & Pay'}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: PAYMENT ── */}
          {step === 'payment' && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4 mt-2"
            >
              {/* Order reference */}
              <div className="text-center py-2">
                <p className="text-slate-400 text-sm">Order confirmed</p>
                <p className="text-orange-400 font-mono font-bold text-base mt-1">{orderRef}</p>
              </div>

              {/* Phase A: Phone input */}
              {!thirdPartyRef && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      M-Pesa Phone Number
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">+258</span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={mpesaPhone}
                        onChange={e => {
                          setMpesaPhone(e.target.value)
                          setMpesaPhoneError('')
                          setMpesaError('')
                        }}
                        placeholder="84 XXX XXXX"
                        className={`w-full pl-14 pr-4 py-3 rounded-xl border-2 outline-none text-slate-100 placeholder:text-slate-600 font-mono text-base transition-colors ${
                          mpesaPhoneError
                            ? 'border-red-500'
                            : 'border-white/10 focus:border-orange-500'
                        }`}
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      />
                    </div>
                    {mpesaPhoneError && (
                      <p className="text-red-400 text-xs">{mpesaPhoneError}</p>
                    )}
                    <p className="text-slate-600 text-xs">
                      Vodacom (84/85) · Movitel (86) · Tmcel (82/83/87)
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-orange-500/10 border border-orange-500/20">
                    <span className="text-slate-300 text-sm">Total to pay</span>
                    <span className="text-orange-400 font-black text-2xl">{total} MZN</span>
                  </div>

                  {mpesaError && (
                    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                      <p className="text-red-400 text-sm">{mpesaError}</p>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/[0.08] p-3 space-y-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Or pay manually via USSD</p>
                    <p className="text-orange-400 font-mono font-bold text-base tracking-widest">
                      *150*1455*{total}*{cart[0]?.meterNumber ?? 'METER'}#
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleMpesaPayment}
                    disabled={mpesaLoading}
                    className="w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-base transition-colors flex items-center justify-center gap-2"
                  >
                    {mpesaLoading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />Sending to Vodacom MZ...</>
                    ) : (
                      <>Send M-Pesa Payment Request</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep('checkout')}
                    className="w-full py-2.5 text-slate-500 hover:text-slate-300 text-sm transition-colors"
                  >
                    ← Back to checkout
                  </button>
                </div>
              )}

              {/* Phase B: Waiting screen */}
              {thirdPartyRef && orderStatus !== 'PAID' && (
                <div className="space-y-4">
                  {/* Phone icon and instruction */}
                  <div className="text-center py-4 space-y-3">
                    <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30
                                    flex items-center justify-center mx-auto">
                      <div className="w-4 h-4 rounded-full bg-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-slate-100 font-bold text-base">Check your phone</p>
                      <p className="text-slate-400 text-sm mt-1">
                        Vodacom M-Pesa popup sent to
                      </p>
                      <p className="text-orange-400 font-mono font-bold text-base mt-0.5">
                        +{mpesaPhone.replace(/\D/g, '').startsWith('258')
                            ? mpesaPhone.replace(/\D/g, '')
                            : '258' + mpesaPhone.replace(/\D/g, '')}
                      </p>
                    </div>
                    <p className="text-slate-500 text-sm">
                      Enter your M-Pesa PIN on the popup to confirm payment
                    </p>
                  </div>

                  {/* Live SSE status */}
                  <div className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                    orderStatus === 'PAID'
                      ? 'border-emerald-500/30 bg-emerald-500/10'
                      : orderStatus === 'FAILED'
                      ? 'border-red-500/30 bg-red-500/10'
                      : 'border-white/10 bg-white/[0.03]'
                  }`}>
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      orderStatus === 'PAID'   ? 'bg-emerald-400' :
                      orderStatus === 'FAILED' ? 'bg-red-400' :
                      'bg-amber-400 animate-pulse'
                    }`} />
                    <span className={`text-sm font-medium ${
                      orderStatus === 'PAID'        ? 'text-emerald-400' :
                      orderStatus === 'FAILED'      ? 'text-red-400' :
                      'text-amber-400'
                    }`}>
                      {orderStatus === 'PAID'
                        ? '✅ Payment confirmed by Vodacom MZ!'
                        : orderStatus === 'FAILED'
                        ? '❌ Payment failed'
                        : 'Connecting to Vodacom MZ...'}
                    </span>
                    <span className="text-slate-600 text-xs ml-auto">LIVE</span>
                  </div>

                  {/* Countdown */}
                  {waitingTimer > 0 && orderStatus !== 'PAID' && (
                    <p className="text-center text-slate-600 text-sm">
                      Request expires in{' '}
                      <span className="text-slate-400 font-mono font-bold">{waitingTimer}s</span>
                    </p>
                  )}

                  {/* PIN Confirmation Button — appears after 20 seconds */}
                  {showPinButton && orderStatus !== 'PAID' && !pinConfirmed && (
                    <div className="rounded-xl border border-emerald-500/30 p-4 space-y-3"
                         style={{ background: 'rgba(34,197,94,0.05)' }}>
                      <p className="text-slate-300 text-sm text-center font-medium">
                        Already entered your PIN on the popup?
                      </p>
                      <button
                        type="button"
                        onClick={handlePinConfirm}
                        disabled={confirmLoading}
                        className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700
                                   disabled:opacity-50 text-white font-bold transition-colors
                                   flex items-center justify-center gap-2"
                      >
                        {confirmLoading ? (
                          <><Loader2 className="w-4 h-4 animate-spin" />Confirming...</>
                        ) : (
                          <>&#x2705; I&apos;ve Entered My PIN — Confirm Payment</>
                        )}
                      </button>
                      <p className="text-slate-600 text-xs text-center">
                        Click after entering your PIN in the Vodacom M-Pesa popup
                      </p>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCheckStatus}
                      className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400
                                 hover:bg-white/5 hover:text-slate-200 transition-colors
                                 text-sm font-medium"
                    >
                      Check Status
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setThirdPartyRef('')
                        setMpesaPhone('')
                        setMpesaError('')
                        setShowPinButton(false)
                        setPinConfirmed(false)
                        if (pinTimerRef.current) clearTimeout(pinTimerRef.current)
                      }}
                      className="flex-1 py-3 rounded-xl bg-orange-500/10 border border-orange-500/20
                                 text-orange-400 hover:bg-orange-500/20 transition-colors
                                 text-sm font-medium"
                    >
                      Resend Request
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ── STEP 4: CONFIRMATION ── */}
          {step === 'confirmation' && (
            <motion.div key="confirmation" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} className="text-center space-y-5 py-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle className="w-10 h-10 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-slate-100 font-bold text-xl">Payment Successful!</h3>
                <p className="text-slate-400 text-sm mt-1">Your meters will be credited within 5 minutes</p>
              </div>
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 space-y-2 text-left">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Transaction ID</span>
                  <span className="text-emerald-400 font-mono font-bold">{transactionId}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Order Ref</span>
                  <span className="text-slate-300 font-mono">{orderRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="text-orange-400 font-bold">{total} MZN</span>
                </div>
              </div>
              <div className="space-y-2 text-left">
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Recharged Meters</p>
                {cart.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
                    <span className="text-slate-300 font-mono text-sm">⚡ {item.meterNumber}</span>
                    <span className="text-orange-400 font-bold text-sm">{item.amount} MZN</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-xs">A payment confirmation has been sent to {email}</p>
              <div className="flex gap-3">
                <button type="button" onClick={resetAll}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-colors text-sm">
                  New Order
                </button>
                <button type="button" onClick={handleClose}
                  className="flex-1 py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors text-sm">
                  Close
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  )
}

export default CredelecModal
