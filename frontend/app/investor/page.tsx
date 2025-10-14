"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function InvestorRedirectPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard/investor")
  }, [router])

  return null
}
