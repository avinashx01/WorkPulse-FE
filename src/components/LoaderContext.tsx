'use client'

import React, { createContext, useState, useContext, useEffect } from 'react'

// Define the context type
interface LoaderContextType {
  isLoading: boolean
  setLoading: (loading: boolean) => void
}

// Create context with default values
const LoaderContext = createContext<LoaderContextType>({
  isLoading: false,
  setLoading: () => {}
})

let externalSetLoading: (loading: boolean) => void = () => {}

export const LoaderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setLoading] = useState(false)

  useEffect(() => {
    externalSetLoading = setLoading
  }, [])

  const value = { isLoading, setLoading }

  return <LoaderContext.Provider value={value}>{children}</LoaderContext.Provider>
}

// Custom hook for using the context
export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext)

  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider')
  }

  return context
}

// Export to use in axios interceptor
export const setGlobalLoading = (loading: boolean): void => {
  externalSetLoading(loading)
}
