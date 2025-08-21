export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  phone?: string
  date_of_birth?: string
  address?: string
  profile_image?: string
  role: 'client' | 'therapist' | 'admin'
  is_verified: boolean
  created_at: string
  updated_at: string
  therapistProfile?: TherapistProfile
}

export interface TherapistProfile {
  id: number
  user_id: number
  bio?: string
  certifications?: string
  experience_years: number
  specializations: string[]
  hourly_rate?: number
  availability_schedule: AvailabilitySchedule
  is_approved: boolean
  rating: number
  total_sessions: number
  created_at: string
  updated_at: string
}

export interface AvailabilitySchedule {
  [key: string]: TimeSlot[]
}

export interface TimeSlot {
  start: string
  end: string
}

export interface Appointment {
  id: number
  client_id: number
  therapist_id: number
  appointment_date: string
  appointment_time: string
  duration: number
  session_type: 'in-person' | 'remote'
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  notes?: string
  price?: number
  payment_status: 'pending' | 'paid' | 'refunded'
  payment_method?: string
  payment_id?: string
  cancellation_reason?: string
  reminder_sent: boolean
  created_at: string
  updated_at: string
  client_first_name?: string
  client_last_name?: string
  therapist_first_name?: string
  therapist_last_name?: string
  hourly_rate?: number
}

export interface Review {
  id: number
  appointment_id: number
  client_id: number
  therapist_id: number
  rating: number
  comment?: string
  is_public: boolean
  created_at: string
  updated_at: string
}

export interface Notification {
  id: number
  user_id: number
  title: string
  message: string
  type: 'appointment' | 'payment' | 'system' | 'promotion'
  is_read: boolean
  action_url?: string
  created_at: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface LoginCredentials {
  email: string
  password: string
  deviceInfo?: string
}

export interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
  phone?: string
  role?: 'client' | 'therapist'
  userType?: 'client' | 'therapist'
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  errors?: any[]
}

export interface PaginationResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

export interface BookingFormData {
  therapist_id: number
  appointment_date: string
  appointment_time: string
  duration: number
  session_type: 'in-person' | 'remote'
  notes?: string
}

export interface ProfileUpdateData {
  firstName?: string
  lastName?: string
  phone?: string
  dateOfBirth?: string
  address?: string
}

export interface PasswordChangeData {
  currentPassword: string
  newPassword: string
}
