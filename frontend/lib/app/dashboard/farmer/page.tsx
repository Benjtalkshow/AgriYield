"use client";

import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { FarmerDashboardContent } from "@/components/farmer/dashboard-content";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { motion } from "framer-motion";

export default function FarmerDashboard() {
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
          <FarmerDashboardContent />
        </main>
        <Footer />
      </motion.div>
    </ProtectedRoute>
  );
}
