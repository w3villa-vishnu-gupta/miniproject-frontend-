import { Link } from 'react-router-dom'
import { Menu, Search } from 'lucide-react'

export default function AdminHeader({
  onOpenMobileMenu,
  globalSearch,
  onSearchChange,
  initials,
  libraryId,
}) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/[0.08] bg-[#0b0d0f]/90 backdrop-blur-md">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-8">
        <button
          type="button"
          aria-label="Open navigation menu"
          onClick={onOpenMobileMenu}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-neutral-400 hover:bg-white/10 hover:text-white transition lg:hidden cursor-pointer"
        >
          <Menu aria-hidden="true" size={20} />
        </button>
        <Link
          to={libraryId ? `/admin?library_id=${encodeURIComponent(libraryId)}` : '/admin'}
          className="flex shrink-0 items-center gap-2 lg:hidden"
        >
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#d5f477] text-black text-sm font-bold">
            L
          </span>
          <span className="text-base font-bold text-white">LibraryHub</span>
        </Link>
        <label className="relative ml-auto block w-full max-w-[560px]">
          <Search
            aria-hidden="true"
            size={18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
          />
          <span className="sr-only">Search library records</span>
          <input
            type="search"
            value={globalSearch}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search books and students"
            className="w-full rounded-full border border-white/10 bg-[#16181d] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-neutral-500 outline-none transition hover:bg-[#1a1d24] focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
          />
        </label>
        <div className="hidden h-9 w-9 shrink-0 place-items-center rounded-full bg-[#d5f477]/15 border border-[#d5f477]/30 text-xs font-bold text-[#d5f477] sm:grid">
          {initials}
        </div>
      </div>
    </header>
  )
}
