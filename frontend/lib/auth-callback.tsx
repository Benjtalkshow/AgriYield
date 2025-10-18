"use client"

import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"

export function AuthCallback() {
  const { handleMagicLinkCallback, isVerifying, user } = useAuth()

  useEffect(() => {
    const checkAndHandleCallback = async () => {
      if (user || isVerifying) return

      try {
        const { Magic } = await import("magic-sdk")
        const magicKey = process.env.NEXT_PUBLIC_MAGIC_PUBLISHABLE_KEY

        if (!magicKey) return

        const magic = new Magic(magicKey, {
          network: {
            rpcUrl: process.env.NEXT_PUBLIC_RPC_URL!,
            chainId: Number.parseInt(process.env.NEXT_PUBLIC_CHAIN_ID!),
          },
        })

        const isMagicLoggedIn = await magic.user.isLoggedIn()

        if (isMagicLoggedIn) {
          await handleMagicLinkCallback()
        }
      } catch (error) {
        console.error("AuthCallback error:", error)
      }
    }

    checkAndHandleCallback()
  }, [user, isVerifying, handleMagicLinkCallback])

  return null
}
