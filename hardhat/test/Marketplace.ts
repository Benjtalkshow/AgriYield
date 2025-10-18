import { expect } from "chai";
import { loadFixture, time } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockUSDT, FarmShares, AgriYield, Marketplace } from "../typechain-types";

describe("Marketplace", function () {
  async function deployFixture() {
    const [admin, farmer, buyer]: SignerWithAddress[] = await hre.ethers.getSigners();

    // Deploy Mock Token (AGT)
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const agt = (await MockUSDT.deploy()) as MockUSDT;

    // Deploy FarmShares
    const FarmShares = await hre.ethers.getContractFactory("FarmShares");
    const farmShares = (await FarmShares.deploy()) as FarmShares;

    // Deploy AgriYield
    const AgriYield = await hre.ethers.getContractFactory("AgriYield");
    const agriYield = (await AgriYield.deploy(farmShares.target, agt.target, admin.address)) as AgriYield;

    // Link FarmShares to AgriYield
    await farmShares.setAgriYield(agriYield.target);

    // Deploy Marketplace
    const Marketplace = await hre.ethers.getContractFactory("Marketplace");
    const marketplace = (await Marketplace.deploy(agt.target, agriYield.target, admin.address)) as Marketplace;

    return { admin, farmer, buyer, agt, farmShares, agriYield, marketplace };
  }

  it("should deploy and link all contracts properly", async function () {
    const { agt, farmShares, agriYield, marketplace } = await loadFixture(deployFixture);

    expect(await agt.symbol()).to.equal("AGT");
    expect(await farmShares.agriYield()).to.equal(agriYield.target);
    expect(await marketplace.admin()).to.not.equal(hre.ethers.ZeroAddress);
  });

  it("should allow listing, purchase, and payout flow", async function () {
    const { agt, agriYield, marketplace, farmer, buyer, admin } = await loadFixture(deployFixture);

    await agt.connect(farmer).faucet();
    await agt.connect(buyer).faucet();

    const fundingGoal = hre.ethers.parseEther("1000");
    const sharePrice = hre.ethers.parseEther("10");
    const maxSupply = 100;
    const minROI = 20;
    const maxROI = 30;
    const metaCID = "ipfs://meta";
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 86400 * 7;

    await agriYield.connect(farmer).createFarm(
      "Rice Farm",
      "Premium rice cultivation",
      fundingGoal,
      sharePrice,
      maxSupply,
      metaCID,
      deadline,
      minROI,
      maxROI
    );

    await agriYield.connect(admin).verifyFarm(1);

    await expect(marketplace.connect(farmer).listItem(1, 50, 10, "ipfs://produce"))
      .to.emit(marketplace, "ItemListed");

    await agt.connect(buyer).approve(marketplace.target, hre.ethers.parseEther("1000"));

    const tx = await marketplace.connect(buyer).purchase(1, 2);
    const receipt = await tx.wait();
    const event = receipt?.logs.find((l: any) => l.fragment?.name === "ItemPurchased");
    const orderId = event?.args?.orderId ?? 1;

    const order = await marketplace.getOrder(orderId);
    expect(order.price).to.equal(hre.ethers.parseEther("100"));

    await expect(marketplace.connect(farmer).shipOrder(orderId, "ipfs://ship"))
      .to.emit(marketplace, "OrderShipped");

    await expect(marketplace.connect(buyer).confirmReceived(orderId, "ipfs://proof"))
      .to.emit(marketplace, "OrderReceived");

    await expect(marketplace.connect(buyer).releaseFunds(orderId))
      .to.emit(marketplace, "FundsReleased");
  });

  it("should handle disputes correctly", async function () {
    const { agt, agriYield, marketplace, farmer, buyer, admin } = await loadFixture(deployFixture);

    await agt.connect(farmer).faucet();
    await agt.connect(buyer).faucet();

    const fundingGoal = hre.ethers.parseEther("1000");
    const sharePrice = hre.ethers.parseEther("10");
    const maxSupply = 100;
    const minROI = 20;
    const maxROI = 30;
    const metaCID = "ipfs://meta";
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 86400 * 7;

    await agriYield.connect(farmer).createFarm(
      "Maize Farm",
      "Yellow maize",
      fundingGoal,
      sharePrice,
      maxSupply,
      metaCID,
      deadline,
      minROI,
      maxROI
    );

    await agriYield.connect(admin).verifyFarm(1);
    await marketplace.connect(farmer).listItem(1, 50, 10, "ipfs://produce");
    await agt.connect(buyer).approve(marketplace.target, hre.ethers.parseEther("1000"));

    const tx = await marketplace.connect(buyer).purchase(1, 1);
    const receipt = await tx.wait();
    const event = receipt?.logs.find((l: any) => l.fragment?.name === "ItemPurchased");
    const orderId = event?.args?.orderId ?? 1;

    await marketplace.connect(farmer).shipOrder(orderId, "ipfs://ship");

    await expect(marketplace.connect(buyer).openDispute(orderId, "ipfs://reason"))
      .to.emit(marketplace, "DisputeOpened");

    await expect(marketplace.connect(admin).resolveDispute(orderId, false))
      .to.emit(marketplace, "DisputeResolved");
  });

  it("should auto-release funds after 3 days", async function () {
    const { agt, agriYield, marketplace, farmer, buyer, admin } = await loadFixture(deployFixture);

    await agt.connect(farmer).faucet();
    await agt.connect(buyer).faucet();

    const fundingGoal = hre.ethers.parseEther("1000");
    const sharePrice = hre.ethers.parseEther("10");
    const maxSupply = 100;
    const minROI = 20;
    const maxROI = 30;
    const metaCID = "ipfs://meta";
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 86400 * 7;

    await agriYield.connect(farmer).createFarm(
      "Wheat Farm",
      "Hard red wheat",
      fundingGoal,
      sharePrice,
      maxSupply,
      metaCID,
      deadline,
      minROI,
      maxROI
    );

    await agriYield.connect(admin).verifyFarm(1);
    await marketplace.connect(farmer).listItem(1, 50, 10, "ipfs://produce");
    await agt.connect(buyer).approve(marketplace.target, hre.ethers.parseEther("1000"));

    const tx = await marketplace.connect(buyer).purchase(1, 1);
    const receipt = await tx.wait();
    const event = receipt?.logs.find((l: any) => l.fragment?.name === "ItemPurchased");
    const orderId = event?.args?.orderId ?? 1;

    await marketplace.connect(farmer).shipOrder(orderId, "ipfs://ship");

    await time.increase(3 * 24 * 60 * 60);

    await expect(marketplace.autoRelease(orderId))
      .to.emit(marketplace, "FundsReleased");
  });
});
