// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title DisasterRelief
 * @dev Smart contract for blockchain-based disaster relief management
 */
contract DisasterRelief is Ownable, ReentrancyGuard {
    
    // Enums
    enum DisasterType { FLOOD, EARTHQUAKE, CYCLONE, LANDSLIDE }
    enum SeverityLevel { LOW, MEDIUM, HIGH }
    enum FundStatus { PENDING, APPROVED, DISTRIBUTED, REJECTED }
    
    // Structs
    struct DisasterEvent {
        uint256 eventId;
        DisasterType disasterType;
        string location;
        uint256 timestamp;
        string imageHash;
        uint256 severityScore;
        SeverityLevel severityLevel;
        address reportedBy;
        bool isVerified;
        uint256 estimatedAffected;
        uint256 infrastructureDamage;
        uint256 impactArea;
    }
    
    struct FundTransaction {
        uint256 transactionId;
        uint256 eventId;
        address donor;
        uint256 amount;
        uint256 timestamp;
        FundStatus status;
        string purpose;
        bool isBlockchainVerified;
    }
    
    struct DisasterFund {
        uint256 fundId;
        uint256 eventId;
        uint256 totalAmount;
        uint256 distributedAmount;
        uint256 createdAt;
        address approvedBy;
        FundStatus status;
    }
    
    // State variables
    uint256 public eventCounter = 0;
    uint256 public transactionCounter = 0;
    uint256 public fundCounter = 0;
    
    mapping(uint256 => DisasterEvent) public disasterEvents;
    mapping(uint256 => FundTransaction) public fundTransactions;
    mapping(uint256 => DisasterFund) public disasterFunds;
    mapping(string => bool) public processedImageHashes; // Prevent duplicates
    mapping(address => bool) public authorizedOfficials;
    
    uint256[] public allEventIds;
    uint256[] public allTransactionIds;
    
    // Events
    event DisasterEventCreated(
        uint256 indexed eventId,
        DisasterType disasterType,
        string location,
        uint256 severityScore,
        address reportedBy
    );
    
    event DisasterEventVerified(uint256 indexed eventId, bool isVerified);
    
    event FundDonated(
        uint256 indexed transactionId,
        uint256 indexed eventId,
        address indexed donor,
        uint256 amount
    );
    
    event FundApproved(
        uint256 indexed fundId,
        uint256 indexed eventId,
        uint256 amount,
        address approvedBy
    );
    
    event FundDistributed(
        uint256 indexed fundId,
        uint256 indexed eventId,
        uint256 amount
    );
    
    // Modifiers
    modifier onlyAuthorized() {
        require(
            msg.sender == owner() || authorizedOfficials[msg.sender],
            "Not authorized"
        );
        _;
    }
    
    modifier eventExists(uint256 _eventId) {
        require(_eventId > 0 && _eventId <= eventCounter, "Event does not exist");
        _;
    }
    
    modifier fundExists(uint256 _fundId) {
        require(_fundId > 0 && _fundId <= fundCounter, "Fund does not exist");
        _;
    }
    
    // Constructor
    constructor() {
        authorizedOfficials[msg.sender] = true;
    }
    
    // Admin Functions
    function addAuthorizedOfficial(address _official) external onlyOwner {
        authorizedOfficials[_official] = true;
    }
    
    function removeAuthorizedOfficial(address _official) external onlyOwner {
        authorizedOfficials[_official] = false;
    }
    
    // Core Functions
    /**
     * @dev Create a new disaster event with AI severity assessment
     */
    function createDisasterEvent(
        DisasterType _type,
        string memory _location,
        string memory _imageHash,
        uint256 _severityScore,
        uint256 _affectedPopulation,
        uint256 _infrastructureDamage,
        uint256 _impactArea
    ) external onlyAuthorized returns (uint256) {
        require(_severityScore >= 0 && _severityScore <= 100, "Invalid severity score");
        require(!processedImageHashes[_imageHash], "Image already processed");
        
        eventCounter++;
        uint256 eventId = eventCounter;
        
        SeverityLevel level = getSeverityLevel(_severityScore);
        
        disasterEvents[eventId] = DisasterEvent({
            eventId: eventId,
            disasterType: _type,
            location: _location,
            timestamp: block.timestamp,
            imageHash: _imageHash,
            severityScore: _severityScore,
            severityLevel: level,
            reportedBy: msg.sender,
            isVerified: false,
            estimatedAffected: _affectedPopulation,
            infrastructureDamage: _infrastructureDamage,
            impactArea: _impactArea
        });
        
        processedImageHashes[_imageHash] = true;
        allEventIds.push(eventId);
        
        emit DisasterEventCreated(eventId, _type, _location, _severityScore, msg.sender);
        
        return eventId;
    }
    
    /**
     * @dev Verify a disaster event (manual verification step)
     */
    function verifyDisasterEvent(uint256 _eventId) external onlyAuthorized eventExists(_eventId) {
        require(!disasterEvents[_eventId].isVerified, "Already verified");
        disasterEvents[_eventId].isVerified = true;
        emit DisasterEventVerified(_eventId, true);
    }
    
    /**
     * @dev Record a fund donation for a disaster event
     */
    function donateToEvent(
        uint256 _eventId,
        string memory _purpose
    ) external payable eventExists(_eventId) nonReentrant {
        require(msg.value > 0, "Donation must be greater than 0");
        require(disasterEvents[_eventId].isVerified, "Event not verified");
        
        transactionCounter++;
        uint256 transactionId = transactionCounter;
        
        fundTransactions[transactionId] = FundTransaction({
            transactionId: transactionId,
            eventId: _eventId,
            donor: msg.sender,
            amount: msg.value,
            timestamp: block.timestamp,
            status: FundStatus.PENDING,
            purpose: _purpose,
            isBlockchainVerified: true
        });
        
        allTransactionIds.push(transactionId);
        
        emit FundDonated(transactionId, _eventId, msg.sender, msg.value);
    }
    
    /**
     * @dev Create and approve a fund pool for disaster relief
     */
    function createAndApproveFund(
        uint256 _eventId,
        uint256 _amount
    ) external onlyAuthorized eventExists(_eventId) {
        require(_amount > 0, "Amount must be greater than 0");
        require(disasterEvents[_eventId].isVerified, "Event not verified");
        
        fundCounter++;
        uint256 fundId = fundCounter;
        
        disasterFunds[fundId] = DisasterFund({
            fundId: fundId,
            eventId: _eventId,
            totalAmount: _amount,
            distributedAmount: 0,
            createdAt: block.timestamp,
            approvedBy: msg.sender,
            status: FundStatus.APPROVED
        });
        
        emit FundApproved(fundId, _eventId, _amount, msg.sender);
    }
    
    /**
     * @dev Distribute approved funds for disaster relief
     */
    function distributeFund(
        uint256 _fundId,
        address payable _recipient,
        uint256 _amount
    ) external onlyAuthorized fundExists(_fundId) nonReentrant {
        DisasterFund storage fund = disasterFunds[_fundId];
        
        require(fund.status == FundStatus.APPROVED, "Fund not approved");
        require(
            fund.distributedAmount + _amount <= fund.totalAmount,
            "Insufficient fund balance"
        );
        require(_amount <= address(this).balance, "Insufficient contract balance");
        
        fund.distributedAmount += _amount;
        
        if (fund.distributedAmount >= fund.totalAmount) {
            fund.status = FundStatus.DISTRIBUTED;
        }
        
        _recipient.transfer(_amount);
        
        emit FundDistributed(_fundId, fund.eventId, _amount);
    }
    
    // View Functions
    function getSeverityLevel(uint256 _score) public pure returns (SeverityLevel) {
        if (_score <= 40) return SeverityLevel.LOW;
        if (_score <= 70) return SeverityLevel.MEDIUM;
        return SeverityLevel.HIGH;
    }
    
    function getDisasterEvent(uint256 _eventId)
        external
        view
        eventExists(_eventId)
        returns (DisasterEvent memory)
    {
        return disasterEvents[_eventId];
    }
    
    function getFundTransaction(uint256 _transactionId)
        external
        view
        returns (FundTransaction memory)
    {
        require(_transactionId > 0 && _transactionId <= transactionCounter, "Invalid transaction");
        return fundTransactions[_transactionId];
    }
    
    function getDisasterFund(uint256 _fundId)
        external
        view
        fundExists(_fundId)
        returns (DisasterFund memory)
    {
        return disasterFunds[_fundId];
    }
    
    function getAllEventIds() external view returns (uint256[] memory) {
        return allEventIds;
    }
    
    function getAllTransactionIds() external view returns (uint256[] memory) {
        return allTransactionIds;
    }
    
    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    // Fallback
    receive() external payable {}
}
