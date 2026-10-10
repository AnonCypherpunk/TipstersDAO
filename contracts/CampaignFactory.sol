// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./Campaign.sol";

contract CampaignFactory is Ownable {
    IERC20 public immutable tipToken;
    address public stakingContract;

    Campaign[] public campaigns;
    uint256 public campaignCount;

    uint256[4] public tierTargets = [5_000 ether, 10_000 ether, 15_000 ether, 20_000 ether];
    uint256 public constant MIN_SEED = 50 ether; // $50 of TIP

    mapping(address => bool) public isCampaign;

    event CampaignCreated(address indexed campaign, address indexed creator, uint8 tier, uint256 target);
    event StakingContractUpdated(address staking);

    constructor(address _tipToken) Ownable(msg.sender) {
        tipToken = IERC20(_tipToken);
    }

    function setStakingContract(address _staking) external onlyOwner {
        stakingContract = _staking;
        emit StakingContractUpdated(_staking);
    }

    function createCampaign(
        uint8 tier,
        uint256[5] calldata allocations,
        string calldata infoDestination,
        uint256 seedAmount
    ) external returns (address) {
        require(tier < 4, "Factory: invalid tier");
        require(seedAmount >= MIN_SEED, "Factory: below minimum seed");
        require(_allocationsSum(allocations) == 10000, "Factory: allocations must sum to 10000");

        Campaign campaign = new Campaign(
            address(tipToken),
            address(this),
            msg.sender,
            tier,
            allocations,
            infoDestination,
            tierTargets[tier]
        );

        campaigns.push(campaign);
        campaignCount = campaigns.length;
        isCampaign[address(campaign)] = true;

        // Seed the campaign
        require(tipToken.transferFrom(msg.sender, address(campaign), seedAmount), "Factory: seed transfer failed");
        campaign.seed(seedAmount);

        emit CampaignCreated(address(campaign), msg.sender, tier, tierTargets[tier]);
        return address(campaign);
    }

    function isStaker(address user) external view returns (bool) {
        if (stakingContract == address(0)) return false;
        (bool ok, bytes memory data) = stakingContract.staticcall(
            abi.encodeWithSignature("isStaker(address)", user)
        );
        return ok && abi.decode(data, (bool));
    }

    function _allocationsSum(uint256[5] calldata allocations) internal pure returns (uint256) {
        uint256 sum;
        for (uint256 i = 0; i < 5; i++) {
            sum += allocations[i];
        }
        return sum;
    }

    function getCampaigns() external view returns (Campaign[] memory) {
        return campaigns;
    }
}
