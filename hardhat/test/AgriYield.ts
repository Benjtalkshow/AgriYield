import { expect } from "chai";
import hre, { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";

describe("AgriYield", function () {
  async function deployFixture() {
    const [owner, admin, farmer, investor1, investor2] = await hre.ethers.getSigners();

    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const agt = await MockUSDT.deploy();
    await agt.waitForDeployment();

    const FarmShares = await hre.ethers.getContractFactory("FarmShares");
    const farmShares = await FarmShares.deploy();
    await farmShares.waitForDeployment();

    const AgriYield = await hre.ethers.getContractFactory("AgriYield");
    const agriYield = await AgriYield.deploy(
      await farmShares.getAddress(),
      await agt.getAddress(),
      admin.address
    );
    await agriYield.waitForDeployment();

    // link FarmShares with AgriYield
    await farmShares.setAgriYield(await agriYield.getAddress());

    // Give investors AGT tokens
    await agt.transfer(investor1.address, hre.ethers.parseUnits("1000", 18));
    await agt.transfer(investor2.address, hre.ethers.parseUnits("1000", 18));

    // Approve AgriYield to spend tokens
    await agt.connect(investor1).approve(await agriYield.getAddress(), hre.ethers.MaxUint256);
    await agt.connect(investor2).approve(await agriYield.getAddress(), hre.ethers.MaxUint256);

    return { owner, admin, farmer, investor1, investor2, agt, farmShares, agriYield };
  }

  it("should create and verify a farm", async function () {
    const { agriYield, farmer, admin } = await loadFixture(deployFixture);

    const fundingGoal = hre.ethers.parseUnits("1000", 18);
    const sharePrice = hre.ethers.parseUnits("10", 18);
    const maxSupply = 100;
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 3600;

    await expect(
      agriYield.connect(farmer).createFarm(
        "Tomato Farm",
        "Fresh organic tomatoes",
        fundingGoal,
        sharePrice,
        maxSupply,
        "bafyCID",
        deadline
      )
    ).to.emit(agriYield, "FarmCreated");

    await expect(agriYield.connect(admin).verifyFarm(1))
      .to.emit(agriYield, "FarmVerified");
  });

  it("should allow verified farm to receive investments", async function () {
    const { agriYield, farmer, admin, investor1 } = await loadFixture(deployFixture);

    const fundingGoal = hre.ethers.parseUnits("1000", 18);
    const sharePrice = hre.ethers.parseUnits("10", 18);
    const maxSupply = 100;
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 3600;

    await agriYield.connect(farmer).createFarm(
      "Tomato Farm",
      "Fresh organic tomatoes",
      fundingGoal,
      sharePrice,
      maxSupply,
      "bafyCID",
      deadline
    );
    await agriYield.connect(admin).verifyFarm(1);

    await expect(
      agriYield.connect(investor1).invest(1, hre.ethers.parseUnits("100", 18))
    ).to.emit(agriYield, "InvestmentMade");

    const farm = await agriYield.getFarm(1);
    expect(farm.totalInvested).to.equal(hre.ethers.parseUnits("100", 18));
  });

  it("should prevent overfunding", async function () {
    const { agriYield, farmer, admin, investor1, investor2 } = await loadFixture(deployFixture);

    const fundingGoal = hre.ethers.parseUnits("100", 18);
    const sharePrice = hre.ethers.parseUnits("10", 18);
    const maxSupply = 10;
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 3600;

    await agriYield.connect(farmer).createFarm(
      "Pepper Farm",
      "Hot red pepper",
      fundingGoal,
      sharePrice,
      maxSupply,
      "bafyCID",
      deadline
    );
    await agriYield.connect(admin).verifyFarm(1);

    await agriYield.connect(investor1).invest(1, hre.ethers.parseUnits("50", 18));
    await agriYield.connect(investor2).invest(1, hre.ethers.parseUnits("50", 18));

    await expect(
      agriYield.connect(investor2).invest(1, hre.ethers.parseUnits("1", 18))
    ).to.be.revertedWith("Goal exceeded");
  });

  it("should allow admin to disburse funds after funding goal", async function () {
    const { agriYield, farmer, admin, investor1 } = await loadFixture(deployFixture);

    const fundingGoal = hre.ethers.parseUnits("100", 18);
    const sharePrice = hre.ethers.parseUnits("10", 18);
    const maxSupply = 10;
    const deadline = (await hre.ethers.provider.getBlock("latest"))!.timestamp + 3600;

    await agriYield.connect(farmer)
