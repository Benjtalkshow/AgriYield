// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

// @notice ERC1155 Farm share tokens. Each farm uses its farmId as token id.
/// @dev Ownership is transferred to AgriYield after deployment.
contract FarmShares is ERC1155, Ownable {
    event AgriYieldSet(address indexed newAgriYield);
    event SharesBurned(
        uint256 indexed farmId,
        address indexed investor,
        uint256 amount
    );

    struct FarmInfo {
        uint256 maxSupply;
        uint256 totalMinted;
        string uri;
    }

    mapping(uint256 => FarmInfo) public farms;
    address public agriYield;

    modifier onlyAgriYield() {
        require(msg.sender == agriYield, "FarmShares: only AgriYield");
        _;
    }

    constructor() ERC1155("") Ownable(msg.sender) {}

    function setAgriYield(address _agriYield) external onlyOwner {
        require(_agriYield != address(0), "FarmShares: zero address");
        agriYield = _agriYield;
        emit AgriYieldSet(_agriYield);
    }

    function registerFarm(
        uint256 farmId,
        uint256 maxSupply,
        string memory _uri
    ) external onlyAgriYield {
        require(farms[farmId].maxSupply == 0, "Farm already exists");
        farms[farmId] = FarmInfo(maxSupply, 0, _uri);
    }

    function mint(
        address to,
        uint256 farmId,
        uint256 amount
    ) external onlyAgriYield {
        FarmInfo storage farm = farms[farmId];
        require(
            farm.totalMinted + amount <= farm.maxSupply,
            "Exceeds max supply"
        );
        farm.totalMinted += amount;
        _mint(to, farmId, amount, "");
    }

    function uri(uint256 farmId) public view override returns (string memory) {
        return farms[farmId].uri;
    }

    function burnShares(
        address from,
        uint256 farmId,
        uint256 amount
    ) external onlyAgriYield {
        _burn(from, farmId, amount);
        emit SharesBurned(farmId, from, amount);
    }
}
