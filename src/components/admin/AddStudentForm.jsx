export default function AddStudentForm({
  onSubmit,
  saving,
  error,
  onCancel,
  libraryName,
  libraryId,
}) {
  return (
    <form
      onSubmit={onSubmit}
      className="mb-6 rounded-xl border border-white/10 bg-[#191c22] p-4 sm:p-5"
    >
      <div className="mb-4">
        <h3 className="font-semibold text-white">Add a student</h3>
        <p className="mt-1 text-sm text-neutral-400">
          Student will be added to {libraryName || `library #${libraryId}`}.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {[
          ['name', 'Full name', 'text', true],
          ['email', 'Email address', 'email', true],
          ['phone', 'Phone number', 'tel', true],
          ['address', 'Address', 'text', false],
          ['payment_start_month', 'Payment start date', 'date', false],
        ].map(([name, label, type, required]) => (
          <label key={name} className="text-sm font-medium text-neutral-300">
            {label}
            <input
              name={name}
              type={type}
              required={required}
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
            />
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#d5f477] px-5 py-2 text-sm font-semibold text-neutral-950 hover:bg-[#c5e662] disabled:opacity-60 transition cursor-pointer"
        >
          {saving ? 'Adding…' : 'Save student'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full px-4 py-2 text-sm font-medium text-neutral-400 hover:bg-white/10 hover:text-white transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
