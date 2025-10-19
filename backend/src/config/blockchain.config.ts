import { ethers } from "ethers"
import { AGRIYIELD_ABI } from "../abis/agryield"
import { envConfig } from "./env"

export const LISK_SEPOLIA_CONFIG = {
  chainId: 4202,
  name: "Lisk Sepolia",
  rpcUrl: envConfig.LISK_RPC_URL,
  blockExplorerUrl: "https://sepolia-blockscout.lisk.com",
}

export const getProvider = () => {
  if (!envConfig.LISK_RPC_URL) {
    throw new Error("LISK_RPC_URL environment variable is not set")
  }

  return new ethers.JsonRpcProvider(envConfig.LISK_RPC_URL, LISK_SEPOLIA_CONFIG)
}

export const createProvider = async (): Promise<ethers.JsonRpcProvider> => {
  if (!envConfig.LISK_RPC_URL) {
    throw new Error("LISK_RPC_URL environment variable is not set")
  }

  const provider = new ethers.JsonRpcProvider(envConfig.LISK_RPC_URL, LISK_SEPOLIA_CONFIG)

  try {
    await provider.getNetwork()
    console.log("Connected to Lisk Sepolia network")
    return provider
  } catch (error) {
    console.error("Connection to Lisk Sepolia failed:", error)
    throw new Error(
      `Failed to connect to blockchain: ${error instanceof Error ? error.message : "Unknown error"}`
    )
  }
}

export const getSigner = () => {
  const privateKey = envConfig.PRIVATE_KEY
  if (!privateKey) {
    throw new Error("PRIVATE_KEY environment variable is not set")
  }

  return new ethers.Wallet(privateKey, getProvider())
}

export const getContract = (signerOrProvider?: ethers.Signer | ethers.Provider) => {
  if (!envConfig.AGRYIELD_CONTRACT_ADDRESS) {
    throw new Error("AGRYIELD_CONTRACT_ADDRESS environment variable is not set")
  }

  const connection = signerOrProvider || getProvider()
  return new ethers.Contract(envConfig.AGRYIELD_CONTRACT_ADDRESS, AGRIYIELD_ABI, connection)
}

export const testBlockchainConnection = async (): Promise<void> => {
  try {
    const provider = await createProvider()
    const network = await provider.getNetwork()
    console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`)

    const latestBlockNumber = await provider.getBlockNumber()
    console.log(`Latest Block Number: ${latestBlockNumber}`)

    const latestBlock = await provider.getBlock(latestBlockNumber, true)
    if (latestBlock) {
      console.log("Latest Block Details:", {
        hash: latestBlock.hash,
        timestamp: latestBlock.timestamp,
        transactionCount: latestBlock.transactions.length,
      })

      const recentTransactions: string[] = []
      let blockNumber = latestBlockNumber

      while (recentTransactions.length < 10 && blockNumber > 0) {
        const block = await provider.getBlock(blockNumber, true)
        if (block?.transactions?.length) {
          recentTransactions.push(...block.transactions)
        }
        blockNumber--
      }

      console.log(`Latest ${Math.min(recentTransactions.length, 10)} Transactions:`, recentTransactions.slice(0, 10))
    } else {
      console.log("No block data found.")
    }
  } catch (error) {
    console.error("Blockchain connection test failed:", error)
  }
}

