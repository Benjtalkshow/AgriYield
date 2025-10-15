import mongoose, { Schema, Document, Model } from "mongoose"

export type InvestmentStatus = "pending" | "active" | "completed" | "cancelled" | "failed"
export type InvestmentType = "equity" | "debt" | "tokenized"

export interface IInvestment extends Document {
  investorId: mongoose.Types.ObjectId
  farmId: mongoose.Types.ObjectId
  amount: number // investment amount in Naira
  investmentType: InvestmentType
  status: InvestmentStatus
  expectedReturn?: number // expected percentage return
  actualReturn?: number // actual return received
  investmentDate: Date
  maturityDate?: Date
  payoutSchedule?: "monthly" | "quarterly" | "annually" | "end_of_season"
  tokenAmount?: number // for tokenized investments
  tokenSymbol?: string // e.g., "FARM001"
  contractAddress?: string // blockchain contract address for tokenized investments
  transactionHash?: string // blockchain transaction hash
  roiEarned: number // total ROI earned so far
  totalPayouts: number // total amount paid out to investor
  lastPayoutDate?: Date
  nextPayoutDate?: Date
  terms?: string // investment terms and conditions
  documents: string[] // array of document URLs
  notes?: string
  createdAt: Date
  updatedAt: Date
}

const investmentSchema = new Schema<IInvestment>(
  {
    investorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    investmentType: { type: String, enum: ["equity", "debt", "tokenized"], required: true, index: true },
    status: { type: String, enum: ["pending", "active", "completed", "cancelled", "failed"], default: "pending", index: true },
    expectedReturn: { type: Number, min: 0, max: 100 }, // percentage
    actualReturn: { type: Number, min: 0 },
    investmentDate: { type: Date, required: true, default: Date.now },
    maturityDate: { type: Date },
    payoutSchedule: { type: String, enum: ["monthly", "quarterly", "annually", "end_of_season"] },
    tokenAmount: { type: Number, min: 0 },
    tokenSymbol: { type: String, trim: true },
    contractAddress: { type: String, trim: true },
    transactionHash: { type: String, trim: true },
    roiEarned: { type: Number, default: 0, min: 0 },
    totalPayouts: { type: Number, default: 0, min: 0 },
    lastPayoutDate: { type: Date },
    nextPayoutDate: { type: Date },
    terms: { type: String, trim: true, maxlength: 2000 },
    documents: [{ type: String, trim: true }],
    notes: { type: String, trim: true, maxlength: 1000 }
  },
  { timestamps: true }
)

// Indexes for better query performance
investmentSchema.index({ investorId: 1, status: 1 })
investmentSchema.index({ farmId: 1, status: 1 })
investmentSchema.index({ investmentType: 1, status: 1 })
investmentSchema.index({ investmentDate: -1 })
investmentSchema.index({ maturityDate: 1 })
investmentSchema.index({ nextPayoutDate: 1 })

// Virtual for investment duration in days
investmentSchema.virtual("investmentDuration").get(function (this: IInvestment) {
  if (!this.maturityDate) return null
  const diffTime = Math.abs(this.maturityDate.getTime() - this.investmentDate.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
})

// Virtual for current ROI percentage
investmentSchema.virtual("currentROIPercentage").get(function (this: IInvestment) {
  if (this.amount <= 0) return 0
  return (this.roiEarned / this.amount) * 100
})

// Virtual for remaining amount to be paid out
investmentSchema.virtual("remainingPayout").get(function (this: IInvestment) {
  return Math.max(0, this.amount + this.roiEarned - this.totalPayouts)
})

// Virtual for days until next payout
investmentSchema.virtual("daysUntilNextPayout").get(function (this: IInvestment) {
  if (!this.nextPayoutDate) return null
  const now = new Date()
  const diffTime = this.nextPayoutDate.getTime() - now.getTime()
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
})

// Note: Pre-save middleware removed for now - payout calculations will be handled in service layer

export const Investment: Model<IInvestment> = mongoose.model<IInvestment>("Investment", investmentSchema)
export default Investment