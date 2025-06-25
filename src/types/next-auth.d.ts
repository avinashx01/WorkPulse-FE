// src/types/next-auth.d.ts

import type { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      username: string
      name: string
      lastname: string
      email: string
      orgId: string
      roleSpecificData: any // You can define a more specific type based on your data
      userType: string
    } & DefaultSession['user']
    accessToken: string
    refreshToken: string
  }

  interface User extends DefaultUser {
    id: string
    username: string
    name: string
    lastname: string
    email: string
    orgId: string
    roleSpecificData: any

    userType: string
    accessToken: string
    refreshToken: string
  }
}
