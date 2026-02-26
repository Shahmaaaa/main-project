// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlockAid {
    struct DisasterReport {
        string id;
        string dataHash;
        string severity;
        address payable recipient; // Victim's wallet
        bool isApproved;
        uint256 approvedAmount;
        address approvedBy;
        uint256 timestamp;
    }

    mapping(string => DisasterReport) public reports;
    address public admin;

    event ReportCreated(string id, string dataHash, uint256 timestamp);
    event ReportApproved(string id, string severity, uint256 amount, address approver);
    event FundsReceived(address from, uint256 amount);

    constructor() {
        admin = msg.sender;
    }

    // Allow the contract to receive ETH from donors
    receive() external payable {
        emit FundsReceived(msg.sender, msg.value);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    function createReport(string memory _id, string memory _dataHash, address payable _recipient) public {
        reports[_id] = DisasterReport({
            id: _id,
            dataHash: _dataHash,
            severity: "Pending",
            recipient: _recipient,
            isApproved: false,
            approvedAmount: 0,
            approvedBy: address(0),
            timestamp: block.timestamp
        });

        emit ReportCreated(_id, _dataHash, block.timestamp);
    }

    function approveReport(string memory _id, string memory _severity, uint256 _amount) public onlyAdmin {
        DisasterReport storage report = reports[_id];
        require(bytes(report.id).length != 0, "Report does not exist");
        require(!report.isApproved, "Report already approved");
        require(address(this).balance >= _amount, "Insufficient contract balance");

        report.severity = _severity;
        report.isApproved = true;
        report.approvedAmount = _amount;
        report.approvedBy = msg.sender;

        // ACTUAL FUND TRANSFER: Happens only now, after Admin signs the transaction
        report.recipient.transfer(_amount);

        emit ReportApproved(_id, _severity, _amount, msg.sender);
    }

    function getReport(string memory _id) public view returns (
        string memory, string memory, string memory, bool, uint256, address
    ) {
        DisasterReport memory r = reports[_id];
        return (r.id, r.dataHash, r.severity, r.isApproved, r.approvedAmount, r.approvedBy);
    }
}
