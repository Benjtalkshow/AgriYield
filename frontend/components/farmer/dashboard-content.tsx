"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FarmerOverview } from "./farmer-overview"
import { TokenizationForm } from "./tokenization-form"
import { CampaignsList } from "./campaigns-list"

export function FarmerDashboardContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold mb-2">Farmer Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Manage your farms, create campaigns, and track your funding progress.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FarmerOverview />
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <CampaignsList />
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <TokenizationForm />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
