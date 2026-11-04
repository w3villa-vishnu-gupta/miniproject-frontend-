import { useEffect } from 'react'
import { Route, Routes, Navigate, Outlet } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import LandingPage from './Pages/Landingpage'
import Loginpage from './Pages/Loginpage'
import Createaccount from './Pages/Createaccount'
import CreateLibrary from './Pages/CreateLibrary'
import Adminpage from './Pages/Adminpage'
import OverviewPage from './Pages/admin/OverviewPage'
import BooksPage from './Pages/admin/BooksPage'
import BookIssuesPage from './Pages/admin/BookIssuesPage'
import StudentsPage from './Pages/admin/StudentsPage'
import AlumniPage from './Pages/admin/AlumniPage'
import AgentPage from './Pages/admin/AgentPage'
import ProfilePage from './Pages/admin/ProfilePage'
import SettingsPage from './Pages/admin/SettingsPage'
import Pricingpage from './Pages/Pricingpage'
import ReleaseNotesPage from './Pages/ReleaseNotesPage'
import MagicCallback from './Pages/MagicCallback.jsx'
import Protectedroute from './Pages/Protectedroute.jsx'
import { api } from './Services/api.js'
import { login, logout } from './Redux/Userslice.js'

/**
 * Extract token from URL query params ONCE on page load (synchronous).
 * This runs before any React component renders, so Protectedroute
 * can see the token in localStorage immediately.
 */
;(function extractTokenFromUrl() {
  const url = new URL(window.location.href)
  const token = url.searchParams.get('access_token')
  if (!token) return

  localStorage.setItem('token', token)

  // Clean the token from the address bar
  url.searchParams.delete('access_token')
  url.searchParams.delete('token_type')
  window.history.replaceState(
    window.history.state,
    '',
    `${url.pathname}${url.search}${url.hash}`,
  )
})()

/**
 * Public route wrapper:
 * If an authenticated token exists, redirect to /create-library
 */
function PublicRoute() {
  const token = localStorage.getItem('token')
  if (token) {
    return <Navigate to="/create-library" replace />
  }
  return <Outlet />
}

export default function App() {
  const dispatch = useDispatch()
  const currentUser = useSelector((state) => state.user.user)

  // Fetch owner profile on mount if token exists but Redux is empty
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || currentUser) return

    async function fetchOwnerProfile() {
      try {
        const ownerData = await api.get('/getownerdata', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        dispatch(login(ownerData))
      } catch (error) {
        console.error('Session expired or invalid:', error)
        localStorage.removeItem('token')
        dispatch(logout())
      }
    }

    fetchOwnerProfile()
  }, [dispatch, currentUser])

  return (
    <Routes>
      <Route path="/pricing" element={<Pricingpage />} />
      <Route path="/release-notes" element={<ReleaseNotesPage />} />
      <Route path="/auth/magic-callback" element={<MagicCallback />} />

      <Route element={<PublicRoute />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Loginpage />} />
        <Route path="/register" element={<Createaccount />} />
      </Route>

      <Route element={<Protectedroute />}>
        <Route path="/create-library" element={<CreateLibrary />} />
        <Route path="/admin" element={<Adminpage />}>
          <Route index element={<OverviewPage />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="books" element={<BooksPage />} />
          <Route path="book" element={<BooksPage />} />
          <Route path="book-issues" element={<BookIssuesPage />} />
          <Route path="assignments" element={<BookIssuesPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="student" element={<StudentsPage />} />
          <Route path="alumni" element={<AlumniPage />} />
          <Route path="agent" element={<AgentPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
