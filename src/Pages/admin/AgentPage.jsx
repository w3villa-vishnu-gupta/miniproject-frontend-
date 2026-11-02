import { useAdminContext } from '../../context/AdminContext'
import AgentPanel from '../../components/admin/AgentPanel'

export default function AgentPage() {
  const { students, books, activeLibrary, owner } = useAdminContext()

  return (
    <AgentPanel
      students={students}
      books={books}
      activeLibrary={activeLibrary}
      owner={owner}
    />
  )
}
