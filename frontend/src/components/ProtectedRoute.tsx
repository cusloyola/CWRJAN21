import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'

interface ProtectedRouteProps {
    children: ReactNode
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
    const authToken = localStorage.getItem('authToken')

    if (!authToken) {
        // Redirect to login if not authenticated
        return <Navigate to="/login" replace state={{ message: 'Please login first to access this page' }} />
    }

    return <>{children}</>
}

export default ProtectedRoute
