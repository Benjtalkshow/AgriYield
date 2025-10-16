import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";

describe("Marketplace", function () {
  async function deployFixture() {
    const [deployer, farmer, buyer] = await hre.ethers.getSigners();

    // Deploy mock stable token
    const Token = await hre.ethers.getContractFactory("MockUSDT");
    const token = await Token.deploy();

    // Deploy mock AgriYield
    const MockAgriYield = await hre.ethers.getContractFactory("AgriYield");
    const agriYield = await MockAgriYield.deploy();

    // Deploy marketplace
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = await Marketplace.deploy(token.target, agriYield.target);

    // Create mock farm
    await agriYield.createFarm(1, farmer.address);

    // Mint tokens for buyer
    await token.mint(buyer.address, ethers.parseEther("1000"));

    return { token, agriYield, marketplace, deployer, farmer, buyer };
  }

  it("should allow farmer to list produce and buyer to purchase and release funds", async function () {
    const { marketplace, token, agriYield, farmer, buyer } = await hre.loadFixture(deployFixture);

    // Farmer lists produce
    const price = ethers.parseEther("10");
    await expect(
      marketplace.connect(farmer).listItem(1, price, 5, "farmProduceCID")
    ).to.emit(marketplace, "ListingCreated");

    const listing = await marketplace.listings(1);
    expect(listing.price).to.equal(price);
    expect(listing.isActive).to.be.true;

    // Buyer approves and purchases 2 units
    await token.connect(buyer).approve(marketplace.target, ethers.parseEther("50"));
    await expect(marketplace.connect(buye
