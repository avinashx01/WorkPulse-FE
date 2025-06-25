// src/utils/encryptAppDetails.ts

import CryptoJS from 'crypto-js'

const ENCRYPTION_KEY = process.env.NEXT_PUBLIC_ENCRYPTION_KEY as string

if (!ENCRYPTION_KEY) {
  throw new Error('Missing NEXT_PUBLIC_ENCRYPTION_KEY in environment variables.')
}

/**
 * Encrypts data using AES encryption.
 * @param data - The data to encrypt.
 * @returns Encrypted string.
 */
export const encryptAppDetails = (data: any): string => {
  const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString()

  return ciphertext
}

/**
 * Decrypts AES encrypted data.
 * @param ciphertext - The encrypted string.
 * @returns Decrypted data.
 */
export const decryptAppDetails = (ciphertext: string): any => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY)
  const decryptedData = bytes.toString(CryptoJS.enc.Utf8)

  return JSON.parse(decryptedData)
}
