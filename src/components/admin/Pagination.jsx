import { ChevronLeft, ChevronRight } from 'lucide-react'

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }

  const pages = [1]
  const start = Math.max(2, currentPage - 1)
  const end = Math.min(totalPages - 1, currentPage + 1)

  if (start > 2) {
    pages.push('ellipsis-start')
  }

  for (let p = start; p <= end; p += 1) {
    pages.push(p)
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis-end')
  }

  pages.push(totalPages)
  return pages
}

export default function Pagination({
  page,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemLabel = 'records',
  pageSizeOptions = [5, 10, 20, 50],
}) {
  if (totalItems === 0) return null

  const startItem = (page - 1) * pageSize + 1
  const endItem = Math.min(page * pageSize, totalItems)
  const pageNumbers = getPageNumbers(page, totalPages)

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.08] pt-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400">
        <span>
          Showing <span className="font-medium text-white">{startItem}</span>&ndash;
          <span className="font-medium text-white">{endItem}</span> of{' '}
          <span className="font-medium text-white">{totalItems}</span> {itemLabel}
        </span>

        {onPageSizeChange && (
          <label className="inline-flex items-center gap-2 text-xs text-neutral-400">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              aria-label="Rows per page"
              className="rounded-lg border border-white/10 bg-[#111317] px-2 py-1 text-xs font-medium text-white outline-none transition hover:border-white/20 focus:border-[#d5f477] cursor-pointer"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option} className="bg-[#111317] text-white">
                  {option}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      <nav aria-label="Pagination" className="flex flex-wrap items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          <ChevronLeft aria-hidden="true" size={14} />
          Prev
        </button>

        {pageNumbers.map((item) => {
          if (typeof item !== 'number') {
            return (
              <span key={item} className="px-1.5 text-xs text-neutral-500 select-none">
                ...
              </span>
            )
          }

          const isActive = item === page
          return (
            <button
              key={item}
              type="button"
              onClick={() => onPageChange(item)}
              aria-current={isActive ? 'page' : undefined}
              className={`min-w-[30px] rounded-lg px-2.5 py-1.5 text-xs font-medium transition cursor-pointer ${
                isActive
                  ? 'bg-[#d5f477] text-neutral-950 font-semibold shadow-sm'
                  : 'border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {item}
            </button>
          )
        })}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          Next
          <ChevronRight aria-hidden="true" size={14} />
        </button>
      </nav>
    </div>
  )
}
