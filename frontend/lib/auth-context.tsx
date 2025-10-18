"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserRole = "farmer" | "investor" | "admin" | null

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  verified: boolean
  kycStatus: string
  walletAddress?: string
  farmName?: string
  farmDescription?: string
  location?: string
  profileImageUrl?: string
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string) => Promise<void>
  signUp: (email: string, name: string, role: UserRole, farmDetails?: FarmDetails) => Promise<void>
  handleMagicLinkCallback: () => Promise<void>
  signOut: () => void
  pendingEmail: string | null
  pendingRole: UserRole
  isVerifying: boolean
  emailSent: boolean
}

interface FarmDetails {
  farmName: string
  farmDescription: string
  location: string
  nin?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

let magic: any = null

const initializeMagic = async () => {
  if (typeof window === "undefined") return null
  if (magic) return magic

  try {
    const { Magic } = await import("magic-sdk")
    const magicKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY
    if (!magicKey) {
      console.error("Magic publishable key not found")
      return null
    }

    magic = new Magic(magicKey, {
      network: {
        rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
        chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
      },
    })
    return magic
  } catch (error) {
    console.error("Failed to initialize Magic:", error)
    return null
  }
}

const setCookie = (name: string, value: string, days = 7) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString()
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; secure; samesite=strict`
}

const getCookie = (name: string) => {
  const cookies = document.cookie.split("; ").reduce((acc: Record<string, string>, cookie) => {
    const [key, val] = cookie.split("=")
    acc[key] = decodeURIComponent(val)
    return acc
  }, {})
  return cookies[name]
}

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; Max-Age=0; path=/; secure; samesite=strict`
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole>(null)
  const [pendingName, setPendingName] = useState<string | null>(null)
  const [pendingFarmDetails, setPendingFarmDetails] = useState<FarmDetails | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  const router = useRouter()
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    const restoreSession = async () => {
      try {
        const magicInstance = await initializeMagic()
        const isLoggedIn = localStorage.getItem("agriyield_isLoggedIn") === "true"
        const token = getCookie("agriyield_token")

        if (isLoggedIn && token && magicInstance) {
          const isMagicLoggedIn = await magicInstance.user.isLoggedIn()

          if (isMagicLoggedIn) {
            const response = await fetch(`${API_BASE_URL}/auth/profile`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            })

            if (response.ok) {
              const data = await response.json()
              setUser(data.data.user)
              await new Promise((resolve) => setTimeout(resolve, 0))
              setIsLoading(false)
              return
            } else {
              localStorage.removeItem("agriyield_isLoggedIn")
              deleteCookie("agriyield_token")
            }
          } else {
            localStorage.removeItem("agriyield_isLoggedIn")
            deleteCookie("agriyield_token")
          }
        }
      } catch {
        localStorage.removeItem("agriyield_isLoggedIn")
        deleteCookie("agriyield_token")
      }

      setIsLoading(false)
    }

    restoreSession()
  }, [API_BASE_URL])

  const signIn = async (email: string) => {
    try {
      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      await magicInstance.auth.loginWithMagicLink({ email })

      setPendingEmail(email)
      setPendingRole(null)
      setPendingName(null)
      setPendingFarmDetails(null)
      setEmailSent(true)
    } catch (error) {
      console.error("Sign in error:", error)
      throw error instanceof Error ? error : new Error("Failed to send magic link")
    }
  }

  const signUp = async (email: string, name: string, role: UserRole, farmDetails?: FarmDetails) => {
    try {
      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      await magicInstance.auth.loginWithMagicLink({ email })

      setPendingEmail(email)
      setPendingRole(role)
      setPendingName(name)
      if (farmDetails) setPendingFarmDetails(farmDetails)
      setEmailSent(true)
    } catch (error) {
      console.error("Sign up error:", error)
      throw error instanceof Error ? error : new Error("Failed to send magic link")
    }
  }

  const handleMagicLinkCallback = async () => {
    try {
      setIsVerifying(true)
      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      const isLoggedIn = await magicInstance.user.isLoggedIn()
      if (!isLoggedIn) return

      const didToken = await magicInstance.user.getIdToken()
      const isSignUp = pendingRole !== null && pendingName !== null

      const requestBody: any = { magicToken: didToken, email: pendingEmail }
      if (isSignUp) {
        requestBody.name = pendingName
        requestBody.role = pendingRole
        if (pendingRole === "farmer" && pendingFarmDetails) {
          Object.assign(requestBody, pendingFarmDetails)
        }
      }

      const endpoint = isSignUp ? "/auth/signup" : "/auth/signin"

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${didToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Verification failed")

      const userData = data.data.user
      const token = data.data.token

      setUser(userData)
      setCookie("agriyield_token", token)
      localStorage.setItem("agriyield_isLoggedIn", "true")

      setPendingEmail(null)
      setPendingRole(null)
      setPendingName(null)
      setPendingFarmDetails(null)
      setEmailSent(false)

      const dashboardMap: Record<string, string> = {
        farmer: "/dashboard/farmer",
        investor: "/dashboard/investor",
        admin: "/dashboard/admin",
      }

      router.push(dashboardMap[userData.role] || "/dashboard/investor")
    } catch (error) {
      console.error("Magic link callback error:", error)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }

  const signOut = async () => {
    try {
      const magicInstance = await initializeMagic()
      if (magicInstance) await magicInstance.user.logout()
    } catch (error) {
      console.error("Logout error:", error)
    }

    setUser(null)
    deleteCookie("agriyield_token")
    localStorage.removeItem("agriyield_isLoggedIn")

    router.push("/signin")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        handleMagicLinkCallback,
        signOut,
        pendingEmail,
        pendingRole,
        isVerifying,
        emailSent,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
