import {createContext, useContext, useEffect, useState} from 'react'

type Role = 0 | 1 | 2 | 3

interface User
{
    id: number
    name: string
    email: string
    avatarUrl?: string
    role: Role
    emailVerified: boolean
}

interface AuthContextType
{
    user: User | null
    setUser: (user: User | null) => void
    logout: () => void
    isAuthenticated: boolean
    refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    setUser: () => {
    },
    logout: () => {
    },
    isAuthenticated: false,
    refreshUser: async () => {
    },
})

export function AuthProvider({children}: { children: React.ReactNode })
{
    const [user, setUser] = useState<User | null>(null)

    const refreshUser = async () => {
        const token = localStorage.getItem('token')
        if (token)
        {
            try
            {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                })
                if (!res.ok)
                {
                    throw new Error('Failed to fetch user info')
                }
                const data = await res.json()
                setUser({
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    avatarUrl: data.avatarUrl,
                    role: data.role,
                    emailVerified: data.emailVerified ?? false,
                })
            } catch (err)
            {
                console.error(err)
                logout()
            }
        }
    }

    useEffect(() => {
        refreshUser()
    }, [])

    const logout = () => {
        localStorage.removeItem('token')
        setUser(null)
    }

    return (
        <AuthContext.Provider value={{user, setUser, logout, isAuthenticated: !!user, refreshUser}}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth()
{
    return useContext(AuthContext)
}
