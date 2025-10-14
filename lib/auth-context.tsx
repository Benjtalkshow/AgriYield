"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type UserRole = "farmer" | "investor" | null

interface User {
  email: string
  role: UserRole
  isVerified: boolean
  walletConnected: boolean
  walletAddress?: string
  hasSeenOnboarding?: boolean
}

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, role: UserRole, password: string) => Promise<void>
  verifyCode: (code: string) => Promise<void>
  resendCode: () => Promise<void>
  connectWallet: (address: string) => Promise<void>
  signOut: () => void
  markOnboardingComplete: () => void
  pendingEmail: string | null
  pendingRole: UserRole
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [pendingEmail, setPendingEmail] = useState<string | null>(null)
  const [pendingRole, setPendingRole] = useState<UserRole>(null)
  const [pendingPassword, setPendingPassword] = useState<string | null>(null)

  useEffect(() => {
    // Check for existing session in localStorage
    const storedUser = localStorage.getItem("agriyield_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const signIn = async (email: string, password: string) => {
    // Mock Magic Labs sign in - send verification code
    setPendingEmail(email)
    setPendingPassword(password)
    setPendingRole(null)
    // In production, Magic Labs would send the code
    console.log("[v0] Verification code sent to:", email)
  }

  const signUp = async (email: string, role: UserRole, password: string) => {
    // Mock Magic Labs sign up - send verification code
    setPendingEmail(email)
    setPendingRole(role)
    setPendingPassword(password)
    // In production, Magic Labs would send the code
    console.log("[v0] Verification code sent to:", email, "Role:", role)
  }

  const verifyCode = async (code: string) => {
    // Mock verification - in production, verify with Magic Labs
    if (code.length === 6 && pendingEmail) {
      const newUser: User = {
        email: pendingEmail,
        role: pendingRole,
        isVerified: true,
        walletConnected: false,
        hasSeenOnboarding: false,
      }
      setUser(newUser)
      localStorage.setItem("agriyield_user", JSON.stringify(newUser))
      setPendingEmail(null)
      setPendingRole(null)
      setPendingPassword(null)
    } else {
      throw new Error("Invalid verification code")
    }
  }

  const resendCode = async () => {
    if (pendingEmail) {
      // Mock resending code - in production, call Magic Labs API
      console.log("[v0] Verification code resent to:", pendingEmail)
      return Promise.resolve()
    }
    return Promise.reject(new Error("No pending email"))
  }

  const connectWallet = async (address: string) => {
    if (user) {
      const updatedUser = { ...user, walletConnected: true, walletAddress: address }
      setUser(updatedUser)
      localStorage.setItem("agriyield_user", JSON.stringify(updatedUser))
    }
  }

  const markOnboardingComplete = () => {
    if (user) {
      const updatedUser = { ...user, hasSeenOnboarding: true }
      setUser(updatedUser)
      localStorage.setItem("agriyield_user", JSON.stringify(updatedUser))
    }
  }

  const signOut = () => {
    setUser(null)
    localStorage.removeItem("agriyield_user")
    setPendingEmail(null)
    setPendingRole(null)
    setPendingPassword(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        verifyCode,
        resendCode,
        connectWallet,
        signOut,
        markOnboardingComplete,
        pendingEmail,
        pendingRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
