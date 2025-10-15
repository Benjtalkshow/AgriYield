import { Request, Response } from "express"
import { FarmService, CreateFarmData } from "../services/farm.service"

export class FarmController {
  /**
   * Create a new farm
   * POST /api/farms
   */
  static async createFarm(req: Request, res: Response): Promise<void> {
    try {
      const farmData: CreateFarmData = req.body
      const farm = await FarmService.createFarm(farmData)

      res.status(201).json({
        success: true,
        message: "Farm created successfully",
        data: farm
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create farm"
      })
    }
  }

  /**
   * Get farm by ID
   * GET /api/farms/:id
   */
  static async getFarmById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const farm = await FarmService.getFarmById(id)

      if (!farm) {
        res.status(404).json({
          success: false,
          message: "Farm not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        data: farm
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get farm"
      })
    }
  }

  /**
   * Get all farms with optional filtering
   * GET /api/farms
   */
  static async getFarms(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        farmType,
        state,
        isVerified,
        farmerId,
        page = "1",
        limit = "10"
      } = req.query

      const filters = {
        status: typeof status === "string" ? status : undefined,
        farmType: typeof farmType === "string" ? farmType : undefined,
        state: typeof state === "string" ? state : undefined,
        isVerified: typeof isVerified === "string" ? isVerified === "true" : undefined,
        farmerId: typeof farmerId === "string" ? farmerId : undefined
      }

      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)

      const result = await FarmService.getFarms(filters, pageNum, limitNum)

      res.status(200).json({
        success: true,
        data: result.farms,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: result.total,
          pages: Math.ceil(result.total / limitNum)
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get farms"
      })
    }
  }

  /**
   * Update farm by ID
   * PUT /api/farms/:id
   */
  static async updateFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const farm = await FarmService.updateFarm(id, updateData)

      if (!farm) {
        res.status(404).json({
          success: false,
          message: "Farm not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Farm updated successfully",
        data: farm
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update farm"
      })
    }
  }

  /**
   * Delete farm by ID
   * DELETE /api/farms/:id
   */
  static async deleteFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await FarmService.deleteFarm(id)

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Farm not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Farm deleted successfully"
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete farm"
      })
    }
  }

  /**
   * Get farm summary with investment and harvest data
   * GET /api/farms/:id/summary
   */
  static async getFarmSummary(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const summary = await FarmService.getFarmSummary(id)

      res.status(200).json({
        success: true,
        data: summary
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get farm summary"
      })
    }
  }

  /**
   * Verify farm (admin only)
   * PUT /api/farms/:id/verify
   */
  static async verifyFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const farm = await FarmService.verifyFarm(id)

      if (!farm) {
        res.status(404).json({
          success: false,
          message: "Farm not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Farm verified successfully",
        data: farm
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to verify farm"
      })
    }
  }

  /**
   * Get farms by farmer ID
   * GET /api/farms/farmer/:farmerId
   */
  static async getFarmsByFarmer(req: Request, res: Response): Promise<void> {
    try {
      const { farmerId } = req.params
      const farms = await FarmService.getFarmsByFarmer(farmerId)

      res.status(200).json({
        success: true,
        data: farms
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get farms by farmer"
      })
    }
  }

  /**
   * Search farms
   * GET /api/farms/search
   */
  static async searchFarms(req: Request, res: Response): Promise<void> {
    try {
      const { q, farmType, state, minArea, maxArea } = req.query

      if (!q || typeof q !== "string") {
        res.status(400).json({
          success: false,
          message: "Search query is required"
        })
        return
      }

      const filters = {
        farmType: typeof farmType === "string" ? farmType : undefined,
        state: typeof state === "string" ? state : undefined,
        minArea: minArea ? parseFloat(minArea as string) : undefined,
        maxArea: maxArea ? parseFloat(maxArea as string) : undefined
      }

      const farms = await FarmService.searchFarms(q, filters)

      res.status(200).json({
        success: true,
        data: farms
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to search farms"
      })
    }
  }

  /**
   * Get all pending farms (admin function)
   * GET /api/farms/pending
   */
  static async getPendingFarms(req: Request, res: Response): Promise<void> {
    try {
      const farms = await FarmService.getPendingFarms()

      res.status(200).json({
        success: true,
        data: farms
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get pending farms"
      })
    }
  }

  /**
   * Delist farm (admin function)
   * PUT /api/farms/:id/delist
   */
  static async delistFarm(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const farm = await FarmService.delistFarm(id)

      if (!farm) {
        res.status(404).json({
          success: false,
          message: "Farm not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Farm delisted successfully",
        data: farm
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delist farm"
      })
    }
  }
}