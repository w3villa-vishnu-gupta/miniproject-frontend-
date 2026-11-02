import { useState } from 'react'

export default function SettingsPanel() {
  const [loanPeriod, setLoanPeriod] = useState('14')
  const [dailyFine, setDailyFine] = useState('0.50')
  const [emailReminders, setEmailReminders] = useState(true)
  const [saved, setSaved] = useState(false)

  function handleSubmit(event) {
    event.preventDefault()
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl space-y-5">
      <section className="rounded-2xl border border-white/[0.08] bg-[#14161b] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:p-6">
        <div className="border-b border-white/[0.08] pb-4">
          <h2 className="font-semibold text-white">Circulation</h2>
          <p className="mt-1 text-sm text-neutral-400">Set the default borrowing rules for your library.</p>
        </div>
        <div className="grid gap-5 pt-5 sm:grid-cols-2">
          <label className="block text-sm font-medium text-neutral-300">
            Loan period
            <span className="relative mt-2 block">
              <input
                type="number"
                min="1"
                max="90"
                required
                value={loanPeriod}
                onChange={(event) => {
                  setLoanPeriod(event.target.value)
                  setSaved(false)
                }}
                className="w-full rounded-lg border border-white/10 bg-[#191c22] px-3.5 py-2.5 pr-16 text-sm font-normal text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-normal text-neutral-500">
                days
              </span>
            </span>
          </label>
          <label className="block text-sm font-medium text-neutral-300">
            Late return fee
            <span className="relative mt-2 block">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-normal text-neutral-500">
                $
              </span>
              <input
                type="number"
                min="0"
                step="0.25"
                required
                value={dailyFine}
                onChange={(event) => {
                  setDailyFine(event.target.value)
                  setSaved(false)
                }}
                className="w-full rounded-lg border border-white/10 bg-[#191c22] py-2.5 pl-8 pr-3.5 text-sm font-normal text-white outline-none transition focus:border-[#d5f477] focus:ring-2 focus:ring-[#d5f477]/20"
              />
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-white/[0.08] bg-[#14161b] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] sm:p-6">
        <h2 className="font-semibold text-white">Notifications</h2>
        <p className="mt-1 text-sm text-neutral-400">Choose which updates your library sends.</p>
        <label className="mt-5 flex cursor-pointer items-start justify-between gap-4 border-t border-white/[0.08] pt-5">
          <span>
            <span className="block text-sm font-medium text-neutral-300">Email due-date reminders</span>
            <span className="mt-1 block text-sm text-neutral-500">
              Remind students before their borrowed books are due.
            </span>
          </span>
          <input
            type="checkbox"
            checked={emailReminders}
            onChange={(event) => {
              setEmailReminders(event.target.checked)
              setSaved(false)
            }}
            className="mt-0.5 h-4 w-4 accent-[#d5f477]"
          />
        </label>
      </section>

      <div className="flex items-center gap-4">
        <button
          type="submit"
          className="rounded-full bg-[#d5f477] px-6 py-2.5 text-sm font-semibold text-neutral-950 shadow-sm transition hover:bg-[#c5e662] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d5f477]"
        >
          Save settings
        </button>
        {saved && <p role="status" className="text-sm text-emerald-400 font-medium">Settings saved.</p>}
      </div>
    </form>
  )
}
