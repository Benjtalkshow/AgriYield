"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, TrendingUp, Users, CheckCircle2, DollarSign, Calendar, ArrowLeft, Wallet } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Farm } from "@/lib/farm-data"
import { FarmMap } from "./farm-map"
import { InvestorsTable } from "./investors-table"
import { InvestModal } from "./invest-modal"
import { useAuth } from "@/lib/auth-context"
import { useToast } from "@/components/ui/toast"
import { useState } from "react"
import { useRouter } from "next/navigation"

interface FarmDetailsContentProps {
  farm: Farm
}

export function FarmDetailsContent({ farm }: FarmDetailsContentProps) {
  const { user } = useAuth()
  const { addToast } = useToast()
  const router = useRouter()
  const [investModalOpen, setInvestModalOpen] = useState(false)

  const handleInvestClick = () => {
    if (!user) {
      addToast("Please sign in to invest", "error")
      router.push("/signin")
      return
    }

    if (!user.walletConnected) {
      addToast("Please connect your wallet to proceed", "error")
      return
    }

    setInvestModalOpen(true)
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          {/* Back Button */}
          <Link
            href="/farm-listings"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to listings
          </Link>

          {/* Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Farm Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative h-[400px] rounded-2xl overflow-hidden"
            >
              <Image src={farm.image || "/placeholder.svg"} alt={farm.name} fill className="object-cover" />
              {farm.verified && (
                <Badge className="absolute top-4 right-4 bg-emerald-500 text-white">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </motion.div>

            {/* Farm Info Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-3xl mb-2">{farm.name}</CardTitle>
                      <p className="text-muted-foreground">by {farm.farmer}</p>
                    </div>
                    <Badge variant="outline" className="text-base px-3 py-1">
                      {farm.cropType}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4" />
                        <span>Expected ROI</span>
                      </div>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{farm.roi}%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Duration</span>
                      </div>
                      <p className="text-2xl font-bold">{farm.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>Location</span>
                      </div>
                      <p className="text-lg font-semibold">{farm.location}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Investors</span>
                      </div>
                      <p className="text-lg font-semibold">{farm.investors}</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Funding Progress */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Funding Progress</span>
                      <span className="text-sm font-bold">{farm.fundingProgress}%</span>
                    </div>
                    <Progress value={farm.fundingProgress} className="h-3" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        <span className="font-semibold text-foreground">₦{farm.amountRaised.toLocaleString()}</span>{" "}
                        raised
                      </span>
                      <span className="text-muted-foreground">
                        Goal:{" "}
                        <span className="font-semibold text-foreground">₦{farm.fundingGoal.toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Investment Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Minimum Investment</span>
                      <span className="font-semibold">₦{farm.minInvestment.toLocaleString()}</span>
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full gradient-primary text-white"
                    onClick={handleInvestClick}
                    disabled={farm.fundingProgress >= 100}
                  >
                    {farm.fundingProgress >= 100 ? (
                      "Fully Funded"
                    ) : !user ? (
                      "Sign In to Invest"
                    ) : !user.walletConnected ? (
                      <>
                        <Wallet className="h-5 w-5 mr-2" />
                        Connect Wallet to Invest
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-5 w-5 mr-2" />
                        Invest Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Description and Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Overview */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{farm.description}</p>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Financial Summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Financial Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Funding Goal</span>
                        </div>
                        <p className="text-2xl font-bold">₦{farm.fundingGoal.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Amount Raised</span>
                        </div>
                        <p className="text-2xl font-bold">₦{farm.amountRaised.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <TrendingUp className="h-4 w-4" />
                          <span>Expected ROI</span>
                        </div>
                        <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{farm.roi}%</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>Duration</span>
                        </div>
                        <p className="text-2xl font-bold">{farm.duration}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          <span>Minimum Investment</span>
                        </div>
                        <p className="text-2xl font-bold">₦{farm.minInvestment.toLocaleString()}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Total Investors</span>
                        </div>
                        <p className="text-2xl font-bold">{farm.investors}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* Investors Table */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Investors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <InvestorsTable farmId={farm.id} />
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="lg:col-span-1"
            >
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Location</CardTitle>
                </CardHeader>
                <CardContent>
                  <FarmMap coordinates={farm.coordinates} farmName={farm.name} />
                  <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{farm.location}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>

      <InvestModal
        isOpen={investModalOpen}
        onClose={() => setInvestModalOpen(false)}
        farmName={farm.name}
        minInvestment={farm.minInvestment}
        roi={farm.roi}
      />
    </>
  )
}
