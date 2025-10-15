import mongoose, { Schema, Document, Model } from "mongoose"
// import { IUser } from "./User"

export type TransactionType = "investment" | "withdrawal" | "profit_claim"
export type TransactionStatus = "pending" | "confirmed" | "failed"

export interface ITransaction extends Document {
//   userId: IUser["_id"]
  transactionType: TransactionType
  amount: number
  transactionHash: string
  status: TransactionStatus
  farmId?: string
  createdAt: Date
  updatedAt: Date
  confirmedAt?: Date
  confirm(): Promise<void>
  fail(errorMessage: string): Promise<void>
}

export interface TransactionModel extends Model<ITransaction> {
  getPendingByUser(userId: string): Promise<ITransaction[]>
  getConfirmedByUser(userId: string): Promise<ITransaction[]>
  getUserSummary(userId: string): Promise<{
    totalInvested: number
    totalWithdrawn: number
    totalProfitsClaimed: number
    transactionCount: number
  }>
}

const transactionSchema = new Schema<ITransaction>(
  {
    // userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    transactionType: { type: String, enum: ["investment", "withdrawal", "profit_claim"], required: true, index: true },
    amount: { type: Number, required: true, min: 0 },
    transactionHash: { type: String, required: true, unique: true, index: true, trim: true },
    status: { type: String, enum: ["pending","confirmed","failed"], default: "pending", index: true },
    farmId: { type: Schema.Types.ObjectId, ref: "Farm", required: false, index: true },
    confirmedAt: { type: Date }
  },
  { timestamps: true }
)

// Hooks
transactionSchema.pre("save", function (next) {
  if (this.isModified("status") && this.status === "confirmed") this.confirmedAt = new Date()
  next()
})

// Instance Methods
transactionSchema.methods.confirm = async function () {
  this.status = "confirmed"
  this.confirmedAt = new Date()
  await this.save()
}

transactionSchema.methods.fail = async function (errorMessage: string) {
  this.status = "failed"
  await this.save()
}

// Static Methods
transactionSchema.statics.getPendingByUser = async function (userId: string) {
  return this.find({ userId, status: "pending" }).sort({ createdAt: -1 })
}

transactionSchema.statics.getConfirmedByUser = async function (userId: string) {
  return this.find({ userId, status: "confirmed" }).sort({ createdAt: -1 })
}

transactionSchema.statics.getUserSummary = async function (userId: string) {
  const transactions = await this.find({ userId, status: "confirmed" })
  const summary = { totalInvested: 0, totalWithdrawn: 0, totalProfitsClaimed: 0, transactionCount: transactions.length }
  transactions.forEach((tx: { transactionType: string; amount: number }) => {
    if (tx.transactionType === "investment") summary.totalInvested += tx.amount
    else if (tx.transactionType === "withdrawal") summary.totalWithdrawn += tx.amount
    else if (tx.transactionType === "profit_claim") summary.totalProfitsClaimed += tx.amount
  })
  return summary
}

export const Transaction = mongoose.model<ITransaction, TransactionModel>("Transaction", transactionSchema)
export default Transaction
