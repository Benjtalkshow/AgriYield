// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./FarmShares.sol";
import "./MockUSDT.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";


contract AgriYield is ReentrancyGuard {
    enum Status {
        Active,
        Funded,
        PaidOut,
        Settled,
        Closed
    }
    struct Farm {
        address farmer;
        string name;
        string description;
        uint256 farmId;
        uint256 fundingGoal;
        uint256 sharePrice;
        uint256 totalInvested;
        uint256 proceeds;
        uint256 deadline;
        bool verified;
        Status status;
        string metaCID;
        
    }

    mapping(uint256 => Farm) public farms;
    mapping(uint256 => mapping(address => uint256)) public investorShares;

    uint256 public farmCounter;
    FarmShares public farmShares;
    MockUSDT public AGT;
    address public admin;

    event FarmCreated(uint256 indexed farmId, address indexed farmer);
    event FarmVerified(uint256 indexed farmId);
    event InvestmentMade(uint256 indexed farmId, address indexed investor, uint256 amount, uint256 shares);
    event FundDisbursed(uint256 indexed farmId, uint256 amount);
    event InvestorClaimed(uint256 indexed farmId, address indexed investor, uint256 amount);
    event FarmClosed(uint256 indexed farmId);   
    event InvestorRefunded(uint256 indexed farmId, address indexed investor, uint256 amount);


    modifier onlyAdmin() {
            require(msg.sender == admin, "AgriYield: only admin");
            _;
    }

    constructor(address _farmShares, address _AGT, address _admin) {
        require(
            _farmShares != address(0) && _AGT != address(0) &&
            _admin != address(0), "AgriYield: zero addr"
        );
        farmShares = FarmShares(_farmShares);
        AGT = MockUSDT(_AGT);
        admin = _admin;
    }

    // FARM CREATION & VERIFICATION
    function createFarm(
        string memory name;
        string memory description;
        uint256 fundingGoal,
        uint256 sharePrice,
        uint256 maxSupply,
        string memory metaCID,
        uint256 deadline
    ) external {
        require(fundingGoal > 0 && shareSupply > 0 && sharePrice > 0, "AgriYield: invalid args);
        require(fundingGoal == sharePrice * maxSupply, "AgriYield: inconsistent params");
        require(deadline > block.timestamp, "AgriYield: invalid deadline");

        farmCounter++;
        farms[farmCounter] = Farm(msg.sender, name, description, farmCounter, fundingGoal, sharePrice, 0, 0, deadline, false, status, metaCID);
        farmShares.registerFarm(farmCounter, maxSupply, metaCID);
        emit FarmCreated(newId, msg.sender);
    }

    function verifyFarm(uint256 farmId) external onlyAdmin {
        Farm storage farm = farms[farmId];
        require(!farm.verified, "Already verified");
        farm.verified = true;
        emit FarmVerified(farmId);
    }

    function invest(uint256 farmId, uint256 amount) external nonReentrant {
        Farm storage farm = farms[farmId];
        require(farm.verified, "Farm not verified");
        require(farm.status == Status.Active, "Farm not active");
        require(block.timestamp < farm.deadline, "Farm expired");

        uint256 sharesToMint = amount / farm.sharePrice;
        require(sharesToMint > 0, "Investment too small");
        require(farm.totalInvested + amount <= farm.fundingGoal, "Goal exceeded");
        AGT.transferFrom(msg.sender, address(this), amount);

        // mint shares for investor
        farmShares.mint(msg.sender, farmId, sharesToMint);
        investorShares[farmId][msg.sender] += sharesToMint;
        farm.totalInvested += amount;

        if (farm.totalInvested == farm.fundingGoal) {
            farm.status = Status.Funded;
        }

        emit InvestmentMade(farmId, msg.sender, amount, sharesToMint);
    }

    // FARMER & INVESTOR FUND FLOWS
    /// @notice Farmer deposits harvest proceeds back into the pool
    function disburseFunds(uint256 farmId) external nonReentrant, onlyAdmin {
            Farm storage f = farms[farmId];
            require(f.status == Status.Funded, "AgriYield: not funded");
            require(f.totalInvested > 0, "No funds");

            uint256 amount = f.totalInvested;
            f.totalInvested = 0; // prevent re-use
            f.status = Status.PaidOut;
            AGT.transfer(f.farmer, amount);
            emit FundDisbursed(farmId, amount);
    }
    
    function depositProceeds(uint256 farmId, uint256 amount) external nonReentrant {
        Farm storage f = farms[farmId];
        require(msg.sender == f.farmer, "Not farmer");
        require(f.status == Status.PaidOut, "Farm not paid out yet");
        require(amount > 0, "Invalid amount");

        AGT.transferFrom(msg.sender, address(this), amount);
        f.proceeds += amount;
        f.status = Status.Settled;
    }
    /// @notice Investors claim proportional payout after settlement
    function claimInvestorPayout(uint256 farmId) external nonReentrant {
        Farm storage f = farms[farmId];
        require(f.status == Status.Settled, "AgriYield: Not settled");

        uint256 shares = investorShares[farmId][msg.sender];
        require(shares > 0, "AgriYield: No shares to claim");

        (uint256 maxSupplly,,) = getFarmInfo(farmId);
        uint256 entitlement = (f.proceeds * shares) / maxSupply;
       
        investorShares[farmId][msg.sender] = 0;

        // Burn ERC1155 shares
        farmShares.burnShares(msg.sender, farmId, shares);
        AGT.transfer(address(this), msg.sender, amount)
        emit InvevstorClaimed(farmId, msg.sender, entitlement);

    }

 // DELIST OR CLOSE FARM (after payouts/refunds)
    function delistFarm(uint256 farmId) external onlyAdmin {
        Farm storage f = farms[farmId];
        require(f.status == Status.Settled || f.status == Status.Active, "Cannot delist");

        // If campaign failed (not funded by deadline), refund investors
        if (f.status == Status.Active && block.timestamp > f.deadline) {
            _refundInvestors(farmId);
        }

        f.status = Status.Closed;
    function _refundInvestors(uint256 farmId) internal {
        Farm storage f = farms[farmId];
        require(f.status == Status.Active, "Not refundable");
        require(block.timestamp > f.deadline, "Deadline not reached");

        f.status = Status.Closed;
        address[] storage investors = farmInvestors[farmId];

        for (uint256 i = 0; i < investors.length; i++) {
            address investor = investors[i];
            uint256 shares = investorShares[farmId][investor];
            if (shares == 0) continue;

            uint256 refundAmount = shares * f.sharePrice;

            investorShares[farmId][investor] = 0;
            farmShares.burnShares(investor, farmId, shares);
            AGT.transfer(investor, refundAmount);

            emit InvestorRefunded(farmId, investor, refundAmount);
        }

    }
    function getFarm(uint256 farmId) external view returns (Farm memory) {
        return farms[farmId];
    }
    function getFarmInfo(uint256 farmId) public view returns (uint256 maxSupply, uint256 totalMinted, string memory uri) {
        (maxSupply, totalMinted, uri) = farmShares.farms(farmId);
    }
}