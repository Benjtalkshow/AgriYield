"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function FarmerRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/farmer")
  }, [router])

  return null
}
