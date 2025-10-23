import { getBlockchainService } from "./blockchain.services"
import { Farm } from "../models/farm.model"
import { Investment } from "../models/investment.model"
import { Transaction } from "../models/transaction.model"
import { FarmService } from "./farm.service"
import { getWebSocketService } from "../utils/websocket"


export class EventSyncService {
  private blockchainService: any

  constructor() {
    this.blockchainService = getBlockchainService()
    this.setupEventListeners()
  }

  private setupEventListeners(): void {
    console.log("[EventSync] Setting up blockchain event listeners...")

    this.blockchainService.on("blockchain:farmCreated", async (data: any) => {
      try {
        console.log("[EventSync] FarmCreated event received:", data)

        const { farmId, farmer } = data

        // Fetch full on-chain data
        const onChainFarm = await this.blockchainService.getFarmDataOnChain(farmId)

        // Link with pending metadata stored in Step 1
        const linkedFarm = await FarmService.linkFarmWithBlockchain(farmer.toLowerCase(), farmId, {
          fundingGoal: onChainFarm.fundingGoal,
          sharePrice: "0",
          deadline: Math.floor(new Date(onChainFarm.createdAt).getTime() / 1000) + Number(onChainFarm.duration),
          minROI: 0,
          maxROI: 0,
          metaCID: "",
        })

        if (linkedFarm) {
          console.log(`[EventSync] Farm ${farmId} successfully linked with metadata`)

          const wsService = getWebSocketService()
          wsService.broadcast("farm:created", {
            farmId,
            farm: linkedFarm,
          })
        } else {
          console.warn(`[EventSync] No pending metadata found for farmer ${farmer}`)
        }

        // Save transaction record
        await Transaction.create({
          type: "farm_created",
          farmId: linkedFarm?._id,
          userAddress: farmer.toLowerCase(),
          amount: 0,
          transactionHash: data.event?.log?.transactionHash || "",
          status: "confirmed",
          blockNumber: data.event?.log?.blockNumber,
        })
      } catch (error) {
        console.error("[EventSync] Error processing FarmCreated event:", error)
      }
    })

    this.blockchainService.on("blockchain:investmentMade", async (data: any) => {
      try {
        console.log("[EventSync] InvestmentMade event received:", data)

        const { farmId, investor, amount, shares } = data

        // Find farm in database
        const farm = await Farm.findOne({ blockchainFarmId: farmId })
        if (!farm) {
          console.warn(`[EventSync] Farm ${farmId} not found in database`)
          return
        }

        // Create or update investment record
        let investment = await Investment.findOne({
          farmId: farm._id,
          investor: investor.toLowerCase(),
        })

        if (investment) {
          // ensure numeric addition and keep numeric types
          investment.amount = Number(investment.amount) + Number(amount)
          investment.shares = Number(investment.shares) + Number(shares)
          await investment.save()
        } else {
          investment = await Investment.create({
            farmId: farm._id,
            investor: investor.toLowerCase(),
            amount: Number(amount),
            shares: Number(shares),
            txHash: data.event?.log?.transactionHash || "",
            timestamp: new Date(),
          })
        }

        // Update farm's total invested
        const onChainFarm = await this.blockchainService.getFarmDataOnChain(farmId)
        await FarmService.updateFromBlockchain(farmId, {
          amountRaised: Number.parseFloat(onChainFarm.amountRaised),
        })

        // Save transaction
        await Transaction.create({
          type: "investment",
          farmId: farm._id,
          userAddress: investor.toLowerCase(),
          amount: Number.parseFloat(amount),
          transactionHash: data.event?.log?.transactionHash || "",
          status: "confirmed",
          blockNumber: data.event?.log?.blockNumber,
        })

        const wsService = getWebSocketService()
        wsService.broadcast("investment:made", {
          farmId,
          investor,
          amount,
          shares,
        })

        console.log(`[EventSync] Investment recorded for farm ${farmId}`)
      } catch (error) {
        console.error("[EventSync] Error processing InvestmentMade event:", error)
      }
    })

    this.blockchainService.on("farm:verified", async (data: any) => {
      try {
        console.log("[EventSync] FarmVerified event received:", data)

        const { farmId } = data

        await FarmService.updateFromBlockchain(farmId, {
          verified: true,
          lastSyncedAt: new Date(),
        })

        const wsService = getWebSocketService()
        wsService.broadcast("farm:verified", { farmId })

        console.log(`[EventSync] Farm ${farmId} marked as verified`)
      } catch (error) {
        console.error("[EventSync] Error processing FarmVerified event:", error)
      }
    })

    this.blockchainService.on("funds:disbursed", async (data: any) => {
      try {
        console.log("[EventSync] FundDisbursed event received:", data)

        const { farmId } = data

        const farm = await Farm.findOne({ blockchainFarmId: farmId })
        if (!farm) return

        await FarmService.updateFromBlockchain(farmId, {
          fundsDisbursed: true,
          lastSyncedAt: new Date(),
        })

        await Transaction.create({
          type: "disbursement",
          farmId: farm._id,
          userAddress: farm.farmer,
          amount: Number.parseFloat(farm.fundingGoal?.toString() || "0"),
          transactionHash: data.txHash || "",
          status: "confirmed",
        })

        const wsService = getWebSocketService()
        wsService.broadcast("funds:disbursed", { farmId })

        console.log(`[EventSync] Funds disbursed for farm ${farmId}`)
      } catch (error) {
        console.error("[EventSync] Error processing FundDisbursed event:", error)
      }
    })

    this.blockchainService.on("proceeds:deposited", async (data: any) => {
      try {
        console.log("[EventSync] ProceedsDeposited event received:", data)

        const { farmId, proceedsAmount } = data

        const onChainFarm = await this.blockchainService.getFarmDataOnChain(farmId)

        await FarmService.updateFromBlockchain(farmId, {
          totalProceeds: Number.parseFloat(onChainFarm.totalProceeds),
          lastSyncedAt: new Date(),
        })

        console.log(`[EventSync] Proceeds deposited for farm ${farmId}`)
      } catch (error) {
        console.error("[EventSync] Error processing ProceedsDeposited event:", error)
      }
    })

    this.blockchainService.on("payout:claimed", async (data: any) => {
      try {
        console.log("[EventSync] InvestorClaimed event received:", data)

        const { farmId, investorAddress } = data

        const farm = await Farm.findOne({ blockchainFarmId: farmId })
        if (!farm) return

        await Investment.findOneAndUpdate(
          { farmId: farm._id, investor: investorAddress.toLowerCase() },
          { claimed: true },
        )

        console.log(`[EventSync] Payout claimed for investor ${investorAddress} on farm ${farmId}`)
      } catch (error) {
        console.error("[EventSync] Error processing InvestorClaimed event:", error)
      }
    })

    this.blockchainService.on("investor:refunded", async (data: any) => {
      try {
        console.log("[EventSync] InvestorRefunded event received:", data)

        const { farmId, investorAddress } = data

        const farm = await Farm.findOne({ blockchainFarmId: farmId })
        if (!farm) return

        await Investment.findOneAndUpdate(
          { farmId: farm._id, investor: investorAddress.toLowerCase() },
          { refunded: true },
        )

        console.log(`[EventSync] Investor ${investorAddress} refunded for farm ${farmId}`)
      } catch (error) {
        console.error("[EventSync] Error processing InvestorRefunded event:", error)
      }
    })

    console.log("[EventSync] All event listeners registered successfully")
  }

  /**
   * Manually sync a specific farm from blockchain
   */
  async syncFarm(farmId: string): Promise<void> {
    try {
      console.log(`[EventSync] Manually syncing farm ${farmId}...`)

      const onChainFarm = await this.blockchainService.getFarmDataOnChain(farmId)

      await FarmService.updateFromBlockchain(Number(farmId), {
        farmer: onChainFarm.farmer.toLowerCase(),
        fundingGoal: Number.parseFloat(onChainFarm.fundingGoal),
        amountRaised: Number.parseFloat(onChainFarm.amountRaised),
        verified: onChainFarm.verified,
        fundsDisbursed: onChainFarm.fundsDisbursed,
        closed: onChainFarm.closed,
        totalProceeds: Number.parseFloat(onChainFarm.totalProceeds),
        lastSyncedAt: new Date(),
      })

      console.log(`[EventSync] Farm ${farmId} synced successfully`)
    } catch (error) {
      console.error(`[EventSync] Error syncing farm ${farmId}:`, error)
      throw error
    }
  }

  /**
   * Sync all farms from blockchain
   */
  async syncAllFarms(): Promise<void> {
    try {
      console.log("[EventSync] Syncing all farms from blockchain...")

      const farmCount = await this.blockchainService.getFarmCountOnChain()
      console.log(`[EventSync] Found ${farmCount} farms on-chain`)

      for (let i = 1; i <= farmCount; i++) {
        try {
          await this.syncFarm(i.toString())
        } catch (error) {
          console.error(`[EventSync] Failed to sync farm ${i}:`, error)
        }
      }

      console.log("[EventSync] All farms synced successfully")
    } catch (error) {
      console.error("[EventSync] Error syncing all farms:", error)
      throw error
    }
  }
}

let eventSyncService: EventSyncService | null = null

export function initializeEventSync(): EventSyncService {
  if (!eventSyncService) {
    eventSyncService = new EventSyncService()
  }
  return eventSyncService
}

export function getEventSyncService(): EventSyncService {
  if (!eventSyncService) {
    throw new Error("Event sync service not initialized")
  }
  return eventSyncService
}
