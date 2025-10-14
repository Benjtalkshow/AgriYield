"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface RequestFundingModalProps {
  isOpen: boolean
  onClose: () => void
}

export function RequestFundingModal({ isOpen, onClose }: RequestFundingModalProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionComplete, setSubmissionComplete] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [formData, setFormData] = useState({
    farmName: "",
    cropType: "",
    location: "",
    farmSize: "",
    fundingGoal: "",
    duration: "",
    expectedROI: "",
    harvestDate: "",
    description: "",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.walletConnected) {
      toast.error("Please connect your wallet first")
      return
    }

    setIsSubmitting(true)
    setUploadProgress(0)

    // Simulate IPFS upload progress
    const uploadInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(uploadInterval)
          return 90
        }
        return prev + 10
      })
    }, 200)

    // Simulate submission
    setTimeout(() => {
      clearInterval(uploadInterval)
      setUploadProgress(100)
      setSubmissionComplete(true)
      setIsSubmitting(false)

      toast.success("Funding request submitted!", {
        description: "Your farm will be reviewed by our team",
      })

      // Auto-close after 3 seconds
      setTimeout(() => {
        handleClose()
      }, 3000)
    }, 2500)
  }

  const handleClose = () => {
    setFormData({
      farmName: "",
      cropType: "",
      location: "",
      farmSize: "",
      fundingGoal: "",
      duration: "",
      expectedROI: "",
      harvestDate: "",
      description: "",
    })
    setIsSubmitting(false)
    setSubmissionComplete(false)
    setUploadProgress(0)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {!submissionComplete ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Request Funding
                </DialogTitle>
                <DialogDescription>
                  Submit your farm details to request funding from investors. Your submission will be reviewed before
                  going live.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6 py-4">
                {/* Wallet Status */}
                {!user?.walletConnected ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                  >
                    <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100">Wallet Not Connected</p>
                      <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                        Please connect your wallet to request funding.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3 p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800"
                  >
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">Wallet Connected</p>
                      <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                        {user.walletAddress}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Form Fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farm-name">Farm Name *</Label>
                    <Input
                      id="farm-name"
                      placeholder="e.g., Green Valley Farm"
                      value={formData.farmName}
                      onChange={(e) => handleInputChange("farmName", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="crop-type">Crop Type *</Label>
                    <Select
                      value={formData.cropType}
                      onValueChange={(value) => handleInputChange("cropType", value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    >
                      <SelectTrigger id="crop-type">
                        <SelectValue placeholder="Select crop type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wheat">Wheat</SelectItem>
                        <SelectItem value="corn">Corn</SelectItem>
                        <SelectItem value="rice">Rice</SelectItem>
                        <SelectItem value="cassava">Cassava</SelectItem>
                        <SelectItem value="yam">Yam</SelectItem>
                        <SelectItem value="tomatoes">Tomatoes</SelectItem>
                        <SelectItem value="cocoa">Cocoa</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Lagos, Nigeria"
                      value={formData.location}
                      onChange={(e) => handleInputChange("location", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="farm-size">Farm Size (hectares) *</Label>
                    <Input
                      id="farm-size"
                      type="number"
                      placeholder="e.g., 50"
                      value={formData.farmSize}
                      onChange={(e) => handleInputChange("farmSize", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funding-goal">Funding Goal (₦) *</Label>
                    <Input
                      id="funding-goal"
                      type="number"
                      placeholder="e.g., 2500000"
                      value={formData.fundingGoal}
                      onChange={(e) => handleInputChange("fundingGoal", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="duration">Season Duration (months) *</Label>
                    <Input
                      id="duration"
                      type="number"
                      placeholder="e.g., 6"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expected-roi">Expected ROI (%) *</Label>
                    <Input
                      id="expected-roi"
                      type="number"
                      step="0.1"
                      placeholder="e.g., 14.5"
                      value={formData.expectedROI}
                      onChange={(e) => handleInputChange("expectedROI", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="harvest-date">Expected Harvest Date *</Label>
                    <Input
                      id="harvest-date"
                      type="date"
                      value={formData.harvestDate}
                      onChange={(e) => handleInputChange("harvestDate", e.target.value)}
                      disabled={!user?.walletConnected || isSubmitting}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Farm Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your farm, farming practices, and what makes your project unique..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    disabled={!user?.walletConnected || isSubmitting}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="images">Farm Images (Upload to IPFS)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">Click to upload or drag and drop</p>
                    <p className="text-xs text-muted-foreground">PNG, JPG up to 10MB (Stored on IPFS)</p>
                    <Input
                      id="images"
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      disabled={!user?.walletConnected || isSubmitting}
                    />
                  </div>
                </div>

                {/* Upload Progress */}
                {isSubmitting && uploadProgress > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uploading to IPFS...</span>
                      <span className="font-semibold">{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-2" />
                  </motion.div>
                )}

                {/* Info Box */}
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
                  <p className="font-semibold mb-1">What happens next?</p>
                  <ul className="space-y-1 ml-4 list-disc">
                    <li>Your submission will be reviewed by our verification team</li>
                    <li>Once approved, your farm will appear on the Farm Listing page</li>
                    <li>Investors can then fund your project using AGT tokens</li>
                    <li>You'll receive notifications about funding progress</li>
                  </ul>
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 gradient-primary text-white"
                    disabled={!user?.walletConnected || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Request"
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="text-center py-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-4"
              >
                <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
              </motion.div>

              <DialogHeader>
                <DialogTitle className="text-center">Request Submitted!</DialogTitle>
                <DialogDescription className="text-center">
                  Your funding request has been submitted successfully.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-6">
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Farm Name</p>
                  <p className="text-lg font-bold">{formData.farmName}</p>
                  <p className="text-xs text-muted-foreground mt-2">Funding Goal: ₦{parseInt(formData.fundingGoal).toLocaleString()}</p>
                </div>

                <div className="text-left p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    ⏳ Pending Verification
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    Your farm will be reviewed by our team within 24-48 hours. You'll receive a notification once it's
                    approved and live on the platform.
                  </p>
                </div>

                <Button onClick={handleClose} className="w-full gradient-primary text-white">
                  Done
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
}
