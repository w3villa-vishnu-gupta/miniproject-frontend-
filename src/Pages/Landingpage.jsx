import { useNavigate } from "react-router-dom";

export default function LandingPage() {

  const navigate = useNavigate();

  return (
    <main className="h-dvh overflow-hidden bg-[#0b0d0f] text-white flex flex-col">
      <nav className="h-[76px] shrink-0 px-6 md:px-14 flex items-center justify-between border-b border-white/[0.07]">
        <a href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-[#d5f477] text-black grid place-items-center text-xl font-bold">
            L
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Library<span className="text-[#d5f477]">Hub</span>
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-[#92969d]">
          <a href="#features" className="hover:text-white transition">Features</a>
          <button onClick={() => navigate('/pricing')} className="hover:text-white transition cursor-pointer">Pricing</button>
          <a href="#about" className="hover:text-white transition">About</a>
          <a href="#contact" className="hover:text-white transition">Contact</a>
        </div>

        <button onClick={() => navigate('/login')} className="rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white hover:text-black transition">
          Sign in <span className="ml-2">↗</span>
        </button>
      </nav>

      <section className="flex-1 min-h-0 max-w-[1400px] w-full mx-auto px-6 md:px-14 grid md:grid-cols-[1.1fr_0.9fr] items-center gap-10 lg:gap-20">
        <div className="py-8">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#d5f477]">
            <span className="w-8 h-px bg-[#d5f477]" />
            The modern library workspace
          </div>

          <h1 className="mt-8 text-[clamp(3rem,6.3vw,6rem)] font-medium leading-[1.04] tracking-[-0.065em]">
            Every book.
            <br />
            Every member.
            <br />
            <span className="text-[#d5f477]">In one place.</span>
          </h1>

          <p className="mt-7 max-w-[450px] text-[15px] md:text-base leading-7 text-[#92969d]">
            A smarter way to run your library. Organize your
            collection, manage memberships and keep every
            transaction effortlessly in sync.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <button onClick={() => navigate('/register')} className="group flex items-center gap-5 rounded-full bg-[#d5f477] px-6 py-3.5 text-sm font-semibold text-[#10120b] hover:bg-[#e4ff91] transition">
              Get started
              <span className="text-lg transition-transform group-hover:translate-x-1">↗</span>
            </button>

            <a href="#features" className="px-4 py-3 text-sm text-[#c0c3c7] hover:text-white transition">
              Explore the platform <span className="ml-1">→</span>
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 text-xs text-[#777c83]">
            <span className="flex -space-x-1.5">
              <span className="h-2 w-2 rounded-full bg-[#d5f477]" />
              <span className="h-2 w-2 rounded-full bg-[#d5f477]/50" />
              <span className="h-2 w-2 rounded-full bg-[#d5f477]/20" />
            </span>
            Designed for simpler library operations
          </div>
        </div>

        <div className="hidden md:block">
          <div className="rounded-[24px] border border-white/[0.09] bg-[#111417] p-5 lg:p-7 shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div>
                <p className="text-xs text-[#777c83]">YOUR WORKSPACE</p>
                <h2 className="mt-2 text-lg font-medium">Library overview</h2>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#aeb3b8]">
                Preview
              </span>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                ["01", "Total books", "2,450"],
                ["02", "Members", "680"],
                ["03", "Currently issued", "124"],
                ["04", "Pending returns", "08"],
              ].map(([id, label, value]) => (
                <div key={id} className="rounded-2xl border border-white/[0.07] bg-[#161a1e] p-4 lg:p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#858b92]">{label}</span>
                    <span className="text-[10px] text-[#60666d]">{id}</span>
                  </div>
                  <p className="mt-5 text-3xl font-medium tracking-tight">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-white/[0.07] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Library activity</p>
                  <p className="mt-1 text-xs text-[#777c83]">A quick look at your workflow</p>
                </div>
                <span className="text-[#d5f477] text-xl">↗</span>
              </div>

              <div className="mt-5 flex items-end gap-2 h-12">
                {[35, 55, 42, 75, 48, 90, 63, 100, 70, 82, 50, 72].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className={`flex-1 rounded-t-sm ${i === 7 ? "bg-[#d5f477]" : "bg-white/[0.12]"}`}
                  />
                ))}
              </div>
              <div className="mt-3 flex justify-between text-[10px] text-[#626970]">
                <span>Activity visualization</span>
                <span>Illustrative data</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="shrink-0 border-t border-white/[0.07] px-6 md:px-14 py-5 flex justify-between items-center text-[11px] text-[#696f76]">
        <span>© 2026 LibraryHub</span>
        <span>Thoughtfully built for libraries.</span>
      </footer>
    </main>
  );
}
