import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { User, AuthTokens, LoginCredentials, RegisterData, ApiResponse } from '../types'
import { authService } from '../services/authService'

interface AuthContextType {
  user: User | null
  tokens: AuthTokens | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>>
  register: (data: RegisterData) => Promise<ApiResponse>
  logout: () => Promise<void>
  refreshToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [tokens, setTokens] = useState<AuthTokens | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user && !!tokens

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedTokens = localStorage.getItem('auth_tokens')
        const storedUser = localStorage.getItem('auth_user')

        if (storedTokens && storedUser) {
          const parsedTokens = JSON.parse(storedTokens)
          const parsedUser = JSON.parse(storedUser)
          
          setTokens(parsedTokens)
          setUser(parsedUser)
          
          // Set default authorization header
          authService.setAuthToken(parsedTokens.accessToken)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        // Clear invalid stored data
        localStorage.removeItem('auth_tokens')
        localStorage.removeItem('auth_user')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      
      if (response.success && response.data) {
        const { user: userData, accessToken, refreshToken } = response.data
        const authTokens = { accessToken, refreshToken }
        
        setUser(userData)
        setTokens(authTokens)
        
        // Store in localStorage
        localStorage.setItem('auth_tokens', JSON.stringify(authTokens))
        localStorage.setItem('auth_user', JSON.stringify(userData))
        
        // Set default authorization header
        authService.setAuthToken(accessToken)
      }
      
      return response
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await authService.register(data)
      return response
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (tokens?.refreshToken) {
        await authService.logout(tokens.refreshToken)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear state and localStorage regardless of API call success
      setUser(null)
      setTokens(null)
      localStorage.removeItem('auth_tokens')
      localStorage.removeItem('auth_user')
      authService.setAuthToken(null)
    }
  }

  const refreshToken = async (): Promise<boolean> => {
    try {
      if (!tokens?.refreshToken) {
        return false
      }

      const response = await authService.refreshToken(tokens.refreshToken)
      
      if (response.success && response.data) {
        const { accessToken, refreshToken: newRefreshToken } = response.data
        const newTokens = { accessToken, refreshToken: newRefreshToken }
        
        setTokens(newTokens)
        localStorage.setItem('auth_tokens', JSON.stringify(newTokens))
        authService.setAuthToken(accessToken)
        
        return true
      }
      
      return false
    } catch (error) {
      console.error('Token refresh error:', error)
      await logout() // Force logout on refresh failure
      return false
    }
  }

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshToken
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
