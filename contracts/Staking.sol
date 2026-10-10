// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Staking is Ownable, ReentrancyGuard {
    IERC20 public immutable tipToken;
    uint256 public constant MIN_STAKE = 1 * 10**18; // 1 TIP
    uint256 public constant REWARD_RATE = 100; // 1% of raises distributed

    struct Stake {
        uint256 amount;
        uint256 stakedAt;
        uint256 rewardDebt;
    }

    mapping(address => Stake) public stakes;
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event RewardsClaimed(address indexed user, uint256 amount);

    constructor(address _tipToken) Ownable(msg.sender) {
        tipToken = IERC20(_tipToken);
    }

    function stake(uint256 amount) external nonReentrant {
        require(amount >= MIN_STAKE, "Staking: below minimum");
        require(tipToken.transferFrom(msg.sender, address(this), amount), "Staking: transfer failed");

        Stake storage s = stakes[msg.sender];
        if (s.amount > 0) {
            _claimRewards(msg.sender);
        }

        s.amount += amount;
        s.stakedAt = block.timestamp;
        totalStaked += amount;

        emit Staked(msg.sender, amount);
    }

    function unstake(uint256 amount) external nonReentrant {
        Stake storage s = stakes[msg.sender];
        require(s.amount >= amount, "Staking: insufficient stake");
        require(amount > 0, "Staking: amount is zero");

        _claimRewards(msg.sender);

        s.amount -= amount;
        totalStaked -= amount;

        require(tipToken.transfer(msg.sender, amount), "Staking: transfer failed");
        emit Unstaked(msg.sender, amount);
    }

    function claimRewards() external nonReentrant {
        _claimRewards(msg.sender);
    }

    function _claimRewards(address user) internal {
        Stake storage s = stakes[user];
        if (s.amount == 0) return;

        uint256 pending = _calculateRewards(user);
        if (pending > 0) {
            s.rewardDebt += pending;
            totalRewardsDistributed += pending;
            require(tipToken.transfer(user, pending), "Staking: reward transfer failed");
            emit RewardsClaimed(user, pending);
        }
    }

    function _calculateRewards(address user) internal view returns (uint256) {
        Stake storage s = stakes[user];
        if (s.amount == 0) return 0;

        // Simple time-based rewards: 0.01% per day
        uint256 timeStaked = block.timestamp - s.stakedAt;
        return (s.amount * timeStaked * REWARD_RATE) / (365 days * 10000);
    }

    function pendingRewards(address user) external view returns (uint256) {
        Stake storage s = stakes[user];
        if (s.amount == 0) return 0;
        uint256 timeStaked = block.timestamp - s.stakedAt;
        return (s.amount * timeStaked * REWARD_RATE) / (365 days * 10000);
    }

    function isStaker(address user) external view returns (bool) {
        return stakes[user].amount >= MIN_STAKE;
    }
}
