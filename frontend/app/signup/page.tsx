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
import { Mail, Sprout, TrendingUp, ArrowLeft, CheckCircle2 } from "lucide-react"

export default function SignUpPage() {
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [role, setRole] = useState<"farmer" | "investor">("investor")
  const [farmName, setFarmName] = useState("")
  const [farmDescription, setFarmDescription] = useState("")
  const [location, setLocation] = useState("")
  const [nin, setNin] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailSent, setEmailSent] = useState(false)
  const { signUp, isVerifying, handleMagicLinkCallback } = useAuth()
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

    if (!email || !name) {
      setError("Email and name are required")
      return
    }

    if (role === "farmer" && (!farmName || !location)) {
      setError("Farm name and location are required for farmers")
      return
    }

    setIsLoading(true)

    try {
      const farmDetails = role === "farmer" ? { farmName, farmDescription, location, nin } : undefined
      await signUp(email, name, role, farmDetails)
      setEmailSent(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sign up"
      setError(errorMessage)

      if (errorMessage.includes("already exists")) {
        setTimeout(() => {
          router.push("/signin")
        }, 2000)
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-slate-900 dark:to-amber-950">
        <div className="w-full max-w-md">
          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
              <CardDescription>
                We've sent a magic link to <span className="font-semibold text-foreground">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  Click the link in your email to create your account. You'll be automatically redirected to your
                  dashboard.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full bg-transparent"
                onClick={() => {
                  setEmail("")
                  setName("")
                  setFarmName("")
                  setFarmDescription("")
                  setLocation("")
                  setNin("")
                  setEmailSent(false)
                }}
              >
                Send another link
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Didn't receive the email? Check your spam folder or try again.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
            <CardDescription>Join AgriYield and start your journey</CardDescription>
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
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-3">
                <Label>I want to join as</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("farmer")}
                    className={`flex flex-col items-center gap-2 border-2 rounded-lg p-4 transition-all ${
                      role === "farmer"
                        ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shadow-lg shadow-emerald-500/20"
                        : "border-border hover:border-emerald-300 dark:hover:border-emerald-700"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        role === "farmer" ? "bg-emerald-500" : "bg-emerald-100 dark:bg-emerald-900"
                      }`}
                    >
                      <Sprout
                        className={`h-6 w-6 ${role === "farmer" ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Farmer</div>
                      <div className="text-xs text-muted-foreground">Tokenize farms</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("investor")}
                    className={`flex flex-col items-center gap-2 border-2 rounded-lg p-4 transition-all ${
                      role === "investor"
                        ? "border-amber-500 bg-amber-50 dark:bg-amber-950 shadow-lg shadow-amber-500/20"
                        : "border-border hover:border-amber-300 dark:hover:border-amber-700"
                    }`}
                  >
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center transition-colors ${
                        role === "investor" ? "bg-amber-500" : "bg-amber-100 dark:bg-amber-900"
                      }`}
                    >
                      <TrendingUp
                        className={`h-6 w-6 ${role === "investor" ? "text-white" : "text-amber-600 dark:text-amber-400"}`}
                      />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-sm">Investor</div>
                      <div className="text-xs text-muted-foreground">Earn returns</div>
                    </div>
                  </button>
                </div>
              </div>

              {role === "farmer" && (
                <div className="space-y-4 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-lg border border-emerald-200 dark:border-emerald-800">
                  <h3 className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">Farm Details</h3>

                  <div className="space-y-2">
                    <Label htmlFor="farmName">Farm Name</Label>
                    <Input
                      id="farmName"
                      type="text"
                      placeholder="Green Valley Farm"
                      value={farmName}
                      onChange={(e) => setFarmName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farmDescription">Farm Description</Label>
                    <Input
                      id="farmDescription"
                      type="text"
                      placeholder="Organic vegetable farming"
                      value={farmDescription}
                      onChange={(e) => setFarmDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      type="text"
                      placeholder="Lagos, Nigeria"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nin">National ID Number (Optional)</Label>
                    <Input
                      id="nin"
                      type="text"
                      placeholder="12345678901"
                      value={nin}
                      onChange={(e) => setNin(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {error && (
                <div className="text-sm text-red-600 dark:text-red-400">
                  {error}
                  {error.includes("already exists") && <p className="text-xs mt-1">Redirecting to signin...</p>}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Creating account..." : "Continue"}
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                We'll send you a magic link to verify your email.
              </p>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/signin" className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
