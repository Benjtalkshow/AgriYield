// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IAgriYield {
    function getFarm(
        uint256 farmId
    )
        external
        view
        returns (
            address farmer,
            uint256 fundingGoal,
            uint256 raised,
            uint256 proceeds,
            uint256 shareSupply,
            uint256 sharePrice,
            uint8 status,
            string memory metaCID
        );
}

contract Marketplace is ReentrancyGuard {
    IERC20 public stableToken; // MockUSDT (AGT)
    IAgriYield public agriYield;

    enum OrderStatus {
        Created,
        Shipped,
        Received,
        Completed,
        Disputed,
        Resolved
    }

    struct Listing {
        uint256 farmId;
        address farmer;
        uint256 price; // per unit
        uint256 quantity;
        uint256 quantityRemaining;
        string metadataCID;
        bool isActive;
    }

    struct Order {
        uint256 listingId;
        address buyer;
        address seller;
        uint256 price; // total price
        uint256 quantity;
        string shippingCID;
        string proofCID;
        OrderStatus status;
        bool isDisputed;
        string disputeReasonCID;
    }

    uint256 public nextListingId = 1;
    uint256 public nextOrderId = 1;

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => Order) public orders;

    // -------------------------
    // Events
    // -------------------------
    event ListingCreated(
        uint256 indexed listingId,
        uint256 indexed farmId,
        address indexed farmer,
        uint256 price,
        uint256 quantity,
        string metadataCID
    );
    event ListingUpdated(
        uint256 indexed listingId,
        uint256 price,
        uint256 quantity
    );
    event ListingDeactivated(uint256 indexed listingId);

    event OrderCreated(
        uint256 indexed orderId,
        uint256 indexed listingId,
        address indexed buyer,
        address seller,
        uint256 price,
        uint256 quantity
    );
    event OrderShipped(uint256 indexed orderId, string shippingCID);
    event OrderReceived(uint256 indexed orderId, string proofCID);
    event FundsReleased(uint256 indexed orderId, address indexed seller, uint256 amount);
    event DisputeOpened(uint256 indexed orderId, string reasonCID);
    event DisputeResolved(uint256 indexed orderId, bool sellerFavor);

    constructor(address _stableToken, address _agriYield) {
        require(_stableToken != address(0), "Marketplace: zero token");
        require(_agriYield != address(0), "Marketplace: zero agriYield");
        stableToken = IERC20(_stableToken);
        agriYield = IAgriYield(_agriYield);
    }

    // -------------------------
    // Listing Management
    // -------------------------
    function listItem(
        uint256 farmId,
        uint256 price,
        uint256 quantity,
        string calldata metadataCID
    ) external returns (uint256) {
        require(price > 0, "Marketplace: price>0");
        require(quantity > 0, "Marketplace: qty>0");

        // Verify the caller is the registered farmer for this farm
        (address farmer, , , , , , , ) = agriYield.getFarm(farmId);
        require(msg.sender == farmer, "Marketplace: only farm owner");

        uint256 listingId = nextListingId++;
        listings[listingId] = Listing({
            farmId: farmId,
            farmer: msg.sender,
            price: price,
            quantity: quantity,
            quantityRemaining: quantity,
            metadataCID: metadataCID,
            isActive: true
        });

        emit ListingCreated(listingId, farmId, msg.sender, price, quantity, metadataCID);
        return listingId;
    }

    function updateListing(uint256 listingId, uint256 price, uint256 quantity) external {
        Listing storage l = listings[listingId];
        require(l.isActive, "Marketplace: inactive");
        require(msg.sender == l.farmer, "Marketplace: only farmer");
        require(price > 0 && quantity > 0, "Marketplace: invalid args");

        l.price = price;
        l.quantity = quantity;
        l.quantityRemaining = quantity;
        emit ListingUpdated(listingId, price, quantity);
    }

    function deactivateListing(uint256 listingId) external {
        Listing storage l = listings[listingId];
        require(l.isActive, "Marketplace: already inactive");
        require(msg.sender == l.farmer, "Marketplace: only farmer");
        l.isActive = false;
        emit ListingDeactivated(listingId);
    }

    // -------------------------
    // Order Lifecycle
    // -------------------------
    function purchase(uint256 listingId, uint256 quantity)
        external
        nonReentrant
        returns (uint256)
    {
        Listing storage l = listings[listingId];
        require(l.isActive, "Marketplace: inactive");
        require(quantity > 0 && quantity <= l.quantityRemaining, "Marketplace: invalid qty");

        uint256 totalPrice = l.price * quantity;

        // transfer payment into escrow (this contract)
        require(
            stableToken.transferFrom(msg.sender, address(this), totalPrice),
            "Marketplace: transfer failed"
        );

        l.quantityRemaining -= quantity;

        uint256 orderId = nextOrderId++;
        orders[orderId] = Order({
            listingId: listingId,
            buyer: msg.sender,
            seller: l.farmer,
            price: totalPrice,
            quantity: quantity,
            shippingCID: "",
            proofCID: "",
            status: OrderStatus.Created,
            isDisputed: false,
            disputeReasonCID: ""
        });

        emit OrderCreated(orderId, listingId, msg.sender, l.farmer, totalPrice, quantity);
        return orderId;
    }

    function shipOrder(uint256 orderId, string calldata shippingCID) external {
        Order storage o = orders[orderId];
        require(msg.sender == o.seller, "Marketplace: only seller");
        require(o.status == OrderStatus.Created, "Marketplace: invalid status");
        require(!o.isDisputed, "Marketplace: disputed");

        o.status = OrderStatus.Shipped;
        o.shippingCID = shippingCID;
        emit OrderShipped(orderId, shippingCID);
    }

    function confirmReceived(uint256 orderId, string calldata proofCID) external {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Marketplace: only buyer");
        require(o.status == OrderStatus.Shipped, "Marketplace: invalid status");
        require(!o.isDisputed, "Marketplace: disputed");

        o.status = OrderStatus.Received;
        o.proofCID = proofCID;
        emit OrderReceived(orderId, proofCID);
    }

    function releaseFunds(uint256 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Marketplace: only buyer");
        require(o.status == OrderStatus.Received, "Marketplace: invalid status");
        require(!o.isDisputed, "Marketplace: disputed");

        o.status = OrderStatus.Completed;
        require(stableToken.transfer(o.seller, o.price), "Marketplace: payout failed");

        emit FundsReleased(orderId, o.seller, o.price);
    }

    function openDispute(uint256 orderId, string calldata reasonCID) external {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Marketplace: only buyer");
        require(
            o.status == OrderStatus.Shipped || o.status == OrderStatus.Received,
            "Marketplace: cannot dispute now"
        );
        require(!o.isDisputed, "Marketplace: already disputed");

        o.isDisputed = true;
        o.status = OrderStatus.Disputed;
        o.disputeReasonCID = reasonCID;
        emit DisputeOpened(orderId, reasonCID);
    }

    function resolveDispute(uint256 orderId, bool sellerFavor) external {
        // In production, restrict this to admin or DAO
        Order storage o = orders[orderId];
        require(o.isDisputed, "Marketplace: not disputed");
        require(o.status == OrderStatus.Disputed, "Marketplace: invalid status");

        o.status = OrderStatus.Resolved;
        o.isDisputed = false;

        if (sellerFavor) {
            stableToken.transfer(o.seller, o.price);
        } else {
            stableToken.transfer(o.buyer, o.price);
        }

        emit DisputeResolved(orderId, sellerFavor);
    }

    // -------------------------
    // View Helpers
    // -------------------------
    function getListing(uint256 listingId) external view returns (Listing memory) {
        return listings[listingId];
    }

    function getOrder(uint256 orderId) external view returns (Order memory) {
        return orders[orderId];
    }
}
