"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "farmer" | "investor"
  requireWallet?: boolean
}

export function ProtectedRoute({ children, requiredRole, requireWallet = false }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      // Not signed in - redirect to sign in
      if (!user) {
        router.push("/signin")
        return
      }

      // Not verified - redirect to verify
      if (!user.isVerified) {
        router.push("/verify")
        return
      }

      // Wrong role - redirect to correct dashboard
      if (requiredRole && user.role !== requiredRole) {
        const correctDashboard = user.role === "farmer" ? "/dashboard/farmer" : "/dashboard/investor"
        router.push(correctDashboard)
        return
      }

      // Wallet required but not connected - stay on page but show message
      if (requireWallet && !user.walletConnected) {
        // Allow access but components can check wallet status
        return
      }
    }
  }, [user, isLoading, router, requiredRole, requireWallet])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Not authenticated or wrong role - show loading while redirecting
  if (!user || !user.isVerified || (requiredRole && user.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting...</p>
        </div>
      </div>
    )
  }

  // Authenticated and authorized - render children
  return <>{children}</>
}
