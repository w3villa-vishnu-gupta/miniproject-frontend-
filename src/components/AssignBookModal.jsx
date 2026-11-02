import { useState, useEffect } from 'react'
import { X, BookOpen, User, Calendar, BookmarkCheck } from 'lucide-react'

function addOneMonth(dateStr) {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-').map(Number)
  const targetMonthIndex = m
  const expectedYear = targetMonthIndex > 11 ? y + Math.floor(targetMonthIndex / 12) : y
  const normalizedMonth = targetMonthIndex % 12
  const maxDays = new Date(expectedYear, normalizedMonth + 1, 0).getDate()
  const targetDay = Math.min(d, maxDays)
  const date = new Date(expectedYear, normalizedMonth, targetDay)
  const nextY = date.getFullYear()
  const nextM = String(date.getMonth() + 1).padStart(2, '0')
  const nextD = String(date.getDate()).padStart(2, '0')
  return `${nextY}-${nextM}-${nextD}`
}

export default function AssignBookModal({
  isOpen,
  onClose,
  books = [],
  students = [],
  selectedBook = null,
  selectedStudent = null,
  onAssign,
}) {
  const getTodayStr = () => new Date().toISOString().split('T')[0]

  const [bookId, setBookId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [assignedDate, setAssignedDate] = useState(getTodayStr())
  const [returnDate, setReturnDate] = useState(() => addOneMonth(new Date().toISOString().split('T')[0]))
  const [status, setStatus] = useState('issued')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      setBookId(selectedBook?.id ? String(selectedBook.id) : books[0]?.id ? String(books[0].id) : '')
      setStudentId(selectedStudent?.id ? String(selectedStudent.id) : students[0]?.id ? String(students[0].id) : '')
      const today = getTodayStr()
      setAssignedDate(today)
      setReturnDate(addOneMonth(today))
      setStatus('issued')
      setError('')
    }
  }, [isOpen, selectedBook, selectedStudent, books, students])

  if (!isOpen) return null

  // Active students only (not alumni)
  const activeStudents = students.filter((s) => s.alumini !== true && s.alumini !== 'true')
  const studentList = activeStudents.length > 0 ? activeStudents : students

  const currentBook = books.find((b) => String(b.id) === String(bookId)) || selectedBook
  const currentStudent = studentList.find((s) => String(s.id) === String(studentId)) || selectedStudent

  function handleAssignedDateChange(newDate) {
    setAssignedDate(newDate)
    if (newDate) {
      setReturnDate(addOneMonth(newDate))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!bookId) {
      setError('Please select a book to assign.')
      return
    }
    if (!studentId) {
      setError('Please select a student.')
      return
    }
    if (!assignedDate) {
      setError('Please specify the assignment date.')
      return
    }
    if (!returnDate) {
      setError('Please specify the return due date.')
      return
    }

    try {
      setSaving(true)
      await onAssign({
        book_id: Number(bookId),
        student_id: Number(studentId),
        assigned_date: assignedDate,
        return_date: returnDate,
        status: status || 'issued',
      })
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to assign book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assign-book-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14161b] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <BookmarkCheck size={18} />
            </div>
            <div>
              <h2 id="assign-book-modal-title" className="text-lg font-semibold text-white">
                Issue / Assign Book
              </h2>
              <p className="text-xs text-neutral-400">Assign a catalog book copy to a registered student</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Book Select */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <BookOpen size={13} className="text-neutral-500" />
              Select Book <span className="text-red-400">*</span>
            </label>
            <select
              value={bookId}
              onChange={(e) => setBookId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
            >
              <option value="" disabled className="bg-[#121418] text-neutral-500">
                Choose a book...
              </option>
              {books.map((b) => {
                const avail = Math.max(0, (Number(b.copies) || 1) - (Number(b.issued_copies) || 0))
                return (
                  <option
                    key={b.id}
                    value={b.id}
                    disabled={avail <= 0}
                    className="bg-[#121418] text-white disabled:text-neutral-600"
                  >
                    {b.title} — by {b.author} ({avail} available of {b.copies || 1})
                  </option>
                )
              })}
            </select>
            {currentBook && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-neutral-400">
                {currentBook.category && (
                  <span className="rounded bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-[#d5f477] font-medium">
                    {currentBook.category}
                  </span>
                )}
                <span className="truncate">by {currentBook.author}</span>
                <span className="text-emerald-400 font-semibold ml-auto shrink-0">
                  {Math.max(0, (Number(currentBook.copies) || 1) - (Number(currentBook.issued_copies) || 0))} copies available
                </span>
              </div>
            )}
          </div>

          {/* Student Select */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <User size={13} className="text-neutral-500" />
              Assign To Student <span className="text-red-400">*</span>
            </label>
            <select
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              required
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
            >
              <option value="" disabled className="bg-[#121418] text-neutral-500">
                Choose a student...
              </option>
              {studentList.map((s) => (
                <option key={s.id} value={s.id} className="bg-[#121418] text-white">
                  {s.name} ({s.phone || s.email || `ID #${s.id}`})
                </option>
              ))}
            </select>
            {currentStudent && (
              <div className="mt-1.5 flex items-center gap-2 text-xs text-neutral-400">
                <span className="text-neutral-300 font-medium">{currentStudent.name}</span>
                <span className="text-neutral-500">•</span>
                <span>{currentStudent.phone || currentStudent.email || `Student #${currentStudent.id}`}</span>
              </div>
            )}
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <Calendar size={13} className="text-neutral-500" />
                Issue Date (Start) <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                value={assignedDate}
                onChange={(e) => handleAssignedDateChange(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                  <Calendar size={13} className="text-amber-400" />
                  Return Due Date (End) <span className="text-red-400">*</span>
                </label>
                <span className="text-[10px] text-[#d5f477] font-medium">+1 Month</span>
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              />
            </div>
          </div>

          {/* Status Selection */}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <BookmarkCheck size={13} className="text-neutral-500" />
              Assignment Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
            >
              <option value="issued" className="bg-[#121418] text-white">Issued</option>
              <option value="reserved" className="bg-[#121418] text-white">Reserved</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-white/10 bg-transparent px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-white/5 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || books.length === 0 || students.length === 0}
              className="rounded-lg bg-[#d5f477] px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#c5e662] disabled:opacity-50 transition cursor-pointer"
            >
              {saving ? 'Assigning…' : 'Issue Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
