"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import Link from "next/link"
import { Mail, ArrowLeft } from "lucide-react"

export default function SignInPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const { signIn, isVerifying, handleMagicLinkCallback } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      try {
        await handleMagicLinkCallback()
      } catch (err) {
        console.error("[v0] Magic link callback error:", err)
        setError(err instanceof Error ? err.message : "Verification failed")
      }
    }

    const checkMagicCallback = async () => {
      const magicInstance = await import("@/lib/auth").then((m) => m.initializeMagic())
      if (magicInstance) {
        const isLoggedIn = await magicInstance.user.isLoggedIn()
        if (isLoggedIn) {
          handleCallback()
        }
      }
    }

    checkMagicCallback()
  }, [handleMagicLinkCallback])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
        <div className="w-full max-w-md">
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-bold">Redirecting...</CardTitle>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <LoadingSpinner message="Redirecting to dashboard..." />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      await signIn(email)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign in"
      setError(errorMessage)

      if (errorMessage.includes("not found")) {
        setTimeout(() => {
          router.push("/signup")
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription>Sign in to your AgriYield account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                  {error.includes("not found") && <p className="text-xs mt-1">Redirecting to signup...</p>}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Sending magic link..." : "Send Magic Link"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll send you a magic link to sign in securely.
              </p>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link href="/signup" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
