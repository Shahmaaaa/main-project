import { ethers } from 'ethers';

// ABI from Truffle build
const CONTRACT_ABI = [
    "function createReport(string _id, string _dataHash) public",
    "function approveReport(string _id, string _severity, uint256 _amount) public",
    "function getReport(string _id) public view returns (string, string, string, bool, uint256, address)",
    "function admin() public view returns (address)",
    "event ReportCreated(string id, string dataHash, uint256 timestamp)",
    "event ReportApproved(string id, string severity, uint256 amount, address approver)"
];

let contractAddress = "";

async function ensureContractAddress() {
    if (contractAddress) return contractAddress;
    try {
        const configRes = await fetch("http://localhost:5000/api/blockchain/config");
        if (configRes.ok) {
            const config = await configRes.json();
            contractAddress = config.address;
            console.log("[Blockchain] Contract address loaded:", contractAddress);
        } else {
            console.error("[Blockchain] Config request failed with status:", configRes.status);
        }
    } catch (e) {
        console.warn("[Blockchain] Could not fetch contract address from backend. Ensure backend is running.");
    }
    return contractAddress;
}

export const blockchainService = {
    async connectWallet() {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed. Please install it to continue.");
        }
        // In ethers v6, we can pass "any" to allow any network or let it auto-detect.
        // For local dev (Ganache), auto-detect is usually fine.
        const provider = new ethers.BrowserProvider(window.ethereum, "any");
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        return { provider, signer, account: accounts[0] };
    },

    async getContract(signer?: ethers.Signer) {
        const addr = await ensureContractAddress();
        if (!addr) {
            throw new Error("Blockchain contract address not found. Please ensure the contract is deployed and the backend is running.");
        }

        const provider = new ethers.BrowserProvider(window.ethereum!, "any");
        return new ethers.Contract(addr, CONTRACT_ABI, signer || provider);
    },

    async donate(amountEth: string) {
        const addr = await ensureContractAddress();
        if (!addr) {
            throw new Error("Cannot donate: Disaster Relief Contract address is missing. Please ensure the backend is running and the contract is deployed.");
        }

        const { signer } = await this.connectWallet();

        console.log(`[Blockchain] Sending ${amountEth} ETH to ${addr}`);
        const tx = await signer.sendTransaction({
            to: addr,
            value: ethers.parseEther(amountEth)
        });

        return tx.hash;
    }
};
