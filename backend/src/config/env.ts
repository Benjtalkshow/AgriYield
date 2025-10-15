import dotenv from "dotenv"

dotenv.config()

interface EnvConfig {
    NODE_ENV: string
    PORT: number
    MONGODB_URI: string
    FRONTEND_URL: string
    //   JWT_SECRET: string
    //   JWT_EXPIRY: string
    //   MAGIC_API_KEY: string
    MAGIC_SECRET_KEY: string
    //   PINATA_API_KEY: string
    //   PINATA_API_SECRET: string
    INFURA_RPC: string
    PRIVATE_KEY: string
    //   CONTRACT_FARM_REGISTRY: string
    //   CONTRACT_FARM_FUNDING: string
    //   CONTRACT_PROFIT_POOL: string
}

const getEnvVariable = (key: string, defaultValue?: string): string => {
    const value = process.env[key]

    if (!value && !defaultValue) {
        throw new Error(`Environment variable ${key} is not defined`)
    }

    return value || defaultValue || ""
}

export const envConfig: EnvConfig = {
    NODE_ENV: process.env.NODE_ENV || "development",
    PORT: parseInt(process.env.PORT || "8000"),
    MONGODB_URI: getEnvVariable("MONGODB_URI"),
    FRONTEND_URL: getEnvVariable("FRONTEND_URL"),
    //   JWT_SECRET: getEnvVariable("JWT_SECRET"),
    //   JWT_EXPIRY: process.env.JWT_EXPIRY || "7d",
    //   MAGIC_API_KEY: getEnvVariable("MAGIC_API_KEY"),
    MAGIC_SECRET_KEY: getEnvVariable("MAGIC_SECRET_KEY"),
    //   PINATA_API_KEY: getEnvVariable("PINATA_API_KEY"),
    //   PINATA_API_SECRET: getEnvVariable("PINATA_API_SECRET"),
    INFURA_RPC: getEnvVariable("INFURA_RPC"),
    PRIVATE_KEY: getEnvVariable("PRIVATE_KEY"),
    //   CONTRACT_FARM_REGISTRY: getEnvVariable("CONTRACT_FARM_REGISTRY"),
    //   CONTRACT_FARM_FUNDING: getEnvVariable("CONTRACT_FARM_FUNDING"),
    //   CONTRACT_PROFIT_POOL: getEnvVariable("CONTRACT_PROFIT_POOL"),
}

export default envConfig