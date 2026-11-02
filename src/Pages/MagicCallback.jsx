import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { api } from '../Services/api'
import { login } from '../Redux/Userslice'

export default function MagicCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const [status, setStatus] = useState('verifying')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('Missing magic link token. Please request a new one.')
      return
    }

    let isMounted = true

    async function verifyMagicLink() {
      try {
        const response = await api.post('/auth/magic-link/confirm', { token })

        if (!isMounted) return

        if (response.access_token) {
          localStorage.setItem('token', response.access_token)
        }

        if (response.owner) {
          dispatch(login(response.owner))
        }

        setStatus('success')
        setMessage(response.message || 'Account verified! Redirecting to workspace...')

        setTimeout(() => {
          navigate('/create-library', { replace: true })
        }, 1200)
      } catch (err) {
        if (!isMounted) return
        setStatus('error')
        setMessage(err.message || 'Magic link verification failed or link has expired.')
      }
    }

    verifyMagicLink()

    return () => {
      isMounted = false
    }
  }, [searchParams, dispatch, navigate])

  return (
    <main className="min-h-dvh bg-[#0b0d0f] text-white flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.09] bg-[#111417] p-8 text-center shadow-2xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-white/5 border border-white/10">
          {status === 'verifying' && <Loader2 className="animate-spin text-[#d5f477]" size={28} />}
          {status === 'success' && <CheckCircle2 className="text-[#d5f477]" size={28} />}
          {status === 'error' && <XCircle className="text-red-400" size={28} />}
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-white mb-2">
          {status === 'verifying' && 'Verifying magic link...'}
          {status === 'success' && 'Welcome to LibraryHub!'}
          {status === 'error' && 'Verification failed'}
        </h1>

        <p className="text-sm text-neutral-400 mb-6">
          {message || 'Please wait while we activate your account and log you in.'}
        </p>

        {status === 'error' && (
          <div className="space-y-3">
            <Link
              to="/register"
              className="inline-block w-full rounded-xl bg-[#d5f477] py-3 text-sm font-semibold text-neutral-950 hover:bg-[#c5e662] transition"
            >
              Request a new link
            </Link>
            <Link
              to="/login"
              className="inline-block text-xs text-neutral-400 hover:text-white transition"
            >
              Sign in with password
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
