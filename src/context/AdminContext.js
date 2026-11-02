import { createContext, useContext } from 'react'
import { useOutletContext } from 'react-router-dom'

export const AdminContext = createContext(null)

export function useAdminContext() {
  const outletCtx = useOutletContext()
  const customCtx = useContext(AdminContext)
  return outletCtx || customCtx || {}
}
