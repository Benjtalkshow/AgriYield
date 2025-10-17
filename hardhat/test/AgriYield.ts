import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers";
import hre from "hardhat";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { MockUSDT, FarmShares, AgriYield } from "../typechain-types";

describe("AgriYield", function () {
  async function deployFixture() {
    const [admin, farmer, investor1, investor2]: SignerWithAddress[] = await hre.ethers.getSigners();

    // Deploy mock token
    const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
    const usdt = (await MockUSDT.deploy()) as MockUSDT;

    // Deploy FarmShares
    const FarmShares = await hre.ethers.getContractFactory("FarmShares");
    const farmShares = (await FarmShares.deploy()) as FarmShares;

    // Deploy AgriYield
    const AgriYield = await hre.ethers.getContractFactory("AgriYield");
    const agriYield = (await AgriYield.deploy(
      farmShares.target,
      usdt.target,
      admin.address
    )) as AgriYield;

    // Link FarmShares <-> AgriYield
    await farmShares.setAgriYield(agriYield.target);

    return { admin, farmer, investor1, investor2, usdt, farmShares, agriYield };
  }

  it("should create, fund, pay out, and claim successfully", async function () {
    const { admin, farmer, investor1, usdt, farmShares, agriYield } =
      await loadFixture(deployFixture);

    // Farmer creates a farm
    const fundingGoal = hre.ethers.parseEther("1000");
    const sharePrice = hre.ethers.parseEther("10");
    const maxSupply = 100;
    const minROI = 20;
    const maxROI = 30;
    const deadline =
      (await hre.ethers.provider.getBlock("latest"))!.timestamp + 86400 * 7; // 7 days
    const metaCID = "ipfs://farmMetaCID";

    await expect(
      agriYield
        .connect(farmer)
        .createFarm(
          "Tomato Farm",
          "Organic tomato farming",
          fundingGoal,
          sharePrice,
          maxSupply,
          metaCID,
          deadline,
          minROI,
          maxROI
        )
    ).to.emit(agriYield, "FarmCreated");

    // Verify farm
    await agriYield.connect(admin).verifyFarm(1);

    // Investor claims faucet
    await usdt.connect(investor1).faucet();

    // Investor approves AgriYield
    const investAmount = hre.ethers.parseEther("100");
    await usdt.connect(investor1).approve(agriYield.target, investAmount);

    // Investor invests
    await expect(
      agriYield.connect(investor1).invest(1, investAmount)
    ).to.emit(agriYield, "InvestmentMade");

    const farm = await agriYield.getFarm(1);
    expect(farm.totalInvested).to.equal(investAmount);
    expect(farm.status).to.equal(0); // Active until fully funded

    // Simulate full funding (manual storage manipulation for testing)
    await hre.network.provider.send("hardhat_setStorageAt", [
      agriYield.target,
      hre.ethers.solidityPackedKeccak256(["uint256", "uint256"], [1, 6]), // mapping slot for totalInvested
      hre.ethers.zeroPadValue(hre.ethers.toBeHex(fundingGoal), 32),
    ]);

    // Disburse funds to farmer
    await expect(agriYield.connect(admin).disburseFunds(1)).to.emit(
      agriYield,
      "FundDisbursed"
    );

    // Farmer returns proceeds (fundingGoal + 25%)
    const proceeds = hre.ethers.parseEther("1250");
    await usdt.connect(farmer).faucet(); // give farmer some balance
    await usdt.connect(farmer).approve(agriYield.target, proceeds);

    await expect(
      agriYield.connect(farmer).depositProceeds(1, proceeds)
    ).to.emit(agriYield, "ProceedsDeposited");

    // Investor claims ROI
    const investorBefore = await usdt.balanceOf(investor1.address);

    await expect(agriYield.connect(investor1).claimInvestorPayout(1)).to.emit(
      agriYield,
      "InvestorClaimed"
    );

    const investorAfter = await usdt.balanceOf(investor1.address);
    expect(investorAfter).to.be.gt(investorBefore);
  });
});
