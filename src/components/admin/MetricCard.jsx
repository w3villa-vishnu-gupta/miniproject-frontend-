import { BookOpen, Users, GraduationCap } from 'lucide-react'

export function MetricCard({ label, value, detail, icon: Icon, accent }) {
  return (
    <article className="rounded-2xl border border-white/[0.08] bg-[#14161b] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.3)] transition hover:border-white/15">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-400">{label}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-white">{value}</p>
        </div>
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${accent}`}>
          <Icon aria-hidden="true" size={21} />
        </span>
      </div>
      <p className="mt-4 text-xs text-neutral-500">{detail}</p>
    </article>
  )
}

export default function AdminMetricCards({ books = [], students = [], studentsLoading = false }) {
  return (
    <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <MetricCard
        label="Books in collection"
        value={books.reduce((sum, b) => sum + (Number(b.copies) || 1), 0)}
        detail={`${books.length} unique titles`}
        icon={BookOpen}
        accent="bg-blue-500/15 text-blue-400 border border-blue-500/20"
      />
      <MetricCard
        label="Student members"
        value={
          studentsLoading
            ? '…'
            : students.filter((student) => student.alumini !== true && student.alumini !== 'true').length
        }
        detail="Current registered students"
        icon={Users}
        accent="bg-[#d5f477]/15 text-[#d5f477] border border-[#d5f477]/20"
      />
      <MetricCard
        label="Books currently issued"
        value={books.reduce((sum, b) => sum + (Number(b.issued_copies) || (b.status === 'Issued' ? 1 : 0)), 0)}
        detail="Copies on loan to students"
        icon={GraduationCap}
        accent="bg-purple-500/15 text-purple-400 border border-purple-500/20"
      />
    </div>
  )
}
