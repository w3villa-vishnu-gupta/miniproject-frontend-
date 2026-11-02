import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import {
  Plus,
  Library,
  Building2,
  MapPin,
  Calendar,
  ArrowRight,
  X,
  Loader2,
  CheckCircle2,
  LogOut,
} from 'lucide-react'
import { api } from '../Services/api'
import { logout } from '../Redux/Userslice'

export default function CreateLibrary() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const owner = useSelector((state) => state.user.user)

  const [libraries, setLibraries] = useState([])
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState('')

  // Modal state (Google Cloud / AI Studio style dialog)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [libraryName, setLibraryName] = useState('')
  const [address, setAddress] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createdSuccess, setCreatedSuccess] = useState(null)

  // Fetch libraries for the authenticated owner
  useEffect(() => {
    async function loadLibraries() {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login', { replace: true })
        return
      }

      setLoading(true)
      setFetchError('')
      try {
        const data = await api.get('/libraries')
        setLibraries(Array.isArray(data) ? data : [])
      } catch (err) {
        console.error('Failed to fetch libraries:', err)
        setFetchError(
          err.message || 'Unable to load your libraries. Please try again.',
        )
      } finally {
        setLoading(false)
      }
    }

    loadLibraries()
  }, [navigate])

  function handleSelectLibrary(library) {
    // Store selected library for the active session
    localStorage.setItem('activeLibrary', JSON.stringify(library))
    navigate(`/admin?library_id=${encodeURIComponent(library.id)}`)
  }

  async function handleCreateLibrary(e) {
    e.preventDefault()
    if (!libraryName.trim()) {
      setCreateError('Please enter a library name.')
      return
    }

    const token = localStorage.getItem('token')
    setCreating(true)
    setCreateError('')

    try {
      const response = await api.post('/libraries', {
        name: libraryName.trim(),
        address: address.trim() || null,
      })

      const newLib = response.library || {
        id: response.library_id,
        name: libraryName.trim(),
        address: address.trim() || null,
        created_at: new Date().toISOString(),
      }

      setLibraries((prev) => [newLib, ...prev])
      setCreatedSuccess(newLib)
      setLibraryName('')
      setAddress('')

      // Automatically close modal after brief confirmation, or user can click Open
      setTimeout(() => {
        setIsModalOpen(false)
        setCreatedSuccess(null)
      }, 1400)
    } catch (err) {
      console.error('Failed to create library:', err)
      setCreateError(
        err.message || 'Failed to create library. Please try again.',
      )
    } finally {
      setCreating(false)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('activeLibrary')
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const ownerInitials = (owner?.name || 'AD')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="min-h-dvh bg-[#0b0d0f] text-white flex flex-col font-sans">
      {/* Top Navbar */}
      <nav className="h-[72px] shrink-0 px-4 sm:px-8 flex items-center justify-between border-b border-white/[0.08] bg-[#0e1013]">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#d5f477] text-black grid place-items-center text-lg font-bold">
            L
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Library<span className="text-[#d5f477]">Hub</span>
          </span>
        </Link>

        {/* User profile & Sign out */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <div className="h-7 w-7 rounded-full bg-[#d5f477] text-black grid place-items-center text-xs font-bold">
              {ownerInitials}
            </div>
            <div className="hidden sm:block text-left text-xs">
              <p className="font-medium text-white truncate max-w-[140px]">
                {owner?.name || 'Library Owner'}
              </p>
              <p className="text-[#8e949d] text-[11px] truncate max-w-[140px]">
                {owner?.email || ''}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-xl text-[#8e949d] hover:text-white hover:bg-white/[0.06] transition"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8 border-b border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-[#d5f477]/10 text-[#d5f477] border border-[#d5f477]/20 mb-3">
              <Building2 size={13} />
              Workspace Selector
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
              Your Libraries
            </h1>
            <p className="text-sm text-[#92969d] mt-1">
              Select an existing library workspace or create a new one to manage books and students.
            </p>
          </div>

          <div>
            <button
              onClick={() => {
                setCreateError('')
                setCreatedSuccess(null)
                setIsModalOpen(true)
              }}
              className="inline-flex items-center gap-2 bg-[#d5f477] text-[#10120b] font-semibold text-sm px-5 py-3 rounded-xl hover:bg-[#e4ff91] transition shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
            >
              <Plus size={18} strokeWidth={2.5} />
              Create Library
            </button>
          </div>
        </div>

        {/* Error Alert if fetching failed */}
        {fetchError && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-sm flex items-center justify-between">
            <span>{fetchError}</span>
            <button
              onClick={() => window.location.reload()}
              className="underline text-xs hover:text-white"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="rounded-2xl border border-white/[0.07] bg-[#121418] p-6 animate-pulse space-y-4"
              >
                <div className="h-10 w-10 rounded-xl bg-white/[0.06]" />
                <div className="h-5 w-3/4 rounded bg-white/[0.06]" />
                <div className="h-3 w-1/2 rounded bg-white/[0.04]" />
                <div className="h-9 w-full rounded-xl bg-white/[0.06] mt-4" />
              </div>
            ))}
          </div>
        ) : libraries.length > 0 ? (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-8">
            {libraries.map((library) => {
              const formattedDate = library.created_at
                ? new Date(library.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : 'Recently created'

              return (
                <div
                  key={library.id}
                  className="group relative rounded-2xl border border-white/[0.09] bg-[#111417] p-6 hover:border-[#d5f477]/50 hover:bg-[#15191d] transition-all flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                >
                  <div>
                    {/* Top row: Icon & ID Pill */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="h-11 w-11 rounded-xl bg-[#d5f477]/10 border border-[#d5f477]/20 grid place-items-center text-[#d5f477] transition group-hover:scale-105">
                        <Library size={22} />
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/[0.08] text-[#92969d]">
                        ID: #{library.id}
                      </span>
                    </div>

                    {/* Library Title */}
                    <h3 className="text-lg font-semibold text-white tracking-tight group-hover:text-[#d5f477] transition">
                      {library.name}
                    </h3>

                    {/* Location / Address */}
                    <p className="mt-2 text-xs text-[#8e949d] flex items-center gap-1.5 line-clamp-1">
                      <MapPin size={13} className="shrink-0 text-[#626970]" />
                      {library.address || 'Address not configured'}
                    </p>

                    {/* Created Date */}
                    <p className="mt-1 text-[11px] text-[#626970] flex items-center gap-1.5">
                      <Calendar size={13} className="shrink-0" />
                      Created on {formattedDate}
                    </p>
                  </div>

                  {/* Action Button */}
                  <div className="mt-6 pt-4 border-t border-white/[0.06]">
                    <button
                      onClick={() => handleSelectLibrary(library)}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white/[0.06] hover:bg-[#d5f477] hover:text-[#10120b] text-white text-xs font-semibold transition group-hover:bg-[#d5f477] group-hover:text-[#10120b]"
                    >
                      Open Workspace <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* "+ Add Another Library" Dashed Card */}
            <button
              type="button"
              onClick={() => {
                setCreateError('')
                setCreatedSuccess(null)
                setIsModalOpen(true)
              }}
              className="rounded-2xl border-2 border-dashed border-white/[0.12] hover:border-[#d5f477]/60 hover:bg-[#111417]/60 p-6 flex flex-col items-center justify-center text-center transition min-h-[220px] group"
            >
              <div className="h-12 w-12 rounded-2xl bg-white/[0.05] border border-white/[0.08] grid place-items-center text-[#8e949d] group-hover:bg-[#d5f477]/10 group-hover:text-[#d5f477] group-hover:border-[#d5f477]/30 transition mb-3">
                <Plus size={22} />
              </div>
              <p className="text-sm font-semibold text-[#d0d3d6] group-hover:text-white">
                Add New Library
              </p>
              <p className="text-xs text-[#626970] mt-1 max-w-[200px]">
                Create an isolated tenant workspace for another branch
              </p>
            </button>
          </div>
        ) : (
          /* Empty State (Google-like clean onboarding) */
          <div className="mt-12 rounded-3xl border border-white/[0.08] bg-[#111417] p-8 sm:p-14 text-center max-w-xl mx-auto shadow-xl">
            <div className="h-16 w-16 rounded-2xl bg-[#d5f477]/10 border border-[#d5f477]/20 text-[#d5f477] grid place-items-center mx-auto mb-6">
              <Library size={32} />
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-white">
              No libraries created yet
            </h2>
            <p className="text-sm text-[#92969d] mt-2 leading-relaxed">
              To get started with LibraryHub, create your first library workspace. Each library will hold its own collection of books, students, and loan history.
            </p>

            <button
              onClick={() => {
                setCreateError('')
                setCreatedSuccess(null)
                setIsModalOpen(true)
              }}
              className="mt-6 inline-flex items-center gap-2 bg-[#d5f477] text-[#10120b] font-semibold text-sm px-6 py-3.5 rounded-xl hover:bg-[#e4ff91] transition shadow-md"
            >
              <Plus size={18} strokeWidth={2.5} />
              Create your first library
            </button>
          </div>
        )}
      </main>

      {/* Google-like Create Library Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop blur */}
          <div
            onClick={() => !creating && setIsModalOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
          />

          {/* Dialog Box */}
          <div className="relative w-full max-w-md rounded-2xl border border-white/[0.12] bg-[#14171b] p-6 sm:p-7 text-white shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-white">
                  Create new library
                </h2>
                <p className="text-xs text-[#92969d] mt-1">
                  Set up a new workspace for your library branch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !creating && setIsModalOpen(false)}
                disabled={creating}
                className="p-1.5 rounded-lg text-[#8e949d] hover:text-white hover:bg-white/[0.08] transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Message */}
            {createError && (
              <div className="mb-4 p-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 text-xs">
                {createError}
              </div>
            )}

            {/* Success Feedback */}
            {createdSuccess ? (
              <div className="py-6 text-center space-y-3">
                <CheckCircle2 size={40} className="text-[#d5f477] mx-auto animate-bounce" />
                <p className="text-sm font-medium text-white">
                  Library &quot;{createdSuccess.name}&quot; created successfully!
                </p>
                <button
                  onClick={() => handleSelectLibrary(createdSuccess)}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs text-[#d5f477] hover:underline"
                >
                  Opening workspace now... <ArrowRight size={13} />
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateLibrary} className="space-y-4">
                <div>
                  <label
                    htmlFor="libName"
                    className="block text-xs font-medium text-[#d0d3d6] mb-1.5"
                  >
                    Library Name <span className="text-[#d5f477]">*</span>
                  </label>
                  <input
                    id="libName"
                    type="text"
                    required
                    autoFocus
                    value={libraryName}
                    onChange={(e) => {
                      setLibraryName(e.target.value)
                      if (createError) setCreateError('')
                    }}
                    placeholder="e.g. City Central Library"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d0f] px-3.5 py-3 text-sm text-white placeholder:text-[#555b62] outline-none focus:border-[#d5f477]/60 focus:ring-1 focus:ring-[#d5f477]/30 transition"
                  />
                  <p className="text-[11px] text-[#626970] mt-1">
                    This name will appear on student cards and checkout receipts.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="libAddress"
                    className="block text-xs font-medium text-[#d0d3d6] mb-1.5"
                  >
                    Address / Branch Location (Optional)
                  </label>
                  <input
                    id="libAddress"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. 2nd Floor, MG Road, Bangalore"
                    className="w-full rounded-xl border border-white/10 bg-[#0b0d0f] px-3.5 py-3 text-sm text-white placeholder:text-[#555b62] outline-none focus:border-[#d5f477]/60 focus:ring-1 focus:ring-[#d5f477]/30 transition"
                  />
                </div>

                {/* Modal Actions */}
                <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/[0.08]">
                  <button
                    type="button"
                    disabled={creating}
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-white/10 text-xs font-medium text-[#d0d3d6] hover:bg-white/[0.05] transition"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    disabled={creating || !libraryName.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#d5f477] text-[#10120b] text-xs font-semibold hover:bg-[#e4ff91] transition disabled:opacity-50"
                  >
                    {creating && <Loader2 size={14} className="animate-spin" />}
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="shrink-0 border-t border-white/[0.07] px-4 py-5 text-center text-xs text-[#626970]">
        © 2026 LibraryHub · Multi-tenant workspace management
      </footer>
    </div>
  )
}
