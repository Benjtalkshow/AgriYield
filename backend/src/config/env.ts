import dotenv from "dotenv"

dotenv.config()

export const envConfig = {
  PORT: process.env.PORT || 8000,
  MONGODB_URI: process.env.MONGODB_URI || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
  MAGIC_SECRET_KEY: process.env.MAGIC_SECRET_KEY || "",
  NODE_ENV: process.env.NODE_ENV || "development",
  LISK_RPC_URL: process.env.LISK_RPC_URL, 
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  AGRYIELD_CONTRACT_ADDRESS: process.env.AGRYIELD_CONTRACT_ADDRESS
}

const requiredEnvVars = [
  "MONGODB_URI", 
  "JWT_SECRET", 
  "MAGIC_SECRET_KEY",
  "LISK_RPC_URL",
  "PRIVATE_KEY",
  "AGRYIELD_CONTRACT_ADDRESS"
]

const missingEnvVars = requiredEnvVars.filter((key) => !process.env[key])

if (missingEnvVars.length > 0) {
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(", ")}`)
}