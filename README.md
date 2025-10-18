# AgriYield – Decentralized Agriculture Marketplace

AgriYield is a **blockchain-powered agriculture investment platform** that connects **farmers and investors** through **farm tokenization**.  
Each farm project or cultivation season is represented as an on-chain asset, allowing investors to fund real farms transparently while earning returns after harvest.

---

##  Overview

**AgriYield** empowers smallholder farmers by giving them access to capital from investors in a fully transparent and decentralized way.

###  How It Works (MVP Flow)

1. **Wallet Authentication**
   - Users connect their wallets via WalletConnect or Magic Labs.
   - New users choose a role: **Farmer**, **Investor**, or **Admin**.

2. **Farmer Workflow**
   - Farmers create farm listings with details like crop type, funding goal, and ROI.
   - Each listing is linked to an on-chain record once verified by an admin.
   - When fully funded, funds are released to the farmer’s wallet for cultivation.

3. **Investor Workflow**
   - Investors browse verified farm listings and invest using crypto.
   - Upon investment, they receive **ERC-1155 tokens** representing fractional ownership in the farm.
   - After harvest, profits are distributed automatically through smart contracts.

4. **Admin Workflow**
   - Admins verify farmer listings, manage approvals, and monitor project activity.
   - Admins can also delist inactive or fraudulent farms.

---

## Smart Contract Architecture (Can be updated later)

| Contract | Function | Description |
|-----------|-----------|-------------|
| **FarmRegistry** | `createFarm()` | Register new farms on-chain |
| | `verifyFarm()` | Admin verifies farm for investment |
| **FarmFunding** | `invest(farmId, amount)` | Investors fund farms and mint ERC-1155 tokens |
| | `disburseFunds(farmId)` | Release funds to farmer once goal is met |
| **FarmProfitPool** | `depositProfit(farmId)` | Farmer deposits post-harvest profits |
| | `claimYield(farmId)` | Investors claim their ROI based on ownership |

---

##  Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | Next.js, React, Tailwind CSS |
| **Backend** | Node.js, Express.js, TypeScript, MongoDB |
| **Blockchain** | Solidity, Hardhat (Lisk) |
| **Authentication** | Magic Labs (passwordless email / wallet) |
| **Storage** | IPFS (via NFT.storage / Pinata) |
| **Wallets** | MetaMask, WalletConnect |

---

##  Monorepo Structure
- Contracts
- Frontend
- Backend
- Shared

---

##  Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/download/) (v18+)
- [pnpm](https://pnpm.io/installation)
- [MongoDB](https://www.mongodb.com/atlas) (cloud)
- [Git](https://git-scm.com/)

---

###  Clone the Repository

```bash
git clone https://github.com/yourusername/agriyeld.git
cd AgriYield
pnpm install
```
This installs dependencies for all workspaces (frontend, backend, contracts, and shared).

### Setup Environment Variables

Create a .env file inside backend/:
```bash
PORT=8000
MONGO_URI=mongodb://localhost:27017/agriyeld
```

Run both frontend and backend concurrently:

```bash
pnpm dev
```

- Frontend → `http://localhost:3000`

- Backend → `http://localhost:8000`
