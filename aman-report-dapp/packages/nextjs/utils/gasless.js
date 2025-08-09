// Gasless transaction utilities for Oasis Sapphire
import { ethers } from 'ethers';
import { getWrappedEthersSigner } from './web3.js';

// Gasless contract addresses (will be updated after deployment)
const GASLESS_CONTRACTS = {
  // These will be updated after deployment
  GASLESS_PROXY: "0x0bBa66EFa3d324BED93599A8F003CCb94Ea6c9e2",
  GASLESS_SIGNER: "0x36Af6676DC6Cd0F39CE19C8c487BdA2d964affa9",
  CONFIDENTIAL_REPORTER: "0xF43BF201efEF0715EF322520299e0EE8b07DB959"
};

// Contract addresses (update these after deployment)
let CONFIDENTIAL_REPORTER_ADDRESS = "0xF43BF201efEF0715EF322520299e0EE8b07DB959"; // ConfidentialReporter
let GASLESS_PROXY_ADDRESS = "0x0bBa66EFa3d324BED93599A8F003CCb94Ea6c9e2"; // GaslessProxy
let GASLESS_SIGNER_ADDRESS = "0x36Af6676DC6Cd0F39CE19C8c487BdA2d964affa9"; // GaslessSigner

// ABI for gasless proxy contract
const GASLESS_PROXY_ABI = [
  "function executeGaslessSubmitReport(address user, string memory chatLog, uint256 nonce, bytes memory signature) external",
  "function getNonce(address user) external view returns (uint256)",
  "function getMessageHash(address user, string memory chatLog, uint256 nonce) external view returns (bytes32)",
  "event GaslessTransactionExecuted(address indexed user, uint256 nonce, bytes32 txHash)"
];

// ABI for gasless signer contract
const GASLESS_SIGNER_ABI = [
  "function signAndExecuteReportSubmission(address user, string memory chatLog, bytes memory userSignature) external",
  "function getSignerAddress() external view returns (address)",
  "function canSign() external view returns (bool)"
];

/**
 * Update gasless contract addresses after deployment
 */
export function updateGaslessContracts(contracts) {
  GASLESS_CONTRACTS.GASLESS_PROXY = contracts.gaslessProxy;
  GASLESS_CONTRACTS.GASLESS_SIGNER = contracts.gaslessSigner;
  GASLESS_CONTRACTS.CONFIDENTIAL_REPORTER = contracts.confidentialReporter;
}

/**
 * Check if gasless transactions are available
 */
export function isGaslessAvailable() {
  return GASLESS_CONTRACTS.GASLESS_PROXY && 
         GASLESS_CONTRACTS.GASLESS_SIGNER && 
         GASLESS_CONTRACTS.CONFIDENTIAL_REPORTER;
}

/**
 * Get the current nonce for a user
 */
export async function getUserNonce(userAddress) {
  if (!isGaslessAvailable()) {
    throw new Error('Gasless contracts not available');
  }
  
  try {
    const signer = await getWrappedEthersSigner();
    const gaslessProxy = new ethers.Contract(
      GASLESS_CONTRACTS.GASLESS_PROXY,
      GASLESS_PROXY_ABI,
      signer
    );
    
    return await gaslessProxy.getNonce(userAddress);
  } catch (error) {
    console.error('Error getting user nonce:', error);
    throw error;
  }
}

/**
 * Create a signature for gasless transaction
 */
export async function createGaslessSignature(userAddress, chatLog, nonce) {
  if (!isGaslessAvailable()) {
    throw new Error('Gasless contracts not available');
  }
  
  try {
    const signer = await getWrappedEthersSigner();
    const gaslessProxy = new ethers.Contract(
      GASLESS_CONTRACTS.GASLESS_PROXY,
      GASLESS_PROXY_ABI,
      signer
    );
    
    // Get the message hash
    const messageHash = await gaslessProxy.getMessageHash(userAddress, chatLog, nonce);
    
    // Sign the message hash
    const signature = await signer.signMessage(ethers.getBytes(messageHash));
    
    return signature;
  } catch (error) {
    console.error('Error creating gasless signature:', error);
    throw error;
  }
}

/**
 * Submit a gasless transaction
 */
export async function submitGaslessReport(chatLog) {
  if (!isGaslessAvailable()) {
    throw new Error('Gasless contracts not available');
  }
  
  try {
    const signer = await getWrappedEthersSigner();
    const userAddress = await signer.getAddress();
    
    // Get current nonce
    const nonce = await getUserNonce(userAddress);
    
    // Create signature
    const signature = await createGaslessSignature(userAddress, chatLog, nonce);
    
    // Execute gasless transaction through the signer contract
    const gaslessSigner = new ethers.Contract(
      GASLESS_CONTRACTS.GASLESS_SIGNER,
      GASLESS_SIGNER_ABI,
      signer
    );
    
    const txResponse = await gaslessSigner.signAndExecuteReportSubmission(
      userAddress,
      chatLog,
      signature
    );
    
    return {
      hash: txResponse.hash,
      wait: () => txResponse.wait(),
      gasless: true
    };
  } catch (error) {
    console.error('Error submitting gasless report:', error);
    throw error;
  }
}

/**
 * Check if gasless signer is ready
 */
export async function isGaslessSignerReady() {
  if (!isGaslessAvailable()) {
    return false;
  }
  
  try {
    const signer = await getWrappedEthersSigner();
    const gaslessSigner = new ethers.Contract(
      GASLESS_CONTRACTS.GASLESS_SIGNER,
      GASLESS_SIGNER_ABI,
      signer
    );
    
    return await gaslessSigner.canSign();
  } catch (error) {
    console.error('Error checking gasless signer status:', error);
    return false;
  }
}

/**
 * Get gasless transaction fee estimate (should be 0 for users)
 */
export async function getGaslessTransactionFee() {
  // Gasless transactions have no fee for users
  return {
    gasPrice: '0',
    gasLimit: '0',
    totalFee: '0 TEST',
    gasless: true
  };
}

/**
 * Utility to format gasless transaction for display
 */
export function formatGaslessTransaction(txHash, userAddress, chatLog) {
  return {
    hash: txHash,
    from: userAddress,
    to: GASLESS_CONTRACTS.CONFIDENTIAL_REPORTER,
    gasPrice: '0',
    gasUsed: '0',
    fee: '0 TEST',
    type: 'Gasless Report Submission',
    data: {
      chatLog: chatLog.substring(0, 100) + (chatLog.length > 100 ? '...' : ''),
      gasless: true
    }
  };
}