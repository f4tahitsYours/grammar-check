import { createContext, useState, useEffect, ReactNode } from 'react'
import { setToken } from './tokenStore'

export interface AuthUser {
    user_id: string
    email: string
    name: string
    role: 'student' | 'teacher' | 'admin'
    access_token: string
}

export interface AuthContextType {
    user: AuthUser | null
    login: (data: AuthUser) => void
    logout: () => void
    isAuthenticated: boolean
    isLoading: boolean
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

/**
 * Check if JWT token is expired
 * @param token JWT token string
 * @returns true if expired, false if valid
 */
const isTokenExpired = (token: string): boolean => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        return payload.exp * 1000 < Date.now()
    } catch {
        return true
    }
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Restore session from localStorage on mount
    useEffect(() => {
        const restoreSession = () => {
            try {
                const token = localStorage.getItem('access_token')
                
                if (!token) {
                    setIsLoading(false)
                    return
                }

                // Check if token is expired
                if (isTokenExpired(token)) {
                    // Token expired, clear localStorage
                    localStorage.clear()
                    setUser(null)
                    setIsLoading(false)
                    return
                }

                // Token is valid, restore user data
                const userData: AuthUser = {
                    access_token: token,
                    user_id: localStorage.getItem('user_id') || '',
                    email: localStorage.getItem('user_email') || '',
                    name: localStorage.getItem('user_name') || '',
                    role: (localStorage.getItem('user_role') as 'student' | 'teacher' | 'admin') || 'student'
                }

                setUser(userData)
            } catch (error) {
                console.error('Failed to restore session:', error)
                localStorage.clear()
                setUser(null)
            } finally {
                setIsLoading(false)
            }
        }

        restoreSession()
    }, [])

    // Sync token to tokenStore whenever user changes
    useEffect(() => {
        setToken(user?.access_token ?? null)
    }, [user])

    const login = (data: AuthUser) => {
        // Save to state
        setUser(data)

        // Save to localStorage for session persistence
        localStorage.setItem('access_token', data.access_token)
        localStorage.setItem('user_id', data.user_id)
        localStorage.setItem('user_email', data.email)
        localStorage.setItem('user_name', data.name)
        localStorage.setItem('user_role', data.role)
    }

    const logout = () => {
        // Clear state
        setUser(null)

        // Clear localStorage
        localStorage.clear()
    }

    const isAuthenticated = user !== null

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                isAuthenticated,
                isLoading
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}
