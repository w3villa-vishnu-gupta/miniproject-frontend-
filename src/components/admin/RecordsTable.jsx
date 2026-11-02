import { useMemo } from 'react'
import { Phone, MapPin, BookmarkCheck, Pencil, Trash2, RotateCcw } from 'lucide-react'
import StatusPill from './StatusPill'

function getPaymentState(student) {
  const today = new Date()
  const lastPayment = student.last_payment_date ? new Date(student.last_payment_date) : null
  if (
    lastPayment &&
    lastPayment.getMonth() === today.getMonth() &&
    lastPayment.getFullYear() === today.getFullYear()
  )
    return 'Paid'
  if (student.payment_start_month) {
    const startDay = new Date(student.payment_start_month).getDate()
    const dueDate = new Date(today.getFullYear(), today.getMonth(), startDay)
    const daysUntilDue = Math.ceil((dueDate - today) / 86400000)
    if (daysUntilDue >= 0 && daysUntilDue <= 7) return 'Due soon'
  }
  return 'Unpaid'
}

export default function RecordsTable({
  activeSection,
  search,
  students = [],
  books = [],
  assignments = [],
  loading,
  onEditStudent,
  onDeleteStudent,
  onAssignStudent,
  onEditBook,
  onDeleteBook,
  onAssignBook,
  onReturnBook,
  onDeleteAssignment,
}) {
  const isBooks = activeSection === 'books'
  const isAssignments = activeSection === 'assignments' || activeSection === 'book-issues'
  const records = isBooks
    ? books
    : isAssignments
      ? assignments
      : activeSection === 'alumni'
        ? students.filter((student) => student.alumini === true || student.alumini === 'true')
        : activeSection === 'students'
          ? students.filter((student) => student.alumini !== true && student.alumini !== 'true')
          : students

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return records

    return records.filter((record) =>
      Object.values(record).some((value) => String(value).toLowerCase().includes(query)),
    )
  }, [records, search])

  return (
    <div className="overflow-x-auto">
      {isBooks ? (
        <table className="w-full min-w-[700px] text-left text-sm">
          <thead className="border-y border-white/[0.08] bg-[#111317] text-xs font-medium text-neutral-400">
            <tr>
              <th scope="col" className="py-3.5 pr-4 pl-4">Book</th>
              <th scope="col" className="px-4 py-3.5">Category</th>
              <th scope="col" className="px-4 py-3.5">Total Copies</th>
              <th scope="col" className="px-4 py-3.5">Issued</th>
              <th scope="col" className="px-4 py-3.5">Available</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="py-3.5 pl-4 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredRecords.map((book) => {
              const available = Math.max(0, (Number(book.copies) || 1) - (Number(book.issued_copies) || 0))
              return (
                <tr key={book.id || book.title} className="text-neutral-300 transition hover:bg-white/[0.03]">
                  <td className="py-4 pr-4 pl-4 max-w-[260px]">
                    <p className="font-semibold text-white truncate">{book.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{book.author}</p>
                    {book.description && (
                      <p className="mt-1 text-xs text-neutral-500 line-clamp-1 italic">
                        {book.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-4 text-neutral-400">
                    <span className="inline-block rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-medium text-neutral-300">
                      {book.category}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-white font-medium">{book.copies ?? 1}</td>
                  <td className="px-4 py-4 text-amber-300 font-medium">{book.issued_copies ?? 0}</td>
                  <td className="px-4 py-4 text-emerald-400 font-medium">{available}</td>
                  <td className="px-4 py-4">
                    <StatusPill positive={book.status ? book.status.toLowerCase() === 'available' : true}>
                      {book.status || 'Available'}
                    </StatusPill>
                  </td>
                  <td className="py-4 pl-4 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      {onAssignBook && (
                        <button
                          type="button"
                          onClick={() => onAssignBook(book)}
                          disabled={available <= 0}
                          title={available <= 0 ? 'No copies available to assign' : 'Assign to student'}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <BookmarkCheck size={12} />
                          Assign
                        </button>
                      )}
                      {onEditBook && (
                        <button
                          type="button"
                          onClick={() => onEditBook(book)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-[#d5f477]/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>
                      )}
                      {onDeleteBook && (
                        <button
                          type="button"
                          onClick={() => onDeleteBook(book)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : isAssignments ? (
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-y border-white/[0.08] bg-[#111317] text-xs font-medium text-neutral-400">
            <tr>
              <th scope="col" className="py-3.5 pr-4 pl-4">Book</th>
              <th scope="col" className="px-4 py-3.5">Assigned To</th>
              <th scope="col" className="px-4 py-3.5">Issue Date</th>
              <th scope="col" className="px-4 py-3.5">Return Due Date</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="py-3.5 pl-4 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredRecords.map((assignment) => {
              const isReturned = assignment.status === 'returned'
              return (
                <tr key={assignment.id} className="text-neutral-300 transition hover:bg-white/[0.03]">
                  <td className="py-4 pr-4 pl-4 max-w-[240px]">
                    <p className="font-semibold text-white truncate">{assignment.book_title}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{assignment.book_author}</p>
                    {assignment.book_category && (
                      <span className="mt-1 inline-block rounded bg-white/5 px-2 py-0.5 text-[10px] text-neutral-400 border border-white/5">
                        {assignment.book_category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-4 max-w-[220px]">
                    <p className="font-semibold text-neutral-200 truncate">{assignment.student_name}</p>
                    <p className="mt-0.5 text-xs text-neutral-400">{assignment.student_phone || assignment.student_email || '—'}</p>
                  </td>
                  <td className="px-4 py-4 text-neutral-300 font-mono text-xs">
                    {assignment.assigned_date}
                  </td>
                  <td className="px-4 py-4 text-amber-300 font-mono text-xs font-medium">
                    {assignment.return_date}
                  </td>
                  <td className="px-4 py-4">
                    <StatusPill positive={isReturned}>
                      {isReturned ? 'Returned' : 'Issued'}
                    </StatusPill>
                  </td>
                  <td className="py-4 pl-4 pr-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!isReturned && onReturnBook && (
                        <button
                          type="button"
                          onClick={() => onReturnBook(assignment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 hover:text-emerald-300 transition cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          Return Book
                        </button>
                      )}
                      {onDeleteAssignment && (
                        <button
                          type="button"
                          onClick={() => onDeleteAssignment(assignment)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
                        >
                          <Trash2 size={12} />
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-y border-white/[0.08] bg-[#111317] text-xs font-medium text-neutral-400">
            <tr>
              <th scope="col" className="py-3.5 pr-4 pl-4">Student</th>
              <th scope="col" className="px-4 py-3.5">Phone number</th>
              <th scope="col" className="px-4 py-3.5">Address</th>
              <th scope="col" className="px-4 py-3.5">Status</th>
              <th scope="col" className="px-4 py-3.5">Payment</th>
              <th scope="col" className="py-3.5 pl-4 pr-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.05]">
            {filteredRecords.map((student, index) => (
              <tr
                key={student.id ?? student.student_id ?? student.email ?? student.name ?? index}
                className="text-neutral-300 transition hover:bg-white/[0.03]"
              >
                <td className="py-4 pr-4 pl-4">
                  <p className="font-semibold text-white">
                    {student.name || student.full_name || student.student_name || 'Unnamed student'}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">{student.email || student.email_address || '—'}</p>
                </td>
                <td className="px-4 py-4 text-neutral-300">
                  <p className="flex items-center gap-1.5 text-sm text-neutral-200">
                    <Phone aria-hidden="true" size={13} className="text-neutral-500 shrink-0" />
                    <span>{student.phone || student.phone_number || '—'}</span>
                  </p>
                </td>
                <td className="px-4 py-4 text-neutral-400">
                  <p className="flex items-center gap-1.5 text-sm text-neutral-300">
                    <MapPin aria-hidden="true" size={13} className="text-neutral-500 shrink-0" />
                    <span>{student.address || '—'}</span>
                  </p>
                </td>
                <td className="px-4 py-4">
                  <StatusPill positive={student.status ? student.status.toLowerCase() === 'active' : true}>
                    {student.status || 'Active'}
                  </StatusPill>
                </td>
                <td className="px-4 py-4">
                  <StatusPill positive={getPaymentState(student) === 'Paid'}>
                    {getPaymentState(student)}
                  </StatusPill>
                </td>
                <td className="py-4 pl-4 pr-4 text-right">
                  <div className="flex justify-end gap-2">
                    {onAssignStudent && (
                      <button
                        type="button"
                        onClick={() => onAssignStudent(student)}
                        disabled={student.alumini === true || student.alumini === 'true'}
                        title="Assign book to student"
                        className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-1.5 text-xs font-medium text-purple-300 hover:bg-purple-500/20 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <BookmarkCheck size={12} />
                        Assign
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditStudent && onEditStudent(student)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-[#d5f477]/50 hover:bg-white/10 hover:text-white transition cursor-pointer"
                    >
                      <Pencil size={12} />
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteStudent && onDeleteStudent(student)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1.5 text-xs font-medium text-red-400 hover:bg-red-500/20 hover:text-red-300 transition cursor-pointer"
                    >
                      <Trash2 size={12} />
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {loading && (
        <p className="py-12 text-center text-sm text-neutral-400">Loading records...</p>
      )}
      {!loading && filteredRecords.length === 0 && (
        <div className="py-12 text-center text-sm text-neutral-400 space-y-1">
          <p>
            No {isBooks ? 'books' : isAssignments ? 'book assignments' : activeSection === 'alumni' ? 'alumni' : 'students'}{' '}
            {search ? 'match your search.' : 'found.'}
          </p>
          {isBooks && !search && (
            <p className="text-xs text-neutral-500">Click &ldquo;Add book&rdquo; to add your first book.</p>
          )}
          {isAssignments && !search && (
            <p className="text-xs text-neutral-500">Click &ldquo;Assign book&rdquo; to issue a book to a student.</p>
          )}
        </div>
      )}
    </div>
  )
}
