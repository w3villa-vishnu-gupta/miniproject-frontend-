import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api, getApiUrl } from '../Services/api'

export default function Createaccount() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [isSent, setIsSent] = useState(false)
  const [sentEmail, setSentEmail] = useState('')
  const [magicLink, setMagicLink] = useState('')

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errorMessage) setErrorMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setErrorMessage('')

    try {
      const response = await api.post('/auth/magic-link', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
      })

      setSentEmail(formData.email.trim())
      setMagicLink(response.magic_link || '')
      setIsSent(true)
    } catch (error) {
      console.error('Magic link request failed:', error)
      setErrorMessage(
        error.message || 'Unable to send magic link. Please try again.',
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
    window.location.href = 'http://localhost:8001/auth/google/login'
  }

  return (
    <main className="min-h-dvh bg-[#0b0d0f] text-white flex flex-col">
      <nav className="h-[76px] shrink-0 px-4 sm:px-6 md:px-14 flex items-center border-b border-white/[0.07]">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#d5f477] text-black grid place-items-center text-xl font-bold">
            L
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Library<span className="text-[#d5f477]">Hub</span>
          </span>
        </Link>
      </nav>

      <section className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12">
        <div className="w-full max-w-md">
          {isSent ? (
            <div className="rounded-2xl border border-white/[0.09] bg-[#111417] p-6 sm:p-8 text-center animate-in fade-in zoom-in-95 duration-200">
              <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#d5f477]/10 border border-[#d5f477]/20 text-[#d5f477] text-2xl font-bold">
                ✉
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
                Check your email
              </h2>
              <p className="text-sm text-neutral-300 leading-relaxed mb-4">
                We sent a magic link from <span className="text-[#d5f477]">support@apihub.digital</span> to:
              </p>
              <div className="rounded-xl border border-white/10 bg-[#0b0d0f] px-4 py-3 text-sm font-semibold text-white mb-6">
                {sentEmail}
              </div>
              <p className="text-xs text-neutral-400 mb-6 leading-relaxed">
                Click the magic link in your email to instantly verify your details and activate your workspace.
              </p>

              {magicLink && (
                <div className="mb-6 p-3 rounded-xl border border-white/10 bg-white/5 text-left">
                  <p className="text-[11px] text-neutral-400 mb-1.5 font-medium">
                    Testing locally or didn&apos;t get email?
                  </p>
                  <a
                    href={magicLink}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d5f477] hover:underline break-all"
                  >
                    Click here to complete verification directly &rarr;
                  </a>
                </div>
              )}

              <div className="flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-white hover:bg-white/10 transition cursor-pointer"
                >
                  {loading ? 'Resending…' : 'Resend magic link'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsSent(false)}
                  className="text-xs text-neutral-400 hover:text-white transition py-1 cursor-pointer"
                >
                  &larr; Change email or details
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 sm:mb-8">
                <div
                  aria-hidden="true"
                  className="grid h-12 w-12 place-items-center rounded-2xl border border-[#d5f477]/20 bg-[#d5f477]/10 text-2xl text-[#d5f477]"
                >
                  +
                </div>
                <h1 className="mt-5 text-2xl font-semibold tracking-tight sm:mt-6 sm:text-3xl">
                  Create your account.
                </h1>
                <p className="mt-2 text-sm leading-6 text-[#92969d]">
                  Get started with your LibraryHub workspace.
                </p>
              </div>

              <form
                className="space-y-5 rounded-2xl border border-white/[0.09] bg-[#111417] p-5 sm:p-7"
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

            <div>
              <label htmlFor="name" className="mb-2 block text-sm text-[#d0d3d6]">
                Full name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priya Sharma"
                autoComplete="name"
                required
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b0d0f] px-4 py-3.5 text-base outline-none transition placeholder:text-[#555b62] focus:border-[#d5f477]/60 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm text-[#d0d3d6]">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b0d0f] px-4 py-3.5 text-base outline-none transition placeholder:text-[#555b62] focus:border-[#d5f477]/60 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="mb-2 block text-sm text-[#d0d3d6]">
                Phone number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                autoComplete="tel"
                required
                className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b0d0f] px-4 py-3.5 text-base outline-none transition placeholder:text-[#555b62] focus:border-[#d5f477]/60 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-sm text-[#d0d3d6]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                  required
                  minLength={6}
                  className="w-full min-w-0 rounded-xl border border-white/10 bg-[#0b0d0f] px-4 py-3.5 pr-16 text-base outline-none transition placeholder:text-[#555b62] focus:border-[#d5f477]/60 sm:text-sm"
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
              className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#d5f477] py-3.5 text-sm font-semibold text-[#10120b] transition hover:bg-[#e4ff91] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477] disabled:opacity-60"
            >
              {loading ? 'Creating account...' : 'Create account'} <span>↗</span>
            </button>

            <div className="flex items-center gap-3 text-xs text-[#777c83] sm:gap-4">
              <span className="h-px flex-1 bg-white/[0.09]" />
              Or continue with
              <span className="h-px flex-1 bg-white/[0.09]" />
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGoogleLogin}
                type="button"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-3 text-sm text-[#d0d3d6] transition hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
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
                Continue with Google
              </button>

              <button
                onClick={handleFacebookSignIn}
                type="button"
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#0b0d0f] px-3 py-3 text-sm text-[#d0d3d6] transition hover:border-white/20 hover:bg-white/[0.04] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
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
            </div>
          </form>

            <p className="mt-6 text-center text-sm text-[#92969d] sm:mt-7">
              Already have an account?{' '}
              <Link to="/login" className="text-[#d5f477] hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </section>

      <footer className="shrink-0 border-t border-white/[0.07] px-4 py-5 text-center text-xs text-[#626970]">
        © 2026 LibraryHub · Secure access to your workspace
      </footer>
    </main>
  )
}
