"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Card } from "@/components/ui/card"

interface FarmFiltersProps {
  selectedCrop: string
  setSelectedCrop: (value: string) => void
  selectedRegion: string
  setSelectedRegion: (value: string) => void
  roiRange: [number, number]
  setRoiRange: (value: [number, number]) => void
}

export function FarmFilters({
  selectedCrop,
  setSelectedCrop,
  selectedRegion,
  setSelectedRegion,
  roiRange,
  setRoiRange,
}: FarmFiltersProps) {
  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crop Type Filter */}
        <div className="space-y-2">
          <Label>Crop Type</Label>
          <Select value={selectedCrop} onValueChange={setSelectedCrop}>
            <SelectTrigger>
              <SelectValue placeholder="All crops" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Crops</SelectItem>
              <SelectItem value="wheat">Wheat</SelectItem>
              <SelectItem value="rice">Rice</SelectItem>
              <SelectItem value="corn">Corn</SelectItem>
              <SelectItem value="tomatoes">Tomatoes</SelectItem>
              <SelectItem value="soybeans">Soybeans</SelectItem>
              <SelectItem value="apples">Apples</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Region Filter */}
        <div className="space-y-2">
          <Label>Region</Label>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger>
              <SelectValue placeholder="All regions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Regions</SelectItem>
              <SelectItem value="Iowa">Iowa</SelectItem>
              <SelectItem value="California">California</SelectItem>
              <SelectItem value="Nebraska">Nebraska</SelectItem>
              <SelectItem value="Florida">Florida</SelectItem>
              <SelectItem value="Illinois">Illinois</SelectItem>
              <SelectItem value="Washington">Washington</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* ROI Range Filter */}
        <div className="space-y-2">
          <Label>
            ROI Range: {roiRange[0]}% - {roiRange[1]}%
          </Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={roiRange}
            onValueChange={(value) => setRoiRange(value as [number, number])}
            className="mt-2"
          />
        </div>
      </div>
    </Card>
  )
}
