import { Navigate } from 'react-router-dom'
import { isLoggedIn } from '../auth'

// Wraps a page that requires login. If not logged in, redirect to /login.
export default function PrivateRoute({ children }) {
  if (!isLoggedIn()) {
    return <Navigate to="/login" replace />
  }
  return children
}
