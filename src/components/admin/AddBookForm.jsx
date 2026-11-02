export default function AddBookForm({
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
        <h3 className="font-semibold text-white">Add a book</h3>
        <p className="mt-1 text-sm text-neutral-400">
          Book will be stored in {libraryName || `library #${libraryId}`}.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-neutral-300">
          Book title <span className="text-red-400">*</span>
          <input
            name="title"
            type="text"
            required
            placeholder="e.g. The Pragmatic Programmer"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
          />
        </label>
        <label className="text-sm font-medium text-neutral-300">
          Author <span className="text-red-400">*</span>
          <input
            name="author"
            type="text"
            required
            placeholder="e.g. David Thomas, Andrew Hunt"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
          />
        </label>
        <label className="text-sm font-medium text-neutral-300">
          Category / Genre <span className="text-red-400">*</span>
          <input
            name="category"
            type="text"
            required
            placeholder="e.g. Technology, Design, Fiction"
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
          />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-sm font-medium text-neutral-300">
            Total Copies
            <input
              name="copies"
              type="number"
              min="1"
              defaultValue="1"
              required
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
            />
          </label>
          <label className="text-sm font-medium text-neutral-300">
            Issued Copies
            <input
              name="issued_copies"
              type="number"
              min="0"
              defaultValue="0"
              required
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-amber-300 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20"
            />
          </label>
          <label className="text-sm font-medium text-neutral-300">
            Status
            <select
              name="status"
              defaultValue="Available"
              className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
            >
              <option value="Available" className="bg-[#121418] text-white">Available</option>
              <option value="Issued" className="bg-[#121418] text-white">Issued</option>
              <option value="Reserved" className="bg-[#121418] text-white">Reserved</option>
            </select>
          </label>
        </div>
      </div>
      <div className="mt-3">
        <label className="text-sm font-medium text-neutral-300">
          Description
          <textarea
            name="description"
            rows={3}
            placeholder="Add book synopsis, overview or notes..."
            className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#121418] px-3 py-2.5 text-sm font-normal text-white placeholder:text-neutral-500 outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
          />
        </label>
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
          {saving ? 'Adding…' : 'Save book'}
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
