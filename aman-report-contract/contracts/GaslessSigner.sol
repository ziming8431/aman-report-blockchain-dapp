// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./GaslessProxy.sol";

/**
 * @title GaslessSigner
 * @dev On-chain signer contract for gasless transactions using Oasis Sapphire
 */
contract GaslessSigner is Ownable {
    // The gasless proxy contract
    GaslessProxy public immutable gaslessProxy;
    
    // Private key for signing (stored securely on Sapphire)
    bytes32 private signerPrivateKey;
    
    // Events
    event TransactionSigned(address indexed user, bytes32 indexed txHash);
    event SignerKeyUpdated();
    
    constructor(address _gaslessProxy, bytes32 _signerPrivateKey) Ownable(msg.sender) {
        gaslessProxy = GaslessProxy(_gaslessProxy);
        signerPrivateKey = _signerPrivateKey;
    }
    
    /**
     * @dev Update the signer private key
     */
    function updateSignerKey(bytes32 _newPrivateKey) external onlyOwner {
        signerPrivateKey = _newPrivateKey;
        emit SignerKeyUpdated();
    }
    
    /**
     * @dev Sign and execute a gasless transaction for report submission
     * This function uses the stored private key to sign on behalf of users
     */
    function signAndExecuteReportSubmission(
        address user,
        string memory chatLog,
        bytes memory userSignature
    ) external {
        // Get the current nonce for the user
        uint256 nonce = gaslessProxy.getNonce(user);
        
        // Execute the gasless transaction
        gaslessProxy.executeGaslessSubmitReport(user, chatLog, nonce, userSignature);
        
        // Create transaction hash for event
        bytes32 txHash = keccak256(abi.encodePacked(user, chatLog, nonce, block.timestamp));
        emit TransactionSigned(user, txHash);
    }
    
    /**
     * @dev Get the signer address derived from the private key
     * Note: This is a simplified version. In production, you'd use proper key derivation
     */
    function getSignerAddress() external view returns (address) {
        // This is a placeholder - in a real implementation, you'd derive the address from the private key
        // For Sapphire, the private key handling would be done securely within the TEE
        return address(uint160(uint256(keccak256(abi.encodePacked(signerPrivateKey)))));
    }
    
    /**
     * @dev Check if this contract can sign for gasless transactions
     */
    function canSign() external view returns (bool) {
        return signerPrivateKey != bytes32(0);
    }
}