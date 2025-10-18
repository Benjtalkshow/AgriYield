"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, TrendingUp, Calendar, Wallet } from "lucide-react"
import { useState } from "react"
import { WithdrawEarningsModal } from "./withdraw-earnings-modal"
import { useAuth } from "@/lib/auth-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const investments = [
  {
    id: 1,
    name: "Organic Wheat Farm",
    location: "Iowa, USA",
    crop: "Wheat",
    invested: 2500,
    currentValue: 2680,
    earnings: 180,
    roi: 7.2,
    status: "active",
    nextPayout: "12 days",
    progress: 65,
    isMatured: false,
  },
  {
    id: 2,
    name: "Premium Rice Cultivation",
    location: "California, USA",
    crop: "Rice",
    invested: 5000,
    currentValue: 5450,
    earnings: 450,
    roi: 9.0,
    status: "active",
    nextPayout: "25 days",
    progress: 45,
    isMatured: false,
  },
  {
    id: 3,
    name: "Sustainable Corn Harvest",
    location: "Nebraska, USA",
    crop: "Corn",
    invested: 3000,
    currentValue: 3420,
    earnings: 420,
    roi: 14.0,
    status: "completed",
    nextPayout: "Ready",
    progress: 100,
    isMatured: true,
  },
  {
    id: 4,
    name: "Apple Orchard",
    location: "Washington, USA",
    crop: "Apples",
    invested: 1950,
    currentValue: 2147,
    earnings: 197,
    roi: 10.1,
    status: "active",
    nextPayout: "18 days",
    progress: 55,
    isMatured: false,
  },
]

export function MyPortfolio() {
  const { user } = useAuth()
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false)
  const [selectedInvestment, setSelectedInvestment] = useState<typeof investments[0] | null>(null)

  const totalInvested = investments.reduce((sum, inv) => sum + inv.invested, 0)
  const totalValue = investments.reduce((sum, inv) => sum + inv.currentValue, 0)
  const totalEarnings = investments.reduce((sum, inv) => sum + inv.earnings, 0)
  const avgROI = ((totalEarnings / totalInvested) * 100).toFixed(1)

  const handleWithdrawClick = (investment: typeof investments[0]) => {
    setSelectedInvestment(investment)
    setWithdrawModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-6 md:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Invested</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalInvested.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{investments.length} farms</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Current Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
              <p className="text-xs text-emerald-600 mt-1">+${(totalValue - totalInvested).toLocaleString()}</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Earnings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalEarnings.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground mt-1">{avgROI}% ROI</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Next Payout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$425</div>
              <p className="text-xs text-muted-foreground mt-1">In 8 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Investments List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Your Investments</h2>
        {investments.map((investment, index) => (
          <motion.div
            key={investment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold mb-1">{investment.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {investment.location}
                          </div>
                          <Badge variant="outline">{investment.crop}</Badge>
                        </div>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Active</Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Harvest Progress</span>
                        <span className="font-semibold">{investment.progress}%</span>
                      </div>
                      <Progress value={investment.progress} className="h-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Invested</div>
                      <div className="text-lg font-semibold">${investment.invested.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Current Value</div>
                      <div className="text-lg font-semibold">${investment.currentValue.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">Earnings</div>
                      <div className="text-lg font-semibold text-emerald-600">+${investment.earnings}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground mb-1">ROI</div>
                      <div className="flex items-center gap-1 text-lg font-semibold text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        {investment.roi}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {investment.isMatured ? (
                      <span className="text-emerald-600 font-semibold">Ready for withdrawal</span>
                    ) : (
                      `Next payout in ${investment.nextPayout}`
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {investment.isMatured && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="sm"
                                className="gradient-primary text-white"
                                onClick={() => handleWithdrawClick(investment)}
                                disabled={!user?.walletConnected}
                              >
                                <Wallet className="h-4 w-4 mr-2" />
                                Withdraw Earnings
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!user?.walletConnected && (
                            <TooltipContent>
                              <p>Please connect your wallet to withdraw funds</p>
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Withdraw Earnings Modal */}
      {selectedInvestment && (
        <WithdrawEarningsModal
          isOpen={withdrawModalOpen}
          onClose={() => setWithdrawModalOpen(false)}
          availableEarnings={selectedInvestment.earnings}
          investmentName={selectedInvestment.name}
          investmentId={selectedInvestment.id}
        />
      )}
    </div>
  )
}
