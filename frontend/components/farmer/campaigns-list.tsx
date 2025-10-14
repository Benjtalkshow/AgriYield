"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { MapPin, Calendar, TrendingUp, Eye } from "lucide-react"

const campaigns = [
  {
    id: 1,
    name: "Organic Wheat Farm",
    location: "Iowa, USA",
    crop: "Wheat",
    status: "active",
    funded: 75,
    raised: 18500,
    goal: 25000,
    roi: 14.5,
    duration: "6 months",
    daysLeft: 45,
  },
  {
    id: 2,
    name: "Sweet Corn Harvest",
    location: "Nebraska, USA",
    crop: "Corn",
    status: "funded",
    funded: 100,
    raised: 12000,
    goal: 12000,
    roi: 12.8,
    duration: "4 months",
    daysLeft: 0,
  },
  {
    id: 3,
    name: "Premium Rice Cultivation",
    location: "California, USA",
    crop: "Rice",
    status: "active",
    funded: 45,
    raised: 14730,
    goal: 32000,
    roi: 15.2,
    duration: "8 months",
    daysLeft: 120,
  },
  {
    id: 4,
    name: "Organic Tomato Farm",
    location: "Florida, USA",
    crop: "Tomatoes",
    status: "completed",
    funded: 100,
    raised: 8500,
    goal: 8500,
    roi: 13.1,
    duration: "3 months",
    daysLeft: 0,
  },
]

const statusColors = {
  active: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  funded: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  completed: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
}

export function CampaignsList() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Campaigns</h2>
          <p className="text-muted-foreground">Manage and track all your farm campaigns</p>
        </div>
      </div>

      <div className="grid gap-6">
        {campaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{campaign.name}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {campaign.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {campaign.duration}
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[campaign.status as keyof typeof statusColors]}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-semibold">
                      ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={campaign.funded} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{campaign.funded}% funded</span>
                    {campaign.daysLeft > 0 && <span>{campaign.daysLeft} days left</span>}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground">Expected ROI</div>
                      <div className="flex items-center gap-1 text-lg font-semibold text-emerald-600">
                        <TrendingUp className="h-4 w-4" />
                        {campaign.roi}%
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Crop Type</div>
                      <div className="text-lg font-semibold">{campaign.crop}</div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
