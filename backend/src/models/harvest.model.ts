import mongoose, { Schema, Document, Model } from "mongoose"

export type HarvestStatus = "planned" | "in_progress" | "completed" | "failed"
export type QualityGrade = "premium" | "standard" | "substandard"

export interface IHarvest extends Document {
  farmId: mongoose.Types.ObjectId
  cropType: string
  expectedQuantity: number // in tons
  actualQuantity?: number // in tons
  harvestDate: Date
  status: HarvestStatus
  qualityGrade?: QualityGrade
  unitPrice?: number // price per ton
  totalValue?: number // calculated field: actualQuantity * unitPrice
  storageLocation?: string
  notes?: string
  images: string[] // array of harvest images
  weatherConditions?: {
    temperature?: number
    humidity?: number
    rainfall?: number
  }
  laborCost?: number
  equipmentCost?: number
  transportationCost?: number
  totalCost?: number // calculated field: labor + equipment + transportation
  netProfit?: number // calculated field: totalValue - totalCost
  createdBy: mongoose.Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const harvestSchema = new Schema<IHarvest>(
  {
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    cropType: { type: String, required: true, trim: true },
    expectedQuantity: { type: Number, required: true, min: 0 },
    actualQuantity: { type: Number, min: 0 },
    harvestDate: { type: Date, required: true },
    status: { type: String, enum: ["planned", "in_progress", "completed", "failed"], default: "planned", index: true },
    qualityGrade: { type: String, enum: ["premium", "standard", "substandard"] },
    unitPrice: { type: Number, min: 0 },
    totalValue: { type: Number, min: 0 },
    storageLocation: { type: String, trim: true },
    notes: { type: String, trim: true, maxlength: 1000 },
    images: [{ type: String, trim: true }],
    weatherConditions: {
      temperature: { type: Number },
      humidity: { type: Number, min: 0, max: 100 },
      rainfall: { type: Number, min: 0 }
    },
    laborCost: { type: Number, min: 0, default: 0 },
    equipmentCost: { type: Number, min: 0, default: 0 },
    transportationCost: { type: Number, min: 0, default: 0 },
    totalCost: { type: Number, min: 0, default: 0 },
    netProfit: { type: Number },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
)

// Indexes for better query performance
harvestSchema.index({ farmId: 1, harvestDate: -1 })
harvestSchema.index({ status: 1, harvestDate: -1 })
harvestSchema.index({ cropType: 1, status: 1 })
harvestSchema.index({ createdAt: -1 })
harvestSchema.index({ harvestDate: -1 })

// Virtual for harvest efficiency (actual vs expected)
harvestSchema.virtual("harvestEfficiency").get(function (this: IHarvest) {
  if (!this.actualQuantity || this.expectedQuantity <= 0) return 0
  return (this.actualQuantity / this.expectedQuantity) * 100
})

// Virtual for profit margin percentage
harvestSchema.virtual("profitMargin").get(function (this: IHarvest) {
  if (!this.totalValue || this.totalValue <= 0) return 0
  const totalCost = this.totalCost || 0
  return totalCost > 0 ? ((this.totalValue - totalCost) / this.totalValue) * 100 : 100
})

// Note: Pre-save middleware removed for now - calculations will be handled in service layer

export const Harvest: Model<IHarvest> = mongoose.model<IHarvest>("Harvest", harvestSchema)
export default Harvest