import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { Sparkles, Check, ArrowLeft, X, Loader2 } from 'lucide-react'
import { api } from '../Services/api'

export default function Pricingpage() {
  const navigate = useNavigate()
  const currentUser = useSelector((state) => state.user.user)

  // Selected subscription plan: 'free' | 'silver' | 'gold'
  const [selectedPlan, setSelectedPlan] = useState('gold')
  const [activeSubscription, setActiveSubscription] = useState(null)

  // Fetch current active subscription on mount
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return

    api
      .get('/getsubscription')
      .then((data) => {
        if (data?.active && data?.subscription_type) {
          const planKey = data.subscription_type.toLowerCase()
          setActiveSubscription(data)
          setSelectedPlan(planKey)
        }
      })
      .catch((err) => {
        console.error('Failed to load active subscription:', err)
      })
  }, [])

  // AI agent picker (left dock) + question/answer state for the mascot
  const [agentIdx, setAgentIdx] = useState(0)
  const [answerIdx, setAnswerIdx] = useState(null)
  const [thinking, setThinking] = useState(false)
  const thinkTimer = useRef(null)
  const [subscribedToast, setSubscribedToast] = useState(null)
  const [errorToast, setErrorToast] = useState(null)
  const [subscribing, setSubscribing] = useState(false)

  const agents = [
    {
      id: 'students',
      hex: '#f97316',
      label: 'Student Agent',
      questions: [
        { q: 'Who registered this week?', a: "I've gathered this week's new registrations. Want me to open their profiles?" },
        { q: 'Update a student record', a: 'Tell me which student and what changed, and I will update their profile.' },
      ],
    },
    {
      id: 'catalog',
      hex: '#ef4444',
      label: 'Catalog Agent',
      questions: [
        { q: 'Is this book available?', a: 'I checked the catalog and inventory. I can reserve a copy for the student.' },
        { q: 'Add a new book', a: 'Share the title and details and I will add it to the catalog for you.' },
      ],
    },
    {
      id: 'circulation',
      hex: '#eab308',
      label: 'Circulation Agent',
      questions: [
        { q: 'What is overdue?', a: 'I listed every overdue book and can send reminders to each student automatically.' },
        { q: 'Issue a book', a: 'Pick the student and the book, and I will record the issue and the due date.' },
      ],
    },
    {
      id: 'inventory',
      hex: '#22c55e',
      label: 'Inventory Agent',
      questions: [
        { q: 'What needs restocking?', a: 'I flagged titles running low and can draft a restock list for you.' },
        { q: 'Find missing copies', a: 'I compared issue records with inventory and can show any mismatches.' },
      ],
    },
    {
      id: 'assistant',
      hex: '#06b6d4',
      label: 'Library Assistant',
      questions: [
        { q: "Plan today's tasks", a: 'I will line up return reminders, restock alerts and new-student onboarding.' },
        { q: 'Automate a workflow', a: 'Describe the routine task and I will set it up to run automatically.' },
      ],
    },
  ]

  const agent = agents[agentIdx]

  function selectAgent(i) {
    clearTimeout(thinkTimer.current)
    setAgentIdx(i)
    setAnswerIdx(null)
    setThinking(false)
  }

  function askQuestion(i) {
    clearTimeout(thinkTimer.current)
    setAnswerIdx(i)
    setThinking(true)
    thinkTimer.current = setTimeout(() => setThinking(false), 800)
  }

  const plans = [
    {
      id: 'free',
      plan_id: null,
      name: 'Free',
      price: '₹0',
      amount_inr: 0,
      billing: 'Free forever.',
      features: ['Student registration', 'Student profiles', 'Student management'],
    },
    {
      id: 'silver',
      plan_id: 1,
      name: 'Silver',
      price: '₹499',
      amount_inr: 499,
      billing: 'Per month. Cancel anytime!',
      features: ['Everything in Free', 'Book management', 'Inventory', 'Book issue/return tracking'],
    },
    {
      id: 'gold',
      plan_id: 2,
      name: 'Gold',
      price: '₹999',
      amount_inr: 999,
      billing: 'Per month. Cancel anytime!',
      features: ['Everything in Silver', 'AI agents', 'Intelligent assistance', 'Automated library workflows'],
    },
  ]

  function getUserId() {
    if (currentUser?.id) return currentUser.id
    if (currentUser?.user_id) return currentUser.user_id
    if (currentUser?.owner_id) return currentUser.owner_id
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload?.sub) return Number(payload.sub)
      } catch {
        // ignore
      }
    }
    return null
  }

  function launchRazorpayCheckout(order, plan) {
    const razorpayKey = 'rzp_test_TsQGRnJ2ZXY1lB'

    function openModal() {
      if (typeof window.Razorpay === 'function') {
        const rzp = new window.Razorpay({
          key: razorpayKey,
          amount: order.amount,
          currency: order.currency || 'INR',
          name: 'Library Hub',
          description: `${plan.name} Plan Subscription`,
          order_id: order.order_id,
          handler: async function (response) {
            console.log('Payment successful:', response)

            const userId = getUserId()
            if (!userId) {
              setErrorToast('Please login first to subscribe.')
              setTimeout(() => setErrorToast(null), 4000)
              return
            }

            try {
              await api.post('/payment/verify-payment', {
                user_id: Number(userId),
                razorpay_order_id: response?.razorpay_order_id,
                razorpay_payment_id: response?.razorpay_payment_id,
                razorpay_signature: response?.razorpay_signature,
              })

              setSubscribedToast(`Payment verified! Welcome to the ${plan.name} Plan.`)
              setTimeout(() => setSubscribedToast(null), 6000)

              // Refresh subscription info
              api.get('/getsubscription').then((data) => {
                if (data?.active) {
                  setActiveSubscription(data)
                  setSelectedPlan(data.subscription_type.toLowerCase())
                }
              })
            } catch (err) {
              console.error('Verification error:', err)
              setErrorToast(err.message || 'Payment verification failed.')
              setTimeout(() => setErrorToast(null), 5000)
            }
          },
          prefill: {
            name: currentUser?.name || '',
            email: currentUser?.email || '',
            contact: currentUser?.phone || '',
          },
          theme: {
            color: '#d0fb31',
          },
        })
        rzp.on('payment.failed', function (response) {
          console.error('Payment failed:', response.error)
          setErrorToast(response.error?.description || 'Payment failed or cancelled.')
          setTimeout(() => setErrorToast(null), 5000)
        })
        rzp.open()
      } else {
        setSubscribedToast(`Order created successfully: ${order.order_id} (${plan.name} - ₹${plan.amount_inr})`)
        setTimeout(() => setSubscribedToast(null), 6000)
      }
    }

    if (window.Razorpay) {
      openModal()
    } else {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = openModal
      script.onerror = () => {
        setSubscribedToast(`Order created successfully: ${order.order_id} (${plan.name} - ₹${plan.amount_inr})`)
        setTimeout(() => setSubscribedToast(null), 6000)
      }
      document.body.appendChild(script)
    }
  }

  async function handleSubscribe() {
    const plan = plans.find((p) => p.id === selectedPlan)
    if (!plan) return

    if (plan.id === 'free') {
      setSubscribedToast('You are already on the Free tier. Choose Silver or Gold to upgrade!')
      setTimeout(() => setSubscribedToast(null), 4000)
      return
    }

    const userId = getUserId()
    if (!userId) {
      setErrorToast('Please login first to subscribe.')
      setTimeout(() => setErrorToast(null), 4000)
      return
    }

    try {
      setSubscribing(true)
      setErrorToast(null)

      // Call @router.post('/payment/createorder')
      const order = await api.post('/payment/createorder', {
        user_id: Number(userId),
        plan_id: plan.plan_id,
        plan_name: plan.name,
        amount_inr: plan.amount_inr,
      })

      console.log('Order created from /payment/createorder:', order)

      launchRazorpayCheckout(order, plan)
    } catch (err) {
      console.error('Error creating order:', err)
      setErrorToast(err.message || 'Failed to create payment order.')
      setTimeout(() => setErrorToast(null), 5000)
    } finally {
      setSubscribing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-white flex flex-col items-center justify-center p-3 sm:p-6 md:p-10 selection:bg-[#d0fb31] selection:text-black font-sans">
      {/* Toast Notification */}
      {subscribedToast && (
        <div className="fixed top-6 z-50 flex items-center gap-3 rounded-full bg-[#d0fb31] px-6 py-3.5 text-sm font-semibold text-neutral-950 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="h-4 w-4 fill-current" />
          <span>{subscribedToast}</span>
          <button
            onClick={() => setSubscribedToast(null)}
            className="ml-2 rounded-full p-1 hover:bg-black/10 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {errorToast && (
        <div className="fixed top-6 z-50 flex items-center gap-3 rounded-full bg-red-500/90 backdrop-blur-md px-6 py-3.5 text-sm font-semibold text-white shadow-2xl animate-in fade-in slide-in-from-top-4 duration-200">
          <X className="h-4 w-4" />
          <span>{errorToast}</span>
          <button
            onClick={() => setErrorToast(null)}
            className="ml-2 rounded-full p-1 hover:bg-black/20 transition"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Bar / Navigation */}
      <header className="w-full max-w-[1320px] mb-4 sm:mb-6 flex items-center justify-between px-2">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs sm:text-sm font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition"
        >
          <ArrowLeft size={14} />
          <span>Back</span>
        </button>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-[#161619] px-3.5 py-1.5 text-xs text-neutral-300">
          <span className="h-2 w-2 rounded-full bg-[#d0fb31] animate-pulse" />
          <span>
            {activeSubscription?.active
              ? `${activeSubscription.subscription_type} Plan (Active until ${activeSubscription.end_date})`
              : 'Library Hub Subscription'}
          </span>
        </div>

        <Link
          to="/"
          className="rounded-full border border-white/10 bg-white/5 p-2 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          title="Close"
        >
          <X size={16} />
        </Link>
      </header>

      {/* Main Bento Grid Container */}
      <div className="w-full max-w-[1320px] rounded-[32px] sm:rounded-[44px] bg-[#0c0c0e] border border-white/[0.08] p-3 sm:p-5 md:p-7 shadow-[0_30px_100px_rgba(0,0,0,0.8)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* ======================================================== */}
          {/* CARD 1: TOP-LEFT — Mascot with AI agent picker           */}
          {/* ======================================================== */}
          <div
            className="relative rounded-[26px] sm:rounded-[34px] overflow-hidden border border-white/[0.07] min-h-[440px] sm:min-h-[480px] flex flex-col items-center justify-center gap-4 p-6 pl-16 sm:pl-20 select-none"
            style={{
              backgroundColor: '#111114',
              backgroundImage: `
                linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)
              `,
              backgroundSize: '24px 24px',
            }}
          >
            {/* Left Floating AI Agent Dock */}
            <div className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center gap-2.5 rounded-full border border-white/10 bg-[#1d1d21]/90 backdrop-blur-md px-2 py-3.5 shadow-2xl">
              {agents.map((a, i) => (
                <button
                  key={a.id}
                  onClick={() => selectAgent(i)}
                  title={a.label}
                  className={`group relative h-6 w-6 rounded-full transition-transform hover:scale-110 active:scale-95 ${
                    agentIdx === i ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1d1d21]' : ''
                  }`}
                  style={{ backgroundColor: a.hex }}
                >
                  <span className="sr-only">{a.label}</span>
                </button>
              ))}
            </div>

            {/* Speech bubble: re-mounts on every change so it animates in */}
            <div
              key={`${agentIdx}-${answerIdx}-${thinking}`}
              className="relative min-h-[84px] w-full max-w-[280px] rounded-2xl bg-white p-3.5 text-neutral-900 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <span className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                {agent.label}
              </span>
              {thinking ? (
                <div className="mt-2.5 flex gap-1.5">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="h-2 w-2 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-1 text-sm font-medium leading-snug">
                  {answerIdx === null
                    ? `Hi! I'm your ${agent.label}. Pick a question to ask me.`
                    : agent.questions[answerIdx].a}
                </p>
              )}
              <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 bg-white" />
            </div>

            {/* Mascot Illustration SVG (floats and blinks) */}
            <div className="relative w-40 sm:w-48 h-52 sm:h-60 flex items-center justify-center">
              <svg
                viewBox="0 0 200 240"
                className="w-full h-full"
                style={{ filter: 'drop-shadow(0 18px 24px rgba(0,0,0,0.65)) contrast(1.05)' }}
              >
                <defs>
                  {/* Mascot Head Gradient */}
                  <radialGradient id="headGrad" cx="40%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fff3b0" />
                    <stop offset="60%" stopColor="#ffd868" />
                    <stop offset="100%" stopColor="#f3be44" />
                  </radialGradient>

                  {/* Sprout Leaf Gradient */}
                  <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                  </linearGradient>

                  {/* Shirt / Body Gradient (follows the selected agent) */}
                  <linearGradient id="shirtGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: agent.hex, transition: 'stop-color 0.4s ease' }} />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>

                  {/* Shorts / Diaper Gradient */}
                  <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#e2e8f0" />
                  </linearGradient>

                  {/* Ground Soft Shadow */}
                  <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="rgba(0,0,0,0.7)" />
                    <stop offset="70%" stopColor="rgba(0,0,0,0.3)" />
                    <stop offset="100%" stopColor="rgba(0,0,0,0)" />
                  </radialGradient>
                </defs>

                {/* Ground Shadow (breathes with the float) */}
                <ellipse cx="100" cy="226" rx="55" ry="12" fill="url(#groundShadow)">
                  <animate
                    attributeName="rx"
                    values="55;47;55"
                    keyTimes="0;0.5;1"
                    dur="3.2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  />
                </ellipse>

                {/* Floating mascot */}
                <g>
                  <animateTransform
                    attributeName="transform"
                    type="translate"
                    values="0 0;0 -6;0 0"
                    keyTimes="0;0.5;1"
                    dur="3.2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  />

                  {/* Sprout Leaf Cap on Head */}
                  <g transform="translate(100, 38)">
                    <path
                      d="M -15,-15 C -25,-32 10,-38 35,-18 C 38,-4 15,2 -15,-15 Z"
                      fill="url(#leafGrad)"
                      stroke="#16a34a"
                      strokeWidth="1.5"
                    />
                    <path
                      d="M -5,-16 Q 10,-22 25,-18"
                      fill="none"
                      stroke="#15803d"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="-18" r="3" fill="#ffffff" opacity="0.4" />
                  </g>

                  {/* Chubby Head */}
                  <ellipse cx="100" cy="85" rx="56" ry="50" fill="url(#headGrad)" />
                  {/* Head Gloss Highlight */}
                  <ellipse
                    cx="78"
                    cy="58"
                    rx="18"
                    ry="9"
                    fill="#ffffff"
                    opacity="0.45"
                    transform="rotate(-15 78 58)"
                  />

                  {/* Rosy Cheeks */}
                  <circle cx="68" cy="98" r="7" fill="#fb7185" opacity="0.4" />
                  <circle cx="132" cy="98" r="7" fill="#fb7185" opacity="0.4" />

                  {/* Eyes (blink periodically) */}
                  <g>
                    {[78, 122].map((cx) => (
                      <ellipse key={cx} cx={cx} cy="88" rx="4.5" ry="4.5" fill="#1e1e24">
                        <animate
                          attributeName="ry"
                          values="4.5;4.5;0.5;4.5;4.5"
                          keyTimes="0;0.9;0.94;0.98;1"
                          dur="4s"
                          repeatCount="indefinite"
                        />
                      </ellipse>
                    ))}
                    <circle cx="76.5" cy="86.5" r="1.5" fill="#ffffff" />
                    <circle cx="120.5" cy="86.5" r="1.5" fill="#ffffff" />
                  </g>

                  {/* Cute Dimple / Mouth */}
                  <path
                    d="M 94,98 Q 100,104 106,98"
                    fill="none"
                    stroke="#27272a"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />

                  {/* Left & Right Chubby Arms */}
                  <ellipse
                    cx="52"
                    cy="150"
                    rx="11"
                    ry="18"
                    fill="url(#headGrad)"
                    transform="rotate(25 52 150)"
                  />
                  <ellipse
                    cx="148"
                    cy="150"
                    rx="11"
                    ry="18"
                    fill="url(#headGrad)"
                    transform="rotate(-25 148 150)"
                  />

                  {/* Torso / Shirt */}
                  <path
                    d="M 64,130 C 64,120 136,120 136,130 C 140,165 140,175 132,185 C 122,192 78,192 68,185 C 60,175 60,165 64,130 Z"
                    fill="url(#shirtGrad)"
                  />

                  {/* Smiley Arc on Shirt */}
                  <path
                    d="M 85,148 Q 100,160 115,148"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />

                  {/* Cute Diaper / Shorts */}
                  <path
                    d="M 67,175 C 75,170 125,170 133,175 C 137,195 132,208 120,212 C 108,215 104,204 100,204 C 96,204 92,215 80,212 C 68,208 63,195 67,175 Z"
                    fill="url(#shortsGrad)"
                  />

                  {/* Legs / Feet */}
                  <ellipse cx="84" cy="216" rx="9" ry="12" fill="url(#headGrad)" />
                  <ellipse cx="116" cy="216" rx="9" ry="12" fill="url(#headGrad)" />
                </g>
              </svg>
            </div>

            {/* Question chips */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {agent.questions.map((item, i) => (
                <button
                  key={item.q}
                  type="button"
                  onClick={() => askQuestion(i)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition active:scale-95 ${
                    answerIdx === i
                      ? 'border-transparent bg-[#d0fb31] text-neutral-950'
                      : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {item.q}
                </button>
              ))}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CARD 2: TOP-RIGHT — Unlock the Full Potential            */}
          {/* ======================================================== */}
          <div className="rounded-[26px] sm:rounded-[34px] bg-white/80 text-neutral-900 p-7 sm:p-9 md:p-10 flex flex-col justify-center shadow-xl min-h-[380px] sm:min-h-[430px]">
            <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-tight text-neutral-950 leading-[1.12]">
              Unlock the Full Potential of Library Hub
            </h2>
            <p className="mt-3 text-sm sm:text-base font-medium text-neutral-500">
              Choose Gold to unlock AI agents and intelligent library automation.
            </p>
          </div>

          {/* ======================================================== */}
          {/* CARD 3: FULL WIDTH — Subscription Plans & Subscribe CTA  */}
          {/* ======================================================== */}
          <div className="lg:col-span-2 rounded-[26px] sm:rounded-[34px] bg-[#222226] border border-white/[0.08] p-6 sm:p-8 flex flex-col justify-between shadow-2xl">
            {/* The 3 Cards */}
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
                {plans.map((plan) => {
                  const isSelected = selectedPlan === plan.id
                  const isCurrentActive =
                    activeSubscription?.active &&
                    activeSubscription?.subscription_type?.toLowerCase() === plan.id
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setSelectedPlan(plan.id)}
                      className={`relative flex flex-col rounded-2xl p-5 cursor-pointer transition-all duration-200 select-none ${
                        isSelected
                          ? 'bg-[#ddfc56] text-neutral-950 ring-2 ring-[#ddfc56] shadow-xl scale-[1.02]'
                          : 'bg-white text-neutral-950 hover:bg-neutral-50 hover:scale-[1.01]'
                      }`}
                    >
                      {/* Top Header Row in Card */}
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-neutral-950' : 'text-neutral-700'
                            }`}
                          >
                            {plan.name}
                          </span>
                          {isCurrentActive && (
                            <span className="rounded-full bg-neutral-950 text-[#d0fb31] text-[10px] font-bold px-2 py-0.5 uppercase tracking-wider">
                              Active
                            </span>
                          )}
                        </div>

                        {/* Green circular checkmark when selected */}
                        {isSelected && (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-[#22c55e] text-white shadow-sm shrink-0">
                            <Check size={12} strokeWidth={3.5} />
                          </span>
                        )}
                      </div>

                      {/* Big Price */}
                      <div className="my-2">
                        <span className="text-2xl sm:text-[28px] font-extrabold tracking-tight text-neutral-950">
                          {plan.price}
                        </span>
                      </div>

                      {/* Billing Description */}
                      <p
                        className={`text-[11px] leading-relaxed ${
                          isSelected ? 'text-neutral-800 font-medium' : 'text-neutral-500'
                        }`}
                      >
                        {plan.billing}
                      </p>

                      {/* Plan Features */}
                      <ul className="mt-4 space-y-2 border-t border-black/10 pt-4">
                        {plan.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm font-medium text-neutral-800">
                            <Check size={14} strokeWidth={3} className="shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>

              {/* Explanatory Subscription Guarantee */}
              <p className="text-xs sm:text-[13px] text-neutral-400 leading-relaxed">
                With our Silver and Gold plans, you have the freedom to cancel anytime – your
                subscription will stay active until the end of the current billing cycle.
              </p>
            </div>

            {/* Bottom Row: Terms & Conditions + Lime Subscribe CTA */}
            <div className="mt-6 pt-5 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-xs text-neutral-400 max-w-[280px] leading-relaxed">
                By tapping Subscribe button you agree to the{' '}
                <a
                  href="#terms"
                  className="font-medium text-neutral-300 underline decoration-white/40 hover:text-white hover:decoration-white transition"
                >
                  Terms and Conditions
                </a>
              </p>

              <button
                type="button"
                onClick={handleSubscribe}
                disabled={subscribing}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-full bg-[#d0fb31] hover:bg-[#c3ec24] active:scale-95 px-7 py-3.5 text-sm sm:text-base font-bold text-neutral-950 shadow-[0_10px_25px_-5px_rgba(208,251,49,0.4)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {subscribing ? (
                  <>
                    <Loader2 size={17} className="animate-spin text-neutral-950" />
                    <span>Creating Order…</span>
                  </>
                ) : activeSubscription?.active &&
                  activeSubscription?.subscription_type?.toLowerCase() === selectedPlan ? (
                  <>
                    <Check size={17} strokeWidth={3} className="text-neutral-950" />
                    <span>Active Plan</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={17} className="fill-current" />
                    <span>Subscribe</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Subtle Footer branding */}
      <footer className="mt-8 text-center text-xs text-neutral-500">
        Library Hub &bull; Smart library management, powered by AI.
      </footer>
    </div>
  )
}