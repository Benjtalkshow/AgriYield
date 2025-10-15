import { Request, Response } from "express"
import { InvestmentService, CreateInvestmentData } from "../services/investment.service"

export class InvestmentController {
  /**
   * Create a new investment
   * POST /api/investments
   */
  static async createInvestment(req: Request, res: Response): Promise<void> {
    try {
      const investmentData: CreateInvestmentData = req.body
      const investment = await InvestmentService.createInvestment(investmentData)

      res.status(201).json({
        success: true,
        message: "Investment created successfully",
        data: investment
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to create investment"
      })
    }
  }

  /**
   * Get investment by ID
   * GET /api/investments/:id
   */
  static async getInvestmentById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const investment = await InvestmentService.getInvestmentById(id)

      if (!investment) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        data: investment
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get investment"
      })
    }
  }

  /**
   * Get all investments with optional filtering
   * GET /api/investments
   */
  static async getInvestments(req: Request, res: Response): Promise<void> {
    try {
      const {
        status,
        investmentType,
        investorId,
        farmId,
        minAmount,
        maxAmount,
        page = "1",
        limit = "10"
      } = req.query

      const filters = {
        status: typeof status === "string" ? status : undefined,
        investmentType: typeof investmentType === "string" ? investmentType : undefined,
        investorId: typeof investorId === "string" ? investorId : undefined,
        farmId: typeof farmId === "string" ? farmId : undefined,
        minAmount: minAmount ? parseFloat(minAmount as string) : undefined,
        maxAmount: maxAmount ? parseFloat(maxAmount as string) : undefined
      }

      const pageNum = parseInt(page as string, 10)
      const limitNum = parseInt(limit as string, 10)

      const result = await InvestmentService.getInvestments(filters, pageNum, limitNum)

      res.status(200).json({
        success: true,
        data: result.investments,
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
        message: error instanceof Error ? error.message : "Failed to get investments"
      })
    }
  }

  /**
   * Update investment by ID
   * PUT /api/investments/:id
   */
  static async updateInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const updateData = req.body

      const investment = await InvestmentService.updateInvestment(id, updateData)

      if (!investment) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Investment updated successfully",
        data: investment
      })
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update investment"
      })
    }
  }

  /**
   * Delete investment by ID
   * DELETE /api/investments/:id
   */
  static async deleteInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const deleted = await InvestmentService.deleteInvestment(id)

      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Investment deleted successfully"
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete investment"
      })
    }
  }

  /**
   * Activate investment
   * PUT /api/investments/:id/activate
   */
  static async activateInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const investment = await InvestmentService.activateInvestment(id)

      if (!investment) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Investment activated successfully",
        data: investment
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to activate investment"
      })
    }
  }

  /**
   * Complete investment
   * PUT /api/investments/:id/complete
   */
  static async completeInvestment(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { finalROI } = req.body

      const investment = await InvestmentService.completeInvestment(id, finalROI)

      if (!investment) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Investment completed successfully",
        data: investment
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to complete investment"
      })
    }
  }

  /**
   * Get investor summary
   * GET /api/investments/investor/:investorId/summary
   */
  static async getInvestorSummary(req: Request, res: Response): Promise<void> {
    try {
      const { investorId } = req.params
      const summary = await InvestmentService.getInvestorSummary(investorId)

      res.status(200).json({
        success: true,
        data: summary
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get investor summary"
      })
    }
  }

  /**
   * Get investments by investor ID
   * GET /api/investments/investor/:investorId
   */
  static async getInvestmentsByInvestor(req: Request, res: Response): Promise<void> {
    try {
      const { investorId } = req.params
      const investments = await InvestmentService.getInvestmentsByInvestor(investorId)

      res.status(200).json({
        success: true,
        data: investments
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get investments by investor"
      })
    }
  }

  /**
   * Get investments by farm ID
   * GET /api/investments/farm/:farmId
   */
  static async getInvestmentsByFarm(req: Request, res: Response): Promise<void> {
    try {
      const { farmId } = req.params
      const investments = await InvestmentService.getInvestmentsByFarm(farmId)

      res.status(200).json({
        success: true,
        data: investments
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get investments by farm"
      })
    }
  }

  /**
   * Process payout for investment
   * POST /api/investments/:id/payout
   */
  static async processPayout(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const { payoutAmount } = req.body

      if (!payoutAmount || payoutAmount <= 0) {
        res.status(400).json({
          success: false,
          message: "Valid payout amount is required"
        })
        return
      }

      const investment = await InvestmentService.processPayout(id, payoutAmount)

      if (!investment) {
        res.status(404).json({
          success: false,
          message: "Investment not found"
        })
        return
      }

      res.status(200).json({
        success: true,
        message: "Payout processed successfully",
        data: investment
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to process payout"
      })
    }
  }

  /**
   * Calculate next payout date
   * POST /api/investments/:id/calculate-payout
   */
  static async calculateNextPayoutDate(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params
      const nextPayoutDate = await InvestmentService.calculateNextPayoutDate(id)

      res.status(200).json({
        success: true,
        data: {
          nextPayoutDate
        }
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to calculate next payout date"
      })
    }
  }

  /**
   * Get due investments for payout processing
   * GET /api/investments/due-payouts
   */
  static async getDueInvestments(req: Request, res: Response): Promise<void> {
    try {
      const investments = await InvestmentService.getDueInvestments()

      res.status(200).json({
        success: true,
        data: investments
      })
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to get due investments"
      })
    }
  }
}