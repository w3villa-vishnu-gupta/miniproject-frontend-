import { BookmarkCheck, Plus } from 'lucide-react'
import { useAdminContext } from '../../context/AdminContext'
import AdminMetricCards from '../../components/admin/MetricCard'
import RecordsTable from '../../components/admin/RecordsTable'
import AddStudentForm from '../../components/admin/AddStudentForm'

export default function StudentsPage() {
  const {
    libraryId,
    activeLibrary,
    students,
    studentsLoading,
    studentsError,
    books,
    assignments,
    globalSearch,
    showStudentForm,
    setShowStudentForm,
    savingStudent,
    studentFormError,
    setStudentFormError,
    studentFormSuccess,
    setStudentFormSuccess,
    handleAddStudent,
    setEditingStudent,
    handleDeleteStudent,
    setSelectedStudentForAssign,
    setSelectedBookForAssign,
    setIsAssignModalOpen,
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
            <h2 className="font-semibold text-white text-lg">Student directory</h2>
            <p className="mt-1 text-sm text-neutral-400">Registered students and their borrowing activity.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedBookForAssign(null)
                setSelectedStudentForAssign(null)
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
              onClick={() => {
                setShowStudentForm((visible) => !visible)
                setStudentFormError('')
                setStudentFormSuccess('')
              }}
              disabled={!libraryId}
              className="inline-flex items-center gap-2 rounded-full bg-[#d5f477] px-4 py-2 text-sm font-semibold text-neutral-950 transition hover:bg-[#c5e662] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
            >
              <Plus aria-hidden="true" size={16} />
              Add student
            </button>
            <button
              type="button"
              onClick={() => navigateTo('books')}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-neutral-200 transition hover:bg-white/10 hover:text-white cursor-pointer"
            >
              View books
            </button>
          </div>
        </div>

        <div className="px-5 pb-4 pt-5 sm:px-6">
          {showStudentForm && (
            <AddStudentForm
              onSubmit={handleAddStudent}
              saving={savingStudent}
              error={studentFormError}
              onCancel={() => setShowStudentForm(false)}
              libraryName={activeLibrary?.name}
              libraryId={libraryId}
            />
          )}

          {studentFormSuccess && (
            <p role="status" className="mb-4 text-sm text-emerald-400 font-medium">
              {studentFormSuccess}
            </p>
          )}

          {studentsError ? (
            <p role="alert" className="border-y border-white/[0.08] py-8 text-center text-sm text-red-400">
              {studentsError}
            </p>
          ) : (
            <RecordsTable
              activeSection="students"
              search={globalSearch}
              students={students}
              books={books}
              assignments={assignments}
              loading={studentsLoading}
              onAssignStudent={(student) => {
                setSelectedStudentForAssign(student)
                setSelectedBookForAssign(null)
                setIsAssignModalOpen(true)
              }}
              onEditStudent={(student) => setEditingStudent(student)}
              onDeleteStudent={handleDeleteStudent}
            />
          )}
        </div>
      </section>
    </>
  )
}
