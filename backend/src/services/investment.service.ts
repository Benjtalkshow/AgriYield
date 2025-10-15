import { FilterQuery, UpdateQuery } from "mongoose"
import { Investment, IInvestment } from "../models/investment.model"
import { Farm, IFarm } from "../models/farm.model"
import { User, IUser } from "../models/user.model"

export interface CreateInvestmentData {
  investorId: string
  farmId: string
  amount: number
  investmentType: "equity" | "debt" | "tokenized"
  expectedReturn?: number
  maturityDate?: Date
  payoutSchedule?: "monthly" | "quarterly" | "annually" | "end_of_season"
  tokenAmount?: number
  tokenSymbol?: string
  contractAddress?: string
  transactionHash?: string
  terms?: string
  documents?: string[]
  notes?: string
}

export interface InvestmentSummary {
  totalInvested: number
  totalActiveInvestments: number
  totalCompletedInvestments: number
  totalROI: number
  averageROI: number
  farmsInvested: number
}

export class InvestmentService {
  /**
   * Create a new investment
   */
  static async createInvestment(investmentData: CreateInvestmentData): Promise<IInvestment> {
    try {
      // Verify farm exists and is active
      const farm = await Farm.findById(investmentData.farmId)
      if (!farm) {
        throw new Error("Farm not found")
      }
      if (farm.status !== "active") {
        throw new Error("Farm is not active for investments")
      }

      // Verify investor exists
      const investor = await User.findById(investmentData.investorId)
      if (!investor) {
        throw new Error("Investor not found")
      }

      const investment = new Investment({
        ...investmentData,
        status: "pending",
        investmentDate: new Date(),
        roiEarned: 0,
        totalPayouts: 0
      })

      await investment.save()

      // Update farm investment statistics
      await FarmService.updateInvestmentStats(investmentData.farmId)

      return investment
    } catch (error) {
      throw new Error(`Failed to create investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get investment by ID with populated data
   */
  static async getInvestmentById(investmentId: string): Promise<IInvestment | null> {
    try {
      return await Investment.findById(investmentId)
        .populate("investorId", "name email profileImageUrl")
        .populate("farmId", "name location status")
        .exec()
    } catch (error) {
      throw new Error(`Failed to get investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all investments with optional filtering
   */
  static async getInvestments(
    filters: {
      status?: string
      investmentType?: string
      investorId?: string
      farmId?: string
      minAmount?: number
      maxAmount?: number
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ investments: IInvestment[]; total: number }> {
    try {
      const query: FilterQuery<IInvestment> = {}

      if (filters.status) query.status = filters.status
      if (filters.investmentType) query.investmentType = filters.investmentType
      if (filters.investorId) query.investorId = filters.investorId
      if (filters.farmId) query.farmId = filters.farmId
      if (filters.minAmount || filters.maxAmount) {
        query.amount = {}
        if (filters.minAmount) query.amount.$gte = filters.minAmount
        if (filters.maxAmount) query.amount.$lte = filters.maxAmount
      }

      const skip = (page - 1) * limit

      const [investments, total] = await Promise.all([
        Investment.find(query)
          .populate("investorId", "name email profileImageUrl")
          .populate("farmId", "name location status")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Investment.countDocuments(query)
      ])

      return { investments, total }
    } catch (error) {
      throw new Error(`Failed to get investments: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update investment by ID
   */
  static async updateInvestment(
    investmentId: string,
    updateData: UpdateQuery<IInvestment>
  ): Promise<IInvestment | null> {
    try {
      return await Investment.findByIdAndUpdate(
        investmentId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to update investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete investment by ID
   */
  static async deleteInvestment(investmentId: string): Promise<boolean> {
    try {
      const investment = await Investment.findByIdAndDelete(investmentId).exec()
      if (investment) {
        // Update farm investment statistics
        await FarmService.updateInvestmentStats(investment.farmId.toString())
      }
      return !!investment
    } catch (error) {
      throw new Error(`Failed to delete investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Activate investment (admin/authorized personnel only)
   */
  static async activateInvestment(investmentId: string): Promise<IInvestment | null> {
    try {
      const investment = await Investment.findByIdAndUpdate(
        investmentId,
        {
          status: "active",
          updatedAt: new Date()
        },
        { new: true }
      ).exec()

      if (investment) {
        // Update farm investment statistics
        await FarmService.updateInvestmentStats(investment.farmId.toString())
      }

      return investment
    } catch (error) {
      throw new Error(`Failed to activate investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Complete investment and calculate final ROI
   */
  static async completeInvestment(investmentId: string, finalROI?: number): Promise<IInvestment | null> {
    try {
      const updateData: UpdateQuery<IInvestment> = {
        status: "completed",
        updatedAt: new Date()
      }

      if (finalROI !== undefined) {
        updateData.actualReturn = finalROI
      }

      const investment = await Investment.findByIdAndUpdate(
        investmentId,
        updateData,
        { new: true }
      ).exec()

      if (investment) {
        // Update farm investment statistics
        await FarmService.updateInvestmentStats(investment.farmId.toString())
      }

      return investment
    } catch (error) {
      throw new Error(`Failed to complete investment: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get investment summary for an investor
   */
  static async getInvestorSummary(investorId: string): Promise<InvestmentSummary> {
    try {
      const stats = await Investment.aggregate([
        { $match: { investorId: new (Investment as any).schema.ObjectId(investorId) } },
        {
          $group: {
            _id: "$investorId",
            totalInvested: { $sum: "$amount" },
            totalActive: {
              $sum: {
                $cond: [{ $eq: ["$status", "active"] }, "$amount", 0]
              }
            },
            totalCompleted: {
              $sum: {
                $cond: [{ $eq: ["$status", "completed"] }, "$amount", 0]
              }
            },
            totalROI: { $sum: "$roiEarned" },
            farmsInvested: { $addToSet: "$farmId" }
          }
        }
      ])

      if (stats.length === 0) {
        return {
          totalInvested: 0,
          totalActiveInvestments: 0,
          totalCompletedInvestments: 0,
          totalROI: 0,
          averageROI: 0,
          farmsInvested: 0
        }
      }

      const stat = stats[0]
      const averageROI = stat.totalInvested > 0 ? (stat.totalROI / stat.totalInvested) * 100 : 0

      return {
        totalInvested: stat.totalInvested,
        totalActiveInvestments: stat.totalActive,
        totalCompletedInvestments: stat.totalCompleted,
        totalROI: stat.totalROI,
        averageROI,
        farmsInvested: stat.farmsInvested.length
      }
    } catch (error) {
      throw new Error(`Failed to get investor summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get investments by investor ID
   */
  static async getInvestmentsByInvestor(investorId: string): Promise<IInvestment[]> {
    try {
      return await Investment.find({ investorId })
        .populate("farmId", "name location status totalArea expectedYield")
        .sort({ createdAt: -1 })
        .exec()
    } catch (error) {
      throw new Error(`Failed to get investments by investor: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get investments by farm ID
   */
  static async getInvestmentsByFarm(farmId: string): Promise<IInvestment[]> {
    try {
      return await Investment.find({ farmId })
        .populate("investorId", "name email profileImageUrl")
        .sort({ createdAt: -1 })
        .exec()
    } catch (error) {
      throw new Error(`Failed to get investments by farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Process payout for an investment
   */
  static async processPayout(
    investmentId: string,
    payoutAmount: number
  ): Promise<IInvestment | null> {
    try {
      const investment = await Investment.findById(investmentId)
      if (!investment) {
        throw new Error("Investment not found")
      }

      const updatedInvestment = await Investment.findByIdAndUpdate(
        investmentId,
        {
          $inc: {
            totalPayouts: payoutAmount,
            roiEarned: payoutAmount - (investment.amount * 0.01) // Assuming 1% base return, adjust as needed
          },
          lastPayoutDate: new Date(),
          updatedAt: new Date()
        },
        { new: true }
      ).exec()

      if (updatedInvestment) {
        // Update farm investment statistics
        await FarmService.updateInvestmentStats(investment.farmId.toString())
      }

      return updatedInvestment
    } catch (error) {
      throw new Error(`Failed to process payout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Calculate next payout date for an investment
   */
  static async calculateNextPayoutDate(investmentId: string): Promise<Date | null> {
    try {
      const investment = await Investment.findById(investmentId)
      if (!investment || !investment.payoutSchedule) {
        return null
      }

      const lastPayout = investment.lastPayoutDate || investment.investmentDate
      let nextPayout = new Date(lastPayout)

      switch (investment.payoutSchedule) {
        case "monthly":
          nextPayout.setMonth(nextPayout.getMonth() + 1)
          break
        case "quarterly":
          nextPayout.setMonth(nextPayout.getMonth() + 3)
          break
        case "annually":
          nextPayout.setFullYear(nextPayout.getFullYear() + 1)
          break
        case "end_of_season":
          nextPayout.setMonth(nextPayout.getMonth() + 6)
          break
      }

      // Update the investment with next payout date
      await Investment.findByIdAndUpdate(investmentId, {
        nextPayoutDate: nextPayout
      })

      return nextPayout
    } catch (error) {
      throw new Error(`Failed to calculate next payout date: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get due investments for payout processing
   */
  static async getDueInvestments(): Promise<IInvestment[]> {
    try {
      const now = new Date()
      return await Investment.find({
        status: "active",
        nextPayoutDate: { $lte: now }
      })
        .populate("investorId", "name email")
        .populate("farmId", "name")
        .exec()
    } catch (error) {
      throw new Error(`Failed to get due investments: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

// Import FarmService for internal use
import { FarmService } from "./farm.service"