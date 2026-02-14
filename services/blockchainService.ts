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

// Address will be updated dynamically from the backend or env
let contractAddress = "";

export const blockchainService = {
    async connectWallet() {
        if (!window.ethereum) {
            throw new Error("MetaMask is not installed");
        }
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        return { provider, signer: await provider.getSigner(), account: accounts[0] };
    },

    async getContract(signer?: ethers.Signer) {
        if (!contractAddress) {
            // Fetch address from backend if not set
            try {
                const res = await fetch("http://localhost:5000/api/reports");
                const reports = await res.json();
                // Find a report with a blockchainHash or fetch specialized config endpoint
                // For now, we'll assume the user might need to set it or we fetch it from a new endpoint
                const configRes = await fetch("http://localhost:5000/api/blockchain/config");
                if (configRes.ok) {
                    const config = await configRes.json();
                    contractAddress = config.address;
                }
            } catch (e) {
                console.warn("Could not fetch contract address from backend");
            }
        }

        if (!contractAddress) throw new Error("Contract address not found. Deploy first.");

        const provider = new ethers.BrowserProvider(window.ethereum!);
        return new ethers.Contract(contractAddress, CONTRACT_ABI, signer || provider);
    },

    async donate(amountEth: string) {
        const { signer } = await this.connectWallet();
        // In a real app, you'd send this to the contract or a specific pool
        // For this project, we can send to the contract address
        const tx = await signer.sendTransaction({
            to: contractAddress,
            value: ethers.parseEther(amountEth)
        });
        return tx.hash;
    }
};
