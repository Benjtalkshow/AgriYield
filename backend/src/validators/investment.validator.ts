import { z } from "zod"

export const createInvestmentSchema = z.object({
  farmId: z.string().min(1, "Farm ID is required"),
  amount: z.number().min(1000, "Minimum investment is ₦1,000"),
  investmentType: z.enum(["equity", "debt", "tokenized"], {
    errorMap: () => ({ message: "Invalid investment type" }),
  }),
  expectedReturn: z.number().min(0).max(100, "Expected return must be between 0-100%").optional(),
  payoutSchedule: z.enum(["monthly", "quarterly", "annually", "end_of_season"]).optional(),
  terms: z.string().max(2000, "Terms too long").optional(),
  documents: z.array(z.string().url()).optional(),
})

export const completeInvestmentSchema = z.object({
  finalROI: z.number().min(0, "Final ROI must be positive"),
})

export const processPayoutSchema = z.object({
  payoutAmount: z.number().min(1, "Payout amount must be positive"),
})

export const confirmInvestmentSchema = z.object({
  transactionHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash format"),
})
