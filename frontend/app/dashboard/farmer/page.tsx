"use client"

import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { FarmerDashboardContent } from "@/components/farmer/dashboard-content"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default function FarmerDashboardPage() {
  const { user, signOut } = useAuth()

  const handleSignOut = () => {
    signOut()
  }

  return (
    <ProtectedRoute requiredRole="farmer">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen bg-muted/30"
      >
        <Navigation />
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Button variant="ghost" onClick={handleSignOut} className="gap-2 hover:cursor-pointer">
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
          <FarmerDashboardContent />
        </main>
        <Footer />
      </motion.div>
    </ProtectedRoute>
  )
}
