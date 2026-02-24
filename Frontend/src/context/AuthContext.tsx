import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import {
  api,
  type LoginRequest,
  type LoginResponse,
  type RegisterRequest,
} from '../services/api'
import { useNavigate, useLocation } from 'react-router-dom'

interface AuthContextType {
  user: { id: number; username: string; role: string } | null
  token: string | null
  isLoading: boolean
  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ id: number; username: string; role: string } | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('jwt_token')
      const storedRole = localStorage.getItem('user_role')
      const storedProfileId =
        localStorage.getItem('profile_id') ?? localStorage.getItem('user_id')
      const storedUsername = localStorage.getItem('username')

      if (storedToken && storedRole && storedProfileId && storedUsername) {
        setToken(storedToken)
        setUser({
          role: storedRole,
          id: parseInt(storedProfileId, 10),
          username: storedUsername,
        })
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (credentials: LoginRequest) => {
    try {
      const response: LoginResponse = await api.login(credentials)
      // roleId is the domain profile id (wholesaler/local seller).
      const profileId = response.roleId ?? response.userId

      if (typeof window !== 'undefined') {
        localStorage.setItem('jwt_token', response.token)
        localStorage.setItem('user_role', response.role)
        localStorage.setItem('user_id', response.userId.toString())
        localStorage.setItem('profile_id', profileId.toString())
        localStorage.setItem('username', response.username)
      }

      setToken(response.token)
      setUser({
        role: response.role,
        id: profileId,
        username: response.username,
      })

      const state = location.state as { from?: Location } | null
      const from = state?.from?.pathname ?? '/wholesaler'
      navigate(from, { replace: true })
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const register = async (data: RegisterRequest) => {
    try {
      await api.register(data)
      navigate('/auth/login')
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  }

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('jwt_token')
      localStorage.removeItem('user_role')
      localStorage.removeItem('user_id')
      localStorage.removeItem('profile_id')
      localStorage.removeItem('username')
    }
    setToken(null)
    setUser(null)
    navigate('/auth/login', { replace: true })
  }

  const isAuthenticated = !!token

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
