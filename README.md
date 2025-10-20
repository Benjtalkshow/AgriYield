#  AgriYield – Decentralized Agriculture Investment Marketplace

AgriYield is a **blockchain-powered agriculture investment platform** that connects **farmers** and **investors** through **farm tokenization**.  
Each farm project or cultivation season is represented as an **on-chain asset**, allowing investors to fund real farms transparently while earning returns after harvest.

---

##  Overview

**AgriYield** empowers smallholder farmers by providing access to capital from global investors in a transparent and decentralized way.  
Using **smart contracts**, AgriYield ensures accountability at every stage — from funding to harvest profit distribution.

---

##  How It Works (MVP Flow)

### 1. Wallet Authentication
- Users connect via **WalletConnect** or **Magic Labs (passwordless email login)**.
- On first login, users select their role: **Farmer**, **Investor**, or **Admin**.

### 2. Farmer Workflow
- Farmers create detailed **farm listings** (crop type, funding goal, expected ROI, etc.).
- Listings are verified by the admin before being published on-chain.
- Once fully funded, the **FarmFunding** contract releases capital to the farmer for cultivation in milestone-based tranches.

### 3. Investor Workflow
- Investors browse verified farm campaigns and invest using stablecoins (USDT or cNGN).
- Each investment mints **ERC-1155 FarmShare tokens**, representing fractional ownership in that specific farm.
- After harvest, the farmer deposits profits back into the **FarmProfitPool** contract.
- Investors claim their share via the `claimYield()` function — receiving their **initial capital + ROI** directly in their wallet.

### 4. Admin Workflow
- Admins verify new farm listings, monitor project milestones, and manage disbursements.
- Admins can delist inactive or fraudulent campaigns and oversee the marketplace.

---

##  Smart Contract Architecture

| Contract | Key Functions | Description |
|-----------|----------------|-------------|
| **FarmRegistry** | `createFarm()` / `verifyFarm()` | Farmers register new listings; admins verify them for public investment. |
| **FarmFunding** | `invest(farmId, amount)` / `disburseFunds(farmId)` | Handles investor funding, token minting, and milestone disbursements. |


---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed:
- [Node.js](https://nodejs.org/en/download/) (v18+)
- [pnpm](https://pnpm.io/installation)
- [MongoDB](https://www.mongodb.com/atlas)
- [Git](https://git-scm.com/)

---

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/agriyeld.git
cd AgriYield
pnpm install
