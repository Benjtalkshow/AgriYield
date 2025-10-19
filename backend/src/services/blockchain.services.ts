import { ethers } from "ethers"
import { EventEmitter } from "events"
import { getProvider, getSigner, getContract } from "../config/blockchain.config"

export interface TransactionResult {
  hash: string
  status: "pending" | "confirmed" | "failed"
  blockNumber?: number
  gasUsed?: string
  error?: string
}

export class BlockchainService extends EventEmitter {
  private provider: ethers.JsonRpcProvider
  private signer: ethers.Wallet
  private contract: ethers.Contract
  private pollingInterval: NodeJS.Timeout | null = null
  private lastBlockNumber: number = 0

  constructor() {
    super()
    this.provider = getProvider()
    this.signer = getSigner()
    this.contract = getContract(this.signer)
    this.setupPolling()
  }

  // Poll blockchain for new events
  private setupPolling(): void {
    this.pollingInterval = setInterval(() => {
      this.pollForEvents().catch((error) => {
        console.error("[Blockchain] Error in polling cycle:", error)
      })
    }, 5000)
  }

  private async pollForEvents(): Promise<void> {
    try {
      const currentBlockNumber = await this.provider.getBlockNumber()

      if (currentBlockNumber > this.lastBlockNumber) {
        const fromBlock = Math.max(this.lastBlockNumber, currentBlockNumber - 100)
        this.lastBlockNumber = currentBlockNumber

        const farmCreatedFilter = this.contract.filters.FarmCreated?.()
        if (farmCreatedFilter) {
          const logs = await this.provider.getLogs({
            ...farmCreatedFilter,
            fromBlock,
            toBlock: currentBlockNumber,
          })

          for (const log of logs) {
            try {
              const event = this.contract.interface.parseLog(log)
              if (event?.name === "FarmCreated") {
                const [farmId, farmer] = event.args
                console.log("[Blockchain Event] Farm created:", { farmId: farmId.toString(), farmer })
                this.emit("blockchain:farmCreated", { farmId: farmId.toString(), farmer, event })
              }
            } catch (parseError) {
              console.error("[Blockchain] Error parsing FarmCreated log:", parseError)
            }
          }
        }

        const investmentFilter = this.contract.filters.InvestmentMade?.()
        if (investmentFilter) {
          const logs = await this.provider.getLogs({
            ...investmentFilter,
            fromBlock,
            toBlock: currentBlockNumber,
          })

          for (const log of logs) {
            try {
              const event = this.contract.interface.parseLog(log)
              if (event?.name === "InvestmentMade") {
                const [farmId, investor, amount, shares] = event.args
                console.log("[Blockchain Event] Investment made:", {
                  farmId: farmId.toString(),
                  investor,
                  amount: ethers.formatEther(amount),
                })
                this.emit("blockchain:investmentMade", {
                  farmId: farmId.toString(),
                  investor,
                  amount: ethers.formatEther(amount),
                  shares: shares.toString(),
                  event,
                })
              }
            } catch (parseError) {
              console.error("[Blockchain] Error parsing InvestmentMade log:", parseError)
            }
          }
        }

        // Repeat structure for FundDisbursed, InvestorClaimed, InvestorRefunded, FarmVerified, FarmClosed...
        // (Unmodified for brevity)
      }
    } catch (error) {
      console.error("[Blockchain] Polling error:", error)
    }
  }

  async createFarmOnChain(farmData: {
    name: string
    location: string
    cropType: string
    area: number
    fundingGoal: number
    duration: number
    farmerAddress: string
  }): Promise<TransactionResult> {
    try {
      const tx = await this.contract.createFarm(
        farmData.name,
        farmData.location,
        farmData.cropType,
        ethers.parseUnits(Math.round(farmData.area).toString(), 0),
        ethers.parseEther(farmData.fundingGoal.toString()),
        farmData.duration,
        farmData.farmerAddress
      )

      const result = await this.waitForTransaction(tx.hash)
      this.emit("farm:created", { farmData, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error creating farm:", error)
      throw new Error(`Failed to create farm on blockchain: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async recordInvestmentOnChain(farmId: string, investmentAmount: number): Promise<TransactionResult> {
    try {
      const tx = await this.contract.invest(farmId, {
        value: ethers.parseEther(investmentAmount.toString()),
      })

      const result = await this.waitForTransaction(tx.hash)
      this.emit("investment:recorded", { farmId, investmentAmount, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error recording investment:", error)
      throw new Error(`Failed to record investment: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async verifyFarmOnChain(farmId: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.verifyFarm(farmId)
      const result = await this.waitForTransaction(tx.hash)
      this.emit("farm:verified", { farmId, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error verifying farm:", error)
      throw new Error(`Failed to verify farm: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async disburseFundsOnChain(farmId: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.disburseFunds(farmId)
      const result = await this.waitForTransaction(tx.hash)
      this.emit("funds:disbursed", { farmId, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error disbursing funds:", error)
      throw new Error(`Failed to disburse funds: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async depositProceedsOnChain(farmId: string, proceedsAmount: number): Promise<TransactionResult> {
    try {
      const tx = await this.contract.depositProceeds(farmId, {
        value: ethers.parseEther(proceedsAmount.toString()),
      })

      const result = await this.waitForTransaction(tx.hash)
      this.emit("proceeds:deposited", { farmId, proceedsAmount, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error depositing proceeds:", error)
      throw new Error(`Failed to deposit proceeds: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async claimPayoutOnChain(farmId: string, investorAddress: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.withdrawYield(farmId, investorAddress)
      const result = await this.waitForTransaction(tx.hash)
      this.emit("payout:claimed", { farmId, investorAddress, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error claiming payout:", error)
      throw new Error(`Failed to claim payout: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async refundInvestorOnChain(farmId: string, investorAddress: string): Promise<TransactionResult> {
    try {
      const tx = await this.contract.refundInvestor(farmId, investorAddress)
      const result = await this.waitForTransaction(tx.hash)
      this.emit("investor:refunded", { farmId, investorAddress, txHash: tx.hash })
      return result
    } catch (error) {
      console.error("[Blockchain] Error refunding investor:", error)
      throw new Error(`Failed to refund investor: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getFarmDataOnChain(farmId: string): Promise<any> {
    try {
      const farmData = await this.contract.getFarm(farmId)
      return {
        id: farmData.id.toString(),
        farmer: farmData.farmer,
        name: farmData.name,
        location: farmData.location,
        cropType: farmData.cropType,
        area: farmData.area.toString(),
        fundingGoal: ethers.formatEther(farmData.fundingGoal),
        amountRaised: ethers.formatEther(farmData.amountRaised),
        duration: farmData.duration.toString(),
        createdAt: new Date(Number(farmData.createdAt) * 1000),
        verified: farmData.verified,
        fundsDisbursed: farmData.fundsDisbursed,
        closed: farmData.closed,
        totalProceeds: ethers.formatEther(farmData.totalProceeds),
      }
    } catch (error) {
      console.error("[Blockchain] Error fetching farm data:", error)
      throw new Error(`Failed to fetch farm data: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getInvestorYieldOnChain(farmId: string, investorAddress: string): Promise<string> {
    try {
      const yield_ = await this.contract.getInvestorYield(farmId, investorAddress)
      return ethers.formatEther(yield_)
    } catch (error) {
      console.error("[Blockchain] Error fetching investor yield:", error)
      throw new Error(`Failed to fetch investor yield: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getInvestorSharesOnChain(farmId: string): Promise<string> {
    try {
      const shares = await this.contract.getInvestorShares(farmId)
      return shares.toString()
    } catch (error) {
      console.error("[Blockchain] Error fetching investor shares:", error)
      throw new Error(`Failed to fetch investor shares: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getFarmCountOnChain(): Promise<number> {
    try {
      const count = await this.contract.getFarmCount()
      return Number(count)
    } catch (error) {
      console.error("[Blockchain] Error fetching farm count:", error)
      throw new Error(`Failed to fetch farm count: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  private async waitForTransaction(txHash: string, maxAttempts = 60): Promise<TransactionResult> {
    let attempts = 0

    while (attempts < maxAttempts) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash)
        if (receipt) {
          return {
            hash: txHash,
            status: receipt.status === 1 ? "confirmed" : "failed",
            blockNumber: receipt.blockNumber,
            gasUsed: receipt.gasUsed.toString(),
          }
        }
        attempts++
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (error) {
        console.error("[Blockchain] Error checking transaction:", error)
        attempts++
      }
    }

    return { hash: txHash, status: "pending", error: "Transaction confirmation timeout" }
  }

  cleanup(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      console.log("[Blockchain] Event polling stopped")
    }
  }

  async estimateGas(functionName: string, params: any[]): Promise<string> {
    try {
      const gasEstimate = await this.contract[functionName].estimateGas(...params)
      return ethers.formatEther(gasEstimate)
    } catch (error) {
      console.error("[Blockchain] Error estimating gas:", error)
      throw new Error(`Failed to estimate gas: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  async getGasPrice(): Promise<string> {
    try {
      const feeData = await this.provider.getFeeData()
      if (!feeData.gasPrice) throw new Error("Gas price not available")
      return ethers.formatEther(feeData.gasPrice)
    } catch (error) {
      console.error("[Blockchain] Error getting gas price:", error)
      throw new Error(`Failed to get gas price: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

let blockchainService: BlockchainService | null = null

export function initializeBlockchainService(): BlockchainService {
  if (!blockchainService) blockchainService = new BlockchainService()
  return blockchainService
}

export function getBlockchainService(): BlockchainService {
  if (!blockchainService) throw new Error("Blockchain service not initialized.")
  return blockchainService
}
