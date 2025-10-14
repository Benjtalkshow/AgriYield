"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { FarmCard } from "./farm-card"
import { FarmFilters } from "./farm-filters"
import { farms } from "@/lib/farm-data"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function FarmListingsContent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCrop, setSelectedCrop] = useState<string>("all")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [roiRange, setRoiRange] = useState<[number, number]>([0, 25])

  const filteredFarms = farms.filter((farm) => {
    const matchesSearch =
      farm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.cropType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      farm.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesCrop = selectedCrop === "all" || farm.cropType.toLowerCase() === selectedCrop.toLowerCase()

    const matchesRegion = selectedRegion === "all" || farm.location.includes(selectedRegion)

    const matchesRoi = farm.roi >= roiRange[0] && farm.roi <= roiRange[1]

    return matchesSearch && matchesCrop && matchesRegion && matchesRoi
  })

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-balance">
            Explore Farm <span className="text-primary">Opportunities</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-balance">
            Invest in verified farms and earn returns from agricultural yields
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search farms by name, crop type, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>
        </div>

        {/* Filters */}
        <FarmFilters
          selectedCrop={selectedCrop}
          setSelectedCrop={setSelectedCrop}
          selectedRegion={selectedRegion}
          setSelectedRegion={setSelectedRegion}
          roiRange={roiRange}
          setRoiRange={setRoiRange}
        />

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{filteredFarms.length}</span> farm
            {filteredFarms.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Farm Grid */}
        {filteredFarms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFarms.map((farm, index) => (
              <FarmCard key={farm.id} farm={farm} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No farms found matching your criteria</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}
