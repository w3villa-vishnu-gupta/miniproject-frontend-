import { useEffect, useState } from 'react'
import { BookmarkCheck, Plus } from 'lucide-react'
import { api } from '../../Services/api'
import { useAdminContext } from '../../context/AdminContext'
import AdminMetricCards from '../../components/admin/MetricCard'
import RecordsTable from '../../components/admin/RecordsTable'
import AddStudentForm from '../../components/admin/AddStudentForm'
import Pagination from '../../components/admin/Pagination'

export default function StudentsPage() {
  const {
    libraryId,
    activeLibrary,
    students,
    studentsLoading,
    refreshStudents,
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

  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [debouncedSearch, setDebouncedSearch] = useState(globalSearch)
  const [prevLibraryId, setPrevLibraryId] = useState(libraryId)
  const [pageData, setPageData] = useState({
    key: '',
    students: [],
    total: 0,
    totalPages: 1,
    error: '',
  })

  if (libraryId !== prevLibraryId) {
    setPrevLibraryId(libraryId)
    setPage(1)
  }

  useEffect(() => {
    if (globalSearch === debouncedSearch) return
    const delay = globalSearch.trim() === '' ? 0 : 250
    const timer = setTimeout(() => {
      setDebouncedSearch(globalSearch)
      setPage(1)
    }, delay)
    return () => clearTimeout(timer)
  }, [globalSearch, debouncedSearch])

  const requestKey = `${libraryId || ''}|${page}|${pageSize}|${debouncedSearch.trim()}|${refreshStudents}`

  useEffect(() => {
    if (!libraryId) return

    let cancelled = false
    const params = new URLSearchParams({
      library_id: String(libraryId),
      page: String(page),
      limit: String(pageSize),
      alumini: 'false',
    })
    if (debouncedSearch.trim()) {
      params.set('search', debouncedSearch.trim())
    }

    api.get(`/getallstudents?${params.toString()}`)
      .then((data) => {
        if (cancelled) return

        // Standard server-side paginated response
        if (data && !Array.isArray(data) && Array.isArray(data.students)) {
          const resolvedPage = data.page || page
          const resolvedTotalPages = Math.max(1, data.total_pages || 1)
          const resolvedKey = `${libraryId || ''}|${resolvedPage}|${pageSize}|${debouncedSearch.trim()}|${refreshStudents}`

          if (resolvedPage !== page) {
            setPage(resolvedPage)
          }

          setPageData({
            key: resolvedKey,
            students: data.students,
            total: Number(data.total) || 0,
            totalPages: resolvedTotalPages,
            error: '',
          })
          return
        }

        // Fallback if backend returns a plain array
        if (Array.isArray(data)) {
          const query = debouncedSearch.trim().toLowerCase()
          const filtered = data.filter((student) => {
            if (student.alumini === true || student.alumini === 'true') return false
            if (!query) return true
            return Object.values(student).some((value) =>
              String(value ?? '').toLowerCase().includes(query),
            )
          })
          const total = filtered.length
          const totalPages = Math.max(1, Math.ceil(total / pageSize))
          const safePage = Math.min(page, totalPages)
          const start = (safePage - 1) * pageSize
          const sliced = filtered.slice(start, start + pageSize)
          const resolvedKey = `${libraryId || ''}|${safePage}|${pageSize}|${debouncedSearch.trim()}|${refreshStudents}`

          if (safePage !== page) {
            setPage(safePage)
          }

          setPageData({
            key: resolvedKey,
            students: sliced,
            total,
            totalPages,
            error: '',
          })
          return
        }

        throw new Error('The students response format is invalid.')
      })
      .catch((error) => {
        if (cancelled) return
        setPageData({
          key: requestKey,
          students: [],
          total: 0,
          totalPages: 1,
          error: error.message || 'Unable to load students.',
        })
      })

    return () => {
      cancelled = true
    }
  }, [libraryId, page, pageSize, debouncedSearch, refreshStudents, requestKey])

  const isCurrentResult = pageData.key === requestKey
  const paginatedStudents = isCurrentResult ? pageData.students : []
  const paginatedLoading = Boolean(libraryId) && !isCurrentResult
  const totalItems = isCurrentResult ? pageData.total : 0
  const totalPages = isCurrentResult ? pageData.totalPages : 1
  const activeError = !libraryId
    ? 'Select a library to view its students.'
    : isCurrentResult
      ? pageData.error
      : ''

  function handlePageChange(nextPage) {
    const clamped = Math.max(1, Math.min(totalPages, nextPage))
    setPage(clamped)
  }

  function handlePageSizeChange(nextSize) {
    setPageSize(nextSize)
    setPage(1)
  }

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

          {activeError ? (
            <p role="alert" className="border-y border-white/[0.08] py-8 text-center text-sm text-red-400">
              {activeError}
            </p>
          ) : (
            <>
              <RecordsTable
                activeSection="students"
                search={globalSearch}
                students={paginatedStudents}
                books={books}
                assignments={assignments}
                loading={paginatedLoading}
                disableClientSearch
                onAssignStudent={(student) => {
                  setSelectedStudentForAssign(student)
                  setSelectedBookForAssign(null)
                  setIsAssignModalOpen(true)
                }}
                onEditStudent={(student) => setEditingStudent(student)}
                onDeleteStudent={handleDeleteStudent}
              />

              {!paginatedLoading && (
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  totalItems={totalItems}
                  pageSize={pageSize}
                  onPageChange={handlePageChange}
                  onPageSizeChange={handlePageSizeChange}
                  itemLabel="students"
                />
              )}
            </>
          )}
        </div>
      </section>
    </>
  )
}
