import { BookmarkCheck } from 'lucide-react'
import { useAdminContext } from '../../context/AdminContext'
import AdminMetricCards from '../../components/admin/MetricCard'
import RecordsTable from '../../components/admin/RecordsTable'

export default function BookIssuesPage() {
  const {
    libraryId,
    books,
    students,
    studentsLoading,
    assignments,
    assignmentsLoading,
    assignmentsError,
    globalSearch,
    bookFormSuccess,
    bookFormError,
    setSelectedBookForAssign,
    setIsAssignModalOpen,
    handleReturnBook,
    handleDeleteAssignment,
    navigateTo,
  } = useAdminContext()

  return (
    <>
      <AdminMetricCards
        books={books}
        students={students}
        studentsLoading={studentsLoading}
      />

      <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#14161b] shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
        <div className="flex flex-col justify-between gap-4 px-5 py-5 sm:flex-row sm:items-center sm:px-6 border-b border-white/[0.08]">
          <div>
            <h2 className="font-semibold text-white text-lg">Book Issues & Circulation</h2>
            <p className="mt-1 text-sm text-neutral-400">Track assigned copies, loan dates, and return statuses.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedBookForAssign(null)
                setIsAssignModalOpen(true)
              }}
              disabled={!libraryId}
              className="inline-flex items-center gap-2 rounded-full border border-purple-500/30 bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-300 transition hover:bg-purple-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <BookmarkCheck aria-hidden="true" size={16} />
              Assign book
            </button>
            <button
              type="button"
              onClick={() => navigateTo('books')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              View books
            </button>
            <button
              type="button"
              onClick={() => navigateTo('students')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              View students
            </button>
          </div>
        </div>

        <div className="px-5 pb-4 pt-5 sm:px-6">
          {bookFormSuccess && (
            <p role="status" className="mb-4 text-sm text-emerald-400 font-medium">
              {bookFormSuccess}
            </p>
          )}

          {bookFormError && (
            <p role="alert" className="mb-4 text-sm text-red-400 font-medium">
              {bookFormError}
            </p>
          )}

          {assignmentsError ? (
            <p role="alert" className="border-y border-white/[0.08] py-8 text-center text-sm text-red-400">
              {assignmentsError}
            </p>
          ) : (
            <RecordsTable
              activeSection="book-issues"
              search={globalSearch}
              students={students}
              books={books}
              assignments={assignments}
              loading={assignmentsLoading}
              onReturnBook={handleReturnBook}
              onDeleteAssignment={handleDeleteAssignment}
            />
          )}
        </div>
      </section>
    </>
  )
}
