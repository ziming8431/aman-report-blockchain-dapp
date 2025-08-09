// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./ConfidentialReporter.sol";

/**
 * @title GaslessProxy
 * @dev Proxy contract for gasless transactions using Oasis Sapphire's on-chain signer
 */
contract GaslessProxy is Ownable {
    using ECDSA for bytes32;

    // The target contract we're proxying to
    ConfidentialReporter public immutable targetContract;
    
    // On-chain signer for gasless transactions
    address public gaslessSignerAddress;
    
    // Nonce tracking for replay protection
    mapping(address => uint256) public nonces;
    
    // Events
    event GaslessTransactionExecuted(address indexed user, uint256 nonce, bytes32 txHash);
    event GaslessSignerUpdated(address indexed oldSigner, address indexed newSigner);
    
    constructor(address _targetContract, address _gaslessSignerAddress) Ownable(msg.sender) {
        targetContract = ConfidentialReporter(_targetContract);
        gaslessSignerAddress = _gaslessSignerAddress;
    }
    
    /**
     * @dev Update the gasless signer address
     */
    function updateGaslessSigner(address _newSigner) external onlyOwner {
        address oldSigner = gaslessSignerAddress;
        gaslessSignerAddress = _newSigner;
        emit GaslessSignerUpdated(oldSigner, _newSigner);
    }
    
    /**
     * @dev Execute a gasless transaction for submitting a report
     * @param user The user address on whose behalf the transaction is executed
     * @param chatLog The chat log to submit
     * @param nonce The nonce for replay protection
     * @param signature The signature from the user
     */
    function executeGaslessSubmitReport(
        address user,
        string memory chatLog,
        uint256 nonce,
        bytes memory signature
    ) external {
        // Verify the caller is the gasless signer
        require(msg.sender == gaslessSignerAddress, "Only gasless signer can execute");
        
        // Verify nonce
        require(nonce == nonces[user], "Invalid nonce");
        
        // Create the message hash
        bytes32 messageHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(user, chatLog, nonce, address(this)))
            )
        );
        
        // Verify signature
        address recoveredSigner = messageHash.recover(signature);
        require(recoveredSigner == user, "Invalid signature");
        
        // Increment nonce
        nonces[user]++;
        
        // Execute the transaction on behalf of the user
        // We need to modify the target contract to accept gasless calls
        targetContract.submitReportGasless(user, chatLog);
        
        emit GaslessTransactionExecuted(user, nonce, messageHash);
    }
    
    /**
     * @dev Get the current nonce for a user
     */
    function getNonce(address user) external view returns (uint256) {
        return nonces[user];
    }
    
    /**
     * @dev Create a message hash for signing
     */
    function getMessageHash(
        address user,
        string memory chatLog,
        uint256 nonce
    ) external view returns (bytes32) {
        return keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                keccak256(abi.encodePacked(user, chatLog, nonce, address(this)))
            )
        );
    }
}