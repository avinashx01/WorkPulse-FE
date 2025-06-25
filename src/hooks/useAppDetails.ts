import { useEffect, useState } from 'react'

import { useRouter } from 'next/navigation'

import { useSession, signOut } from 'next-auth/react'
import { toast } from 'react-toastify'

import { decryptAppDetails, encryptAppDetails } from '@/utils/encryptAppDetails'
import { axiosInterceptor } from '@/utils/axiosInterceptor'

interface SubModuleData {
  subModuleKey?: string
  subModulePermissions?: string[] // <== ensure included
}

export interface ModuleData {
  id: string
  moduleKey: string
  modulePermissions: string[]
  subModuleData: SubModuleData[]
}

export interface RoleDetail {
  roleId: string
  roleKey: string
  moduleData: ModuleData[]
}

interface IAccountDetails {
  accountId: string
  accountName: string
}

export interface AppDetail {
  applicationTypeId: string
  applicationName: string
  roleDetails: RoleDetail[]
  customerDetails?: any
  accountDetails?: IAccountDetails[]
  serviceDetails?: string
}

export interface AppDetailsData {
  appDetails: AppDetail[]
}

export type AppDetailsResponse = AppDetailsData[]

const APP_DETAILS_STORAGE_KEY = 'appDetailsEncrypted'

export const useAppDetails = () => {
  const { data: session, status } = useSession()
  const [appDetails, setAppDetails] = useState<AppDetail[] | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [refetchIndex, setRefetchIndex] = useState<number>(0)
  const router = useRouter()

  useEffect(() => {
    const fetchAppDetails = async () => {
      if (status !== 'authenticated') return

      if (typeof window === 'undefined') return

      const encryptedAppDetails = localStorage.getItem(APP_DETAILS_STORAGE_KEY)

      if (encryptedAppDetails) {
        // Attempt to decrypt existing data
        try {
          const decrypted = decryptAppDetails(encryptedAppDetails)

          if (Array.isArray(decrypted)) {
            setAppDetails(decrypted)
          } else {
            throw new Error('Decrypted appDetails is not an array.')
          }
        } catch (error) {
          console.error('Error decrypting appDetails:', error)
          localStorage.removeItem(APP_DETAILS_STORAGE_KEY)
          toast.error('Failed to load application details. Please log in again.')
          signOut({ callbackUrl: 'en/login' })
        }

        return
      }

      // If not in localStorage, fetch from API
      setLoading(true)

      const hostname = window.location.hostname
      const utilityName = hostname.split('.')[0]

      const LoginURL =

        utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest' || utilityName === 'ubblmcustdev'

          ? '/auth/authenticateBasedOnAppDetailsCustomer'
          : '/auth/authenticateBasedOnAppDetails'

      try {
        const response = await axiosInterceptor.post<AppDetailsResponse>(LoginURL, {
          username: session?.user?.email,
          organizationId: parseInt(session?.user?.orgId) || 0
        })

        //  console.log('useAppDetails response data:', response.data)
        const fetchedAppDetails = response.data?.[0]?.appDetails

        if (fetchedAppDetails && Array.isArray(fetchedAppDetails)) {
          setAppDetails(fetchedAppDetails)
          const hostname = window.location.hostname
          const utilityName = hostname.split('.')[0]


          if (!fetchedAppDetails[0].customerDetails && (utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest')) {

            // router.replace('/en/requests/startService/list')
          }

          const encrypted = encryptAppDetails(fetchedAppDetails)

          localStorage.setItem(APP_DETAILS_STORAGE_KEY, encrypted)
        } else {
          throw new Error('Invalid appDetails format received from API.')
        }
      } catch (error: any) {
        console.error('Error fetching appDetails:', error)
        toast.error('Failed to fetch application details.')
      } finally {
        setLoading(false)
      }
    }

    fetchAppDetails()
  }, [session, status, refetchIndex, router])

  const getAppDetails = (): AppDetail[] | null => {
    if (appDetails) return appDetails
    if (typeof window === 'undefined') return null

    const encryptedAppDetails = localStorage.getItem(APP_DETAILS_STORAGE_KEY)

    if (encryptedAppDetails) {
      try {
        const decrypted = decryptAppDetails(encryptedAppDetails)

        if (Array.isArray(decrypted)) {
          setAppDetails(decrypted)
          const hostname = window.location.hostname
          const utilityName = hostname.split('.')[0]


          if (!decrypted[0].customerDetails && (utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest')) {

            // router.replace('/en/requests/startService/list')
          }

          return decrypted
        } else {
          throw new Error('Decrypted appDetails is not an array.')
        }
      } catch (error) {
        console.error('Error decrypting appDetails:', error)
        localStorage.removeItem(APP_DETAILS_STORAGE_KEY)
        toast.error('Failed to load application details. Please log in again.')
        signOut({ callbackUrl: 'en/login' })

        return null
      }
    }

    return null
  }

  const clearAppDetails = () => {
    setAppDetails(null)

    if (typeof window !== 'undefined') {
      localStorage.removeItem(APP_DETAILS_STORAGE_KEY)
    }
  }

  const refetch = () => {
    setRefetchIndex(prev => prev + 1)
  }

  return {
    appDetails: getAppDetails(),
    loading,
    refetch,
    clearAppDetails
  }
}
