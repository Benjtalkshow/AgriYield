"use client"

import type React from "react"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, Sparkles } from "lucide-react"
import { useState } from "react"

export function TokenizationForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      alert("Campaign created successfully!")
    }, 2000)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600" />
            Create New Farm Campaign
          </CardTitle>
          <CardDescription>Tokenize your agricultural project and connect with investors worldwide</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="farm-name">Farm Name</Label>
                <Input id="farm-name" placeholder="e.g., Organic Wheat Farm" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="crop-type">Crop Type</Label>
                <Select required>
                  <SelectTrigger id="crop-type">
                    <SelectValue placeholder="Select crop type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wheat">Wheat</SelectItem>
                    <SelectItem value="corn">Corn</SelectItem>
                    <SelectItem value="rice">Rice</SelectItem>
                    <SelectItem value="soybeans">Soybeans</SelectItem>
                    <SelectItem value="tomatoes">Tomatoes</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" placeholder="e.g., Iowa, USA" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="farm-size">Farm Size (acres)</Label>
                <Input id="farm-size" type="number" placeholder="e.g., 50" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="funding-goal">Funding Goal ($)</Label>
                <Input id="funding-goal" type="number" placeholder="e.g., 25000" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Season Duration (months)</Label>
                <Input id="duration" type="number" placeholder="e.g., 6" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expected-roi">Expected ROI (%)</Label>
                <Input id="expected-roi" type="number" step="0.1" placeholder="e.g., 14.5" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="harvest-date">Expected Harvest Date</Label>
                <Input id="harvest-date" type="date" required />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Farm Description</Label>
              <Textarea
                id="description"
                placeholder="Describe your farm, farming practices, and what makes your project unique..."
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="images">Farm Images</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-emerald-500 transition-colors cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                <Input id="images" type="file" multiple accept="image/*" className="hidden" />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="submit" size="lg" className="gradient-primary text-white flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creating Campaign..." : "Create Campaign"}
              </Button>
              <Button type="button" size="lg" variant="outline">
                Save as Draft
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}
