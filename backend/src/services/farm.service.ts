import { FilterQuery, UpdateQuery } from "mongoose"
import { Farm, IFarm } from "../models/farm.model"
import { Investment, IInvestment } from "../models/investment.model"
import { Harvest, IHarvest } from "../models/harvest.model"
import { User, IUser } from "../models/user.model"

export interface CreateFarmData {
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
  farmerId: string
  farmType: "crop" | "livestock" | "mixed" | "poultry" | "fishery"
  totalArea: number
  cultivatedArea: number
  irrigationType: "rainfed" | "irrigated" | "supplemental"
  crops: string[]
  expectedYield: number
  plantingDate?: Date
  harvestDate?: Date
  images?: string[]
  documents?: string[]
}

export interface FarmSummary {
  totalInvestments: number
  investorCount: number
  totalHarvests: number
  totalHarvestQuantity: number
  averageYield: number
}

export class FarmService {
  /**
   * Create a new farm
   */
  static async createFarm(farmData: CreateFarmData): Promise<IFarm> {
    try {
      const farm = new Farm(farmData)
      await farm.save()

      // Update user's farm information if they are a farmer
      await User.findByIdAndUpdate(farmData.farmerId, {
        $set: {
          farmName: farmData.name,
          farmDescription: farmData.description,
          location: farmData.location.address
        }
      })

      return farm
    } catch (error) {
      throw new Error(`Failed to create farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get farm by ID with populated data
   */
  static async getFarmById(farmId: string): Promise<IFarm | null> {
    try {
      return await Farm.findById(farmId)
        .populate("farmerId", "name email profileImageUrl")
        .exec()
    } catch (error) {
      throw new Error(`Failed to get farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all farms with optional filtering
   */
  static async getFarms(
    filters: {
      status?: string
      farmType?: string
      state?: string
      isVerified?: boolean
      farmerId?: string
    } = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ farms: IFarm[]; total: number }> {
    try {
      const query: FilterQuery<IFarm> = {}

      if (filters.status) query.status = filters.status
      if (filters.farmType) query.farmType = filters.farmType
      if (filters.state) query["location.state"] = filters.state
      if (typeof filters.isVerified === "boolean") query.isVerified = filters.isVerified
      if (filters.farmerId) query.farmerId = filters.farmerId

      const skip = (page - 1) * limit

      const [farms, total] = await Promise.all([
        Farm.find(query)
          .populate("farmerId", "name email profileImageUrl")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        Farm.countDocuments(query)
      ])

      return { farms, total }
    } catch (error) {
      throw new Error(`Failed to get farms: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update farm by ID
   */
  static async updateFarm(
    farmId: string,
    updateData: UpdateQuery<IFarm>
  ): Promise<IFarm | null> {
    try {
      return await Farm.findByIdAndUpdate(
        farmId,
        { ...updateData, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to update farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delete farm by ID
   */
  static async deleteFarm(farmId: string): Promise<boolean> {
    try {
      const result = await Farm.findByIdAndDelete(farmId).exec()
      return !!result
    } catch (error) {
      throw new Error(`Failed to delete farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get farm summary with investment and harvest data
   */
  static async getFarmSummary(farmId: string): Promise<FarmSummary> {
    try {
      const farm = await Farm.findById(farmId)
      if (!farm) {
        throw new Error("Farm not found")
      }

      // Get investment summary
      const investmentStats = await Investment.aggregate([
        { $match: { farmId: farm._id, status: "active" } },
        {
          $group: {
            _id: null,
            totalInvestments: { $sum: "$amount" },
            investorCount: { $addToSet: "$investorId" }
          }
        }
      ])

      // Get harvest summary
      const harvestStats = await Harvest.aggregate([
        { $match: { farmId: farm._id, status: "completed" } },
        {
          $group: {
            _id: null,
            totalHarvests: { $sum: 1 },
            totalQuantity: { $sum: "$actualQuantity" }
          }
        }
      ])

      const totalInvestments = investmentStats[0]?.totalInvestments || 0
      const investorCount = investmentStats[0]?.investorCount.length || 0
      const totalHarvests = harvestStats[0]?.totalHarvests || 0
      const totalHarvestQuantity = harvestStats[0]?.totalQuantity || 0
      const averageYield = totalHarvests > 0 ? totalHarvestQuantity / totalHarvests : 0

      return {
        totalInvestments,
        investorCount,
        totalHarvests,
        totalHarvestQuantity,
        averageYield
      }
    } catch (error) {
      throw new Error(`Failed to get farm summary: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Verify farm (admin function)
   */
  static async verifyFarm(farmId: string): Promise<IFarm | null> {
    try {
      return await Farm.findByIdAndUpdate(
        farmId,
        {
          isVerified: true,
          verificationDate: new Date(),
          status: "active"
        },
        { new: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to verify farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get farms by farmer ID
   */
  static async getFarmsByFarmer(farmerId: string): Promise<IFarm[]> {
    try {
      return await Farm.find({ farmerId })
        .sort({ createdAt: -1 })
        .exec()
    } catch (error) {
      throw new Error(`Failed to get farms by farmer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Update farm investment statistics when investment is made
   */
  static async updateInvestmentStats(farmId: string): Promise<void> {
    try {
      const investmentStats = await Investment.aggregate([
        { $match: { farmId: new (Farm as any).schema.ObjectId(farmId), status: "active" } },
        {
          $group: {
            _id: "$farmId",
            totalInvested: { $sum: "$amount" },
            investorCount: { $addToSet: "$investorId" }
          }
        }
      ])

      if (investmentStats.length > 0) {
        await Farm.findByIdAndUpdate(farmId, {
          totalInvested: investmentStats[0].totalInvested,
          investorCount: investmentStats[0].investorCount.length
        }).exec()
      }
    } catch (error) {
      throw new Error(`Failed to update investment stats: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Search farms by location, crops, or farm type
   */
  static async searchFarms(
    searchQuery: string,
    filters: {
      farmType?: string
      state?: string
      minArea?: number
      maxArea?: number
    } = {}
  ): Promise<IFarm[]> {
    try {
      const query: FilterQuery<IFarm> = {
        $and: [
          {
            $or: [
              { name: { $regex: searchQuery, $options: "i" } },
              { description: { $regex: searchQuery, $options: "i" } },
              { crops: { $regex: searchQuery, $options: "i" } },
              { "location.state": { $regex: searchQuery, $options: "i" } }
            ]
          },
          { status: "active" },
          { isVerified: true }
        ]
      }

      if (filters.farmType) query.farmType = filters.farmType
      if (filters.state) query["location.state"] = filters.state
      if (filters.minArea || filters.maxArea) {
        query.totalArea = {}
        if (filters.minArea) query.totalArea.$gte = filters.minArea
        if (filters.maxArea) query.totalArea.$lte = filters.maxArea
      }

      return await Farm.find(query)
        .populate("farmerId", "name email profileImageUrl")
        .sort({ totalInvested: -1 })
        .limit(50)
        .exec()
    } catch (error) {
      throw new Error(`Failed to search farms: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Get all pending farms (admin function)
   */
  static async getPendingFarms(): Promise<IFarm[]> {
    try {
      return await Farm.find({ status: "pending" })
        .populate("farmerId", "name email profileImageUrl")
        .sort({ createdAt: -1 })
        .exec()
    } catch (error) {
      throw new Error(`Failed to get pending farms: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Delist farm (admin function)
   */
  static async delistFarm(farmId: string): Promise<IFarm | null> {
    try {
      return await Farm.findByIdAndUpdate(
        farmId,
        {
          status: "delisted",
          updatedAt: new Date()
        },
        { new: true }
      ).exec()
    } catch (error) {
      throw new Error(`Failed to delist farm: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}