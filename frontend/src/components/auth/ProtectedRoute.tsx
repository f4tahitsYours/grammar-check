import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/auth/useAuth'

interface ProtectedRouteProps {
    children: React.ReactNode
    allowedRoles: ('student' | 'teacher' | 'admin')[]
}

/**
 * Protected route component that checks authentication and role
 * Redirects to login if not authenticated
 * Redirects to appropriate dashboard if role not allowed
 */
const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuth()

    // Show loading spinner while checking authentication
    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950">
                <div className="h-14 w-14 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
                <p className="mt-4 text-lg font-medium text-slate-800 dark:text-slate-100">
                    Loading...
                </p>
            </div>
        )
    }

    // Not authenticated - redirect to login
    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on user's role
        const redirectPath = `/dashboard/${user.role}/`
        return <Navigate to={redirectPath} replace />
    }

    // All checks passed - render children
    return <>{children}</>
}

export default ProtectedRoute
