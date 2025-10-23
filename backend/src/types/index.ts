export enum FarmStatus {
  Active = 0,
  Funded = 1,
  PaidOut = 2,
  Settled = 3,
  Closed = 4,
}

export enum UserRole {
  Admin = "admin",
  Farmer = "farmer",
  Investor = "investor",
}

export interface IUser {
  _id: string
  walletAddress: string
  email?: string
  role: UserRole
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IFarm {
  farmId: number
  farmer: string
  name: string
  description: string
  fundingGoal: string
  sharePrice: string
  totalInvested: string
  proceeds: string
  deadline: number
  verified: boolean
  status: FarmStatus
  metaCID: string
  minROI: number
  maxROI: number
  // Off-chain data
  images?: string[]
  location?: string
  category?: string
  documents?: string[]
  createdAt: Date
  updatedAt: Date
  syncedFromChain: boolean
}

export interface IInvestment {
  farmId: number
  investor: string
  amount: string
  shares: string
  txHash: string
  timestamp: Date
  claimed: boolean
}

export interface ITransaction {
  txHash: string
  type: "farm_created" | "investment" | "disbursement" | "proceeds_deposit" | "claim" | "refund"
  farmId: number
  from: string
  to?: string
  amount?: string
  status: "pending" | "confirmed" | "failed"
  blockNumber?: number
  timestamp: Date
}

export interface ContractFarm {
  farmer: string
  name: string
  description: string
  farmId: bigint
  fundingGoal: bigint
  sharePrice: bigint
  totalInvested: bigint
  proceeds: bigint
  deadline: bigint
  verified: boolean
  status: number
  metaCID: string
  minROI: bigint
  maxROI: bigint
}
