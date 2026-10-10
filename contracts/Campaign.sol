// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract Campaign is ReentrancyGuard {
    enum State {
        Pending,      // 0 — created, awaiting seed
        Voting,       // 1 — 24h DAO approval window
        Active,       // 2 — fundraising live
        Funded,       // 3 — goal reached, escrow held
        Tipster,      // 4 — tipster proposal submitted
        ProposalVoting, // 5 — 24h vote on tipster proposal
        Submission,   // 6 — tipster fulfills, proof submitted
        Disbursement  // 7 — 36h vote on fund distribution
    }

    struct BountySubmission {
        string proofHash;
        address submitter;
        uint256 timestamp;
        uint256 votesFor;
        uint256 votesAgainst;
        bool finalized;
    }

    struct Vote {
        bool voted;
        bool support;
    }

    IERC20 public immutable tipToken;
    address public immutable factory;
    address public immutable creator;

    uint8 public tier;
    uint256[5] public allocations; // basis points
    string public infoDestination;

    uint256 public targetAmount;
    uint256 public raisedAmount;
    State public state;

    uint256 public votingDeadline;
    uint256 public disbursementDeadline;

    string public tipsterProposal;
    address public tipster;

    BountySubmission[] public submissions;
    uint256 public winningSubmissionId;

    mapping(address => Vote) public campaignVotes;
    mapping(address => Vote) public proposalVotes;
    mapping(address => Vote) public disbursementVotes;
    mapping(address => uint256) public contributions;

    uint256 public campaignVotesFor;
    uint256 public campaignVotesAgainst;
    uint256 public proposalVotesFor;
    uint256 public proposalVotesAgainst;
    uint256 public disbursementVotesFor;
    uint256 public disbursementVotesAgainst;

    bool public fundsWithdrawn;
    bool public cancelled;

    event Seeded(address indexed contributor, uint256 amount);
    event StateChanged(State newState);
    event CampaignVote(address indexed voter, bool support);
    event ProposalSubmitted(address indexed tipster, string proposal);
    event ProposalVote(address indexed voter, bool support);
    event BountySubmitted(uint256 indexed submissionId, address submitter, string proofHash);
    event BountyVote(uint256 indexed submissionId, address voter, bool support);
    event DisbursementVote(address indexed voter, bool support);
    event FundsWithdrawn(address indexed recipient, uint256 amount);
    event Cancelled();

    modifier onlyStaker() {
        require(factory != address(0), "Campaign: no factory");
        (bool ok, bytes memory data) = factory.staticcall(
            abi.encodeWithSignature("isStaker(address)", msg.sender)
        );
        require(ok && abi.decode(data, (bool)), "Campaign: not a staker");
        _;
    }

    constructor(
        address _tipToken,
        address _factory,
        address _creator,
        uint8 _tier,
        uint256[5] memory _allocations,
        string memory _infoDestination,
        uint256 _targetAmount
    ) {
        tipToken = IERC20(_tipToken);
        factory = _factory;
        creator = _creator;
        tier = _tier;
        allocations = _allocations;
        infoDestination = _infoDestination;
        targetAmount = _targetAmount;
        state = State.Pending;
    }

    // ---- Stage 1: Seed ----
    function seed(uint256 amount) external nonReentrant {
        require(state == State.Pending, "Campaign: not pending");
        require(amount > 0, "Campaign: zero amount");
        require(tipToken.transferFrom(msg.sender, address(this), amount), "Campaign: transfer failed");

        raisedAmount += amount;
        contributions[msg.sender] += amount;
        emit Seeded(msg.sender, amount);

        if (raisedAmount >= targetAmount) {
            _transitionTo(State.Funded);
        }
    }

    // ---- Stage 1→2: Creator initiates voting ----
    function startVoting() external {
        require(msg.sender == creator || msg.sender == factory, "Campaign: not authorized");
        require(state == State.Pending, "Campaign: not pending");
        require(raisedAmount > 0, "Campaign: no seed funds");
        _transitionTo(State.Voting);
        votingDeadline = block.timestamp + 24 hours;
    }

    // ---- Stage 2: DAO approval vote ----
    function voteOnCampaign(bool support) external onlyStaker {
        require(state == State.Voting, "Campaign: not in voting");
        require(block.timestamp < votingDeadline, "Campaign: voting ended");
        require(!campaignVotes[msg.sender].voted, "Campaign: already voted");

        campaignVotes[msg.sender] = Vote(true, support);
        if (support) campaignVotesFor++;
        else campaignVotesAgainst++;

        emit CampaignVote(msg.sender, support);
    }

    function finalizeVoting() external {
        require(state == State.Voting, "Campaign: not in voting");
        require(block.timestamp >= votingDeadline, "Campaign: voting not ended");

        if (campaignVotesFor > campaignVotesAgainst) {
            _transitionTo(State.Active);
        } else {
            _cancel();
        }
    }

    // ---- Stage 3: Fundraising ----
    function contribute(uint256 amount) external nonReentrant {
        require(state == State.Active, "Campaign: not active");
        require(amount > 0, "Campaign: zero amount");
        require(tipToken.transferFrom(msg.sender, address(this), amount), "Campaign: transfer failed");

        raisedAmount += amount;
        contributions[msg.sender] += amount;
        emit Seeded(msg.sender, amount);

        if (raisedAmount >= targetAmount) {
            _transitionTo(State.Funded);
        }
    }

    // ---- Stage 4→5: Tipster submits proposal ----
    function submitProposal(string calldata proposal) external {
        require(state == State.Funded, "Campaign: not funded");
        require(bytes(proposal).length > 0, "Campaign: empty proposal");

        tipster = msg.sender;
        tipsterProposal = proposal;
        _transitionTo(State.Tipster);
    }

    function startProposalVoting() external {
        require(state == State.Tipster, "Campaign: no proposal");
        require(msg.sender == tipster || msg.sender == factory, "Campaign: not authorized");
        _transitionTo(State.ProposalVoting);
        votingDeadline = block.timestamp + 24 hours;
    }

    // ---- Stage 5: Proposal vote ----
    function voteOnProposal(bool support) external onlyStaker {
        require(state == State.ProposalVoting, "Campaign: not in proposal voting");
        require(block.timestamp < votingDeadline, "Campaign: voting ended");
        require(!proposalVotes[msg.sender].voted, "Campaign: already voted");

        proposalVotes[msg.sender] = Vote(true, support);
        if (support) proposalVotesFor++;
        else proposalVotesAgainst++;

        emit ProposalVote(msg.sender, support);
    }

    function finalizeProposalVoting() external {
        require(state == State.ProposalVoting, "Campaign: not in proposal voting");
        require(block.timestamp >= votingDeadline, "Campaign: voting not ended");

        if (proposalVotesFor > proposalVotesAgainst) {
            _transitionTo(State.Submission);
        } else {
            // Proposal rejected — back to Funded, tipster can be replaced
            tipster = address(0);
            tipsterProposal = "";
            _transitionTo(State.Funded);
        }
    }

    // ---- Stage 6: Bounty submission ----
    function submitBounty(string calldata proofHash) external returns (uint256) {
        require(state == State.Submission, "Campaign: not in submission");
        require(msg.sender == tipster, "Campaign: not the tipster");
        require(bytes(proofHash).length > 0, "Campaign: empty proof");

        submissions.push(BountySubmission({
            proofHash: proofHash,
            submitter: msg.sender,
            timestamp: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            finalized: false
        }));

        emit BountySubmitted(submissions.length - 1, msg.sender, proofHash);
        return submissions.length - 1;
    }

    // ---- Stage 6→7: Start disbursement vote ----
    function startDisbursementVoting() external {
        require(state == State.Submission, "Campaign: not in submission");
        require(submissions.length > 0, "Campaign: no submissions");
        require(msg.sender == tipster || msg.sender == factory, "Campaign: not authorized");
        _transitionTo(State.Disbursement);
        disbursementDeadline = block.timestamp + 36 hours;
    }

    // ---- Stage 7: Disbursement vote ----
    function voteOnDisbursement(bool support) external onlyStaker {
        require(state == State.Disbursement, "Campaign: not in disbursement");
        require(block.timestamp < disbursementDeadline, "Campaign: voting ended");
        require(!disbursementVotes[msg.sender].voted, "Campaign: already voted");

        disbursementVotes[msg.sender] = Vote(true, support);
        if (support) disbursementVotesFor++;
        else disbursementVotesAgainst++;

        emit DisbursementVote(msg.sender, support);
    }

    function finalizeDisbursement() external nonReentrant {
        require(state == State.Disbursement, "Campaign: not in disbursement");
        require(block.timestamp >= disbursementDeadline, "Campaign: voting not ended");
        require(!fundsWithdrawn, "Campaign: already withdrawn");

        if (disbursementVotesFor > disbursementVotesAgainst) {
            fundsWithdrawn = true;
            _distributeFunds();
        } else {
            _cancel();
        }
    }

    function _distributeFunds() internal {
        // 3.33% fee to DAO (factory), 1% to stakers via factory, rest to tipster
        uint256 daoFee = (raisedAmount * 333) / 10000;
        uint256 stakerFee = (raisedAmount * 100) / 10000;
        uint256 tipsterAmount = raisedAmount - daoFee - stakerFee;

        if (daoFee > 0) {
            require(tipToken.transfer(factory, daoFee), "Campaign: DAO fee failed");
        }
        if (stakerFee > 0) {
            require(tipToken.transfer(factory, stakerFee), "Campaign: staker fee failed");
        }
        if (tipsterAmount > 0) {
            require(tipToken.transfer(tipster, tipsterAmount), "Campaign: tipster transfer failed");
        }

        emit FundsWithdrawn(tipster, tipsterAmount);
    }

    // ---- Refund ----
    function refund() external nonReentrant {
        require(cancelled || state == State.Pending, "Campaign: not refundable");
        uint256 amount = contributions[msg.sender];
        require(amount > 0, "Campaign: no contributions");

        contributions[msg.sender] = 0;
        raisedAmount -= amount;
        require(tipToken.transfer(msg.sender, amount), "Campaign: refund failed");
    }

    function _transitionTo(State newState) internal {
        state = newState;
        emit StateChanged(newState);
    }

    function _cancel() internal {
        cancelled = true;
        _transitionTo(State.Pending);
        emit Cancelled();
    }

    // ---- Getters ----
    function getSubmissions() external view returns (BountySubmission[] memory) {
        return submissions;
    }

    function submissionCount() external view returns (uint256) {
        return submissions.length;
    }

    function getState() external view returns (State) {
        return state;
    }
}
