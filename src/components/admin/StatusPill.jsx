export default function StatusPill({ children, positive = true }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
        positive
          ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
          : 'bg-white/[0.06] text-neutral-400 border-white/10'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${positive ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-neutral-500'}`}
      />
      {children}
    </span>
  )
}
