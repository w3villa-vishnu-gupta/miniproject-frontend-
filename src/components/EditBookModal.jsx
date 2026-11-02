import { useState, useEffect } from 'react'
import { X, BookOpen, User, Tag, Layers, BookmarkCheck, FileText } from 'lucide-react'

export default function EditBookModal({ book, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    copies: 1,
    issued_copies: 0,
    status: 'Available',
    description: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title || '',
        author: book.author || '',
        category: book.category || '',
        copies: book.copies ?? 1,
        issued_copies: book.issued_copies ?? 0,
        status: book.status || 'Available',
        description: book.description || '',
      })
      setError('')
    }
  }, [book])

  if (!isOpen || !book) return null

  function handleChange(e) {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }))
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setError('')

    if (formData.issued_copies > formData.copies) {
      setError('Issued copies cannot exceed total copies.')
      return
    }

    const updatedBookData = {
      id: book.id,
      library_id: book.library_id,
      title: formData.title.trim(),
      author: formData.author.trim(),
      category: formData.category.trim(),
      copies: Math.max(1, Number(formData.copies) || 1),
      issued_copies: Math.max(0, Number(formData.issued_copies) || 0),
      status: formData.status,
      description: formData.description.trim() || null,
    }

    try {
      setSaving(true)
      if (onUpdate) {
        await onUpdate(updatedBookData)
      }
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to update book.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-book-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#14161b] p-6 shadow-2xl transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#d5f477]/10 text-[#d5f477] border border-[#d5f477]/20">
              <BookOpen size={18} />
            </div>
            <div>
              <h2 id="edit-book-modal-title" className="text-lg font-semibold text-white">
                Edit Book Details
              </h2>
              <p className="text-xs text-neutral-400">Update book copies, issued count, and info</p>
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
        <form onSubmit={handleUpdate} className="mt-5 space-y-4">
          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <BookOpen size={13} className="text-neutral-500" />
              Book Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <User size={13} className="text-neutral-500" />
                Author <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <Tag size={13} className="text-neutral-500" />
                Category <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <Layers size={13} className="text-neutral-500" />
                Total Copies
              </label>
              <input
                type="number"
                name="copies"
                min="1"
                value={formData.copies}
                onChange={handleChange}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <Layers size={13} className="text-amber-400" />
                Issued Copies
              </label>
              <input
                type="number"
                name="issued_copies"
                min="0"
                value={formData.issued_copies}
                onChange={handleChange}
                required
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-amber-300 outline-none transition focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
                <BookmarkCheck size={13} className="text-neutral-500" />
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
              >
                <option value="Available" className="bg-[#121418] text-white">Available</option>
                <option value="Issued" className="bg-[#121418] text-white">Issued</option>
                <option value="Reserved" className="bg-[#121418] text-white">Reserved</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-neutral-300">
              <FileText size={13} className="text-neutral-500" />
              Description
            </label>
            <textarea
              name="description"
              rows={3}
              value={formData.description}
              onChange={handleChange}
              placeholder="Book overview or notes..."
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-1 focus:ring-[#d5f477]"
            />
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
              disabled={saving}
              className="rounded-lg bg-[#d5f477] px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#c5e662] disabled:opacity-60 transition cursor-pointer"
            >
              {saving ? 'Updating…' : 'Update Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
