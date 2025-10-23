import type { Response } from "express"
import type { AuthRequest } from "../middleware/auth.middleware"
import { FarmService } from "../services/farm.service"
import { Investment } from "../models/investment.model"
import { getBlockchainService } from "../services/blockchain.services"
// import User from "../models/user.model"
import { resolveWalletAddress } from "../utils/resolve-wallet-address"

export class FarmController {
  // Create farm metadata (off-chain)
  static async createFarmMetadata(req: AuthRequest, res: Response): Promise<void> {
    try {
      const farmer = await resolveWalletAddress(req)
      if (!farmer) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
      }

      const farm = await FarmService.createFarmMetadata({ ...req.body, farmer })

      res.status(201).json({
        success: true,
        message: "Farm metadata created. Now call createFarm() on smart contract.",
        data: {
          tempId: farm._id,
          farmer: farm.farmer,
          name: farm.name,
          nextStep: "Call smart contract createFarm() with funding details",
        },
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create farm metadata",
      })
    }
  }

  // Get all farms with filters
  static async getAllFarms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { status, farmType, state, verified, farmer, page = "1", limit = "10" } = req.query
      const filters = {
        status: typeof status === "string" ? status : undefined,
        farmType: typeof farmType === "string" ? farmType : undefined,
        state: typeof state === "string" ? state : undefined,
        verified: typeof verified === "string" ? verified === "true" : undefined,
        farmer: typeof farmer === "string" ? farmer : undefined,
      }

      const result = await FarmService.getFarms(
        filters,
        Number.parseInt(page as string),
        Number.parseInt(limit as string),
      )

      res.json({
        success: true,
        data: result.farms,
        pagination: {
          page: Number.parseInt(page as string),
          limit: Number.parseInt(limit as string),
          total: result.total,
          pages: Math.ceil(result.total / Number.parseInt(limit as string)),
        },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch farms" })
    }
  }

  // Get single farm by ID
  static async getFarmById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const farm = await FarmService.getFarmById(id)
      if (!farm) {
        res.status(404).json({ success: false, message: "Farm not found" })
        return
      }
      res.json({ success: true, data: farm })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch farm" })
    }
  }

  // Update farm metadata (off-chain)
  static async updateFarmMetadata(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const farmer = await resolveWalletAddress(req)
      if (!farmer) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
      }

      const farm = await FarmService.updateFarmMetadata(id, farmer, req.body)
      if (!farm) {
        res.status(404).json({ success: false, message: "Farm not found or unauthorized" })
        return
      }

      res.json({ success: true, message: "Farm metadata updated", data: farm })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to update farm" })
    }
  }

  // Get farms by farmer
  static async getFarmsByFarmer(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { address } = req.params
      const farms = await FarmService.getFarmsByFarmer(address)
      res.json({ success: true, data: farms })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch farms" })
    }
  }

  // Search farms
  static async searchFarms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { q, farmType, state, minArea, maxArea } = req.query
      if (!q || typeof q !== "string") {
        res.status(400).json({ success: false, message: "Search query required" })
        return
      }

      const filters = {
        farmType: typeof farmType === "string" ? farmType : undefined,
        state: typeof state === "string" ? state : undefined,
        minArea: minArea ? Number.parseFloat(minArea as string) : undefined,
        maxArea: maxArea ? Number.parseFloat(maxArea as string) : undefined,
      }

      const farms = await FarmService.searchFarms(q, filters)
      res.json({ success: true, data: farms })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to search farms" })
    }
  }

  // Get investments for a specific farm
  static async getFarmInvestments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const { page = "1", limit = "20" } = req.query
      const pageNum = Number.parseInt(page as string)
      const limitNum = Number.parseInt(limit as string)

      const [investments, total] = await Promise.all([
        Investment.find({ farmId: Number(farmId) })
          .sort({ timestamp: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Investment.countDocuments({ farmId: Number(farmId) }),
      ])

      res.json({
        success: true,
        data: investments,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch farm investments" })
    }
  }

  // Get investments for logged-in user
  static async getUserInvestments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const investor = await resolveWalletAddress(req)
      if (!investor) {
        res.status(401).json({ success: false, message: "Unauthorized" })
        return
      }

      const { page = "1", limit = "20" } = req.query
      const pageNum = Number.parseInt(page as string)
      const limitNum = Number.parseInt(limit as string)

      const [investments, total] = await Promise.all([
        Investment.find({ investor: investor.toLowerCase() })
          .sort({ timestamp: -1 })
          .skip((pageNum - 1) * limitNum)
          .limit(limitNum),
        Investment.countDocuments({ investor: investor.toLowerCase() }),
      ])

      const enrichedInvestments = await Promise.all(
        investments.map(async (inv) => {
          let farm = null
          const fid: any = (inv as any).farmId
          if (typeof fid === "number") farm = await FarmService.getFarmByBlockchainId(fid)
          else {
            try { farm = await FarmService.getFarmById(fid.toString()) } catch { farm = null }
          }

          return {
            ...inv.toObject(),
            farm: farm ? { name: farm.name, status: farm.status, verified: farm.verified, images: farm.images } : null,
          }
        }),
      )

      res.json({
        success: true,
        data: enrichedInvestments,
        pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
      })
    } catch (error) {
      res.status(500).json({ success: false, message: "Failed to fetch user investments" })
    }
  }

  // Verify farm (Admin - calls smart contract)
  static async verifyFarm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const blockchainService = getBlockchainService()
      const result = await blockchainService.verifyFarmOnChain(farmId)

      if (result.status === "failed") {
        res.status(500).json({ success: false, message: "Failed to verify farm on blockchain", error: result.error })
        return
      }

      res.json({ success: true, message: "Farm verification transaction submitted", data: { txHash: result.hash, status: result.status } })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to verify farm" })
    }
  }

  // Disburse funds to farmer (Admin - calls smart contract)
  static async disburseFunds(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const blockchainService = getBlockchainService()
      const result = await blockchainService.disburseFundsOnChain(farmId)

      if (result.status === "failed") {
        res.status(500).json({ success: false, message: "Failed to disburse funds on blockchain", error: result.error })
        return
      }

      res.json({ success: true, message: "Fund disbursement transaction submitted", data: { txHash: result.hash, status: result.status } })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to disburse funds" })
    }
  }

  // Delist/close farm (Admin - calls smart contract)
  static async delistFarm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const blockchainService = getBlockchainService()
      const result = await blockchainService.closeFarmOnChain(farmId)

      if (result.status === "failed") {
        res.status(500).json({ success: false, message: "Failed to delist farm on blockchain", error: result.error })
        return
      }

      res.json({ success: true, message: "Farm delist transaction submitted", data: { txHash: result.hash, status: result.status } })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to delist farm" })
    }
  }

  // Manually sync farm data from blockchain (Admin)
  static async syncFarm(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const blockchainService = getBlockchainService()
      const onChainData = await blockchainService.getFarmDataOnChain(farmId)

      const farm = await FarmService.updateFromBlockchain(Number(farmId), {
        fundingGoal: onChainData.fundingGoal,
        sharePrice: onChainData.sharePrice,
        totalInvested: onChainData.amountRaised,
        proceeds: onChainData.totalProceeds,
        verified: onChainData.verified,
        status: onChainData.closed ? "closed" : onChainData.fundsDisbursed ? "funded" : "active",
        syncedFromChain: true,
      })

      if (!farm) {
        res.status(404).json({ success: false, message: "Farm not found in database" })
        return
      }

      res.json({ success: true, message: "Farm synced successfully", data: farm })
    } catch (error) {
      res.status(500).json({ success: false, message: error instanceof Error ? error.message : "Failed to sync farm" })
    }
  }
}
