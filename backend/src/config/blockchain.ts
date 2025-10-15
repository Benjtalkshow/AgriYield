import { ethers } from "ethers"
import { envConfig } from "./env"

let provider: ethers.JsonRpcProvider | null = null
let wallet: ethers.Wallet | null = null

export const getProvider = (): ethers.JsonRpcProvider => {
  if (!provider) {
    provider = new ethers.JsonRpcProvider(envConfig.INFURA_RPC)
  }
  return provider
}

export const getWallet = (): ethers.Wallet => {
  if (!wallet) {
    const providerInstance = getProvider()
    wallet = new ethers.Wallet(envConfig.PRIVATE_KEY, providerInstance)
  }
  return wallet
}

export const initializeBlockchain = async (): Promise<void> => {
  try {
    const providerInstance = getProvider()
    
    // Test connection
    const blockNumber = await providerInstance.getBlockNumber()
    console.log(`Blockchain connected. Current block: ${blockNumber}`)
    
    // Get wallet info
    const walletInstance = getWallet()
    console.log(`Wallet initialized: ${walletInstance.address}`)
  } catch (error) {
    console.error("Blockchain initialization error:", error)
    throw error
  }
}

export default {
  getProvider,
  getWallet,
  initializeBlockchain,
}
