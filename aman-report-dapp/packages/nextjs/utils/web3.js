// ---- Ethers path for guaranteed Sapphire-encrypted writes ----
import { BrowserProvider } from 'ethers'
import { wrapEthersSigner } from '@oasisprotocol/sapphire-ethers-v6'

// Ensure we're connected to Sapphire chain
export async function ensureSapphireChain() {
  if (!window.ethereum) throw new Error('No wallet. Install MetaMask or compatible.')
  
  const sapphireChainId = '0x5aff' // Sapphire Testnet chain ID (23295 in decimal)
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: sapphireChainId }],
    })
  } catch (switchError) {
    // This error code indicates that the chain has not been added to MetaMask
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: sapphireChainId,
              chainName: 'Sapphire Testnet',
              nativeCurrency: {
                name: 'TEST',
                symbol: 'TEST',
                decimals: 18,
              },
              rpcUrls: ['https://testnet.sapphire.oasis.io'],
              blockExplorerUrls: ['https://explorer.oasis.io/testnet/sapphire'],
            },
          ],
        })
      } catch (addError) {
        throw new Error('Failed to add Sapphire network to wallet')
      }
    } else {
      throw switchError
    }
  }
}

export async function getWrappedEthersSigner() {
  if (!window.ethereum) throw new Error('No wallet. Install MetaMask or compatible.')
  await ensureSapphireChain()
  const provider = new BrowserProvider(window.ethereum)
  await provider.send('eth_requestAccounts', [])
  const signer = await provider.getSigner()
  // This wrap ensures x25519-deoxysII encryption of tx calldata on Sapphire
  return wrapEthersSigner(signer)
}