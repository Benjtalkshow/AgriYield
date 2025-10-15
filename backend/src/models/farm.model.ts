import mongoose, { Schema, Document, Model } from "mongoose"

export type FarmStatus = "active" | "inactive" | "pending" | "completed"
export type FarmType = "crop" | "livestock" | "mixed" | "poultry" | "fishery"
export type IrrigationType = "rainfed" | "irrigated" | "supplemental"

export interface IFarm extends Document {
  name: string
  description: string
  location: {
    address: string
    coordinates?: {
      latitude: number
      longitude: number
    }
    state: string
    country: string
  }
  farmerId: mongoose.Types.ObjectId
  farmType: FarmType
  totalArea: number // in hectares
  cultivatedArea: number // in hectares
  irrigationType: IrrigationType
  crops: string[] // array of crop types
  status: FarmStatus
  images: string[] // array of image URLs
  documents: string[] // array of document URLs
  expectedYield: number // expected yield in tons
  plantingDate?: Date
  harvestDate?: Date
  isVerified: boolean
  verificationDate?: Date
  totalInvested: number // total amount invested in this farm
  investorCount: number // number of unique investors
  createdAt: Date
  updatedAt: Date
}

const farmSchema = new Schema<IFarm>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, required: true, trim: true, maxlength: 1000 },
    location: {
      address: { type: String, required: true, trim: true },
      coordinates: {
        latitude: { type: Number, min: -90, max: 90 },
        longitude: { type: Number, min: -180, max: 180 }
      },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true, default: "Nigeria" }
    },
    farmerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmType: { type: String, enum: ["crop", "livestock", "mixed", "poultry", "fishery"], required: true, index: true },
    totalArea: { type: Number, required: true, min: 0.1 },
    cultivatedArea: { type: Number, required: true, min: 0.1 },
    irrigationType: { type: String, enum: ["rainfed", "irrigated", "supplemental"], required: true },
    crops: [{ type: String, trim: true }],
    status: { type: String, enum: ["active", "inactive", "pending", "completed"], default: "pending", index: true },
    images: [{ type: String, trim: true }],
    documents: [{ type: String, trim: true }],
    expectedYield: { type: Number, required: true, min: 0 },
    plantingDate: { type: Date },
    harvestDate: { type: Date },
    isVerified: { type: Boolean, default: false },
    verificationDate: { type: Date },
    totalInvested: { type: Number, default: 0, min: 0 },
    investorCount: { type: Number, default: 0, min: 0 }
  },
  { timestamps: true }
)

// Indexes for better query performance
farmSchema.index({ farmerId: 1, status: 1 })
farmSchema.index({ status: 1, farmType: 1 })
farmSchema.index({ "location.state": 1, status: 1 })
farmSchema.index({ isVerified: 1, status: 1 })
farmSchema.index({ createdAt: -1 })
farmSchema.index({ totalInvested: -1 })

// Virtual for cultivated area percentage
farmSchema.virtual("cultivatedPercentage").get(function (this: IFarm) {
  return this.totalArea > 0 ? (this.cultivatedArea / this.totalArea) * 100 : 0
})

// Virtual for farm age in days
farmSchema.virtual("farmAgeInDays").get(function (this: IFarm) {
  if (!this.plantingDate) return null
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - this.plantingDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Note: Pre-save middleware removed for now - will be handled in service layer

export const Farm: Model<IFarm> = mongoose.model<IFarm>("Farm", farmSchema)
export default Farm