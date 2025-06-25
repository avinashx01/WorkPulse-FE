// auth.ts

import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { signOut } from 'next-auth/react'

// Define interface for the data returned from the API
interface APIResponse {
  loginDetails: {
    accessToken?: string
    idToken?: string // Added idToken
    refreshToken?: string
    username?: string
    firstname?: string
    lastname?: string
    email?: string
    ChallengeName?: string
    Session?: string
  }
  userDetail: {
    userId: string
    orgId: string
  }
  industryDetails?: any
  testerDetails?: any
  customerDetails?: any
  userType?: string
  mfaRequired?: boolean
  mfaSession?: string
}

// Define interface for the error data returned from the API
interface APIErrorResponse {
  message: string
  mfaRequired?: boolean
  mfaSession?: string
  username?: string
}

// Type guard to check if data is APIErrorResponse
function isAPIErrorResponse(data: any): data is APIErrorResponse {
  return typeof data === 'object' && 'message' in data
}

export const authOptions: NextAuthOptions = {
  providers: [
    // Credentials Provider
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
        orgId: { label: 'Organization ID', type: 'text' },
        mfaCode: { label: 'MFA Code', type: 'text' },
        mfaSession: { label: 'MFA Session', type: 'text' },
        isSSO: { label: 'Is SSO', type: 'hidden' }, // Hidden field for SSO flag
        code: { label: 'SSO Code', type: 'hidden' }, // Hidden field for SSO token/code
        callbackUrl: { label: 'callbackUrl', type: 'text' }
      },
      async authorize(credentials) {
        const { username, password, orgId, mfaCode, mfaSession, isSSO, code, callbackUrl } = credentials as unknown as {
          username: string
          password: string
          orgId: string
          mfaCode?: string
          mfaSession?: string
          isSSO?: boolean
          code?: string
          callbackUrl: string
        }

        

        try {
          let successData: APIResponse
          const utilityName = callbackUrl.split('://')[1].split('.')[0]

          const ApiUrl =

            utilityName === 'ubcustdev' || utilityName === 'ubcustqa' || utilityName === 'devcusttest' || utilityName === 'ubblmcustdev'

              ? '/auth/AuthenticateBasedOnRoleCustomer'
              : '/auth/authenticateBasedOnRole'

          if (isSSO && code) {
            // Handle SSO login
            const authenticateUrl = `${process.env.NEXT_PUBLIC_API_URL}${ApiUrl}`

            const ssoBody = {
              username: 'string',
              password: 'string',
              code: code,
              isSSO: true,
              organizationId: parseInt(orgId, 10)
            }

            const res = await fetch(authenticateUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(ssoBody)
            })

            let data: any

            try {
              data = await res.json()
            } catch (error) {
              const textData = await res.text()

              throw new Error(textData || 'SSO Authentication failed')
            }

            if (!res.ok) {
              if (isAPIErrorResponse(data)) {
                throw new Error(data.message || 'SSO Authentication failed')
              }

              throw new Error('SSO Authentication failed')
            }

            if (!Array.isArray(data) || data.length === 0) {
              throw new Error('SSO Authentication failed. No data returned.')
            }

            successData = data[0]
          } else if (mfaCode && mfaSession) {
            // Handle MFA verification using /mfa/MFAcode endpoint with query parameters
            const verifyUrl = `${process.env.NEXT_PUBLIC_API_URL}/mfa/MFAcode`

            const url = `${verifyUrl}?mfaCode=${encodeURIComponent(mfaCode)}&username=${encodeURIComponent(
              username
            )}&session=${encodeURIComponent(mfaSession)}&orgId=${encodeURIComponent(orgId)}`

            const verifyRes = await fetch(url, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              }

              // No body needed since parameters are in query string
            })

            let verifyData: any

            try {
              verifyData = await verifyRes.json()
            } catch (error) {
              const textData = await verifyRes.text()

              throw new Error(textData || 'MFA Verification failed')
            }

            if (!verifyRes.ok) {
              if (isAPIErrorResponse(verifyData)) {
                throw new Error(verifyData.message || 'MFA Verification failed')
              }

              throw new Error('MFA Verification failed')
            }

            if (!Array.isArray(verifyData) || verifyData.length === 0) {
              throw new Error('MFA Verification failed. No data returned.')
            }

            successData = verifyData[0]

            // Ensure the response is an array with at least one item
            // (Handled above)
          } else {
            // Handle initial regular login using ${ApiUrl} endpoint
            const authenticateUrl = `${process.env.NEXT_PUBLIC_API_URL}${ApiUrl}`

            const authBody = {
              username,
              password,
              organizationId: parseInt(orgId, 10)
            }

            const res = await fetch(authenticateUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(authBody)
            })

            let data: any

            try {
              data = await res.json()
            } catch (error) {
              const textData = await res.text()

              throw new Error(textData || 'Authentication failed')
            }

            if (!res.ok) {
              if (isAPIErrorResponse(data)) {
                if (data.mfaRequired) {
                  throw new Error(`MFA_REQUIRED:${data.mfaSession}:${data.username}`)
                }

                throw new Error(data.message || 'Invalid credentials')
              }

              throw new Error('Invalid credentials')
            }

            if (!Array.isArray(data) || data.length === 0) {
              throw new Error('Authentication failed. Please check your credentials.')
            }

            successData = data[0]

            if (successData.mfaRequired || successData.loginDetails.ChallengeName === 'SMS_MFA') {
              const session = successData.loginDetails.Session || successData.mfaSession || ''

              throw new Error(`MFA_REQUIRED:${session}:${username}`)
            }
          }

          // Common user preparation logic
          if (!successData.userDetail || !successData.userDetail.userId) {
            throw new Error('Invalid user data returned from authentication.')
          }

          // **START OF SSO LOGIN MODIFICATIONS**
          // Derive name from username or email if firstname and lastname are missing
          const name =
            successData.loginDetails.firstname || successData.loginDetails.lastname
              ? `${successData.loginDetails.firstname || ''} ${successData.loginDetails.lastname || ''}`.trim()
              : successData.loginDetails.username || successData.loginDetails.email || 'User'

          const user = {
            id: successData.userDetail.userId,
            accessToken: successData.loginDetails.accessToken || '',
            refreshToken: successData.loginDetails.refreshToken || '',

            // **If you want to store idToken, uncomment the next line**
            // idToken: successData.loginDetails.idToken || '',
            username: successData.loginDetails.username || '',
            name: name, // Use the derived name
            lastname: successData.loginDetails.lastname || '', // May be empty for SSO
            email: successData.loginDetails.email || '',
            orgId: successData.userDetail.orgId,
            roleSpecificData:
              successData.industryDetails || successData.testerDetails || successData.customerDetails || null,
            userType: successData.userType || ''
          }

          return user
        } catch (error: any) {
          if (error.message.startsWith('MFA_REQUIRED:')) {
            const [, mfaSession, mfaUsername] = error.message.split(':')

            throw new Error(`MFA_REQUIRED:${mfaSession}:${mfaUsername}`)
          }

          throw new Error(error.message || 'Authorization failed')
        }
      }
    }),

    // SSO Provider: Google (Optional)
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },
  pages: {
    signIn: '/en/login' // Custom sign-in page
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.accessToken = user.accessToken
        token.refreshToken = user.refreshToken
        token.username = user.username
        token.name = user.name
        token.lastname = user.lastname
        token.email = user.email
        token.orgId = user.orgId
        token.roleSpecificData = user.roleSpecificData
        token.userType = user.userType

        // Note: appDetails are not included here
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.accessToken = token.accessToken as string
        session.refreshToken = token.refreshToken as string
        session.user.username = token.username as string
        session.user.name = token.name as string
        session.user.lastname = token.lastname as string
        session.user.email = token.email as string
        session.user.orgId = token.orgId as string
        session.user.roleSpecificData = token.roleSpecificData
        session.user.userType = token.userType as string

        // appDetails are managed separately in localStorage
      }

      return session
    },

    async signIn() {
      return true
    },

    /**
     * Custom redirect callback to handle subdomain redirection
     */
    async redirect({ url, baseUrl }) {
      // Allow relative URLs (e.g., "/")
      if (url.startsWith('/')) return `${baseUrl}${url}`

      // Allow URLs that are on the same origin as baseUrl
      if (new URL(url).origin === baseUrl) {
        return url
      }

      // Default to baseUrl for all other cases
      return baseUrl
    }
  }
}

export const logout = async () => {
  try {
    // Clear all authentication-related localStorage items
    const itemsToClear = [
      'userData',
      'authConfig.storageTokenKeyName',
      'authConfig.onTokenExpiration',
      'customerIds',
      'testerDetails',
      'organizationId',
      'applicationType',
      'industryDetails',
      'orgId',
      'userId',
      'mfaSession',
      'mfaUsername',
      'APP_DETAILS_STORAGE_KEY',
      'appDetailsEncrypted',
      'roleKey',
      'currentAppType',
      'accountDetails',
      'accountId',
      'accountName',
      'ms_email_logged_out'
    ]

    // Clear all specified items from localStorage
    itemsToClear.forEach(item => {
      window.localStorage.removeItem(item)
    })

    // Sign out using next-auth
    await signOut({
      redirect: false
    })

    // Determine the redirect URL
    const redirectUrl = '/en/login'

    // Clear browser history and redirect
    window.history.replaceState(null, '', redirectUrl)

    // Return the redirect URL so the calling component can handle navigation if needed
    return redirectUrl
  } catch (error) {
    console.error('Logout error:', error)
    throw error
  }
}

export default authOptions
