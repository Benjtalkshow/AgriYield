"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { initializeMagic } from "./auth"

type UserRole = "farmer" | "investor" | "admin" | null

interface User {
  id: string
  email: string
  name: string
  role: UserRole
  kycStatus: string
  walletAddress?: string
  farmName?: string
  farmDescription?: string
  location?: string
  profileImageUrl?: string
  isVerified?: boolean
  walletConnected?: boolean
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

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

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
        const isLoggedIn = localStorage.getItem("agriyield_isLoggedIn") === "true"
        const token = getCookie("agriyield_token")

        if (isLoggedIn && token) {
          const magicInstance = await initializeMagic()
          if (magicInstance) {
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
                setIsLoading(false)
                return
              } else {
                await magicInstance.user.logout()
                localStorage.removeItem("agriyield_isLoggedIn")
                deleteCookie("agriyield_token")
              }
            } else {
              localStorage.removeItem("agriyield_isLoggedIn")
              deleteCookie("agriyield_token")
            }
          }
        }
      } catch (error) {
        console.error(" Session restore error:", error)
        try {
          const magicInstance = await initializeMagic()
          if (magicInstance) await magicInstance.user.logout()
        } catch (e) {
          console.error(" Error clearing Magic session:", e)
        }
        localStorage.removeItem("agriyield_isLoggedIn")
        deleteCookie("agriyield_token")
      }

      setIsLoading(false)
    }

    restoreSession()
  }, [API_BASE_URL])

  const signIn = async (email: string) => {
    try {
      const checkResponse = await fetch(`${API_BASE_URL}/auth/check-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      if (!checkResponse.ok || !checkData.data.exists) {
        throw new Error("User not found. Please sign up first.")
      }

      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      await magicInstance.auth.loginWithMagicLink({ email })
      window.location.reload()
      setPendingEmail(email)
      setPendingRole(null)
      setPendingName(null)
      setPendingFarmDetails(null)
      setEmailSent(true)
    } catch (error) {
      console.error(" Sign in error:", error)
      throw error instanceof Error ? error : new Error("Failed to send magic link")
    }
  }

  const signUp = async (email: string, name: string, role: UserRole, farmDetails?: FarmDetails) => {
    try {
      const checkResponse = await fetch(`${API_BASE_URL}/auth/check-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const checkData = await checkResponse.json()

      if (checkResponse.ok && checkData.data.exists) {
        throw new Error("User already exists. Please sign in instead.")
      }

      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      await magicInstance.auth.loginWithMagicLink({ email })
      window.location.reload()

      setPendingEmail(email)
      setPendingRole(role)
      setPendingName(name)
      if (farmDetails) setPendingFarmDetails(farmDetails)
      setEmailSent(true)
    } catch (error) {
      console.error(" Sign up error:", error)
      throw error instanceof Error ? error : new Error("Failed to send magic link")
    }
  }

  const handleMagicLinkCallback = async () => {
    try {
      setIsVerifying(true)
      const magicInstance = await initializeMagic()
      if (!magicInstance) throw new Error("Magic SDK not initialized")

      if (!API_BASE_URL) {
        console.error(" API_BASE_URL is not set. Check NEXT_PUBLIC_API_URL environment variable")
        throw new Error("API configuration missing. Please contact support.")
      }

      const isLoggedIn = await magicInstance.user.isLoggedIn()
      if (!isLoggedIn) {
        throw new Error("Magic link verification failed. Please try signing in again.")
      }

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
      const fullUrl = `${API_BASE_URL}${endpoint}`

      console.log(" API_BASE_URL:", API_BASE_URL)
      console.log(" Endpoint:", endpoint)
      console.log(" Full URL:", fullUrl)
      console.log(" Request body:", JSON.stringify(requestBody, null, 2))
      console.log(" Is signup:", isSignUp)

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${didToken}`,
        },
        body: JSON.stringify(requestBody),
      })

      console.log(" Response status:", response.status)
      console.log(" Response headers:", Object.fromEntries(response.headers.entries()))

      const data = await response.json()
      console.log(" Response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.error(" Backend error:", data.message || "Verification failed")
        throw new Error(data.message || "Verification failed")
      }

      const userData = data.data.user
      const token = data.data.token

      console.log(" Auth successful, user role:", userData.role)

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

      const redirectPath = dashboardMap[userData.role] || "/dashboard/investor"
      console.log(" Redirecting to:", redirectPath)

      await new Promise((resolve) => setTimeout(resolve, 100))
      router.push(redirectPath)
    } catch (error) {
      console.error(" Callback failed:", error)
      throw error
    } finally {
      setIsVerifying(false)
    }
  }

  const signOut = async () => {
    try {
      const magicInstance = await initializeMagic()
      if (magicInstance) await magicInstance.user.logout()
      window.location.reload()
    } catch (error) {
      console.error(" Logout error:", error)
    }

    setUser(null)
    deleteCookie("agriyield_token")
    localStorage.removeItem("agriyield_isLoggedIn")
    router.push("/signin")
    window.location.reload()
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
