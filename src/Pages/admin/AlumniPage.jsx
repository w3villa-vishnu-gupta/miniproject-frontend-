import { useAdminContext } from '../../context/AdminContext'
import AdminMetricCards from '../../components/admin/MetricCard'
import RecordsTable from '../../components/admin/RecordsTable'

export default function AlumniPage() {
  const {
    students,
    studentsLoading,
    studentsError,
    books,
    assignments,
    globalSearch,
    navigateTo,
    setEditingStudent,
    handleDeleteStudent,
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
            <h2 className="font-semibold text-white text-lg">Alumni directory</h2>
            <p className="mt-1 text-sm text-neutral-400">Former students from your library.</p>
          </div>
          <div className="flex gap-2">
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
          {studentsError ? (
            <p role="alert" className="border-y border-white/[0.08] py-8 text-center text-sm text-red-400">
              {studentsError}
            </p>
          ) : (
            <RecordsTable
              activeSection="alumni"
              search={globalSearch}
              students={students}
              books={books}
              assignments={assignments}
              loading={studentsLoading}
              onEditStudent={(student) => setEditingStudent(student)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
        </div>
      </section>
    </>
  )
}
