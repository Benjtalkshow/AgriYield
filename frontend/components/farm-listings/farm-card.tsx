"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MapPin, Clock, TrendingUp, Users, CheckCircle2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Farm } from "@/lib/farm-data"

interface FarmCardProps {
  farm: Farm
  index: number
}

export function FarmCard({ farm, index }: FarmCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden h-full flex flex-col group hover:shadow-xl transition-shadow duration-300 border-2 hover:border-primary/50">
        {/* Farm Image */}
        <div className="relative h-48 overflow-hidden">
          <Image
            src={farm.image || "/placeholder.svg"}
            alt={farm.name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {farm.verified && (
            <Badge className="absolute top-3 right-3 bg-emerald-500 text-white">
              <CheckCircle2 className="h-3 w-3 mr-1" />
              Verified
            </Badge>
          )}
          <Badge className="absolute top-3 left-3 bg-background/90 backdrop-blur">{farm.cropType}</Badge>
        </div>

        <CardContent className="flex-1 p-6 space-y-4">
          {/* Farm Name */}
          <div>
            <h3 className="text-xl font-bold text-balance">{farm.name}</h3>
            <p className="text-sm text-muted-foreground">by {farm.farmer}</p>
          </div>

          {/* Farm Details */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{farm.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{farm.duration}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">{farm.roi}% ROI</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{farm.investors} investors</span>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Funding Progress</span>
              <span className="font-semibold">{farm.fundingProgress}%</span>
            </div>
            <Progress value={farm.fundingProgress} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>${farm.amountRaised.toLocaleString()} raised</span>
              <span>${farm.fundingGoal.toLocaleString()} goal</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button asChild className="w-full group-hover:shadow-lg transition-shadow">
            <Link href={`/farm/${farm.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
