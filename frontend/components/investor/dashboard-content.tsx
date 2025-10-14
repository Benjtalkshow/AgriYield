"use client"

import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvestorOverview } from "./investor-overview"
import { AvailableCampaigns } from "./available-campaigns"
import { MyPortfolio } from "./my-portfolio"

export function InvestorDashboardContent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-4xl font-bold mb-2">Investor Dashboard</h1>
        <p className="text-muted-foreground text-lg">Discover farms, manage your portfolio, and track your returns.</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="explore">Explore Farms</TabsTrigger>
          <TabsTrigger value="portfolio">My Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <InvestorOverview />
        </TabsContent>

        <TabsContent value="explore" className="space-y-6">
          <AvailableCampaigns />
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-6">
          <MyPortfolio />
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
