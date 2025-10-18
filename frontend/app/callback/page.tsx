"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, AlertCircle } from "lucide-react"

export default function CallbackPage() {
  const { handleMagicLinkCallback, isVerifying } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const authenticate = async () => {
      try {
        console.log(" Callback page loaded, handling magic link...")
        await handleMagicLinkCallback()
      } catch (err) {
        console.error(" Callback error:", err)
        setError(err instanceof Error ? err.message : "Authentication failed")
        setTimeout(() => {
          router.push("/signin")
        }, 3000)
      }
    }

    authenticate()
  }, [handleMagicLinkCallback, router])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
        <div className="w-full max-w-md">
          <Card className="border-red-200 dark:border-red-800">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Authentication Error</CardTitle>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground text-center">Redirecting to sign in...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
      <div className="w-full max-w-md">
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="space-y-1 text-center">
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Authenticating</CardTitle>
            <CardDescription>Please wait while we verify your magic link...</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground text-center">You'll be redirected to your dashboard shortly.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
