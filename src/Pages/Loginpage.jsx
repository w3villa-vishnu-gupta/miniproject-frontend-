import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { api, getApiUrl } from '../Services/api'
import { login } from '../Redux/Userslice'

export default function Loginpage() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)

  async function handleMagicLogin() {
    if (!email.trim()) {
      setErrorMessage('Please enter your email address above to receive a magic link.')
      return
    }
    setMagicLoading(true)
    setErrorMessage('')
    try {
      await api.post('/auth/magic-link', { email: email.trim() })
      setMagicLinkSent(true)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to send magic link.')
    } finally {
      setMagicLoading(false)
    }
  }

  // Check if Facebook redirected with an error query param
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      if (errorParam === 'facebook_cancelled') {
        setErrorMessage('Facebook login was cancelled. Please try again.')
      } else if (errorParam === 'facebook_token_failed') {
        setErrorMessage('Unable to obtain Facebook access. Please try again.')
      } else {
        setErrorMessage('Facebook sign-in could not be completed. Please try again.')
      }
    }
  }, [searchParams])

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await api.post('/login', {
        email: email.trim(),
        password,
      })

      // Store the JWT token for authenticated requests
      if (response.access_token) {
        localStorage.setItem('token', response.access_token)
      }

      // Save owner details to Redux
      if (response.owner) {
        dispatch(login(response.owner))
      }

      // Navigate to library workspace selector
      navigate('/create-library', { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
      setErrorMessage(
        error.message || 'Invalid email or password. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleFacebookSignIn() {
    const facebookAuthUrl = getApiUrl('/auth/facebook')
    window.location.assign(facebookAuthUrl)
  }

  const handleGoogleLogin = () => {
    window.location.href = getApiUrl('/auth/google/login')
  }

  return (
    <main className="min-h-dvh bg-[#0b0d0f] text-white flex flex-col">
      <nav className="h-[76px] px-6 md:px-14 flex items-center border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#d5f477] text-black grid place-items-center text-xl font-bold">
            L
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Library<span className="text-[#d5f477]">Hub</span>
          </span>
        </Link>
      </nav>

      <section className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          <div className="mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#d5f477]/10 border border-[#d5f477]/20 grid place-items-center text-[#d5f477] text-2xl">
              ↗
            </div>

            <h1 className="text-3xl font-semibold tracking-tight mt-6">
              Welcome back.
            </h1>

            <p className="text-[#92969d] mt-2 text-sm leading-6">
              Sign in to manage your library workspace.
            </p>
          </div>

          <form
            className="border border-white/[0.09] bg-[#111417] rounded-2xl p-6 md:p-8 space-y-5"
            onSubmit={handleSubmit}
          >
            {errorMessage && (
              <div
                role="alert"
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {errorMessage}
              </div>
            )}

            {magicLinkSent && (
              <div
                role="status"
                className="rounded-xl border border-[#d5f477]/30 bg-[#d5f477]/10 px-4 py-3 text-sm text-[#d5f477]"
              >
                Magic link sent to <span className="font-semibold text-white">{email}</span> from <span className="text-white">support@apihub.digital</span>. Check your inbox to sign in!
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm mb-2 text-[#d0d3d6]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (errorMessage) setErrorMessage('')
                }}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full bg-[#0b0d0f] border border-white/10 rounded-xl px-4 py-3.5 text-sm outline-none placeholder:text-[#555b62] focus:border-[#d5f477]/60 transition"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="text-sm text-[#d0d3d6]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleMagicLogin}
                  disabled={magicLoading}
                  className="text-xs text-[#d5f477] hover:underline cursor-pointer"
                >
                  {magicLoading ? 'Sending link…' : 'Email me a magic link'}
                </button>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errorMessage) setErrorMessage('')
                  }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#0b0d0f] border border-white/10 rounded-xl px-4 py-3.5 pr-16 text-sm outline-none placeholder:text-[#555b62] focus:border-[#d5f477]/60 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#92969d] hover:text-white"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#d5f477] text-[#10120b] font-semibold rounded-xl py-3.5 text-sm hover:bg-[#e4ff91] transition flex justify-center items-center gap-2 disabled:opacity-60"
            >
              {loading ? 'Signing in...' : 'Sign in'} <span>↗</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#777c83]">
              <span className="h-px flex-1 bg-white/[0.09]" />
              Or continue with
              <span className="h-px flex-1 bg-white/[0.09]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-3 text-sm text-[#d0d3d6] transition hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0"
              >
                <path
                  fill="#EA4335"
                  d="M12 5c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.7 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.91 6.16-4.91z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.72 2.88c2.18-2.01 3.7-4.99 3.7-8.7z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.72-2.88c-1.07.72-2.45 1.16-4.21 1.16-2.86 0-5.29-2.31-6.16-4.91H2.18l-3.66 2.84C3.99 20.53 7.7 23 12 23z"
                />
              </svg>
              Login with Google
            </button>

            <button
              type="button"
              onClick={handleFacebookSignIn}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-3 text-sm text-[#d0d3d6] transition hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5 shrink-0 fill-[#1877F2]"
              >
                <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.49 0-1.955.93-1.955 1.884v2.27h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
              </svg>
              Continue with Facebook
            </button>
          </form>

          <p className="text-center text-sm text-[#92969d] mt-7">
            New to LibraryHub?{' '}
            <Link to="/register" className="text-[#d5f477] hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>

      <footer className="px-6 py-5 border-t border-white/[0.07] text-center text-xs text-[#626970]">
        © 2026 LibraryHub · Secure access to your workspace
      </footer>
    </main>
  )
}
