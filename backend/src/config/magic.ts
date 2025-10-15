import { Magic } from "@magic-sdk/admin"
import { envConfig } from "./env"

let magicAdmin: Magic | null = null

export const initializeMagic = (): Magic => {
  if (magicAdmin) {
    return magicAdmin
  }

  try {
    magicAdmin = new Magic(envConfig.MAGIC_SECRET_KEY)
    console.log("Magic Labs SDK initialized")
    return magicAdmin
  } catch (error) {
    console.error("Magic Labs initialization error:", error)
    throw error
  }
}

export const getMagic = (): Magic => {
  if (!magicAdmin) {
    return initializeMagic()
  }
  return magicAdmin
}

export const verifyMagicToken = async (didToken: string): Promise<any> => {
  try {
    const magic = getMagic()
    const metadata = await magic.users.getMetadataByToken(didToken)
    return metadata
  } catch (error) {
    console.error("Magic token verification error:", error)
    throw new Error("Invalid Magic token")
  }
}

export const logoutMagicUser = async (userId: string): Promise<void> => {
  try {
    const magic = getMagic()
    await magic.users.logoutByIssuer(userId)
    console.log(`User ${userId} logged out`)
  } catch (error) {
    console.error("Magic logout error:", error)
    throw error
  }
}

export default {
  initializeMagic,
  getMagic,
  verifyMagicToken,
  logoutMagicUser,
}
