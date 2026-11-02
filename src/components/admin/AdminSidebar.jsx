import { Link } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  BookmarkCheck,
  GraduationCap,
  Users,
  Bot,
  User,
  Sparkles,
  CircleHelp,
  LogOut,
  X,
  Lock,
} from 'lucide-react'

const SECTION_TO_FEATURE = {
  overview: 'overview',
  books: 'books',
  'book-issues': 'book_issues',
  assignments: 'book_issues',
  students: 'students',
  alumni: 'students',
  agent: 'library_agent',
  profile: 'profile',
  settings: 'profile',
}

const ADMIN_NAVIGATION = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'books', label: 'Books', icon: BookOpen },
  { id: 'book-issues', label: 'Book Issues', icon: BookmarkCheck },
  { id: 'students', label: 'Students', icon: GraduationCap },
  { id: 'alumni', label: 'Alumni', icon: Users },
  { id: 'agent', label: 'Library Agent', icon: Bot },
  { id: 'profile', label: 'Profile', icon: User },
]

export default function AdminSidebar({
  activeSection,
  navigateTo,
  booksCount = 0,
  activeAssignmentsCount = 0,
  studentsCount = 0,
  alumniCount = 0,
  owner,
  handleLogout,
  mobileMenuOpen,
  setMobileMenuOpen,
  libraryId,
  features,
}) {
  const initials = (owner?.name || 'AD')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-[256px] flex-col border-r border-white/[0.08] bg-[#0f1114] lg:flex">
        <Link
          to={libraryId ? `/admin?library_id=${encodeURIComponent(libraryId)}` : '/admin'}
          className="flex h-[72px] items-center gap-3 px-6 border-b border-white/[0.08]"
        >
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5f477] text-black text-lg font-bold">
            L
          </span>
          <span className="text-lg font-bold tracking-tight text-white">
            Library<span className="text-[#d5f477]">Hub</span>
          </span>
        </Link>

        <div className="px-3 pt-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-1">
            {ADMIN_NAVIGATION.map(({ id, label, icon: Icon }) => {
              const isActive =
                activeSection === id ||
                (id === 'book-issues' && activeSection === 'assignments') ||
                (id === 'assignments' && activeSection === 'book-issues') ||
                (id === 'profile' && activeSection === 'settings')
              const featureKey = SECTION_TO_FEATURE[id]
              const isAllowed = features ? features[featureKey] !== false : true

              return (
                <button
                  key={id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigateTo(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#d5f477] text-neutral-950 font-semibold shadow-sm'
                      : isAllowed
                        ? 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'
                        : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={
                      isActive
                        ? 'text-neutral-950'
                        : isAllowed
                          ? 'text-neutral-400'
                          : 'text-neutral-500'
                    }
                  />
                  <span>{label}</span>

                  {!isAllowed ? (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
                      <Lock size={10} />
                      <span>PRO</span>
                    </span>
                  ) : (
                    <>
                      {id === 'books' && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-black/15 text-neutral-900 font-bold' : 'text-neutral-500 bg-white/5'
                          }`}
                        >
                          {booksCount}
                        </span>
                      )}
                      {(id === 'book-issues' || id === 'assignments') && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-black/15 text-neutral-900 font-bold' : 'text-purple-400 bg-purple-500/10'
                          }`}
                        >
                          {activeAssignmentsCount}
                        </span>
                      )}
                      {id === 'students' && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-black/15 text-neutral-900 font-bold' : 'text-neutral-500 bg-white/5'
                          }`}
                        >
                          {studentsCount}
                        </span>
                      )}
                      {id === 'alumni' && (
                        <span
                          className={`ml-auto text-xs px-2 py-0.5 rounded-full ${
                            isActive ? 'bg-black/15 text-neutral-900 font-bold' : 'text-neutral-500 bg-white/5'
                          }`}
                        >
                          {alumniCount}
                        </span>
                      )}
                    </>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto px-3 pb-5">
          <Link
            to="/pricing"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-950 bg-[#d5f477] hover:bg-[#c5e662] transition mb-3 shadow-[0_4px_14px_rgba(213,244,119,0.3)]"
          >
            <Sparkles aria-hidden="true" size={16} className="text-black fill-current" />
            <span>Pricing & Pro Access</span>
          </Link>

          <a
            href="mailto:support@libraryhub.example"
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-neutral-400 transition hover:bg-white/[0.05] hover:text-white"
          >
            <CircleHelp aria-hidden="true" size={18} strokeWidth={1.8} />
            Help & support
          </a>

          <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-[#16181d] p-2.5 border border-white/[0.08]">
            <div className="flex items-center gap-2.5 min-w-0">
              {owner?.avatar_url ? (
                <img
                  src={owner.avatar_url}
                  alt={owner?.name || 'Owner'}
                  className="h-8 w-8 shrink-0 rounded-lg object-cover ring-1 ring-white/10"
                />
              ) : (
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[#d5f477]/15 text-xs font-bold text-[#d5f477]">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <p className="truncate text-xs font-medium text-white">{owner?.name || 'Library Owner'}</p>
                <p className="truncate text-[11px] text-neutral-400">{owner?.email || 'owner@libraryhub.com'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-red-400 transition cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 z-20 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-[260px] flex-col border-r border-white/[0.08] bg-[#0f1114] transition-transform lg:hidden ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[72px] items-center justify-between px-6 border-b border-white/[0.08]">
          <Link
            to={libraryId ? `/admin?library_id=${encodeURIComponent(libraryId)}` : '/admin'}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5f477] text-black text-lg font-bold">
              L
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Library<span className="text-[#d5f477]">Hub</span>
            </span>
          </Link>
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="rounded-full p-2 text-neutral-400 hover:bg-white/10 hover:text-white cursor-pointer"
          >
            <X aria-hidden="true" size={19} />
          </button>
        </div>
        <div className="px-3 pt-5">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-neutral-500">
            Workspace
          </p>
          <nav aria-label="Main navigation" className="space-y-1">
            {ADMIN_NAVIGATION.map(({ id, label, icon: Icon }) => {
              const isActive =
                activeSection === id ||
                (id === 'book-issues' && activeSection === 'assignments') ||
                (id === 'assignments' && activeSection === 'book-issues') ||
                (id === 'profile' && activeSection === 'settings')
              const featureKey = SECTION_TO_FEATURE[id]
              const isAllowed = features ? features[featureKey] !== false : true

              return (
                <button
                  key={id}
                  type="button"
                  aria-current={isActive ? 'page' : undefined}
                  onClick={() => navigateTo(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-[#d5f477] text-neutral-950 font-semibold'
                      : isAllowed
                        ? 'text-neutral-400 hover:bg-white/[0.05] hover:text-white'
                        : 'text-neutral-500 hover:bg-white/[0.03] hover:text-neutral-300'
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    size={19}
                    strokeWidth={1.8}
                    className={
                      isActive
                        ? 'text-neutral-950'
                        : isAllowed
                          ? 'text-neutral-400'
                          : 'text-neutral-500'
                    }
                  />
                  <span>{label}</span>

                  {!isAllowed ? (
                    <span className="ml-auto flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-md">
                      <Lock size={10} />
                      <span>PRO</span>
                    </span>
                  ) : (
                    <>
                      {id === 'books' && <span className="ml-auto text-xs text-neutral-500">{booksCount}</span>}
                      {(id === 'book-issues' || id === 'assignments') && (
                        <span className="ml-auto text-xs text-purple-400 font-medium">
                          {activeAssignmentsCount}
                        </span>
                      )}
                      {id === 'students' && <span className="ml-auto text-xs text-neutral-500">{studentsCount}</span>}
                      {id === 'alumni' && <span className="ml-auto text-xs text-neutral-500">{alumniCount}</span>}
                    </>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
        <div className="mt-auto px-3 pb-5">
          <Link
            to="/pricing"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-neutral-950 bg-[#d5f477] transition mb-3"
          >
            <Sparkles aria-hidden="true" size={16} />
            <span>Pricing & Pro Access</span>
          </Link>
        </div>
      </aside>
    </>
  )
}
