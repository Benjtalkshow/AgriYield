"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Mail, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

type Step = "email" | "code" | "password" | "success"

export function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [step, setStep] = useState<Step>("email")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [countdown, setCountdown] = useState(90)
  const [canResend, setCanResend] = useState(false)
  const { addToast } = useToast()

  useEffect(() => {
    if (step === "code" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0) {
      setCanResend(true)
    }
  }, [countdown, step])

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setTimeout(() => {
        setStep("email")
        setEmail("")
        setCode("")
        setNewPassword("")
        setConfirmPassword("")
        setCountdown(90)
        setCanResend(false)
      }, 300)
    }
  }, [isOpen])

  const handleSendResetLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Mock sending reset code
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("[v0] Reset code sent to:", email)
      setStep("code")
      setCountdown(90)
      setCanResend(false)
      addToast("Reset code sent to your email", "success")
    } catch (error) {
      addToast("Failed to send reset code", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    if (code.length !== 6) {
      addToast("Please enter a valid 6-digit code", "error")
      return
    }
    setIsLoading(true)
    try {
      // Mock verifying code
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("password")
      addToast("Code verified successfully", "success")
    } catch (error) {
      addToast("Invalid verification code", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      addToast("Passwords do not match", "error")
      return
    }
    if (newPassword.length < 8) {
      addToast("Password must be at least 8 characters", "error")
      return
    }
    setIsLoading(true)
    try {
      // Mock resetting password
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setStep("success")
      addToast("Password updated successfully", "success")
      setTimeout(() => {
        onClose()
      }, 2000)
    } catch (error) {
      addToast("Failed to reset password", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (!canResend) return
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setCountdown(90)
      setCanResend(false)
      addToast("Code resent successfully", "success")
    } catch (error) {
      addToast("Failed to resend code", "error")
    }
  }

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6)
    setCode(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="pointer-events-auto w-full max-w-md"
            >
              <Card className="border-emerald-200 dark:border-emerald-800 shadow-2xl">
                <CardHeader className="relative">
                  <button
                    onClick={onClose}
                    className="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                  <AnimatePresence mode="wait">
                    {step === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.6, times: [0, 0.6, 1] }}
                        className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"
                      >
                        <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="icon"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center mb-4"
                      >
                        {step === "email" && <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                        {step === "code" && <Mail className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                        {step === "password" && <Lock className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <CardTitle className="text-2xl font-bold text-center">
                    {step === "email" && "Reset Password"}
                    {step === "code" && "Enter Code"}
                    {step === "password" && "New Password"}
                    {step === "success" && "Password Reset!"}
                  </CardTitle>
                  <CardDescription className="text-center">
                    {step === "email" && "Enter your email to receive a reset code"}
                    {step === "code" && `We sent a 6-digit code to ${email}`}
                    {step === "password" && "Create a new password for your account"}
                    {step === "success" && "Your password has been updated successfully"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnimatePresence mode="wait">
                    {step === "email" && (
                      <motion.form
                        key="email-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSendResetLink}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="reset-email">Email</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Sending..." : "Send Reset Code"}
                        </Button>
                      </motion.form>
                    )}

                    {step === "code" && (
                      <motion.form
                        key="code-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleVerifyCode}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="reset-code">Verification Code</Label>
                          <Input
                            id="reset-code"
                            type="text"
                            inputMode="numeric"
                            placeholder="000000"
                            value={code}
                            onChange={handleCodeChange}
                            required
                            className="text-center text-2xl tracking-widest font-mono"
                            maxLength={6}
                          />
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading || code.length !== 6}>
                          {isLoading ? "Verifying..." : "Verify Code"}
                        </Button>
                        <div className="text-center text-sm">
                          {countdown > 0 ? (
                            <p className="text-muted-foreground">
                              Resend code in{" "}
                              <span className="font-mono font-semibold text-foreground">
                                {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, "0")}
                              </span>
                            </p>
                          ) : (
                            <button
                              type="button"
                              onClick={handleResendCode}
                              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
                            >
                              Resend code
                            </button>
                          )}
                        </div>
                      </motion.form>
                    )}

                    {step === "password" && (
                      <motion.form
                        key="password-form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleResetPassword}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="new-password">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password">Confirm Password</Label>
                          <div className="relative">
                            <Input
                              id="confirm-new-password"
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              required
                              className="pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                          {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                      </motion.form>
                    )}

                    {step === "success" && (
                      <motion.div
                        key="success-message"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-4"
                      >
                        <p className="text-muted-foreground">You can now sign in with your new password</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
