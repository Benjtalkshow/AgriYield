import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config();
const { vars } = require('hardhat/config');

const PRIVATE_KEY = vars.get("PRIVATE_KEY"); 
 
const LISK_RPC_URL = (vars.has("LISK_RPC_URL") ? vars.get("LISK_RPC_URL") : process.env.LISK_RPC_URL);
const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: { enabled: true, runs: 200 },
      viaIR: true,
    },
  },
  networks: (LISK_RPC_URL && PRIVATE_KEY) ? {
     'lisk-sepolia-testnet': {
       url: LISK_RPC_URL,
       accounts: [PRIVATE_KEY.startsWith("0x") ? PRIVATE_KEY : `0x${PRIVATE_KEY}`],
     },
   } : {},
   etherscan: {
    apiKey: {
      'lisk-sepolia-testnet': 'empty'
    },
    customChains: [
      {
        network: "lisk-sepolia-testnet",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com"
        }
      }
    ]
  }
};


export default config;
