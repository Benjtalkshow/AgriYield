"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Calendar, TrendingUp, Search, Filter } from "lucide-react"
import { useState } from "react"

const campaigns = [
  {
    id: 1,
    name: "Organic Wheat Farm",
    location: "Iowa, USA",
    region: "North America",
    crop: "Wheat",
    funded: 75,
    raised: 18500,
    goal: 25000,
    roi: 14.5,
    duration: "6 months",
    daysLeft: 45,
    image: "/golden-wheat-farm.png",
  },
  {
    id: 2,
    name: "Premium Rice Cultivation",
    location: "California, USA",
    region: "North America",
    crop: "Rice",
    funded: 45,
    raised: 14730,
    goal: 32000,
    roi: 15.2,
    duration: "8 months",
    daysLeft: 120,
    image: "/rice-farm.jpg",
  },
  {
    id: 3,
    name: "Sustainable Corn Harvest",
    location: "Nebraska, USA",
    region: "North America",
    crop: "Corn",
    funded: 60,
    raised: 15000,
    goal: 25000,
    roi: 13.8,
    duration: "5 months",
    daysLeft: 75,
    image: "/corn-farm.png",
  },
  {
    id: 4,
    name: "Organic Tomato Farm",
    location: "Florida, USA",
    region: "North America",
    crop: "Tomatoes",
    funded: 30,
    raised: 6000,
    goal: 20000,
    roi: 16.5,
    duration: "4 months",
    daysLeft: 90,
    image: "/tomato-farm.jpg",
  },
  {
    id: 5,
    name: "Soybean Plantation",
    location: "Illinois, USA",
    region: "North America",
    crop: "Soybeans",
    funded: 85,
    raised: 21250,
    goal: 25000,
    roi: 12.3,
    duration: "6 months",
    daysLeft: 30,
    image: "/soybean-farm.jpg",
  },
  {
    id: 6,
    name: "Apple Orchard",
    location: "Washington, USA",
    region: "North America",
    crop: "Apples",
    funded: 50,
    raised: 15000,
    goal: 30000,
    roi: 14.0,
    duration: "7 months",
    daysLeft: 105,
    image: "/apple-orchard.png",
  },
]

export function AvailableCampaigns() {
  const [searchTerm, setSearchTerm] = useState("")
  const [cropFilter, setCropFilter] = useState("all")
  const [roiFilter, setRoiFilter] = useState("all")

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCrop = cropFilter === "all" || campaign.crop === cropFilter
    const matchesROI =
      roiFilter === "all" ||
      (roiFilter === "high" && campaign.roi >= 15) ||
      (roiFilter === "medium" && campaign.roi >= 12 && campaign.roi < 15) ||
      (roiFilter === "low" && campaign.roi < 12)
    return matchesSearch && matchesCrop && matchesROI
  })

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Campaigns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search farms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={cropFilter} onValueChange={setCropFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Crop Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                <SelectItem value="Wheat">Wheat</SelectItem>
                <SelectItem value="Corn">Corn</SelectItem>
                <SelectItem value="Rice">Rice</SelectItem>
                <SelectItem value="Soybeans">Soybeans</SelectItem>
                <SelectItem value="Tomatoes">Tomatoes</SelectItem>
                <SelectItem value="Apples">Apples</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roiFilter} onValueChange={setRoiFilter}>
              <SelectTrigger>
                <SelectValue placeholder="ROI Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All ROI</SelectItem>
                <SelectItem value="high">High (15%+)</SelectItem>
                <SelectItem value="medium">Medium (12-15%)</SelectItem>
                <SelectItem value="low">Low (&lt;12%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Campaigns Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCampaigns.map((campaign, index) => (
          <motion.div
            key={campaign.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
            whileHover={{ y: -8, boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}
            className="group"
          >
            <Card className="overflow-hidden h-full transition-all hover:shadow-xl hover:border-emerald-500/50">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={campaign.image || "/placeholder.svg"}
                  alt={campaign.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge className="bg-emerald-500/90 text-white backdrop-blur-sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {campaign.roi}% ROI
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-lg group-hover:text-emerald-600 transition-colors">
                  {campaign.name}
                </CardTitle>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {campaign.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {campaign.duration}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-semibold">
                      ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                    </span>
                  </div>
                  <Progress value={campaign.funded} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{campaign.funded}% funded</span>
                    <span>{campaign.daysLeft} days left</span>
                  </div>
                </div>

                <Button className="w-full gradient-primary text-white group-hover:shadow-lg transition-shadow">
                  Invest Now
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No campaigns match your filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
