import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("🚀 Deploying contracts with account:", deployer.address);
  const balance = await deployer.getBalance();
  console.log("💰 Deployer balance:", ethers.formatEther(balance), "ETH\n");

  // 1️⃣ Deploy MockUSDT
  console.log("📦 Deploying MockUSDT...");
  const MockUSDT = await ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy();
  await mockUSDT.waitForDeployment();
  const mockUSDTAddress = await mockUSDT.getAddress();
  console.log("✅ MockUSDT deployed to:", mockUSDTAddress);

  // 2️⃣ Deploy FarmShares
  console.log("\n📦 Deploying FarmShares...");
  const FarmShares = await ethers.getContractFactory("FarmShares");
  const farmShares = await FarmShares.deploy();
  await farmShares.waitForDeployment();
  const farmSharesAddress = await farmShares.getAddress();
  console.log("✅ FarmShares deployed to:", farmSharesAddress);

  // 3️⃣ Deploy AgriYield (requires MockUSDT and FarmShares)
  console.log("\n📦 Deploying AgriYield...");
  const AgriYield = await ethers.getContractFactory("AgriYield");
  const agriYield = await AgriYield.deploy(mockUSDTAddress, farmSharesAddress);
  await agriYield.waitForDeployment();
  const agriYieldAddress = await agriYield.getAddress();
  console.log("✅ AgriYield deployed to:", agriYieldAddress);

  // 4️⃣ Deploy Marketplace (requires AgriYield and MockUSDT)
  console.log("\n📦 Deploying Marketplace...");
  const Marketplace = await ethers.getContractFactory("Marketplace");
  const marketplace = await Marketplace.deploy(agriYieldAddress, mockUSDTAddress);
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("✅ Marketplace deployed to:", marketplaceAddress);

  console.log("\n🎯 Deployment Summary:");
  console.log("--------------------------------------------");
  console.log("MockUSDT:   ", mockUSDTAddress);
  console.log("FarmShares: ", farmSharesAddress);
  console.log("AgriYield:  ", agriYieldAddress);
  console.log("Marketplace:", marketplaceAddress);
  console.log("--------------------------------------------");
}

// Execute the script
main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
