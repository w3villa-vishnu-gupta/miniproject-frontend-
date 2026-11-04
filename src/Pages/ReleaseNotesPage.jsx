import { ArrowLeft, ArrowUpRight, BookOpen, Bot, Cloud, Code2, ShieldCheck, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

const highlights = [
  {
    icon: BookOpen,
    title: 'Library and student management',
    description: 'Backend foundation for library-owner workflows, including student records and library-scoped data.',
  },
  {
    icon: BookOpen,
    title: 'Book catalog and circulation',
    description: 'AI-agent tools to create books, look up books by title or ID, list the catalog, browse by category, retrieve descriptions, and issue books to students.',
  },
  {
    icon: Bot,
    title: 'AI assistant architecture',
    description: 'A LibraryHub root assistant with dedicated student and book agents, routing requests to the relevant specialist.',
  },
  {
    icon: ShieldCheck,
    title: 'Authentication and account flows',
    description: 'Backend support for JWT-based access and social sign-in flows, including Google and Facebook OAuth. Magic-link and email-related flows are also present.',
  },
  {
    icon: Sparkles,
    title: 'Chat improvements',
    description: 'Chat titles are generated asynchronously in the background, avoiding a hardcoded localhost service loopback in the chat request path.',
  },
  {
    icon: Cloud,
    title: 'Configuration and deployment',
    description: 'Render deployment configuration, Docker support, runtime and dependency setup, frontend-origin CORS configuration, and environment-driven frontend redirects.',
  },
  {
    icon: Code2,
    title: 'Code organization',
    description: 'The backend is organized into focused areas for authentication, connections, controllers, routers, schemas, services, agents, tools, and skills.',
  },
]

export default function ReleaseNotesPage() {
  return (
    <main className="min-h-screen bg-[#0b0d0f] text-white">
      <header className="border-b border-white/[0.08]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#d5f477] text-lg font-bold text-black">L</span>
            <span className="text-lg font-semibold tracking-tight">Library<span className="text-[#d5f477]">Hub</span></span>
          </Link>
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white">
            <ArrowLeft size={16} /> Back to home
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 sm:pt-24">
        <div className="max-w-3xl">
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#d5f477]/20 bg-[#d5f477]/[0.07] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-[#d5f477]">
            <Sparkles size={13} /> Product updates
          </p>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl">Release notes</h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-neutral-400 sm:text-lg">
            What’s new in LibraryHub — product improvements, capabilities, and technical updates.
          </p>
        </div>

        <article className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-[#111417]">
          <div className="border-b border-white/[0.08] p-6 sm:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-[#d5f477] px-3 py-1 text-xs font-bold text-neutral-950">v0.1.0</span>
              <span className="text-sm text-neutral-500">November 4, 2026</span>
              <span className="text-sm text-neutral-600">·</span>
              <span className="text-sm text-neutral-500">Initial development release</span>
            </div>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight sm:text-3xl">Introducing LibraryHub</h2>
            <p className="mt-3 max-w-3xl leading-7 text-neutral-400">
              The initial development release of LibraryHub, a multi-tenant library management platform with a FastAPI backend and an AI-assisted library workflow.
            </p>
          </div>

          <div className="p-6 sm:p-9">
            <h3 className="mb-6 text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Highlights</h3>
            <div className="grid gap-6 sm:grid-cols-2">
              {highlights.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#d5f477]/15 bg-[#d5f477]/[0.07] text-[#d5f477]">
                    <Icon size={19} />
                  </span>
                  <div>
                    <h4 className="font-medium text-white">{title}</h4>
                    <p className="mt-1.5 text-sm leading-6 text-neutral-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-6 border-t border-white/[0.08] pt-8 md:grid-cols-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Technical notes</h3>
                <ul className="mt-4 space-y-2 text-sm leading-6 text-neutral-300">
                  <li><span className="text-neutral-500">Backend:</span> Python 3.13, FastAPI, SQLAlchemy, PostgreSQL</li>
                  <li><span className="text-neutral-500">AI orchestration:</span> Google ADK with specialized student and book agents</li>
                  <li><span className="text-neutral-500">Configuration:</span> Runtime settings and credentials are managed through environment variables. Never commit secrets.</li>
                  <li><span className="text-neutral-500">Frontend:</span> Maintained separately in the miniproject-frontend- repository.</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-neutral-500">Release notes</h3>
                <p className="mt-4 text-sm leading-6 text-neutral-400">
                  This is an early development release. Configure the required environment variables and database schema before deployment. Verify OAuth providers, email delivery, payment configuration, and production database permissions in the target environment before enabling those flows for end users.
                </p>
                <a
                  href="https://github.com/w3villa-vishnu-gupta/miniproject-backend/blob/main/RELEASE_NOTES.md"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#d5f477] transition hover:text-[#e5ff9c]"
                >
                  View source release notes <ArrowUpRight size={15} />
                </a>
              </div>
            </div>
          </div>
        </article>
      </section>

      <footer className="border-t border-white/[0.08] px-6 py-6 text-center text-xs text-neutral-600">
        © 2026 LibraryHub · Smart library management, powered by AI.
      </footer>
    </main>
  )
}
