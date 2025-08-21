import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { LoginCredentials, RegisterData, ApiResponse, User, AuthTokens } from '../types'

class AuthService {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Response interceptor for handling token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const tokens = localStorage.getItem('auth_tokens')
            if (tokens) {
              const { refreshToken } = JSON.parse(tokens)
              const response = await this.refreshToken(refreshToken)
              
              if (response.success && response.data) {
                const { accessToken } = response.data
                this.setAuthToken(accessToken)
                originalRequest.headers.Authorization = `Bearer ${accessToken}`
                return this.api(originalRequest)
              }
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            localStorage.removeItem('auth_tokens')
            localStorage.removeItem('auth_user')
            window.location.href = '/login'
          }
        }

        return Promise.reject(error)
      }
    )
  }

  setAuthToken(token: string | null) {
    if (token) {
      this.api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete this.api.defaults.headers.common['Authorization']
    }
  }

  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> = 
        await this.api.post('/auth/login', credentials)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async register(data: RegisterData): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/register', data)
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async logout(refreshToken: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/logout', { refreshToken })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    try {
      const response: AxiosResponse<ApiResponse<AuthTokens>> = 
        await this.api.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/verify-email', { token })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = await this.api.post('/auth/forgot-password', { email })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await this.api.post('/auth/reset-password', { token, password })
      return response.data
    } catch (error: any) {
      if (error.response?.data) {
        return error.response.data
      }
      return {
        success: false,
        message: 'Network error occurred'
      }
    }
  }
}

export const authService = new AuthService()
