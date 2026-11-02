import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  BookOpen,
  Users,
  GraduationCap,
  Sparkles,
  History,
  RotateCcw,
  X,
  MessageSquare,
  Plus,
  Send,
} from 'lucide-react'
import { api } from '../../Services/api'
import LibraryMascot from './LibraryMascot'

export default function AgentPanel({ students: _students = [], books: _books = [], activeLibrary, owner }) {
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const [messages, setMessages] = useState([])
  const [sessions, setSessions] = useState([])
  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const chatEndRef = useRef(null)

  const userId = useMemo(() => {
    if (owner?.id) return String(owner.id)
    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]))
        if (payload?.sub) return String(payload.sub)
      }
    } catch {}
    return '3'
  }, [owner])

  const [sessionId, setSessionId] = useState(() => {
    try {
      const stored = sessionStorage.getItem('library_chat_session')
      if (stored) return stored
      const newId = typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `session_${Date.now()}`
      sessionStorage.setItem('library_chat_session', newId)
      return newId
    } catch {
      return `session_${Date.now()}`
    }
  })

  function cleanAgentText(value) {
    return String(value || '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/\*{1,3}|_{1,3}|#{1,6}\s?/g, '')
      .replace(/^\s*[-•]\s?/gm, '')
      .replace(/[ \t]+\n/g, '\n')
      .trim()
  }

  function formatUserDisplay(value) {
    return String(value || '')
      .replace(/\n?Current library ID:[\s\S]*$/i, '')
      .trim()
  }

  function formatSessionDate(ts) {
    if (!ts) return 'Previous chat'
    try {
      const date = new Date(ts * 1000)
      return date.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return 'Previous chat'
    }
  }

  const fetchSessions = useCallback(async () => {
    if (!userId) return []
    try {
      setLoadingSessions(true)
      const data = await api.get(`/sessions/${userId}`)
      const list = Array.isArray(data?.sessions) ? [...data.sessions] : []
      list.sort((a, b) => (b.last_update_time || 0) - (a.last_update_time || 0))

      if (list.length > 0) {
        try {
          const ids = list.map((s) => s.id)
          const titlesRes = await api.post('/get-titles', ids)
          if (titlesRes?.titles && Array.isArray(titlesRes.titles)) {
            const titleMap = {}
            titlesRes.titles.forEach((t) => {
              if (t.session_id) titleMap[t.session_id] = t.title
            })
            list.forEach((s) => {
              s.title = titleMap[s.id] || 'Hi'
            })
          }
        } catch (titleErr) {
          console.error('Error fetching session titles:', titleErr)
        }
      }

      setSessions(list)
      return list
    } catch (err) {
      console.error('Error fetching sessions:', err)
      return []
    } finally {
      setLoadingSessions(false)
    }
  }, [userId])

  const loadSessionMessages = useCallback(async (targetId) => {
    if (!userId || !targetId) return
    try {
      setLoadingHistory(true)
      const data = await api.get(`/sessions/${userId}/${targetId}`)
      if (data && Array.isArray(data.messages)) {
        const formatted = data.messages
          .map((m) => {
            const isUser = m.role === 'user'
            return {
              from: isUser ? 'user' : 'agent',
              role: m.role,
              text: isUser ? formatUserDisplay(m.text) : cleanAgentText(m.text),
              timestamp: m.timestamp,
            }
          })
          .filter((m) => m.text && m.text.trim())

        setMessages(formatted)
        setSessionId(targetId)
        try {
          sessionStorage.setItem('library_chat_session', targetId)
        } catch {}
      }
    } catch (err) {
      console.error('Error loading session messages:', err)
    } finally {
      setLoadingHistory(false)
    }
  }, [userId])

  useEffect(() => {
    let mounted = true
    async function init() {
      const list = await fetchSessions()
      if (!mounted) return

      const stored = sessionStorage.getItem('library_chat_session')
      if (stored) {
        loadSessionMessages(stored)
      } else if (list && list.length > 0) {
        loadSessionMessages(list[0].id)
      }
    }
    init()
    return () => {
      mounted = false
    }
  }, [fetchSessions, loadSessionMessages])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, thinking])

  function handleNewChat() {
    const newId = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `session_${Date.now()}`
    setSessionId(newId)
    try {
      sessionStorage.setItem('library_chat_session', newId)
    } catch {}
    setMessages([])
    setShowHistory(false)
  }

  function handleSelectSession(sId) {
    if (sId === sessionId) {
      setShowHistory(false)
      return
    }
    loadSessionMessages(sId)
    setShowHistory(false)
  }

  async function handleSend(userText) {
    const text = (userText || input).trim()
    if (!text || thinking) return

    setMessages((prev) => [...prev, { from: 'user', text }])
    setInput('')
    setThinking(true)

    try {
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') || '' : ''
      const libraryContext = activeLibrary?.id
        ? `\nCurrent library ID: ${activeLibrary.id}. Filter student data to this library unless I explicitly ask for another library.`
        : ''
      const data = await api.post('/chat', {
        message: `${text}${libraryContext}`,
        session_id: sessionId,
        token,
      })

      const reply = cleanAgentText(data?.reply || data?.response || 'I am here to help. What would you like to know?')
      setMessages((prev) => [...prev, { from: 'agent', text: reply }])
      fetchSessions()
    } catch (err) {
      console.error('Chat API error:', err)
      setMessages((prev) => [
        ...prev,
        {
          from: 'agent',
          text: cleanAgentText(err.message || 'Sorry, I encountered an issue connecting to the library AI agent. Please try again.'),
        },
      ])
    } finally {
      setThinking(false)
    }
  }

  const suggestedPrompts = [
    {
      icon: BookOpen,
      accent: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
      title: 'Book availability',
      desc: 'What books are currently available to borrow?',
    },
    {
      icon: Users,
      accent: 'text-[#d5f477] bg-[#d5f477]/10 border-[#d5f477]/20',
      title: 'Student members',
      desc: 'Who registered as a new student this week?',
    },
    {
      icon: GraduationCap,
      accent: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
      title: 'Circulation & issues',
      desc: 'Are any borrowed books overdue for return?',
    },
    {
      icon: Sparkles,
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      title: 'Fee tracking',
      desc: 'Check pending fee payments and dues',
    },
  ]

  const isNewSession = messages.length === 0

  return (
    <div className="flex flex-col h-[calc(100dvh-170px)] min-h-[580px] max-w-3xl mx-auto w-full relative">
      {/* Top Bar with Mascot, Session info, History & New chat */}
      <div className="flex items-center justify-between pb-3.5 border-b border-white/[0.08] mb-4">
        <div className="flex items-center gap-2.5">
          <LibraryMascot size="small" isThinking={thinking} />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">LibraryHub AI</span>
              <span className="text-xs text-neutral-400">&bull; Assistant</span>
            </div>
            {sessionId && (
              <span className="text-[10px] text-neutral-400 font-medium truncate max-w-[200px]">
                {sessions.find((s) => s.id === sessionId)?.title || `Session ${sessionId.slice(0, 8)}...`}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHistory((prev) => !prev)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
              showHistory
                ? 'border-[#d5f477] bg-[#d5f477]/10 text-[#d5f477]'
                : 'border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10 hover:text-white'
            }`}
          >
            <History size={13} />
            <span>History</span>
            {sessions.length > 0 && (
              <span className="ml-0.5 rounded-full bg-white/10 px-1.5 py-0.2 text-[10px] text-neutral-300">
                {sessions.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleNewChat}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-neutral-300 hover:bg-white/10 hover:text-white transition cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>New chat</span>
          </button>
        </div>
      </div>

      {/* History Drawer / Modal Popover */}
      {showHistory && (
        <div className="absolute top-14 right-0 z-30 w-80 sm:w-96 rounded-2xl border border-white/10 bg-[#14161b]/95 backdrop-blur-xl p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.08] mb-3">
            <div className="flex items-center gap-2">
              <History size={15} className="text-[#d5f477]" />
              <span className="text-sm font-semibold text-white">Chat Sessions</span>
            </div>
            <button
              type="button"
              onClick={() => setShowHistory(false)}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition cursor-pointer"
            >
              <X size={15} />
            </button>
          </div>

          {loadingSessions ? (
            <div className="py-8 text-center text-xs text-neutral-400">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">No previous sessions found.</div>
          ) : (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {sessions.map((s) => {
                const isActive = s.id === sessionId
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSession(s.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between gap-3 cursor-pointer ${
                      isActive
                        ? 'border-[#d5f477]/50 bg-[#d5f477]/10 text-white'
                        : 'border-white/5 bg-[#181a20] hover:border-white/20 hover:bg-[#1e2026] text-neutral-300'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={13} className={isActive ? 'text-[#d5f477]' : 'text-neutral-400'} />
                        <span className="text-xs font-semibold truncate">
                          {s.title || `Session ${s.id.slice(0, 8)}...`}
                        </span>
                      </div>
                      <div className="text-[11px] text-neutral-400 mt-1">
                        {formatSessionDate(s.last_update_time)}
                      </div>
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-medium text-[#d5f477] bg-[#d5f477]/20 px-2 py-0.5 rounded-full shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          )}

          <div className="mt-3 pt-3 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-medium py-2.5 transition cursor-pointer"
            >
              <Plus size={14} />
              <span>Start New Chat</span>
            </button>
          </div>
        </div>
      )}

      {/* Loading history overlay */}
      {loadingHistory && (
        <div className="absolute inset-0 bg-[#0b0d0f]/60 backdrop-blur-xs flex items-center justify-center z-20 rounded-2xl">
          <div className="flex items-center gap-2.5 bg-[#14161b] border border-white/10 px-4 py-2.5 rounded-full text-xs text-neutral-300 shadow-xl">
            <span className="h-2 w-2 rounded-full bg-[#d5f477] animate-pulse" />
            <span>Loading conversation...</span>
          </div>
        </div>
      )}

      {/* Main Conversation or Welcome Stage */}
      <div
        className="flex-1 overflow-y-auto px-1 sm:px-2 scroll-smooth no-scrollbar [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {isNewSession ? (
          <div className="h-full flex flex-col items-center justify-center py-6 animate-in fade-in zoom-in-95 duration-300 text-center select-none">
            <div className="mb-4">
              <LibraryMascot size="large" isThinking={false} />
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white max-w-md leading-tight">
              Hi! How can I help with your library today?
            </h2>
            <p className="mt-2 text-sm text-neutral-400 max-w-md">
              Ask about members, books, fees, or select a suggested prompt below.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl mt-8">
              {suggestedPrompts.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => handleSend(item.desc)}
                    className="group flex flex-col items-start rounded-2xl border border-white/[0.08] bg-[#14161b] p-4 text-left transition hover:border-[#d5f477]/40 hover:bg-[#181a20] hover:scale-[1.01] active:scale-[0.99] cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className={`grid h-7 w-7 place-items-center rounded-lg border ${item.accent}`}>
                        <Icon size={14} />
                      </span>
                      <span className="text-xs font-bold text-white group-hover:text-[#d5f477] transition">
                        {item.title}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.desc}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {messages.map((message, index) => {
              const isUser = message.from === 'user'
              return (
                <div
                  key={`${message.from}-${index}`}
                  className="animate-in fade-in slide-in-from-bottom-2 duration-200"
                >
                  {isUser ? (
                    <div className="flex justify-end">
                      <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl rounded-tr-sm bg-[#1e2026] border border-white/10 px-4.5 py-3 text-sm text-white shadow-sm leading-relaxed">
                        {message.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3.5 max-w-[92%] sm:max-w-[85%]">
                      <div className="shrink-0 pt-0.5">
                        <LibraryMascot size="small" isThinking={false} />
                      </div>
                      <div className="flex-1 pt-1 text-sm text-neutral-200 leading-relaxed space-y-2">
                        {message.role &&
                          !['user', 'library_assistant', 'model', 'agent'].includes(message.role) && (
                            <span className="inline-block text-[10px] font-bold text-[#d5f477] bg-[#d5f477]/10 border border-[#d5f477]/25 px-2 py-0.5 rounded-md uppercase tracking-wider mb-1">
                              {message.role.replace(/_/g, ' ')}
                            </span>
                          )}
                        <p className="whitespace-pre-line">{message.text}</p>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}

            {thinking && (
              <div className="flex items-start gap-3.5 animate-in fade-in duration-200">
                <div className="shrink-0 pt-0.5">
                  <LibraryMascot size="small" isThinking={true} />
                </div>
                <div className="flex items-center gap-2.5 pt-2 text-xs text-neutral-400">
                  <span className="h-2 w-2 rounded-full bg-[#d5f477] animate-pulse" />
                  <span className="font-semibold text-neutral-300">Thinking…</span>
                  <span className="flex gap-1">
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-neutral-400 animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Message Input Bar */}
      <div className="sticky bottom-0 bg-gradient-to-t from-[#0b0d0f] via-[#0b0d0f]/95 to-transparent pt-4 pb-2 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSend()
          }}
          className="relative flex items-center rounded-2xl sm:rounded-3xl border border-white/10 bg-[#16181d] px-4 py-2.5 shadow-2xl focus-within:border-[#d5f477] focus-within:ring-2 focus-within:ring-[#d5f477]/20 transition"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask LibraryHub Agent anything..."
            className="min-w-0 flex-1 bg-transparent pr-3 text-sm text-white placeholder:text-neutral-500 outline-none"
          />
          <button
            type="submit"
            disabled={!input.trim() || thinking}
            aria-label="Send message"
            className="grid h-8 w-8 sm:h-9 sm:w-9 shrink-0 place-items-center rounded-xl bg-[#d5f477] text-neutral-950 font-bold transition hover:bg-[#c5e662] disabled:opacity-30 disabled:hover:bg-[#d5f477] active:scale-95 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </form>
        <p className="text-[11px] text-neutral-500 text-center mt-2 select-none">
          LibraryHub Agent can make mistakes. Verify important library records.
        </p>
      </div>
    </div>
  )
}
