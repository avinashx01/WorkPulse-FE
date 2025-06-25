import type { AxiosRequestConfig } from 'axios'
import axios from 'axios'
import { getSession } from 'next-auth/react'

import toast from 'react-hot-toast'

import { logout } from '@/libs/auth'
import { setGlobalLoading } from '@/components/LoaderContext'

// Create an axios instance
const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' }
})

let isHandlingAuthError = false
let authErrorResetTimer: NodeJS.Timeout | null = null

// Interceptor to add Bearer token
axiosClient.interceptors.request.use(
  async config => {
    setGlobalLoading(true)
    const session = await getSession()

    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`
    }

    return config
  },
  error => {
    setGlobalLoading(false)

    // If an error occurs during the request phase (e.g., failed to send), propagate it
    return Promise.reject(error)
  }
)

// Interceptor to handle responses
axiosClient.interceptors.response.use(
  response => {
    setGlobalLoading(false)

    return response
  }, // Pass successful responses

  async error => {
    setGlobalLoading(false)
    const statusCode = error.response?.status
    const errorMessage = error.response?.data?.message || error.response?.data?.error || 'An unexpected error occurred.'

    if (statusCode === 401) {
      if (!isHandlingAuthError) {
        isHandlingAuthError = true

        toast.error('Session expired. Please log in again.')

        // Start logout process
        const redirectUrl = await logout()

        window.location.href = redirectUrl

        // Reset the flag after a delay (e.g., 5 seconds)
        if (authErrorResetTimer) {
          clearTimeout(authErrorResetTimer)
        }

        authErrorResetTimer = setTimeout(() => {
          isHandlingAuthError = false
        }, 5000)
      }

      // Still reject the promise for each call
      return Promise.reject({
        message: 'Session expired. Please log in again.',
        statusCode: 401,
        originalError: error
      })
    } else if (statusCode >= 500) {
      // Handle server-side errors
      toast.error('Server error. Please try again later.')

      return Promise.reject({
        message: 'Server error. Please try again later.',
        statusCode: 500,
        originalError: error
      })
    } else if (statusCode === 400) {
      // Handle client-side errors
      toast.error(errorMessage)

      return Promise.reject({
        message: errorMessage,
        statusCode: 400,
        originalError: error
      })
    } else if (!statusCode) {
      // Handle network errors (no response)
      toast.error('Network error. Please check your internet connection.')

      return Promise.reject({
        message: 'Network error. Please check your internet connection.',
        statusCode: null,
        originalError: error
      })
    } else {
      // For any other errors, propagate the original error response
      toast.error(errorMessage)

      return Promise.reject({
        message: errorMessage,
        statusCode,
        originalError: error
      })
    }
  }
)

// Add this temporary testing function at the bottom of your file

// Axios methods with optional type passing
export const axiosInterceptor = {
  get: <T>(url: string, config: AxiosRequestConfig = {}) => axiosClient.get<T>(url, config),
  post: <T>(url: string, data: any = {}, config: AxiosRequestConfig = {}) => axiosClient.post<T>(url, data, config),
  put: <T>(url: string, data: any = {}, config: AxiosRequestConfig = {}) => axiosClient.put<T>(url, data, config),
  patch: <T>(url: string, data: any = {}, config: AxiosRequestConfig = {}) => axiosClient.patch<T>(url, data, config),
  delete: <T>(url: string, config: AxiosRequestConfig = {}) => axiosClient.delete<T>(url, config)
}

export default axiosInterceptor
