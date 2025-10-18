"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, DollarSign, Sprout, Clock, Plus } from "lucide-react"
import { YieldChart } from "./yield-chart"
import { InvestmentChart } from "./investment-chart"
import { RequestFundingModal } from "./request-funding-modal"
import { useState } from "react"

const stats = [
  {
    title: "Total Raised",
    value: "$45,230",
    change: "+12.5%",
    icon: DollarSign,
    color: "text-emerald-600",
  },
  {
    title: "Active Campaigns",
    value: "3",
    change: "2 funded",
    icon: Sprout,
    color: "text-amber-600",
  },
  {
    title: "Avg. ROI",
    value: "14.2%",
    change: "+2.1%",
    icon: TrendingUp,
    color: "text-cyan-600",
  },
  {
    title: "Days to Harvest",
    value: "45",
    change: "Next: Wheat",
    icon: Clock,
    color: "text-purple-600",
  },
]

export function FarmerOverview() {
  const [requestFundingOpen, setRequestFundingOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Request Funding CTA */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-primary/10 via-background to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-2">Need Funding for Your Farm?</h3>
                <p className="text-muted-foreground">
                  Submit your farm details and connect with investors ready to support your agricultural project.
                </p>
              </div>
              <Button
                size="lg"
                className="gradient-primary text-white whitespace-nowrap"
                onClick={() => setRequestFundingOpen(true)}
              >
                <Plus className="h-5 w-5 mr-2" />
                Request Funding
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <YieldChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <InvestmentChart />
        </motion.div>
      </div>

      {/* Request Funding Modal */}
      <RequestFundingModal isOpen={requestFundingOpen} onClose={() => setRequestFundingOpen(false)} />
    </div>
  )
}
