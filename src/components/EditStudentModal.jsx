import { useState, useEffect } from 'react'
import { X, User, Mail, Phone, MapPin, Pencil, Activity, GraduationCap, Calendar } from 'lucide-react'

export default function EditStudentModal({ student, isOpen, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    status: 'active',
    alumini: false,
    payment_start_month: '',
    last_payment_date: '',
  })

  // Pre-fill the form whenever the selected student changes
  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        address: student.address || '',
        status: student.status || 'active',
        alumini: Boolean(student.alumini),
        payment_start_month: student.payment_start_month ? String(student.payment_start_month).slice(0, 10) : '',
        last_payment_date: student.last_payment_date ? String(student.last_payment_date).slice(0, 10) : '',
      })
    }
  }, [student])

  if (!isOpen || !student) return null

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  function handleMarkPaidToday() {
    const today = new Date().toISOString().slice(0, 10)
    setFormData((prev) => ({
      ...prev,
      last_payment_date: today,
    }))
  }

  function handleUpdate(e) {
    e.preventDefault()

    const updatedStudentData = {
      id: student.id,
      library_id: student.library_id,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      address: formData.address.trim() || null,
      status: formData.status,
      alumini: formData.alumini === 'true' || formData.alumini === true,
      payment_start_month: formData.payment_start_month || null,
      last_payment_date: formData.last_payment_date || null,
    }

    if (onUpdate) {
      onUpdate(updatedStudentData)
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-[#16161a] p-6 text-white shadow-2xl z-10 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-white/10 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#d5f477]/15 text-[#d5f477]">
              <Pencil size={18} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-white">Edit Student</h2>
              <p className="text-xs text-neutral-400">
                Updating records for {student.name || 'Student'} (ID: #{student.id})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-neutral-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label htmlFor="edit-name" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Full name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <User size={15} />
              </span>
              <input
                id="edit-name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Full name"
                className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-email" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Email address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <Mail size={15} />
              </span>
              <input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-phone" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Phone number <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <Phone size={15} />
              </span>
              <input
                id="edit-phone"
                name="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone number"
                className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
            </div>
          </div>

          <div>
            <label htmlFor="edit-address" className="block text-xs font-medium text-neutral-300 mb-1.5">
              Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <MapPin size={15} />
              </span>
              <input
                id="edit-address"
                name="address"
                type="text"
                value={formData.address}
                onChange={handleChange}
                placeholder="Student address"
                className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
            </div>
          </div>

          {/* Dropdowns for Status and Alumni */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-status" className="block text-xs font-medium text-neutral-300 mb-1.5">
                Status
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Activity size={15} />
                </span>
                <select
                  id="edit-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-8 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
                >
                  <option value="active" className="bg-[#1e1e24] text-white">Active</option>
                  <option value="inactive" className="bg-[#1e1e24] text-white">Inactive</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="edit-alumini" className="block text-xs font-medium text-neutral-300 mb-1.5">
                Alumni
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <GraduationCap size={15} />
                </span>
                <select
                  id="edit-alumini"
                  name="alumini"
                  value={String(formData.alumini)}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-8 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
                >
                  <option value="false" className="bg-[#1e1e24] text-white">No (Current Student)</option>
                  <option value="true" className="bg-[#1e1e24] text-white">Yes (Alumnus)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="edit-payment-start" className="block text-xs font-medium text-neutral-300 mb-1.5">
                Payment Start Date
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Calendar size={15} />
                </span>
                <input
                  id="edit-payment-start"
                  name="payment_start_month"
                  type="date"
                  value={formData.payment_start_month}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="edit-last-payment" className="block text-xs font-medium text-neutral-300">
                  Last Payment Date
                </label>
                <button
                  type="button"
                  onClick={handleMarkPaidToday}
                  className="text-[11px] font-semibold text-[#d5f477] hover:underline cursor-pointer"
                >
                  Mark Paid Today
                </button>
              </div>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">
                  <Calendar size={15} />
                </span>
                <input
                  id="edit-last-payment"
                  name="last_payment_date"
                  type="date"
                  value={formData.last_payment_date}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-white/10 bg-[#1e1e24] py-2.5 pl-9 pr-3 text-sm text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
                />
              </div>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-white/10 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full bg-[#d5f477] px-5 py-2 text-sm font-semibold text-neutral-950 shadow-sm hover:bg-[#c5e662] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
            >
              Update student
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
