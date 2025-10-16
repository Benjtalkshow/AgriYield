"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign, Sprout, Coins } from "lucide-react"
import { PortfolioChart } from "./portfolio-chart"
import { EarningsChart } from "./earnings-chart"
import { DashboardSkeleton } from "@/components/dashboard/dashboard-skeleton"
import { useState, useEffect } from "react"

const stats = [
  {
    title: "Total Invested",
    value: "₦1,200,000",
    agtValue: "12,000 AGT",
    change: "+₦230,000 this month",
    icon: DollarSign,
    color: "text-emerald-600",
  },
  {
    title: "Total Earnings",
    value: "₦184,700",
    agtValue: "1,847 AGT",
    change: "+14.8% ROI",
    icon: TrendingUp,
    color: "text-cyan-600",
  },
  {
    title: "Active Investments",
    value: "7",
    change: "4 farms funded",
    icon: Sprout,
    color: "text-amber-600",
  },
  {
    title: "AGT Holdings",
    value: "120 AGT",
    change: "≈ ₦12,000",
    icon: Coins,
    color: "text-purple-600",
  },
]

export function InvestorOverview() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
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
                {stat.agtValue && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">{stat.agtValue}</p>
                )}
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
          <PortfolioChart />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <EarningsChart />
        </motion.div>
      </div>
    </div>
  )
}
