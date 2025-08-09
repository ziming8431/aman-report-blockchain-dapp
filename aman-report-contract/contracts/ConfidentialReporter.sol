// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ConfidentialReporter is Ownable {
    using ECDSA for bytes32;

    // --- State Variables ---
    struct Report {
        address owner;
        string chatLog;
        uint256 timestamp;
    }
    Report[] private reports;
    uint256 public totalReportCount;
    mapping(uint256 => mapping(address => bool)) public accessControl;
    mapping(address => bool) public trustedRelayers;
    
    // Gasless proxy contract address
    address public gaslessProxy;

    // --- Events ---
    event ReportSubmitted(uint256 indexed reportId, address indexed owner);
    event AccessGranted(uint256 indexed reportId, address indexed owner, address indexed delegate);
    event RelayerStatusChanged(address indexed relayer, bool isTrusted);
    event GaslessProxyUpdated(address indexed oldProxy, address indexed newProxy);

    // --- Modifiers ---
    modifier onlyAuthorized(uint256 _reportId) {
        require(_reportId < reports.length, "Report does not exist.");
        require(accessControl[_reportId][msg.sender], "Not authorized for this report.");
        _;
    }

    constructor() Ownable(msg.sender) {}
    
    /**
     * @dev Set the gasless proxy contract address
     */
    function setGaslessProxy(address _gaslessProxy) external onlyOwner {
        address oldProxy = gaslessProxy;
        gaslessProxy = _gaslessProxy;
        emit GaslessProxyUpdated(oldProxy, _gaslessProxy);
    }

    // --- Core Functions ---
    function submitReport(string memory _chatLog) public {
        uint256 reportId = reports.length;
        reports.push(Report({
            owner: msg.sender,
            chatLog: _chatLog,
            timestamp: block.timestamp
        }));
        accessControl[reportId][msg.sender] = true;
        totalReportCount++;
        emit ReportSubmitted(reportId, msg.sender);
    }

    function grantAccess(uint256 _reportId, address _delegate) public {
        require(_reportId < reports.length, "Report does not exist.");
        require(msg.sender == reports[_reportId].owner, "Only owner can grant access.");
        require(_delegate != address(0), "Cannot delegate to zero address.");
        accessControl[_reportId][_delegate] = true;
        emit AccessGranted(_reportId, msg.sender, _delegate);
    }

    function getReportChatLog(uint256 _reportId) public view onlyAuthorized(_reportId) returns (string memory) {
        return reports[_reportId].chatLog;
    }

    function setRelayer(address _relayer, bool _isTrusted) public onlyOwner {
        trustedRelayers[_relayer] = _isTrusted;
        emit RelayerStatusChanged(_relayer, _isTrusted);
    }
    
    /**
     * @dev Submit a report on behalf of a user (gasless transaction)
     * Can only be called by the gasless proxy contract
     */
    function submitReportGasless(address _user, string memory _chatLog) external {
        require(msg.sender == gaslessProxy, "Only gasless proxy can call this function");
        require(_user != address(0), "Invalid user address");
        
        uint256 reportId = reports.length;
        reports.push(Report({
            owner: _user,
            chatLog: _chatLog,
            timestamp: block.timestamp
        }));
        accessControl[reportId][_user] = true;
        totalReportCount++;
        emit ReportSubmitted(reportId, _user);
    }
}
