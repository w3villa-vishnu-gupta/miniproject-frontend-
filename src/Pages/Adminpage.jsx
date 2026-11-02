import { useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, Link, useSearchParams, useLocation, Outlet, useOutlet } from 'react-router-dom'
import { LibraryBig, ChevronRight, Lock, Sparkles } from 'lucide-react'
import { logout } from '../Redux/Userslice'
import { api } from '../Services/api'
import { AdminContext } from '../context/AdminContext'
import EditStudentModal from '../components/EditStudentModal'
import EditBookModal from '../components/EditBookModal'
import AssignBookModal from '../components/AssignBookModal'
import AdminSidebar from '../components/admin/AdminSidebar'
import AdminHeader from '../components/admin/AdminHeader'
import OverviewPage from './admin/OverviewPage'

const sectionCopy = {
  overview: ['Overview', 'A quick look at your library workspace.'],
  books: ['Books', 'Manage and track your library collection.'],
  assignments: ['Book Issues', 'Track assigned books, borrowers, return dates, and circulation.'],
  'book-issues': ['Book Issues', 'Track assigned books, borrowers, return dates, and circulation.'],
  students: ['Students', 'View and manage your student members.'],
  alumni: ['Alumni', 'View students who have graduated from your library.'],
  agent: ['Library Agent', 'Get help managing your library workspace.'],
  profile: ['Owner Profile', 'Manage your account and library workspace identity.'],
  settings: ['Owner Profile', 'Manage your account and library workspace identity.'],
}

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

function FeatureLocked({ sectionTitle, planName }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#14161b] p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 shadow-[0_4px_24px_rgba(0,0,0,0.4)] animate-in fade-in zoom-in-95 duration-200">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-5 shadow-inner">
        <Lock size={30} />
      </div>

      <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 rounded-full border border-amber-400/20 mb-3">
        Feature Locked &bull; {planName || 'Free'} Plan
      </span>

      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
        Upgrade to unlock {sectionTitle}
      </h2>

      <p className="text-sm text-neutral-400 max-w-md mx-auto mb-8 leading-relaxed">
        Your current plan does not have permission to access{' '}
        <span className="text-white font-medium">{sectionTitle}</span>. Upgrade your plan to unlock this feature and access advanced library management tools.
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link
          to="/pricing"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#d5f477] hover:bg-[#c5e662] px-6 py-3 text-sm font-semibold text-neutral-950 transition shadow-[0_4px_14px_rgba(213,244,119,0.3)] active:scale-95 cursor-pointer"
        >
          <Sparkles size={16} />
          <span>View Plans & Upgrade</span>
        </Link>
        <Link
          to="/admin/overview"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-5 py-3 text-sm font-medium text-neutral-300 hover:text-white transition cursor-pointer"
        >
          <span>Back to Overview</span>
        </Link>
      </div>
    </div>
  )
}

export default function Adminpage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const outlet = useOutlet()
  const owner = useSelector((state) => state.user.user)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [globalSearch, setGlobalSearch] = useState('')

  // Students state
  const [studentResult, setStudentResult] = useState({ libraryId: null, refresh: 0, students: [], error: '' })
  const [refreshStudents, setRefreshStudents] = useState(0)
  const [showStudentForm, setShowStudentForm] = useState(false)
  const [savingStudent, setSavingStudent] = useState(false)
  const [studentFormError, setStudentFormError] = useState('')
  const [studentFormSuccess, setStudentFormSuccess] = useState('')
  const [editingStudent, setEditingStudent] = useState(null)

  // Books state
  const [bookResult, setBookResult] = useState({ libraryId: null, refresh: 0, books: [], error: '' })
  const [refreshBooks, setRefreshBooks] = useState(0)
  const [showBookForm, setShowBookForm] = useState(false)
  const [savingBook, setSavingBook] = useState(false)
  const [bookFormError, setBookFormError] = useState('')
  const [bookFormSuccess, setBookFormSuccess] = useState('')
  const [editingBook, setEditingBook] = useState(null)

  // Book assignments state
  const [assignmentResult, setAssignmentResult] = useState({ libraryId: null, refresh: 0, assignments: [], error: '' })
  const [refreshAssignments, setRefreshAssignments] = useState(0)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [selectedBookForAssign, setSelectedBookForAssign] = useState(null)
  const [selectedStudentForAssign, setSelectedStudentForAssign] = useState(null)

  // Subscription & Permission features state
  const [subscriptionData, setSubscriptionData] = useState(null)
  const [features, setFeatures] = useState({
    overview: true,
    profile: true,
    students: true,
    books: true,
    book_issues: true,
    library_agent: true,
  })

  useEffect(() => {
    let isMounted = true
    async function fetchSubscription() {
      try {
        const data = await api.get('/subscription')
        if (isMounted && data) {
          setSubscriptionData(data)
          if (data.feature && typeof data.feature === 'object') {
            setFeatures(data.feature)
          }
        }
      } catch (err) {
        console.error('Failed to load subscription permissions:', err)
      }
    }
    fetchSubscription()
    return () => {
      isMounted = false
    }
  }, [])

  const isPermitted = useMemo(() => {
    return (section) => {
      if (!features) return true
      const featureKey = SECTION_TO_FEATURE[section]
      if (!featureKey) return true
      return features[featureKey] !== false
    }
  }, [features])

  const activeLibrary = useMemo(() => {
    try {
      const stored = localStorage.getItem('activeLibrary')
      const parsed = stored ? JSON.parse(stored) : null
      const urlLibId = searchParams.get('library_id')
      if (urlLibId && parsed && String(parsed.id) !== String(urlLibId)) {
        return { ...parsed, id: Number(urlLibId) }
      }
      return parsed
    } catch {
      return null
    }
  }, [searchParams])

  const libraryId =
    searchParams.get('library_id') || (activeLibrary?.id ? String(activeLibrary.id) : null)

  // Determine active section from URL path
  const activeSection = useMemo(() => {
    const path = location.pathname.replace(/\/$/, '')
    if (path.endsWith('/books') || path.endsWith('/book')) return 'books'
    if (path.endsWith('/book-issues') || path.endsWith('/assignments')) return 'book-issues'
    if (path.endsWith('/students') || path.endsWith('/student')) return 'students'
    if (path.endsWith('/alumni')) return 'alumni'
    if (path.endsWith('/agent')) return 'agent'
    if (path.endsWith('/profile') || path.endsWith('/settings')) return 'profile'
    return 'overview'
  }, [location.pathname])

  const [sectionTitle, sectionDescription] = sectionCopy[activeSection] || sectionCopy.overview

  const hasStudentResult = studentResult.libraryId === libraryId && studentResult.refresh === refreshStudents
  const students = hasStudentResult ? studentResult.students : []
  const studentsLoading = Boolean(libraryId) && !hasStudentResult
  const studentsError = !libraryId
    ? 'Select a library to view its students.'
    : hasStudentResult
      ? studentResult.error
      : ''

  const hasBookResult = bookResult.libraryId === libraryId && bookResult.refresh === refreshBooks
  const books = hasBookResult ? bookResult.books : []
  const booksLoading = Boolean(libraryId) && !hasBookResult
  const booksError = !libraryId
    ? 'Select a library to view its books.'
    : hasBookResult
      ? bookResult.error
      : ''

  const hasAssignmentResult =
    assignmentResult.libraryId === libraryId && assignmentResult.refresh === refreshAssignments
  const assignments = hasAssignmentResult ? assignmentResult.assignments : []
  const assignmentsLoading = Boolean(libraryId) && !hasAssignmentResult
  const assignmentsError = !libraryId
    ? 'Select a library to view its book assignments.'
    : hasAssignmentResult
      ? assignmentResult.error
      : ''

  // Fetch students dynamically
  useEffect(() => {
    if (!libraryId) return

    let cancelled = false

    api.get(`/getallstudents?library_id=${encodeURIComponent(libraryId)}`)
      .then((data) => {
        const records = Array.isArray(data) ? data : data?.students
        if (!Array.isArray(records)) {
          throw new Error('The students response is not a list.')
        }
        if (!cancelled) setStudentResult({ libraryId, refresh: refreshStudents, students: records, error: '' })
      })
      .catch((error) => {
        if (!cancelled) {
          setStudentResult({
            libraryId,
            refresh: refreshStudents,
            students: [],
            error: error.message || 'Unable to load students.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [libraryId, refreshStudents])

  // Fetch books dynamically
  useEffect(() => {
    if (!libraryId) return

    let cancelled = false

    api.get(`/books?library_id=${encodeURIComponent(libraryId)}`)
      .then((data) => {
        const records = Array.isArray(data) ? data : data?.books || []
        if (!cancelled) setBookResult({ libraryId, refresh: refreshBooks, books: records, error: '' })
      })
      .catch((error) => {
        if (!cancelled) {
          setBookResult({
            libraryId,
            refresh: refreshBooks,
            books: [],
            error: error.message || 'Unable to load books.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [libraryId, refreshBooks])

  // Fetch book assignments dynamically
  useEffect(() => {
    if (!libraryId) return

    let cancelled = false

    api.get(`/assigned-books?library_id=${encodeURIComponent(libraryId)}`)
      .then((data) => {
        const records = Array.isArray(data) ? data : data?.assignments
        if (!Array.isArray(records)) {
          throw new Error('The assignments response is not a list.')
        }

        if (!cancelled) {
          setAssignmentResult({
            libraryId,
            refresh: refreshAssignments,
            assignments: records,
            error: '',
          })
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setAssignmentResult({
            libraryId,
            refresh: refreshAssignments,
            assignments: [],
            error: error.message || 'Unable to load book assignments.',
          })
        }
      })

    return () => {
      cancelled = true
    }
  }, [libraryId, refreshAssignments])

  async function handleAddStudent(event) {
    event.preventDefault()
    if (!libraryId) {
      setStudentFormError('Select a library before adding a student.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    setSavingStudent(true)
    setStudentFormError('')
    setStudentFormSuccess('')

    try {
      await api.post('/createaccount/addstudent', {
        library_id: Number(libraryId),
        name: formData.get('name').trim(),
        email: formData.get('email').trim(),
        phone: formData.get('phone').trim(),
        address: formData.get('address').trim() || null,
        payment_start_month: formData.get('payment_start_month') || null,
      })
      setStudentFormSuccess('Student added successfully.')
      setShowStudentForm(false)
      form.reset()
      setRefreshStudents((value) => value + 1)
    } catch (error) {
      setStudentFormError(error.message || 'Unable to add student.')
    } finally {
      setSavingStudent(false)
    }
  }

  async function handleUpdateStudent(student) {
    try {
      await api.patch(
        `/students/${encodeURIComponent(student.id)}?library_id=${encodeURIComponent(student.library_id || libraryId)}`,
        {
          name: student.name,
          email: student.email,
          phone: student.phone,
          address: student.address,
          status: student.status,
          alumini: student.alumini,
          payment_start_month: student.payment_start_month || null,
          last_payment_date: student.last_payment_date || null,
        },
      )

      setEditingStudent(null)
      setStudentFormSuccess('Student updated successfully.')
      setRefreshStudents((value) => value + 1)
    } catch (error) {
      setStudentFormError(error.message || 'Unable to update student.')
    }
  }

  async function handleDeleteStudent(student) {
    if (!window.confirm(`Delete ${student.name || 'this student'}?`)) return
    try {
      await api.delete(`/students/${student.id}?library_id=${encodeURIComponent(student.library_id || libraryId)}`)
      setStudentFormSuccess('Student deleted successfully.')
      setRefreshStudents((value) => value + 1)
    } catch (error) {
      setStudentFormError(error.message || 'Unable to delete student.')
    }
  }

  async function handleAddBook(event) {
    event.preventDefault()
    if (!libraryId) {
      setBookFormError('Select a library before adding a book.')
      return
    }

    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget
    setSavingBook(true)
    setBookFormError('')
    setBookFormSuccess('')

    try {
      await api.post('/books', {
        library_id: Number(libraryId),
        title: formData.get('title').trim(),
        author: formData.get('author').trim(),
        category: formData.get('category').trim(),
        copies: Number(formData.get('copies')) || 1,
        issued_copies: Number(formData.get('issued_copies')) || 0,
        status: formData.get('status') || 'Available',
        description: formData.get('description')?.trim() || null,
      })
      setBookFormSuccess('Book added successfully.')
      setShowBookForm(false)
      form.reset()
      setRefreshBooks((value) => value + 1)
    } catch (error) {
      setBookFormError(error.message || 'Unable to add book.')
    } finally {
      setSavingBook(false)
    }
  }

  async function handleUpdateBook(book) {
    try {
      await api.patch(
        `/books/${encodeURIComponent(book.id)}?library_id=${encodeURIComponent(book.library_id || libraryId)}`,
        {
          title: book.title,
          author: book.author,
          category: book.category,
          copies: book.copies,
          issued_copies: book.issued_copies,
          status: book.status,
          description: book.description,
        },
      )
      setBookFormSuccess('Book updated successfully.')
      setRefreshBooks((value) => value + 1)
    } catch (error) {
      setBookFormError(error.message || 'Unable to update book.')
    }
  }

  async function handleDeleteBook(book) {
    if (!window.confirm(`Delete "${book.title}" from library collection?`)) return
    try {
      await api.delete(`/books/${book.id}?library_id=${encodeURIComponent(book.library_id || libraryId)}`)
      setBookFormSuccess('Book deleted successfully.')
      setRefreshBooks((value) => value + 1)
    } catch (error) {
      setBookFormError(error.message || 'Unable to delete book.')
    }
  }

  async function handleAssignBook(assignmentData) {
    await api.post(`/assign-book?library_id=${encodeURIComponent(libraryId)}`, assignmentData)
    setBookFormSuccess('Book assigned successfully.')
    setRefreshAssignments((value) => value + 1)
    setRefreshBooks((value) => value + 1)
  }

  async function handleReturnBook(assignment) {
    if (!window.confirm(`Mark "${assignment.book_title}" as returned from ${assignment.student_name}?`)) return
    try {
      await api.patch(`/return-book/${assignment.id}?library_id=${encodeURIComponent(libraryId)}`)
      setBookFormSuccess('Book marked as returned successfully.')
      setRefreshAssignments((value) => value + 1)
      setRefreshBooks((value) => value + 1)
    } catch (error) {
      setBookFormError(error.message || 'Unable to return book.')
    }
  }

  async function handleDeleteAssignment(assignment) {
    if (!window.confirm(`Delete this assignment record for "${assignment.book_title}"?`)) return
    try {
      await api.delete(`/assigned-books/${assignment.id}?library_id=${encodeURIComponent(libraryId)}`)
      setBookFormSuccess('Assignment record deleted.')
      setRefreshAssignments((value) => value + 1)
      setRefreshBooks((value) => value + 1)
    } catch (error) {
      setBookFormError(error.message || 'Unable to delete assignment.')
    }
  }

  function navigateTo(section) {
    const targetPath = section === 'overview' ? '/admin' : `/admin/${section}`
    const search = location.search || (libraryId ? `?library_id=${encodeURIComponent(libraryId)}` : '')
    setBookFormError('')
    setBookFormSuccess('')
    setStudentFormError('')
    setStudentFormSuccess('')
    navigate({
      pathname: targetPath,
      search,
    })
    setMobileMenuOpen(false)
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('activeLibrary')
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const initials = (owner?.name || 'AD')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  const adminContext = {
    // Basic identifiers & auth
    owner,
    libraryId,
    activeLibrary,
    initials,
    // Navigation & UI state
    activeSection,
    sectionTitle,
    sectionDescription,
    globalSearch,
    setGlobalSearch,
    navigateTo,
    // Students
    students,
    studentsLoading,
    studentsError,
    refreshStudents,
    setRefreshStudents,
    showStudentForm,
    setShowStudentForm,
    savingStudent,
    studentFormError,
    setStudentFormError,
    studentFormSuccess,
    setStudentFormSuccess,
    editingStudent,
    setEditingStudent,
    handleAddStudent,
    handleUpdateStudent,
    handleDeleteStudent,
    // Books
    books,
    booksLoading,
    booksError,
    refreshBooks,
    setRefreshBooks,
    showBookForm,
    setShowBookForm,
    savingBook,
    bookFormError,
    setBookFormError,
    bookFormSuccess,
    setBookFormSuccess,
    editingBook,
    setEditingBook,
    handleAddBook,
    handleUpdateBook,
    handleDeleteBook,
    // Book assignments
    assignments,
    assignmentsLoading,
    assignmentsError,
    refreshAssignments,
    setRefreshAssignments,
    isAssignModalOpen,
    setIsAssignModalOpen,
    selectedBookForAssign,
    setSelectedBookForAssign,
    selectedStudentForAssign,
    setSelectedStudentForAssign,
    handleAssignBook,
    handleReturnBook,
    handleDeleteAssignment,
    // Permissions & Subscription
    features,
    subscriptionData,
    isPermitted,
  }

  return (
    <AdminContext.Provider value={adminContext}>
      <div className="min-h-dvh bg-[#0b0d0f] text-neutral-100 selection:bg-[#d5f477] selection:text-black">
        {/* Sidebar */}
        <AdminSidebar
          activeSection={activeSection}
          navigateTo={navigateTo}
          booksCount={books.length}
          activeAssignmentsCount={assignments.filter((a) => a.status !== 'returned').length}
          studentsCount={students.filter((student) => student.alumini !== true && student.alumini !== 'true').length}
          alumniCount={students.filter((student) => student.alumini === true || student.alumini === 'true').length}
          owner={owner}
          handleLogout={handleLogout}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          libraryId={libraryId}
          features={features}
        />

        {/* Main Container */}
        <div className="min-h-dvh lg:pl-[256px]">
          {/* Sticky Header */}
          <AdminHeader
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            globalSearch={globalSearch}
            onSearchChange={setGlobalSearch}
            initials={initials}
            libraryId={libraryId}
          />

          {/* Content Area */}
          <main className="mx-auto max-w-[1440px] px-4 py-7 sm:px-8 sm:py-9">
            {/* Breadcrumbs */}
            <div className="mb-7 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2">
                <LibraryBig aria-hidden="true" size={15} className="text-[#d5f477]" />
                <span className="font-semibold text-white">
                  {activeLibrary?.name || 'Library workspace'}
                </span>
                <ChevronRight aria-hidden="true" size={14} className="text-neutral-600" />
                <span className="font-medium text-neutral-400">{sectionTitle}</span>
              </div>
              <Link
                to="/create-library"
                className="text-xs font-medium text-[#d5f477] hover:underline flex items-center gap-1"
              >
                Switch workspace ↗
              </Link>
            </div>

            {/* Heading (hidden in agent view or locked view) */}
            {activeSection !== 'agent' && isPermitted(activeSection) && (
              <div className="mb-7">
                <h1 className="text-[28px] font-bold tracking-tight text-white sm:text-[34px]">
                  {sectionTitle}
                </h1>
                <p className="mt-2 text-sm text-neutral-400">{sectionDescription}</p>
              </div>
            )}

            {/* Sub-route section, FeatureLocked view, or default OverviewPage */}
            {!isPermitted(activeSection) ? (
              <FeatureLocked
                sectionTitle={sectionTitle}
                planName={subscriptionData?.subscription_type}
              />
            ) : outlet ? (
              <Outlet context={adminContext} />
            ) : (
              <OverviewPage />
            )}
          </main>
        </div>

        {/* Modals */}
        <EditStudentModal
          student={editingStudent}
          isOpen={Boolean(editingStudent)}
          onClose={() => setEditingStudent(null)}
          onUpdate={handleUpdateStudent}
        />

        <EditBookModal
          book={editingBook}
          isOpen={Boolean(editingBook)}
          onClose={() => setEditingBook(null)}
          onUpdate={handleUpdateBook}
        />

        <AssignBookModal
          isOpen={isAssignModalOpen}
          onClose={() => {
            setIsAssignModalOpen(false)
            setSelectedBookForAssign(null)
            setSelectedStudentForAssign(null)
          }}
          books={books}
          students={students}
          selectedBook={selectedBookForAssign}
          selectedStudent={selectedStudentForAssign}
          onAssign={handleAssignBook}
        />
      </div>
    </AdminContext.Provider>
  )
}
